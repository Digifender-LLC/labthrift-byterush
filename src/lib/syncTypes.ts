// Shared between the browser app (src/) and the Worker (worker/).
// Keep this file free of "use client", DOM APIs, and Worker APIs.

/** Where a piece of homelab gear stands for this user. */
export type InventoryStatus = "have" | "planned" | "pass";

export interface QuizAnswerRecord {
  /** Which option the user picked on their first attempt. */
  choice: number;
  /** Whether that first attempt was correct. */
  correct: boolean;
  /** Lesson the question lives in — lets the server store structured rows. */
  lessonId: string;
}

/**
 * Everything that syncs between devices for a signed-in user.
 * The client sends its full snapshot; the server merges and echoes back.
 */
export interface ProgressPayload {
  xp: number;
  cardsRead: number;
  completedLessons: string[];
  streak: number;
  bestStreak: number;
  lastActiveDay: string | null;
  unlockedAchievements: string[];
  followedTopics: string[];
  quizAnswers: Record<string, QuizAnswerRecord>;
  inventory: Record<string, InventoryStatus>;
}

export interface PublicUser {
  id: string;
  username: string;
}

export const EMPTY_PROGRESS: ProgressPayload = {
  xp: 0,
  cardsRead: 0,
  completedLessons: [],
  streak: 0,
  bestStreak: 0,
  lastActiveDay: null,
  unlockedAchievements: [],
  followedTopics: [],
  quizAnswers: {},
  inventory: {},
};

function unionStrings(a: string[], b: string[]): string[] {
  return Array.from(new Set([...a, ...b]));
}

/**
 * Merge two progress snapshots without losing anything:
 * counters take the max, sets take the union, and the streak follows
 * whichever snapshot was active most recently. Used both when a device
 * signs in (local + server) and on every sync (client + stored).
 */
export function mergeProgress(
  a: ProgressPayload,
  b: ProgressPayload
): ProgressPayload {
  // Prefer the streak state of whichever side was active last.
  const aDay = a.lastActiveDay ?? "";
  const bDay = b.lastActiveDay ?? "";
  const streakSource = aDay >= bDay ? a : b;

  return {
    xp: Math.max(a.xp, b.xp),
    cardsRead: Math.max(a.cardsRead, b.cardsRead),
    completedLessons: unionStrings(a.completedLessons, b.completedLessons),
    streak: streakSource.streak,
    bestStreak: Math.max(a.bestStreak, b.bestStreak),
    lastActiveDay: streakSource.lastActiveDay,
    unlockedAchievements: unionStrings(
      a.unlockedAchievements,
      b.unlockedAchievements
    ),
    followedTopics: unionStrings(a.followedTopics, b.followedTopics),
    // Incoming (`a`, the client snapshot) wins per question on conflict —
    // devices don't re-send old answers, so the fresher sync carries truth.
    quizAnswers: { ...b.quizAnswers, ...a.quizAnswers },
    // Same for inventory: latest client write wins per item.
    inventory: { ...b.inventory, ...a.inventory },
  };
}

function isStringArray(v: unknown): boolean {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

const INVENTORY_STATUSES = new Set(["have", "planned", "pass"]);

function isQuizAnswersRecord(v: unknown): boolean {
  if (typeof v !== "object" || v === null) return false;
  return Object.values(v).every((entry) => {
    if (typeof entry !== "object" || entry === null) return false;
    const r = entry as Record<string, unknown>;
    return (
      typeof r.choice === "number" &&
      typeof r.correct === "boolean" &&
      typeof r.lessonId === "string"
    );
  });
}

function isInventoryRecord(v: unknown): boolean {
  if (typeof v !== "object" || v === null) return false;
  return Object.values(v).every(
    (status) => typeof status === "string" && INVENTORY_STATUSES.has(status)
  );
}

/** Loose runtime check used by the Worker on untrusted request bodies. */
export function isProgressPayload(v: unknown): v is ProgressPayload {
  if (typeof v !== "object" || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.xp === "number" &&
    Number.isFinite(p.xp) &&
    typeof p.cardsRead === "number" &&
    Number.isFinite(p.cardsRead) &&
    isStringArray(p.completedLessons) &&
    typeof p.streak === "number" &&
    typeof p.bestStreak === "number" &&
    (p.lastActiveDay === null || typeof p.lastActiveDay === "string") &&
    isStringArray(p.unlockedAchievements) &&
    isStringArray(p.followedTopics) &&
    isQuizAnswersRecord(p.quizAnswers) &&
    isInventoryRecord(p.inventory)
  );
}
