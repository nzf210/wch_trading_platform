-- Add max drawdown support to risk settings
ALTER TABLE risk_settings ADD COLUMN max_drawdown_percent NUMERIC(10, 4);
