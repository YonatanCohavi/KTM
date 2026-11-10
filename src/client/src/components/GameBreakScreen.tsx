import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface GameBreakScreenProps {
    questionsAnswered: number;
    onContinue: () => void;
    onStop: () => void;
}

export function GameBreakScreen({ questionsAnswered, onContinue, onStop }: GameBreakScreenProps) {
    const [autoCloseIn, setAutoCloseIn] = useState(5);
    const progressPercentage = Math.min(100, ((5 - autoCloseIn) / 5) * 100);

    // Timer countdown - updates every 100ms for smooth animation
    useEffect(() => {
        const timer = setInterval(() => {
            setAutoCloseIn(prev => prev - 0.1);
        }, 100);

        return () => clearInterval(timer);
    }, []);

    // Trigger continue when countdown reaches 0
    useEffect(() => {
        if (autoCloseIn <= 0) {
            onContinue();
        }
    }, [autoCloseIn, onContinue]);

    return (
        <div className="fixed inset-0 bg-black/50 flex flex-col justify-center items-center gap-6 z-50">
            <div className="bg-background rounded-lg p-8 text-center max-w-sm mx-4 shadow-lg">
                <div className="text-6xl mb-4">☕</div>
                <h2 className="text-2xl font-bold mb-2">קח הפסקה קטנה!</h2>
                <p className="text-muted-foreground mb-2">סיימת {questionsAnswered} שאלות</p>
                <p className="text-sm text-muted-foreground mb-6">המשך בעוד {Math.max(0, Math.ceil(autoCloseIn))} שניות...</p>
                <div className="flex gap-3 mb-4">
                    <Button 
                        onClick={onContinue}
                        className="relative h-auto min-h-12 flex-1 overflow-hidden px-8 py-3 text-lg font-bold"
                    >
                        <span className="relative z-10">אני בשוונג</span>
                        <span
                            aria-hidden="true"
                            className="absolute inset-y-0 right-0 bg-primary-foreground/20 transition-[width] duration-75"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </Button>
                    <Button 
                        onClick={onStop}
                        variant="outline"
                        className="h-auto min-h-12 px-4 py-3 text-sm font-bold"
                    >
                        🛑 עצור
                    </Button>
                </div>
            </div>
        </div>
    );
}
