CREATE TABLE order_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    signal_id UUID REFERENCES scanner_signals(id),
    side VARCHAR(20) NOT NULL,
    order_type VARCHAR(50) NOT NULL,
    quantity NUMERIC(30, 8) NOT NULL,
    price NUMERIC(30, 8),
    status VARCHAR(50) DEFAULT 'created',
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add order_intent_id to orders
ALTER TABLE orders ADD COLUMN order_intent_id UUID REFERENCES order_intents(id);
