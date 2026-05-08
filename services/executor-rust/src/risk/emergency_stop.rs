use crate::risk::{RiskChecker, RiskOutcome};
use crate::types::bot::RiskSettings;
use crate::types::order::OrderIntent;
use async_trait::async_trait;

pub struct EmergencyStopChecker;

#[async_trait]
impl RiskChecker for EmergencyStopChecker {
    async fn check(
        &self,
        _intent: &OrderIntent,
        settings: &RiskSettings,
        _pool: &sqlx::PgPool,
    ) -> Result<RiskOutcome, String> {
        if settings.emergency_stop {
            return Ok(RiskOutcome::Reject(
                "Emergency stop is active for this bot".to_string(),
            ));
        }
        Ok(RiskOutcome::Pass)
    }
}
