use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Type};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone, Type)]
#[serde(rename_all = "snake_case")]
#[sqlx(rename_all = "snake_case", type_name = "varchar")]
pub enum BotStatus {
    Draft,
    PaperActive,
    LivePendingApproval,
    LiveActive,
    Paused,
    Stopped,
    Error,
}

#[derive(Debug, Serialize, Deserialize, Clone, Type)]
#[serde(rename_all = "snake_case")]
#[sqlx(rename_all = "snake_case", type_name = "varchar")]
pub enum BotMode {
    Paper,
    Live,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Bot {
    pub id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub exchange_account_id: Option<uuid::Uuid>,
    pub exchange: Option<String>, // Added field
    pub name: String,
    pub mode: BotMode,
    pub strategy: String,
    pub symbol: String,
    pub quote_asset: String,
    pub capital: f64,
    pub status: BotStatus,
    pub config: sqlx::types::Json<HashMap<String, serde_json::Value>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct RiskSettings {
    pub id: uuid::Uuid,
    pub bot_id: uuid::Uuid,
    pub max_position_size: Option<f64>,
    pub max_daily_loss: Option<f64>,
    pub max_drawdown_percent: Option<f64>,
    pub stop_loss_percent: Option<f64>,
    pub take_profit_percent: Option<f64>,
    pub trailing_stop_percent: Option<f64>,
    pub emergency_stop: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
