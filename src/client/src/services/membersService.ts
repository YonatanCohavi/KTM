import { useQuery } from "@tanstack/react-query";
import { knessetApi } from "./knessetApi";
export type { Member } from "./memberSchema";

export function useMembersQuery() {
    return useQuery({
        queryKey: ["members"],
        queryFn: async () => {
            return await knessetApi.getmembers();
        },
        refetchOnWindowFocus: false
    })
}