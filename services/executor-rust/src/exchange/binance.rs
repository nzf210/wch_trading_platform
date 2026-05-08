use super::{Balance, Exchange, ExchangeOrderResponse};
use crate::types::order::{Order, OrderSide, OrderStatus, OrderType};
use anyhow::{Context, Result};
use async_trait::async_trait;
use hmac::{Hmac, Mac};
use reqwest::{header, Client};
use serde_json::Value;
use sha2::Sha256;
use std::time::{SystemTime, UNIX_EPOCH};

type HmacSha256 = Hmac<Sha256>;

pub struct BinanceClient {
    client: Client,
    api_secret: String,
    base_url: String,
}

impl BinanceClient {
    pub fn new(api_key: String, api_secret: String) -> Self {
        let mut headers = header::HeaderMap::new();
        headers.insert(
            "X-MBX-APIKEY",
            header::HeaderValue::from_str(&api_key).unwrap(),
        );

        Self {
            client: Client::builder().default_headers(headers).build().unwrap(),
            api_secret,
            base_url: "https://api.binance.com".to_string(),
        }
    }

    fn sign(&self, query_string: &str) -> String {
        let mut mac = HmacSha256::new_from_slice(self.api_secret.as_bytes())
            .expect("HMAC can take key of any size");
        mac.update(query_string.as_bytes());
        hex::encode(mac.finalize().into_bytes())
    }

    fn get_timestamp(&self) -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64
    }

    fn map_status(&self, binance_status: &str) -> OrderStatus {
        match binance_status {
            "NEW" => OrderStatus::Accepted,
            "PARTIALLY_FILLED" => OrderStatus::PartiallyFilled,
            "FILLED" => OrderStatus::Filled,
            "CANCELED" => OrderStatus::Cancelled,
            "PENDING_CANCEL" => OrderStatus::Pending,
            "REJECTED" => OrderStatus::Rejected,
            "EXPIRED" => OrderStatus::Failed,
            _ => OrderStatus::Failed,
        }
    }
}

#[async_trait]
impl Exchange for BinanceClient {
    async fn place_order(&self, order: &Order) -> Result<ExchangeOrderResponse> {
        let url = format!("{}/api/v3/order", self.base_url);

        let side = match order.side {
            OrderSide::Buy => "BUY",
            OrderSide::Sell => "SELL",
        };

        let order_type = match order.order_type {
            OrderType::Market => "MARKET",
            OrderType::Limit => "LIMIT",
        };

        let mut query = format!(
            "symbol={}&side={}&type={}&quantity={}&timestamp={}",
            order.symbol,
            side,
            order_type,
            order.quantity,
            self.get_timestamp()
        );

        if let Some(price) = order.price {
            query.push_str(&format!("&price={}&timeInForce=GTC", price));
        }

        let signature = self.sign(&query);
        let full_query = format!("{}&signature={}", query, signature);

        let res = self
            .client
            .post(&format!("{}?{}", url, full_query))
            .send()
            .await?
            .json::<Value>()
            .await?;

        if let Some(msg) = res.get("msg") {
            return Err(anyhow::anyhow!("Binance API error: {}", msg));
        }

        let exchange_order_id = res["orderId"]
            .as_i64()
            .map(|id| id.to_string())
            .context("Missing orderId in Binance response")?;

        let status = res["status"]
            .as_str()
            .map(|s| self.map_status(s))
            .unwrap_or(OrderStatus::Submitted);

        Ok(ExchangeOrderResponse {
            exchange_order_id,
            status,
            raw_response: res,
        })
    }

    async fn cancel_order(&self, symbol: &str, exchange_order_id: &str) -> Result<()> {
        let url = format!("{}/api/v3/order", self.base_url);
        let query = format!(
            "symbol={}&orderId={}&timestamp={}",
            symbol,
            exchange_order_id,
            self.get_timestamp()
        );

        let signature = self.sign(&query);
        let full_query = format!("{}&signature={}", query, signature);

        let res = self
            .client
            .delete(&format!("{}?{}", url, full_query))
            .send()
            .await?
            .json::<Value>()
            .await?;

        if let Some(msg) = res.get("msg") {
            return Err(anyhow::anyhow!("Binance API error: {}", msg));
        }

        Ok(())
    }

    async fn get_order_status(&self, symbol: &str, exchange_order_id: &str) -> Result<OrderStatus> {
        let url = format!("{}/api/v3/order", self.base_url);
        let query = format!(
            "symbol={}&orderId={}&timestamp={}",
            symbol,
            exchange_order_id,
            self.get_timestamp()
        );

        let signature = self.sign(&query);
        let full_query = format!("{}&signature={}", query, signature);

        let res = self
            .client
            .get(&format!("{}?{}", url, full_query))
            .send()
            .await?
            .json::<Value>()
            .await?;

        if let Some(msg) = res.get("msg") {
            return Err(anyhow::anyhow!("Binance API error: {}", msg));
        }

        let status = res["status"]
            .as_str()
            .map(|s| self.map_status(s))
            .context("Missing status in Binance response")?;

        Ok(status)
    }

    async fn get_balance(&self, asset: &str) -> Result<Balance> {
        let url = format!("{}/api/v3/account", self.base_url);
        let query = format!("timestamp={}", self.get_timestamp());
        let signature = self.sign(&query);
        let full_query = format!("{}&signature={}", query, signature);

        let res = self
            .client
            .get(&format!("{}?{}", url, full_query))
            .send()
            .await?
            .json::<Value>()
            .await?;

        if let Some(msg) = res.get("msg") {
            return Err(anyhow::anyhow!("Binance API error: {}", msg));
        }

        let balances = res["balances"]
            .as_array()
            .context("Missing balances in Binance response")?;

        for b in balances {
            if b["asset"].as_str() == Some(asset) {
                let free = b["free"].as_str().unwrap_or("0").parse::<f64>()?;
                let locked = b["locked"].as_str().unwrap_or("0").parse::<f64>()?;
                return Ok(Balance {
                    asset: asset.to_string(),
                    free,
                    locked,
                });
            }
        }

        Ok(Balance {
            asset: asset.to_string(),
            free: 0.0,
            locked: 0.0,
        })
    }

    async fn get_price(&self, symbol: &str) -> Result<f64> {
        let url = format!("{}/api/v3/ticker/price", self.base_url);
        let query = format!("symbol={}", symbol);

        let res = self
            .client
            .get(&format!("{}?{}", url, query))
            .send()
            .await?
            .json::<Value>()
            .await?;

        if let Some(msg) = res.get("msg") {
            return Err(anyhow::anyhow!("Binance API error: {}", msg));
        }

        let price = res["price"]
            .as_str()
            .context("Missing price in Binance response")?
            .parse::<f64>()?;

        Ok(price)
    }
}
