import { Button } from "@/components/ui/button";
import { resetStats, loadStats } from "@/services/statsService";
import { useUser } from "@/contexts/userContext";
import { Settings, Trash2, User } from "lucide-react";
import { useRef, useState } from "react";

export function SettingsPage({ onRestart }: { onRestart: () => void }) {
    const { id: browserUUID, name, setName } = useUser();
    const confirmation = useRef<HTMLDialogElement>(null);
    const nameInput = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");
    const [nameSaved, setNameSaved] = useState(false);

    // async function saveName() {
    //     const newName = nameInput.current?.value.trim() || "";
    //     if (newName.length > 0 && newName.length <= 50) {
    //         setName(newName);
            
    //         // Sync immediately to leaderboard
    //         const stats = loadStats();
    //         await syncPlayerToLeaderboard(browserUUID, newName, stats.level, stats.xp, stats.streak);
            
    //         setNameSaved(true);
    //         setTimeout(() => setNameSaved(false), 2000);
    //     }
    // }
 async function saveName() {}
 async function restartGame() {}
    // async function restartGame() {
    //     let stats;
    //     try {
    //         stats = resetStats();
    //         clearLocalLeaderboard();
    //         localStorage.removeItem("memberWeights");
    //     } catch {
    //         setError("לא הצלחנו למחוק את הנתונים. נסו שוב.");
    //         return;
    //     }
    //     await syncPlayerToLeaderboard(browserUUID, name, stats.level, stats.xp, stats.streak);
    //     confirmation.current?.close();
    //     onRestart();
    // }

    return <section className="h-full overflow-y-auto px-3 py-4 sm:p-6 lg:max-w-2xl lg:mx-auto" aria-labelledby="settings-heading" dir="rtl">
        <h1 id="settings-heading" className="mb-6 flex items-center gap-2 text-2xl font-semibold"><Settings className="size-6" />הגדרות</h1>
        
        {/* Player Name Settings */}
        <div className="flex flex-col items-start gap-4 border-b py-6">
            <div className="flex items-center gap-2">
                <User className="size-5" />
                <h2 className="text-lg font-semibold">שם השחקן</h2>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">בחר שם שיוצג בדירוג הנקודות</p>
            <div className="flex flex-col gap-3 w-full max-w-sm">
                <input
                    ref={nameInput}
                    type="text"
                    placeholder="הזן את שמך"
                    defaultValue={name}
                    maxLength={50}
                    className="w-full px-4 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center gap-2">
                    <Button onClick={saveName} className="h-auto min-h-10">
                        שמור שם
                    </Button>
                    {nameSaved && (
                        <span className="text-sm text-green-600 font-medium">✓ נשמר בהצלחה</span>
                    )}
                </div>
            </div>
        </div>

        {/* Game Data Settings */}
        <div className="flex flex-col items-start gap-4 border-b py-6">
            <h2 className="text-lg font-semibold">נתוני המשחק</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">האיפוס ימחק את הניקוד, הרמה, רצף התשובות ורמות ההיכרות השמורים בדפדפן הזה.</p>
            <Button variant="destructive" className="h-auto min-h-10 max-w-full whitespace-normal" onClick={() => {
                setError("");
                confirmation.current?.showModal();
            }}><Trash2 className="shrink-0" />מחיקת הנתונים והתחלה מחדש</Button>
        </div>
        
        <dialog ref={confirmation} aria-labelledby="reset-title" aria-describedby="reset-description" onKeyDown={event => {
            if (event.key === "Escape") {
                event.preventDefault();
                event.currentTarget.close();
            }
        }} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border bg-background p-6 text-foreground shadow-xl backdrop:bg-black/40">
            <h2 id="reset-title" className="mb-3 text-lg font-semibold">למחוק את הנתונים ולהתחיל מחדש?</h2>
            <p id="reset-description" className="mb-6 text-sm text-muted-foreground">כל ההתקדמות השמורה בדפדפן הזה תימחק לצמיתות. לא ניתן לבטל את הפעולה.</p>
            {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
            <div className="flex flex-wrap gap-3">
                <Button autoFocus variant="outline" onClick={() => confirmation.current?.close()}>ביטול</Button>
                <Button variant="destructive" className="h-auto min-h-10 whitespace-normal" onClick={restartGame}><Trash2 className="shrink-0" />מחיקה והתחלה מחדש</Button>
            </div>
        </dialog>
    </section>;
}