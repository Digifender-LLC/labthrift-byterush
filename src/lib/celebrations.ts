import type { Celebration } from "./store";

/** Until this many lessons are done, celebration popups stay gentle. */
const EARLY_LESSON_THRESHOLD = 2;

/** Max overlays shown while still in the early-learning phase. */
const MAX_EARLY_CELEBRATIONS = 2;

/** Unlock silently during early phase — profile still shows them. */
const SILENT_ACHIEVEMENTS_IN_EARLY = new Set(["quiz-first"]);

const ACHIEVEMENT_PRIORITY: Record<string, number> = {
  "first-lesson": 100,
  "quiz-first": 40,
};

function celebrationScore(c: Celebration): number {
  if (c.kind === "achievement") {
    return ACHIEVEMENT_PRIORITY[c.achievement.id] ?? 10;
  }
  if (c.kind === "levelup") return 5;
  if (c.kind === "streak") return c.streak === 1 ? 1 : 8;
  return 0;
}

export function isEarlyCelebrationPhase(completedLessons: number): boolean {
  return completedLessons < EARLY_LESSON_THRESHOLD;
}

/**
 * Limits how many celebration overlays enqueue during a user's first lessons.
 * Achievements are awarded separately — this only shapes the UI queue.
 */
export function throttleCelebrations(
  queue: Celebration[],
  incoming: Celebration[],
  completedLessons: number
): Celebration[] {
  if (!isEarlyCelebrationPhase(completedLessons)) {
    return [...queue, ...incoming];
  }

  const room = Math.max(0, MAX_EARLY_CELEBRATIONS - queue.length);
  if (room === 0) return queue;

  let filtered = incoming.filter(
    (c) =>
      c.kind !== "achievement" ||
      !SILENT_ACHIEVEMENTS_IN_EARLY.has(c.achievement.id)
  );

  // Day-one streak is folded into lesson-complete feedback — skip the extra modal.
  const hasMeaningfulIncoming = filtered.some(
    (c) => c.kind === "achievement" || c.kind === "levelup"
  );
  if (hasMeaningfulIncoming || queue.length > 0) {
    filtered = filtered.filter((c) => c.kind !== "streak" || c.streak !== 1);
  }

  // Inline XP floats already celebrate level-ups during the first lessons.
  filtered = filtered.filter((c) => c.kind !== "levelup");

  const sorted = [...filtered].sort(
    (a, b) => celebrationScore(b) - celebrationScore(a)
  );

  return [...queue, ...sorted.slice(0, room)];
}
