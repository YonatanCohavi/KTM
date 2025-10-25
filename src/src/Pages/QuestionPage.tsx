import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMembersQuery } from "@/services/membersService";
import { GetQuestion, setAnswer, type Question } from "@/services/questionService";
import { useEffect, useState } from "react";

const QuestionPage = () => {
    const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
    const [question, setQuestion] = useState<Question | undefined>(undefined);
    const { data: members } = useMembersQuery();
    useEffect(() => {
        newQuestion();
    }, [members]);

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
        if (optionId != question.answer.id) {
            setWrongAnswers([...wrongAnswers, optionId]);
            setAnswer(optionId, false);
            return;
        }
        if (wrongAnswers.length < 3) {
            setAnswer(optionId, true);
        }
        newQuestion();
    }
    if (!members || !question)
        return <div className="flex h-full justify-center items-center text-2xl font-semibold">מחכה לחברים..</div>;
    return (
        <div className="flex flex-col p-4 h-full justify-center">
            <div className="mx-auto">
                <Avatar className="size-72">
                    <AvatarImage src={question.answer.imageUrl} className="object-cover " alt="User Avatar" />
                    <AvatarFallback></AvatarFallback>
                </Avatar>
            </div>
            <div className="grow">
                {
                    wrongAnswers.length > 0 && <Avatar className="size-36 mt-4 mx-auto">
                        <AvatarImage src={question.options.find(o => o.id === wrongAnswers[wrongAnswers.length - 1])?.imageUrl} alt="User Avatar" className="object-cover" />
                        <AvatarFallback></AvatarFallback>
                    </Avatar>
                }
            </div>
            <div className="grid gap-2">
                {question.options.map((option) => (
                    <div key={option.id} className={cn("flex", { "gap-4": wrongAnswers.includes(option.id) })}>
                        <Button className={cn("flex h-16 opacity-100 grow transition-all", { shake: wrongAnswers.includes(option.id) })} onClick={() => answer(option.id)} disabled={wrongAnswers.includes(option.id)}>
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