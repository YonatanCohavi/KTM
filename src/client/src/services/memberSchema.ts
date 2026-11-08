import z from "zod";

export const Member = z.object({
  mkId: z.number(),
  factionId: z.number(),
  firstname: z.string(),
  factionName: z.string(),
  lastname: z.string(),
  genderId: z.number(),
});

export type Member = z.infer<typeof Member>;  