use crate::exchange::get_client;
use crate::execution::{Executor, LiveExecutor};
use crate::postgres::bot::get_bot;
use crate::postgres::orders::save_order;
use crate::postgres::positions::{get_open_positions, update_position};
use crate::postgres::risk::get_risk_settings;
use crate::types::order::{Order, OrderSide, OrderStatus, OrderType};
use crate::types::position::Position;
use chrono::Utc;
use sqlx::{Pool, Postgres};
use std::time::Duration;
use tokio::time::sleep;
use tracing::{error, info};
use uuid::Uuid;

pub struct RiskMonitor {
    pool: Pool<Postgres>,
    encryption_key: String,
    live_executor: LiveExecutor,
}

impl RiskMonitor {
    pub fn new(pool: Pool<Postgres>, encryption_key: String) -> Self {
        let live_executor = LiveExecutor::new(pool.clone(), encryption_key.clone());
        Self {
            pool,
            encryption_key,
            live_executor,
        }
    }

    pub async fn run(&self) {
        info!("Starting risk monitor loop...");
        loop {
            if let Err(e) = self.monitor_positions().await {
                error!("Risk monitor error: {:?}", e);
            }
            sleep(Duration::from_secs(10)).await;
        }
    }

    async fn monitor_positions(&self) -> anyhow::Result<()> {
        let positions = get_open_positions(&self.pool).await?;
        if positions.is_empty() {
            return Ok(());
        }

        for mut pos in positions {
            if let Err(e) = self.check_position(&mut pos).await {
                error!("Error checking position {}: {:?}", pos.id, e);
            }
        }

        Ok(())
    }

    async fn check_position(&self, pos: &mut Position) -> anyhow::Result<()> {
        let bot = get_bot(&self.pool, &pos.bot_id).await?;
        let settings = get_risk_settings(&self.pool, &pos.bot_id).await?;

        let client = get_client(
            &self.pool,
            pos.user_id,
            &bot.exchange.as_deref().unwrap_or("binance"),
            &self.encryption_key,
        )
        .await?;
        let current_price = client.get_price(&pos.symbol).await?;

        // 1. Calculate Unrealized PnL
        let pnl = if pos.side == "buy" {
            (current_price - pos.average_entry_price) * pos.quantity
        } else {
            (pos.average_entry_price - current_price) * pos.quantity
        };
        pos.unrealized_pnl = pnl;

        // 2. Trailing Stop Logic
        let mut should_update_db = false;
        if let Some(ts_percent) = settings.trailing_stop_percent {
            if pos.side == "buy" {
                if current_price > pos.high_water_mark {
                    pos.high_water_mark = current_price;
                    let new_sl = current_price * (1.0 - ts_percent / 100.0);
                    if pos.stop_loss_price.is_none() || new_sl > pos.stop_loss_price.unwrap() {
                        pos.stop_loss_price = Some(new_sl);
                    }
                    should_update_db = true;
                }
            } else {
                // sell/short
                // For shorts, high_water_mark is actually the lowest price
                if pos.high_water_mark == 0.0 || current_price < pos.high_water_mark {
                    pos.high_water_mark = current_price;
                    let new_sl = current_price * (1.0 + ts_percent / 100.0);
                    if pos.stop_loss_price.is_none() || new_sl < pos.stop_loss_price.unwrap() {
                        pos.stop_loss_price = Some(new_sl);
                    }
                    should_update_db = true;
                }
            }
        }

        // 3. Check SL/TP
        let mut should_close = false;
        let mut reason = String::new();

        if let Some(sl_price) = pos.stop_loss_price {
            if (pos.side == "buy" && current_price <= sl_price)
                || (pos.side == "sell" && current_price >= sl_price)
            {
                should_close = true;
                reason = format!("Stop loss hit: {} at {}", sl_price, current_price);
            }
        }

        if !should_close {
            if let Some(tp_price) = pos.take_profit_price {
                if (pos.side == "buy" && current_price >= tp_price)
                    || (pos.side == "sell" && current_price <= tp_price)
                {
                    should_close = true;
                    reason = format!("Take profit hit: {} at {}", tp_price, current_price);
                }
            }
        }

        if should_close {
            info!(
                "Closing position {} for bot {}: {}",
                pos.id, pos.bot_id, reason
            );
            self.close_position(pos, &bot.exchange.as_deref().unwrap_or("binance"))
                .await?;
        } else if should_update_db {
            update_position(&self.pool, pos).await?;
        }

        Ok(())
    }

    async fn close_position(&self, pos: &Position, exchange: &str) -> anyhow::Result<()> {
        let side = if pos.side == "buy" {
            OrderSide::Sell
        } else {
            OrderSide::Buy
        };

        let mut order = Order {
            id: Uuid::new_v4(),
            bot_id: pos.bot_id,
            user_id: pos.user_id,
            signal_id: None,
            order_intent_id: Uuid::new_v4(), // Placeholder
            exchange: exchange.to_string(),
            symbol: pos.symbol.clone(),
            side,
            order_type: OrderType::Market,
            quantity: pos.quantity,
            price: None,
            status: OrderStatus::Pending,
            exchange_order_id: None,
            idempotency_key: format!("close-{}", Uuid::new_v4()),
            raw_response: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        self.live_executor.execute(&mut order).await?;
        save_order(&self.pool, &order).await?;

        // Mark position as closed in DB
        sqlx::query(
            "UPDATE positions SET quantity = 0, unrealized_pnl = 0, updated_at = NOW() WHERE id = $1",
        )
        .bind(pos.id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}
