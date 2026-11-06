import z from "zod";

export const memberSchema = z.object({
  id: z.number(),
  factionId: z.number(),
  imageUrl: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  genderCode: z.number(),
  fraction: z.object({ id: z.number(), name: z.string() })
});

export const membersSchema = z.array(memberSchema).superRefine((members, context) => {
  const seenIds = new Set<number>();
  members.forEach((member, index) => {
    if (seenIds.has(member.id)) {
      context.addIssue({
        code: "custom",
        path: [index, "id"],
        message: `Duplicate member ID: ${member.id}`
      });
    }
    seenIds.add(member.id);
  });
});

export type Member = z.infer<typeof memberSchema>;