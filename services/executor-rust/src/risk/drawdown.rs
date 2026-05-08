use crate::risk::{RiskChecker, RiskOutcome};
use crate::types::bot::RiskSettings;
use crate::types::order::OrderIntent;
use async_trait::async_trait;

pub struct DrawdownChecker;

#[async_trait]
impl RiskChecker for DrawdownChecker {
    async fn check(
        &self,
        _intent: &OrderIntent,
        settings: &RiskSettings,
        pool: &sqlx::PgPool,
    ) -> Result<RiskOutcome, String> {
        if let Some(max_dd) = settings.max_drawdown_percent {
            if max_dd <= 0.0 || max_dd > 100.0 {
                return Ok(RiskOutcome::Reject(format!(
                    "Invalid max drawdown percent: {}",
                    max_dd
                )));
            }

            // In a real scenario, we'd query peak capital and current capital.
            // For now, we'll check total realized PnL against bot's starting capital.
            // We need bot.capital, but RiskSettings doesn't have it.
            // We can query it from bots table.
            let capital: f64 = match sqlx::query_scalar::<_, f64>(
                "SELECT capital::DOUBLE PRECISION FROM bots WHERE id = $1",
            )
            .bind(settings.bot_id)
            .fetch_one(pool)
            .await
            {
                Ok(c) => c,
                Err(e) => {
                    tracing::error!("Failed to query bot capital for drawdown check: {:?}", e);
                    return Ok(RiskOutcome::Pass); // Fallback to pass if we can't check
                }
            };

            let total_pnl: f64 = match sqlx::query_scalar::<_, f64>(
                "SELECT COALESCE(SUM(pnl), 0)::DOUBLE PRECISION FROM executions WHERE bot_id = $1",
            )
            .bind(settings.bot_id)
            .fetch_one(pool)
            .await
            {
                Ok(p) => p,
                Err(e) => {
                    tracing::error!("Failed to query total PnL for drawdown check: {:?}", e);
                    0.0
                }
            };

            let current_capital = capital + total_pnl;
            // Simplified drawdown: loss relative to initial capital
            let loss_percent = if capital > 0.0 {
                ((capital - current_capital) / capital) * 100.0
            } else {
                0.0
            };

            if loss_percent > max_dd {
                return Ok(RiskOutcome::AutoStop(format!(
                    "Max drawdown reached: {:.2}% (limit: {:.2}%)",
                    loss_percent, max_dd
                )));
            }
        }

        Ok(RiskOutcome::Pass)
    }
}
