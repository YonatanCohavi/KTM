import type { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

interface LevelIconProps {
    level: number; // 1–100
    size?: number;
}

export const knowledgeLevelIcons: (keyof typeof Icons)[] = [
    "Baby",           // 1 - Beginner
    "BookOpen",       // 2 - Learner
    "Pencil",         // 3 - Note Taker
    "Lightbulb",      // 4 - Idea Maker
    "Puzzle",         // 5 - Problem Solver
    "Brain",          // 6 - Thinker
    "Microscope",     // 7 - Researcher
    "Book",           // 8 - Scholar
    "LibraryBig",     // 9 - Knowledge Keeper
    "GraduationCap",  // 10 - Graduate
    "PenTool",        // 11 - Innovator
    "Atom",           // 12 - Scientist
    "Globe",          // 13 - Explorer
    "Code",           // 14 - Technologist
    "Binary",         // 15 - Analyst
    "Cpu",            // 16 - Machine Mind
    "Zap",            // 17 - Genius
    "Flame",          // 18 - Visionary
    "Stars",          // 19 - Philosopher
    "Crown",          // 20 - Sage / Master
];

export const LevelIcon = ({ level, size = 24 }: LevelIconProps) => {
    const iconIndex = Math.floor(Math.min(level, 100) / 5);
    const iconName = knowledgeLevelIcons[iconIndex];
    const IconComponent = Icons[iconName] as LucideIcon;
    return <IconComponent size={size} />;
};