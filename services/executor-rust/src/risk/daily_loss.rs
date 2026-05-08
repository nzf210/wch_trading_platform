use crate::risk::RiskChecker;
use crate::types::bot::RiskSettings;
use crate::types::order::OrderIntent;
use async_trait::async_trait;

pub struct DailyLossChecker;

#[async_trait]
impl RiskChecker for DailyLossChecker {
    async fn check(&self, _intent: &OrderIntent, settings: &RiskSettings) -> Result<(), String> {
        if let Some(max_daily_loss) = settings.max_daily_loss {
            if max_daily_loss <= 0.0 {
                return Err(format!(
                    "Invalid max daily loss: {}. Value must be greater than 0",
                    max_daily_loss
                ));
            }
        }

        Ok(())
    }
}
