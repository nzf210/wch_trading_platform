use crate::types::order::{Order, OrderIntent, OrderStatus};
use anyhow::Result;
use sqlx::PgPool;
use uuid::Uuid;

pub async fn save_order_intent(pool: &PgPool, intent: &OrderIntent) -> Result<()> {
    sqlx::query(
        r#"
        INSERT INTO order_intents (id, bot_id, user_id, signal_id, side, order_type, quantity, price, status, reason, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET status = $9, reason = $10
        "#,
    )
    .bind(intent.id)
    .bind(intent.bot_id)
    .bind(intent.user_id)
    .bind(intent.signal_id)
    .bind(intent.side.clone())
    .bind(intent.order_type.clone())
    .bind(intent.quantity)
    .bind(intent.price)
    .bind(intent.status.clone())
    .bind(intent.reason.clone())
    .bind(intent.created_at)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn save_order(pool: &PgPool, order: &Order) -> Result<()> {
    sqlx::query(
        r#"
        INSERT INTO orders (id, bot_id, user_id, signal_id, order_intent_id, exchange, symbol, side, order_type, quantity, price, status, exchange_order_id, idempotency_key, raw_response, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        "#,
    )
    .bind(order.id)
    .bind(order.bot_id)
    .bind(order.user_id)
    .bind(order.signal_id)
    .bind(order.order_intent_id)
    .bind(order.exchange.clone())
    .bind(order.symbol.clone())
    .bind(order.side.clone())
    .bind(order.order_type.clone())
    .bind(order.quantity)
    .bind(order.price)
    .bind(order.status.clone())
    .bind(order.exchange_order_id.clone())
    .bind(order.idempotency_key.clone())
    .bind(order.raw_response.clone())
    .bind(order.created_at)
    .bind(order.updated_at)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn reserve_order(pool: &PgPool, order: &Order) -> Result<bool> {
    let rows_affected = sqlx::query(
        r#"
        INSERT INTO orders (id, bot_id, user_id, signal_id, order_intent_id, exchange, symbol, side, order_type, quantity, price, status, exchange_order_id, idempotency_key, raw_response, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (idempotency_key) DO NOTHING
        "#,
    )
    .bind(order.id)
    .bind(order.bot_id)
    .bind(order.user_id)
    .bind(order.signal_id)
    .bind(order.order_intent_id)
    .bind(order.exchange.clone())
    .bind(order.symbol.clone())
    .bind(order.side.clone())
    .bind(order.order_type.clone())
    .bind(order.quantity)
    .bind(order.price)
    .bind(order.status.clone())
    .bind(order.exchange_order_id.clone())
    .bind(order.idempotency_key.clone())
    .bind(order.raw_response.clone())
    .bind(order.created_at)
    .bind(order.updated_at)
    .execute(pool)
    .await?
    .rows_affected();

    Ok(rows_affected == 1)
}

pub async fn get_order_by_idempotency_key(pool: &PgPool, key: &str) -> Result<Option<Order>> {
    let order = sqlx::query_as::<_, Order>(
        r#"
        SELECT id, bot_id, user_id, signal_id, order_intent_id, exchange, symbol, side, order_type, quantity, price, status, exchange_order_id, idempotency_key, raw_response, created_at, updated_at
        FROM orders
        WHERE idempotency_key = $1
        "#,
    )
    .bind(key)
    .fetch_optional(pool)
    .await?;

    Ok(order)
}

pub async fn update_reserved_order(pool: &PgPool, order: &Order) -> Result<()> {
    sqlx::query(
        r#"
        UPDATE orders
        SET
            status = $2,
            exchange_order_id = $3,
            raw_response = $4,
            updated_at = $5
        WHERE id = $1
        "#,
    )
    .bind(order.id)
    .bind(order.status.clone())
    .bind(order.exchange_order_id.clone())
    .bind(order.raw_response.clone())
    .bind(order.updated_at)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_open_orders(pool: &PgPool) -> Result<Vec<Order>> {
    let rows = sqlx::query_as::<_, Order>(
        r#"
        SELECT id, bot_id, user_id, signal_id, order_intent_id, exchange, symbol, side, order_type, quantity, price, status, exchange_order_id, idempotency_key, raw_response, created_at, updated_at
        FROM orders
        WHERE status IN ('pending', 'submitted', 'accepted', 'partially_filled')
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(rows)
}

pub async fn update_order_status(
    pool: &PgPool,
    order_id: &Uuid,
    status: OrderStatus,
    exchange_order_id: Option<String>,
) -> Result<()> {
    sqlx::query(
        r#"
        UPDATE orders
        SET status = $2, exchange_order_id = COALESCE($3, exchange_order_id), updated_at = NOW()
        WHERE id = $1
        "#,
    )
    .bind(order_id)
    .bind(status)
    .bind(exchange_order_id)
    .execute(pool)
    .await?;

    Ok(())
}
