use crate::app::App;
use crate::postgres::inbox::{is_processed, save_inbox_event};
use crate::types::order::OrderIntent;
use futures::StreamExt;
use redis::AsyncCommands;
use serde::Deserialize;
use serde_json::Value;
use std::sync::Arc;
use tracing::{error, info};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
struct OrderIntentEnvelope {
    correlation_id: Option<String>,
    payload: OrderIntent,
}

struct IncomingOrderIntent {
    payload: OrderIntent,
    correlation_id: String,
}

pub async fn start_event_consumer(app: Arc<App>, redis_url: &str) -> anyhow::Result<()> {
    let client = redis::Client::open(redis_url)?;
    let conn = client.get_async_connection().await?;
    let mut pubsub = conn.into_pubsub();

    // Subscribe to streams/channels
    pubsub.subscribe("stream.control-events").await?;
    pubsub.subscribe("stream.trade-events").await?;

    info!("Starting Event PubSub consumer...");

    let mut stream = pubsub.on_message();
    while let Some(msg) = stream.next().await {
        let payload: String = msg.get_payload()?;
        let envelope: Value = serde_json::from_str(&payload)?;

        let event_id_str = envelope["event_id"].as_str().unwrap_or_default();
        let event_id = Uuid::parse_str(event_id_str).unwrap_or_default();
        let event_type = envelope["event_type"].as_str().unwrap_or_default();
        let correlation_id = envelope["correlation_id"].as_str().unwrap_or("unknown");
        let causation_id = envelope["causation_id"].as_str().unwrap_or("unknown");

        let span = tracing::info_span!(
            "process_event",
            event_id = %event_id,
            event_type = %event_type,
            correlation_id = %correlation_id,
            causation_id = %causation_id
        );
        let _guard = span.enter();

        // 1. Check Inbox for dedup
        if is_processed(&app.db.pool, &event_id).await? {
            info!("Event already processed, skipping");
            continue;
        }

        info!("Processing event");

        // 2. Process based on type
        match event_type {
            "bot.status_changed" => {
                // Example: If bot is paused, we might want to cancel open orders
                info!(
                    "Bot status changed event received: {:?}",
                    envelope["payload"]
                );
            }
            _ => {
                info!("Unhandled event type: {}", event_type);
            }
        }

        // 3. Mark as processed in Inbox
        save_inbox_event(
            &app.db.pool,
            &event_id,
            event_type,
            &envelope["payload"],
            &envelope["metadata"],
        )
        .await?;
    }

    Ok(())
}

pub async fn start_order_intent_consumer(app: Arc<App>, redis_url: &str) -> anyhow::Result<()> {
    let client = redis::Client::open(redis_url)?;
    let mut conn = client.get_async_connection().await?;

    info!("Starting Order Intent queue consumer...");

    loop {
        let result: Option<(String, String)> = conn.blpop("order_intents", 0.0).await?;

        if let Some((_, json)) = result {
            match deserialize_order_intent_message(&json) {
                Ok(intent) => {
                    let span = tracing::info_span!(
                        "process_intent",
                        intent_id = %intent.payload.id,
                        correlation_id = %intent.correlation_id
                    );
                    let _guard = span.enter();

                    info!("Received order intent");
                    if let Err(e) = app.process_intent(intent.payload, intent.correlation_id).await {
                        error!("Failed to process intent: {:?}", e);
                    }
                }
                Err(e) => {
                    error!("Failed to deserialize intent: {:?}", e);
                }
            }
        }
    }
}

fn deserialize_order_intent_message(json: &str) -> anyhow::Result<IncomingOrderIntent> {
    if let Ok(intent) = serde_json::from_str::<OrderIntent>(json) {
        return Ok(IncomingOrderIntent {
            correlation_id: intent.id.to_string(),
            payload: intent,
        });
    }

    let envelope = serde_json::from_str::<OrderIntentEnvelope>(json)?;
    Ok(IncomingOrderIntent {
        correlation_id: envelope
            .correlation_id
            .unwrap_or_else(|| envelope.payload.id.to_string()),
        payload: envelope.payload,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::order::OrderSide;
    use chrono::{TimeZone, Utc};

    fn sample_raw_intent_json() -> &'static str {
        r#"{
            "id":"550e8400-e29b-41d4-a716-446655440000",
            "bot_id":"550e8400-e29b-41d4-a716-446655440001",
            "user_id":"550e8400-e29b-41d4-a716-446655440002",
            "signal_id":"550e8400-e29b-41d4-a716-446655440003",
            "side":"buy",
            "order_type":"market",
            "quantity":0.1,
            "price":100.5,
            "status":"created",
            "reason":"trend breakout",
            "created_at":"2026-05-08T12:00:00Z"
        }"#
    }

    #[test]
    fn deserializes_raw_order_intent_payload() {
        let intent = deserialize_order_intent_message(sample_raw_intent_json())
            .expect("raw intent should deserialize");

        assert_eq!(intent.quantity, 0.1);
        assert_eq!(intent.payload.reason.as_deref(), Some("trend breakout"));
        assert_eq!(
            intent.correlation_id,
            "550e8400-e29b-41d4-a716-446655440000".to_string()
        );
        assert_eq!(
            intent.payload.created_at,
            Utc.with_ymd_and_hms(2026, 5, 8, 12, 0, 0).unwrap()
        );
    }

    #[test]
    fn deserializes_enveloped_order_intent_payload() {
        let payload = sample_raw_intent_json().replace('\n', "");
        let envelope = format!(
            r#"{{
                "event_id":"550e8400-e29b-41d4-a716-446655440010",
                "event_type":"order.intent.created",
                "event_version":"v2",
                "occurred_at":"2026-05-08T12:00:01Z",
                "producer":"scanner-go",
                "tenant_id":null,
                "user_id":"550e8400-e29b-41d4-a716-446655440002",
                "bot_id":"550e8400-e29b-41d4-a716-446655440001",
                "correlation_id":"corr-1",
                "causation_id":"550e8400-e29b-41d4-a716-446655440003",
                "idempotency_key":"dedup-1",
                "payload": {}
            }}"#,
            payload
        );

        let intent = deserialize_order_intent_message(&envelope)
            .expect("enveloped intent should deserialize");

        assert_eq!(intent.payload.quantity, 0.1);
        assert_eq!(intent.payload.side, OrderSide::Buy);
        assert_eq!(intent.correlation_id, "corr-1");
    }
}
