"use client";

// Reusable "card accessory" pattern: content cards can declare `tool: "<id>"`
// and get a button under their copy that opens an interactive tool in a
// bottom drawer. Register new tools in CARD_TOOLS — subnet, port-check,
// disk-usage, traceroute, phishing-url-check, and raid-calculator are the
// sandboxes shipped so far.

import type { ComponentType } from "react";
import { Wrench } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { playTap } from "@/lib/sounds";
import { SubnetCalculator } from "./SubnetCalculator";
import { PortCheckTool } from "./PortCheckTool";
import { DiskUsageTool } from "./DiskUsageTool";
import { TracerouteTool } from "./TracerouteTool";
import { PhishingUrlCheckTool } from "./PhishingUrlCheckTool";
import { RaidCalculatorTool } from "./RaidCalculatorTool";

interface CardTool {
  emoji: string;
  label: string;
  title: string;
  description: string;
  Component: ComponentType;
}

const CARD_TOOLS: Record<string, CardTool> = {
  subnet: {
    emoji: "🧮",
    label: "Calculator",
    title: "Subnet playground",
    description: "Drag the prefix and watch the network reshape itself.",
    Component: SubnetCalculator,
  },
  "port-check": {
    emoji: "🔎",
    label: "Port check",
    title: "Port sandbox",
    description:
      "Flip the switches and watch the same port look different from inside vs outside.",
    Component: PortCheckTool,
  },
  "disk-usage": {
    emoji: "💾",
    label: "Disk usage",
    title: "What's eating your disk?",
    description:
      "Clean up the usual culprits and watch a simulated drive free itself up.",
    Component: DiskUsageTool,
  },
  traceroute: {
    emoji: "🧭",
    label: "Trace the path",
    title: "Ping & traceroute playground",
    description:
      "Pick a scenario, tap through the hops, and spot exactly where latency jumps.",
    Component: TracerouteTool,
  },
  "phishing-url-check": {
    emoji: "🎣",
    label: "Spot the phish",
    title: "Phishing URL spot-check",
    description:
      "Guess legit vs. phishing, then see exactly which part of the address bar was lying.",
    Component: PhishingUrlCheckTool,
  },
  "raid-calculator": {
    emoji: "📀",
    label: "RAID calculator",
    title: "RAID playground",
    description:
      "Pick a level, add disks, and see usable space — plus how many drives can die.",
    Component: RaidCalculatorTool,
  },
};

export function CardToolButton({ toolId }: { toolId: string }) {
  const tool = CARD_TOOLS[toolId];
  if (!tool) return null;
  const ToolBody = tool.Component;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          type="button"
          onClick={() => playTap()}
          className="pointer-events-auto mt-1 flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2.5 text-sm font-bold backdrop-blur-sm outline-none transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/70 active:scale-95"
        >
          <span aria-hidden>{tool.emoji}</span> {tool.label}
          <Wrench className="size-3.5 text-white/60" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto w-full max-w-md">
        <DrawerHeader>
          <DrawerTitle>
            {tool.emoji} {tool.title}
          </DrawerTitle>
          <DrawerDescription>{tool.description}</DrawerDescription>
        </DrawerHeader>
        <div className="no-scrollbar overflow-y-auto px-4 pb-8">
          <ToolBody />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
