import { LevelIcon } from "@/components/LevelIcon";
import { Progress } from "@/components/ui/progress";
import { getLevelName, getTotalXPForLevel } from "@/services/statsService";
import { Flame, Trophy } from "lucide-react";

interface PlayerStatsHeaderProps {
    xp: number;
    level: number;
    streak: number;
}

const PlayerStatsHeader = ({ xp, level, streak }: PlayerStatsHeaderProps) => {
    const currentLevelXP = getTotalXPForLevel(level);
    const nextLevelXP = getTotalXPForLevel(level + 1);
    const progress = (xp - currentLevelXP) / (nextLevelXP - currentLevelXP) * 100;

    return (
        <div className="shrink-0 space-y-2">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 text-base font-semibold sm:text-xl">
                <div className="flex min-w-0 flex-col items-start gap-1" title="ניקוד">
                    <span className="text-sm font-medium text-muted-foreground">ניקוד</span>
                    <div className="flex min-h-7 flex-wrap items-center gap-2">
                        <Trophy className="size-5 shrink-0" aria-hidden="true" />
                        <bdi dir="ltr" className="whitespace-nowrap tabular-nums">
                            {xp.toLocaleString()}<span className="text-sm font-normal text-muted-foreground"> / {nextLevelXP.toLocaleString()}</span>
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
                        <span className="text-sm font-medium text-muted-foreground">{getLevelName(level)}</span>
                    <div className="flex min-h-7 items-center gap-2">
                        <LevelIcon level={level} size={20} />
                        <span className="tabular-nums">{level.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <Progress value={progress} />
        </div>
    );
};

export { PlayerStatsHeader };