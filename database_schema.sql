-- ETH Data Table for Supabase
-- Run this SQL in your Supabase SQL Editor to create the eth_market_history table

CREATE TABLE IF NOT EXISTS eth_market_history (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    usd DECIMAL(20, 8) NOT NULL,
    usd_market_cap BIGINT NOT NULL,
    usd_24h_vol BIGINT NOT NULL,
    usd_24h_change DECIMAL(10, 4) NOT NULL,
    last_updated_at BIGINT NOT NULL
);

-- Create index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_eth_market_history_created_at ON eth_market_history(created_at);

-- Create index on last_updated_at for querying by CoinGecko update time
CREATE INDEX IF NOT EXISTS idx_eth_market_history_last_updated_at ON eth_market_history(last_updated_at);

-- Optional: Enable Row Level Security (RLS) if needed
-- ALTER TABLE eth_market_history ENABLE ROW LEVEL SECURITY;

-- Optional: Create a policy for authenticated users (adjust as needed)
-- CREATE POLICY "Allow authenticated users to read eth_market_history"
-- ON eth_market_history FOR SELECT
-- TO authenticated
-- USING (true);

-- Optional: Create a policy for service role to insert data
-- CREATE POLICY "Allow service role to insert eth_market_history"
-- ON eth_market_history FOR INSERT
-- TO service_role
-- WITH CHECK (true);

-- Technical Analysis Table for Supabase
-- Run this SQL in your Supabase SQL Editor to create the technical_analysis table

CREATE TABLE IF NOT EXISTS technical_analysis (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    symbol VARCHAR(10) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    price_change DECIMAL(20, 8) DEFAULT 0,
    price_change_percent DECIMAL(10, 4) DEFAULT 0,
    overall_summary VARCHAR(50) DEFAULT 'Neutral',
    technical_indicators_summary VARCHAR(50) DEFAULT 'Neutral',
    moving_averages_summary VARCHAR(50) DEFAULT 'Neutral',
    technical_indicators JSONB,
    moving_averages JSONB,
    pivot_points JSONB,
    source_url TEXT NOT NULL,
    scraped_at TIMESTAMPTZ NOT NULL
);

-- Create indexes for technical analysis table
CREATE INDEX IF NOT EXISTS idx_technical_analysis_created_at ON technical_analysis(created_at);
CREATE INDEX IF NOT EXISTS idx_technical_analysis_symbol ON technical_analysis(symbol);
CREATE INDEX IF NOT EXISTS idx_technical_analysis_scraped_at ON technical_analysis(scraped_at);
CREATE INDEX IF NOT EXISTS idx_technical_analysis_overall_summary ON technical_analysis(overall_summary);

-- Optional: Create policies for technical analysis table
-- CREATE POLICY "Allow authenticated users to read technical_analysis"
-- ON technical_analysis FOR SELECT
-- TO authenticated
-- USING (true);

-- CREATE POLICY "Allow service role to insert technical_analysis"
-- ON technical_analysis FOR INSERT
-- TO service_role
-- WITH CHECK (true);