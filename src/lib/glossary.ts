// Plain-English definitions for jargon that shows up in card copy.
// Terms are auto-highlighted wherever they appear in lesson card bodies
// (see GlossaryText) — add an entry here and every mention becomes tappable.

export interface GlossaryEntry {
  /** Canonical display name shown as the definition title. */
  term: string;
  /** One or two welcoming sentences. No lectures. */
  definition: string;
  /** Extra spellings/phrasings to match in copy (canonical term included automatically). */
  aliases?: string[];
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: "entropy",
    definition:
      "A measure of how unpredictable something is. More entropy means more possible combinations — and a much harder time for a computer trying to guess.",
  },
  {
    term: "DNS sinkhole",
    aliases: ["sinkhole"],
    definition:
      "A DNS server that answers 'nowhere' on purpose for domains you want blocked, so your device never even connects to them.",
  },
  {
    term: "hypervisor",
    definition:
      "Software that lets one physical computer run several virtual machines side by side — each one thinks it has the hardware to itself.",
  },
  {
    term: "bastion host",
    aliases: ["bastion"],
    definition:
      "A single hardened gateway machine you connect to first, which then lets you reach servers hidden safely behind it.",
  },
  {
    term: "idempotent",
    definition:
      "Fancy word for: doing it twice has the same effect as doing it once. Safe to repeat.",
  },
  {
    term: "egress",
    definition:
      "Data leaving a network or cloud. It's the direction providers usually charge you for.",
  },
  {
    term: "TTL",
    aliases: ["TTLs"],
    definition:
      "Time To Live — how long a piece of data may be cached before it's considered stale and fetched fresh.",
  },
  {
    term: "CIDR",
    definition:
      "The slash notation (like /24) that says how many bits of an IP address name the network. It stands for Classless Inter-Domain Routing — nobody says the long version.",
  },
  {
    term: "resolver",
    definition:
      "The DNS server your device asks to turn names into IP addresses. It does the whole lookup journey for you and remembers the answers.",
  },
  {
    term: "head-of-line blocking",
    definition:
      "When one slow or lost packet holds up everything queued behind it — like the front of a checkout line fumbling for coins.",
  },
  {
    term: "blast radius",
    definition:
      "How much damage something can cause if it goes wrong. Smaller permissions, smaller blast radius.",
  },
  {
    term: "drift",
    definition:
      "When real infrastructure slowly stops matching the code that's supposed to describe it — usually thanks to manual edits.",
  },
  {
    term: "OOMKilled",
    aliases: ["OOM kills", "OOM"],
    definition:
      "Out Of Memory — the operating system force-killed a process because it used more memory than it was allowed.",
  },
  {
    term: "broadcast domain",
    aliases: ["broadcast domains"],
    definition:
      "The group of devices that all hear each other's 'everyone, listen up!' network messages. Smaller groups mean less noise.",
  },
  {
    term: "TLS termination",
    aliases: ["terminate TLS"],
    definition:
      "The point where encrypted HTTPS traffic gets decrypted — usually a proxy or load balancer — before being passed along inside.",
  },
  {
    term: "reconciliation loop",
    aliases: ["reconciliation loops"],
    definition:
      "A control loop that constantly compares 'what is' against 'what should be' and nudges reality toward the goal.",
  },
  {
    term: "saturation",
    definition:
      "How full a resource is. A CPU, disk, or network link near its limit is saturated — and about to slow everything down.",
  },
  {
    term: "mesh VPN",
    aliases: ["mesh VPNs"],
    definition:
      "A VPN where your devices connect directly to each other over encrypted tunnels — no central server you have to poke holes in your firewall for.",
  },
  {
    term: "VLAN",
    aliases: ["VLANs", "virtual LAN"],
    definition:
      "A virtual LAN — a separate mini-network on the same switch, so your IoT gadgets and your servers don't share the same broadcast domain.",
  },
  {
    term: "sandbox",
    definition:
      "A safe place to experiment where breaking things doesn't hurt production — your homelab, a test VM, or a throwaway container.",
  },
  {
    term: "snapshot",
    aliases: ["snapshots"],
    definition:
      "A frozen save point of a VM or disk. Mess something up, roll back to the snapshot, and pretend the last hour never happened.",
  },
  {
    term: "CPU",
    aliases: ["processor"],
    definition:
      "The chip that runs your programs — opening apps, playing video, crunching numbers. When fans spin up, the CPU is working hard.",
  },
  {
    term: "RAM",
    aliases: ["memory"],
    definition:
      "Short-term memory — fast scratch space for what's running right now. It clears when you power off. Too many open apps and tabs eat RAM first.",
  },
  {
    term: "SSD",
    definition:
      "Solid State Drive — fast storage with no spinning parts. Where your OS, apps, and files live between reboots.",
  },
  {
    term: "operating system",
    aliases: ["OS"],
    definition:
      "The software that runs the whole machine — Windows, macOS, Linux, iOS, Android. Manages files, Wi-Fi, updates, and every app.",
  },
  {
    term: "browser",
    definition:
      "An app for visiting websites — Chrome, Firefox, Safari, Edge. Not the same as your operating system; closing it doesn't shut down the computer.",
  },
  {
    term: "Wi-Fi",
    definition:
      "Wireless internet from your router through the air. Convenient, but walls and crowded networks can make it flaky.",
  },
  {
    term: "ethernet",
    definition:
      "A cable from your device straight into the router. Same home network as Wi-Fi, usually steadier for calls and big downloads.",
  },
  {
    term: "router",
    definition:
      "The box that splits your home internet for all your devices — Wi-Fi and wired ports. Often combined with the modem in one unit.",
  },
  {
    term: "modem",
    definition:
      "The device that talks to your ISP and brings internet into the house. Your router (or combo box) plugs into it.",
  },
  {
    term: "passkey",
    aliases: ["passkeys"],
    definition:
      "A login method that uses a cryptographic key on your device instead of a typed password — usually unlocked with fingerprint or face.",
  },
  {
    term: "2FA",
    aliases: ["two-factor authentication", "MFA"],
    definition:
      "Two-Factor Authentication — a second check after your password, like a code from your phone. Stops most logins even if the password leaks.",
  },
  {
    term: "TOTP",
    aliases: ["time-based one-time password"],
    definition:
      "A short-lived numeric code your authenticator app generates from a shared secret — usually a new 6-digit code every 30 seconds.",
  },
  {
    term: "authenticator app",
    aliases: ["authenticator apps"],
    definition:
      "A phone or desktop app that generates login codes — Google Authenticator, 1Password, Authy. Safer than SMS because codes aren't sent over the phone network.",
  },
  {
    term: "SIM swapping",
    aliases: ["SIM swap"],
    definition:
      "When an attacker convinces your carrier to move your phone number to their SIM — letting them intercept SMS codes meant for you.",
  },
  {
    term: "credential stuffing",
    definition:
      "Trying username-and-password pairs stolen from one breach against other sites — works because people reuse passwords.",
  },
  {
    term: "phishing",
    aliases: ["phish", "phishing attack"],
    definition:
      "Tricking you into giving up passwords or clicking bad links — usually via fake emails or login pages that look like the real thing.",
  },
  {
    term: "social engineering",
    definition:
      "Manipulating people instead of hacking computers — urgency, authority, or fear to make you click, share, or type something you shouldn't.",
  },
  {
    term: "VPN",
    aliases: ["virtual private network"],
    definition:
      "An encrypted tunnel between your device and a trusted exit point — useful on public Wi-Fi and for reaching remote networks without exposing ports.",
  },
  {
    term: "man-in-the-middle",
    aliases: ["man-in-the-middle attack", "MITM"],
    definition:
      "When someone on the network sits between you and a site, reading or changing unencrypted traffic. HTTPS is the main defense.",
  },
  {
    term: "CVE",
    aliases: ["CVEs", "Common Vulnerabilities and Exposures"],
    definition:
      "A public ID for a known software flaw — like CVE-2024-1234 — so vendors, admins, and your package manager know exactly what to patch.",
  },
  {
    term: "patch",
    aliases: ["patches", "security patch", "security update"],
    definition:
      "A software update that fixes a specific bug or vulnerability. Leaving patches unapplied is leaving known doors open.",
  },
  {
    term: "zero-day",
    aliases: ["zero-days", "0-day"],
    definition:
      "A vulnerability attackers are already using before the vendor has a patch ready — the scariest kind, but less common than unpatched known flaws.",
  },
  {
    term: "the cloud",
    aliases: ["cloud"],
    definition:
      "Software running on someone else's computers in a data center, reached over the internet. You rent access instead of owning the hardware.",
  },
  {
    term: "clipboard",
    definition:
      "Invisible holding area for whatever you copied — one slot on most systems. Paste drops it somewhere else.",
  },
  {
    term: "screenshot",
    aliases: ["screenshots"],
    definition:
      "A picture of what's on your screen right now — saved as an image file you can attach or share.",
  },
  {
    term: "malware",
    definition:
      "Malicious software — viruses, spyware, ransomware. Often bundled with downloads from sketchy sites.",
  },
  {
    term: "DHCP",
    aliases: ["Dynamic Host Configuration Protocol"],
    definition:
      "The protocol your router uses to hand out IP addresses automatically — plus subnet mask, gateway, and DNS settings — so you don't configure every device by hand.",
  },
  {
    term: "lease",
    aliases: ["leases", "DHCP lease"],
    definition:
      "How long a DHCP-assigned IP address is yours before the device has to renew it or ask for a new one.",
  },
  {
    term: "default gateway",
    aliases: ["gateway"],
    definition:
      "The router your device sends traffic to when the destination isn't on the local network — usually something like 192.168.1.1.",
  },
  {
    term: "MAC address",
    aliases: ["MAC addresses"],
    definition:
      "A hardware ID burned into your network card. DHCP reservations and switch port security often key off it because it doesn't change like an IP can.",
  },
  {
    term: "stateful firewall",
    aliases: ["stateful"],
    definition:
      "A firewall that remembers outbound connections so return traffic gets through automatically — you don't need a separate rule for every reply.",
  },
  {
    term: "firewall",
    aliases: ["firewalls"],
    definition:
      "A traffic bouncer that allows or blocks packets based on rules — source, destination, port. Good ones default to deny and make you explicitly open what you need.",
  },
  {
    term: "package manager",
    aliases: ["package managers"],
    definition:
      "The tool that installs, updates, and removes software from trusted repositories — apt on Debian/Ubuntu, dnf on Fedora, pacman on Arch.",
  },
  {
    term: "repository",
    aliases: ["repositories", "repo", "repos"],
    definition:
      "A trusted catalog of software packages your package manager pulls from. Stick to your distro's official repos unless you have a good reason not to.",
  },
  {
    term: "inode",
    aliases: ["inodes"],
    definition:
      "A filesystem's file counter — every file and directory uses one. You can run out of inodes while plenty of disk space remains, usually from millions of tiny files.",
  },
  {
    term: "mount point",
    aliases: ["mount points", "mounted"],
    definition:
      "The directory where a storage device plugs into the Linux filesystem tree — like /home on its own disk, or a USB stick at /media/usb.",
  },
  {
    term: "health check",
    aliases: ["health checks"],
    definition:
      "An automated 'is it still alive?' probe — usually a ping or HTTP request on a timer. Monitoring tools fire alerts when checks fail.",
  },
  {
    term: "uptime monitoring",
    aliases: ["uptime check"],
    definition:
      "Watching whether a service responds on a schedule and alerting you when it doesn't — the first layer of homelab monitoring.",
  },
  {
    term: "HTTP",
    definition:
      "Hypertext Transfer Protocol — how browsers and servers talk. Your browser sends a request ('GET this page'), the server sends back headers and content.",
  },
  {
    term: "HTTPS",
    definition:
      "HTTP wrapped in TLS encryption. Traffic between your browser and the server is private — nobody on the network can read passwords or page content in transit.",
  },
  {
    term: "TLS",
    aliases: ["SSL"],
    definition:
      "Transport Layer Security — the encryption layer behind HTTPS. It scrambles data in transit and proves you're talking to the right server (via certificates). People still say SSL; TLS is the modern name.",
  },
  {
    term: "ICMP",
    definition:
      "Internet Control Message Protocol — the low-level protocol behind ping. Echo requests and replies that answer 'can I reach this IP?'",
  },
  {
    term: "ping",
    definition:
      "A command that sends ICMP echo requests to check if a host is reachable and how long the round trip takes. Simple, fast, and sometimes blocked by firewalls.",
  },
  {
    term: "traceroute",
    aliases: ["tracert"],
    definition:
      "A command that lists every router (hop) between you and a destination, with latency at each step. Shows where a connection gets slow or stuck.",
  },
  {
    term: "port",
    aliases: ["ports", "TCP port"],
    definition:
      "A numbered door on a machine where a specific service listens. Web servers usually sit on port 80 (HTTP) or 443 (HTTPS). Your firewall decides which ports are open.",
  },
  {
    term: "process",
    aliases: ["processes"],
    definition:
      "A running program on your system. Your shell, a web server, a backup script — each one is a process with its own memory and a unique PID.",
  },
  {
    term: "PID",
    aliases: ["process ID"],
    definition:
      "Process ID — the unique number Linux assigns to every running process. You need it to kill, inspect, or debug a specific program.",
  },
  {
    term: "journalctl",
    definition:
      "The command that reads systemd's journal — a centralized log of boot messages, service output, and kernel events. Filter by unit, time, or priority.",
  },
  {
    term: "sudo",
    definition:
      "Superuser do — run one command as root without logging in as root. Your account needs permission in /etc/sudoers. You'll type it constantly on servers.",
  },
  {
    term: "signal",
    aliases: ["signals", "SIGTERM", "SIGKILL"],
    definition:
      "A message the OS sends to a process — usually asking it to stop. SIGTERM is a polite 'please shut down'; SIGKILL is an instant, uncleanable kill.",
  },
];

// ── Matching ─────────────────────────────────────────────────────────────────

const aliasToEntry = new Map<string, GlossaryEntry>();
for (const entry of GLOSSARY) {
  aliasToEntry.set(entry.term.toLowerCase(), entry);
  for (const alias of entry.aliases ?? []) {
    aliasToEntry.set(alias.toLowerCase(), entry);
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Longest aliases first so "DNS sinkhole" wins over "sinkhole".
const TERM_RE = new RegExp(
  `\\b(${Array.from(aliasToEntry.keys())
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join("|")})\\b`,
  "gi"
);

export interface GlossarySegment {
  text: string;
  entry?: GlossaryEntry;
}

/** Splits copy into plain segments and tappable glossary matches. */
export function splitGlossary(text: string): GlossarySegment[] {
  const segments: GlossarySegment[] = [];
  let last = 0;
  for (const match of text.matchAll(TERM_RE)) {
    const start = match.index;
    if (start > last) segments.push({ text: text.slice(last, start) });
    segments.push({
      text: match[0],
      entry: aliasToEntry.get(match[0].toLowerCase()),
    });
    last = start + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments;
}
