-- Supabase SQL Schema Update for Player Names
-- Run this in Supabase SQL Editor if you already have the leaderboard table

-- Add player_name column if it doesn't exist
ALTER TABLE leaderboard
ADD COLUMN player_name TEXT DEFAULT '';

-- Update the index to include player_name for better sorting
DROP INDEX IF EXISTS idx_leaderboard_level_xp;
CREATE INDEX idx_leaderboard_level_xp ON leaderboard(level DESC, xp DESC);
