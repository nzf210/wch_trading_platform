use crate::types::bot::RiskSettings;
use anyhow::Result;
use sqlx::PgPool;
use uuid::Uuid;

pub async fn get_risk_settings(pool: &PgPool, bot_id: &Uuid) -> Result<RiskSettings> {
    let row = sqlx::query_as::<_, RiskSettings>(
        r#"
        SELECT id, bot_id, max_position_size, max_daily_loss, 
               stop_loss_percent, take_profit_percent, emergency_stop, 
               created_at, updated_at
        FROM risk_settings
        WHERE bot_id = $1
        "#,
    )
    .bind(bot_id)
    .fetch_one(pool)
    .await?;

    Ok(row)
}
