use crate::risk::RiskChecker;
use crate::types::bot::RiskSettings;
use crate::types::order::OrderIntent;
use async_trait::async_trait;

pub struct PositionLimitChecker;

#[async_trait]
impl RiskChecker for PositionLimitChecker {
    async fn check(&self, intent: &OrderIntent, settings: &RiskSettings) -> Result<(), String> {
        if let Some(max_size) = settings.max_position_size {
            // Simple check: intent quantity vs max_size
            // In a real scenario, we'd check current open position + intent quantity
            if intent.quantity > max_size {
                return Err(format!(
                    "Order quantity {} exceeds max position size {}",
                    intent.quantity, max_size
                ));
            }
        }
        Ok(())
    }
}
