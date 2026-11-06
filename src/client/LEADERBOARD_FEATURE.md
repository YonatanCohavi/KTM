# Leaderboard & Persistent Progress Feature

## What's New? ✨

Your KTM app now has:

1. **Persistent Progress** - All your stats saved locally, survives app closure and browser restart
2. **Global Leaderboard** - See how you rank against other players (optional Supabase setup)
3. **Cross-Browser Sync** - Play on different devices and keep your progress (optional)
4. **Offline First** - Works perfectly offline, syncs when online

## How It Works

### Offline Mode (Default - Works Out of the Box)
```
You play → Stats update → Saved to localStorage → Persists forever
```

- No setup required
- Works offline
- Progress persists for months/years of inactivity
- Private (stays on your device)
- Leaderboard shows only local players

### Online Mode (Optional - Supabase)
```
You play → Stats update → Saved locally + Synced to Supabase → Global leaderboard
```

- Requires free Supabase setup (5 minutes)
- Cross-device sync
- Global leaderboard (see your rank against everyone)
- Still works offline (uses local cache)

## Quick Start

### Option 1: Stay Offline (Recommended for now)
Just start playing! Everything works:
- Your progress saves automatically
- Leaderboard shows on the "דירוג" (Leaderboard) page
- Works for months without internet

### Option 2: Enable Supabase (For Global Leaderboard)
See [LEADERBOARD_SETUP.md](./LEADERBOARD_SETUP.md) for step-by-step instructions.

Time needed: ~5 minutes  
Cost: Free forever (Supabase free tier)

## Data Guarantee 🔒

**Your data is safe:**
- ✅ Saved locally first (instant, no internet required)
- ✅ Never deleted by inactivity
- ✅ Works offline indefinitely
- ✅ Syncs in background (doesn't affect gameplay)

## What Changed in the Code

### New Files
- `src/services/leaderboardService.ts` - Handles all leaderboard logic
- `src/Pages/LeaderboardPage.tsx` - Leaderboard UI
- `src/components/LoadingSpinner.tsx` - Loading indicator
- `LEADERBOARD_SETUP.md` - Detailed setup guide
- `.env.example` - Environment variables template

### Modified Files
- `src/App.tsx` - Added leaderboard navigation
- `src/Pages/QuestionPage.tsx` - Syncs stats to leaderboard after each question
- `src/Pages/SettingsPage.tsx` - Clears leaderboard cache on reset
- `package.json` - Added `@supabase/supabase-js` dependency

## API Documentation

### Leaderboard Service

```typescript
// Get top players
const leaderboard = await getLeaderboard(limit: number);
// Returns: Array<LeaderboardEntry>

// Get player's current rank
const rank = await getPlayerRank(browserUUID: string);
// Returns: number | null

// Sync player stats to leaderboard
await syncPlayerToLeaderboard(
  browserUUID: string,
  level: number,
  xp: number,
  streak: number
);
// Returns: boolean (true if synced to Supabase)

// Clear local leaderboard cache
clearLocalLeaderboard();
```

## Architecture

```
┌─────────────────────────────────────────┐
│        User Plays Question              │
├─────────────────────────────────────────┤
│  updateStats() → saves to localStorage  │
├─────────────────────────────────────────┤
│  syncPlayerToLeaderboard()               │
│  ├─ If online → sync to Supabase        │
│  └─ If offline → save to local cache    │
├─────────────────────────────────────────┤
│  UI Updates Immediately                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      Leaderboard Page Loads             │
├─────────────────────────────────────────┤
│  getLeaderboard()                        │
│  ├─ If online → fetch from Supabase     │
│  └─ If offline → use local cache        │
└─────────────────────────────────────────┘
```

## Leaderboard Entry Schema

```typescript
interface LeaderboardEntry {
  id: string;
  browserUUID: string;
  level: number;
  xp: number;
  streak: number;
  updatedAt: string;    // ISO timestamp
  rank?: number;        // Computed on client
}
```

## Performance & Storage

### Local Storage
- ~1 KB per player entry
- ~100 KB for 100 players
- Browser limit: 5-10 MB (plenty of space)

### Supabase (if enabled)
- Free tier: 500 MB database
- ~1 KB per user (enough for 500,000 users)
- Unlimited API calls
- $0/month

## Troubleshooting

### "My stats aren't showing in leaderboard"
1. Play a question (syncs after answer)
2. Wait 2-3 seconds
3. Refresh the leaderboard page
4. Check browser console (F12) for errors

### "Leaderboard shows old data"
- This means you're offline - showing cached data
- Perfectly normal! Will update when online

### "I deleted my local data but Supabase still has it"
- Contact support at Supabase to clear your user entry
- Or just create a new browser UUID (reset in settings)

### "Can I migrate my local progress to another device?"
- Currently no, but you can:
  1. Export your stats (localStorage)
  2. Copy to another device
  3. Import back to localStorage
- Or enable Supabase for automatic sync

## Future Enhancements

Potential improvements (not implemented yet):
- [ ] Account system for cross-device sync
- [ ] Achievements/badges
- [ ] Weekly/monthly leaderboards
- [ ] Player statistics and charts
- [ ] Social features (friend lists, challenges)
- [ ] Data export/import

## Support

If something doesn't work:
1. Check browser console: F12 → Console tab
2. Look for error messages
3. Try clearing browser data and restart
4. Check `LEADERBOARD_SETUP.md` if using Supabase

## License

Same as KTM project
