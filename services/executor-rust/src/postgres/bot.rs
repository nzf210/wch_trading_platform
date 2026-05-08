use crate::types::bot::{Bot, BotStatus};
use anyhow::Result;
use sqlx::PgPool;
use uuid::Uuid;

pub async fn get_bot(pool: &PgPool, bot_id: &Uuid) -> Result<Bot> {
    let row = sqlx::query_as::<_, Bot>(
        r#"
        SELECT 
            b.id, b.user_id, b.exchange_account_id, b.name, b.mode, b.strategy, 
            b.symbol, b.quote_asset, b.capital::DOUBLE PRECISION AS capital, b.status, b.config,
            b.created_at AS created_at,
            b.updated_at AS updated_at,
            ea.exchange as exchange
        FROM bots b
        LEFT JOIN exchange_accounts ea ON b.exchange_account_id = ea.id
        WHERE b.id = $1
        "#,
    )
    .bind(bot_id)
    .fetch_one(pool)
    .await?;

    Ok(row)
}

pub async fn update_bot_status(
    pool: &PgPool,
    bot_id: &Uuid,
    status: BotStatus,
) -> Result<()> {
    sqlx::query("UPDATE bots SET status = $1, updated_at = NOW() WHERE id = $2")
        .bind(status)
        .bind(bot_id)
        .execute(pool)
        .await?;
    Ok(())
}
