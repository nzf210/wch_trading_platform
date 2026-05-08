use anyhow::Result;
use sqlx::PgPool;
use uuid::Uuid;

pub async fn is_processed(pool: &PgPool, event_id: &Uuid) -> Result<bool> {
    let exists: bool =
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM inbox_events WHERE id = $1)")
            .bind(event_id)
            .fetch_one(pool)
            .await?;

    Ok(exists)
}

pub async fn save_inbox_event(
    pool: &PgPool,
    id: &Uuid,
    event_type: &str,
    payload: &serde_json::Value,
    metadata: &serde_json::Value,
) -> Result<()> {
    sqlx::query(
        r#"
        INSERT INTO inbox_events (
            id, event_type, payload, metadata, status, delivery_attempts, last_error, created_at, processed_at
        )
        VALUES ($1, $2, $3, $4, $5, 1, NULL, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            event_type = EXCLUDED.event_type,
            payload = EXCLUDED.payload,
            metadata = EXCLUDED.metadata,
            status = EXCLUDED.status,
            processed_at = NOW(),
            delivery_attempts = inbox_events.delivery_attempts + 1,
            last_error = NULL
        "#,
    )
    .bind(id)
    .bind(event_type)
    .bind(payload)
    .bind(metadata)
    .bind("processed")
    .execute(pool)
    .await?;

    Ok(())
}
