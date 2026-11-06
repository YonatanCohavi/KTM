import { Button } from "@/components/ui/button";
import { resetStats } from "@/services/statsService";
import { Settings, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

export function SettingsPage({ onRestart }: { onRestart: () => void }) {
    const confirmation = useRef<HTMLDialogElement>(null);
    const [error, setError] = useState("");

    function restartGame() {
        try {
            resetStats();
            localStorage.removeItem("memberWeights");
            localStorage.removeItem("browserUUID");
        } catch {
            setError("לא הצלחנו למחוק את הנתונים. נסו שוב.");
            return;
        }
        confirmation.current?.close();
        onRestart();
    }

    return <section className="h-full overflow-y-auto px-3 py-4 sm:p-6 lg:max-w-2xl lg:mx-auto" aria-labelledby="settings-heading" dir="rtl">
        <h1 id="settings-heading" className="mb-6 flex items-center gap-2 text-2xl font-semibold"><Settings className="size-6" />הגדרות</h1>
        <div className="flex flex-col items-start gap-4 border-y py-6">
            <h2 className="text-lg font-semibold">נתוני המשחק</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">האיפוס ימחק את הניקוד, הרמה, רצף התשובות, רמות ההיכרות ומזהה המשתמש השמורים בדפדפן הזה.</p>
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