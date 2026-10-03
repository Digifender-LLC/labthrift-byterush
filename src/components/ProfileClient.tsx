"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpenCheck,
  BrainCircuit,
  Layers,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { LESSONS } from "@/lib/content";
import { QUIZZES } from "@/lib/quizzes";
import {
  displayStreak,
  levelForXp,
  quizCorrectCount,
  streakCompletedToday,
  useApp,
  xpForLevel,
} from "@/lib/store";
import { useMounted } from "@/hooks/useMounted";
import { BottomNav } from "@/components/BottomNav";
import { LegalLinks } from "@/components/LegalLinks";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { AccountCard } from "@/components/profile/AccountCard";
import { LabSection } from "@/components/profile/LabSection";
import { Splash } from "@/components/Splash";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ProfileClient() {
  const mounted = useMounted();
  const xp = useApp((s) => s.xp);
  const projects = useApp((s) => s.projects);
  const cardsRead = useApp((s) => s.cardsRead);
  const completedLessons = useApp((s) => s.completedLessons);
  const streak = useApp((s) => s.streak);
  const bestStreak = useApp((s) => s.bestStreak);
  const lastActiveDay = useApp((s) => s.lastActiveDay);
  const unlockedAchievements = useApp((s) => s.unlockedAchievements);
  const quizAnswers = useApp((s) => s.quizAnswers);
  const soundEnabled = useApp((s) => s.soundEnabled);
  const setSoundEnabled = useApp((s) => s.setSoundEnabled);
  const resetProgress = useApp((s) => s.resetProgress);
  const user = useApp((s) => s.user);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!mounted) return <Splash />;

  const level = levelForXp(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const levelPct =
    ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  const liveStreak = displayStreak(streak, lastActiveDay);
  const doneToday = streakCompletedToday(lastActiveDay);

  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-24 pt-12">
        <h1 className="text-2xl font-extrabold">Your stats</h1>
        <LegalLinks className="mb-4 mt-3" />

        {/* account (passkey sign-up / sign-in / signed-in) */}
        <AccountCard />

        {/* streak hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-4 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-orange-600/10 p-5"
        >
          <span
            className={cn(
              "text-5xl",
              liveStreak > 0 ? "animate-flame" : "grayscale opacity-50"
            )}
          >
            🔥
          </span>
          <div>
            <p className="text-3xl font-extrabold">
              {liveStreak} day{liveStreak !== 1 && "s"}
            </p>
            <p className="text-xs text-muted-foreground">
              {doneToday
                ? "Streak safe for today. See you tomorrow."
                : liveStreak > 0
                  ? "Complete a lesson or a new project step today."
                  : "Complete a lesson or a new project step to begin."}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-amber-400/90">
              Best: {bestStreak} day{bestStreak !== 1 && "s"}
            </p>
          </div>
        </motion.div>

        {/* level */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-3 rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <Zap className="size-4 fill-amber-300 text-amber-300" />
              Level {level}
            </p>
            <p className="text-xs font-semibold text-muted-foreground">
              {xp - currentLevelXp} / {nextLevelXp - currentLevelXp} XP to Lv{" "}
              {level + 1}
            </p>
          </div>
          <Progress value={levelPct} className="mt-3 h-2" />
        </motion.div>

        {/* stat grid */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <BookOpenCheck className="size-5 text-emerald-400" />
            <p className="mt-2 text-2xl font-extrabold">
              {completedLessons.length}
              <span className="text-sm font-semibold text-muted-foreground">
                {" "}
                / {LESSONS.length}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">lessons completed</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <Layers className="size-5 text-sky-400" />
            <p className="mt-2 text-2xl font-extrabold">{cardsRead}</p>
            <p className="text-xs text-muted-foreground">cards read</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-2 rounded-2xl border border-border bg-card p-4"
          >
            <BrainCircuit className="size-5 text-violet-400" />
            <p className="mt-2 text-2xl font-extrabold">
              {quizCorrectCount(quizAnswers)}
              <span className="text-sm font-semibold text-muted-foreground">
                {" "}
                / {Object.keys(quizAnswers).length} answered ·{" "}
                {Object.keys(QUIZZES).length} total
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              quiz questions aced
            </p>
          </motion.div>
        </div>

        <div className="mt-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-lg font-bold">{Object.values(projects).filter(p => p.completed).length} / 17 projects finished</p>
          <p className="text-sm text-muted-foreground">{Object.values(projects).reduce((sum, p) => sum + p.completedSteps.length, 0)} unique project steps completed</p>
          <p className="mt-2 text-xs text-muted-foreground">Walkthrough progress is separate from lesson and quiz statistics.</p>
        </div>
        {/* achievements */}
        <h2 className="mt-6 text-lg font-extrabold">
          Achievements{" "}
          <span className="text-sm font-semibold text-muted-foreground">
            {unlockedAchievements.length}/{ACHIEVEMENTS.length}
          </span>
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {ACHIEVEMENTS.map((a, i) => {
            const unlocked = unlockedAchievements.includes(a.id);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 + i * 0.03 }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border p-3 text-center",
                  unlocked
                    ? "border-primary/50 bg-accent/70"
                    : "border-border bg-card opacity-50 grayscale"
                )}
              >
                <span className="text-2xl">{a.emoji}</span>
                <p className="text-[11px] font-bold leading-tight">{a.name}</p>
                <p className="text-[9px] leading-tight text-muted-foreground">
                  {a.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* gear profile */}
        <LabSection />

        {/* settings */}
        <h2 className="mt-6 text-lg font-extrabold">Settings</h2>
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="size-5 text-primary" />
              ) : (
                <VolumeX className="size-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-bold">Sound effects</p>
                <p className="text-xs text-muted-foreground">
                  The satisfying pops and chimes
                </p>
              </div>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>
          <Button
            variant="outline"
            className="w-full rounded-2xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirmReset(true)}
          >
            Reset all progress
          </Button>
        </div>
      </div>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="max-w-[calc(100%-3rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reset everything?</DialogTitle>
            <DialogDescription>
              Your XP, streak, achievements, quiz answers, completed lessons, projects and project rewards
              will be wiped
              {user
                ? " — on this device and on your synced account"
                : ""}
              . Your followed topics and lab gear stay. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Keep my progress
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetProgress();
                setConfirmReset(false);
              }}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
      <CelebrationOverlay />
    </div>
  );
}
