import { LevelIcon } from "@/components/LevelIcon";
import { RollingNumber } from "@/components/RollingNumber";
import { Progress } from "@/components/ui/progress";
import { getLevelName } from "@/services/statsService";
import type { UserStats } from "@/services/user-api";
import { Flame, Trophy } from "lucide-react";
import { memo, useMemo } from "react";

interface PlayerStatsHeaderProps {
    stats: UserStats;
}

const PlayerStatsHeader = memo(({ stats }: PlayerStatsHeaderProps) => {
    const { currentLevelXp: xp, level, streak } = useMemo(() => stats, [stats]);
    const nextLevelXP = stats.level.nextLevelXp  - stats.level.currentLevelXp || 0;
    const progress = xp / nextLevelXP * 100;
    return (
        <div className="shrink-0 space-y-2">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 text-base font-semibold sm:text-xl">
                <div className="flex min-w-0 flex-col items-start gap-1" title="ניקוד">
                    <span className="text-sm font-medium text-muted-foreground">ניקוד</span>
                    <div className="flex min-h-7 flex-wrap items-center gap-2">
                        <Trophy className="size-5 shrink-0" aria-hidden="true" />
                        <bdi dir="ltr" className="whitespace-nowrap tabular-nums">
                            <RollingNumber value={xp} /><span className="text-sm font-normal text-muted-foreground"> / {nextLevelXP.toLocaleString()}</span>
                        </bdi>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-1" title="רצף תשובות">
                    <span className="text-sm font-medium text-muted-foreground">רצף</span>
                    <div className="flex min-h-7 items-center gap-2">
                        <Flame className="size-5 shrink-0" aria-hidden="true" />
                        <span className="tabular-nums">{streak.toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-medium text-muted-foreground">{getLevelName(level.level)}</span>
                    <div className="flex min-h-7 items-center gap-2">
                        <LevelIcon level={level.level} size={20} />
                        <span className="tabular-nums">{level.level.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <Progress value={progress} />
        </div>
    );
});

export { PlayerStatsHeader };

