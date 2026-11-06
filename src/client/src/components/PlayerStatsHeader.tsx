import { LevelIcon } from "@/components/LevelIcon";
import { Progress } from "@/components/ui/progress";
import { getLevelName, getTotalXPForLevel } from "@/services/statsService";
import { StarIcon, ZapIcon } from "lucide-react";

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
            <div className="grid grid-cols-[auto_1fr_auto] items-center justify-center text-center text-base font-semibold sm:text-xl">
                <div className="flex gap-2 whitespace-nowrap">
                    <StarIcon className="size-5 sm:size-6" fill="var(--color-amber-400)" />
                    {xp.toLocaleString()}
                    <span className="text-gray-500">/ {nextLevelXP.toLocaleString()}</span>
                </div>
                <div className="mx-auto flex gap-1">
                    <ZapIcon className="size-5 sm:size-6" fill="var(--color-amber-400)" />
                    {streak}
                </div>
                <div className="mr-0 flex flex-col items-end">
                    <div className="flex items-center gap-2">
                        <LevelIcon level={level} />
                        {level.toLocaleString()}
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500">{getLevelName(level)}</span>
                    </div>
                </div>
            </div>
            <Progress value={progress} />
        </div>
    );
};

export { PlayerStatsHeader };