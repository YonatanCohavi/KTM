import { useEffect, useState } from "react";
import { RotateCcw, Search, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMembersQuery } from "@/services/membersService";
import { loadMemberKnowledge } from "@/services/questionService";

type sortMethod = 'name' | 'least' | 'most';
export function MembersPage() {
    const { data: members, isError, refetch } = useMembersQuery();
    const [knowledge, setKnowledge] = useState(loadMemberKnowledge);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<sortMethod>("most");

    useEffect(() => {
        const refreshKnowledge = () => setKnowledge(loadMemberKnowledge());
        window.addEventListener("focus", refreshKnowledge);
        window.addEventListener("storage", refreshKnowledge);
        return () => {
            window.removeEventListener("focus", refreshKnowledge);
            window.removeEventListener("storage", refreshKnowledge);
        };
    }, []);

    if (isError) {
        return <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center" role="alert">
            <p className="text-xl font-semibold">לא הצלחנו לטעון את נתוני החברים.</p>
            <Button onClick={() => { void refetch(); }}><RotateCcw />נסו שוב</Button>
        </div>;
    }

    if (!members) {
        return <div className="flex h-full items-center justify-center text-xl" role="status">טוען חברים...</div>;
    }

    const query = search.trim().toLocaleLowerCase("he");
    const visibleMembers = members.filter(member =>
        `${member.firstName} ${member.lastName} ${member.fraction.name}`.toLocaleLowerCase("he").includes(query)
    ).sort((first, second) => {
        const difference = (knowledge.get(first.id) ?? 0) - (knowledge.get(second.id) ?? 0);
        if (sort !== "name" && difference !== 0) return sort === "least" ? difference : -difference;
        return `${first.firstName} ${first.lastName}`.localeCompare(`${second.firstName} ${second.lastName}`, "he");
    });

    return <section className="h-full overflow-y-auto px-3 py-4 sm:p-6" aria-labelledby="members-heading">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h1 id="members-heading" className="flex items-center gap-2 text-2xl font-semibold"><Users className="size-6" />חברי הכנסת</h1>
            <span className="text-sm text-muted-foreground" role="status">{visibleMembers.length} מתוך {members.length} חברים</span>
        </div>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
                <input
                    type="search"
                    aria-label="חיפוש לפי שם או סיעה"
                    placeholder="שם או סיעה"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    className="h-10 w-full rounded-md border bg-background pr-10 pl-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                />
            </div>
            <select aria-label="מיון חברים" value={sort} onChange={event => setSort(event.target.value as sortMethod)} className="h-10 rounded-md border bg-background px-3 text-sm sm:w-48">
                <option value="name">לפי שם</option>
                <option value="least">היכרות נמוכה תחילה</option>
                <option value="most">היכרות גבוהה תחילה</option>
            </select>
        </div>
        {visibleMembers.length === 0 ? <div className="py-12 text-center text-muted-foreground" role="status">לא נמצאו חברים</div> :
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {visibleMembers.map(member => {
                    const score = knowledge.get(member.id) ?? 0;
                    const name = `${member.firstName} ${member.lastName}`;
                    return <li key={member.id} className="flex min-w-0 items-center gap-3 rounded-lg border bg-card p-3">
                        <Avatar className="size-16 shrink-0 rounded-md sm:size-20">
                            <AvatarImage src={member.imageUrl} alt={name} className="object-cover" loading="lazy" />
                            <AvatarFallback className="rounded-md">{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <h2 className="break-words text-base font-semibold">{name}</h2>
                            <p className="mb-3 break-words text-sm text-muted-foreground">{member.fraction.name}</p>
                            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                                <span>רמת היכרות</span>
                                <span className="shrink-0 font-semibold tabular-nums">{score}/100</span>
                            </div>
                            <Progress value={score} aria-label={`רמת היכרות עם ${name}`} className={score >= 70 ? "bg-emerald-100 [&>[data-slot=progress-indicator]]:bg-emerald-600" : score >= 30 ? "bg-primary/20" : "bg-amber-100 [&>[data-slot=progress-indicator]]:bg-amber-500"} />
                        </div>
                    </li>;
                })}
            </ul>}
    </section>;
}