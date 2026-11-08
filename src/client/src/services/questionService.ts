import z from "zod";
import { Member, type Member } from "./memberSchema";

const weightSchema = z.object({
    id: z.number(),
    genderCode: z.number(),
    weight: z.number().finite().nonnegative()
});
type weight = z.infer<typeof weightSchema>;

const questionSchema = z.object({
    answer: Member,
    options: z.array(Member).length(4)
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
    const membersById = new Map(members.map(member => [member.mkId, member]));
    return questionSchema.parse({
        answer: membersById.get(weight.id),
        options: options.map(option => membersById.get(option.id))
    });
}
export function setAnswer(id: number, isCorrect: boolean) {
    const weights = loadWeights();
    const updatedWeights = weights.map(w => {
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

export function loadMemberKnowledge(): Map<number, number> {
    return new Map(loadWeights().map(member => [
        member.id,
        Math.round(Math.max(0, Math.min(1, 1 - member.weight)) * 100)
    ]));
}

function reportWeightCorruption(reason: string, removedCount: number) {
    const analyticsWindow = window as Window & {
        gtag?: (command: "event", name: string, parameters: Record<string, string | number>) => void;
    };
    try {
        analyticsWindow.gtag?.("event", "member_weights_corruption", {
            reason,
            removed_count: removedCount
        });
    } catch {
        return;
    }
}

function loadWeights(members?: Member[]): weight[] {
    const storedJson = localStorage.getItem("memberWeights");
    if (storedJson === null) return [];

    let stored: unknown;
    try {
        stored = JSON.parse(storedJson);
    } catch {
        localStorage.removeItem("memberWeights");
        reportWeightCorruption("invalid_json", 1);
        return [];
    }
    if (!Array.isArray(stored)) {
        localStorage.removeItem("memberWeights");
        reportWeightCorruption("invalid_structure", 1);
        return [];
    }

    const membersById = members && new Map(members.map(member => [member.mkId, member]));
    const seenIds = new Set<number>();
    const weights: weight[] = [];
    for (const entry of stored) {
        const parsed = weightSchema.safeParse(entry);
        if (!parsed.success || seenIds.has(parsed.data.id)) continue;
        const currentWeight = parsed.data;
        if (membersById) {
            const member = membersById.get(currentWeight.id);
            if (!member || member.genderId !== currentWeight.genderCode) continue;
        }
        seenIds.add(currentWeight.id);
        weights.push(currentWeight);
    }
    const removedCount = stored.length - weights.length;
    if (removedCount > 0) {
        localStorage.setItem("memberWeights", JSON.stringify(weights));
        reportWeightCorruption("invalid_entries", removedCount);
    }
    return weights;
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
    const weights = loadWeights(members);
    const storedIds = new Set(weights.map(currentWeight => currentWeight.id));
    weights.push(...members.filter(member => !storedIds.has(member.mkId))
        .map(member => ({ id: member.mkId, genderCode: member.genderId, weight: 1 })));
    localStorage.setItem("memberWeights", JSON.stringify(weights));
    return weights;
}