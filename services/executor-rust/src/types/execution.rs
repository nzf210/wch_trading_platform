use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Type};

#[derive(Debug, Serialize, Deserialize, Clone, Type)]
#[serde(rename_all = "snake_case")]
#[sqlx(rename_all = "snake_case", type_name = "varchar")]
pub enum ExecutionStatus {
    Pending,
    Completed,
    Failed,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Execution {
    pub id: uuid::Uuid,
    pub order_id: uuid::Uuid,
    pub bot_id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub filled_quantity: f64,
    pub average_price: f64,
    pub fee: f64,
    pub pnl: Option<f64>,
    pub status: ExecutionStatus,
    pub executed_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}
