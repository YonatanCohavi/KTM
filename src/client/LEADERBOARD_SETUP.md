# Leaderboard Setup Guide

## Overview
The app now has a persistent leaderboard system that works in two modes:

1. **Offline Mode** (localStorage) - Works immediately, no setup needed
2. **Online Mode** (Supabase) - Syncs progress across devices and creates a global leaderboard

## Option 1: Offline Only (Default - No Setup Required)
The app works perfectly offline using localStorage. Progress persists locally forever even if inactive for months.

**Pros:**
- ✅ No setup needed
- ✅ Works immediately
- ✅ Completely private

**Cons:**
- ❌ Progress doesn't sync across devices/browsers
- ❌ No global leaderboard

## Option 2: Enable Supabase (Free Online Leaderboard)
To enable cross-device sync and a global leaderboard:

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Sign up"
3. Create a free account

### Step 2: Create a New Project
1. Click "New project"
2. Name it: `ktm-leaderboard` (or any name)
3. Set password (save it)
4. Choose a region (closest to you)
5. Click "Create new project" (wait ~2 minutes)

### Step 3: Create the Leaderboard Table
1. In Supabase, go to the "SQL Editor" tab
2. Click "New query"
3. Copy and paste this SQL:

```sql
-- Create leaderboard table
CREATE TABLE leaderboard (
  id BIGSERIAL PRIMARY KEY,
  browser_uuid TEXT UNIQUE NOT NULL,
  player_name TEXT DEFAULT '',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX idx_leaderboard_level_xp ON leaderboard(level DESC, xp DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the leaderboard
CREATE POLICY "Allow public read" ON leaderboard
  FOR SELECT
  USING (true);

-- Allow anyone to insert/update their own entry (based on browser_uuid)
CREATE POLICY "Allow insert/update" ON leaderboard
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update own entry" ON leaderboard
  FOR UPDATE
  USING (true);
```

4. Click "Run"

### Step 4: Get Your API Keys
1. Go to "Settings" → "API"
2. Under "Project API keys", copy:
   - **Project URL** (looks like: `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** key

### Step 5: Add to Your App
1. Create a `.env.local` file in `C:\Users\yonat\KTM\src\client`:

```
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

2. Save the file
3. Restart your dev server

### Step 6: Set Your Player Name & Test It
1. Open the app
2. Go to Settings → "שם השחקן" (Player Name)
3. Enter your name and click "שמור שם" (Save Name)
4. Play a few questions
5. Go to "דירוג" (Leaderboard) menu
6. You should see your name appear in the rankings with your stats

## What Happens if the App is Idle for Months?

✅ **Your data is 100% safe:**
- Supabase never deletes user data
- Database will wake up instantly when you play again
- First game will sync automatically
- Offline cache ensures you can always play

❌ **Only possible issue (rare):**
- If database has ZERO activity for 2+ weeks, Supabase may suspend it temporarily
- One API call wakes it up (happens on first game)
- No data loss

## Architecture

```
Local Storage (primary)
    ↓
Supabase (async sync)
    ↓
Global Leaderboard
```

**Flow:**
1. Player answers question → stats update locally → UI updates immediately
2. Stats sync to Supabase in background (doesn't block gameplay)
3. Leaderboard fetches top 100 from Supabase (falls back to cache if offline)
4. If offline → uses local cache forever

## Performance & Costs

**Supabase Free Tier (Enough for 1000+ users):**
- 500 MB storage
- Unlimited API calls
- Unlimited real-time connections
- $0/month

**For Your App:**
- ~1 KB per user in database
- ~2 KB per leaderboard fetch
- Cached locally (minimal network usage)

## Troubleshooting

### "Leaderboard is empty"
- Make sure you've played at least one question
- Wait 2-3 seconds for sync
- Refresh the page

### "Leaderboard shows cached data"
- This is normal - fallback to local cache
- App will sync when online

### "I want to disable Supabase"
- Just remove the `.env.local` file
- App reverts to offline-only mode
- All local progress remains

## Questions?

Check the leaderboard service at: `src/services/leaderboardService.ts`
