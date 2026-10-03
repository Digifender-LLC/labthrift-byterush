"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { TOPICS } from "@/lib/content";
import { useApp } from "@/lib/store";
import { playTap, playComplete } from "@/lib/sounds";
import { Button } from "@/components/ui/button";
import { LegalLinks } from "@/components/LegalLinks";
import { cn } from "@/lib/utils";

export function Onboarding() {
  const followedTopics = useApp((s) => s.followedTopics);
  const toggleTopic = useApp((s) => s.toggleTopic);
  const finishOnboarding = useApp((s) => s.finishOnboarding);
  const [step, setStep] = useState<"welcome" | "topics">("welcome");

  return (
    <div className="flex h-full flex-col overflow-y-auto no-scrollbar">
      <AnimatePresence mode="wait">
        {step === "welcome" ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -60 }}
            className="flex min-h-full flex-col items-center justify-center gap-5 px-8 text-center"
          >
            <motion.span
              className="text-7xl"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
            >
              ⚡
            </motion.span>
            <h1 className="text-4xl font-extrabold tracking-tight">ByteRush</h1>
            <p className="text-lg text-muted-foreground">
              The scroll you won&apos;t regret. Bite-sized tech lessons — from
              homelab to cloud to enterprise — in a feed built to be addictive.
            </p>
            <ul className="space-y-2 text-left text-sm text-muted-foreground">
              <li>📱 Swipe through snackable lesson cards</li>
              <li>🔥 Keep a daily streak alive</li>
              <li>⚡ Earn XP and level up</li>
              <li>🏆 Unlock achievements as you learn</li>
            </ul>
            <Button
              size="lg"
              className="mt-2 rounded-full px-10 text-base font-bold"
              onClick={() => {
                playTap();
                setStep("topics");
              }}
            >
              Let&apos;s go
            </Button>
            <LegalLinks className="mt-1" />
          </motion.div>
        ) : (
          <motion.div
            key="topics"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex min-h-full flex-col px-5 pb-8 pt-14"
          >
            <h1 className="text-2xl font-extrabold">What do you want to learn?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick at least one — your feed is built from these. You can change
              them anytime.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {TOPICS.map((topic, i) => {
                const selected = followedTopics.includes(topic.id);
                return (
                  <motion.button
                    key={topic.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      playTap();
                      toggleTopic(topic.id);
                    }}
                    className={cn(
                      "relative flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-colors",
                      selected
                        ? "border-primary bg-accent"
                        : "border-border bg-card"
                    )}
                  >
                    <AnimatePresence>
                      {selected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 18 }}
                          className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-primary"
                        >
                          <Check className="size-3 text-primary-foreground" strokeWidth={3.5} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <span className="text-2xl">{topic.emoji}</span>
                    <span className="text-sm font-bold leading-tight">
                      {topic.name}
                    </span>
                    <span className="text-[11px] leading-tight text-muted-foreground">
                      {topic.tagline}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <div className="sticky bottom-0 mt-6 bg-gradient-to-t from-background via-background to-transparent pb-2 pt-4">
              <Button
                size="lg"
                disabled={followedTopics.length === 0}
                className="w-full rounded-full text-base font-bold"
                onClick={() => {
                  playComplete();
                  finishOnboarding();
                }}
              >
                {followedTopics.length === 0
                  ? "Pick at least 1 topic"
                  : `Start learning (${followedTopics.length} topic${
                      followedTopics.length > 1 ? "s" : ""
                    })`}
              </Button>
              <LegalLinks className="mt-3" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
