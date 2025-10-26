import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMembersQuery } from "@/services/membersService";
import { GetQuestion, setAnswer, type Question } from "@/services/questionService";
import { getLevelName, getTotalXPForLevel, loadStats, updateStats } from "@/services/statsService";
import { useEffect, useState } from "react";
import { GraduationCap, StarIcon } from "lucide-react"

const QuestionPage = () => {
    const stats = loadStats();
    const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
    const [question, setQuestion] = useState<Question | undefined>(undefined);
    const { data: members } = useMembersQuery();
    const [playrsStatus, setPlayerStatus] = useState(stats);
    const [xpToNextLevel, setXpToNextLevel] = useState(getTotalXPForLevel(stats.level + 1));
    useEffect(() => {
        newQuestion();
    }, [members]);
    useEffect(() => { console.log(playrsStatus) }, [playrsStatus])
    function newQuestion() {
        if (!members)
            return;
        const q = GetQuestion(members);
        setQuestion(q);
        setWrongAnswers([]);

    }

    // preload images
    useEffect(() => {
        if (!question)
            return;
        question.options.forEach(option => {
            const img = new Image();
            img.src = option.imageUrl;
        });
    }, [question]);

    function answer(optionId: number) {
        if (!question)
            return;
        let correct = true;
        if (optionId != question.answer.id) {
            setWrongAnswers([...wrongAnswers, optionId]);
            correct = false;
        }
        if (wrongAnswers.length >= 3) {
            correct = false;
        }

        setAnswer(optionId, correct);
        let points = 12;
        if (correct) {
            points -= (wrongAnswers.length) * 3;
        }
        const { stats: newStatus, xpGained } = updateStats(playrsStatus, correct ? { basePoints: points } : { basePoints: -6, penalizeStreak: true });
        console.log(`Gained ${xpGained} XP`);
        setPlayerStatus(newStatus);
        setXpToNextLevel(getTotalXPForLevel(newStatus.level + 1));
        if (wrongAnswers.length >= 3 || correct)
            newQuestion();
    }
    if (!members || !question)
        return <div className="flex h-full justify-center items-center text-2xl font-semibold">מחכה לחברים..</div>;
    return (
        <div className="flex flex-col p-4 h-full justify-center">
            <div className="flex justify-between text-center text-xl font-semibold mb-8">
                <div className="flex gap-2">
                    <StarIcon className="text-amber-400" fill="var(--color-amber-400)" />
                    {playrsStatus.xp.toLocaleString()}
                    <span className="text-gray-500">/ {xpToNextLevel.toLocaleString()}</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex gap-2 items-center">
                        <GraduationCap fill="var(--color-gray-300)" />
                        {playrsStatus.level.toLocaleString()}
                    </div>
                    <div>
                        <span className="text-gray-500 font-medium text-sm">({getLevelName(playrsStatus.level)})</span>
                    </div>
                </div>
            </div>

            <div className="mx-auto">
                <Avatar className="size-72">
                    <AvatarImage src={question.answer.imageUrl} className="object-cover " alt="User Avatar" />
                    <AvatarFallback></AvatarFallback>
                </Avatar>
            </div>
            <div className="grow">

            </div>
            <div className="grid gap-2">
                {question.options.map((option) => (
                    <div key={option.id} className={cn("flex", { "gap-4": wrongAnswers.includes(option.id) })}>
                        <Button className={cn(question.answer.id === option.id && "bg-amber-800", "flex h-16 opacity-100 grow transition-all", { shake: wrongAnswers.includes(option.id) })} onClick={() => answer(option.id)} disabled={wrongAnswers.includes(option.id)}>
                            <span>
                                {option.firstName} {option.lastName}
                            </span>
                            <div className="grow"></div>
                        </Button>
                        <div className={cn("w-0 overflow-hidden transition-all", { "w-10": wrongAnswers.includes(option.id) })}>
                            <Avatar className="size-10 mt-4 mx-auto">
                                <AvatarImage src={option.imageUrl} alt="User Avatar" className="object-cover" />
                                <AvatarFallback></AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
export { QuestionPage }