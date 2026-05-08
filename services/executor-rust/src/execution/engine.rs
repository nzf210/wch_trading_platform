use crate::exchange::get_client;
use crate::types::order::{Order, OrderStatus};
use anyhow::Result;
use async_trait::async_trait;
use sqlx::{Pool, Postgres};

#[async_trait]
pub trait Executor: Send + Sync {
    async fn execute(&self, order: &mut Order) -> Result<()>;
}

pub struct PaperExecutor;

#[async_trait]
impl Executor for PaperExecutor {
    async fn execute(&self, order: &mut Order) -> Result<()> {
        // Simulate immediate fill for paper trading
        order.status = OrderStatus::Filled;
        order.exchange_order_id = Some(format!("paper-{}", uuid::Uuid::new_v4()));
        println!("Paper order executed: {} {}", order.symbol, order.quantity);
        Ok(())
    }
}

pub struct LiveExecutor {
    pool: Pool<Postgres>,
    encryption_key: String,
}

impl LiveExecutor {
    pub fn new(pool: Pool<Postgres>, encryption_key: String) -> Self {
        Self {
            pool,
            encryption_key,
        }
    }
}

#[async_trait]
impl Executor for LiveExecutor {
    async fn execute(&self, order: &mut Order) -> Result<()> {
        let client = get_client(
            &self.pool,
            order.user_id,
            &order.exchange,
            &self.encryption_key,
        )
        .await?;

        println!(
            "Executing live order on {}: {} {}",
            order.exchange, order.symbol, order.quantity
        );

        let res = client.place_order(order).await?;

        order.status = res.status;
        order.exchange_order_id = Some(res.exchange_order_id);
        order.raw_response = Some(res.raw_response);

        println!(
            "Live order executed: {} status={:?}",
            order.exchange_order_id.as_ref().unwrap(),
            order.status
        );

        Ok(())
    }
}
