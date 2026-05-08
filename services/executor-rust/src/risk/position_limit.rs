use crate::risk::{RiskChecker, RiskOutcome};
use crate::types::bot::RiskSettings;
use crate::types::order::OrderIntent;
use async_trait::async_trait;

pub struct PositionLimitChecker;

#[async_trait]
impl RiskChecker for PositionLimitChecker {
    async fn check(
        &self,
        intent: &OrderIntent,
        settings: &RiskSettings,
        pool: &sqlx::PgPool,
    ) -> Result<RiskOutcome, String> {
        if let Some(max_size) = settings.max_position_size {
            // Query current open position quantity for the symbol associated with this bot
            let current_qty: f64 = match sqlx::query_scalar::<_, f64>(
                r#"
                SELECT COALESCE(SUM(p.quantity), 0)::DOUBLE PRECISION
                FROM positions p
                JOIN bots b ON b.id = p.bot_id
                WHERE p.bot_id = $1 AND p.symbol = b.symbol AND p.quantity != 0
                "#,
            )
            .bind(settings.bot_id)
            .fetch_one(pool)
            .await
            {
                Ok(val) => val,
                Err(e) => {
                    tracing::error!("Failed to query current position: {:?}", e);
                    0.0
                }
            };

            // Simplified: for now we only check if intent quantity + current qty > max_size
            // In a real scenario, we should handle side (buy vs sell) to see if it increases or decreases pos
            if intent.quantity + current_qty > max_size {
                return Ok(RiskOutcome::Reject(format!(
                    "Trade quantity {} plus current position {} exceeds max position size: {}",
                    intent.quantity, current_qty, max_size
                )));
            }
        }
        Ok(RiskOutcome::Pass)
    }
}

