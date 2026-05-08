use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum SignalStatus {
    Pending,
    Processed,
    Expired,
    Rejected,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum SignalAction {
    Buy,
    Sell,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Provenance {
    pub source: String,
    pub version: String,
    pub hostname: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Signal {
    pub id: String,
    pub bot_id: String,
    pub user_id: String,
    pub exchange: String,
    pub symbol: String,
    pub strategy: String,
    pub action: SignalAction,
    pub price: Option<f64>,
    pub confidence: f64,
    pub status: SignalStatus,
    pub schema_version: String,
    pub feature_snapshot: HashMap<String, serde_json::Value>,
    pub ttl_ms: i64,
    pub dedup_key: String,
    pub provenance: Provenance,
    pub payload: HashMap<String, serde_json::Value>,
    pub created_at: DateTime<Utc>,
}
