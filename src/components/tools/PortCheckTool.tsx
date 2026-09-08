"use client";

// Educational port sandbox: pick a well-known port, flip a couple of
// switches, and see how the *same* port looks totally different depending
// on whether you're standing inside the LAN or out on the open internet.
// Nothing here touches a real network — every state is simulated locally,
// so there's no scanning of arbitrary hosts.

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Home, Lock, ShieldAlert, Unlock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { playTap } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const PORTS = [
  { port: 22, service: "SSH", hint: "remote terminal" },
  { port: 80, service: "HTTP", hint: "plain web traffic" },
  { port: 443, service: "HTTPS", hint: "encrypted web traffic" },
  { port: 3389, service: "RDP", hint: "remote desktop" },
] as const;

type Vantage = "inside" | "outside";
type Status = "open" | "closed" | "filtered";

function getStatus(vantage: Vantage, running: boolean, forwarded: boolean): Status {
  // Inside the LAN, a service is either up or it isn't — the border
  // firewall only guards traffic coming from outside.
  if (vantage === "inside") return running ? "open" : "closed";
  if (!forwarded) return "filtered";
  return running ? "open" : "closed";
}

const STATUS_COPY: Record<
  Status,
  { label: string; color: string; barColor: string; detail: string }
> = {
  open: {
    label: "OPEN — listening",
    color: "text-emerald-400",
    barColor: "bg-emerald-400",
    detail:
      "The handshake completes instantly. Something is up and reachable from right here.",
  },
  closed: {
    label: "CLOSED — connection refused",
    color: "text-amber-400",
    barColor: "bg-amber-400",
    detail:
      "A reply comes right back saying 'nothing's listening here.' At least it's a fast, honest no.",
  },
  filtered: {
    label: "FILTERED — no response",
    color: "text-rose-400",
    barColor: "bg-rose-400",
    detail:
      "The firewall drops the packet on the floor. No reset, no reply — from outside, this looks identical to a port that doesn't even exist.",
  },
};

export function PortCheckTool() {
  const [portIdx, setPortIdx] = useState(0);
  const [vantage, setVantage] = useState<Vantage>("outside");
  const [running, setRunning] = useState(true);
  const [forwarded, setForwarded] = useState(false);

  const selected = PORTS[portIdx];
  const status = getStatus(vantage, running, forwarded);
  const copy = STATUS_COPY[status];
  const reachesService = status !== "filtered";
  const animKey = `${vantage}-${running}-${forwarded}`;

  return (
    <div className="flex flex-col gap-4">
      {/* port presets */}
      <div className="flex gap-2">
        {PORTS.map((p, i) => (
          <button
            key={p.port}
            onClick={() => {
              playTap();
              setPortIdx(i);
            }}
            className={cn(
              "flex-1 rounded-xl border px-2 py-2 text-center transition-colors",
              portIdx === i ? "border-primary bg-accent" : "border-border bg-card"
            )}
          >
            <span className="block font-mono text-sm font-bold">{p.port}</span>
            <span className="block text-[11px] text-muted-foreground">
              {p.service}
            </span>
          </button>
        ))}
      </div>

      {/* vantage point */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold text-muted-foreground">
          Where are you looking from?
        </p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => {
              playTap();
              setVantage("inside");
            }}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-sm font-bold transition-colors",
              vantage === "inside"
                ? "border-primary bg-accent"
                : "border-border bg-background"
            )}
          >
            <Home className="size-4" /> Inside your LAN
          </button>
          <button
            onClick={() => {
              playTap();
              setVantage("outside");
            }}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-sm font-bold transition-colors",
              vantage === "outside"
                ? "border-primary bg-accent"
                : "border-border bg-background"
            )}
          >
            <Globe className="size-4" /> From the internet
          </button>
        </div>
      </div>

      {/* toggles */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">
            {selected.service} service is running
          </span>
          <Switch
            checked={running}
            onCheckedChange={(v) => {
              playTap();
              setRunning(v);
            }}
          />
        </label>
        <div className="h-px bg-border" />
        <label
          className={cn(
            "flex items-center justify-between gap-3",
            vantage === "inside" && "opacity-40"
          )}
        >
          <span className="text-sm font-semibold">
            Router forwards this port
          </span>
          <Switch
            checked={forwarded}
            disabled={vantage === "inside"}
            onCheckedChange={(v) => {
              playTap();
              setForwarded(v);
            }}
          />
        </label>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {vantage === "inside"
            ? "Doesn't matter in here — the border firewall only inspects traffic crossing in from outside."
            : "Off by default on almost every router. Someone has to explicitly punch this hole."}
        </p>
      </div>

      {/* diagram: You -> Firewall -> Service */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
          <span className="flex flex-col items-center gap-1">
            <Home className="size-5 text-foreground" />
            You
          </span>
          <div className="relative mx-1.5 h-1 flex-1 overflow-hidden rounded-full bg-border">
            <motion.span
              key={`${animKey}-a`}
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 w-full rounded-full bg-sky-400"
            />
          </div>
          <span className="flex flex-col items-center gap-1">
            {vantage === "outside" ? (
              forwarded ? (
                <Unlock className="size-5 text-foreground" />
              ) : (
                <ShieldAlert className="size-5 text-foreground" />
              )
            ) : (
              <Lock className="size-5 text-foreground" />
            )}
            Firewall
          </span>
          <div className="relative mx-1.5 h-1 flex-1 overflow-hidden rounded-full bg-border">
            <motion.span
              key={`${animKey}-b`}
              initial={{ x: "-100%" }}
              animate={{ x: reachesService ? "0%" : "-60%" }}
              transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
              className={cn(
                "absolute inset-y-0 left-0 w-full rounded-full",
                reachesService ? copy.barColor : "bg-rose-400/50"
              )}
            />
          </div>
          <span className="flex flex-col items-center gap-1">
            <span aria-hidden className="text-base leading-none">
              {running ? "🖥️" : "💤"}
            </span>
            Service
          </span>
        </div>
      </div>

      {/* result */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className={cn("font-mono text-lg font-extrabold", copy.color)}>
          {copy.label}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {copy.detail}
        </p>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        This is a simulation — no real host is ever contacted. Scanning
        systems you don&apos;t own is a great way to get a very stern email.
      </p>
    </div>
  );
}
