use crate::types::order::{Order, OrderStatus};
pub fn should_skip_existing_order(existing_order: Option<&Order>) -> bool {
    match existing_order {
        Some(order) => !matches!(order.status, OrderStatus::Pending),
        None => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::order::{Order, OrderSide, OrderStatus, OrderType};
    use chrono::Utc;
    use uuid::Uuid;

    fn sample_order(status: OrderStatus) -> Order {
        Order {
            id: Uuid::new_v4(),
            bot_id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            signal_id: Some(Uuid::new_v4()),
            order_intent_id: Uuid::new_v4(),
            exchange: "binance".to_string(),
            symbol: "BTCUSDT".to_string(),
            side: OrderSide::Buy,
            order_type: OrderType::Market,
            quantity: 1.0,
            price: Some(100.0),
            status,
            exchange_order_id: None,
            idempotency_key: "intent-1".to_string(),
            raw_response: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }

    #[test]
    fn terminal_existing_order_should_skip_duplicate_intent() {
        let order = sample_order(OrderStatus::Filled);
        assert!(should_skip_existing_order(Some(&order)));
    }

    #[test]
    fn pending_existing_order_should_not_be_considered_completed_duplicate() {
        let order = sample_order(OrderStatus::Pending);
        assert!(!should_skip_existing_order(Some(&order)));
    }
}
