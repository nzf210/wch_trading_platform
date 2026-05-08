use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EventEnvelope<T> {
    pub event_id: String,
    pub event_type: String,
    pub event_version: String,
    pub occurred_at: DateTime<Utc>,
    pub producer: String,
    pub tenant_id: Option<String>,
    pub user_id: Option<String>,
    pub bot_id: Option<String>,
    pub correlation_id: String,
    pub causation_id: Option<String>,
    pub idempotency_key: String,
    pub payload: T,
}

pub const EVENT_TYPE_BOT_CREATED: &str = "bot.created";
pub const EVENT_TYPE_BOT_ACTIVATED: &str = "bot.activated";
pub const EVENT_TYPE_BOT_PAUSED: &str = "bot.paused";
pub const EVENT_TYPE_BOT_STOPPED: &str = "bot.stopped";
pub const EVENT_TYPE_BOT_ERROR: &str = "bot.error";

pub const EVENT_TYPE_SUBSCRIPTION_VERIFIED: &str = "subscription.verified";

pub const EVENT_TYPE_SIGNAL_GENERATED: &str = "signal.generated";
pub const EVENT_TYPE_RISK_CHECK_REQUESTED: &str = "risk.check.requested";
pub const EVENT_TYPE_RISK_CHECK_PASSED: &str = "risk.check.passed";
pub const EVENT_TYPE_RISK_CHECK_FAILED: &str = "risk.check.failed";
pub const EVENT_TYPE_ORDER_INTENT_CREATED: &str = "order.intent.created";
pub const EVENT_TYPE_ORDER_SUBMITTED: &str = "order.submitted";
pub const EVENT_TYPE_ORDER_ACCEPTED: &str = "order.accepted";
pub const EVENT_TYPE_ORDER_REJECTED: &str = "order.rejected";
pub const EVENT_TYPE_EXECUTION_FILLED: &str = "execution.filled";
pub const EVENT_TYPE_EXECUTION_PARTIALLY_FILLED: &str = "execution.partially_filled";
pub const EVENT_TYPE_EXECUTION_FAILED: &str = "execution.failed";

pub const EVENT_TYPE_POSITION_UPDATED: &str = "position.updated";
pub const EVENT_TYPE_PNL_UPDATED: &str = "pnl.updated";

pub const EVENT_TYPE_EMERGENCY_STOP_ACTIVATED: &str = "emergency_stop.activated";
