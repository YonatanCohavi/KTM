import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMembersQuery } from "@/services/membersService";
import { GetQuestion, setAnswer, type Question } from "@/services/questionService";
import { getLevelName, getTotalXPForLevel, loadStats, updateStats } from "@/services/statsService";
import { useEffect, useMemo, useRef, useState } from "react";
import { StarIcon, ZapIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress";
import type { FireworksHandlers } from '@fireworks-js/react'
import FireworksComponent from "@/components/FireworksComponent";
import { LevelIcon } from "@/components/LevelIcon";

interface FloatingNumber {
    id: number;
    x: number;
    y: number;
    value: number;
}

const QuestionPage = () => {
    useEffect(() => {
        const handleFocus = () => {
            setPlayerStatus(loadStats());
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const fireworksRef = useRef<FireworksHandlers>(null)
    const [showFireworks, setShowFireworks] = useState(false);
    const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
    const [numbers, setNumbers] = useState<FloatingNumber[]>([]);

    const [question, setQuestion] = useState<Question | undefined>(undefined);
    const { data: members } = useMembersQuery();
    const [playrsStatus, setPlayerStatus] = useState(loadStats());
    const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
    const levels = useMemo(() => {
        return {
            currentLevelXP: getTotalXPForLevel(playrsStatus.level),
            nextLevelXP: getTotalXPForLevel(playrsStatus.level + 1),
        }
    }, [playrsStatus.level])

    useEffect(() => {
        if (fireworksRef.current)
            fireworksRef.current.stop();
    }, [fireworksRef.current])


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
        const exclude: number[] = [];
        if (question) {
            exclude.push(question?.answer.id);
            exclude.push(...question.options.map(o => o.id));
        }
        const q = GetQuestion(members, exclude);
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
        const responseTimeSec = (new Date().getTime() - questionStartTime.getTime()) / 1000;
        const { stats: newStatus, xpGained } = updateStats(playrsStatus, correct ? { basePoints: points, responseTimeSec } : { basePoints: points, penalizeStreak: true });
        if (newStatus.level > playrsStatus.level) {
            setShowFireworks(true);
            setTimeout(() => {
                setShowFireworks(false);
            }, 5000);
        }
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
            <div className="grid grid-cols-[auto_1fr_auto] items-center justify-center text-center text-xl font-semibold ">
                <div className="flex gap-2 whitespace-nowrap">
                    <StarIcon className="" fill="var(--color-amber-400)" />
                    {playrsStatus.xp.toLocaleString()}
                    <span className="text-gray-500">/ {levels.nextLevelXP.toLocaleString()}</span>
                </div>
                <div className="flex gap-1 mx-auto">
                    <ZapIcon fill="var(--color-amber-400)" />
                    {playrsStatus.streak}
                </div>
                <div className="flex flex-col items-end mr-0">
                    <div className="flex gap-2 items-center">
                        <LevelIcon level={playrsStatus.level} />
                        {playrsStatus.level.toLocaleString()}
                    </div>
                    <div>
                        <span className="text-gray-500 font-medium text-sm">{getLevelName(playrsStatus.level)}</span>
                    </div>
                </div>
            </div>
            <div>
                <Progress value={(playrsStatus.xp - levels.currentLevelXP) / (levels.nextLevelXP - levels.currentLevelXP) * 100} />
            </div>
            <div className="mx-auto grow flex items-center h-full">
                <Avatar className="size-72">
                    <AvatarImage src={question.answer.imageUrl} className="object-cover " alt="User Avatar" />
                    <AvatarFallback></AvatarFallback>
                </Avatar>
            </div>
            {/* <div className="grow"/> */}
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
                    className={cn("floating-number text-2xl", num.value > 0 ? "" : "text-red-500")}
                    style={{ left: num.x, top: num.y }}
                    onAnimationEnd={() => handleAnimationEnd(num.id)}
                >
                    <span className="size-4 font-bold rounded-full">
                        {num.value > 0 ? `+${num.value}` : num.value}
                    </span>
                </div>
            ))}
            {showFireworks && <FireworksComponent className="fixed -z-50 h-screen w-screen" />}

        </div>

    );
}
export { QuestionPage }