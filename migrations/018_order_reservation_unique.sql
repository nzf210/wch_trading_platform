-- Prevent duplicate execution for the same intent by making reservation canonical.
ALTER TABLE orders
    ADD CONSTRAINT orders_order_intent_id_unique UNIQUE (order_intent_id);
