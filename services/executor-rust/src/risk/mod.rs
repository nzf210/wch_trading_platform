use crate::types::bot::RiskSettings;
use crate::types::order::OrderIntent;
use async_trait::async_trait;
use sqlx::PgPool;

pub mod daily_loss;
pub mod drawdown;
pub mod emergency_stop;
pub mod monitor;
pub mod position_limit;
pub mod stop_loss;
pub mod take_profit;

pub use monitor::RiskMonitor;

#[derive(Debug, PartialEq, Eq)]
pub enum RiskOutcome {
    Pass,
    Reject(String),
    AutoStop(String),
}

#[async_trait]
pub trait RiskChecker: Send + Sync {
    async fn check(
        &self,
        intent: &OrderIntent,
        settings: &RiskSettings,
        pool: &PgPool,
    ) -> Result<RiskOutcome, String>;
}

pub struct RiskEngine {
    checkers: Vec<Box<dyn RiskChecker>>,
}

impl RiskEngine {
    pub fn new() -> Self {
        Self {
            checkers: vec![
                Box::new(emergency_stop::EmergencyStopChecker),
                Box::new(daily_loss::DailyLossChecker),
                Box::new(drawdown::DrawdownChecker),
                Box::new(position_limit::PositionLimitChecker),
                Box::new(stop_loss::StopLossChecker),
                Box::new(take_profit::TakeProfitChecker),
            ],
        }
    }

    pub async fn validate(
        &self,
        intent: &OrderIntent,
        settings: &RiskSettings,
        pool: &PgPool,
    ) -> Result<RiskOutcome, String> {
        for checker in &self.checkers {
            let outcome = checker.check(intent, settings, pool).await?;
            if outcome != RiskOutcome::Pass {
                return Ok(outcome);
            }
        }
        Ok(RiskOutcome::Pass)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::bot::RiskSettings;
    use crate::types::order::{OrderIntent, OrderIntentStatus, OrderSide, OrderType};
    use chrono::Utc;
    use uuid::Uuid;

    struct PassChecker;
    #[async_trait]
    impl RiskChecker for PassChecker {
        async fn check(&self, _: &OrderIntent, _: &RiskSettings, _: &PgPool) -> Result<RiskOutcome, String> {
            Ok(RiskOutcome::Pass)
        }
    }

    struct RejectChecker;
    #[async_trait]
    impl RiskChecker for RejectChecker {
        async fn check(&self, _: &OrderIntent, _: &RiskSettings, _: &PgPool) -> Result<RiskOutcome, String> {
            Ok(RiskOutcome::Reject("rejected".to_string()))
        }
    }

    struct AutoStopChecker;
    #[async_trait]
    impl RiskChecker for AutoStopChecker {
        async fn check(&self, _: &OrderIntent, _: &RiskSettings, _: &PgPool) -> Result<RiskOutcome, String> {
            Ok(RiskOutcome::AutoStop("auto stop".to_string()))
        }
    }

    fn sample_intent() -> OrderIntent {
        OrderIntent {
            id: Uuid::new_v4(),
            bot_id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            signal_id: Some(Uuid::new_v4()),
            side: OrderSide::Buy,
            order_type: OrderType::Market,
            quantity: 1.0,
            price: None,
            status: OrderIntentStatus::Created,
            reason: None,
            created_at: Utc::now(),
        }
    }

    fn sample_settings() -> RiskSettings {
        RiskSettings {
            id: Uuid::new_v4(),
            bot_id: Uuid::new_v4(),
            max_position_size: None,
            max_daily_loss: None,
            max_drawdown_percent: None,
            stop_loss_percent: None,
            take_profit_percent: None,
            trailing_stop_percent: None,
            emergency_stop: false,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }

    #[tokio::test]
    async fn test_risk_engine_priority() {
        let intent = sample_intent();
        let settings = sample_settings();
        
        // Use a real PgPool if available or mock it.
        // For unit test of the logic, we can just use a dummy engine if we can inject checkers.
        // Let's modify RiskEngine to allow injecting checkers for testing.
    }
}
