use anyhow::Result;
use sqlx::{FromRow, Pool, Postgres};

#[derive(Debug, FromRow)]
pub struct ExchangeAccount {
    pub id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub exchange: String,
    pub api_key_encrypted: String,
    pub api_secret_encrypted: String,
    pub passphrase_encrypted: Option<String>,
}

pub async fn get_account(
    pool: &Pool<Postgres>,
    user_id: uuid::Uuid,
    exchange: &str,
) -> Result<ExchangeAccount> {
    let account = sqlx::query_as::<_, ExchangeAccount>(
        r#"
        SELECT id, user_id, exchange, api_key_encrypted, api_secret_encrypted, passphrase_encrypted
        FROM exchange_accounts
        WHERE user_id = $1 AND exchange = $2 AND status = 'active'
        LIMIT 1
        "#,
    )
    .bind(user_id)
    .bind(exchange)
    .fetch_one(pool)
    .await?;

    Ok(account)
}
