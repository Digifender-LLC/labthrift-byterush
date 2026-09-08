"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useApp, XP_PER_STREAK_DAY } from "@/lib/store";
import { playAchievement, playStreak, playXp } from "@/lib/sounds";

/**
 * Consumes the store's celebration queue one event at a time,
 * pairing each with confetti and a sound. Tap anywhere to dismiss early.
 */
export function CelebrationOverlay() {
  const celebration = useApp((s) => s.celebrations[0]);
  const consume = useApp((s) => s.consumeCelebration);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!celebration) return;

    if (celebration.kind === "streak") {
      playStreak();
      confetti({
        particleCount: 70,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#ff9d00", "#ff5e00", "#ffd000"],
        disableForReducedMotion: true,
      });
    } else if (celebration.kind === "achievement") {
      playAchievement();
      confetti({
        particleCount: 130,
        spread: 100,
        origin: { y: 0.55 },
        disableForReducedMotion: true,
      });
    } else {
      playXp();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#b385ff", "#7c3aed", "#e9d5ff"],
        disableForReducedMotion: true,
      });
    }

    // Achievements and level-ups deserve a longer moment on screen.
    timer.current = setTimeout(
      consume,
      celebration.kind === "streak" ? 3200 : 4200
    );
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [celebration, consume]);

  return (
    <AnimatePresence>
      {celebration && (
        <motion.button
          key={JSON.stringify(celebration)}
          type="button"
          onClick={consume}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.6, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className="mx-8 flex flex-col items-center gap-3 rounded-3xl border border-primary/40 bg-card px-8 py-8 text-center animate-glow"
          >
            {celebration.kind === "streak" && (
              <>
                <motion.span
                  className="text-6xl animate-flame"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                >
                  🔥
                </motion.span>
                <p className="text-3xl font-extrabold">
                  {celebration.streak}-day streak!
                </p>
                <p className="text-sm text-muted-foreground">
                  {celebration.streak === 1
                    ? "Day one. Come back tomorrow to keep it alive."
                    : "You showed up again. That's how skills are built."}
                </p>
                <p className="text-sm font-bold text-amber-400">
                  +{XP_PER_STREAK_DAY} XP streak bonus
                </p>
              </>
            )}
            {celebration.kind === "achievement" && (
              <>
                <motion.span
                  className="text-6xl"
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, delay: 0.1 }}
                >
                  {celebration.achievement.emoji}
                </motion.span>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Achievement unlocked
                </p>
                <p className="text-2xl font-extrabold">
                  {celebration.achievement.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {celebration.achievement.description}
                </p>
              </>
            )}
            {celebration.kind === "levelup" && (
              <>
                <motion.span
                  className="text-6xl"
                  initial={{ y: 20, scale: 0 }}
                  animate={{ y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, delay: 0.1 }}
                >
                  ⚡
                </motion.span>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Level up
                </p>
                <p className="text-3xl font-extrabold">Level {celebration.level}</p>
                <p className="text-sm text-muted-foreground">
                  Your brain is getting dangerous.
                </p>
              </>
            )}
            <p className="mt-1 text-[11px] text-muted-foreground/70">
              tap to continue
            </p>
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
