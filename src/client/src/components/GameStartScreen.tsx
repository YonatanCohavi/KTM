import { Button } from "@/components/ui/button";

interface GameStartScreenProps {
    onStart: () => void;
}

export function GameStartScreen({ onStart }: GameStartScreenProps) {
    return (
        <div className="flex h-full flex-col justify-center items-center gap-6 px-4 overflow-y-auto">
            <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h1 className="text-3xl font-bold mb-2">הכר את החבר</h1>
                <p className="text-lg text-muted-foreground mb-8">בחן את ידיעתך בנושא חברי הכנסת</p>
            </div>
            
            <div className="max-w-md space-y-4 text-sm">
                <div className="flex gap-3">
                    <span className="text-2xl">📸</span>
                    <div>
                        <p className="font-semibold">זהה את החבר</p>
                        <p className="text-muted-foreground">תראה תמונה של חבר הכנסת ותצטרך לבחור אותו מ-4 אפשרויות</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                        <p className="font-semibold">בונוס זמן</p>
                        <p className="text-muted-foreground">ענו מהר יותר כדי לקבל בונוס XP נוסף</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <span className="text-2xl">🔥</span>
                    <div>
                        <p className="font-semibold">רצף תשובות נכונות</p>
                        <p className="text-muted-foreground">שמרו על הרצף שלכם וקבלו הישגים מיוחדים</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <span className="text-2xl">📈</span>
                    <div>
                        <p className="font-semibold">עלו בדרגות</p>
                        <p className="text-muted-foreground">צברו XP וקדמו לרמות גבוהות יותר</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                        <p className="font-semibold">לוח דירוג</p>
                        <p className="text-muted-foreground">תחרוּ עם שחקנים אחרים ותופיעו בלוח הדירוג</p>
                    </div>
                </div>
            </div>
            
            <Button onClick={onStart} className="h-auto min-h-12 px-8 py-3 text-lg">
                התחל משחק
            </Button>
        </div>
    );
}
