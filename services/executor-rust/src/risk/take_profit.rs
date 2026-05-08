use crate::risk::{RiskChecker, RiskOutcome};
use crate::types::bot::RiskSettings;
use crate::types::order::OrderIntent;
use async_trait::async_trait;

pub struct TakeProfitChecker;

#[async_trait]
impl RiskChecker for TakeProfitChecker {
    async fn check(
        &self,
        _intent: &OrderIntent,
        settings: &RiskSettings,
        _pool: &sqlx::PgPool,
    ) -> Result<RiskOutcome, String> {
        if let Some(tp) = settings.take_profit_percent {
            if tp <= 0.0 {
                return Ok(RiskOutcome::Reject(format!(
                    "Invalid take profit percent: {}",
                    tp
                )));
            }
        }
        Ok(RiskOutcome::Pass)
    }
}
