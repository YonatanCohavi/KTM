import { cn } from "@/lib/utils";
import { getTimeBonusMultiplier } from "@/services/statsService";

interface TimeBonusMeterProps {
    elapsedSeconds: number;
}

const TimeBonusMeter = ({ elapsedSeconds }: TimeBonusMeterProps) => {
    const timeBonusPercent = Math.round((getTimeBonusMultiplier(elapsedSeconds) - 1) * 100);
    const timeProgress = Math.min((elapsedSeconds / 10) * 100, 100);
    const timeBonusColor = elapsedSeconds <= 2
        ? "bg-emerald-500"
        : elapsedSeconds <= 5
            ? "bg-amber-500"
            : elapsedSeconds <= 10
                ? "bg-orange-500"
                : "bg-muted-foreground";

    return (
        <div className={cn("flex shrink-0 items-center gap-2 text-xs font-semibold tabular-nums transition-opacity duration-300", timeProgress >= 100 && "opacity-0")} dir="rtl">
            <span className="shrink-0 text-emerald-700 uppercase tracking-wider text-[10px]">⚡ Bonus</span>
            <span className={cn("w-10 shrink-0", timeBonusPercent > 0 ? "text-emerald-700" : "text-muted-foreground")}>
                +{timeBonusPercent}%
            </span>
            <div
                role="meter"
                aria-label="בונוס מהירות"
                aria-valuemin={0}
                aria-valuemax={10}
                aria-valuenow={Math.min(elapsedSeconds, 10)}
                aria-valuetext={`+${timeBonusPercent}%`}
                className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"
                dir="ltr"
            >
                <div className={cn("h-full transition-[width] duration-100", timeBonusColor)} style={{ width: `${timeProgress}%` }} />
                <div aria-hidden="true" className="absolute inset-y-0 left-[20%] w-0.5 bg-background/80" />
                <div aria-hidden="true" className="absolute inset-y-0 left-1/2 w-0.5 bg-background/80" />
            </div>
            <span className="w-9 shrink-0 text-left text-muted-foreground" dir="ltr">
                {elapsedSeconds.toFixed(1)}s
            </span>
        </div>
    );
};

export { TimeBonusMeter };