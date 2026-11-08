import FireworksComponent from "@/components/FireworksComponent";
import { PlayerStatsHeader } from "@/components/PlayerStatsHeader";
import { TimeBonusMeter } from "@/components/TimeBonusMeter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/userContext";
import { cn } from "@/lib/utils";
import { useAnswer, useNextQuestion, type QuestionResponse, type UserStats } from "@/services/question-api";
import { loadStats } from "@/services/statsService";
import type { FireworksHandlers } from '@fireworks-js/react';
import { LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FloatingNumber {
    id: number;
    x: number;
    y: number;
    value: number;
}

const QuestionPage = () => {
    const { id: browserUUID, name: playerName } = useUser();
    const { mutateAsync: fetchNextQuestion } = useNextQuestion({ browserUUID });
    const { mutateAsync: answerQuestionAsync } = useAnswer({ browserUUID });
    const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse>();
    useEffect(() => {
        getNextQuestion();
    }, []);

    const getNextQuestion = () => {
        fetchNextQuestion(undefined, {
            onSuccess: (data) => {
                setCurrentQuestion(data.question);
                setElapsedSeconds(0);
                setQuestionStartTime(null);
                setWrongAnswers([]);
            },
        });
    };
    useEffect(() => {
        if (currentQuestion) {
            console.log("Current question:", currentQuestion);
        }
    }, [currentQuestion]);
    // useEffect(() => {
    //     const handleFocus = () => {
    //         setPlayerStatus(loadStats());
    //     };

    //     window.addEventListener('focus', handleFocus);

    //     return () => {
    //         window.removeEventListener('focus', handleFocus);
    //     };
    // }, []);

    const fireworksRef = useRef<FireworksHandlers>(null)
    const [showFireworks, setShowFireworks] = useState(false);
    const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
    const [numbers, setNumbers] = useState<FloatingNumber[]>([]);

    // const [question, setQuestion] = useState<Question | undefined>(undefined);
    // const { data: members, isError: membersError, refetch: refetchMembers } = useMembersQuery();
    const [playrsStatus, setPlayerStatus] = useState<UserStats>();
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

    // useEffect(() => {
    //     newQuestion();
    // }, [members]);



    // function newQuestion() {
    //     if (!members)
    //         return;
    //     const exclude: number[] = [];
    //     if (question) {
    //         exclude.push(question?.answer.id);
    //         exclude.push(...question.options.map(o => o.id));
    //     }
    //     const q = GetQuestion(members, exclude);
    //     setQuestion(q);
    //     setWrongAnswers([]);
    //     setQuestionStartTime(null);
    //     setElapsedSeconds(0);
    //     setImageError(false);
    //     setImageAttempt(0);
    // }


    // useEffect(() => {
    //     if (!question)
    //         return;
    //     question.options.forEach(option => {
    //         const img = new Image();
    //         img.src = option.imageUrl;
    //     });
    // }, [question]);

    async function answer(e: React.MouseEvent, optionId: number) {
        if (!currentQuestion)
            return;
        const { isCorrect, userStats } = await answerQuestionAsync({ qid: currentQuestion.id, memberId: optionId });
        console.log({ isCorrect, userStats });
        setPlayerStatus(userStats);
        if (!isCorrect) {
            setWrongAnswers([...wrongAnswers, optionId]);
        }
        if (wrongAnswers.length >= 3 || isCorrect) {
            getNextQuestion();
            return;
        }
    }
    // function answer(e: React.MouseEvent, optionId: number) {
    //     if (!currentQuestion || !questionStartTime)
    //         return;

    //     let correct = true;
    //     let points = 10;
    //     if (optionId != currentQuestion.answer.id) {
    //         setWrongAnswers([...wrongAnswers, optionId]);
    //         correct = false;
    //     }
    //     // user clicked on the last option
    //     if (wrongAnswers.length >= 3) {
    //         newQuestion();
    //         return;
    //     }

    //     // did not know both members
    //     setAnswer(optionId, correct);
    //     if (!correct)
    //         setAnswer(question.answer.id, false);

    //     if (correct) {
    //         points -= (wrongAnswers.length) * 3;
    //     } else {
    //         points *= -1;
    //     }
    //     const responseTimeSec = (new Date().getTime() - questionStartTime.getTime()) / 1000;
    //     const { stats: newStatus, xpGained } = updateStats(playrsStatus, correct ? { basePoints: points, responseTimeSec } : { basePoints: points, penalizeStreak: true });
    //     if (newStatus.level > playrsStatus.level) {
    //         setShowFireworks(true);
    //         setTimeout(() => {
    //             setShowFireworks(false);
    //         }, 5000);
    //     }
    //     if (xpGained > 0) {
    //         showScore(e, xpGained);
    //     } else {
    //         showScore(e, xpGained);
    //     }
    //     setPlayerStatus(newStatus);

    //     // Sync to leaderboard (async, doesn't block UI)
    //     void syncPlayerToLeaderboard(browserUUID, playerName, newStatus.level, newStatus.xp, newStatus.streak);
    //     if (wrongAnswers.length >= 3 || correct)
    //         newQuestion();
    // }

    // if (membersError)
    //     return <div className="flex h-full flex-col justify-center items-center gap-4 text-xl font-semibold">
    //         <p>לא הצלחנו לטעון את נתוני החברים.</p>
    //         <Button onClick={() => { void refetchMembers(); }}>נסו שוב</Button>
    //     </div>;

    if (!currentQuestion)
        return <div className="flex h-full flex-col justify-center items-center gap-1.5 waiting-chairs">
            <div className="text-5xl ">🪑 🪑 🪑</div>
            <p className="text-2xl font-semibold">מחכה לחברים..</p>
        </div>;

    function imageURL(memberId: number) {
        return `${import.meta.env.VITE_API_BASE_URL}/member/${memberId}/image`;
    }
    function questionImageUrl(questionId: string) {
        return `${import.meta.env.VITE_API_BASE_URL}/question/${questionId}/image`;
    }
    return (
        <div className="mx-auto flex h-full min-h-0 flex-col gap-2 px-3 py-2 sm:gap-4 sm:p-4 lg:max-w-3xl lg:px-8 xl:gap-6 xl:py-6">
            {playrsStatus && <PlayerStatsHeader stats={playrsStatus} />}
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
            {/* <div className="grow"/> */}
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
                        <div className={cn("w-0 overflow-hidden transition-all", { "w-10": wrongAnswers.includes(option.id) })}>
                            <Avatar className="my-auto size-8 sm:size-10">
                                <AvatarImage src={imageURL(option.id)} alt="User Avatar" className="object-cover" />
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
export { QuestionPage };

