use crate::risk::RiskChecker;
use crate::types::bot::RiskSettings;
use crate::types::order::OrderIntent;
use async_trait::async_trait;

pub struct StopLossChecker;

#[async_trait]
impl RiskChecker for StopLossChecker {
    async fn check(&self, _intent: &OrderIntent, settings: &RiskSettings) -> Result<(), String> {
        if let Some(sl) = settings.stop_loss_percent {
            if sl <= 0.0 || sl > 100.0 {
                return Err(format!("Invalid stop loss percent: {}", sl));
            }
        }
        if let Some(ts) = settings.trailing_stop_percent {
            if ts <= 0.0 || ts > 100.0 {
                return Err(format!("Invalid trailing stop percent: {}", ts));
            }
        }
        Ok(())
    }
}
