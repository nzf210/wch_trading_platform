pub mod binance;
pub mod bybit;
pub mod okx;
pub mod types;

pub use self::types::{Balance, ExchangeOrderResponse};
use crate::postgres::exchange::get_account;
use crate::security::decrypt;
use crate::types::order::{Order, OrderStatus};
use anyhow::{Context, Result};
use async_trait::async_trait;
use sqlx::{Pool, Postgres};

#[async_trait]
pub trait Exchange: Send + Sync {
    async fn place_order(&self, order: &Order) -> Result<ExchangeOrderResponse>;
    async fn cancel_order(&self, symbol: &str, exchange_order_id: &str) -> Result<()>;
    async fn get_order_status(&self, symbol: &str, exchange_order_id: &str) -> Result<OrderStatus>;
    async fn get_balance(&self, asset: &str) -> Result<Balance>;
    async fn get_price(&self, symbol: &str) -> Result<f64>;
}

pub async fn get_client(
    pool: &Pool<Postgres>,
    user_id: uuid::Uuid,
    exchange: &str,
    encryption_key: &str,
) -> Result<Box<dyn Exchange>> {
    let acc = get_account(pool, user_id, exchange)
        .await
        .context("Failed to find active exchange account")?;

    let api_key = decrypt(&acc.api_key_encrypted, encryption_key)?;
    let api_secret = decrypt(&acc.api_secret_encrypted, encryption_key)?;

    match exchange.to_lowercase().as_str() {
        "binance" => Ok(Box::new(binance::BinanceClient::new(api_key, api_secret))),
        "bybit" => Ok(Box::new(bybit::BybitClient::new(api_key, api_secret))),
        "okx" => {
            let passphrase = decrypt(
                acc.passphrase_encrypted
                    .as_deref()
                    .context("OKX requires passphrase")?,
                encryption_key,
            )?;
            Ok(Box::new(okx::OkxClient::new(
                api_key, api_secret, passphrase,
            )))
        }
        _ => Err(anyhow::anyhow!("Unsupported exchange: {}", exchange)),
    }
}
