type PlayerStats = {
  xp: number;         // unified XP (also acts as score)
  level: number;
  streak: number;
  lastPlay: Date;
};

type UpdateOptions = {
  basePoints: number;
  responseTimeSec?: number;
  penalizeStreak?: boolean;
};

type UpdateRespose = {
  stats: PlayerStats,
  leveledUp: boolean
  xpGained: number
}

export const knowledgeLevelIcons = [
  "Baby",       // 1 - Newbie
  "BookOpen",   // 2 - Student
  "Lightbulb",  // 3 - Thinker
  "Puzzle",     // 4 - Problem Solver
  "Brain",      // 5 - Scholar
  "Microscope", // 6 - Researcher
  "Book",       // 7 - Expert
  "GraduationCap", // 8 - Professor
  "Zap",        // 9 - Genius
  "Owl",        // 10 - Sage / Wisdom Master
];
export const LEVEL_NAMES_HE: string[] = [
  // 1–10: מתחיל
  "מתחיל",
  "מתלמד",
  "חניך",
  "טירון",
  "לומד",
  "חוקר צעיר",
  "מגלה",
  "שוליה",
  "סייר",
  "מתנסה",

  // 11–20: בינוני
  "מתמקצע",
  "מנוסה",
  "משפר ביצועים",
  "עוזר מומחה",
  "בעל ניסיון",
  "בשליטה",
  "בקיא",
  "משקיען",
  "מתקדם",
  "מוכשר",

  // 21–30: מתקדם
  "מומחה",
  "מקצוען",
  "אסטרטג",
  "מדריך",
  "מאסטר",
  "אלוף",
  "מאמן",
  "מצטיין",
  "יועץ בכיר",
  "חכם",

  // 31–40: עלית
  "גיבור",
  "מנהיג",
  "שומר",
  "כובש",
  "מפקד",
  "פרדיגמה",
  "עילוי",
  "חלוץ",
  "מאיר דרך",
  "אגדה",

  // 41–50: אגדי
  "מיתולוגי",
  "על-אנושי",
  "נשגב",
  "נבחר",
  "טיטאן",
  "שמימי",
  "אלוהי",
  "נצחי",
  "אין-סופי",
  "עליון",
];


export function getLevelName(level: number): string {
  if (level < 1) return "לא ידוע";
  if (level > LEVEL_NAMES_HE.length) return LEVEL_NAMES_HE[LEVEL_NAMES_HE.length - 1];
  return LEVEL_NAMES_HE[level - 1];
}
const STORAGE_KEY = "playerStats";
export function updateStats(
  player: PlayerStats,
  options: UpdateOptions
): UpdateRespose {
  const now = new Date();
  const { responseTimeSec, basePoints, penalizeStreak = false } = options;

  // --- 1. Handle streaks ---
  const hoursSinceLastPlay =
    (now.getTime() - player.lastPlay.getTime()) / (1000 * 60 * 60);
  let streak = hoursSinceLastPlay <= 24 ? player.streak + 1 : 1;

  if (basePoints < 0 && penalizeStreak) {
    streak = 0;
  }

  // --- 2. Multipliers ---
  const streakMultiplier = 1 + streak * 0.05;
  //const luckyBoost = basePoints > 0 && Math.random() < 0.1 ? 2 : 1;
  const luckyBoost = 1;
  const timeBonusMultiplier = getTimeBonusMultiplier(responseTimeSec);
  const totalChange = Math.round(basePoints * streakMultiplier * luckyBoost * timeBonusMultiplier);

  // --- 3. Level progression ---
  const currentLevelXP = getTotalXPForLevel(player.level);
  const nextLevelXP = getTotalXPForLevel(player.level + 1);
  let xp = player.xp + totalChange;

  // Prevent dropping below start of current level
  xp = Math.max(currentLevelXP, xp);

  // Level up or down if needed
  let level = player.level;
  if (xp >= nextLevelXP) {
    level++;
  }

  // --- 4. Save and return updated state ---
  const updated: PlayerStats = { xp, level, streak, lastPlay: now };
  saveStats(updated);
  return {
    stats: updated,
    leveledUp: level > player.level,
    xpGained: totalChange
  };
}

function getTimeBonusMultiplier(responseTimeSec?: number): number {
  if (responseTimeSec === undefined) return 1;
  if (responseTimeSec <= 2) return 1.3;  // +30%
  if (responseTimeSec <= 5) return 1.15; // +15%
  if (responseTimeSec <= 10) return 1.05; // +5%
  return 1; // no bonus
}

/**
 * XP required for a given level
 * (total cumulative XP, not per level)
 */
export function getTotalXPForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(100 * Math.pow(1.2, i - 1));
  }
  return total;
}

/**
 * Save & load helpers
 */
export function saveStats(stats: PlayerStats): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...stats, lastPlay: stats.lastPlay.toISOString() })
  );
}

export function loadStats(): PlayerStats {
  console.log('load stats');
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return { xp: 0, level: 1, streak: 0, lastPlay: new Date() };
  }
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    lastPlay: new Date(parsed.lastPlay),
  };
}

export function resetStats(): PlayerStats {
  localStorage.removeItem(STORAGE_KEY);
  return { xp: 0, level: 1, streak: 0, lastPlay: new Date() };
}

