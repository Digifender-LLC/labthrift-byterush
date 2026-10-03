"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LESSONS, TOPICS } from "./content";
import {
  newlyUnlocked,
  type Achievement,
  type ProgressSnapshot,
} from "./achievements";
import type { QuizQuestion } from "./quizzes";
import type {
  InventoryStatus,
  ProgressPayload,
  PublicUser,
  QuizAnswerRecord,
} from "./syncTypes";
import { EMPTY_PROGRESS, normalizeProgress, mergeProgress, markActivity, resetSnapshot, type NormalizedProgress } from "./syncTypes";
import { actOnProject, type ProjectAction } from "./projectProgress";
import { throttleCelebrations } from "./celebrations";
import { deleteServerProgress, fetchServerProgress, pushProgress } from "./api";
import { setMuted } from "./sounds";

export const XP_PER_CARD = 10;
export const XP_PER_LESSON = 25;
export const XP_PER_STREAK_DAY = 50;
export const XP_PER_QUIZ = 15;
export const XP_PER_INVENTORY = 5;

/** Level curve: each level requires progressively more XP. */
export function levelForXp(xp: number) {
  return Math.floor(Math.sqrt(xp / 60)) + 1;
}
export function xpForLevel(level: number) {
  return (level - 1) * (level - 1) * 60;
}

export type Celebration =
  | { kind: "streak"; streak: number }
  | { kind: "achievement"; achievement: Achievement }
  | { kind: "levelup"; level: number };

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

interface AppState extends NormalizedProgress {
  pendingAttach: string | null;
  pendingReset: { id: string; generation: number } | null;
  projectAction: (id: string, action: ProjectAction) => void;
  hydrated: boolean;
  onboarded: boolean;
  followedTopics: string[];
  xp: number;
  cardsRead: number;
  completedLessons: string[];
  streak: number;
  bestStreak: number;
  lastActiveDay: string | null;
  unlockedAchievements: string[];
  soundEnabled: boolean;
  celebrations: Celebration[];
  /** First attempt per quiz question, keyed by question id. */
  quizAnswers: Record<string, QuizAnswerRecord>;
  /** Gear profile: what the user has, plans, or passed on. */
  inventory: Record<string, InventoryStatus>;
  /** Signed-in account, or null when browsing anonymously. */
  user: PublicUser | null;
  /**
   * Which account the local learning progress belongs to. Null while
   * anonymous; set after sign-in/register. Used to avoid merging one user's
   * local progress into a different account on the same device.
   */
  progressUserId: string | null;

  setHydrated: () => void;
  toggleTopic: (id: string) => void;
  finishOnboarding: () => void;
  readCard: () => void;
  completeLesson: (lessonId: string) => void;
  /** Records a first attempt. Returns whether XP was awarded. */
  answerQuiz: (question: QuizQuestion, choice: number) => boolean;
  setInventoryItem: (itemId: string, status: InventoryStatus) => void;
  consumeCelebration: () => void;
  setSoundEnabled: (v: boolean) => void;
  setUser: (user: PublicUser | null) => void;
  setProgressUserId: (id: string | null) => void;
  /** Merges a server snapshot into local state (after sign-in / sync). */
  applyServerProgress: (progress: ProgressPayload) => void;
  resetProgress: () => void;
}

function topicsFullyCompleted(completed: string[]): number {
  return TOPICS.filter((t) => {
    const lessons = LESSONS.filter((l) => l.topicId === t.id);
    return lessons.length > 0 && lessons.every((l) => completed.includes(l.id));
  }).length;
}

export function quizCorrectCount(
  quizAnswers: Record<string, QuizAnswerRecord>
): number {
  return Object.values(quizAnswers).filter((a) => a.correct).length;
}

function buildSnapshot(s: {
  completedLessons: string[];
  cardsRead: number;
  streak: number;
  bestStreak: number;
  xp: number;
  followedTopics: string[];
  quizAnswers: Record<string, QuizAnswerRecord>;
  inventory: Record<string, InventoryStatus>;
}): ProgressSnapshot {
  return {
    lessonsCompleted: s.completedLessons.length,
    cardsRead: s.cardsRead,
    streak: s.streak,
    bestStreak: s.bestStreak,
    level: levelForXp(s.xp),
    followedTopics: s.followedTopics.length,
    topicsFullyCompleted: topicsFullyCompleted(s.completedLessons),
    quizCorrect: quizCorrectCount(s.quizAnswers),
    quizAnswered: Object.keys(s.quizAnswers).length,
    inventoryAnswered: Object.keys(s.inventory).length,
  };
}

/** The syncable slice of the current state. */
export function toProgressPayload(s: ProgressPayload): NormalizedProgress {
  return normalizeProgress(Object.fromEntries(Object.keys(EMPTY_PROGRESS).map(k => [k, s[k as keyof ProgressPayload]])) as unknown as ProgressPayload);
}

// Debounced background sync: batches rapid-fire actions (card taps) into one
// PUT. The server merges and echoes back; we merge that into local state so
// multiple devices converge. Failures are silent — localStorage remains the
// offline source of truth and the next action retries.
let syncTimer: ReturnType<typeof setTimeout> | null = null;
let onlineListenerAttached = false;

function scheduleSync() {
  const s = useApp.getState();
  if (!s.user) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    syncTimer = null;
    await flushSync();
  }, 1500);
}

let syncing: Promise<ProgressPayload | null> | null = null;
let accountEpoch = 0;
let accountReady = false;
async function flushSync(): Promise<ProgressPayload | null> {
  if (syncing) { await syncing; return flushSync(); }
  const owner = useApp.getState().user?.id;
  const epoch = accountEpoch;
  if (!owner || !accountReady) return null;
  const valid = () => epoch === accountEpoch && useApp.getState().user?.id === owner;
  syncing = (async () => {
    try {
      const pending = useApp.getState().pendingReset;
      if (pending) {
        const { progress } = await deleteServerProgress(pending);
        if (!valid() || useApp.getState().pendingReset?.id !== pending.id) return null;
        if (progress.resetId === pending.id) useApp.setState({ generation: progress.generation, pendingReset: null });
        else useApp.setState({ ...normalizeProgress(progress), pendingReset: null });
      }
      const before = useApp.getState();
      const { progress } = await pushProgress(toProgressPayload(before));
      if (valid() && !useApp.getState().pendingReset) useApp.getState().applyServerProgress(progress);
      return progress;
    } catch { return null; } // Local state is persisted immediately; reconnect retries.
  })();
  try { return await syncing; } finally { syncing = null; }
}
export async function syncNow() { return flushSync(); }

/** Attach anonymous work once; replace account-owned work before loading another account. */
export async function attachAccount(user: PublicUser): Promise<void> {
  const epoch = ++accountEpoch;
  accountReady = false;
  const prior = useApp.getState();
  const anonymous = prior.progressUserId === null || prior.pendingAttach === user.id;
  const switching = prior.progressUserId !== null && prior.progressUserId !== user.id;
  useApp.setState({ ...(switching ? { ...EMPTY_PROGRESS, pendingReset: null, celebrations: [] } : {}), user, progressUserId: user.id, pendingAttach: anonymous ? user.id : null });
  const { progress } = await fetchServerProgress();
  if (epoch !== accountEpoch || useApp.getState().user?.id !== user.id) return;
  const server = normalizeProgress(progress ?? EMPTY_PROGRESS);
  const current = useApp.getState();
  if (switching) useApp.setState({ ...server, onboarded: current.onboarded || !!server.followedTopics.length });
  else if (anonymous) useApp.setState({ ...mergeProgress({ ...toProgressPayload(current), generation: server.generation, resetId: server.resetId }, server), pendingReset: null });
  else if (!current.pendingReset) current.applyServerProgress(server);
  useApp.setState({ pendingAttach: null });
  accountReady = true;
  await syncNow();
}

export function detachAccount() {
  accountEpoch++;
  accountReady = false;
  useApp.setState({ ...EMPTY_PROGRESS, user: null, progressUserId: null, pendingAttach: null, pendingReset: null, celebrations: [] });
}

function attachOnlineRetry() {
  if (onlineListenerAttached || typeof window === "undefined") return;
  onlineListenerAttached = true;
  window.addEventListener("online", () => {
    const user = useApp.getState().user;
    if (user && !accountReady) void attachAccount(user).catch(() => {});
    else void flushSync();
  });
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...EMPTY_PROGRESS,
      pendingReset: null,
      pendingAttach: null,
      hydrated: false,
      onboarded: false,
      followedTopics: [],
      xp: 0,
      cardsRead: 0,
      completedLessons: [],
      streak: 0,
      bestStreak: 0,
      lastActiveDay: null,
      unlockedAchievements: [],
      soundEnabled: true,
      celebrations: [],
      quizAnswers: {},
      inventory: {},
      user: null,
      progressUserId: null,

      setHydrated: () => {
        set({ hydrated: true });
        attachOnlineRetry();
      },

      toggleTopic: (id) => {
        set((s) => ({
          followedTopics: s.followedTopics.includes(id)
            ? s.followedTopics.filter((t) => t !== id)
            : [...s.followedTopics, id],
        }));
        scheduleSync();
      },

      finishOnboarding: () => set({ onboarded: true }),

      readCard: () => {
        const s = get();
        const prevLevel = levelForXp(s.xp);
        const xp = s.xp + XP_PER_CARD;
        const updates: Partial<AppState> = { xp, learningXp: s.learningXp + XP_PER_CARD, cardsRead: s.cardsRead + 1 };
        const celebrations: Celebration[] = [];
        if (levelForXp(xp) > prevLevel) {
          celebrations.push({ kind: "levelup", level: levelForXp(xp) });
        }
        set({
          ...updates,
          celebrations: throttleCelebrations(
            s.celebrations,
            celebrations,
            s.completedLessons.length
          ),
        });
        scheduleSync();
      },

      completeLesson: (lessonId) => {
        const s = get();
        if (s.completedLessons.includes(lessonId)) return;

        const celebrations: Celebration[] = [];
        const activity = markActivity(toProgressPayload(s), todayKey());
        const { streak, bestStreak, lastActiveDay } = activity;
        if (activity.dailyBonusDays.length > s.dailyBonusDays.length) celebrations.push({ kind: "streak", streak });
        const prevLevel = levelForXp(s.xp);
        const xp = activity.xp + XP_PER_LESSON;
        const completedLessons = [...s.completedLessons, lessonId];
        const newLevel = levelForXp(xp);
        if (newLevel > prevLevel) {
          celebrations.push({ kind: "levelup", level: newLevel });
        }

        const unlocked = newlyUnlocked(
          buildSnapshot({ ...s, completedLessons, streak, bestStreak, xp }),
          s.unlockedAchievements
        );
        for (const a of unlocked) {
          celebrations.push({ kind: "achievement", achievement: a });
        }

        set({
          ...activity,
          xp,
          learningXp: s.learningXp + XP_PER_LESSON,
          completedLessons,
          streak,
          bestStreak,
          lastActiveDay,
          unlockedAchievements: [
            ...s.unlockedAchievements,
            ...unlocked.map((a) => a.id),
          ],
          celebrations: throttleCelebrations(
            s.celebrations,
            celebrations,
            s.completedLessons.length
          ),
        });
        scheduleSync();
      },

      answerQuiz: (question, choice) => {
        const s = get();
        // Only the first attempt counts — re-taking a lesson won't farm XP.
        if (s.quizAnswers[question.id]) return false;

        const correct = choice === question.correctIndex;
        const quizAnswers: Record<string, QuizAnswerRecord> = {
          ...s.quizAnswers,
          [question.id]: { choice, correct, lessonId: question.lessonId },
        };

        const celebrations: Celebration[] = [];
        let xp = s.xp;
        if (correct) {
          const prevLevel = levelForXp(xp);
          xp += XP_PER_QUIZ;
          if (levelForXp(xp) > prevLevel) {
            celebrations.push({ kind: "levelup", level: levelForXp(xp) });
          }
        }

        const unlocked = newlyUnlocked(
          buildSnapshot({ ...s, quizAnswers, xp }),
          s.unlockedAchievements
        );
        for (const a of unlocked) {
          celebrations.push({ kind: "achievement", achievement: a });
        }

        set({
          xp,
          learningXp: s.learningXp + (correct ? XP_PER_QUIZ : 0),
          quizAnswers,
          unlockedAchievements: [
            ...s.unlockedAchievements,
            ...unlocked.map((a) => a.id),
          ],
          celebrations: throttleCelebrations(
            s.celebrations,
            celebrations,
            s.completedLessons.length
          ),
        });
        scheduleSync();
        return correct;
      },

      setInventoryItem: (itemId, status) => {
        const s = get();
        const firstAnswer = !(itemId in s.inventory);
        const inventory = { ...s.inventory, [itemId]: status };

        const celebrations: Celebration[] = [];
        let xp = s.xp;
        if (firstAnswer) {
          const prevLevel = levelForXp(xp);
          xp += XP_PER_INVENTORY;
          if (levelForXp(xp) > prevLevel) {
            celebrations.push({ kind: "levelup", level: levelForXp(xp) });
          }
        }

        const unlocked = newlyUnlocked(
          buildSnapshot({ ...s, inventory, xp }),
          s.unlockedAchievements
        );
        for (const a of unlocked) {
          celebrations.push({ kind: "achievement", achievement: a });
        }

        set({
          xp,
          learningXp: s.learningXp + (firstAnswer ? XP_PER_INVENTORY : 0),
          inventoryUpdatedAt: { ...s.inventoryUpdatedAt, [itemId]: Math.max(Date.now(), (s.inventoryUpdatedAt[itemId] ?? 0) + 1) },
          inventory,
          unlockedAchievements: [
            ...s.unlockedAchievements,
            ...unlocked.map((a) => a.id),
          ],
          celebrations: throttleCelebrations(
            s.celebrations,
            celebrations,
            s.completedLessons.length
          ),
        });
        scheduleSync();
      },

      consumeCelebration: () =>
        set((s) => ({ celebrations: s.celebrations.slice(1) })),

      setSoundEnabled: (v) => {
        setMuted(!v);
        set({ soundEnabled: v });
      },

      setUser: (user) => set({ user }),

      setProgressUserId: (id) => set({ progressUserId: id }),

      projectAction: (id, action) => {
        const s = get();
        set(actOnProject(toProgressPayload(s), id, action));
        scheduleSync();
      },
      applyServerProgress: (progress) => {
        const s = get();
        const merged = mergeProgress(toProgressPayload(s), progress);
        set({ ...merged, onboarded: s.onboarded || merged.followedTopics.length > 0 });
      },
      resetProgress: () => {
        const s = get();
        const id = crypto.randomUUID();
        set({ ...resetSnapshot(toProgressPayload(s), id), celebrations: [], pendingReset: s.progressUserId ? { id, generation: s.pendingReset?.generation ?? s.generation } : null });
        scheduleSync();
      },
    }),
    {
      name: "byterush-store",
      version: 2,
      migrate: (persisted) => {
        const old = persisted as AppState;
        return { ...old, ...normalizeProgress(old), pendingReset: old.pendingReset ?? null, pendingAttach: old.pendingAttach ?? null };
      },
      partialize: (s) => ({ ...toProgressPayload(s), onboarded: s.onboarded, soundEnabled: s.soundEnabled,
        user: s.user, progressUserId: s.progressUserId, pendingAttach: s.pendingAttach, pendingReset: s.pendingReset }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          setMuted(!state.soundEnabled);
          state.setHydrated();
        }
      },
    }
  )
);

/**
 * A streak is "alive" if the user was active today or yesterday.
 * Displayed streak drops to 0 once a full day is missed.
 */
export function displayStreak(streak: number, lastActiveDay: string | null) {
  if (!lastActiveDay) return 0;
  if (lastActiveDay === todayKey() || lastActiveDay === yesterdayKey())
    return streak;
  return 0;
}

export function streakCompletedToday(lastActiveDay: string | null) {
  return lastActiveDay === todayKey();
}
