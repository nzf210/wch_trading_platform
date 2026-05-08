-- Add unique constraint to positions for upsert
ALTER TABLE positions ADD CONSTRAINT positions_bot_id_symbol_unique UNIQUE (bot_id, symbol);
