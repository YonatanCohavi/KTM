import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMembersQuery } from "@/services/membersService";
import { GetQuestion, setAnswer, type Question } from "@/services/questionService";
import { getLevelName, getTotalXPForLevel, loadStats, updateStats } from "@/services/statsService";
import { useEffect, useMemo, useState } from "react";
import { GraduationCap, StarIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress";


interface FloatingNumber {
    id: number;
    x: number;
    y: number;
    value: number;
}

const QuestionPage = () => {
    const stats = loadStats();
    const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
    const [numbers, setNumbers] = useState<FloatingNumber[]>([]);

    const [question, setQuestion] = useState<Question | undefined>(undefined);
    const { data: members } = useMembersQuery();
    const [playrsStatus, setPlayerStatus] = useState(stats);
    const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
    const levels = useMemo(() => {
        return {
            currentLevelXP: getTotalXPForLevel(playrsStatus.level),
            nextLevelXP: getTotalXPForLevel(playrsStatus.level + 1),
        }
    }, [stats.level])


    const showScore = (e: React.MouseEvent, value: number) => {
        const newNumber: FloatingNumber = {
            id: Date.now(),
            x: e.clientX,
            y: e.clientY,
            value
        };

        setNumbers((prev) => [...prev, newNumber]);
    };

    const handleAnimationEnd = (id: number) => {
        setNumbers((prev) => prev.filter((num) => num.id !== id));
    };

    useEffect(() => {
        newQuestion();
    }, [members]);



    function newQuestion() {
        if (!members)
            return;
        const q = GetQuestion(members);
        setQuestion(q);
        setWrongAnswers([]);
        setQuestionStartTime(new Date());
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

    function answer(e: React.MouseEvent, optionId: number) {
        if (!question)
            return;

        let correct = true;
        let points = 10;
        if (optionId != question.answer.id) {
            setWrongAnswers([...wrongAnswers, optionId]);
            correct = false;
        }
        // user clicked on the last option
        if (wrongAnswers.length >= 3) {
            newQuestion();
            return;
        }

        // did not know both members
        setAnswer(optionId, correct);
        setAnswer(question.answer.id, correct);

        if (correct) {
            points -= (wrongAnswers.length) * 3;
        } else {
            points *= -1;
        }
        console.log(`Points before time bonus: ${points} ${wrongAnswers.length} wrong answers`);
        const responseTimeSec = (new Date().getTime() - questionStartTime.getTime()) / 1000;
        const { stats: newStatus, xpGained } = updateStats(playrsStatus, correct ? { basePoints: points, responseTimeSec } : { basePoints: points, penalizeStreak: true });
        if (xpGained > 0) {
            showScore(e, xpGained);
        } else {
            showScore(e, xpGained);
        }
        setPlayerStatus(newStatus);

        if (wrongAnswers.length >= 3 || correct)
            newQuestion();
    }
    if (!members || !question)
        return <div className="flex h-full justify-center items-center text-2xl font-semibold">מחכה לחברים..</div>;

    return (
        <div className="flex flex-col p-4 h-full justify-center gap-4">
            <div className="flex justify-between text-center text-xl font-semibold">
                <div className="flex gap-2">
                    <StarIcon className="text-amber-400" fill="var(--color-amber-400)" />
                    {playrsStatus.xp.toLocaleString()}
                    <span className="text-gray-500">/ {levels.nextLevelXP.toLocaleString()}</span>
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
            <div>
                <Progress value={(stats.xp - levels.currentLevelXP) / (levels.nextLevelXP - levels.currentLevelXP) * 100} />

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
                        <Button
                            className={cn(import.meta.env.DEV && option.id == question.answer.id && "bg-amber-600", "flex h-16 opacity-100 grow transition-all", { shake: wrongAnswers.includes(option.id) })}
                            onClick={(e) => answer(e, option.id)}
                            disabled={wrongAnswers.includes(option.id)}>
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
            {numbers.map((num) => (
                <div
                    dir="auto"
                    key={num.id}
                    className={cn("floating-number", num.value > 0 ? "text-blue-700" : "text-red-500")}
                    style={{ left: num.x, top: num.y }}
                    onAnimationEnd={() => handleAnimationEnd(num.id)}
                >
                    <span className="size-4 font-semibold rounded-full">
                    {num.value > 0 ? `+${num.value}` : num.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
export { QuestionPage }