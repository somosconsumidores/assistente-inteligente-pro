
-- Create table for caching product price data
CREATE TABLE IF NOT EXISTS product_price_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  brand TEXT,
  prices JSONB DEFAULT '[]'::jsonb,
  average_price NUMERIC DEFAULT 0,
  min_price NUMERIC DEFAULT 0,
  max_price NUMERIC DEFAULT 0,
  confidence_level TEXT DEFAULT 'estimated',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_price_cache_key ON product_price_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_product_price_cache_updated ON product_price_cache(last_updated);

-- Enable RLS
ALTER TABLE product_price_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access for price data
CREATE POLICY "Allow public read access to price cache" ON product_price_cache
FOR SELECT USING (true);
