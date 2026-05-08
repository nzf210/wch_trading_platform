use crate::types::order::OrderStatus;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExchangeOrderResponse {
    pub exchange_order_id: String,
    pub status: OrderStatus,
    pub raw_response: Value,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Balance {
    pub asset: String,
    pub free: f64,
    pub locked: f64,
}
