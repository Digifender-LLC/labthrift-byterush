"use client";

// "Your lab" on the profile page: the gear profile built from in-feed
// questions. Tapping an item cycles have → planned → pass.

import { motion } from "framer-motion";
import { INVENTORY_ITEMS } from "@/lib/inventory";
import type { InventoryStatus } from "@/lib/syncTypes";
import { useApp } from "@/lib/store";
import { playTap } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<InventoryStatus, string> = {
  have: "Have it",
  planned: "Planned",
  pass: "Not for me",
};

const NEXT_STATUS: Record<InventoryStatus, InventoryStatus> = {
  have: "planned",
  planned: "pass",
  pass: "have",
};

export function LabSection() {
  const inventory = useApp((s) => s.inventory);
  const setInventoryItem = useApp((s) => s.setInventoryItem);
  const answered = Object.keys(inventory).length;

  return (
    <>
      <h2 className="mt-6 text-lg font-extrabold">
        Your lab{" "}
        <span className="text-sm font-semibold text-muted-foreground">
          {answered}/{INVENTORY_ITEMS.length}
        </span>
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        What you have (or plan) shapes your feed. Tap to update.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {INVENTORY_ITEMS.map((item, i) => {
          const status = inventory[item.id];
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.03 * i }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playTap();
                setInventoryItem(item.id, status ? NEXT_STATUS[status] : "have");
              }}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl border p-3 text-left",
                status === "have" && "border-emerald-500/50 bg-emerald-500/10",
                status === "planned" && "border-sky-500/50 bg-sky-500/10",
                status === "pass" && "border-border bg-card opacity-60",
                !status && "border-dashed border-border bg-card"
              )}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold">
                  {item.name}
                </span>
                <span
                  className={cn(
                    "block text-[10px] font-semibold",
                    status === "have" && "text-emerald-400",
                    status === "planned" && "text-sky-400",
                    status === "pass" && "text-muted-foreground",
                    !status && "text-muted-foreground/60"
                  )}
                >
                  {status ? STATUS_LABEL[status] : "Not answered"}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </>
  );
}
