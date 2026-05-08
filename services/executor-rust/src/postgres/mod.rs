use anyhow::Result;
use sqlx::postgres::PgPoolOptions;
use sqlx::{Pool, Postgres};

pub mod bot;
pub mod exchange;
pub mod executions;
pub mod inbox;
pub mod orders;
pub mod positions;
pub mod risk;

#[derive(Clone)]
pub struct Database {
    pub pool: Pool<Postgres>,
}

impl Database {
    pub async fn connect(url: &str) -> Result<Self> {
        let pool = PgPoolOptions::new().max_connections(5).connect(url).await?;
        Ok(Self { pool })
    }
}
