import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface LeaderboardEntry {
  id: string;
  browserUUID: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  updatedAt: string;
  rank?: number;
}

interface LeaderboardDB {
  id: string;
  browser_uuid: string;
  player_name: string;
  level: number;
  xp: number;
  streak: number;
  updated_at: string;
}

// Initialize Supabase - using environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabaseClient: SupabaseClient | null = null;
const LEADERBOARD_STORAGE_KEY = "leaderboard_cache";
const LAST_SYNC_KEY = "leaderboard_last_sync";

// Initialize Supabase client if credentials are available
function getSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseClient;
}

/**
 * Save or update player stats to leaderboard (online)
 */
export async function syncPlayerToLeaderboard(
  browserUUID: string,
  playerName: string,
  level: number,
  xp: number,
  streak: number
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    // Supabase not configured, save locally only
    saveLocalLeaderboardEntry(browserUUID, playerName, level, xp, streak);
    return false;
  }

  try {
    const now = new Date().toISOString();
    const { error } = await client.from("leaderboard").upsert(
      [
        {
          browser_uuid: browserUUID,
          player_name: playerName,
          level,
          xp,
          streak,
          updated_at: now,
        },
      ],
      { onConflict: "browser_uuid" }
    );

    if (error) {
      console.warn("Leaderboard sync error:", error);
      saveLocalLeaderboardEntry(browserUUID, playerName, level, xp, streak);
      return false;
    }

    localStorage.setItem(LAST_SYNC_KEY, now);
    return true;
  } catch (err) {
    console.warn("Failed to sync to leaderboard:", err);
    // Fallback to local storage
    saveLocalLeaderboardEntry(browserUUID, playerName, level, xp, streak);
    return false;
  }
}

/**
 * Fetch leaderboard (tries online first, falls back to local cache)
 */
export async function getLeaderboard(
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from("leaderboard")
        .select("*")
        .order("level", { ascending: false })
        .order("xp", { ascending: false })
        .limit(limit);

      if (error) {
        console.warn("Leaderboard fetch error:", error);
        return getLocalLeaderboard(limit);
      }

      if (data) {
        const entries = (data as LeaderboardDB[]).map((row, index) => ({
          id: row.id,
          browserUUID: row.browser_uuid,
          name: row.player_name || "Anonymous",
          level: row.level,
          xp: row.xp,
          streak: row.streak,
          updatedAt: row.updated_at,
          rank: index + 1,
        }));

        // Cache locally
        localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
        return entries;
      }
    } catch (err) {
      console.warn("Failed to fetch leaderboard:", err);
    }
  }

  // Fallback to local cache
  return getLocalLeaderboard(limit);
}

/**
 * Get player rank in leaderboard
 */
export async function getPlayerRank(
  browserUUID: string
): Promise<number | null> {
  const leaderboard = await getLeaderboard(1000);
  const index = leaderboard.findIndex((e) => e.browserUUID === browserUUID);
  return index >= 0 ? index + 1 : null;
}

/**
 * Local storage fallback functions
 */
function saveLocalLeaderboardEntry(
  browserUUID: string,
  playerName: string,
  level: number,
  xp: number,
  streak: number
): void {
  try {
    const cache = getLocalLeaderboard(10000);
    const existingIndex = cache.findIndex((e) => e.browserUUID === browserUUID);

    if (existingIndex >= 0) {
      cache[existingIndex] = {
        ...cache[existingIndex],
        name: playerName,
        level,
        xp,
        streak,
        updatedAt: new Date().toISOString(),
      };
    } else {
      cache.push({
        id: crypto.randomUUID(),
        browserUUID,
        name: playerName,
        level,
        xp,
        streak,
        updatedAt: new Date().toISOString(),
      });
    }

    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.error("Failed to save to local leaderboard:", err);
  }
}

function getLocalLeaderboard(limit: number): LeaderboardEntry[] {
  try {
    const cached = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!cached) return [];

    const entries: LeaderboardEntry[] = JSON.parse(cached);
    return entries
      .sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        return b.xp - a.xp;
      })
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  } catch (err) {
    console.error("Failed to parse local leaderboard:", err);
    return [];
  }
}

/**
 * Clear all leaderboard data
 */
export function clearLocalLeaderboard(): void {
  localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  localStorage.removeItem(LAST_SYNC_KEY);
}
