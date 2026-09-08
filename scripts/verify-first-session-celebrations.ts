/**
 * Simulates a brand-new user finishing one lesson (quiz + complete).
 * Run: npx tsx scripts/verify-first-session-celebrations.ts
 */
import { throttleCelebrations } from "../src/lib/celebrations";
import type { Celebration } from "../src/lib/store";

const quizFirst: Celebration = {
  kind: "achievement",
  achievement: {
    id: "quiz-first",
    name: "Sharp Mind",
    description: "Get your first quiz answer right",
    emoji: "🎯",
  },
};

const streakDay1: Celebration = { kind: "streak", streak: 1 };
const level2: Celebration = { kind: "levelup", level: 2 };
const firstLesson: Celebration = {
  kind: "achievement",
  achievement: {
    id: "first-lesson",
    name: "First Byte",
    description: "Complete your first lesson",
    emoji: "🍬",
  },
};

let queue: Celebration[] = [];

// Quiz answered correctly mid-lesson.
queue = throttleCelebrations(queue, [quizFirst], 0);

// Lesson completed (streak + level + first-lesson achievement).
queue = throttleCelebrations(
  queue,
  [streakDay1, level2, firstLesson],
  0
);

console.log("First-lesson celebration queue:");
for (const c of queue) {
  if (c.kind === "achievement") {
    console.log(`  - achievement: ${c.achievement.id}`);
  } else {
    console.log(`  - ${c.kind}`);
  }
}

if (queue.length > 2) {
  console.error(`FAIL: expected at most 2 celebrations, got ${queue.length}`);
  process.exit(1);
}

if (queue.length !== 1 || queue[0].kind !== "achievement" || queue[0].achievement.id !== "first-lesson") {
  console.error("FAIL: expected a single first-lesson achievement celebration");
  process.exit(1);
}

console.log("PASS: calm first session (1 celebration)");
