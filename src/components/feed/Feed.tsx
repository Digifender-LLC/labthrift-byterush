"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { LESSONS, topicById, type Lesson } from "@/lib/content";
import {
  gearBoost,
  INVENTORY_ITEMS,
  type InventoryItem,
} from "@/lib/inventory";
import type { InventoryStatus } from "@/lib/syncTypes";
import { displayStreak, levelForXp, useApp } from "@/lib/store";
import { playSwipe } from "@/lib/sounds";
import { LessonView } from "./LessonView";
import { InventoryCard } from "./InventoryCard";
import { Button } from "@/components/ui/button";

type FeedItem =
  | { kind: "lesson"; lesson: Lesson }
  | { kind: "inventory"; item: InventoryItem };

/** How often a gear question appears between lessons, and how many per visit. */
const INVENTORY_EVERY = 4;
const INVENTORY_MAX_PER_VISIT = 3;

/**
 * Round-robin lessons across followed topics so the feed keeps variety,
 * with unfinished lessons first. Lessons matching the user's gear profile
 * (owned or planned inventory) float to the front. A few lightweight gear
 * questions are woven in between lessons. Order is frozen while you scroll
 * (completing a lesson won't reshuffle), but rebuilds when followed topics
 * change so /topics "rebuilds instantly" is actually true.
 */
export function buildFeed(
  followed: string[],
  completed: string[],
  inventory: Record<string, InventoryStatus>
): FeedItem[] {
  const byTopic = followed.map((t) => LESSONS.filter((l) => l.topicId === t));
  const interleaved: Lesson[] = [];
  const maxLen = Math.max(0, ...byTopic.map((a) => a.length));
  for (let i = 0; i < maxLen; i++) {
    for (const arr of byTopic) {
      if (arr[i]) interleaved.push(arr[i]);
    }
  }
  // Stable sort: gear-relevant lessons first, round-robin order preserved
  // within the same relevance score.
  const fresh = interleaved
    .filter((l) => !completed.includes(l.id))
    .map((lesson, i) => ({ lesson, i, boost: gearBoost(lesson.id, inventory) }))
    .sort((a, b) => b.boost - a.boost || a.i - b.i)
    .map((e) => e.lesson);
  const done = interleaved.filter((l) => completed.includes(l.id));
  const lessons = [...fresh, ...done];

  // Weave in the next few unanswered gear questions, one every few lessons.
  const pending = INVENTORY_ITEMS.filter((item) => !(item.id in inventory)).slice(
    0,
    INVENTORY_MAX_PER_VISIT
  );
  const feed: FeedItem[] = [];
  let nextPrompt = 0;
  lessons.forEach((lesson, i) => {
    feed.push({ kind: "lesson", lesson });
    if (
      nextPrompt < pending.length &&
      (i + 1) % INVENTORY_EVERY === 0 &&
      i < fresh.length // don't pad the tail of already-done lessons
    ) {
      feed.push({ kind: "inventory", item: pending[nextPrompt++] });
    }
  });
  return feed;
}

export function Feed() {
  const followedTopics = useApp((s) => s.followedTopics);
  const xp = useApp((s) => s.xp);
  const streak = useApp((s) => s.streak);
  const lastActiveDay = useApp((s) => s.lastActiveDay);

  // Rebuild when followed topics change; stay stable while scrolling lessons.
  const followedKey = followedTopics.slice().sort().join("\0");
  const [feed, setFeed] = useState(() => {
    const s = useApp.getState();
    return buildFeed(s.followedTopics, s.completedLessons, s.inventory);
  });
  const skipTopicRebuild = useRef(true);
  useEffect(() => {
    if (skipTopicRebuild.current) {
      skipTopicRebuild.current = false;
      return;
    }
    const s = useApp.getState();
    setFeed(buildFeed(s.followedTopics, s.completedLessons, s.inventory));
  }, [followedKey]);
  const level = useMemo(() => levelForXp(xp), [xp]);
  const liveStreak = displayStreak(streak, lastActiveDay);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastIndex = useRef(0);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    if (idx !== lastIndex.current) {
      lastIndex.current = idx;
      playSwipe();
    }
  };

  if (feed.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <span className="text-5xl">🛰️</span>
        <h2 className="text-xl font-bold">Your feed is empty</h2>
        <p className="text-sm text-muted-foreground">
          Follow at least one topic and we&apos;ll fill this with bite-sized
          lessons.
        </p>
        <Button asChild className="rounded-full font-bold">
          <Link href="/topics">Pick topics</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* floating header */}
      <header className="pointer-events-none absolute top-0 inset-x-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-4 pb-6 pt-3">
        <span className="text-base font-extrabold tracking-tight">
          ⚡ ByteRush
        </span>
        <div className="flex items-center gap-2">
          <motion.div
            key={`streak-${liveStreak}`}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-sm font-bold backdrop-blur-sm"
          >
            <span className={liveStreak > 0 ? "animate-flame" : "grayscale opacity-60"}>
              🔥
            </span>
            {liveStreak}
          </motion.div>
          <motion.div
            key={`xp-${xp}`}
            initial={{ scale: 1.25 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-sm font-bold text-amber-300 backdrop-blur-sm"
          >
            <Zap className="size-3.5 fill-amber-300" />
            Lv {level} · {xp}
          </motion.div>
        </div>
      </header>

      {/* vertical snap feed */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto"
      >
        {feed.map((item) => {
          if (item.kind === "inventory") {
            return <InventoryCard key={`inv-${item.item.id}`} item={item.item} />;
          }
          const topic = topicById(item.lesson.topicId)!;
          return (
            <LessonView key={item.lesson.id} lesson={item.lesson} topic={topic} />
          );
        })}

        {/* end of feed */}
        <section className="flex h-full snap-start flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="text-5xl">🎓</span>
          <h2 className="text-2xl font-extrabold">You&apos;re all caught up</h2>
          <p className="text-sm text-muted-foreground">
            You scrolled through every lesson in your topics. Follow more topics
            to keep the feed going — or come back tomorrow to protect that
            streak.
          </p>
          <Button asChild className="rounded-full font-bold">
            <Link href="/topics">Follow more topics</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
