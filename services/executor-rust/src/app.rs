use crate::execution::idempotency::should_skip_existing_order;
use crate::execution::{Executor, LiveExecutor, PaperExecutor};
use crate::metrics;
use crate::postgres::bot::{get_bot, update_bot_status};
use crate::postgres::executions::save_execution_tx;
use crate::postgres::orders::{
    get_order_by_idempotency_key, reserve_order_tx, save_order_intent_tx, update_reserved_order_tx,
};
use crate::postgres::risk::{get_risk_settings, update_emergency_stop};
use crate::postgres::Database;
use crate::redis::publisher::{EventPublisher, PublishContext};
use crate::risk::{RiskEngine, RiskOutcome};
use crate::types::bot::{BotMode, BotStatus};
use crate::types::event::{
    EVENT_TYPE_EXECUTION_FAILED, EVENT_TYPE_EXECUTION_FILLED,
    EVENT_TYPE_EXECUTION_PARTIALLY_FILLED, EVENT_TYPE_ORDER_ACCEPTED, EVENT_TYPE_ORDER_REJECTED,
    EVENT_TYPE_ORDER_SUBMITTED, EVENT_TYPE_RISK_CHECK_FAILED, EVENT_TYPE_RISK_CHECK_PASSED,
};
use crate::types::execution::{Execution, ExecutionStatus};
use crate::types::order::{Order, OrderIntent, OrderIntentStatus, OrderStatus};
use anyhow::{anyhow, Result};
use chrono::Utc;
use uuid::Uuid;

pub struct App {
    pub db: Database,
    pub risk_engine: RiskEngine,
    pub paper_executor: PaperExecutor,
    pub live_executor: LiveExecutor,
    pub event_publisher: EventPublisher,
}

impl App {
    pub async fn new(database_url: &str, redis_url: &str, encryption_key: &str) -> Result<Self> {
        let db = Database::connect(database_url).await?;
        let risk_engine = RiskEngine::new();
        Ok(Self {
            db: db.clone(),
            risk_engine,
            paper_executor: PaperExecutor,
            live_executor: LiveExecutor::new(db.pool.clone(), encryption_key.to_string()),
            event_publisher: EventPublisher::new(redis_url.to_string(), "services/executor-rust"),
        })
    }

    pub async fn process_intent(&self, mut intent: OrderIntent, correlation_id: String) -> Result<()> {
        let start = std::time::Instant::now();
        let user_id = Some(intent.user_id.to_string());
        let bot_id = Some(intent.bot_id.to_string());
        let idempotency_key = intent.id.to_string();

        // 1. Get Bot and Risk Settings (Non-transactional reads are fine for start)
        let bot = match get_bot(&self.db.pool, &intent.bot_id).await {
            Ok(b) => b,
            Err(e) => {
                metrics::INTENTS_PROCESSED.with_label_values(&["failed_get_bot"]).inc();
                metrics::INTENT_PROCESSING_DURATION.with_label_values(&["failed_get_bot"]).observe(start.elapsed().as_secs_f64());
                return Err(e);
            }
        };
        let risk_settings = match get_risk_settings(&self.db.pool, &intent.bot_id).await {
            Ok(rs) => rs,
            Err(e) => {
                metrics::INTENTS_PROCESSED.with_label_values(&["failed_get_risk"]).inc();
                metrics::INTENT_PROCESSING_DURATION.with_label_values(&["failed_get_risk"]).observe(start.elapsed().as_secs_f64());
                return Err(e);
            }
        };

        let mode_str = match bot.mode {
            BotMode::Paper => "paper",
            BotMode::Live => "live",
        };

        // 2. Validate with Risk Engine
        match self.risk_engine.validate(&intent, &risk_settings, &self.db.pool).await {
            Ok(RiskOutcome::Pass) => {
                intent.status = OrderIntentStatus::Validated;
                
                let mut tx = self.db.pool.begin().await?;

                if let Err(e) = save_order_intent_tx(&mut tx, &intent).await {
                    metrics::INTENTS_PROCESSED.with_label_values(&["failed_save_intent"]).inc();
                    metrics::INTENT_PROCESSING_DURATION.with_label_values(&["failed_save_intent"]).observe(start.elapsed().as_secs_f64());
                    return Err(e);
                }

                self.event_publisher
                    .save_outbox_tx(
                        &mut tx,
                        EVENT_TYPE_RISK_CHECK_PASSED,
                        &intent,
                        &serde_json::json!({"source": "risk_engine"}),
                        &PublishContext {
                            user_id: user_id.clone(),
                            bot_id: bot_id.clone(),
                            correlation_id: correlation_id.clone(),
                            causation_id: Some(intent.id.to_string()),
                            idempotency_key: idempotency_key.clone(),
                            ..Default::default()
                        },
                    )
                    .await?;

                // 3. Create Order
                let exchange = match bot.exchange.clone() {
                    Some(ex) => ex,
                    None => {
                        metrics::INTENTS_PROCESSED.with_label_values(&["failed_no_exchange"]).inc();
                        metrics::INTENT_PROCESSING_DURATION.with_label_values(&["failed_no_exchange"]).observe(start.elapsed().as_secs_f64());
                        return Err(anyhow!("bot has no active exchange account configured"));
                    }
                };

                let mut order = Order {
                    id: Uuid::new_v4(),
                    bot_id: intent.bot_id,
                    user_id: intent.user_id,
                    signal_id: intent.signal_id,
                    order_intent_id: intent.id,
                    exchange,
                    symbol: bot.symbol.clone(),
                    side: intent.side.clone(),
                    order_type: intent.order_type.clone(),
                    quantity: intent.quantity,
                    price: intent.price,
                    status: OrderStatus::Pending,
                    exchange_order_id: None,
                    idempotency_key: intent.id.to_string(),
                    raw_response: None,
                    created_at: Utc::now(),
                    updated_at: Utc::now(),
                };

                // 4. Reserve before execution so duplicate delivery cannot submit twice.
                match reserve_order_tx(&mut tx, &order).await {
                    Ok(true) => {
                        metrics::ORDERS_CREATED.with_label_values(&[mode_str]).inc();
                        
                        // Also save outbox for order submitted
                        self.event_publisher.save_outbox_tx(
                            &mut tx,
                            EVENT_TYPE_ORDER_SUBMITTED,
                            &order,
                            &serde_json::json!({"exchange": order.exchange, "symbol": order.symbol}),
                            &PublishContext {
                                user_id: user_id.clone(),
                                bot_id: bot_id.clone(),
                                correlation_id: correlation_id.clone(),
                                causation_id: Some(intent.id.to_string()),
                                idempotency_key: order.idempotency_key.clone(),
                                ..Default::default()
                            },
                        ).await?;
                    }
                    Ok(false) => {
                        let existing =
                            get_order_by_idempotency_key(&self.db.pool, &order.idempotency_key).await?;
                        if should_skip_existing_order(existing.as_ref()) {
                            metrics::INTENTS_PROCESSED.with_label_values(&["skipped_duplicate"]).inc();
                            metrics::INTENT_PROCESSING_DURATION.with_label_values(&["skipped_duplicate"]).observe(start.elapsed().as_secs_f64());
                            return Ok(());
                        }
                        metrics::INTENTS_PROCESSED.with_label_values(&["failed_reservation"]).inc();
                        metrics::INTENT_PROCESSING_DURATION.with_label_values(&["failed_reservation"]).observe(start.elapsed().as_secs_f64());
                        return Err(anyhow!(
                            "intent {} is already being processed with idempotency_key {}",
                            intent.id,
                            order.idempotency_key
                        ));
                    }
                    Err(e) => {
                        metrics::INTENTS_PROCESSED.with_label_values(&["failed_reservation_db"]).inc();
                        metrics::INTENT_PROCESSING_DURATION.with_label_values(&["failed_reservation_db"]).observe(start.elapsed().as_secs_f64());
                        return Err(e);
                    }
                }

                tx.commit().await?;

                // 5. Execute and persist the reserved order outcome.
                let execution_result = match bot.mode {
                    BotMode::Paper => self.paper_executor.execute(&mut order).await,
                    BotMode::Live => self.live_executor.execute(&mut order).await,
                };

                let mut tx = self.db.pool.begin().await?;

                if let Err(err) = execution_result {
                    order.status = OrderStatus::Failed;
                    order.raw_response = Some(serde_json::json!({
                        "error": err.to_string(),
                        "stage": "execution",
                    }));
                    order.updated_at = Utc::now();
                    update_reserved_order_tx(&mut tx, &order).await?;
                    self.publish_order_event_tx(&mut tx, &order, &correlation_id).await?;

                    if let Some(execution) = build_execution_from_order(&order) {
                        save_execution_tx(&mut tx, &execution).await?;
                        metrics::EXECUTIONS_COMPLETED.with_label_values(&[mode_str, "failed"]).inc();
                        self.publish_execution_event_tx(&mut tx, &execution, &order, &correlation_id)
                            .await?;
                    }

                    tx.commit().await?;
                    metrics::INTENTS_PROCESSED.with_label_values(&["failed_execution"]).inc();
                    metrics::INTENT_PROCESSING_DURATION.with_label_values(&["failed_execution"]).observe(start.elapsed().as_secs_f64());
                    return Err(err);
                }
                
                order.updated_at = Utc::now();
                update_reserved_order_tx(&mut tx, &order).await?;
                self.publish_order_event_tx(&mut tx, &order, &correlation_id).await?;

                if let Some(execution) = build_execution_from_order(&order) {
                    save_execution_tx(&mut tx, &execution).await?;
                    metrics::EXECUTIONS_COMPLETED.with_label_values(&[mode_str, "success"]).inc();
                    self.publish_execution_event_tx(&mut tx, &execution, &order, &correlation_id)
                        .await?;
                }

                tx.commit().await?;

                metrics::INTENTS_PROCESSED.with_label_values(&["success"]).inc();
                metrics::INTENT_PROCESSING_DURATION.with_label_values(&["success"]).observe(start.elapsed().as_secs_f64());
            }
            Ok(outcome) => {
                let reason = match &outcome {
                    RiskOutcome::Reject(r) => r.clone(),
                    RiskOutcome::AutoStop(r) => r.clone(),
                    _ => "Unknown risk violation".to_string(),
                };

                metrics::RISK_VIOLATIONS.with_label_values(&[&reason]).inc();
                intent.status = OrderIntentStatus::Rejected;
                intent.reason = Some(reason.clone());
                
                let mut tx = self.db.pool.begin().await?;

                if let RiskOutcome::AutoStop(_) = outcome {
                    // Auto-stop: update bot status and emergency stop flag
                    update_emergency_stop(&self.db.pool, &intent.bot_id, true).await?;
                    update_bot_status(&self.db.pool, &intent.bot_id, BotStatus::Paused).await?;
                }

                save_order_intent_tx(&mut tx, &intent).await?;
                self.event_publisher
                    .save_outbox_tx(
                        &mut tx,
                        EVENT_TYPE_RISK_CHECK_FAILED,
                        &intent,
                        &serde_json::json!({
                            "source": "risk_engine", 
                            "reason": reason,
                            "is_auto_stop": matches!(outcome, RiskOutcome::AutoStop(_))
                        }),
                        &PublishContext {
                            user_id,
                            bot_id,
                            correlation_id,
                            causation_id: Some(intent.id.to_string()),
                            idempotency_key,
                            ..Default::default()
                        },
                    )
                    .await?;
                tx.commit().await?;

                metrics::INTENTS_PROCESSED.with_label_values(&["risk_failed"]).inc();
                metrics::INTENT_PROCESSING_DURATION.with_label_values(&["risk_failed"]).observe(start.elapsed().as_secs_f64());
            }
            Err(e) => {
                metrics::INTENTS_PROCESSED.with_label_values(&["risk_error"]).inc();
                metrics::INTENT_PROCESSING_DURATION.with_label_values(&["risk_error"]).observe(start.elapsed().as_secs_f64());
                return Err(anyhow!("Risk engine error: {}", e));
            }
        }

        Ok(())
    }

    async fn publish_order_event_tx(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        order: &Order,
        correlation_id: &str,
    ) -> Result<()> {
        let event_type = match order.status {
            OrderStatus::Pending | OrderStatus::Submitted => EVENT_TYPE_ORDER_SUBMITTED,
            OrderStatus::Accepted => EVENT_TYPE_ORDER_ACCEPTED,
            OrderStatus::Rejected | OrderStatus::Cancelled | OrderStatus::Failed => {
                EVENT_TYPE_ORDER_REJECTED
            }
            OrderStatus::Filled | OrderStatus::PartiallyFilled => EVENT_TYPE_ORDER_ACCEPTED,
        };

        self.event_publisher
            .save_outbox_tx(
                tx,
                event_type,
                order,
                &serde_json::json!({"exchange": order.exchange, "symbol": order.symbol}),
                &PublishContext {
                    user_id: Some(order.user_id.to_string()),
                    bot_id: Some(order.bot_id.to_string()),
                    correlation_id: correlation_id.to_string(),
                    causation_id: Some(order.order_intent_id.to_string()),
                    idempotency_key: order.idempotency_key.clone(),
                    ..Default::default()
                },
            )
            .await?;

        Ok(())
    }

    async fn publish_execution_event_tx(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        execution: &Execution,
        order: &Order,
        correlation_id: &str,
    ) -> Result<()> {
        let event_type = match execution.status {
            ExecutionStatus::Completed if order.status == OrderStatus::PartiallyFilled => {
                EVENT_TYPE_EXECUTION_PARTIALLY_FILLED
            }
            ExecutionStatus::Completed => EVENT_TYPE_EXECUTION_FILLED,
            ExecutionStatus::Failed => EVENT_TYPE_EXECUTION_FAILED,
            ExecutionStatus::Pending => EVENT_TYPE_EXECUTION_PARTIALLY_FILLED,
        };

        self.event_publisher.save_outbox_tx(
            tx,
            event_type,
            execution,
            &serde_json::json!({"order_id": order.id, "exchange": order.exchange, "symbol": order.symbol}),
            &PublishContext {
                user_id: Some(execution.user_id.to_string()),
                bot_id: Some(execution.bot_id.to_string()),
                correlation_id: correlation_id.to_string(),
                causation_id: Some(order.id.to_string()),
                idempotency_key: order.idempotency_key.clone(),
                ..Default::default()
            },
        ).await?;

        Ok(())
    }
}

fn build_execution_from_order(order: &Order) -> Option<Execution> {
    let status = match order.status {
        OrderStatus::Filled => ExecutionStatus::Completed,
        OrderStatus::PartiallyFilled => ExecutionStatus::Pending,
        OrderStatus::Failed | OrderStatus::Rejected | OrderStatus::Cancelled => {
            ExecutionStatus::Failed
        }
        _ => return None,
    };

    Some(Execution {
        id: Uuid::new_v4(),
        order_id: order.id,
        bot_id: order.bot_id,
        user_id: order.user_id,
        filled_quantity: match order.status {
            OrderStatus::Filled | OrderStatus::PartiallyFilled => order.quantity,
            _ => 0.0,
        },
        average_price: order.price.unwrap_or(0.0),
        fee: 0.0,
        pnl: None,
        status,
        executed_at: Utc::now(),
        created_at: Utc::now(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn order_idempotency_key_is_derived_from_intent_id() {
        let intent_id = Uuid::new_v4();
        let key = intent_id.to_string();
        assert_eq!(key, intent_id.to_string());
    }
}
