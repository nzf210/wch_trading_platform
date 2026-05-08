use crate::risk::RiskChecker;
use crate::types::bot::RiskSettings;
use crate::types::order::OrderIntent;
use async_trait::async_trait;

pub struct EmergencyStopChecker;

#[async_trait]
impl RiskChecker for EmergencyStopChecker {
    async fn check(&self, _intent: &OrderIntent, settings: &RiskSettings) -> Result<(), String> {
        if settings.emergency_stop {
            return Err("Emergency stop is active for this bot".to_string());
        }
        Ok(())
    }
}
