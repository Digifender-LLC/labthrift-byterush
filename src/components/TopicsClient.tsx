"use client";

import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { lessonsByTopic, TOPICS } from "@/lib/content";
import { useApp } from "@/lib/store";
import { useMounted } from "@/hooks/useMounted";
import { playTap } from "@/lib/sounds";
import { BottomNav } from "@/components/BottomNav";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { Splash } from "@/components/Splash";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function TopicsClient() {
  const mounted = useMounted();
  const followedTopics = useApp((s) => s.followedTopics);
  const toggleTopic = useApp((s) => s.toggleTopic);
  const completedLessons = useApp((s) => s.completedLessons);

  if (!mounted) return <Splash />;

  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-24 pt-12">
        <h1 className="text-2xl font-extrabold">Topics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Follow what excites you. Your feed rebuilds instantly.
        </p>
        <div className="mt-5 space-y-3">
          {TOPICS.map((topic, i) => {
            const followed = followedTopics.includes(topic.id);
            const lessons = lessonsByTopic(topic.id);
            const done = lessons.filter((l) =>
              completedLessons.includes(l.id)
            ).length;
            const pct = lessons.length ? (done / lessons.length) * 100 : 0;
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "rounded-2xl border p-4 transition-colors",
                  followed ? "border-primary/50 bg-accent/60" : "border-border bg-card"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl",
                      topic.gradient
                    )}
                  >
                    {topic.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{topic.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {topic.tagline}
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => {
                      playTap();
                      toggleTopic(topic.id);
                    }}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                      followed
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {followed ? (
                      <>
                        <Check className="size-3.5" strokeWidth={3} /> Following
                      </>
                    ) : (
                      <>
                        <Plus className="size-3.5" strokeWidth={3} /> Follow
                      </>
                    )}
                  </motion.button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Progress value={pct} className="h-1.5" />
                  <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">
                    {done}/{lessons.length}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <BottomNav />
      <CelebrationOverlay />
    </div>
  );
}
