use crate::risk::RiskChecker;
use crate::types::bot::RiskSettings;
use crate::types::order::OrderIntent;
use async_trait::async_trait;

pub struct TakeProfitChecker;

#[async_trait]
impl RiskChecker for TakeProfitChecker {
    async fn check(&self, _intent: &OrderIntent, settings: &RiskSettings) -> Result<(), String> {
        if let Some(tp) = settings.take_profit_percent {
            if tp <= 0.0 {
                return Err(format!("Invalid take profit percent: {}", tp));
            }
        }
        Ok(())
    }
}
