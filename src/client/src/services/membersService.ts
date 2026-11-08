import { useQuery } from "@tanstack/react-query";
import api from "./api";
import { Member } from "./memberSchema";
import z from "zod";
export type { Member } from "./memberSchema";

export function useMembersQuery() {
    return useQuery({
        queryKey: ["members"],
        queryFn: async () => {
            const response = await api.get("/members");
            return z.array(Member).parse(response.data);
        },
        refetchOnWindowFocus: false
    })
}