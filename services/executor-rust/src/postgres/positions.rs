use crate::types::position::Position;
use anyhow::Result;
use sqlx::{Pool, Postgres};

pub async fn get_open_positions(pool: &Pool<Postgres>) -> Result<Vec<Position>> {
    let positions = sqlx::query_as::<_, Position>(
        "SELECT id, bot_id, user_id, symbol, side, quantity,
         average_entry_price,
         high_water_mark,
         stop_loss_price,
         take_profit_price,
         unrealized_pnl,
         realized_pnl,
         updated_at FROM positions WHERE quantity > 0",
    )
    .fetch_all(pool)
    .await?;
    Ok(positions)
}

pub async fn update_position(pool: &Pool<Postgres>, pos: &Position) -> Result<()> {
    sqlx::query(
        "UPDATE positions SET 
         high_water_mark = $1, 
         stop_loss_price = $2, 
         take_profit_price = $3, 
         unrealized_pnl = $4, 
         updated_at = NOW() 
         WHERE id = $5",
    )
    .bind(pos.high_water_mark)
    .bind(pos.stop_loss_price)
    .bind(pos.take_profit_price)
    .bind(pos.unrealized_pnl)
    .bind(pos.id)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn upsert_position_on_fill(
    pool: &Pool<Postgres>,
    bot_id: &uuid::Uuid,
    user_id: &uuid::Uuid,
    symbol: &str,
    side: &str,
    quantity: f64,
    price: f64,
    sl_percent: Option<f64>,
    tp_percent: Option<f64>,
) -> Result<()> {
    let side_lower = side.to_lowercase();

    // Calculate initial SL/TP prices if provided
    let stop_loss_price = sl_percent.map(|p| {
        if side_lower == "buy" {
            price * (1.0 - p / 100.0)
        } else {
            price * (1.0 + p / 100.0)
        }
    });
    let take_profit_price = tp_percent.map(|p| {
        if side_lower == "buy" {
            price * (1.0 + p / 100.0)
        } else {
            price * (1.0 - p / 100.0)
        }
    });

    sqlx::query(
        "INSERT INTO positions (bot_id, user_id, symbol, side, quantity, average_entry_price, high_water_mark, stop_loss_price, take_profit_price)
         VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8)
         ON CONFLICT (bot_id, symbol) DO UPDATE SET
         quantity = positions.quantity + EXCLUDED.quantity,
         average_entry_price = (positions.average_entry_price * positions.quantity + EXCLUDED.average_entry_price * EXCLUDED.quantity) / (positions.quantity + EXCLUDED.quantity),
         updated_at = NOW()",
    )
    .bind(bot_id)
    .bind(user_id)
    .bind(symbol)
    .bind(side_lower)
    .bind(quantity)
    .bind(price)
    .bind(stop_loss_price)
    .bind(take_profit_price)
    .execute(pool)
    .await?;

    Ok(())
}
