"use client";

// Horizontally scrollable code sample inside a lesson card.
//
// The card's content layer is pointer-events-none (so taps fall through to
// the story tap zones); this block opts back in and owns every gesture that
// starts on it:
// - touch: `touch-action: pan-x pan-y` lets a horizontal drag scroll the code
//   natively while a vertical drag still chains up to the feed's snap scroll
// - mouse: drag-to-scroll with pointer capture, plus vertical wheel converted
//   to horizontal scrolling while there's overflow left to consume
// - keyboard: the region is focusable, so arrow keys scroll it too

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function CodeBlock({ code }: { code: string }) {
  const ref = useRef<HTMLPreElement>(null);
  const drag = useRef<{ startX: number; startLeft: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  // Vertical wheel → horizontal scroll while the block can still consume it.
  // Needs a native non-passive listener to be allowed to preventDefault.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // native horizontal
      const consumes =
        (e.deltaY > 0 && el.scrollLeft < max) ||
        (e.deltaY < 0 && el.scrollLeft > 0);
      if (consumes) {
        e.preventDefault();
        el.scrollLeft = Math.min(max, Math.max(0, el.scrollLeft + e.deltaY));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLPreElement>) => {
    // Touch panning is handled natively via touch-action.
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    drag.current = { startX: e.clientX, startLeft: el.scrollLeft };
    setDragging(true);
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLPreElement>) => {
    if (!drag.current || !ref.current) return;
    ref.current.scrollLeft =
      drag.current.startLeft - (e.clientX - drag.current.startX);
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  return (
    <pre
      ref={ref}
      tabIndex={0}
      aria-label="Code sample, scrolls horizontally"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "pointer-events-auto touch-pan-x touch-pan-y overscroll-x-contain",
        "overflow-x-auto rounded-xl bg-black/50 p-4 font-mono text-[13px] leading-relaxed text-emerald-200 backdrop-blur-sm",
        "outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        dragging ? "cursor-grabbing select-none" : "cursor-grab select-text"
      )}
    >
      {code}
    </pre>
  );
}
