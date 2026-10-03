export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export interface ProgressSnapshot {
  lessonsCompleted: number;
  cardsRead: number;
  streak: number;
  bestStreak: number;
  level: number;
  followedTopics: number;
  topicsFullyCompleted: number;
  /** Quiz questions answered correctly on the first attempt. */
  quizCorrect: number;
  /** Total quiz questions answered (right or wrong). */
  quizAnswered: number;
  /** Inventory / gear questions answered. */
  inventoryAnswered: number;
}

type Check = (p: ProgressSnapshot) => boolean;

export const ACHIEVEMENTS: (Achievement & { check: Check })[] = [
  {
    id: "first-lesson",
    name: "First Byte",
    description: "Complete your first lesson",
    emoji: "🍬",
    check: (p) => p.lessonsCompleted >= 1,
  },
  {
    id: "five-lessons",
    name: "Snack Attack",
    description: "Complete 5 lessons",
    emoji: "🍿",
    check: (p) => p.lessonsCompleted >= 5,
  },
  {
    id: "fifteen-lessons",
    name: "Knowledge Feast",
    description: "Complete 15 lessons",
    emoji: "🍱",
    check: (p) => p.lessonsCompleted >= 15,
  },
  {
    id: "thirty-lessons",
    name: "Full Stack Stomach",
    description: "Complete 30 lessons",
    emoji: "🐘",
    check: (p) => p.lessonsCompleted >= 30,
  },
  {
    id: "hundred-cards",
    name: "Century Scroller",
    description: "Read 100 cards",
    emoji: "💯",
    check: (p) => p.cardsRead >= 100,
  },
  {
    id: "streak-3",
    name: "Warming Up",
    description: "Reach a 3-day streak",
    emoji: "🔥",
    check: (p) => p.bestStreak >= 3,
  },
  {
    id: "streak-7",
    name: "On Fire",
    description: "Reach a 7-day streak",
    emoji: "🚒",
    check: (p) => p.bestStreak >= 7,
  },
  {
    id: "streak-30",
    name: "Unstoppable",
    description: "Reach a 30-day streak",
    emoji: "🌋",
    check: (p) => p.bestStreak >= 30,
  },
  {
    id: "level-5",
    name: "Leveling Up",
    description: "Reach level 5",
    emoji: "⬆️",
    check: (p) => p.level >= 5,
  },
  {
    id: "level-10",
    name: "Double Digits",
    description: "Reach level 10",
    emoji: "🔟",
    check: (p) => p.level >= 10,
  },
  {
    id: "explorer",
    name: "Curious Mind",
    description: "Follow 5 or more topics",
    emoji: "🧭",
    check: (p) => p.followedTopics >= 5,
  },
  {
    id: "topic-master",
    name: "Topic Boss",
    description: "Complete every lesson in a topic",
    emoji: "👑",
    check: (p) => p.topicsFullyCompleted >= 1,
  },
  {
    id: "quiz-first",
    name: "Sharp Mind",
    description: "Get your first quiz answer right",
    emoji: "🎯",
    check: (p) => p.quizCorrect >= 1,
  },
  {
    id: "quiz-10",
    name: "Quiz Whiz",
    description: "Answer 10 quiz questions correctly",
    emoji: "🧠",
    check: (p) => p.quizCorrect >= 10,
  },
  {
    id: "quiz-25",
    name: "Walking Wiki",
    description: "Answer 25 quiz questions correctly",
    emoji: "🎓",
    check: (p) => p.quizCorrect >= 25,
  },
  {
    id: "gear-scout",
    name: "Gear Scout",
    description: "Tell us about 3 pieces of your lab",
    emoji: "🧰",
    check: (p) => p.inventoryAnswered >= 3,
  },
  {
    id: "lab-cartographer",
    name: "Lab Cartographer",
    description: "Answer 10 gear questions",
    emoji: "🗺️",
    check: (p) => p.inventoryAnswered >= 10,
  },
];

export function newlyUnlocked(
  snapshot: ProgressSnapshot,
  alreadyUnlocked: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !alreadyUnlocked.includes(a.id) && a.check(snapshot)
  ).map(({ id, name, description, emoji }) => ({ id, name, description, emoji }));
}
