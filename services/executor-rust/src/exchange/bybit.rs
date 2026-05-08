use super::{Balance, Exchange, ExchangeOrderResponse};
use crate::types::order::{Order, OrderSide, OrderStatus, OrderType};
use anyhow::{Context, Result};
use async_trait::async_trait;
use hmac::{Hmac, Mac};
use reqwest::Client;
use serde_json::{json, Value};
use sha2::Sha256;
use std::time::{SystemTime, UNIX_EPOCH};

type HmacSha256 = Hmac<Sha256>;

pub struct BybitClient {
    client: Client,
    api_key: String,
    api_secret: String,
    base_url: String,
}

impl BybitClient {
    pub fn new(api_key: String, api_secret: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
            api_secret,
            base_url: "https://api.bybit.com".to_string(),
        }
    }

    fn sign(&self, timestamp: &str, recv_window: &str, payload: &str) -> String {
        let mut mac = HmacSha256::new_from_slice(self.api_secret.as_bytes())
            .expect("HMAC can take key of any size");
        let data = format!("{}{}{}{}", timestamp, self.api_key, recv_window, payload);
        mac.update(data.as_bytes());
        hex::encode(mac.finalize().into_bytes())
    }

    fn get_timestamp(&self) -> String {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis()
            .to_string()
    }

    fn map_status(&self, bybit_status: &str) -> OrderStatus {
        match bybit_status {
            "New" => OrderStatus::Accepted,
            "PartiallyFilled" => OrderStatus::PartiallyFilled,
            "Filled" => OrderStatus::Filled,
            "Cancelled" => OrderStatus::Cancelled,
            "Rejected" => OrderStatus::Rejected,
            "Untriggered" => OrderStatus::Pending,
            "Deactivated" => OrderStatus::Failed,
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
        let recv_window = "5000";

        let payload = if let Some(ref b) = body {
            b.to_string()
        } else if method == reqwest::Method::GET {
            "".to_string() // Bybit GET signing is different if there are query params, but we'll handle simple ones or append to path
        } else {
            "".to_string()
        };

        // For GET with query params, the payload should be the query string
        // We'll handle this simply for now by assuming path might already have query params if it's a GET
        let sign_payload = if method == reqwest::Method::GET && path.contains('?') {
            path.split('?').nth(1).unwrap_or("")
        } else {
            &payload
        };

        let signature = self.sign(&timestamp, recv_window, sign_payload);

        let mut req = self
            .client
            .request(method, &url)
            .header("X-BAPI-API-KEY", &self.api_key)
            .header("X-BAPI-TIMESTAMP", &timestamp)
            .header("X-BAPI-RECV-WINDOW", recv_window)
            .header("X-BAPI-SIGN", signature);

        if let Some(b) = body {
            req = req.json(&b);
        }

        let res = req.send().await?.json::<Value>().await?;

        if res["retCode"] != 0 {
            return Err(anyhow::anyhow!(
                "Bybit API error: {} ({})",
                res["retMsg"],
                res["retCode"]
            ));
        }

        Ok(res)
    }
}

#[async_trait]
impl Exchange for BybitClient {
    async fn place_order(&self, order: &Order) -> Result<ExchangeOrderResponse> {
        let side = match order.side {
            OrderSide::Buy => "Buy",
            OrderSide::Sell => "Sell",
        };

        let order_type = match order.order_type {
            OrderType::Market => "Market",
            OrderType::Limit => "Limit",
        };

        let mut body = json!({
            "category": "spot",
            "symbol": order.symbol,
            "side": side,
            "orderType": order_type,
            "qty": order.quantity.to_string(),
        });

        if let Some(price) = order.price {
            body["price"] = json!(price.to_string());
        }

        let res = self
            .request(reqwest::Method::POST, "/v5/order/create", Some(body))
            .await?;
        let data = &res["result"];

        let exchange_order_id = data["orderId"]
            .as_str()
            .context("Missing orderId in Bybit response")?
            .to_string();

        Ok(ExchangeOrderResponse {
            exchange_order_id,
            status: OrderStatus::Submitted,
            raw_response: res,
        })
    }

    async fn cancel_order(&self, symbol: &str, exchange_order_id: &str) -> Result<()> {
        let body = json!({
            "category": "spot",
            "symbol": symbol,
            "orderId": exchange_order_id,
        });

        self.request(reqwest::Method::POST, "/v5/order/cancel", Some(body))
            .await?;
        Ok(())
    }

    async fn get_order_status(&self, symbol: &str, exchange_order_id: &str) -> Result<OrderStatus> {
        let path = format!(
            "/v5/order/realtime?category=spot&symbol={}&orderId={}",
            symbol, exchange_order_id
        );
        let res = self.request(reqwest::Method::GET, &path, None).await?;

        let status_str = res["result"]["list"][0]["orderStatus"]
            .as_str()
            .context("Missing orderStatus in Bybit response")?;

        Ok(self.map_status(status_str))
    }

    async fn get_balance(&self, asset: &str) -> Result<Balance> {
        let path = "/v5/account/wallet-balance?accountType=UNIFIED";
        let res = self.request(reqwest::Method::GET, path, None).await?;

        let list = res["result"]["list"]
            .as_array()
            .context("Missing result list in Bybit response")?;

        for account in list {
            let coins = account["coin"]
                .as_array()
                .context("Missing coin list in Bybit response")?;

            for coin in coins {
                if coin["coin"].as_str() == Some(asset) {
                    let free = coin["walletBalance"]
                        .as_str()
                        .unwrap_or("0")
                        .parse::<f64>()?;
                    let locked = coin["locked"].as_str().unwrap_or("0").parse::<f64>()?;
                    return Ok(Balance {
                        asset: asset.to_string(),
                        free,
                        locked,
                    });
                }
            }
        }

        Ok(Balance {
            asset: asset.to_string(),
            free: 0.0,
            locked: 0.0,
        })
    }

    async fn get_price(&self, symbol: &str) -> Result<f64> {
        let path = format!("/v5/market/tickers?category=spot&symbol={}", symbol);
        let res = self.request(reqwest::Method::GET, &path, None).await?;

        let price = res["result"]["list"][0]["lastPrice"]
            .as_str()
            .context("Missing lastPrice in Bybit response")?
            .parse::<f64>()?;

        Ok(price)
    }
}
