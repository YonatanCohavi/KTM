import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useUser } from "@/contexts/userContext";
import { cn } from "@/lib/utils";
import { getLevelName } from "@/services/statsService";
import { userQueries } from "@/services/user-api";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Trophy } from "lucide-react";
import { useEffect, useMemo } from "react";


export function LeaderboardPage() {
  const { id: browserUUID } = useUser();
  const { data: leaderboardData, isLoading, isError, error } = useQuery(userQueries.leaderboard())

  const playerRank = useMemo(() => {
    if (!leaderboardData) return null;
    const index = leaderboardData.findIndex(entry => entry.userId === browserUUID);
    return index !== -1 ? index + 1 : null;
  }, [leaderboardData, browserUUID]);
  useEffect(() => { console.log(leaderboardData) }, [leaderboardData]);
  return (
    <section
      className="h-full min-w-0 overflow-y-auto px-3 py-4 sm:p-6 lg:max-w-2xl lg:mx-auto"
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
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      )}

      {/* Leaderboard Table */}
      {!isLoading && leaderboardData && leaderboardData.length > 0 && (
        <>
        <ol aria-label="דירוג הנקודות" className="mb-4 divide-y overflow-hidden rounded-lg border sm:hidden">
          {leaderboardData.map((entry, index) => (
            <li
              key={entry.userId}
              className={cn("flex min-w-0 items-center gap-3 p-3", entry.userId === browserUUID && "bg-primary/5")}
            >
              <div className="flex size-10 shrink-0 items-center justify-center">
                {index < 3 ? (
                  <Trophy
                    className={cn(
                      "size-5",
                      index === 0 && "text-yellow-500",
                      index === 1 && "text-gray-400",
                      index === 2 && "text-orange-600"
                    )}
                    aria-hidden="true"
                  />
                ) : null}
                <span className={cn("font-semibold tabular-nums", index < 3 && "sr-only")}>#{index + 1}</span>
                {index < 3 && <span className="sr-only">מקום {index + 1}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <span className="truncate font-semibold">{entry.name || "Anonymous"}</span>
                  <span className="shrink-0 whitespace-nowrap text-base font-bold tabular-nums" aria-label={`${entry.xp.toLocaleString("he-IL")} נקודות`}>
                    {entry.xp.toLocaleString("he-IL")}
                  </span>
                </div>
                <div className="mt-1 flex min-w-0 items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span className="truncate">{getLevelName(entry.level)} · {entry.level}</span>
                  <span className="flex shrink-0 items-center gap-3 tabular-nums">
                    <span aria-label={`רצף ${entry.streak}`}><span aria-hidden="true">🔥 </span>{entry.streak}</span>
                    <span aria-label={`רצף שיא ${entry.maxStreak}`}><span aria-hidden="true">⭐ </span>{entry.maxStreak}</span>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="hidden w-full max-w-full overflow-x-auto rounded-lg border sm:block">
          <table className="w-full min-w-xl table-fixed text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="sticky right-0 z-20 w-20 bg-muted px-2 py-3 text-right text-xs font-semibold sm:px-4 sm:text-sm">דירוג</th>
                <th className="sticky right-20 z-20 w-36 bg-muted px-2 py-3 text-right text-xs font-semibold sm:px-4 sm:text-sm">שם</th>
                <th className="px-2 py-3 text-right font-semibold text-xs sm:text-sm sm:px-4">רמה</th>
                <th className="px-2 py-3 text-right font-semibold text-xs sm:text-sm sm:px-4">נקודות</th>
                <th className="px-2 py-3 text-center font-semibold text-xs sm:text-sm sm:px-4">רצף</th>
                <th className="px-2 py-3 text-center font-semibold text-xs sm:text-sm sm:px-4">רצף שיא</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((entry, index) => {
                const isCurrentPlayer = entry.userId === browserUUID;
                return (
                <tr
                  key={entry.userId}
                  className={cn(
                    "group border-b transition-colors hover:bg-muted/50",
                    isCurrentPlayer && "bg-primary/10 font-semibold"
                  )}
                >
                  <td className={cn(
                    "sticky right-0 z-10 w-20 bg-background px-2 py-3 text-right group-hover:bg-muted sm:px-4"
                  )} style={{ backgroundColor: isCurrentPlayer ? "color-mix(in oklab, var(--primary) 10%, var(--background))" : undefined }}>
                    <div className="flex items-center gap-1 justify-end">
                      {index === 0 && <Trophy className="size-4 text-yellow-500 shrink-0" />}
                      {index === 1 && <Trophy className="size-4 text-gray-400 shrink-0" />}
                      {index === 2 && <Trophy className="size-4 text-orange-600 shrink-0" />}
                      <span className="font-semibold text-sm">
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className={cn(
                    "sticky right-20 z-10 w-36 bg-background px-2 py-3 text-right group-hover:bg-muted sm:px-4"
                  )} style={{ backgroundColor: isCurrentPlayer ? "color-mix(in oklab, var(--primary) 10%, var(--background))" : undefined }}>
                    <span className="truncate block max-w-xs text-sm">
                      {entry.name || "Anonymous"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right sm:px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm">{entry.level}</span>
                      <span className="text-xs text-muted-foreground">
                        {getLevelName(entry.level)}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right sm:px-4 font-semibold text-sm">
                    {entry.xp.toLocaleString("he-IL")}
                  </td>
                  <td className="px-2 py-3 text-center sm:px-4">
                    <span className="inline-flex items-center gap-0.5 whitespace-nowrap rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                      🔥 <span className="tabular-nums">{entry.streak}</span>
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center sm:px-4">
                    <span className="inline-flex items-center gap-0.5 whitespace-nowrap rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      ⭐ <span className="tabular-nums">{entry.maxStreak}</span>
                    </span>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && leaderboardData && leaderboardData.length === 0 && !isError && (
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
