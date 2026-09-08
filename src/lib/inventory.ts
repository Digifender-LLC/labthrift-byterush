// Lightweight "what's in your lab?" questions, asked one at a time inside the
// feed — never as a big form. Answers build a gear profile (have / planned /
// pass) that tailors which lessons the feed surfaces first.

import type { InventoryStatus } from "./syncTypes";

export type { InventoryStatus };

export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  /** The question the feed asks, phrased for a first-timer. */
  question: string;
  /** Tiny nudge shown under the question. */
  blurb: string;
}

export const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "pi-hole",
    name: "Pi-hole",
    emoji: "🕳️",
    question: "Do you run a Pi-hole (or another DNS ad-blocker)?",
    blurb: "Network-wide ad blocking via DNS.",
  },
  {
    id: "tailscale",
    name: "Tailscale",
    emoji: "🔗",
    question: "Do you use Tailscale (or another mesh VPN)?",
    blurb: "Reach your machines from anywhere, no port forwarding.",
  },
  {
    id: "nas",
    name: "NAS",
    emoji: "🗄️",
    question: "Got a NAS for your files and backups?",
    blurb: "TrueNAS, Unraid, Synology — anything that serves files.",
  },
  {
    id: "old-pc",
    name: "Spare PC",
    emoji: "🖥️",
    question: "Have an old PC or laptop you could turn into a server?",
    blurb: "The classic homelab starter kit.",
  },
  {
    id: "raspberry-pi",
    name: "Raspberry Pi",
    emoji: "🍓",
    question: "Is there a Raspberry Pi (or similar mini PC) in your life?",
    blurb: "Small board, endless projects.",
  },
  {
    id: "managed-switch",
    name: "Managed switch",
    emoji: "🔀",
    question: "Do you have a managed network switch?",
    blurb: "Unlocks VLANs and real network segmentation.",
  },
  {
    id: "ups",
    name: "UPS",
    emoji: "🔋",
    question: "Is your gear on a UPS (battery backup)?",
    blurb: "Keeps things alive through power blips.",
  },
  {
    id: "proxmox",
    name: "Proxmox",
    emoji: "🧊",
    question: "Are you running Proxmox (or another hypervisor)?",
    blurb: "One box, many virtual machines.",
  },
  {
    id: "docker-host",
    name: "Docker host",
    emoji: "📦",
    question: "Do you have a machine running Docker containers?",
    blurb: "Where your self-hosted apps live.",
  },
  {
    id: "domain-name",
    name: "Own domain",
    emoji: "🌐",
    question: "Do you own a domain name?",
    blurb: "Unlocks real HTTPS and pretty URLs for your services.",
  },
];

export const inventoryItemById = (id: string): InventoryItem | undefined =>
  INVENTORY_ITEMS.find((i) => i.id === id);

/**
 * Which lessons become more relevant when the user has (or plans) a piece of
 * gear. Used to re-rank the feed and badge lessons as "picked for your lab".
 */
export const LESSON_GEAR: Record<string, string[]> = {
  "homelab-why": ["old-pc", "raspberry-pi"],
  "homelab-proxmox": ["proxmox", "old-pc", "ups"],
  "homelab-pihole": ["pi-hole", "raspberry-pi"],
  "homelab-nas": ["nas", "old-pc", "ups"],
    "homelab-reverse-proxy": ["docker-host", "domain-name"],
    "homelab-first-service": ["old-pc", "raspberry-pi", "docker-host"],
    "homelab-backups": ["nas", "ups", "old-pc"],
    "homelab-tailscale": ["tailscale"],
    "homelab-vlans": ["managed-switch", "pi-hole"],
    "homelab-updates": ["proxmox", "docker-host", "ups"],
    "homelab-monitoring": ["docker-host", "ups", "proxmox"],
  "net-dns": ["pi-hole", "domain-name"],
  "net-subnets": ["managed-switch", "pi-hole"],
  "net-osi": ["managed-switch"],
  "net-nat": ["tailscale"],
  "net-dhcp": ["managed-switch", "pi-hole", "old-pc"],
  "net-firewall": ["tailscale", "managed-switch", "docker-host"],
  "net-http": ["pi-hole", "docker-host"],
  "net-ping-traceroute": ["managed-switch", "tailscale"],
  "linux-ssh": ["tailscale", "old-pc", "raspberry-pi"],
  "linux-systemd": ["proxmox", "old-pc"],
  "linux-fs": ["nas"],
  "linux-packages": ["old-pc", "raspberry-pi", "proxmox"],
  "linux-disk": ["nas", "proxmox", "docker-host"],
  "linux-processes": ["old-pc", "proxmox", "docker-host", "raspberry-pi"],
  "linux-logs": ["proxmox", "old-pc", "docker-host"],
  "docker-what": ["docker-host", "proxmox"],
  "docker-images": ["docker-host"],
  "docker-compose": ["docker-host"],
  "docker-volumes": ["docker-host", "nas"],
  "sec-zerotrust": ["tailscale"],
  "sec-tls": ["domain-name"],
  "sec-public-wifi": ["tailscale"],
  "sec-updates-patches": ["proxmox", "docker-host", "old-pc"],
  "ent-sre": ["ups"],
};

/**
 * Relevance boost for a lesson given the user's inventory.
 * "have" and "planned" both count — someone planning Tailscale wants the
 * NAT/zero-trust lessons just as much as someone who has it.
 */
export function gearBoost(
  lessonId: string,
  inventory: Record<string, InventoryStatus>
): number {
  const gear = LESSON_GEAR[lessonId];
  if (!gear) return 0;
  let boost = 0;
  for (const itemId of gear) {
    const status = inventory[itemId];
    if (status === "have" || status === "planned") boost += 1;
  }
  return boost;
}

/** Gear items (owned or planned) that make this lesson relevant. */
export function relevantGear(
  lessonId: string,
  inventory: Record<string, InventoryStatus>
): InventoryItem[] {
  const gear = LESSON_GEAR[lessonId] ?? [];
  return gear
    .filter((id) => inventory[id] === "have" || inventory[id] === "planned")
    .map((id) => inventoryItemById(id)!)
    .filter(Boolean);
}

/** The next gear question the feed should ask, if any remain. */
export function nextInventoryQuestion(
  inventory: Record<string, InventoryStatus>
): InventoryItem | undefined {
  return INVENTORY_ITEMS.find((item) => !(item.id in inventory));
}

export function inventoryAnsweredCount(
  inventory: Record<string, InventoryStatus>
): number {
  return Object.keys(inventory).length;
}
