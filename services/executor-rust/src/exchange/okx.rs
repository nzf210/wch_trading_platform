use super::{Balance, Exchange, ExchangeOrderResponse};
use crate::types::order::{Order, OrderSide, OrderStatus, OrderType};
use anyhow::{Context, Result};
use async_trait::async_trait;
use base64::{engine::general_purpose, Engine as _};
use chrono::{SecondsFormat, Utc};
use hmac::{Hmac, Mac};
use reqwest::Client;
use serde_json::{json, Value};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

pub struct OkxClient {
    client: Client,
    api_key: String,
    api_secret: String,
    passphrase: String,
    base_url: String,
}

impl OkxClient {
    pub fn new(api_key: String, api_secret: String, passphrase: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
            api_secret,
            passphrase,
            base_url: "https://www.okx.com".to_string(),
        }
    }

    fn sign(&self, timestamp: &str, method: &str, path: &str, body: &str) -> String {
        let mut mac = HmacSha256::new_from_slice(self.api_secret.as_bytes())
            .expect("HMAC can take key of any size");
        let data = format!("{}{}{}{}", timestamp, method, path, body);
        mac.update(data.as_bytes());
        general_purpose::STANDARD.encode(mac.finalize().into_bytes())
    }

    fn get_timestamp(&self) -> String {
        Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true)
    }

    fn map_status(&self, okx_status: &str) -> OrderStatus {
        match okx_status {
            "live" => OrderStatus::Accepted,
            "partially_filled" => OrderStatus::PartiallyFilled,
            "filled" => OrderStatus::Filled,
            "canceled" => OrderStatus::Cancelled,
            _ => OrderStatus::Failed,
        }
    }

    async fn request(
        &self,
        method: reqwest::Method,
        path: &str,
        body: Option<Value>,
    ) -> Result<Value> {
        let url = format!("{}{}", self.base_url, path);
        let timestamp = self.get_timestamp();
        let method_str = method.as_str();

        let body_str = if let Some(ref b) = body {
            b.to_string()
        } else {
            "".to_string()
        };

        let signature = self.sign(&timestamp, method_str, path, &body_str);

        let mut req = self
            .client
            .request(method, &url)
            .header("OK-ACCESS-KEY", &self.api_key)
            .header("OK-ACCESS-SIGN", signature)
            .header("OK-ACCESS-TIMESTAMP", timestamp)
            .header("OK-ACCESS-PASSPHRASE", &self.passphrase);

        if let Some(b) = body {
            req = req.json(&b);
        }

        let res = req.send().await?.json::<Value>().await?;

        if res["code"] != "0" {
            return Err(anyhow::anyhow!(
                "OKX API error: {} ({})",
                res["msg"],
                res["code"]
            ));
        }

        Ok(res)
    }
}

#[async_trait]
impl Exchange for OkxClient {
    async fn place_order(&self, order: &Order) -> Result<ExchangeOrderResponse> {
        let side = match order.side {
            OrderSide::Buy => "buy",
            OrderSide::Sell => "sell",
        };

        let order_type = match order.order_type {
            OrderType::Market => "market",
            OrderType::Limit => "limit",
        };

        let mut body = json!({
            "instId": order.symbol,
            "tdMode": "cash",
            "side": side,
            "ordType": order_type,
            "sz": order.quantity.to_string(),
        });

        if let Some(price) = order.price {
            body["px"] = json!(price.to_string());
        }

        let res = self
            .request(reqwest::Method::POST, "/api/v5/trade/order", Some(body))
            .await?;
        let data = &res["data"][0];

        let exchange_order_id = data["ordId"]
            .as_str()
            .context("Missing ordId in OKX response")?
            .to_string();

        Ok(ExchangeOrderResponse {
            exchange_order_id,
            status: OrderStatus::Submitted,
            raw_response: res,
        })
    }

    async fn cancel_order(&self, symbol: &str, exchange_order_id: &str) -> Result<()> {
        let body = json!({
            "instId": symbol,
            "ordId": exchange_order_id,
        });

        self.request(
            reqwest::Method::POST,
            "/api/v5/trade/cancel-order",
            Some(body),
        )
        .await?;
        Ok(())
    }

    async fn get_order_status(&self, symbol: &str, exchange_order_id: &str) -> Result<OrderStatus> {
        let path = format!(
            "/api/v5/trade/order?instId={}&ordId={}",
            symbol, exchange_order_id
        );
        let res = self.request(reqwest::Method::GET, &path, None).await?;

        let status_str = res["data"][0]["state"]
            .as_str()
            .context("Missing state in OKX response")?;

        Ok(self.map_status(status_str))
    }

    async fn get_balance(&self, asset: &str) -> Result<Balance> {
        let path = format!("/api/v5/account/balance?ccy={}", asset);
        let res = self.request(reqwest::Method::GET, &path, None).await?;

        let details = res["data"][0]["details"]
            .as_array()
            .context("Missing details in OKX response")?;

        for detail in details {
            if detail["ccy"].as_str() == Some(asset) {
                let free = detail["availBal"].as_str().unwrap_or("0").parse::<f64>()?;
                let frozen = detail["frozenBal"].as_str().unwrap_or("0").parse::<f64>()?;
                return Ok(Balance {
                    asset: asset.to_string(),
                    free,
                    locked: frozen,
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
        let path = format!("/api/v5/market/ticker?instId={}", symbol);
        let res = self.request(reqwest::Method::GET, &path, None).await?;

        let price = res["data"][0]["last"]
            .as_str()
            .context("Missing last in OKX response")?
            .parse::<f64>()?;

        Ok(price)
    }
}
