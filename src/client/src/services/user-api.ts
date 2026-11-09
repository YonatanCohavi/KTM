import { queryOptions, useMutation } from "@tanstack/react-query"
import api from "./api"
import z from 'zod';


export const UserStats = z.object({
    name: z.string(),
    level: z.object({
        level: z.number(),
        currentLevelXp: z.number(),
        nextLevelXp: z.number()
    }),
    currentLevelXp: z.number(),
    streak: z.number()
});
export type UserStats = z.infer<typeof UserStats>;

const LeaderboardMember = z.object({
    userId: z.string(),
    name: z.string(),
    level: z.number(),
    streak: z.number(),
    xp: z.number()
});
export type LeaderboardMember = z.infer<typeof LeaderboardMember>;
export const userKeys = {
    all: ["user"] as const,
    leaderboard: ["leaderboard"] as const,
    stats: (id: string) => [...userKeys.all, "stats", id] as const,
    weights: (id: string) => [...userKeys.all, "weights", id] as const,
}

export const userQueries = {
    leaderboard: () => queryOptions({
        queryKey: userKeys.leaderboard,
        queryFn: async () => {
            const response = await api.get(`/user/leaderboard`)
            return z.array(LeaderboardMember).parse(response.data);
        }
    }),
    stats: (id: string) => queryOptions({
        queryKey: userKeys.stats(id),
        queryFn: async () => {
            const response = await api.get(`/user/${id}/stats`)
            return UserStats.parse(response.data)
        }
    }),
    weights: (id: string) => queryOptions({
        queryKey: userKeys.weights(id),
        queryFn: async () => {
            const response = await api.get(`/user/${id}/weights`)
            return z.record(z.string(), z.number()).parse(response.data);
        }
    })
}

type UserMutationVariables = {
    name: string;
};

export const useUserMutation = (id:string) => {
    return useMutation({
        mutationFn: async (payload:UserMutationVariables) => {
            await api.patch(`/user/${id}`, { name: payload.name });
        }
    })
}


export const useResetUserMutation = (id:string) => {
    return useMutation({
        mutationFn: async () => {
            await api.patch(`/user/${id}/reset`);
        }
    })
}