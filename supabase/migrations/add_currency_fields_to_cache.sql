
-- Adicionar colunas para conversão de moeda na tabela de cache
ALTER TABLE activity_price_cache 
ADD COLUMN IF NOT EXISTS estimated_price_brl TEXT,
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 4),
ADD COLUMN IF NOT EXISTS exchange_date DATE;

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_activity_price_cache_exchange_date 
ON activity_price_cache(exchange_date);
