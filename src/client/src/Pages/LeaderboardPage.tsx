import { useEffect, useState } from "react";
import { getLeaderboard, getPlayerRank, type LeaderboardEntry } from "@/services/leaderboardService";
import { useUser } from "@/contexts/userContext";
import { getLevelName } from "@/services/statsService";
import { Trophy, TrendingUp } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";

export function LeaderboardPage() {
  const { id: browserUUID } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setIsLoading(true);
        setError(null);
        const [entries, rank] = await Promise.all([
          getLeaderboard(100),
          getPlayerRank(browserUUID),
        ]);
        setLeaderboard(entries);
        setPlayerRank(rank);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
        setError("לא הצלחנו לטעון את דירוג הנקודות");
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [browserUUID]);

  return (
    <section
      className="h-full overflow-y-auto px-3 py-4 sm:p-6 lg:max-w-2xl lg:mx-auto"
      aria-labelledby="leaderboard-heading"
      dir="rtl"
    >
      <h1
        id="leaderboard-heading"
        className="mb-6 flex items-center gap-2 text-2xl font-semibold"
      >
        <Trophy className="size-6" />
        דירוג הנקודות
      </h1>

      {/* Player's Current Rank */}
      {playerRank && (
        <div className="mb-6 rounded-lg border bg-primary/5 p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm text-muted-foreground">דירוגך הנוכחי</span>
            <TrendingUp className="size-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-primary">
            #{playerRank}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {playerRank === 1 && "אתה בראש טבלת הדירוג!"}
            {playerRank && playerRank <= 10 && playerRank > 1 && `אתה בעשרת הטובים!`}
            {playerRank && playerRank > 10 && playerRank <= 100 && `אתה במאה העליונים`}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-sm text-muted-foreground">טוען דירוג...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Leaderboard Table */}
      {!isLoading && leaderboard.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-right font-semibold">דירוג</th>
                <th className="px-4 py-3 text-right font-semibold">שם</th>
                <th className="px-4 py-3 text-right font-semibold">רמה</th>
                <th className="px-4 py-3 text-right font-semibold">נקודות</th>
                <th className="px-4 py-3 text-right font-semibold">סדרה</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={cn(
                    "border-b transition-colors hover:bg-muted/50",
                    entry.browserUUID === browserUUID && "bg-primary/10 font-semibold"
                  )}
                >
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {index === 0 && <Trophy className="size-4 text-yellow-500" />}
                      {index === 1 && <Trophy className="size-4 text-gray-400" />}
                      {index === 2 && <Trophy className="size-4 text-orange-600" />}
                      <span className="font-semibold">
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="truncate block max-w-xs">
                      {entry.name || "Anonymous"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold">{entry.level}</span>
                      <span className="text-xs text-muted-foreground">
                        {getLevelName(entry.level)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {entry.xp.toLocaleString("he-IL")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                      🔥 {entry.streak}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && leaderboard.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Trophy className="size-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            טבלת הדירוג עדיין ריקה. משחק קצת ותופיע בטבלה!
          </p>
        </div>
      )}
    </section>
  );
}
