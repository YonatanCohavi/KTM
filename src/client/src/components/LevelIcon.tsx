import type { ReactNode } from "react";
import {
    Atom, Baby, Binary, Book, BookOpen, Brain, CircleHelp, Code, Cpu, Crown,
    Flame, Globe, GraduationCap, LibraryBig, Lightbulb, Microscope,
    Pencil, PenTool, Puzzle, Stars, Zap
} from "lucide-react";

interface LevelIconProps {
    level: number; // 1–100
    size?: number;
}

const knowledgeLevelIcons = new Map<number, ReactNode>([
    [1, <Baby />],
    [2, <BookOpen />],
    [3, <Pencil />],
    [4, <Lightbulb />],
    [5, <Puzzle />],
    [6, <Brain />],
    [7, <Microscope />],
    [8, <Book />],
    [9, <LibraryBig />],
    [10, <GraduationCap />],
    [11, <PenTool />],
    [12, <Atom />],
    [13, <Globe />],
    [14, <Code />],
    [15, <Binary />],
    [16, <Cpu />],
    [17, <Zap />],
    [18, <Flame />],
    [19, <Stars />],
    [20, <Crown />]
]);

export const LevelIcon = ({ level, size = 24 }: LevelIconProps) => {
    const iconIndex = Math.max(1, Math.min(knowledgeLevelIcons.size, Math.floor(level / 5) + 1));
    return <span className="inline-flex shrink-0 [&>svg]:size-full" style={{ width: size, height: size }}>
        {knowledgeLevelIcons.get(iconIndex) ?? <CircleHelp />}
    </span>;
};