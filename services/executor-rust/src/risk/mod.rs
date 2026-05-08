use crate::types::bot::RiskSettings;
use crate::types::order::OrderIntent;
use async_trait::async_trait;

pub mod daily_loss;
pub mod emergency_stop;
pub mod monitor;
pub mod position_limit;
pub mod stop_loss;
pub mod take_profit;

pub use monitor::RiskMonitor;

#[async_trait]
pub trait RiskChecker: Send + Sync {
    async fn check(&self, intent: &OrderIntent, settings: &RiskSettings) -> Result<(), String>;
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
    ) -> Result<(), String> {
        for checker in &self.checkers {
            checker.check(intent, settings).await?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::bot::RiskSettings;
    use crate::types::order::{OrderIntent, OrderIntentStatus, OrderSide, OrderType};
    use chrono::Utc;
    use uuid::Uuid;

    fn sample_intent(quantity: f64, price: Option<f64>) -> OrderIntent {
        OrderIntent {
            id: Uuid::new_v4(),
            bot_id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            signal_id: Some(Uuid::new_v4()),
            side: OrderSide::Buy,
            order_type: OrderType::Market,
            quantity,
            price,
            status: OrderIntentStatus::Created,
            reason: None,
            created_at: Utc::now(),
        }
    }

    fn sample_settings() -> RiskSettings {
        RiskSettings {
            id: Uuid::new_v4(),
            bot_id: Uuid::new_v4(),
            max_position_size: Some(10.0),
            max_daily_loss: Some(100.0),
            stop_loss_percent: Some(5.0),
            take_profit_percent: Some(10.0),
            trailing_stop_percent: Some(2.5),
            emergency_stop: false,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }

    #[tokio::test]
    async fn risk_engine_allows_valid_intent() {
        let engine = RiskEngine::new();
        let intent = sample_intent(1.0, Some(100.0));
        let settings = sample_settings();

        let result = engine.validate(&intent, &settings).await;

        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn risk_engine_rejects_emergency_stop() {
        let engine = RiskEngine::new();
        let intent = sample_intent(1.0, Some(100.0));
        let mut settings = sample_settings();
        settings.emergency_stop = true;

        let result = engine.validate(&intent, &settings).await;

        assert_eq!(
            result,
            Err("Emergency stop is active for this bot".to_string())
        );
    }

    #[tokio::test]
    async fn risk_engine_rejects_position_limit_breach() {
        let engine = RiskEngine::new();
        let intent = sample_intent(11.0, Some(100.0));
        let settings = sample_settings();

        let result = engine.validate(&intent, &settings).await;

        assert!(matches!(
            result,
            Err(message) if message.contains("exceeds max position size")
        ));
    }

    #[tokio::test]
    async fn risk_engine_rejects_invalid_daily_loss() {
        let engine = RiskEngine::new();
        let intent = sample_intent(1.0, Some(100.0));
        let mut settings = sample_settings();
        settings.max_daily_loss = Some(0.0);

        let result = engine.validate(&intent, &settings).await;

        assert!(matches!(
            result,
            Err(message) if message.contains("Invalid max daily loss")
        ));
    }

    #[tokio::test]
    async fn risk_engine_rejects_invalid_stop_loss() {
        let engine = RiskEngine::new();
        let intent = sample_intent(1.0, Some(100.0));
        let mut settings = sample_settings();
        settings.stop_loss_percent = Some(101.0);

        let result = engine.validate(&intent, &settings).await;

        assert!(matches!(
            result,
            Err(message) if message.contains("Invalid stop loss percent")
        ));
    }
}
