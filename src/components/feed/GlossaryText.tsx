"use client";

// Card copy with tappable glossary terms. Matched jargon gets a subtle dotted
// underline; tapping opens a compact in-card definition sheet. Terms are real
// buttons (keyboard focusable, Enter/Space), and Escape closes the sheet.

import { Fragment, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { splitGlossary, type GlossaryEntry } from "@/lib/glossary";
import { playBack, playTap } from "@/lib/sounds";

export function GlossaryText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const segments = useMemo(() => splitGlossary(text), [text]);
  const [open, setOpen] = useState<GlossaryEntry | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playBack();
        setOpen(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <p className={className}>
        {segments.map((seg, i) =>
          seg.entry ? (
            <button
              key={i}
              type="button"
              onClick={() => {
                playTap();
                setOpen(seg.entry!);
              }}
              className="pointer-events-auto rounded-sm bg-white/10 px-0.5 font-semibold text-inherit underline decoration-white/50 decoration-dotted underline-offset-4 outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label={`What does ${seg.entry.term} mean?`}
            >
              {seg.text}
            </button>
          ) : (
            <Fragment key={i}>{seg.text}</Fragment>
          )
        )}
      </p>

      {/* compact definition sheet, anchored to the bottom of the card */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="pointer-events-auto absolute inset-x-3 bottom-3 z-30"
          >
            <button
              type="button"
              onClick={() => {
                playBack();
                setOpen(null);
              }}
              className="w-full rounded-2xl border border-white/20 bg-black/85 p-4 text-left shadow-xl backdrop-blur-md outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label={`Close definition of ${open.term}`}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="text-sm font-extrabold text-sky-300">
                  📖 {open.term}
                </span>
                <X className="size-4 shrink-0 text-white/50" />
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-white/85">
                {open.definition}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
