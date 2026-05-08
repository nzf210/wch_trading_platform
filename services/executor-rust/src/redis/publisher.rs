use crate::types::event::{
    EventEnvelope, EVENT_TYPE_EXECUTION_FAILED, EVENT_TYPE_EXECUTION_FILLED,
    EVENT_TYPE_EXECUTION_PARTIALLY_FILLED, EVENT_TYPE_ORDER_ACCEPTED, EVENT_TYPE_ORDER_REJECTED,
    EVENT_TYPE_ORDER_SUBMITTED, EVENT_TYPE_RISK_CHECK_FAILED, EVENT_TYPE_RISK_CHECK_PASSED,
};
use anyhow::Result;
use chrono::Utc;
use redis::AsyncCommands;
use serde::Serialize;
use serde_json::Value;
use sqlx::PgPool;
use uuid::Uuid;

pub struct EventPublisher {
    redis_url: String,
    producer: String,
}

impl EventPublisher {
    pub fn new(redis_url: String, producer: impl Into<String>) -> Self {
        Self {
            redis_url,
            producer: producer.into(),
        }
    }

    pub async fn publish<T: Serialize>(
        &self,
        pool: &PgPool,
        event_type: &str,
        payload: &T,
        metadata: Value,
        context: PublishContext,
    ) -> Result<Uuid> {
        let payload_json = serde_json::to_value(payload)?;
        let event_id = Uuid::new_v4();
        let envelope = EventEnvelope {
            event_id: event_id.to_string(),
            event_type: event_type.to_string(),
            event_version: "v2".to_string(),
            occurred_at: Utc::now(),
            producer: self.producer.clone(),
            tenant_id: context.tenant_id,
            user_id: context.user_id,
            bot_id: context.bot_id,
            correlation_id: context.correlation_id,
            causation_id: context.causation_id,
            idempotency_key: context.idempotency_key,
            payload: payload_json.clone(),
        };

        let data = serde_json::to_value(&envelope)?;
        let mut message = match data {
            Value::Object(map) => map,
            _ => unreachable!("event envelope should serialize to an object"),
        };
        message.insert("metadata".to_string(), metadata.clone());
        let message = Value::Object(message);

        self.save_outbox_event(pool, &event_id, event_type, &payload_json, &metadata)
            .await?;

        let channel = map_stream(event_type);
        if let Err(err) = self.publish_to_redis(channel, &message).await {
            self.mark_outbox_retry(pool, &event_id).await?;
            return Err(err);
        }

        self.mark_outbox_processed(pool, &event_id).await?;
        Ok(event_id)
    }

    async fn save_outbox_event(
        &self,
        pool: &PgPool,
        event_id: &Uuid,
        event_type: &str,
        payload: &Value,
        metadata: &Value,
    ) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO outbox_events (id, event_type, payload, metadata, status, retry_count, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            "#,
        )
        .bind(event_id)
        .bind(event_type)
        .bind(payload)
        .bind(metadata)
        .bind("pending")
        .bind(0_i32)
        .execute(pool)
        .await?;

        Ok(())
    }

    async fn publish_to_redis(&self, channel: &str, message: &Value) -> Result<()> {
        let client = redis::Client::open(self.redis_url.clone())?;
        let mut conn = client.get_async_connection().await?;
        let payload = serde_json::to_string(message)?;
        conn.publish::<_, _, ()>(channel, payload).await?;
        Ok(())
    }

    async fn mark_outbox_processed(&self, pool: &PgPool, event_id: &Uuid) -> Result<()> {
        sqlx::query(
            "UPDATE outbox_events SET status = 'processed', processed_at = NOW() WHERE id = $1",
        )
        .bind(event_id)
        .execute(pool)
        .await?;
        Ok(())
    }

    async fn mark_outbox_retry(&self, pool: &PgPool, event_id: &Uuid) -> Result<()> {
        sqlx::query("UPDATE outbox_events SET retry_count = retry_count + 1 WHERE id = $1")
            .bind(event_id)
            .execute(pool)
            .await?;
        Ok(())
    }
}

#[derive(Default)]
pub struct PublishContext {
    pub tenant_id: Option<String>,
    pub user_id: Option<String>,
    pub bot_id: Option<String>,
    pub correlation_id: String,
    pub causation_id: Option<String>,
    pub idempotency_key: String,
}

pub fn map_stream(event_type: &str) -> &'static str {
    match event_type {
        EVENT_TYPE_RISK_CHECK_PASSED | EVENT_TYPE_RISK_CHECK_FAILED => "stream.control-events",
        EVENT_TYPE_ORDER_SUBMITTED
        | EVENT_TYPE_ORDER_ACCEPTED
        | EVENT_TYPE_ORDER_REJECTED
        | EVENT_TYPE_EXECUTION_FILLED
        | EVENT_TYPE_EXECUTION_PARTIALLY_FILLED
        | EVENT_TYPE_EXECUTION_FAILED => "stream.trade-events",
        _ => "stream.control-events",
    }
}
