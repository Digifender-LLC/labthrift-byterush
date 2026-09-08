"use client";

// Educational disk-usage playground: a fake 100 GB drive pre-loaded with the
// usual full-disk culprits. Flip each one "cleaned" to watch the gauge free
// up and see the one-liner that would actually reclaim that space for real.
// No filesystem is read or touched — every number here is made up.

import { useState } from "react";
import { motion } from "framer-motion";
import { Box, Camera, Download, FileStack, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { playTap } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const DISK_TOTAL_GB = 100;
const BASE_GB = 40; // OS, apps, and your actual files — not reclaimable here

interface Culprit {
  id: string;
  label: string;
  sizeGb: number;
  color: string;
  Icon: typeof Box;
  tip: string;
}

const CULPRITS: Culprit[] = [
  {
    id: "docker",
    label: "Docker images & volumes",
    sizeGb: 16,
    color: "bg-sky-400",
    Icon: Box,
    tip: "Old image layers and stopped containers pile up fast. `docker system prune -a` is the nuclear (but effective) option.",
  },
  {
    id: "logs",
    label: "System logs",
    sizeGb: 8,
    color: "bg-amber-400",
    Icon: FileStack,
    tip: "/var/log grows forever if a service error-loops. `journalctl --vacuum-size=200M` caps it fast.",
  },
  {
    id: "snapshots",
    label: "VM & container snapshots",
    sizeGb: 14,
    color: "bg-violet-400",
    Icon: Camera,
    tip: "Each snapshot freezes a full disk state. The ones you'll never roll back to are pure waste.",
  },
  {
    id: "downloads",
    label: "Downloads & old ISOs",
    sizeGb: 12,
    color: "bg-rose-400",
    Icon: Download,
    tip: "That distro ISO from two years ago isn't coming back into style. Sort by size, delete without mercy.",
  },
  {
    id: "caches",
    label: "Package & browser caches",
    sizeGb: 6,
    color: "bg-emerald-400",
    Icon: FileStack,
    tip: "apt, npm, and browsers all stockpile every download they've ever made. Clearing caches is always safe.",
  },
  {
    id: "trash",
    label: "Trash / Recycle Bin",
    sizeGb: 4,
    color: "bg-fuchsia-400",
    Icon: Trash2,
    tip: "Deleting a file doesn't free space until the trash is emptied too.",
  },
];

export function DiskUsageTool() {
  const [cleaned, setCleaned] = useState<Record<string, boolean>>({});

  const reclaimedGb = CULPRITS.reduce(
    (sum, c) => sum + (cleaned[c.id] ? c.sizeGb : 0),
    0
  );
  const usedGb =
    BASE_GB +
    CULPRITS.reduce((sum, c) => sum + (cleaned[c.id] ? 0 : c.sizeGb), 0);
  const usedPct = (usedGb / DISK_TOTAL_GB) * 100;
  const basePct = (BASE_GB / DISK_TOTAL_GB) * 100;

  return (
    <div className="flex flex-col gap-4">
      {/* headline numbers */}
      <div className="flex items-baseline justify-between rounded-2xl border border-border bg-card p-4">
        <div>
          <p className="font-mono text-2xl font-extrabold text-foreground">
            {usedGb}{" "}
            <span className="text-sm font-semibold text-muted-foreground">
              / {DISK_TOTAL_GB} GB
            </span>
          </p>
          <p className="text-[11px] text-muted-foreground">used on this drive</p>
        </div>
        {reclaimedGb > 0 && (
          <p className="font-mono text-sm font-bold text-emerald-400">
            +{reclaimedGb} GB freed
          </p>
        )}
      </div>

      {/* stacked gauge */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex h-5 w-full overflow-hidden rounded-full bg-background">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="h-full bg-muted-foreground/40"
            style={{ width: `${basePct}%` }}
          />
          {CULPRITS.map((c) => (
            <motion.div
              key={c.id}
              layout
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className={cn("h-full", c.color)}
              style={{
                width: cleaned[c.id] ? "0%" : `${(c.sizeGb / DISK_TOTAL_GB) * 100}%`,
              }}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-3 text-[10px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-muted-foreground/40" /> OS &amp; files
          </span>
          <span>{usedPct.toFixed(0)}% full</span>
        </div>
      </div>

      {/* per-culprit rows */}
      <div className="flex flex-col gap-2">
        {CULPRITS.map((c) => (
          <div
            key={c.id}
            className={cn(
              "rounded-2xl border border-border bg-card p-3 transition-opacity",
              cleaned[c.id] && "opacity-60"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    c.color
                  )}
                >
                  <c.Icon className="size-4 text-black/70" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-tight">{c.label}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {cleaned[c.id] ? "0 GB" : `${c.sizeGb} GB`}
                  </p>
                </div>
              </div>
              <Switch
                checked={Boolean(cleaned[c.id])}
                onCheckedChange={(v) => {
                  playTap();
                  setCleaned((prev) => ({ ...prev, [c.id]: v }));
                }}
                aria-label={`Clean up ${c.label}`}
              />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {c.tip}
            </p>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Simulated disk — no real files are touched. It&apos;s here to build
        the instinct for where storage actually goes.
      </p>
    </div>
  );
}
