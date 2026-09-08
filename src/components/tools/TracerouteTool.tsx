"use client";

// Educational ping/traceroute sandbox: pick a scenario, then either send a
// single "ping" or tap through a traceroute hop by hop and watch for where
// round-trip time suddenly jumps. Nothing here touches a real network —
// every hop and millisecond is scripted locally.

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  MapPin,
  Router,
  Server,
  TimerOff,
  Zap,
} from "lucide-react";
import { playTap } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface Hop {
  label: string;
  Icon: typeof Router;
  ms: number | null; // null = no reply (filtered / timed out)
}

interface Scenario {
  id: string;
  label: string;
  hops: Hop[];
  pingMs: number | null;
  verdict: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "healthy",
    label: "Smooth path",
    hops: [
      { label: "Home router", Icon: Router, ms: 1 },
      { label: "ISP gateway", Icon: Globe, ms: 9 },
      { label: "Regional backbone", Icon: Server, ms: 15 },
      { label: "Destination", Icon: MapPin, ms: 24 },
    ],
    pingMs: 24,
    verdict:
      "Ping and traceroute agree: fast, steady, nothing to chase. Every hop adds a small, predictable bit of time.",
  },
  {
    id: "congested",
    label: "ISP congestion",
    hops: [
      { label: "Home router", Icon: Router, ms: 1 },
      { label: "ISP gateway", Icon: Globe, ms: 8 },
      { label: "Congested ISP hop", Icon: Server, ms: 152 },
      { label: "Regional backbone", Icon: Server, ms: 156 },
      { label: "Destination", Icon: MapPin, ms: 159 },
    ],
    pingMs: 159,
    verdict:
      "Ping only tells you it's slow. Traceroute pins the exact hop where latency exploded — that's your ISP, not your Wi-Fi and not the far end.",
  },
  {
    id: "filtered",
    label: "Blocked ICMP",
    hops: [
      { label: "Home router", Icon: Router, ms: 1 },
      { label: "ISP gateway", Icon: Globe, ms: 9 },
      { label: "Regional backbone", Icon: Server, ms: 18 },
      { label: "Destination", Icon: MapPin, ms: null },
    ],
    pingMs: null,
    verdict:
      "No reply at all doesn't mean it's down. Plenty of servers drop ICMP on purpose — try a TCP-based check (like the port tool) before assuming an outage.",
  },
];

const JUMP_THRESHOLD_MS = 40;

/** Index of the hop where latency jumps by more than the threshold, or -1. */
function findJumpIndex(hops: Hop[]): number {
  let prev: number | null = null;
  for (let i = 0; i < hops.length; i++) {
    const ms = hops[i].ms;
    if (ms != null && prev != null && ms - prev > JUMP_THRESHOLD_MS) return i;
    if (ms != null) prev = ms;
  }
  return -1;
}

type Mode = "ping" | "traceroute";

export function TracerouteTool() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [mode, setMode] = useState<Mode>("traceroute");

  const scenario = SCENARIOS[scenarioIdx];

  return (
    <div className="flex flex-col gap-4">
      {/* scenario presets */}
      <div className="flex gap-2">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              playTap();
              setScenarioIdx(i);
            }}
            className={cn(
              "flex-1 rounded-xl border px-2 py-2 text-center text-xs font-bold transition-colors",
              scenarioIdx === i
                ? "border-primary bg-accent"
                : "border-border bg-card"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            playTap();
            setMode("ping");
          }}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-sm font-bold transition-colors",
            mode === "ping"
              ? "border-primary bg-accent"
              : "border-border bg-background"
          )}
        >
          📡 Ping
        </button>
        <button
          onClick={() => {
            playTap();
            setMode("traceroute");
          }}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-sm font-bold transition-colors",
            mode === "traceroute"
              ? "border-primary bg-accent"
              : "border-border bg-background"
          )}
        >
          🧭 Traceroute
        </button>
      </div>

      {/* keying on scenario + mode resets the walkthrough state below
          whenever either changes, without an effect-driven setState */}
      <ScenarioBody key={`${scenario.id}-${mode}`} scenario={scenario} mode={mode} />

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {scenario.verdict}
        </p>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Simulated hops — no real host is ever contacted.
      </p>
    </div>
  );
}

function ScenarioBody({ scenario, mode }: { scenario: Scenario; mode: Mode }) {
  const [revealed, setRevealed] = useState(0);
  const [pinging, setPinging] = useState(false);
  const [pinged, setPinged] = useState(false);

  const jumpIndex = findJumpIndex(scenario.hops);
  const maxMs = Math.max(1, ...scenario.hops.map((h) => h.ms ?? 0));
  const done = revealed >= scenario.hops.length;

  return (
    <>
      {mode === "ping" ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span className="flex flex-col items-center gap-1">
              <Router className="size-5 text-foreground" /> You
            </span>
            <div className="relative mx-1.5 h-1 flex-1 overflow-hidden rounded-full bg-border">
              {pinging && (
                <motion.span
                  key={`out-${scenario.id}`}
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 w-full rounded-full bg-sky-400"
                />
              )}
              {pinged && scenario.pingMs != null && (
                <motion.span
                  key={`back-${scenario.id}`}
                  initial={{ x: "100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 w-full rounded-full bg-emerald-400"
                />
              )}
            </div>
            <span className="flex flex-col items-center gap-1">
              <MapPin className="size-5 text-foreground" /> Destination
            </span>
          </div>

          <button
            onClick={() => {
              playTap();
              setPinged(false);
              setPinging(true);
              window.setTimeout(() => {
                setPinging(false);
                setPinged(true);
              }, 550);
            }}
            className="rounded-xl border border-primary bg-accent px-3 py-2.5 text-sm font-bold transition-transform active:scale-95"
          >
            Send ping
          </button>

          {pinged && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-background p-3"
            >
              {scenario.pingMs != null ? (
                <p className="font-mono text-lg font-extrabold text-emerald-400">
                  reply in {scenario.pingMs}ms
                </p>
              ) : (
                <p className="flex items-center gap-1.5 font-mono text-lg font-extrabold text-rose-400">
                  <TimerOff className="size-4" /> Request timed out
                </p>
              )}
            </motion.div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            {scenario.hops.slice(0, revealed).map((hop, i) => {
              const widthPct = hop.ms != null ? Math.max(6, (hop.ms / maxMs) * 100) : 0;
              const isJump = i === jumpIndex;
              return (
                <motion.div
                  key={`${scenario.id}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-1"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                      {i + 1}
                    </span>
                    <hop.Icon className="size-4 shrink-0 text-foreground" />
                    <span className="flex-1 truncate text-sm font-semibold">
                      {hop.label}
                    </span>
                    {hop.ms != null ? (
                      <span
                        className={cn(
                          "font-mono text-xs font-bold",
                          isJump ? "text-rose-400" : "text-muted-foreground"
                        )}
                      >
                        {hop.ms}ms
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-mono text-xs font-bold text-rose-400">
                        <TimerOff className="size-3" /> * * *
                      </span>
                    )}
                  </div>
                  <div className="ml-[26px] h-1.5 overflow-hidden rounded-full bg-background">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        hop.ms == null
                          ? "bg-rose-400/40"
                          : isJump
                            ? "bg-rose-400"
                            : "bg-sky-400"
                      )}
                    />
                  </div>
                  {isJump && (
                    <p className="ml-[26px] flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                      <Zap className="size-3" /> Latency jumps here — dig in
                      at this hop, not the ones before or after it.
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {!done ? (
            <button
              onClick={() => {
                playTap();
                setRevealed((r) => r + 1);
              }}
              className="rounded-xl border border-primary bg-accent px-3 py-2.5 text-sm font-bold transition-transform active:scale-95"
            >
              {revealed === 0 ? "Send first probe" : "Send next probe →"}
            </button>
          ) : (
            <button
              onClick={() => {
                playTap();
                setRevealed(0);
              }}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-bold text-muted-foreground transition-transform active:scale-95"
            >
              Reset walkthrough
            </button>
          )}
        </div>
      )}
    </>
  );
}
