export interface Card {
  heading?: string;
  body: string;
  code?: string;
  /**
   * Optional interactive accessory rendered as a button under the copy —
   * see CARD_TOOLS in src/components/tools/CardToolButton.tsx.
   */
  tool?: string;
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  hook: string;
  cards: Card[];
}

export interface Topic {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  gradient: string;
}

export const TOPICS: Topic[] = [
  {
    id: "basics",
    name: "Computer basics",
    emoji: "💻",
    tagline: "Start here — no jargon required",
    gradient: "from-indigo-400 to-blue-600",
  },
  {
    id: "homelab",
    name: "Homelab",
    emoji: "🏠",
    tagline: "Run your own mini datacenter",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "networking",
    name: "Networking",
    emoji: "🌐",
    tagline: "How packets actually move",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    id: "linux",
    name: "Linux",
    emoji: "🐧",
    tagline: "The OS that runs the internet",
    gradient: "from-zinc-500 to-slate-700",
  },
  {
    id: "docker",
    name: "Docker & Containers",
    emoji: "📦",
    tagline: "Ship it anywhere, run it anywhere",
    gradient: "from-cyan-500 to-teal-600",
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    emoji: "☸️",
    tagline: "Orchestrate all the things",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "cloud",
    name: "Cloud",
    emoji: "☁️",
    tagline: "AWS, Azure & GCP essentials",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "devops",
    name: "DevOps & CI/CD",
    emoji: "🔁",
    tagline: "Automate everything",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    id: "security",
    name: "Security",
    emoji: "🔐",
    tagline: "Think like an attacker",
    gradient: "from-rose-500 to-red-600",
  },
  {
    id: "databases",
    name: "Databases",
    emoji: "🗄️",
    tagline: "Where the data lives",
    gradient: "from-fuchsia-500 to-pink-600",
  },
  {
    id: "enterprise",
    name: "Enterprise & Architecture",
    emoji: "🏢",
    tagline: "Systems at serious scale",
    gradient: "from-yellow-500 to-amber-600",
  },
];

export const LESSONS: Lesson[] = [
  // ─────────────────────────── HOMELAB ───────────────────────────
  {
    id: "homelab-why",
    topicId: "homelab",
    title: "Why even have a homelab?",
    hook: "The cheapest way to learn skills companies pay six figures for.",
    cards: [
      {
        body: "A homelab is any hardware you own that you use to learn: an old laptop, a Raspberry Pi, or a rack of servers in your garage. It's a sandbox where breaking things is the whole point.",
      },
      {
        heading: "Why it beats tutorials",
        body: "Tutorials give you a happy path. A homelab gives you 2 AM DNS failures, full disks, and broken updates — the exact problems sysadmins and SREs get paid to solve.",
      },
      {
        heading: "Start stupid small",
        body: "One old PC running Proxmox or a $60 Raspberry Pi is enough to host Pi-hole, a media server, and a handful of containers. Skill first, hardware later.",
      },
    ],
  },
  {
    id: "homelab-proxmox",
    topicId: "homelab",
    title: "Proxmox: one box, many machines",
    hook: "Turn a single PC into 10 virtual servers — for free.",
    cards: [
      {
        body: "Proxmox VE is a free, open-source hypervisor. Install it on bare metal and it lets you carve one physical machine into many virtual machines and Linux containers, all managed from a web UI.",
      },
      {
        heading: "VMs vs LXC containers",
        body: "VMs emulate full hardware — perfect for other OSes or strong isolation. LXC containers share the host kernel, so they boot in seconds and use a fraction of the RAM. Most homelab services run great in LXC.",
      },
      {
        heading: "The killer features",
        body: "Snapshots let you save a VM's state before risky changes and roll back instantly. Templates let you clone a fresh Ubuntu VM in seconds. Clustering joins multiple nodes into one pool.",
      },
    ],
  },
  {
    id: "homelab-pihole",
    topicId: "homelab",
    title: "Pi-hole: block ads for your whole network",
    hook: "One tiny DNS server. Every device on your Wi-Fi loses ads.",
    cards: [
      {
        body: "Pi-hole is a DNS sinkhole. Your devices ask it 'where is ads.tracker.com?' and it answers 'nowhere' — so the ad never even downloads. It works for every device on the network, including smart TVs.",
      },
      {
        heading: "How DNS blocking works",
        body: "Every website visit starts with a DNS lookup. Pi-hole checks each lookup against blocklists of known ad and tracking domains. Blocked domains get a fake answer; everything else is forwarded to a real DNS server.",
      },
      {
        heading: "Why it's a great first project",
        body: "It teaches DNS, DHCP, and static IPs — three fundamentals — and it gives instant, visible results. The admin dashboard showing thousands of blocked queries is its own dopamine hit.",
      },
    ],
  },
  {
    id: "homelab-nas",
    topicId: "homelab",
    title: "Build a NAS, own your data",
    hook: "Stop renting cloud storage. Your files, your disks, your rules.",
    cards: [
      {
        body: "A NAS (Network Attached Storage) is a computer whose job is serving files over your network. TrueNAS and Unraid are the two most popular homelab options.",
      },
      {
        heading: "RAID is not a backup",
        body: "RAID mirrors or stripes data across disks so one drive can die without data loss. But it won't save you from ransomware, accidental deletes, or fire. That's what backups are for.",
        tool: "raid-calculator",
      },
      {
        heading: "The 3-2-1 rule",
        body: "Keep 3 copies of important data, on 2 different types of media, with 1 copy offsite. A NAS plus an external drive plus a cloud backup checks every box.",
      },
    ],
  },
  {
    id: "homelab-reverse-proxy",
    topicId: "homelab",
    title: "Reverse proxies: one door for all your apps",
    hook: "How homelabbers get pretty URLs and HTTPS for every service.",
    cards: [
      {
        body: "You've got 12 services on 12 random ports. A reverse proxy like Nginx, Caddy, or Traefik sits in front of them all, routing plex.home.lab to one container and grafana.home.lab to another — all through port 443.",
      },
      {
        heading: "Free HTTPS everywhere",
        body: "Caddy and Traefik can fetch Let's Encrypt certificates automatically. Your internal dashboards get the padlock icon with zero manual certificate wrangling.",
      },
      {
        heading: "Why this matters for your career",
        body: "Reverse proxying, TLS termination, and routing rules are exactly how production traffic works at every company. Learn it on your Plex server, use it on the job.",
      },
    ],
  },
  {
    id: "homelab-first-service",
    topicId: "homelab",
    title: "Your first homelab service",
    hook: "Pick one small win — not a whole datacenter on day one.",
    cards: [
      {
        body: "Your first project should be something you'll actually use: Pi-hole, a password manager, or a simple file share. One service, one machine, one evening. Momentum beats ambition.",
      },
      {
        heading: "Docker or bare metal?",
        body: "Docker is great when you want easy updates and clean uninstalls. Bare metal (install directly on the OS) is fine for learning fundamentals like systemd and logs. Either path counts — you're building a sandbox, not picking a religion.",
      },
      {
        heading: "The checklist",
        body: "Write down the URL, port, and how you start it after a reboot. Future-you at 2 AM will thank present-you. If it doesn't survive a reboot, it's not really running yet.",
      },
    ],
  },
  {
    id: "homelab-backups",
    topicId: "homelab",
    title: "Backups that actually save you",
    hook: "RAID isn't a backup. Here's what is.",
    cards: [
      {
        body: "A backup is a copy you can restore from after you mess up — deleted files, a bad update, ransomware. If the only copy lives on the same disk as the original, it's not a backup.",
      },
      {
        heading: "Start simple",
        body: "Copy important configs and data to an external USB drive weekly. Tools like rsync or Restic can automate it. Offsite means another building — a friend's house, Backblaze, or a cheap cloud bucket.",
      },
      {
        heading: "Test a restore",
        body: "An untested backup is a wish. Once a quarter, pull a random file back from your backup and open it. Five minutes of proof beats years of false confidence.",
      },
    ],
  },
  {
    id: "homelab-tailscale",
    topicId: "homelab",
    title: "Reach your lab from anywhere",
    hook: "No port forwarding, no punching holes in your router.",
    cards: [
      {
        body: "Tailscale builds a mesh VPN: your phone, laptop, and homelab server all get private addresses on a virtual network. You SSH to 100.x.x.x from a coffee shop like you're on the couch.",
      },
      {
        heading: "Why homelabbers love it",
        body: "Opening ports on your home router is risky and brittle. ISPs block inbound traffic; IPs change. Tailscale handles NAT traversal and encryption so you don't have to become a firewall wizard on day three.",
      },
      {
        heading: "Start with one node",
        body: "Install Tailscale on your server and your phone. Ping the server's Tailscale IP. That's it — you've got secure remote admin without exposing services to the whole internet.",
      },
    ],
  },
  {
    id: "homelab-vlans",
    topicId: "homelab",
    title: "VLANs: separate your junk Wi-Fi",
    hook: "Keep smart bulbs off your NAS without buying new hardware.",
    cards: [
      {
        body: "A VLAN is a virtual LAN — separate broadcast domains on the same physical switch. Your IoT gadgets live on VLAN 20; your servers on VLAN 10. They can't chat unless you allow it.",
      },
      {
        heading: "You need a managed switch",
        body: "Consumer Wi-Fi routers sometimes support guest networks, but real VLAN tagging happens on managed switches and capable routers. One $40 used switch unlocks serious segmentation.",
        tool: "subnet",
      },
      {
        heading: "Why bother at home?",
        body: "Cheap smart plugs shouldn't be on the same network as your password manager. VLANs shrink the blast radius when something sketchy phones home — same idea as production, minus the change-request form.",
      },
    ],
  },
  {
    id: "homelab-updates",
    topicId: "homelab",
    title: "Updates without panic",
    hook: "Patch your lab before you learn why patching matters.",
    cards: [
      {
        body: "Unpatched homelabs get owned. Bots scan the internet constantly. Your Plex box with a default password is a target, not a hobby. Updates are boring insurance.",
      },
      {
        heading: "Snapshots are your friend",
        body: "Before a major upgrade — Proxmox, TrueNAS, or the host OS — take a snapshot or image backup. Roll back in minutes if something breaks. Fear of updates usually means fear of no undo button.",
      },
      {
        heading: "Automate the boring stuff",
        body: "Unattended-upgrades on Debian, Watchtower for containers (with caution), or a monthly calendar reminder all work. Perfect is optional; 'not three years behind' is the goal.",
      },
    ],
  },
  {
    id: "homelab-monitoring",
    topicId: "homelab",
    title: "Know when your homelab breaks",
    hook: "You won't notice a dead service until you need it — unless something's watching.",
    cards: [
      {
        body: "Homelab services fail quietly: a container exits, a disk fills up, an update breaks a dependency. Monitoring means something checks 'is this still alive?' and tells you before your spouse asks why Plex is down.",
      },
      {
        heading: "Start with uptime checks",
        body: "Uptime Kuma, Healthchecks.io, or even a cron job that curls your services every few minutes. One green dashboard beats guessing. Ping the URL, check the HTTP status code, done.",
      },
      {
        heading: "Alerts that actually reach you",
        body: "A red dot on a dashboard you never open is useless. Route alerts to your phone — Pushover, Discord, email, whatever you'll actually see at 11 PM. Test the alert path once so you know it works.",
      },
    ],
  },

  // ─────────────────────────── NETWORKING ───────────────────────────
  {
    id: "net-osi",
    topicId: "networking",
    title: "The OSI model in plain English",
    hook: "7 layers. Every network problem lives in one of them.",
    cards: [
      {
        body: "The OSI model splits networking into 7 layers, from physical cables (L1) to the app itself (L7). Its real power: it gives you a shared language to isolate problems.",
      },
      {
        heading: "The layers you'll actually use",
        body: "L2 is switching and MAC addresses. L3 is IP routing. L4 is TCP/UDP ports. L7 is HTTP and apps. When someone says 'it's a layer 3 issue', they mean routing, not cables or apps.",
      },
      {
        heading: "Debug bottom-up",
        body: "Is the cable in (L1)? Do you have a link and MAC (L2)? Can you ping the gateway (L3)? Is the port open (L4)? Then and only then blame the app (L7). This order saves hours.",
      },
    ],
  },
  {
    id: "net-subnets",
    topicId: "networking",
    title: "Subnetting without tears",
    hook: "What /24 actually means — and why it's everywhere.",
    cards: [
      {
        body: "An IP address has two parts: the network part and the host part. The slash number (CIDR) says how many bits belong to the network. /24 means 24 network bits, leaving 8 bits for hosts: 256 addresses.",
        tool: "subnet",
      },
      {
        heading: "The math you actually need",
        body: "Hosts = 2^(32 − prefix) − 2 (network and broadcast addresses are reserved). A /24 gives 254 usable hosts. A /30 gives just 2 — perfect for point-to-point links.",
        tool: "subnet",
      },
      {
        heading: "Why subnet at all?",
        body: "Smaller networks mean smaller broadcast domains, cleaner security boundaries, and organized IP plans. VLANs + subnets are how you separate IoT junk from your real machines.",
      },
    ],
  },
  {
    id: "net-dns",
    topicId: "networking",
    title: "DNS: the internet's phone book",
    hook: "It's always DNS. Here's why everyone says that.",
    cards: [
      {
        body: "DNS translates names like github.com into IP addresses. Your device asks a resolver, which walks the hierarchy: root servers → .com servers → github.com's own name servers.",
      },
      {
        heading: "Records you must know",
        body: "A maps a name to an IPv4 address. AAAA is the IPv6 version. CNAME aliases one name to another. MX routes email. TXT holds arbitrary text — used for domain verification and email security (SPF/DKIM).",
      },
      {
        heading: "Why 'it's always DNS'",
        body: "DNS is cached at many layers — your browser, your OS, your router, your ISP. Stale caches and low TTLs cause weird, intermittent, 'works on my machine' failures. Check DNS early when debugging.",
      },
    ],
  },
  {
    id: "net-tcp-udp",
    topicId: "networking",
    title: "TCP vs UDP: pick your trade-off",
    hook: "One guarantees delivery. The other guarantees speed.",
    cards: [
      {
        body: "TCP is reliable: it establishes a connection (the 3-way handshake), numbers every byte, and retransmits anything lost. Web pages, APIs, and databases ride on TCP.",
      },
      {
        heading: "UDP: fire and forget",
        body: "UDP just sends packets. No handshake, no retries, no ordering. Sounds bad — but for video calls, gaming, and DNS, a late packet is worse than a lost one. Speed wins.",
      },
      {
        heading: "The modern twist",
        body: "HTTP/3 runs over QUIC, which is built on UDP but re-implements reliability in userspace. It gets TCP's guarantees with faster handshakes and no head-of-line blocking.",
      },
    ],
  },
  {
    id: "net-nat",
    topicId: "networking",
    title: "NAT: how 20 devices share one IP",
    hook: "Your whole house is hiding behind a single public address.",
    cards: [
      {
        body: "IPv4 has ~4.3 billion addresses — not enough. NAT (Network Address Translation) lets your router share one public IP among every device at home by rewriting addresses and ports on the fly.",
      },
      {
        heading: "How it works",
        body: "Your laptop (192.168.1.50) requests a website. The router swaps the source to its public IP and a unique port, remembers the mapping, and reverses it when the reply comes back.",
      },
      {
        heading: "The catch",
        body: "Inbound connections have no mapping, so they're dropped — that's why self-hosting needs port forwarding, and why tools like Tailscale that punch through NAT feel like magic.",
      },
    ],
  },
  {
    id: "net-dhcp",
    topicId: "networking",
    title: "DHCP: how devices get an IP",
    hook: "You didn't type 192.168.1.47 — something assigned it automatically.",
    cards: [
      {
        body: "DHCP (Dynamic Host Configuration Protocol) is your router's job fair for IP addresses. When a device joins the network, it shouts 'I need an address!' and the DHCP server hands one out, plus a subnet mask, default gateway, and DNS servers.",
      },
      {
        heading: "Leases and reservations",
        body: "Addresses aren't permanent — they come with a lease time (often 24 hours). When the lease expires, the device renews or gets a new address. For servers you need at a fixed IP, set a DHCP reservation tied to the device's MAC address.",
        tool: "subnet",
      },
      {
        heading: "When DHCP breaks everything",
        body: "Two DHCP servers on the same network is a classic homelab foot-gun: random IPs, duplicate addresses, devices that can't reach the internet. Pi-hole users often run DHCP on the Pi — just remember to disable it on the router first.",
      },
    ],
  },
  {
    id: "net-firewall",
    topicId: "networking",
    title: "Firewalls: what's allowed in and out",
    hook: "Default deny. Explicit allow. That's the whole game.",
    cards: [
      {
        body: "A firewall is a traffic bouncer. It reads each packet's source, destination, and port, then decides allow or drop. Good firewalls default to deny — everything blocked unless you write a rule saying otherwise.",
      },
      {
        heading: "Stateful vs stateless",
        body: "A stateful firewall remembers outbound connections. Your laptop asks for a website, the reply comes back, and the firewall knows it's legit. Stateless firewalls need explicit rules for both directions — fine for datacenters, painful at home.",
      },
      {
        heading: "Where you'll touch one",
        body: "Your router has a firewall. Linux has ufw or nftables. Cloud providers wrap every VM in security groups. The pattern is identical: only open the ports you need, from the sources you trust.",
        tool: "port-check",
      },
    ],
  },
  {
    id: "net-http",
    topicId: "networking",
    title: "How a web request actually travels",
    hook: "You typed a URL. Here's the journey before a single pixel shows up.",
    cards: [
      {
        body: "When you hit Enter, your browser doesn't magically know where github.com lives. It asks DNS for an IP, opens a TCP connection on port 443, then sends an HTTP request: 'GET / this page, please.' The server replies with headers and the HTML your browser renders.",
      },
      {
        heading: "HTTP vs HTTPS",
        body: "Plain HTTP sends everything readable — passwords, cookies, the whole page. HTTPS wraps the same HTTP conversation in TLS encryption so nobody on the wire can snoop or tamper. That little padlock means TLS did its job, not that the site itself is trustworthy.",
      },
      {
        heading: "What you'll actually see",
        body: "Status codes tell the story: 200 means success, 301 is a redirect, 404 is 'not found', 500 is 'server melted.' Headers carry cookies, caching rules, and content type. In a homelab, curl -I https://yourservice.local is the fastest way to check if something's listening without opening a browser.",
        tool: "port-check",
      },
    ],
  },
  {
    id: "net-ping-traceroute",
    topicId: "networking",
    title: "Ping & traceroute: follow the packet",
    hook: "Two commands that answer 'can I reach it?' and 'where did it get stuck?'",
    cards: [
      {
        body: "ping sends tiny ICMP echo requests and waits for replies. If you get responses, the path there and back works at the IP layer. No response doesn't always mean down — some networks block ICMP on purpose, so a failed ping isn't the final word.",
        code: "ping 8.8.8.8          # Google's DNS — quick internet check\nping -c 4 192.168.1.1   # your router, four packets",
      },
      {
        heading: "Traceroute shows the hops",
        body: "traceroute (or tracert on Windows) lists every router between you and the destination, with round-trip time at each hop. When latency spikes at hop 4, that's where to look — your LAN, your ISP, or somewhere out on the internet.",
        code: "traceroute github.com\ntraceroute 192.168.1.10   # is it even on your LAN?",
      },
      {
        heading: "When to reach for each",
        body: "Can't reach your NAS? Ping its IP first — if that fails, it's layer 3 (routing or firewall), not 'the app is broken.' Slow website? Traceroute shows whether the lag is local or miles away. Start broad, then narrow — same bottom-up order as the OSI lesson.",
        tool: "traceroute",
      },
    ],
  },

  // ─────────────────────────── LINUX ───────────────────────────
  {
    id: "linux-fs",
    topicId: "linux",
    title: "The Linux filesystem, decoded",
    hook: "/etc isn't random letters. Every directory has a job.",
    cards: [
      {
        body: "Linux has no C: drive — everything hangs off a single root, /. Disks, USB sticks, even network shares get mounted into the same tree.",
      },
      {
        heading: "The directories that matter",
        body: "/etc holds config files. /var holds changing data like logs. /home is user files. /usr/bin has programs. /tmp is scratch space, wiped on reboot.",
      },
      {
        heading: "Everything is a file",
        body: "Devices (/dev/sda), kernel state (/proc/cpuinfo), even random numbers (/dev/urandom) are exposed as files. That's why simple tools like cat and grep can inspect almost anything.",
      },
    ],
  },
  {
    id: "linux-permissions",
    topicId: "linux",
    title: "chmod 755, explained forever",
    hook: "Those weird numbers finally make sense in 3 cards.",
    cards: [
      {
        body: "Every file has three permission sets: owner, group, and everyone else. Each set has read (r), write (w), and execute (x) flags.",
      },
      {
        heading: "The number trick",
        body: "r=4, w=2, x=1. Add them up per set: 7 = rwx, 6 = rw-, 5 = r-x, 4 = r--. So 755 means the owner can do everything; group and others can read and execute but not write.",
        code: "chmod 755 deploy.sh   # rwxr-xr-x\nchmod 600 id_rsa      # rw------- (private!)",
      },
      {
        heading: "The two you'll use forever",
        body: "755 for scripts and directories, 600 for secrets like SSH keys. SSH will literally refuse to use a private key that other users can read.",
      },
    ],
  },
  {
    id: "linux-systemd",
    topicId: "linux",
    title: "systemd: the boss of every service",
    hook: "One command family to start, stop, and spy on everything.",
    cards: [
      {
        body: "systemd is PID 1 — the first process at boot and the parent of everything else. It starts services, restarts them when they crash, and tracks their logs.",
      },
      {
        heading: "The commands",
        body: "systemctl status nginx shows if it's running and its last log lines. start/stop/restart do what they say. enable makes it start at boot. journalctl -u nginx -f tails its logs live.",
        code: "systemctl status nginx\nsystemctl enable --now nginx\njournalctl -u nginx -f",
      },
      {
        heading: "Unit files",
        body: "Services are defined in .service unit files: what to run, as which user, and what to do on failure. Restart=always is a one-line self-healing service.",
      },
    ],
  },
  {
    id: "linux-pipes",
    topicId: "linux",
    title: "Pipes: the Unix superpower",
    hook: "Chain tiny tools into one-liners that replace whole programs.",
    cards: [
      {
        body: "The pipe | sends one command's output into the next command's input. Each tool does one thing well; pipes compose them into anything.",
      },
      {
        heading: "A real one-liner",
        body: "Find the top 5 IPs hammering your web server:",
        code: "awk '{print $1}' access.log |\n  sort | uniq -c |\n  sort -rn | head -5",
      },
      {
        heading: "The mindset",
        body: "Don't ask 'is there a program for this?' Ask 'which 3 small tools can I chain?' grep filters, awk extracts, sort orders, uniq counts, head trims. That's 90% of log analysis.",
      },
    ],
  },
  {
    id: "linux-ssh",
    topicId: "linux",
    title: "SSH like a professional",
    hook: "Keys, not passwords. Config files, not memory.",
    cards: [
      {
        body: "SSH keys are a cryptographic pair: the private key stays on your machine, the public key goes on servers. Logins become instant, and brute-forcing becomes pointless.",
        code: "ssh-keygen -t ed25519\nssh-copy-id user@server",
      },
      {
        heading: "~/.ssh/config is your friend",
        body: "Stop typing usernames, IPs, and ports. Define hosts once and connect with two words.",
        code: "Host lab\n  HostName 192.168.1.10\n  User admin\n  Port 2222\n\n# now just: ssh lab",
      },
      {
        heading: "Level up: jumps and tunnels",
        body: "ProxyJump chains through a bastion host in one command. Port forwarding (-L) brings a remote database to your localhost. SSH is a Swiss Army knife, not just a login tool.",
      },
    ],
  },
  {
    id: "linux-packages",
    topicId: "linux",
    title: "Installing software on Linux",
    hook: "No hunting for .exe files — your package manager has you.",
    cards: [
      {
        body: "Linux distros ship with a package manager that installs, updates, and removes software from trusted repositories. Debian and Ubuntu use apt, Fedora uses dnf, Arch uses pacman. One command, dependencies included.",
        code: "sudo apt update && sudo apt install htop\nsudo dnf install htop\nsudo pacman -S htop",
      },
      {
        heading: "Update vs upgrade",
        body: "update refreshes the list of what's available. upgrade installs newer versions of packages you already have. On a server, run both regularly — unattended-upgrades can automate the boring part.",
      },
      {
        heading: "When the repo isn't enough",
        body: "Some apps ship as .deb files, AppImages, or install scripts. That's fine for edge cases, but prefer your package manager when you can — it handles dependencies, signatures, and clean uninstalls.",
      },
    ],
  },
  {
    id: "linux-disk",
    topicId: "linux",
    title: "When your disk is full",
    hook: "Everything breaks at once — and the fix is usually one big folder.",
    cards: [
      {
        body: "A full disk is a cascade: services can't write logs, databases can't commit, Docker can't pull images. The first move is always 'how full, and where?' — not rebooting and hoping.",
        code: "df -h          # how full is each mount?\ndu -sh /*       # what's eating space? (may need sudo)",
      },
      {
        heading: "The usual suspects",
        body: "Rotated logs in /var/log, old Docker images and volumes, a database that never got vacuumed, and that one download folder from 2019. journalctl --vacuum-time=7d trims systemd logs safely.",
        tool: "disk-usage",
      },
      {
        heading: "Inodes: the silent killer",
        body: "df can show plenty of free space while the system still screams 'no space left on device.' You've run out of inodes — the filesystem's file counter. Millions of tiny files (mail queues, cache shards) cause this. df -i shows inode usage.",
      },
    ],
  },
  {
    id: "linux-processes",
    topicId: "linux",
    title: "What's running on your box",
    hook: "Every program is a process. Here's how to see them — and stop the runaway one.",
    cards: [
      {
        body: "A process is a running program — your web server, a backup script, even the shell you're typing in. Each one gets a unique PID (process ID). When something's eating CPU or RAM, you find its PID first, then decide what to do about it.",
      },
      {
        heading: "Spot the hog",
        body: "ps shows a snapshot; top and htop show a live leaderboard sorted by CPU and memory. Look for the command name, the user it runs as, and how much it's consuming.",
        code: "ps aux | grep nginx    # find nginx processes\nhtop                   # interactive, press F6 to sort\nps -p 1234 -o pid,cmd  # what's PID 1234?",
      },
      {
        heading: "Stopping things safely",
        body: "kill sends a signal. SIGTERM (15) asks nicely — 'please shut down.' SIGKILL (9) is the hammer: instant death, no cleanup. Try kill 1234 first; kill -9 1234 only when it's truly stuck. For services, prefer systemctl restart over killing PIDs by hand.",
        code: "kill 1234              # polite shutdown\nkill -9 1234           # last resort\nsystemctl restart nginx  # the right way for services",
      },
    ],
  },
  {
    id: "linux-logs",
    topicId: "linux",
    title: "Reading logs without drowning",
    hook: "Something broke. The answer is almost always in the logs — if you know where to look.",
    cards: [
      {
        body: "Linux logs everything: boot messages, service crashes, failed logins, kernel warnings. On modern distros, systemd's journal is the main event — one place to search instead of hunting through dozens of files.",
      },
      {
        heading: "journalctl is your friend",
        body: "journalctl reads the systemd journal. Filter by service, time, or priority. -f follows live output — same vibe as tail -f, but for any unit on the system.",
        code: "journalctl -u nginx -f          # tail nginx logs live\njournalctl -u docker --since today\njournalctl -p err -b            # errors since last boot",
      },
      {
        heading: "Classic log files still exist",
        body: "Not everything goes through journald. Nginx and Apache still write to /var/log, and auth.log tracks SSH attempts. tail -f /var/log/syslog is old-school but still works. When in doubt, check both — the journal and the file.",
        code: "sudo tail -f /var/log/nginx/error.log\ngrep 'Failed password' /var/log/auth.log",
      },
    ],
  },

  // ─────────────────────────── DOCKER ───────────────────────────
  {
    id: "docker-what",
    topicId: "docker",
    title: "Containers are not tiny VMs",
    hook: "The mental model that makes Docker finally click.",
    cards: [
      {
        body: "A VM emulates a whole computer with its own kernel. A container is just a normal Linux process wearing a blindfold — it shares the host kernel but can't see other processes, files, or networks.",
      },
      {
        heading: "The magic ingredients",
        body: "Namespaces limit what a process can see (its own PID list, network stack, filesystem). Cgroups limit what it can use (CPU, memory). That's it — that's containers.",
      },
      {
        heading: "Why everyone cares",
        body: "Containers start in milliseconds and package an app with all its dependencies. 'Works on my machine' becomes 'works on every machine' — the same image runs on your laptop and in production.",
      },
    ],
  },
  {
    id: "docker-images",
    topicId: "docker",
    title: "Images vs containers",
    hook: "One is a recipe. The other is the cake.",
    cards: [
      {
        body: "An image is a read-only template: the app, its libraries, and config, frozen in layers. A container is a running instance of an image. One image can spawn a hundred containers.",
      },
      {
        heading: "Layers are the genius part",
        body: "Each Dockerfile instruction creates a layer. Layers are cached and shared: 50 images based on ubuntu share one copy of it on disk. Change one line of code, and only the top layer rebuilds.",
      },
      {
        heading: "The commands",
        body: "docker pull grabs an image. docker run creates and starts a container. docker ps lists running ones. docker logs shows output. docker exec -it gets you a shell inside.",
        code: "docker run -d -p 8080:80 nginx\ndocker exec -it <id> sh",
      },
    ],
  },
  {
    id: "docker-compose",
    topicId: "docker",
    title: "Docker Compose: your whole stack in one file",
    hook: "App + database + cache, up in one command.",
    cards: [
      {
        body: "Real apps need multiple containers: web, database, cache. Compose describes them all in one YAML file and starts them together, on a shared network, with one command: docker compose up.",
      },
      {
        heading: "A taste",
        body: "Services find each other by name — the app connects to 'db', not an IP.",
        code: "services:\n  web:\n    build: .\n    ports: [\"8080:3000\"]\n  db:\n    image: postgres:16\n    volumes:\n      - dbdata:/var/lib/postgresql/data",
      },
      {
        heading: "Why homelabbers love it",
        body: "Your entire self-hosted setup becomes a folder of compose files in git. New server? Clone the repo, docker compose up, done. Infrastructure you can version-control.",
      },
    ],
  },
  {
    id: "docker-volumes",
    topicId: "docker",
    title: "Volumes: don't lose your data",
    hook: "Delete a container, keep the database. Here's how.",
    cards: [
      {
        body: "A container's filesystem dies with the container. Volumes are storage that lives outside, managed by Docker, and mounted in. Databases without volumes are data loss with extra steps.",
      },
      {
        heading: "Volumes vs bind mounts",
        body: "Named volumes (dbdata:/var/lib/postgresql/data) are Docker-managed — best for databases. Bind mounts (./config:/etc/app) map a host folder in — best for config files you want to edit directly.",
      },
      {
        heading: "The rule of thumb",
        body: "If losing it would hurt, it goes in a volume. Containers should be disposable; data should be sacred. This same principle scales all the way up to Kubernetes.",
      },
    ],
  },

  // ─────────────────────────── KUBERNETES ───────────────────────────
  {
    id: "k8s-why",
    topicId: "kubernetes",
    title: "What Kubernetes actually does",
    hook: "You declare the goal. It fights reality to make it true.",
    cards: [
      {
        body: "Kubernetes runs containers across a fleet of machines. You tell it 'I want 3 replicas of this app, always' — and it schedules, restarts, and rebalances to keep that promise.",
      },
      {
        heading: "Declarative, not imperative",
        body: "You don't script the steps; you declare the end state in YAML. Controllers run reconciliation loops forever: observe actual state, compare to desired state, fix the difference.",
      },
      {
        heading: "When you actually need it",
        body: "One server with Compose is fine for most things. Kubernetes earns its complexity when you need self-healing, zero-downtime deploys, autoscaling, or many teams sharing a platform.",
      },
    ],
  },
  {
    id: "k8s-pods",
    topicId: "kubernetes",
    title: "Pods, Deployments, Services",
    hook: "The 3 objects that are 80% of everyday Kubernetes.",
    cards: [
      {
        body: "A Pod is the smallest unit: one or more containers sharing a network and storage. Pods are mortal — they die and get replaced, and their IPs change constantly.",
      },
      {
        heading: "Deployments manage pods",
        body: "A Deployment says 'keep 3 replicas of this pod spec running'. It handles rolling updates: new pods come up, old ones drain, users never notice. Rollbacks are one command.",
      },
      {
        heading: "Services give them a stable address",
        body: "Since pod IPs churn, a Service provides one stable name and IP that load-balances across whatever pods currently match its selector. Apps talk to Services, never to pods directly.",
      },
    ],
  },
  {
    id: "k8s-kubectl",
    topicId: "kubernetes",
    title: "kubectl: your survival kit",
    hook: "Six commands that handle most cluster debugging.",
    cards: [
      {
        body: "kubectl is the CLI for talking to a cluster. Almost every debugging session starts the same way: what's running, and what's wrong with it?",
        code: "kubectl get pods\nkubectl describe pod <name>\nkubectl logs <name> -f",
      },
      {
        heading: "The debugging flow",
        body: "get pods shows status — look for CrashLoopBackOff or Pending. describe shows events: image pull errors, failed scheduling, OOM kills. logs shows what the app itself said before dying.",
      },
      {
        heading: "Two more lifesavers",
        body: "kubectl exec -it <pod> -- sh gets a shell inside. kubectl port-forward svc/myapp 8080:80 brings a cluster service to your laptop. No ingress needed for quick checks.",
      },
    ],
  },
  {
    id: "k8s-crashloop",
    topicId: "kubernetes",
    title: "CrashLoopBackOff, demystified",
    hook: "The most famous Kubernetes error, and the checklist that fixes it.",
    cards: [
      {
        body: "CrashLoopBackOff means: the container started, died, and Kubernetes keeps restarting it with growing delays. It's not the disease — it's the symptom. Something inside is failing fast.",
      },
      {
        heading: "The checklist",
        body: "1) kubectl logs --previous — what did the last dead container say? 2) describe pod — was it OOMKilled? 3) Bad config or missing env var/secret? 4) Does the liveness probe kill it before it's ready?",
      },
      {
        heading: "The usual suspects",
        body: "Crashed on a missing environment variable, couldn't reach the database, or memory limit too low. Fix the cause, and the loop heals itself — that's the reconciliation loop working as designed.",
      },
    ],
  },

  // ─────────────────────────── CLOUD ───────────────────────────
  {
    id: "cloud-shared",
    topicId: "cloud",
    title: "The shared responsibility model",
    hook: "The cloud is secure. Your configuration of it might not be.",
    cards: [
      {
        body: "AWS, Azure, and GCP secure the infrastructure: datacenters, hardware, hypervisors. You secure what you build on it: your data, access policies, and configurations.",
      },
      {
        heading: "Where breaches actually happen",
        body: "The classic cloud breach isn't a hacked datacenter — it's a public S3 bucket, an over-permissive IAM role, or leaked access keys in a git repo. Misconfiguration, not infrastructure.",
      },
      {
        heading: "The line moves with the service",
        body: "On a VM (EC2), you patch the OS. On a managed database (RDS), the provider does. With serverless (Lambda), you only own your code and its permissions. Higher abstraction = less on your plate.",
      },
    ],
  },
  {
    id: "cloud-compute",
    topicId: "cloud",
    title: "VMs, containers, or serverless?",
    hook: "The 3 compute models — and how to choose in 10 seconds.",
    cards: [
      {
        body: "Every cloud offers the same ladder: VMs (EC2, Azure VMs, GCE) give you a whole machine. Container services (ECS, EKS, Cloud Run) run your images. Serverless (Lambda, Cloud Functions) runs just your function.",
      },
      {
        heading: "The 10-second decision",
        body: "Weird legacy app or need full OS control? VM. Standard web service with steady traffic? Containers. Spiky, event-driven work like 'resize image on upload'? Serverless — you pay per invocation, and idle costs nothing.",
      },
      {
        heading: "The trade-off axis",
        body: "More abstraction = less ops work but less control and more platform lock-in. There's no universally right answer, only the right fit for the workload.",
      },
    ],
  },
  {
    id: "cloud-iam",
    topicId: "cloud",
    title: "IAM: who can do what",
    hook: "The most boring-sounding topic causes the most real breaches.",
    cards: [
      {
        body: "IAM (Identity and Access Management) answers one question everywhere in the cloud: is this identity allowed to do this action on this resource? Every API call gets checked.",
      },
      {
        heading: "Least privilege",
        body: "Grant the minimum permissions needed, nothing more. The intern's script doesn't need AdministratorAccess. Scoped roles limit the blast radius when (not if) credentials leak.",
      },
      {
        heading: "Roles beat keys",
        body: "Long-lived access keys get committed to git and leaked. Roles grant temporary, auto-rotating credentials to services and humans. If you're pasting secret keys around, there's almost always a better way.",
      },
    ],
  },
  {
    id: "cloud-costs",
    topicId: "cloud",
    title: "Why cloud bills explode",
    hook: "The $10k surprise bill has the same 4 causes every time.",
    cards: [
      {
        body: "Cloud pricing is pay-per-use, and 'use' includes things you forgot: idle VMs, unattached disks, old snapshots, and NAT gateways quietly metering every gigabyte.",
      },
      {
        heading: "The big 4 bill-killers",
        body: "1) Egress — data leaving the cloud costs real money. 2) Forgotten resources running 24/7. 3) Over-provisioned instances at 5% CPU. 4) Cross-region and cross-AZ traffic fees nobody read about.",
      },
      {
        heading: "The defenses",
        body: "Budgets with alerts (day one, always). Tags on everything so costs have owners. Auto-shutdown for dev environments at night. Reserved instances or savings plans once usage is predictable.",
      },
    ],
  },
  {
    id: "cloud-regions",
    topicId: "cloud",
    title: "Regions, AZs, and staying online",
    hook: "What 'us-east-1 is down' actually means for your app.",
    cards: [
      {
        body: "A region is a geographic cluster of datacenters (us-east-1, eu-west-2). Each region contains multiple Availability Zones — physically separate datacenters with independent power and networking.",
      },
      {
        heading: "The design rule",
        body: "Run across at least 2 AZs and one AZ failure becomes a non-event: load balancers shift traffic to healthy zones automatically. Most managed databases replicate across AZs with one checkbox.",
      },
      {
        heading: "Multi-region is a different beast",
        body: "Surviving a whole region outage means replicating data across regions and handling failover — real cost and complexity. Most apps genuinely don't need it. Multi-AZ first; multi-region only when the business demands it.",
      },
    ],
  },

  // ─────────────────────────── DEVOPS ───────────────────────────
  {
    id: "devops-ci",
    topicId: "devops",
    title: "CI: robots test every commit",
    hook: "Why the best teams break things less while shipping more.",
    cards: [
      {
        body: "Continuous Integration means every push triggers an automatic pipeline: build the code, run the tests, lint it. Broken code gets caught in minutes — before it reaches anyone else.",
      },
      {
        heading: "A minimal pipeline",
        body: "GitHub Actions puts CI config right in the repo:",
        code: "on: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm test",
      },
      {
        heading: "The cultural shift",
        body: "CI makes 'it works locally' irrelevant — the pipeline is the referee. Small, frequent merges replace giant scary ones, because every merge is verified automatically.",
      },
    ],
  },
  {
    id: "devops-cd",
    topicId: "devops",
    title: "CD: deploys so boring they're beautiful",
    hook: "Elite teams deploy on Friday afternoons. Here's their secret.",
    cards: [
      {
        body: "Continuous Delivery means every change that passes CI is automatically packaged and ready to deploy — or deployed straight to production. The deploy button stops being scary because it's pressed constantly.",
      },
      {
        heading: "Deploy strategies",
        body: "Rolling: replace instances a few at a time. Blue/green: run the new version alongside the old, flip traffic instantly, flip back if needed. Canary: send 5% of users to the new version and watch metrics before going wide.",
      },
      {
        heading: "The counterintuitive truth",
        body: "Deploying more often is safer, not riskier. Small changes are easy to review, easy to test, and easy to roll back. The scariest deploy is the one with three months of changes in it.",
      },
    ],
  },
  {
    id: "devops-iac",
    topicId: "devops",
    title: "Infrastructure as Code",
    hook: "Your servers, defined in git, reviewed like code.",
    cards: [
      {
        body: "IaC tools like Terraform and OpenTofu describe infrastructure — VMs, networks, databases — in code files. Run apply, and the tool creates or updates real resources to match.",
      },
      {
        heading: "Why it beats clicking",
        body: "Console clicks are invisible and unrepeatable. Code is reviewed, versioned, and reproducible: spin up an identical staging environment in minutes, audit every change with git blame.",
      },
      {
        heading: "The golden rule",
        body: "Once a resource is managed by IaC, never edit it by hand. Manual changes create drift — reality diverging from code — and the next apply may silently undo them. The code is the source of truth.",
      },
    ],
  },
  {
    id: "devops-observability",
    topicId: "devops",
    title: "Logs, metrics, and traces",
    hook: "The 3 pillars that turn 'it's slow' into 'line 42 is slow'.",
    cards: [
      {
        body: "Logs are events: what happened, with detail. Metrics are numbers over time: request rate, error rate, latency. Traces follow one request across every service it touched.",
      },
      {
        heading: "Which one when",
        body: "Metrics tell you something is wrong (error rate spiked at 14:02). Traces tell you where (the payment service call took 9 seconds). Logs tell you why (connection pool exhausted).",
      },
      {
        heading: "The golden signals",
        body: "Google's SRE book says watch four things per service: latency, traffic, errors, and saturation. If you alert on just those, you'll catch most incidents before users tweet about them.",
      },
    ],
  },

  // ─────────────────────────── SECURITY ───────────────────────────
  {
    id: "sec-passwords",
    topicId: "security",
    title: "How passwords get cracked",
    hook: "Hackers don't guess. They compute — billions per second.",
    cards: [
      {
        body: "Sites store hashes, not passwords. When a database leaks, attackers run dictionaries and every previously leaked password through fast hardware — billions of hash attempts per second against weak algorithms.",
      },
      {
        heading: "Length beats complexity",
        body: "P@ssw0rd! falls instantly — it's in every cracking dictionary. A four-word passphrase like 'correct horse battery staple' has vastly more entropy and is easier to remember.",
      },
      {
        heading: "The real answer",
        body: "A password manager generating unique random passwords per site, plus MFA everywhere. Unique matters most: reused passwords turn one breached site into a skeleton key for your whole life.",
      },
    ],
  },
  {
    id: "sec-zerotrust",
    topicId: "security",
    title: "Zero trust in plain words",
    hook: "The castle has no walls anymore. Verify everything.",
    cards: [
      {
        body: "Old model: hard shell, soft center — anything inside the corporate network is trusted. Problem: one phished laptop, and the attacker walks freely everywhere inside.",
      },
      {
        heading: "The zero trust flip",
        body: "Never trust, always verify. Every request must prove who's asking (identity), from what device, with what permissions — regardless of network location. The VPN moat stops being the security boundary.",
      },
      {
        heading: "What it looks like in practice",
        body: "Strong identity with MFA, short-lived credentials, per-app access instead of network-wide access, and device health checks. Tools like Tailscale bring the same model to your homelab.",
      },
    ],
  },
  {
    id: "sec-injection",
    topicId: "security",
    title: "SQL injection: the immortal bug",
    hook: "A 25-year-old attack that still breaches companies today.",
    cards: [
      {
        body: "If user input gets glued into a SQL string, an attacker can end your query and start their own. The classic: entering ' OR '1'='1 into a login form to make the WHERE clause always true.",
      },
      {
        heading: "The fix is beautifully simple",
        body: "Parameterized queries. The query structure and the data travel separately, so input can never become code.",
        code: "-- vulnerable\n\"SELECT * FROM users WHERE name = '\" + input + \"'\"\n\n-- safe\nSELECT * FROM users WHERE name = $1",
      },
      {
        heading: "The general lesson",
        body: "Injection isn't just SQL — the same trap exists in shell commands, HTML (XSS), and LDAP. The universal rule: never concatenate untrusted input into anything that gets executed or rendered.",
      },
    ],
  },
  {
    id: "sec-tls",
    topicId: "security",
    title: "What the padlock actually does",
    hook: "HTTPS in 3 cards — handshakes, certs, and why it's free now.",
    cards: [
      {
        body: "TLS gives you three guarantees: encryption (nobody can read the traffic), integrity (nobody can modify it), and authentication (you're really talking to your bank, not a look-alike).",
      },
      {
        heading: "Certificates and trust",
        body: "A certificate says 'this public key belongs to this domain', signed by a Certificate Authority your device already trusts. Your browser verifies the chain of signatures before showing the padlock.",
      },
      {
        heading: "Why HTTPS became universal",
        body: "Let's Encrypt made certificates free and automated in 2015. Tools like Caddy and certbot renew them without human involvement. Today, plain HTTP is the anomaly — even for internal homelab services.",
      },
    ],
  },
  {
    id: "sec-mfa",
    topicId: "security",
    title: "MFA / 2FA without the jargon",
    hook: "A stolen password shouldn't mean a stolen account — here's the second lock.",
    cards: [
      {
        body: "2FA adds a second check after your password. Even if a site leaks your password — or attackers try credential stuffing from an old breach — they still need that second factor. It's the cheapest way to stop most account takeovers.",
      },
      {
        heading: "App codes beat SMS",
        body: "An authenticator app (Google Authenticator, 1Password, Authy) generates a fresh TOTP code every 30 seconds. SMS codes work, but SIM swapping can steal them. App codes never travel over the phone network.",
      },
      {
        heading: "Passkeys are the upgrade",
        body: "Passkeys replace both password and 2FA with a cryptographic key on your device — unlocked with your fingerprint or face. No codes to type, and phishing pages can't steal them the way they steal passwords.",
      },
      {
        heading: "Turn it on everywhere",
        body: "Start with email and banking — they're the skeleton keys to everything else. Most services hide 2FA in security settings. Save recovery codes somewhere safe before you need them.",
      },
    ],
  },
  {
    id: "sec-phishing",
    topicId: "security",
    title: "Phishing & fake login pages",
    hook: "That email from 'IT support' might be a costume — here's how to peek underneath.",
    cards: [
      {
        body: "Phishing tricks you into giving up passwords or clicking malware links. Fake login pages copy Gmail, your bank, or Microsoft — same logo, same colors — but the URL belongs to an attacker, not the real company.",
      },
      {
        heading: "Spot it before you click",
        body: "Hover links before clicking. Check the sender address, not just the display name. Urgent threats ('account suspended in 24 hours!') are the oldest social engineering trick. Real IT won't ask you to prove your password over email.",
      },
      {
        heading: "The URL tells the truth",
        body: "Read the address bar, not the page design. microsoft-login.secure-verify.com is not Microsoft — the real site owns the domain right before the first slash. When in doubt, type the URL yourself or use a bookmark.",
        tool: "phishing-url-check",
      },
      {
        heading: "Clicked anyway? Do this",
        body: "Change that password immediately from a device you trust — go directly to the real site, not the link. Enable 2FA if you haven't. Tell your IT team or bank if it was work or financial. A quick report beats silent shame.",
      },
    ],
  },
  {
    id: "sec-public-wifi",
    topicId: "security",
    title: "Public Wi-Fi without panic",
    hook: "Coffee shop Wi-Fi isn't evil — you just need to know what's actually exposed.",
    cards: [
      {
        body: "On public Wi-Fi you're sharing a network with strangers. Without HTTPS, someone nearby could read unencrypted traffic — a man-in-the-middle attack. Most sites use HTTPS now, which scrambles what you actually send and receive.",
      },
      {
        heading: "What's actually at risk",
        body: "Plain HTTP pages, DNS lookups, and metadata (which sites you visit) are more exposed than the contents of HTTPS sessions. Your banking app over HTTPS? The payload is encrypted. An old HTTP login form? That's the worry.",
      },
      {
        heading: "When a VPN helps",
        body: "A VPN tunnels your traffic through an encrypted pipe to a trusted exit — handy on untrusted networks, and great for reaching your homelab via a mesh VPN like Tailscale. It doesn't make you invisible; it moves where you place trust.",
      },
      {
        heading: "Practical habits",
        body: "Stick to HTTPS and check the padlock. Avoid sensitive logins on sketchy networks if you can wait. Turn off auto-join for random open networks. A VPN is belt-and-suspenders, not a license to ignore the basics.",
      },
    ],
  },
  {
    id: "sec-updates-patches",
    topicId: "security",
    title: "Why security updates matter",
    hook: "That 'restart to update' nag is annoying — and sometimes it's plugging a hole attackers already know about.",
    cards: [
      {
        body: "Every piece of software has bugs. When researchers find one that lets attackers in, it gets a CVE — a public label so everyone knows what to fix. Patches are the vendor's fix. Leaving them unapplied is leaving the door open.",
      },
      {
        heading: "CVEs in plain English",
        body: "A CVE (Common Vulnerabilities and Exposures) is like a wanted poster for a software flaw. 'CVE-2024-1234 affects OpenSSH before 9.8' tells your package manager exactly what version fixes it. High severity means act soon, not someday.",
      },
      {
        heading: "Auto-update vs deliberate",
        body: "Personal devices: turn on automatic updates — the convenience wins. Servers and homelabs: snapshot first, patch on a schedule you control, and know what changed. Untested updates can break things; unpatched servers get owned.",
      },
      {
        heading: "Homelab too",
        body: "Your Proxmox host, Docker images, and router firmware all need love. Subscribe to security advisories for what you run. One neglected appliance on your network can be the foothold for everything else.",
      },
    ],
  },

  // ─────────────────────────── DATABASES ───────────────────────────
  {
    id: "db-sql-nosql",
    topicId: "databases",
    title: "SQL vs NoSQL: the honest version",
    hook: "It's not old vs new. It's guarantees vs flexibility.",
    cards: [
      {
        body: "Relational databases (Postgres, MySQL) store structured tables with enforced schemas and relationships. NoSQL is an umbrella: document stores (MongoDB), key-value (Redis), wide-column (Cassandra), graph (Neo4j).",
      },
      {
        heading: "What SQL buys you",
        body: "ACID transactions, joins, and constraints — the database itself guarantees your data stays consistent. Decades of tooling. For most apps, Postgres is the boring, correct default.",
      },
      {
        heading: "When NoSQL earns its keep",
        body: "Truly flexible schemas, extreme write scale, or simple access patterns at massive volume. Caches, session stores, and event firehoses fit NoSQL well. Choose it for a reason, not for fashion.",
      },
    ],
  },
  {
    id: "db-indexes",
    topicId: "databases",
    title: "Indexes: from minutes to milliseconds",
    hook: "The single biggest speedup most apps ever get.",
    cards: [
      {
        body: "Without an index, the database checks every row to answer a query — a full table scan. On 10 million rows, that's seconds of work for one lookup.",
      },
      {
        heading: "How an index works",
        body: "An index is a sorted structure (usually a B-tree) pointing to rows. Like a book's index: jump straight to the page instead of reading the whole book. Lookups go from O(n) to O(log n).",
        code: "CREATE INDEX idx_users_email\n  ON users (email);",
      },
      {
        heading: "The trade-off",
        body: "Every index slows down writes slightly (it must be updated) and uses disk. Index the columns you filter and join on; don't index everything. EXPLAIN shows whether a query actually uses one.",
      },
    ],
  },
  {
    id: "db-transactions",
    topicId: "databases",
    title: "Transactions & ACID",
    hook: "How banks move money without ever losing a cent.",
    cards: [
      {
        body: "A transaction groups operations into all-or-nothing. Debit one account, credit another — if anything fails between the two, both roll back. There is no state where money vanished.",
        code: "BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;",
      },
      {
        heading: "ACID, decoded",
        body: "Atomicity: all or nothing. Consistency: rules (constraints) always hold. Isolation: concurrent transactions don't see each other's half-finished work. Durability: once committed, it survives a crash.",
      },
      {
        heading: "Why this is a big deal",
        body: "Without transactions, every app would hand-roll failure recovery for partial writes — and get it wrong. ACID is decades of hard distributed-systems problems, solved and gift-wrapped.",
      },
    ],
  },
  {
    id: "db-caching",
    topicId: "databases",
    title: "Caching: the art of not asking twice",
    hook: "Why Redis sits in front of almost every big database.",
    cards: [
      {
        body: "A cache keeps hot data in memory for microsecond reads. The pattern: check the cache first; on a miss, hit the database and store the result with a TTL (time to live).",
      },
      {
        heading: "The hard part",
        body: "'There are only two hard things in computer science: cache invalidation and naming things.' When the source data changes, stale cache entries lie to your users. TTLs, event-driven invalidation, and versioned keys are the toolkit.",
      },
      {
        heading: "Cache wisely",
        body: "Cache reads that are frequent and expensive, tolerate slight staleness, and change rarely. Never cache what must be exact — account balances, inventory counts, permissions.",
      },
    ],
  },

  // ─────────────────────────── ENTERPRISE ───────────────────────────
  {
    id: "ent-monolith",
    topicId: "enterprise",
    title: "Monolith vs microservices",
    hook: "Netflix needs microservices. You probably don't. Yet.",
    cards: [
      {
        body: "A monolith is one deployable app. Microservices split it into many small services, each owning its data, talking over the network. The industry spent a decade pretending the second is always better.",
      },
      {
        heading: "What microservices really cost",
        body: "Every function call becomes a network call that can fail, be slow, or be retried into duplication. You inherit distributed tracing, service discovery, and version skew between services. Complexity doesn't vanish — it moves between services.",
      },
      {
        heading: "The grown-up answer",
        body: "Start with a well-modularized monolith. Extract a service when a boundary proves itself — a team that needs to deploy independently, or a component with wildly different scaling needs. Split for organizational reasons, not fashion.",
      },
    ],
  },
  {
    id: "ent-loadbalancing",
    topicId: "enterprise",
    title: "Load balancers: traffic cops at scale",
    hook: "How one URL fans out to a thousand servers.",
    cards: [
      {
        body: "A load balancer receives all incoming traffic and spreads it across a pool of servers. It health-checks constantly, and quietly stops sending traffic to instances that fail.",
      },
      {
        heading: "L4 vs L7",
        body: "Layer 4 balancers route by IP and port — fast and dumb. Layer 7 balancers understand HTTP: route /api to one pool and /static to another, terminate TLS, add headers, retry failures.",
      },
      {
        heading: "The pattern it unlocks",
        body: "With a balancer in front, servers become cattle, not pets: add more during peak, kill unhealthy ones, deploy by rotating instances. Every zero-downtime deploy strategy depends on this layer.",
      },
    ],
  },
  {
    id: "ent-queues",
    topicId: "enterprise",
    title: "Message queues: the shock absorber",
    hook: "How systems survive traffic spikes without falling over.",
    cards: [
      {
        body: "A queue (RabbitMQ, SQS, Kafka) sits between producers and consumers. The web app drops a 'send welcome email' message and responds instantly; a worker processes it seconds later.",
      },
      {
        heading: "Why decoupling wins",
        body: "If the email service dies, messages wait patiently in the queue — nothing is lost, users never notice. A spike of 10,000 signups becomes a backlog to drain, not an outage.",
      },
      {
        heading: "The fine print",
        body: "Most queues deliver at-least-once, meaning occasional duplicates. Consumers must be idempotent: processing the same message twice must be harmless. This one design rule prevents entire categories of production bugs.",
      },
    ],
  },
  {
    id: "ent-cap",
    topicId: "enterprise",
    title: "The CAP theorem, minus the myths",
    hook: "Consistency, availability, partition tolerance: pick 2 — sort of.",
    cards: [
      {
        body: "In a distributed system, when the network partitions (nodes can't reach each other), you must choose: refuse some requests to stay consistent (CP), or keep serving and risk stale data (AP).",
      },
      {
        heading: "The common misreading",
        body: "It's not a permanent 'pick 2 of 3'. Partitions are rare; the choice only bites during one. Normally you can have both consistency and availability. CAP describes the failure moment, not everyday life.",
      },
      {
        heading: "Real-world flavors",
        body: "Your bank chooses CP: better to show an error than a wrong balance. A social feed chooses AP: better to show slightly stale likes than nothing. The right answer is per-feature, not per-company.",
      },
    ],
  },
  {
    id: "ent-sre",
    topicId: "enterprise",
    title: "SLOs and error budgets",
    hook: "How Google decided when it's OK for things to break.",
    cards: [
      {
        body: "An SLO (Service Level Objective) is a reliability target, like '99.9% of requests succeed'. That missing 0.1% is your error budget — a quantified allowance for failure.",
      },
      {
        heading: "The genius mechanism",
        body: "Budget remaining? Ship fast, take risks, deploy freely. Budget burned? Feature work pauses and reliability work takes over. The endless 'move fast vs stay stable' war becomes a number both sides agree on.",
      },
      {
        heading: "Why not aim for 100%?",
        body: "Each extra nine costs roughly 10x more, and users can't tell 99.99% from 99.999% — their own Wi-Fi fails more than that. Perfect reliability is the wrong goal; the right goal is reliable enough, cheaply enough.",
      },
    ],
  },

  // ─────────────────────────── COMPUTER BASICS ───────────────────────────
  {
    id: "basics-what-is-computer",
    topicId: "basics",
    title: "What's actually inside a computer?",
    hook: "CPU, RAM, storage — three words that explain 90% of 'why is this slow?'",
    cards: [
      {
        body: "Every computer — laptop, phone, Raspberry Pi — has the same three jobs: think (CPU), remember right now (RAM), and remember for later (storage). That's it. Fancy names, simple roles.",
      },
      {
        heading: "CPU: the thinker",
        body: "The CPU runs your programs — opening tabs, playing video, crunching a spreadsheet. More cores help with multitasking; a faster clock helps each task finish sooner. When fans spin up, the CPU is working hard.",
      },
      {
        heading: "RAM vs storage",
        body: "RAM is scratch paper: fast, but everything vanishes when you power off. Storage (SSD or hard drive) is the filing cabinet — slower to open, but your photos and apps survive a reboot. Full storage makes everything crawl.",
      },
    ],
  },
  {
    id: "basics-files-folders",
    topicId: "basics",
    title: "Files, folders, and where stuff lives",
    hook: "Your computer is a giant filing cabinet. Here's how to not lose the keys.",
    cards: [
      {
        body: "A file is one thing: a photo, a document, an app installer. A folder (directory) is a container that holds files and other folders. Nesting folders is how you stay organized instead of drowning in a desktop pile.",
      },
      {
        heading: "Paths are addresses",
        body: "Every file has a path — like /Users/you/Documents/report.pdf on a Mac or C:\\Users\\you\\Documents on Windows. The path is the full address from the drive root to the file. Two files can share a name if they live in different folders.",
      },
      {
        heading: "Save, move, don't duplicate chaos",
        body: "Downloads is where things land by default — not where they should live forever. Move finished work into a folder you'll remember. Cloud sync folders (Dropbox, iCloud, OneDrive) are just special folders that copy changes elsewhere automatically.",
      },
    ],
  },
  {
    id: "basics-browser-vs-os",
    topicId: "basics",
    title: "Your browser isn't your computer",
    hook: "Chrome isn't Windows. Safari isn't your Mac. Here's why that matters.",
    cards: [
      {
        body: "Your operating system (Windows, macOS, Linux, iOS, Android) runs the whole machine — Wi-Fi, files, updates, apps. Your browser (Chrome, Firefox, Safari, Edge) is just one app that shows websites. Closing the browser doesn't shut down the computer.",
      },
      {
        heading: "Websites live out there",
        body: "When you visit gmail.com, you're loading a page from Google's servers over the internet. The tab is local; the email lives on their machines. That's why you can log in from any browser on any device — your account isn't trapped in one app.",
      },
      {
        heading: "Extensions and bookmarks are browser baggage",
        body: "A Chrome extension doesn't work in Firefox. Bookmarks stuck in one browser won't follow you to another unless you sync or export them. Your OS settings (Wi-Fi password, display size) apply everywhere — browser stuff is siloed.",
      },
    ],
  },
  {
    id: "basics-wifi-ethernet",
    topicId: "basics",
    title: "Wi-Fi vs ethernet: getting online",
    hook: "Same internet, different pipe. When each one wins.",
    cards: [
      {
        body: "Wi-Fi is wireless internet through the air — convenient, shared by every phone and laptop in the house. Ethernet is a cable from your device straight into the router. Same network behind the scenes; very different reliability.",
      },
      {
        heading: "Why cables still win sometimes",
        body: "Ethernet is steadier: less lag for video calls, faster big downloads, no dead spots. Wi-Fi gets flaky through walls and when everyone's streaming at once. For a desktop or TV that never moves, a cable is the quiet upgrade.",
      },
      {
        heading: "Router vs modem (quick version)",
        body: "The modem talks to your ISP and brings internet into the house. The router splits that connection for your devices — Wi-Fi and ethernet ports. Many home boxes are both in one unit. Unplugging the wrong one kills everyone's Netflix.",
      },
    ],
  },
  {
    id: "basics-accounts-passwords",
    topicId: "basics",
    title: "Accounts, passwords, and passkeys",
    hook: "How you prove you're you — without writing passwords on a sticky note.",
    cards: [
      {
        body: "An account ties your stuff to an identity: email, files, purchases. The service checks it's really you with a password, a code from your phone, or increasingly a passkey — a cryptographic handshake your device handles instead of you typing secrets.",
      },
      {
        heading: "Passwords that actually work",
        body: "Long beats clever. A random 16-character password from a password manager beats 'MyDog2019!'. Never reuse passwords across sites — one breach shouldn't unlock your bank and your email. Two-factor authentication (2FA) adds a second check even if the password leaks.",
      },
      {
        heading: "Passkeys: the upgrade path",
        body: "Passkeys replace passwords with a key stored on your device — unlock with fingerprint or face, approve the login. Phishing sites can't steal what you never typed. You don't need to switch everything today, but turn them on where offered (Google, Apple, Microsoft already support them).",
      },
    ],
  },
  {
    id: "basics-updates",
    topicId: "basics",
    title: "Why updates exist (and when to click yes)",
    hook: "That nagging 'restart to update' isn't just annoying — it's armor.",
    cards: [
      {
        body: "Updates patch security holes, fix bugs, and sometimes add features. Postponing them leaves known exploits wide open — attackers love outdated systems because the playbook is public. Boring updates are how you avoid exciting problems.",
      },
      {
        heading: "OS vs app updates",
        body: "Operating system updates (Windows Update, macOS Software Update) touch everything — kernel, drivers, core security. App updates (browser, Zoom, games) fix that one program. Both matter; the OS is the foundation.",
      },
      {
        heading: "Before a big one",
        body: "Plug in your laptop, back up anything precious, and pick a time you can spare 20 minutes. If an update bricks something rare, you want a restore point — not a panic at midnight before a deadline.",
      },
    ],
  },
  {
    id: "basics-cloud",
    topicId: "basics",
    title: "What 'the cloud' actually means",
    hook: "Spoiler: it's someone else's computer. That's useful, not magic.",
    cards: [
      {
        body: "The cloud isn't a weather system — it's software running on machines in a data center you rent by the minute. Your Google Photos, iCloud backups, and Netflix streams all live on hardware you'll never see, reached over the internet.",
      },
      {
        heading: "Why people use it",
        body: "No server under your desk. Someone else handles power, cooling, and disk failures. You get access from anywhere and pay for what you use instead of buying a rack. Startups launch on cloud VMs; you back up your phone to cloud storage.",
      },
      {
        heading: "The tradeoffs",
        body: "You're trusting a company with your data and depending on their uptime. Outages happen. Privacy policies matter. The cloud is a tool — great for convenience and scale, not a substitute for your own backups of things you can't lose.",
      },
    ],
  },
  {
    id: "basics-copy-paste-screenshots",
    topicId: "basics",
    title: "Copy, paste, and screenshots",
    hook: "Three skills that'll save you hours of explaining what's on your screen.",
    cards: [
      {
        body: "Copy (Ctrl+C / Cmd+C) puts selected text or files on an invisible clipboard. Paste (Ctrl+V / Cmd+V) drops it somewhere else. Cut (Ctrl+X / Cmd+X) is copy-then-delete — useful for moving files without duplicating them.",
      },
      {
        heading: "Screenshots: show, don't tell",
        body: "Windows: Win+Shift+S or PrtScn. Mac: Cmd+Shift+4 to drag a region, Cmd+Shift+3 for the whole screen. Phone: usually power + volume down. A screenshot is just a picture file — attach it to support tickets instead of typing 'the button in the top left-ish area.'",
      },
      {
        heading: "Clipboard gotchas",
        body: "Copying overwrites what's on the clipboard — one slot, no history (unless your OS adds one). Pasting into the wrong app can reformat text weirdly; paste plain text with Ctrl+Shift+V when that happens. Screenshots land in Pictures or Desktop by default — know where yours go.",
      },
    ],
  },
  {
    id: "basics-safe-downloads",
    topicId: "basics",
    title: "Downloading without regret",
    hook: "Free software from the wrong site is how computers get sick.",
    cards: [
      {
        body: "Download from the official source: the vendor's site, the Microsoft Store, Mac App Store, or your Linux distro's package manager. Random 'cracked' or 'free installer' pages bundle malware — the app might work, but something else is running quietly in the background.",
      },
      {
        heading: "Red flags",
        body: "Download buttons that aren't the real one (fake 'Download' ads everywhere). Files ending in .exe from a zip you didn't expect. Anything asking for admin rights to install a PDF reader. When in doubt, close the tab and search for the official download page.",
      },
      {
        heading: "After you install",
        body: "Decline bundled junk — toolbars, 'PC optimizers,' extra browsers. Read the checkboxes during install; uncheck the extras. Keep your OS and browser updated so known malware gets blocked before it runs.",
      },
    ],
  },
  {
    id: "basics-restart-when-broken",
    topicId: "basics",
    title: "Restart first — or is it actually broken?",
    hook: "The oldest IT trick works because memory leaks are real. Here's when to stop there.",
    cards: [
      {
        body: "Restarting clears RAM, kills stuck processes, and reloads drivers. Wi-Fi acting weird? App frozen? Computer sluggish after three weeks without a reboot? Restart fixes a surprising share of mysteries. It's not laziness — it's clearing the slate.",
      },
      {
        heading: "When restart isn't enough",
        body: "Same error after every reboot. Clicking makes a grinding noise. Smoke, burning smell, or repeated blue screens with the same code. Data you can't afford to lose and no backup. Those are 'stop and get help' signals, not 'try again harder.'",
      },
      {
        heading: "The useful middle steps",
        body: "Quit and reopen one app before rebooting the whole machine. Try another browser or incognito mode to rule out extensions. Check if it's just one website or everything. Note the exact error message — that one line helps support (or future you) enormously.",
      },
    ],
  },
];

export const lessonsByTopic = (topicId: string) =>
  LESSONS.filter((l) => l.topicId === topicId);

export const topicById = (id: string) => TOPICS.find((t) => t.id === id);

export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
