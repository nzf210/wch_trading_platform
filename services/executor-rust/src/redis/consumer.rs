use crate::app::App;
use crate::postgres::inbox::{is_processed, save_inbox_event};
use crate::types::event::*;
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
    pubsub.subscribe("stream.market-events").await?;

    info!("Starting Event PubSub consumer...");

    let mut stream = pubsub.on_message();
    while let Some(msg) = stream.next().await {
        let payload: String = msg.get_payload()?;
        let envelope: Value = match serde_json::from_str(&payload) {
            Ok(v) => v,
            Err(e) => {
                error!("Failed to parse event envelope: {:?}", e);
                continue;
            }
        };

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

        // 2. Process based on type
        match event_type {
            EVENT_TYPE_BOT_PAUSED | EVENT_TYPE_BOT_STOPPED | "bot.status_changed" => {
                info!("Bot status control event received: {}", event_type);
                // Implementation for cancelling open orders could go here
            }
            // Explicitly ignore events we know about but don't need to act on in executor
            EVENT_TYPE_BOT_CREATED
            | EVENT_TYPE_BOT_ACTIVATED
            | EVENT_TYPE_RISK_CHECK_PASSED
            | EVENT_TYPE_RISK_CHECK_FAILED
            | EVENT_TYPE_ORDER_SUBMITTED
            | EVENT_TYPE_ORDER_ACCEPTED
            | EVENT_TYPE_ORDER_REJECTED
            | EVENT_TYPE_EXECUTION_FILLED
            | EVENT_TYPE_EXECUTION_PARTIALLY_FILLED
            | EVENT_TYPE_EXECUTION_FAILED
            | EVENT_TYPE_SIGNAL_GENERATED
            | EVENT_TYPE_ORDER_INTENT_CREATED => {
                // These are logged for visibility but no action needed
                info!("Event acknowledged: {}", event_type);
            }
            _ => {
                info!("Unhandled event type: {}", event_type);
            }
        }

        // 3. Mark as processed in Inbox
        if let Err(e) = save_inbox_event(
            &app.db.pool,
            &event_id,
            event_type,
            &envelope["payload"],
            &envelope["metadata"],
        )
        .await {
            error!("Failed to save inbox event: {:?}", e);
        }
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
                    let event_id = match get_event_id_from_json(&json) {
                        Some(id) => id,
                        None => intent.payload.id,
                    };

                    let span = tracing::info_span!(
                        "process_intent",
                        intent_id = %intent.payload.id,
                        event_id = %event_id,
                        correlation_id = %intent.correlation_id
                    );
                    let _guard = span.enter();

                    // 1. Check Inbox
                    match is_processed(&app.db.pool, &event_id).await {
                        Ok(true) => {
                            info!("Order intent (event_id: {}) already processed, skipping", event_id);
                            continue;
                        }
                        Err(e) => {
                            error!("Failed to check inbox: {:?}", e);
                            continue;
                        }
                        _ => {}
                    }

                    info!("Received order intent");
                    if let Err(e) = app.process_intent(intent.payload.clone(), intent.correlation_id.clone()).await {
                        error!("Failed to process intent: {:?}", e);
                    } else {
                        // 2. Mark as processed in Inbox
                        if let Err(e) = save_inbox_event(
                            &app.db.pool,
                            &event_id,
                            EVENT_TYPE_ORDER_INTENT_CREATED,
                            &serde_json::to_value(&intent.payload).unwrap_or_default(),
                            &serde_json::json!({"correlation_id": intent.correlation_id}),
                        ).await {
                            error!("Failed to save inbox event: {:?}", e);
                        }
                    }
                }
                Err(e) => {
                    error!("Failed to deserialize intent: {:?}", e);
                }
            }
        }
    }
}

fn get_event_id_from_json(json: &str) -> Option<Uuid> {
    let v: Value = serde_json::from_str(json).ok()?;
    v["event_id"]
        .as_str()
        .and_then(|id| Uuid::parse_str(id).ok())
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
