import z from "zod";
import { memberSchema, type Member } from "./memberSchema";

const weightSchema = z.object({
    id: z.number(),
    genderCode: z.number(),
    weight: z.number().finite().nonnegative()
});
type weight = z.infer<typeof weightSchema>;

const questionSchema = z.object({
    answer: memberSchema,
    options: z.array(memberSchema).length(4)
});

export type Question = {
    answer: Member,
    options: Member[]
}
export function GetQuestion(members: Member[], exclude:number[] = []): Question | undefined {
    const weights = initWeights(members).filter(w => !exclude.includes(w.id));
    if (weights.length === 0) {
        console.log("No members available to select from.");
        return;
    }
    function shuffle<T>(array: T[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    shuffle(weights);
    const weight = pickWeight(weights);
    const options: weight[] = [weight];
    const selectedIds = options.map(o => o.id);
    for (let index = 0; index < 3; index++) {
        const selected = pickWeight(weights, weight.genderCode, selectedIds);
        options.push(selected);
        selectedIds.push(selected.id);
    }
    
    shuffle(options);
    const membersById = new Map(members.map(member => [member.id, member]));
    return questionSchema.parse({
        answer: membersById.get(weight.id),
        options: options.map(option => membersById.get(option.id))
    });
}
export function setAnswer(id: number, isCorrect: boolean) {
    const weightsJson = localStorage.getItem("memberWeights");
    if (!weightsJson) {
        throw new Error("Weights not initialized");
    }
    const weigths = JSON.parse(weightsJson) as weight[];
    const updatedWeights = weigths.map(w => {
        if (w.id === id) {
            const factor = isCorrect ? 0.95 : 1.2;
            return { ...w, weight: w.weight * factor };
        }
        return w;
    });
    const total = updatedWeights.reduce((sum, q) => sum + q.weight, 0);
    updatedWeights.map(w => ({ ...w, weight: w.weight / total }));
    localStorage.setItem("memberWeights", JSON.stringify(updatedWeights));
}

function pickWeight(weights: weight[], gender?: number, exclude: number[] = []): weight {
    const filtered = weights.filter(m => !exclude.includes(m.id) && (!gender ? true : m.genderCode == gender));
    const totalWeight = filtered.reduce((sum, q) => sum + q.weight, 0);
    const r = Math.random() * totalWeight;
    let cumulative = 0;

    for (const q of filtered) {
        cumulative += q.weight;
        if (r <= cumulative) {
            return q;
        }
    }
    console.error('pickWeight failed to pick a weight. This should not happen.');
    // Fallback (should not happen)
    return weights[weights.length - 1];
}
function initWeights(members: Member[]) {
    const currentWeightsJson = localStorage.getItem("memberWeights");
    if (currentWeightsJson) {
        const memberIds = new Set(members.map(member => member.id));
        const currentWeights = z.array(weightSchema).superRefine((weights, context) => {
            weights.forEach((currentWeight, index) => {
                if (!memberIds.has(currentWeight.id)) {
                    context.addIssue({
                        code: "custom",
                        path: [index, "id"],
                        message: `Stored weight references unknown member ID: ${currentWeight.id}`
                    });
                }
            });
        }).parse(JSON.parse(currentWeightsJson));
        const missingWeights = members.filter(m => !currentWeights.find(w => w.id === m.id))
        if (missingWeights.length > 0) {
            const newWeights = missingWeights.map(m => ({ id: m.id, genderCode: m.genderCode, weight: 1 }));
            currentWeights.push(...newWeights);
        }
        localStorage.setItem("memberWeights", JSON.stringify(currentWeights));
        return currentWeights;
    }
    const weights = members.map(m => ({ id: m.id, genderCode: m.genderCode, weight: 1 }));
    localStorage.setItem("memberWeights", JSON.stringify(weights));
    return weights;
}