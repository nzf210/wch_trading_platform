use crate::types::bot::RiskSettings;
use anyhow::Result;
use sqlx::PgPool;
use uuid::Uuid;

pub async fn get_risk_settings(pool: &PgPool, bot_id: &Uuid) -> Result<RiskSettings> {
    let row = sqlx::query_as::<_, RiskSettings>(
        r#"
        SELECT id, bot_id,
               max_position_size::DOUBLE PRECISION AS max_position_size,
               max_daily_loss::DOUBLE PRECISION AS max_daily_loss,
               max_drawdown_percent::DOUBLE PRECISION AS max_drawdown_percent,
               stop_loss_percent::DOUBLE PRECISION AS stop_loss_percent,
               take_profit_percent::DOUBLE PRECISION AS take_profit_percent,
               trailing_stop_percent::DOUBLE PRECISION AS trailing_stop_percent,
               emergency_stop,
               created_at AS created_at,
               updated_at AS updated_at
        FROM risk_settings
        WHERE bot_id = $1
        "#,
    )
    .bind(bot_id)
    .fetch_one(pool)
    .await?;

    Ok(row)
}

pub async fn update_emergency_stop(
    pool: &PgPool,
    bot_id: &Uuid,
    emergency_stop: bool,
) -> Result<()> {
    sqlx::query(
        "UPDATE risk_settings SET emergency_stop = $1, updated_at = NOW() WHERE bot_id = $2",
    )
    .bind(emergency_stop)
    .bind(bot_id)
    .execute(pool)
    .await?;
    Ok(())
}
