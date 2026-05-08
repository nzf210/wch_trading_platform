use crate::types::execution::Execution;
use anyhow::Result;
use sqlx::PgPool;
use uuid::Uuid;

pub async fn save_execution(pool: &PgPool, execution: &Execution) -> Result<()> {
    sqlx::query(
        r#"
        INSERT INTO executions (
            id,
            order_id,
            bot_id,
            user_id,
            filled_quantity,
            average_price,
            fee,
            pnl,
            status,
            executed_at,
            created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
            filled_quantity = EXCLUDED.filled_quantity,
            average_price = EXCLUDED.average_price,
            fee = EXCLUDED.fee,
            pnl = EXCLUDED.pnl,
            status = EXCLUDED.status,
            executed_at = EXCLUDED.executed_at
        "#,
    )
    .bind(execution.id)
    .bind(execution.order_id)
    .bind(execution.bot_id)
    .bind(execution.user_id)
    .bind(execution.filled_quantity)
    .bind(execution.average_price)
    .bind(execution.fee)
    .bind(execution.pnl)
    .bind(execution.status.clone())
    .bind(execution.executed_at)
    .bind(execution.created_at)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_execution_by_order_id(
    pool: &PgPool,
    order_id: &Uuid,
) -> Result<Option<Execution>> {
    let execution = sqlx::query_as::<_, Execution>(
        r#"
        SELECT
            id,
            order_id,
            bot_id,
            user_id,
            filled_quantity,
            average_price,
            fee,
            pnl,
            status,
            executed_at,
            created_at
        FROM executions
        WHERE order_id = $1
        "#,
    )
    .bind(order_id)
    .fetch_optional(pool)
    .await?;

    Ok(execution)
}
