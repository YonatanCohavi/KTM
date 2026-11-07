-- Supabase SQL Schema for Member Weights per Browser
-- Run this in Supabase SQL Editor to persist question weights

-- Create browser_weights table to store member weights per browser UUID
CREATE TABLE IF NOT EXISTS browser_weights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    browser_id VARCHAR(255) NOT NULL UNIQUE,
    member_weights JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups by browser_id
CREATE INDEX IF NOT EXISTS idx_browser_weights_browser_id ON browser_weights(browser_id);
CREATE INDEX IF NOT EXISTS idx_browser_weights_updated_at ON browser_weights(updated_at DESC);

-- Enable Row Level Security (RLS) - allow all for now since these are browser-based, not user-based
ALTER TABLE browser_weights ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all read access (anonymous users need to read weights)
CREATE POLICY "Allow all read access" ON browser_weights
    FOR SELECT
    USING (true);

-- Policy: Allow all insert/update access
CREATE POLICY "Allow all insert access" ON browser_weights
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow all update access" ON browser_weights
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
