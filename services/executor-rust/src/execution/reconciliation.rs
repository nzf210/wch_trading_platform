use crate::exchange::get_client;
use crate::postgres::orders::{get_open_orders, update_order_status};
use crate::types::order::OrderStatus;
use sqlx::{Pool, Postgres};
use std::time::Duration;
use tokio::time::sleep;
use tracing::{error, info, warn};

pub struct Reconciler {
    pool: Pool<Postgres>,
    encryption_key: String,
}

impl Reconciler {
    pub fn new(pool: Pool<Postgres>, encryption_key: String) -> Self {
        Self {
            pool,
            encryption_key,
        }
    }

    pub async fn run(&self) {
        info!("Starting reconciliation loop...");
        loop {
            if let Err(e) = self.reconcile_orders().await {
                error!("Order reconciliation error: {:?}", e);
            }
            sleep(Duration::from_secs(60)).await;
        }
    }

    async fn reconcile_orders(&self) -> anyhow::Result<()> {
        let open_orders = get_open_orders(&self.pool).await?;
        if open_orders.is_empty() {
            return Ok(());
        }

        info!("Reconciling {} open orders", open_orders.len());

        for order in open_orders {
            if let Some(exchange_id) = &order.exchange_order_id {
                match get_client(
                    &self.pool,
                    order.user_id,
                    &order.exchange,
                    &self.encryption_key,
                )
                .await
                {
                    Ok(client) => {
                        match client.get_order_status(&order.symbol, exchange_id).await {
                            Ok(new_status) => {
                                if new_status != order.status {
                                    info!(
                                        "Order {} status changed from {:?} to {:?}",
                                        order.id, order.status, new_status
                                    );
                                    if let Err(e) = update_order_status(
                                        &self.pool,
                                        &order.id,
                                        new_status.clone(),
                                        None,
                                    )
                                    .await
                                    {
                                        error!("Failed to update order status in DB: {:?}", e);
                                    }

                                    // If order is FILLED, update position
                                    if new_status == OrderStatus::Filled {
                                        if let Err(e) = self.update_position_for_order(&order).await
                                        {
                                            error!("Failed to update position for filled order {}: {:?}", order.id, e);
                                        }
                                    }
                                }
                            }
                            Err(e) => {
                                warn!(
                                    "Failed to get status for order {} from {}: {:?}",
                                    order.id, order.exchange, e
                                );
                            }
                        }
                    }
                    Err(e) => {
                        error!(
                            "Failed to get exchange client for order {}: {:?}",
                            order.id, e
                        );
                    }
                }
            } else {
                warn!("Open order {} has no exchange_order_id", order.id);
            }
        }

        Ok(())
    }

    async fn update_position_for_order(
        &self,
        order: &crate::types::order::Order,
    ) -> anyhow::Result<()> {
        use crate::postgres::positions::upsert_position_on_fill;
        use crate::postgres::risk::get_risk_settings;

        let settings = get_risk_settings(&self.pool, &order.bot_id).await?;
        let price = order.price.unwrap_or(0.0); // Should ideally get average fill price from exchange

        upsert_position_on_fill(
            &self.pool,
            &order.bot_id,
            &order.user_id,
            &order.symbol,
            &format!("{:?}", order.side),
            order.quantity,
            price,
            settings.stop_loss_percent,
            settings.take_profit_percent,
        )
        .await?;

        Ok(())
    }
}
