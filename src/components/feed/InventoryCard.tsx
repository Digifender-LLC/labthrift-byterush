"use client";

// A full-screen feed beat that asks one lightweight gear question.
// Answers shape which lessons the feed surfaces first.

import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, ChevronUp } from "lucide-react";
import type { InventoryItem } from "@/lib/inventory";
import type { InventoryStatus } from "@/lib/syncTypes";
import { useApp, XP_PER_INVENTORY } from "@/lib/store";
import { playCorrect } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const OPTIONS: { status: InventoryStatus; label: string; emoji: string }[] = [
  { status: "have", label: "Yep, got one", emoji: "✅" },
  { status: "planned", label: "Planning to", emoji: "🔜" },
  { status: "pass", label: "Not for me", emoji: "🙅" },
];

export function InventoryCard({ item }: { item: InventoryItem }) {
  const setInventoryItem = useApp((s) => s.setInventoryItem);
  const status = useApp((s) => s.inventory[item.id]);
  const [justAnswered, setJustAnswered] = useState(false);

  const answer = (choice: InventoryStatus) => {
    if (status) return;
    playCorrect();
    setInventoryItem(item.id, choice);
    setJustAnswered(true);
    if (choice !== "pass") {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.6 },
        colors: ["#38bdf8", "#818cf8", "#a7f3d0"],
        disableForReducedMotion: true,
      });
    }
  };

  return (
    <section className="relative h-full w-full snap-start overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex h-full flex-col justify-center gap-4 px-6 pb-24 pt-28">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-300">
          🧰 Your lab
        </p>
        <span className="text-5xl">{item.emoji}</span>
        <h2 className="text-2xl font-extrabold leading-snug">{item.question}</h2>
        <p className="text-sm text-white/70">{item.blurb}</p>

        {!status ? (
          <div className="mt-2 flex flex-col gap-2">
            {OPTIONS.map((o) => (
              <button
                key={o.status}
                onClick={() => answer(o.status)}
                className="rounded-2xl border-2 border-white/25 bg-white/10 px-4 py-3 text-left text-sm font-semibold backdrop-blur-sm transition-colors active:bg-white/25"
              >
                {o.emoji} {o.label}
              </button>
            ))}
            <p className="mx-auto mt-1 text-xs font-semibold text-white/50">
              or just keep scrolling — we&apos;ll ask another time
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex flex-col gap-3"
          >
            <div
              className={cn(
                "flex items-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-bold",
                "border-sky-300/60 bg-sky-400/20 text-sky-100"
              )}
            >
              <Check className="size-4" strokeWidth={3} />
              {OPTIONS.find((o) => o.status === status)?.label ?? status}
              {justAnswered && (
                <span className="ml-auto text-amber-300">
                  +{XP_PER_INVENTORY} XP
                </span>
              )}
            </div>
            <p className="text-sm text-white/70">
              {status === "pass"
                ? "No problem — we'll keep the feed broad."
                : "Nice. We'll surface lessons that fit your setup."}
            </p>
            <motion.p
              className="mt-4 flex items-center gap-1 text-sm text-white/80"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            >
              <ChevronUp className="size-4" /> keep scrolling
            </motion.p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
