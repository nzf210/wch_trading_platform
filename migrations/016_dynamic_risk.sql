-- Add trailing stop support to risk settings
ALTER TABLE risk_settings ADD COLUMN trailing_stop_percent NUMERIC(10, 4);

-- Enhance positions with high water mark for trailing stops
ALTER TABLE positions ADD COLUMN high_water_mark NUMERIC(30, 8) DEFAULT 0;
ALTER TABLE positions ADD COLUMN stop_loss_price NUMERIC(30, 8);
ALTER TABLE positions ADD COLUMN take_profit_price NUMERIC(30, 8);
