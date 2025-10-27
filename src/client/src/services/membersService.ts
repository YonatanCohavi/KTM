import { useQuery } from "@tanstack/react-query";
import z from "zod";
import { knessetApi } from "./knessetApi";
const memberSchema = z.object({
  id: z.number(),
  factionId: z.number(),
  imageUrl: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  genderCode: z.number(),
  fraction: z.object({ id: z.number(), name: z.string() })
})
export type Member = z.infer<typeof memberSchema>;
export function useMembersQuery() {
    return useQuery({
        queryKey: ["members"],
        queryFn: async () => {
            return await knessetApi.getmembers();
        },
        refetchOnWindowFocus: false
    })
}