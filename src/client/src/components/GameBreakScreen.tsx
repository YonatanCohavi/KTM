import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface GameBreakScreenProps {
    questionsAnswered: number;
    onContinue: () => void;
    onStop: () => void;
}

export function GameBreakScreen({ questionsAnswered, onContinue, onStop }: GameBreakScreenProps) {
    const [autoCloseIn, setAutoCloseIn] = useState(5);
    const progressPercentage = ((5 - autoCloseIn) / 5) * 100;
console.log(progressPercentage);
    // Timer countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setAutoCloseIn(prev => prev - 1);
        }, 1000);

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
                <p className="text-sm text-muted-foreground mb-6">המשך בעוד {Math.max(0, autoCloseIn)} שניות...</p>
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <div 
                            className="absolute inset-0 bg-primary/30 rounded-md transition-all duration-100"
                            style={{width: `${progressPercentage}%`}}
                        />
                        <Button 
                            onClick={onContinue}
                            className="h-auto min-h-12 px-8 py-3 text-lg font-bold w-full relative"
                        >
                            המשך משחק
                        </Button>
                    </div>
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
