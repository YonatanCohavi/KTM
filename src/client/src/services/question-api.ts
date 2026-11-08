import { useMutation } from "@tanstack/react-query";
import api from "./api";
import z from "zod";


const QuestionResponse = z.object({
    id: z.string(),
    options: z.array(z.object({
        id: z.number(),
        name: z.string()
    }))
})
export type QuestionResponse = z.infer<typeof QuestionResponse>;
export const questionsKeys = {
    all: ["questions"] as const,
}


export function useNextQuestion({ browserUUID }: { browserUUID: string }) {
    return useMutation({
        mutationFn: async () => {
            const response = await api.post('/question/next', {
                'BrowserId': browserUUID
            });
            return z.object({ question: QuestionResponse }).parse(response.data);
        },
        onSuccess: (newQuestion) => {
            console.log("Got new question with ID:", newQuestion.question.id);
        }
    });
}

const userStats = z.object({
    name: z.string(),
    level: z.object({
        level: z.number(),
        currentLevelXp: z.number(),
        nextLevelXp: z.number()
    }),
    currentLevelXp: z.number(),
    streak: z.number()
});
export type UserStats = z.infer<typeof userStats>;
const AnswerResponse = z.object({
    isCorrect: z.boolean(),
    userStats: userStats
});
export type AnswerResponse = z.infer<typeof AnswerResponse>;
export function useAnswer({ browserUUID }: { browserUUID: string }) {
    return useMutation({
        mutationFn: async ({ qid,memberId }: { qid: string, memberId: number }) => {
            const response = await api.post(`/question/${qid}/answer`, {
                'BrowserId': browserUUID,
                'MemberId': memberId
            });
            return AnswerResponse.parse(response.data);
        },
        onSuccess: (response) => {
            console.log("Answer response:", response);
        }
    });
}