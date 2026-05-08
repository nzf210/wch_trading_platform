CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chain VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    price_wch NUMERIC(30, 8) NOT NULL,
    max_live_bots INT NOT NULL DEFAULT 0,
    max_paper_bots INT NOT NULL DEFAULT 1,
    features JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    status VARCHAR(50) DEFAULT 'active',
    paid_amount_wch NUMERIC(30, 8),
    started_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE exchange_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exchange VARCHAR(50) NOT NULL,
    label VARCHAR(100),
    api_key_encrypted TEXT NOT NULL,
    api_secret_encrypted TEXT NOT NULL,
    passphrase_encrypted TEXT,
    permissions JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exchange_account_id UUID REFERENCES exchange_accounts(id),
    name VARCHAR(150) NOT NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'paper',
    strategy VARCHAR(50) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    quote_asset VARCHAR(20) DEFAULT 'USDT',
    capital NUMERIC(30, 8) NOT NULL,
    status VARCHAR(50) DEFAULT 'paused',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE risk_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    max_position_size NUMERIC(30, 8),
    max_daily_loss NUMERIC(30, 8),
    stop_loss_percent NUMERIC(10, 4),
    take_profit_percent NUMERIC(10, 4),
    emergency_stop BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scanner_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exchange VARCHAR(50),
    symbol VARCHAR(50),
    strategy VARCHAR(50),
    action VARCHAR(20),
    price NUMERIC(30, 8),
    confidence NUMERIC(10, 4),
    payload JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    signal_id UUID REFERENCES scanner_signals(id),
    exchange VARCHAR(50),
    symbol VARCHAR(50),
    side VARCHAR(20),
    order_type VARCHAR(50),
    quantity NUMERIC(30, 8),
    price NUMERIC(30, 8),
    status VARCHAR(50),
    exchange_order_id VARCHAR(255),
    idempotency_key VARCHAR(255) UNIQUE,
    raw_response JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filled_quantity NUMERIC(30, 8),
    average_price NUMERIC(30, 8),
    fee NUMERIC(30, 8),
    pnl NUMERIC(30, 8),
    status VARCHAR(50),
    executed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wch_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id),
    tx_hash VARCHAR(255),
    type VARCHAR(50),
    amount NUMERIC(30, 8),
    status VARCHAR(50) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bot_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    level VARCHAR(50),
    message TEXT,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(150),
    resource_type VARCHAR(100),
    resource_id UUID,
    ip_address VARCHAR(100),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO plans (name, code, price_wch, max_live_bots, max_paper_bots, features) VALUES
('Free', 'free', 0, 0, 1, '{"paper_trading": true, "live_trading": false}'),
('Starter', 'starter', 100, 1, 3, '{"paper_trading": true, "live_trading": true, "dca": true}'),
('Pro', 'pro', 500, 5, 10, '{"paper_trading": true, "live_trading": true, "dca": true, "grid": true, "webhook": true}'),
('Elite', 'elite', 1500, 20, 50, '{"paper_trading": true, "live_trading": true, "dca": true, "grid": true, "webhook": true, "ai_report": true}');
