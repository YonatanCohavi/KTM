import FireworksComponent from "@/components/FireworksComponent";
import { PlayerStatsHeader } from "@/components/PlayerStatsHeader";
import { TimeBonusMeter } from "@/components/TimeBonusMeter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/userContext";
import { cn } from "@/lib/utils";
import { useAnswer, useNextQuestion, type QuestionResponse } from "@/services/question-api";
import { userQueries, UserStats } from "@/services/user-api";
import { soundService } from "@/services/soundService";
import type { FireworksHandlers } from '@fireworks-js/react';
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FloatingNumber {
    id: number;
    x: number;
    y: number;
    value: number;
}

const QuestionPage = () => {
    const { id: browserUUID } = useUser();
    const { mutateAsync: fetchNextQuestion } = useNextQuestion({ browserUUID });
    const { mutateAsync: answerQuestionAsync } = useAnswer({ browserUUID });
    const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse>();
    const [preloadedQuestion, setPreloadedQuestion] = useState<QuestionResponse>();
    const [isPreloading, setIsPreloading] = useState(false);

    useEffect(() => {
        getNextQuestion();
    }, []);

    const questionImageUrl = (questionId: string) => {
        return `${import.meta.env.VITE_API_BASE_URL}/question/${questionId}/image`;
    };
     const memberImageUrl = (memberId: number) => {
            return `${import.meta.env.VITE_API_BASE_URL}/member/${memberId}/image`;
    };

    const preloadMainImage = (question: QuestionResponse) => {
        const mainImg = new Image();
        mainImg.src = questionImageUrl(question.id);
    };

     const preLoadMemberImages = (membersIds: number[] = []) => {
        membersIds.forEach(memberId => {
            const img = new Image();
            img.src = memberImageUrl(memberId);
        });
    };
    const preloadNextQuestion = async () => {
        if (isPreloading || preloadedQuestion) return;
        setIsPreloading(true);
        try {
            const data = await fetchNextQuestion({ prevQuestionId: currentQuestion?.id });
            preloadMainImage(data.question);
            preLoadMemberImages(data.question.options.map(option => option.id));
            setPreloadedQuestion(data.question);
        } catch (error) {
            console.error("Failed to preload question:", error);
        } finally {
            setIsPreloading(false);
        }
    };

    const getNextQuestion = () => {
        if (preloadedQuestion) {
            setCurrentQuestion(preloadedQuestion);
            setPreloadedQuestion(undefined);
            setElapsedSeconds(0);
            setQuestionStartTime(null);
            setWrongAnswers([]);
        } else {
            fetchNextQuestion({ prevQuestionId: currentQuestion?.id }, {
                onSuccess: (data) => {
                    setCurrentQuestion(data.question);
                    setElapsedSeconds(0);
                    setQuestionStartTime(null);
                    setWrongAnswers([]);
                },
            });
        }
    };

    useEffect(() => {
        if (currentQuestion) {
            preloadNextQuestion();
        }
    }, [currentQuestion]);

    const fireworksRef = useRef<FireworksHandlers>(null)
    const { data: fetchedUserStats } = useQuery({ ...userQueries.stats(browserUUID), staleTime: Infinity })
    const [showFireworks, setShowFireworks] = useState(false);
    const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
    const [numbers, setNumbers] = useState<FloatingNumber[]>([]);
    useEffect(() => {
        if (fetchedUserStats) {
            setPlayerStatus(fetchedUserStats);
        }
    }, [fetchedUserStats]);

    const [playerStatus, setPlayerStatus] = useState<UserStats>();
    const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [imageError, setImageError] = useState(false);
    const [imageAttempt, setImageAttempt] = useState(0);

    useEffect(() => {
        if (!questionStartTime) return;
        const updateElapsedTime = () => {
            setElapsedSeconds((Date.now() - questionStartTime.getTime()) / 1000);
        };
        updateElapsedTime();
        const intervalId = window.setInterval(updateElapsedTime, 100);
        return () => window.clearInterval(intervalId);
    }, [questionStartTime]);

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


    async function answer(e: React.MouseEvent, optionId: number) {
        if (!currentQuestion)
            return;
        const { isCorrect, userStats, xpGained } = await answerQuestionAsync({ qid: currentQuestion.id, memberId: optionId });
        console.log({ isCorrect, userStats });
        
        // Play sounds
        if (isCorrect) {
            soundService.correct();
        } else {
            soundService.wrong();
        }
        
        // Check for level up
        if (playerStatus?.level.level && userStats.level.level > playerStatus.level.level) {
            setShowFireworks(true);
            soundService.levelup();
            setTimeout(() => {
                setShowFireworks(false);
            }, 5000);
        }
        
        // Check for streak milestone (every 5 streak)
        if (userStats.streak > 0 && userStats.streak % 5 === 0 && userStats.streak !== playerStatus?.streak) {
            soundService.streak();
        }
        
        setPlayerStatus(userStats);
        showScore(e, xpGained);
        if (wrongAnswers.length >= 3 || isCorrect) {
            getNextQuestion();
            return;
        }
        if (!isCorrect) {
            setWrongAnswers([...wrongAnswers, optionId]);
        }
    }
   
    if (!currentQuestion)
        return <div className="flex h-full flex-col justify-center items-center gap-1.5 waiting-chairs">
            <div className="text-5xl ">🪑 🪑 🪑</div>
            <p className="text-2xl font-semibold">מחכה לחברים..</p>
        </div>;

    return (
        <div className="mx-auto flex h-full min-h-0 flex-col gap-2 px-3 py-2 sm:gap-4 sm:p-4 lg:max-w-3xl lg:px-8 xl:gap-6 xl:py-6">
            {playerStatus && <PlayerStatsHeader stats={playerStatus} />}
            <TimeBonusMeter elapsedSeconds={elapsedSeconds} />
            <div className="@container-[size] flex min-h-0 flex-1 items-center justify-center">
                <Avatar
                    key={`${currentQuestion.id}-${imageAttempt}`}
                    className="aspect-square h-auto w-[min(100cqh,100cqw)] max-w-64 shrink-0 lg:max-w-80"
                >
                    <AvatarImage src={questionImageUrl(currentQuestion.id)} className="object-cover " alt="User Avatar"
                        onLoad={() => setQuestionStartTime(startTime => startTime ?? new Date())}
                        onLoadingStatusChange={status => {
                            if (status === "error") {
                                setImageError(true);
                                setQuestionStartTime(null);
                                setElapsedSeconds(0);
                            }
                        }}
                    />
                    <AvatarFallback>
                        {imageError ? <div className="flex flex-col items-center gap-3 px-4 text-center">
                            <p role="alert" className="text-sm">לא הצלחנו לטעון את התמונה.</p>
                            <Button variant="outline" onClick={() => {
                                setImageError(false);
                                setImageAttempt(attempt => attempt + 1);
                            }}><RotateCcw />נסו שוב</Button>
                        </div> : <span role="status" className="flex flex-col items-center gap-2 text-sm">
                            <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />טוען תמונה...
                        </span>}
                    </AvatarFallback>
                </Avatar>
            </div>
            <div className="grid shrink-0 gap-1 sm:gap-2 lg:grid-cols-2 lg:gap-3">
                {currentQuestion?.options.map((option) => (
                    <div key={option.id} className={cn("flex min-w-0", { "gap-4": wrongAnswers.includes(option.id) })}>
                        <Button
                            className={cn("flex h-11 min-w-0 grow opacity-100 transition-all sm:h-16 lg:justify-center lg:text-lg xl:h-20", { shake: wrongAnswers.includes(option.id) })}
                            onClick={(e) => answer(e, option.id)}
                            disabled={!questionStartTime || wrongAnswers.includes(option.id)}>
                            <span className="min-w-0 whitespace-normal wrap-break-word">
                                {option.name}
                            </span>
                            <div className="grow lg:hidden"></div>
                        </Button>
                        <div className={cn("w-0 overflow-hidden transition-all flex items-center justify-center", { "w-11 sm:w-16 lg:w-20": wrongAnswers.includes(option.id) })}>
                            <Avatar className="size-11 sm:size-16 lg:size-20 shrink-0">
                                {wrongAnswers.includes(option.id) && (
                                    <AvatarImage src={memberImageUrl(option.id)} alt="User Avatar" className="object-cover" />
                                )}
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
                    className={cn("floating-number", num.value > 0 ? "text-green-500" : "text-red-500")}
                    style={{ left: num.x, top: num.y }}
                    onAnimationEnd={() => handleAnimationEnd(num.id)}
                >
                    <span className="font-bold text-lg sm:text-xl lg:text-2xl drop-shadow-lg">
                        {num.value > 0 ? `+${num.value}` : num.value}
                    </span>
                </div>
            ))}
            {showFireworks && <FireworksComponent className="fixed -z-50 h-screen w-screen" />}

        </div>

    );
}
export { QuestionPage };

