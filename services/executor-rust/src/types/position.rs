use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Position {
    pub id: uuid::Uuid,
    pub bot_id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub symbol: String,
    pub side: String,
    pub quantity: f64,
    pub average_entry_price: f64,
    pub high_water_mark: f64,
    pub stop_loss_price: Option<f64>,
    pub take_profit_price: Option<f64>,
    pub unrealized_pnl: f64,
    pub realized_pnl: f64,
    pub updated_at: DateTime<Utc>,
}
