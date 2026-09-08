"use client";

// Visual, mobile-first subnet playground: pick a base network, drag the
// prefix slider, and watch network/host bits, ranges, and host counts react.

import { useState } from "react";
import { motion } from "framer-motion";
import { playTap } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "Home Wi-Fi", ip: "192.168.1.0" },
  { label: "Big office", ip: "10.0.0.0" },
  { label: "Cloud VPC", ip: "172.16.0.0" },
];

function ipToInt(ip: string): number {
  return ip
    .split(".")
    .reduce((acc, octet) => ((acc << 8) | (parseInt(octet, 10) & 0xff)) >>> 0, 0);
}

function intToIp(n: number): string {
  return [n >>> 24, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(".");
}

export function SubnetCalculator() {
  const [baseIp, setBaseIp] = useState(PRESETS[0].ip);
  const [prefix, setPrefix] = useState(24);

  const mask = (~0 << (32 - prefix)) >>> 0;
  const network = (ipToInt(baseIp) & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const hostBits = 32 - prefix;
  const usable = 2 ** hostBits - 2; // prefix capped at /30, so always ≥ 2
  const networkOctets = [network >>> 24, (network >>> 16) & 0xff, (network >>> 8) & 0xff, network & 0xff];

  return (
    <div className="flex flex-col gap-4">
      {/* base network presets */}
      <div className="flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.ip}
            onClick={() => {
              playTap();
              setBaseIp(p.ip);
            }}
            className={cn(
              "flex-1 rounded-xl border px-2 py-2 text-center transition-colors",
              baseIp === p.ip
                ? "border-primary bg-accent"
                : "border-border bg-card"
            )}
          >
            <span className="block text-xs font-bold">{p.label}</span>
            <span className="block font-mono text-[11px] text-muted-foreground">
              {p.ip}
            </span>
          </button>
        ))}
      </div>

      {/* prefix slider */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-2xl font-extrabold text-sky-400">
            /{prefix}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            {prefix} network bits · {hostBits} host bits
          </span>
        </div>
        <input
          type="range"
          min={8}
          max={30}
          value={prefix}
          aria-label="Network prefix length"
          onChange={(e) => setPrefix(Number(e.target.value))}
          className="mt-3 w-full accent-sky-400"
        />
        <p className="mt-1 text-center text-[11px] text-muted-foreground">
          drag to carve the network
        </p>
      </div>

      {/* 32-bit visual: one row per octet */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-4 text-[11px] font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-sky-400" /> network bits
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-amber-400" /> host bits
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {Array.from({ length: 8 }).map((_, bit) => {
                  const idx = row * 8 + bit;
                  const isNetwork = idx < prefix;
                  return (
                    <motion.span
                      key={bit}
                      layout
                      animate={{
                        backgroundColor: isNetwork ? "#38bdf8" : "#fbbf24",
                        opacity: isNetwork ? 1 : 0.85,
                      }}
                      className="h-4 flex-1 rounded-[3px]"
                    />
                  );
                })}
              </div>
              <span className="w-9 text-right font-mono text-xs font-bold text-muted-foreground">
                {networkOctets[row]}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          The blue part names the network — it stays fixed. The amber part is
          yours to hand out to devices.
        </p>
      </div>

      {/* live results */}
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["Subnet mask", intToIp(mask)],
            ["Network", `${intToIp(network)}/${prefix}`],
            ["First usable", intToIp(network + 1)],
            ["Last usable", intToIp(broadcast - 1)],
            ["Broadcast", intToIp(broadcast)],
            ["Usable hosts", usable.toLocaleString("en-US")],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p
              className={cn(
                "mt-0.5 font-mono text-sm font-bold",
                label === "Usable hosts" && "text-emerald-400"
              )}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        hosts = 2^{hostBits} − 2 · the network and broadcast addresses are
        reserved
      </p>
    </div>
  );
}
