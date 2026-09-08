"use client";

// Educational RAID playground: pick a level, add same-sized disks, and watch
// usable space, raw space, and "how many can die" update live. Nothing here
// talks to a real array — every number is local math so learners can poke
// at RAID 0/1/5/6/10 without risking a disk.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { playTap } from "@/lib/sounds";
import { cn } from "@/lib/utils";

type RaidId = "0" | "1" | "5" | "6" | "10";
type SizeUnit = "TB" | "GB";

const DISK_MAX = 16;
const SIZE_TB = { min: 1, max: 24, step: 1 } as const;
const SIZE_GB = { min: 250, max: 8000, step: 250 } as const;

interface RaidLevel {
  id: RaidId;
  short: string;
  blurb: string;
  minDisks: number;
  evenOnly: boolean;
  /** How many disks' worth of space you can actually use. */
  usableDisks: (n: number) => number;
  /** Disks that can fail without data loss (guaranteed / best-case). */
  canDie: (n: number) => { guaranteed: number; best: number; label: string };
  tip: string;
  formula: string;
}

const LEVELS: RaidLevel[] = [
  {
    id: "0",
    short: "stripe",
    blurb:
      "Stripes data across every disk. You get full speed and full size — and one failure wipes the lot.",
    minDisks: 2,
    evenOnly: false,
    usableDisks: (n) => n,
    canDie: () => ({
      guaranteed: 0,
      best: 0,
      label: "0 — any disk dies, data is gone",
    }),
    tip: "Scratch space or data you can recreate. Speed and capacity, zero safety net.",
    formula: "usable = disks × size",
  },
  {
    id: "1",
    short: "mirror",
    blurb:
      "Writes the same data to every disk. You keep one disk's worth of space; the rest are copies.",
    minDisks: 2,
    evenOnly: false,
    usableDisks: () => 1,
    canDie: (n) => ({
      guaranteed: n - 1,
      best: n - 1,
      label:
        n === 2
          ? "1 — the other disk is a full copy"
          : `${n - 1} — every disk but one can fail`,
    }),
    tip: "Two-disk boxes that just need 'a drive can die and I keep working.' Simple, not space-efficient.",
    formula: "usable = 1 × size",
  },
  {
    id: "5",
    short: "parity",
    blurb:
      "Stripes data plus one disk's worth of parity. One drive can die; you still have the puzzle pieces to rebuild.",
    minDisks: 3,
    evenOnly: false,
    usableDisks: (n) => n - 1,
    canDie: () => ({
      guaranteed: 1,
      best: 1,
      label: "1 — a second failure during rebuild is game over",
    }),
    tip: "The usual homelab pick: most of the capacity, one-disk protection. Rebuilds get scarier as disks get bigger.",
    formula: "usable = (disks − 1) × size",
  },
  {
    id: "6",
    short: "2-parity",
    blurb:
      "Like RAID 5, but two disks of parity. Two drives can die before you lose data.",
    minDisks: 4,
    evenOnly: false,
    usableDisks: (n) => n - 2,
    canDie: () => ({
      guaranteed: 2,
      best: 2,
      label: "2 — extra parity for long, risky rebuilds",
    }),
    tip: "Bigger arrays where a second disk can fail while the first is still rebuilding. You pay two disks for that calm.",
    formula: "usable = (disks − 2) × size",
  },
  {
    id: "10",
    short: "1+0",
    blurb:
      "A stripe of mirrors. Fast like RAID 0, and each pair can lose one disk. Needs an even count.",
    minDisks: 4,
    evenOnly: true,
    usableDisks: (n) => n / 2,
    canDie: (n) => {
      const pairs = n / 2;
      return {
        guaranteed: 1,
        best: pairs,
        label: `1 for sure · up to ${pairs} if they die in different pairs`,
      };
    },
    tip: "When you want stripe speed and mirror safety, and you have disks to spare. Costs half your raw space.",
    formula: "usable = (disks ÷ 2) × size",
  },
];

function clampDisks(level: RaidLevel, n: number): number {
  let v = Math.max(level.minDisks, Math.min(DISK_MAX, n));
  if (level.evenOnly && v % 2 === 1) {
    v = Math.min(DISK_MAX, v + 1);
  }
  return v;
}

function formatCapacity(amount: number, unit: SizeUnit): string {
  if (unit === "GB" && amount >= 1000) {
    const tb = amount / 1000;
    const rounded = Number.isInteger(tb) ? String(tb) : tb.toFixed(1);
    return `${rounded} TB`;
  }
  const rounded =
    unit === "TB" && !Number.isInteger(amount) ? amount.toFixed(1) : String(amount);
  return `${rounded} ${unit}`;
}

type DiskRole = "data" | "parity" | "mirror";

function diskRoles(level: RaidId, n: number): DiskRole[] {
  if (level === "0") return Array.from({ length: n }, () => "data");
  if (level === "1")
    return Array.from({ length: n }, (_, i) => (i === 0 ? "data" : "mirror"));
  if (level === "5")
    return Array.from({ length: n }, (_, i) => (i === n - 1 ? "parity" : "data"));
  if (level === "6")
    return Array.from({ length: n }, (_, i) => (i >= n - 2 ? "parity" : "data"));
  return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? "data" : "mirror"));
}

const ROLE_STYLE: Record<DiskRole, { bar: string; chip: string; label: string }> =
  {
    data: {
      bar: "bg-sky-400",
      chip: "bg-sky-400",
      label: "data",
    },
    parity: {
      bar: "bg-amber-400",
      chip: "bg-amber-400",
      label: "parity",
    },
    mirror: {
      bar: "bg-violet-400",
      chip: "bg-violet-400",
      label: "mirror",
    },
  };

export function RaidCalculatorTool() {
  const [raidId, setRaidId] = useState<RaidId>("5");
  const [disks, setDisks] = useState(4);
  const [unit, setUnit] = useState<SizeUnit>("TB");
  const [size, setSize] = useState(4);

  const level = LEVELS.find((l) => l.id === raidId)!;
  const n = clampDisks(level, disks);
  const usableN = level.usableDisks(n);
  const fault = level.canDie(n);
  const raw = n * size;
  const usable = usableN * size;
  const overheadPct = raw === 0 ? 0 : Math.round(((raw - usable) / raw) * 100);
  const usablePct = raw === 0 ? 0 : (usable / raw) * 100;
  const roles = useMemo(() => diskRoles(raidId, n), [raidId, n]);
  const sizeBounds = unit === "TB" ? SIZE_TB : SIZE_GB;
  const shownRoles = Array.from(new Set(roles));

  const pickLevel = (next: RaidLevel) => {
    playTap();
    setRaidId(next.id);
    setDisks((prev) => clampDisks(next, prev));
  };

  const switchUnit = (next: SizeUnit) => {
    if (next === unit) return;
    playTap();
    if (next === "TB") {
      setSize(
        Math.max(
          SIZE_TB.min,
          Math.min(SIZE_TB.max, Math.round(size / 1000) || SIZE_TB.min)
        )
      );
    } else {
      setSize(
        Math.max(SIZE_GB.min, Math.min(SIZE_GB.max, size * 1000))
      );
    }
    setUnit(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 self-start rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[11px] font-bold text-amber-300">
        <TriangleAlert className="size-3.5 shrink-0" />
        RAID is not a backup
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={raidId === l.id}
            onClick={() => pickLevel(l)}
            className={cn(
              "rounded-xl border px-1 py-2 text-center transition-colors",
              raidId === l.id
                ? "border-primary bg-accent"
                : "border-border bg-card"
            )}
          >
            <span className="block text-sm font-extrabold">{l.id}</span>
            <span className="block text-[9px] font-semibold text-muted-foreground">
              {l.short}
            </span>
          </button>
        ))}
      </div>

      <p className="text-[12px] leading-relaxed text-muted-foreground">
        {level.blurb}
      </p>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-2xl font-extrabold text-sky-400">
            {n}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            disks · min {level.minDisks}
            {level.evenOnly ? ", even only" : ""}
          </span>
        </div>
        <input
          type="range"
          min={level.minDisks}
          max={DISK_MAX}
          step={level.evenOnly ? 2 : 1}
          value={n}
          aria-label="Number of disks"
          onChange={(e) => setDisks(clampDisks(level, Number(e.target.value)))}
          className="mt-2 w-full accent-sky-400"
        />

        <div className="mt-4 flex items-baseline justify-between gap-2">
          <span className="font-mono text-2xl font-extrabold text-sky-400">
            {size}{" "}
            <span className="text-sm font-semibold text-muted-foreground">
              {unit}
            </span>
          </span>
          <div className="flex gap-1">
            {(["TB", "GB"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => switchUnit(u)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors",
                  unit === u
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <input
          type="range"
          min={sizeBounds.min}
          max={sizeBounds.max}
          step={sizeBounds.step}
          value={size}
          aria-label={`Disk size in ${unit}`}
          onChange={(e) => setSize(Number(e.target.value))}
          className="mt-2 w-full accent-sky-400"
        />
        <p className="mt-1 text-center text-[11px] text-muted-foreground">
          same-sized disks — RAID is only as big as the smallest one
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["Usable capacity", formatCapacity(usable, unit), "text-emerald-400"],
            ["Raw capacity", formatCapacity(raw, unit), ""],
            [
              "Disks that can die",
              fault.guaranteed === fault.best
                ? String(fault.guaranteed)
                : `${fault.guaranteed}–${fault.best}`,
              fault.guaranteed === 0 ? "text-rose-400" : "text-emerald-400",
            ],
            ["When you'd pick this", level.tip, "text-[12px] font-semibold leading-snug"],
          ] as const
        ).map(([label, value, extra]) => (
          <div
            key={label}
            className={cn(
              "rounded-xl border border-border bg-card p-3",
              label === "When you'd pick this" && "col-span-2"
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p
              className={cn(
                "mt-0.5 font-bold",
                label === "When you'd pick this"
                  ? extra
                  : cn("font-mono text-sm", extra)
              )}
            >
              {value}
            </p>
            {label === "Disks that can die" && (
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {fault.label}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex h-5 w-full overflow-hidden rounded-full bg-background">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="h-full bg-emerald-400"
            style={{ width: `${usablePct}%` }}
          />
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="h-full bg-amber-400/80"
            style={{ width: `${100 - usablePct}%` }}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-emerald-400" /> usable
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-amber-400/80" /> protection
          </span>
          <span>{overheadPct}% spent on safety</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {roles.map((role, i) => (
            <motion.span
              key={`${raidId}-${i}`}
              layout
              className={cn(
                "flex size-7 items-center justify-center rounded-md text-[10px] font-extrabold text-black/70",
                ROLE_STYLE[role].chip
              )}
              title={`Disk ${i + 1}: ${ROLE_STYLE[role].label}`}
            >
              {i + 1}
            </motion.span>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-semibold text-muted-foreground">
          {shownRoles.map((role) => (
            <span key={role} className="flex items-center gap-1">
              <span className={cn("size-2 rounded-sm", ROLE_STYLE[role].bar)} />
              {ROLE_STYLE[role].label}
            </span>
          ))}
        </div>
        {(raidId === "5" || raidId === "6") && (
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Real arrays stripe parity across every disk — shown as a reserved
            slice here so the capacity math stays obvious.
          </p>
        )}
      </div>

      <p className="text-center font-mono text-[11px] text-muted-foreground">
        {level.formula}
      </p>
      <p className="text-center text-[11px] text-muted-foreground">
        Simulated array — no real disks are touched. RAID keeps you running
        when a drive dies. Deletes, ransomware, and fire still need a backup.
      </p>
    </div>
  );
}
