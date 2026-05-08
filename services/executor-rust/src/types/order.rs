use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Type};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Type)]
#[serde(rename_all = "snake_case")]
#[sqlx(rename_all = "snake_case", type_name = "varchar")]
pub enum OrderIntentStatus {
    Created,
    Validated,
    Rejected,
    Superseded,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Type)]
#[serde(rename_all = "snake_case")]
#[sqlx(rename_all = "snake_case", type_name = "varchar")]
pub enum OrderStatus {
    Pending,
    Submitted,
    Accepted,
    Rejected,
    Cancelled,
    Filled,
    PartiallyFilled,
    Failed,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Type)]
#[serde(rename_all = "snake_case")]
#[sqlx(rename_all = "snake_case", type_name = "varchar")]
pub enum OrderSide {
    Buy,
    Sell,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Type)]
#[serde(rename_all = "snake_case")]
#[sqlx(rename_all = "snake_case", type_name = "varchar")]
pub enum OrderType {
    Market,
    Limit,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct OrderIntent {
    pub id: uuid::Uuid,
    pub bot_id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub signal_id: Option<uuid::Uuid>,
    pub side: OrderSide,
    pub order_type: OrderType,
    pub quantity: f64,
    pub price: Option<f64>,
    pub status: OrderIntentStatus,
    pub reason: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Order {
    pub id: uuid::Uuid,
    pub bot_id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub signal_id: Option<uuid::Uuid>,
    pub order_intent_id: uuid::Uuid,
    pub exchange: String,
    pub symbol: String,
    pub side: OrderSide,
    pub order_type: OrderType,
    pub quantity: f64,
    pub price: Option<f64>,
    pub status: OrderStatus,
    pub exchange_order_id: Option<String>,
    pub idempotency_key: String,
    pub raw_response: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
