use crate::risk::{RiskChecker, RiskOutcome};
use crate::types::bot::RiskSettings;
use crate::types::order::OrderIntent;
use async_trait::async_trait;

pub struct DailyLossChecker;

#[async_trait]
impl RiskChecker for DailyLossChecker {
    async fn check(
        &self,
        _intent: &OrderIntent,
        settings: &RiskSettings,
        pool: &sqlx::PgPool,
    ) -> Result<RiskOutcome, String> {
        if let Some(max_daily_loss) = settings.max_daily_loss {
            if max_daily_loss <= 0.0 {
                return Ok(RiskOutcome::Reject(format!(
                    "Invalid max daily loss setting: {}. Must be > 0",
                    max_daily_loss
                )));
            }

            // Query total realized PnL for today (UTC)
            let daily_pnl: f64 = match sqlx::query_scalar::<_, f64>(
                r#"
                SELECT COALESCE(SUM(pnl), 0)::DOUBLE PRECISION
                FROM executions
                WHERE bot_id = $1
                  AND executed_at >= CURRENT_DATE AT TIME ZONE 'UTC'
                "#,
            )
            .bind(settings.bot_id)
            .fetch_one(pool)
            .await
            {
                Ok(val) => val,
                Err(e) => {
                    tracing::error!("Failed to query daily PnL: {:?}", e);
                    0.0
                }
            };

            if daily_pnl < -max_daily_loss {
                return Ok(RiskOutcome::AutoStop(format!(
                    "Daily loss limit reached: {:.2} (limit: {:.2})",
                    daily_pnl, max_daily_loss
                )));
            }
        }

        Ok(RiskOutcome::Pass)
    }
}
