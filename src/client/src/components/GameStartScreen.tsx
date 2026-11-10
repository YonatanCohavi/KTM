import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface GameStartScreenProps {
    onStart: () => void;
}

export function GameStartScreen({ onStart }: GameStartScreenProps) {
    const navigateTo = (path: string) => {
        window.location.hash = `#${path}`;
    };

    return (
        <div className="flex h-full flex-col justify-center items-center gap-4 px-4">
            <div className="text-center space-y-1 mb-2">
                <div className="text-6xl">🎮</div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">הכר את החבר</h1>
                <p className="text-sm text-muted-foreground">בחן את ידיעתך בנושא חברי הכנסת</p>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-2 max-w-2xl">
                <div className="flex gap-2 p-2 rounded-lg bg-muted/50 border border-primary/20 hover:border-primary/50 transition-colors">
                    <span className="text-2xl shrink-0">📸</span>
                    <div className="min-w-0">
                        <p className="font-semibold text-xs">זהה את החבר</p>
                        <p className="text-xs text-muted-foreground leading-tight">בחר מ-4 אפשרויות</p>
                    </div>
                </div>
                
                <div className="flex gap-2 p-2 rounded-lg bg-muted/50 border border-primary/20 hover:border-primary/50 transition-colors">
                    <span className="text-2xl shrink-0">⚡</span>
                    <div className="min-w-0">
                        <p className="font-semibold text-xs">בונוס זמן</p>
                        <p className="text-xs text-muted-foreground leading-tight">ענו מהר יותר</p>
                    </div>
                </div>
                
                <div className="flex gap-2 p-2 rounded-lg bg-muted/50 border border-primary/20 hover:border-primary/50 transition-colors">
                    <span className="text-2xl shrink-0">🔥</span>
                    <div className="min-w-0">
                        <p className="font-semibold text-xs">רצף נכון</p>
                        <p className="text-xs text-muted-foreground leading-tight">שמרו על הרצף</p>
                    </div>
                </div>
                
                <div className="flex gap-2 p-2 rounded-lg bg-muted/50 border border-primary/20 hover:border-primary/50 transition-colors">
                    <span className="text-2xl shrink-0">📈</span>
                    <div className="min-w-0">
                        <p className="font-semibold text-xs">עלו בדרגות</p>
                        <p className="text-xs text-muted-foreground leading-tight">צברו XP</p>
                    </div>
                </div>

                <div 
                  onClick={() => navigateTo("/leaderboard")}
                className="flex gap-2 p-3 rounded-lg bg-primary/10 border border-primary/40 hover:border-primary hover:bg-primary/20 active:bg-primary/30 transition-all cursor-pointer active:scale-95 group">
                    <span className="text-2xl shrink-0">🏆</span>
                    <div className="min-w-0">
                        <p className="font-semibold text-xs">לוח דירוג</p>
                        <p className="text-xs text-muted-foreground leading-tight">תחרוּ עם אחרים</p>
                    </div>
                    <div className="flex-1"></div>
                    <ChevronLeft className="size-4 shrink-0 text-primary opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity" />

                </div>

                <button
                    onClick={() => navigateTo("/members")}
                    className="flex gap-2 p-3 rounded-lg bg-primary/10 border border-primary/40 hover:border-primary hover:bg-primary/20 active:bg-primary/30 transition-all cursor-pointer active:scale-95 group"
                >
                    <span className="text-2xl shrink-0">👥</span>
                    <div className="min-w-0 text-start">
                        <p className="font-semibold text-xs">כל החברים</p>
                        <p className="text-xs text-muted-foreground leading-tight">ספריית חברים</p>
                    </div>
                    <div className="flex-1"></div>

                    <ChevronLeft className="size-4 shrink-0 text-primary opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity" />
                </button>

                <button
                    onClick={() => navigateTo("/settings")}
                    className="flex gap-2 p-3 rounded-lg bg-primary/10 border border-primary/40 hover:border-primary hover:bg-primary/20 active:bg-primary/30 transition-all cursor-pointer active:scale-95 col-span-2 group"
                >
                    <span className="text-2xl shrink-0">⚙️</span>
                    <div className="min-w-0 text-start">
                        <p className="font-semibold text-xs">הגדרות</p>
                        <p className="text-xs text-muted-foreground leading-tight">שנו שם, נהלו פרופיל והעדפות</p>
                    </div>
                    <div className="flex-1"></div>
                    <ChevronLeft className="size-4 shrink-0 text-primary opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity" />
                </button>
            </div>
            
            <Button onClick={onStart} className="h-auto min-h-12 px-8 py-2 text-base font-bold shadow-lg hover:shadow-xl transition-shadow mt-2">
                התחל משחק 🎮
            </Button>
        </div>
    );
}
