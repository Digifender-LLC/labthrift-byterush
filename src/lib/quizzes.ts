// One quick knowledge check per lesson, shown as the last beat of the lesson
// flow. Correct first attempts award XP and feed quiz achievements. Wrong
// answers just teach — no streak damage, no XP loss.

export interface QuizQuestion {
  id: string;
  lessonId: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  /** Friendly one-liner shown after answering, right or wrong. */
  explanation: string;
}

function q(
  lessonId: string,
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string
): QuizQuestion {
  return { id: `q-${lessonId}`, lessonId, prompt, options, correctIndex, explanation };
}

const ALL: QuizQuestion[] = [
  // ── Homelab ──
  q(
    "homelab-why",
    "What makes a homelab better than following tutorials?",
    [
      "The hardware is faster than cloud VMs",
      "You hit real failures tutorials never show you",
      "It counts as professional certification",
      "It's cheaper than free tutorials",
    ],
    1,
    "Tutorials give you the happy path. A homelab gives you 2 AM DNS failures — the exact problems people get paid to solve."
  ),
  q(
    "homelab-proxmox",
    "Why do most homelab services run in LXC containers instead of full VMs?",
    [
      "LXC containers share the host kernel, so they're fast and light",
      "VMs can't run Linux",
      "LXC containers are more isolated than VMs",
      "Proxmox doesn't support VMs",
    ],
    0,
    "LXC shares the host kernel — containers boot in seconds and sip RAM. VMs still win when you need another OS or stronger isolation."
  ),
  q(
    "homelab-pihole",
    "How does Pi-hole actually block ads?",
    [
      "It scans web pages and removes ad images",
      "It answers DNS lookups for ad domains with a dead end",
      "It blocks the ports ad servers use",
      "It runs an ad-blocking browser extension for you",
    ],
    1,
    "Pi-hole is a DNS sinkhole: blocked domains get a fake answer, so the ad never even downloads — on every device on your network."
  ),
  q(
    "homelab-nas",
    "Your NAS uses RAID mirroring. What does that protect you from?",
    [
      "Ransomware encrypting your files",
      "Accidentally deleting a folder",
      "A hard drive dying",
      "Your house losing power",
    ],
    2,
    "RAID keeps you running when a drive dies — that's it. Deletes, ransomware, and fires need real backups: 3 copies, 2 media, 1 offsite."
  ),
  q(
    "homelab-reverse-proxy",
    "What does a reverse proxy do for your 12 self-hosted services?",
    [
      "Makes each service faster by caching everything",
      "Routes them all through one entry point with clean URLs and HTTPS",
      "Hides them from your ISP",
      "Backs them up automatically",
    ],
    1,
    "One front door: plex.home.lab goes to one container, grafana.home.lab to another — all through port 443, certs handled automatically."
  ),
  q(
    "homelab-first-service",
    "What's the best first homelab project?",
    [
      "A full Kubernetes cluster with monitoring",
      "One small service you'll actually use, like Pi-hole",
      "Whatever tutorial has the most GitHub stars",
      "The most expensive hardware you can buy",
    ],
    1,
    "Start with one useful service on one box. Momentum beats ambition — you'll learn more from running something real than from planning a datacenter."
  ),
  q(
    "homelab-backups",
    "What makes something a real backup?",
    [
      "It's on a RAID mirror of the same disks",
      "It's a separate copy you can restore from after a mistake",
      "It's synced to the same NAS folder",
      "You took a screenshot of the settings page",
    ],
    1,
    "A backup is a copy you can actually restore from — on different media, ideally offsite. RAID only survives a dead drive, not deletes or ransomware."
  ),
  q(
    "homelab-tailscale",
    "Why do homelabbers use Tailscale instead of opening router ports?",
    [
      "Tailscale makes websites load faster",
      "It gives encrypted private access without exposing services to the whole internet",
      "ISPs require Tailscale for static IPs",
      "Port forwarding is illegal",
    ],
    1,
    "Tailscale builds a mesh VPN with encrypted tunnels — you reach your lab privately without punching holes in your firewall or fighting changing IPs."
  ),
  q(
    "homelab-vlans",
    "What's the main reason to VLAN your home network?",
    [
      "VLANs make Wi-Fi faster",
      "To keep untrusted devices (like IoT) off the same network as your servers",
      "VLANs replace the need for passwords",
      "Your ISP requires VLAN tagging",
    ],
    1,
    "VLANs separate broadcast domains — smart bulbs on one VLAN, NAS on another — so a compromised gadget can't easily reach your important stuff."
  ),
  q(
    "homelab-updates",
    "What's the smartest move before a major homelab upgrade?",
    [
      "Skip backups to save time",
      "Take a snapshot or backup you can roll back to",
      "Post on Reddit and wait for replies",
      "Unplug everything for an hour",
    ],
    1,
    "Snapshots and backups are your undo button. Fear of updates usually means fear of no way back — fix that first, then patch."
  ),
  q(
    "homelab-monitoring",
    "What's the minimum useful homelab monitoring setup?",
    [
      "A Grafana dashboard with 47 metrics",
      "Regular checks that a service responds, with alerts that reach your phone",
      "Checking services manually once a month",
      "Monitoring only matters in production",
    ],
    1,
    "Start simple: ping the URL, check the status code, alert when it's down. A check you never see is as good as no check."
  ),

  // ── Networking ──
  q(
    "net-osi",
    "A teammate says \"it's a layer 3 issue.\" What are they blaming?",
    ["The cable", "IP routing", "TCP ports", "The application"],
    1,
    "L1 is physical, L2 is switching/MACs, L3 is IP routing, L4 is TCP/UDP ports, L7 is the app. Layer 3 = routing."
  ),
  q(
    "net-subnets",
    "How many usable host addresses does a /24 give you?",
    ["24", "254", "256", "1024"],
    1,
    "A /24 leaves 8 host bits = 256 addresses, minus the network and broadcast addresses = 254 usable."
  ),
  q(
    "net-dns",
    "Which DNS record maps a name to an IPv4 address?",
    ["CNAME", "MX", "A", "TXT"],
    2,
    "A is name → IPv4, AAAA is the IPv6 version, CNAME aliases names, MX routes email, TXT holds text for verification."
  ),
  q(
    "net-tcp-udp",
    "Why do video calls run over UDP instead of TCP?",
    [
      "UDP encrypts better",
      "A late packet is worse than a lost one — retransmitting old audio is pointless",
      "TCP can't carry video data",
      "UDP guarantees ordering",
    ],
    1,
    "UDP skips handshakes and retries. For live audio/video, you'd rather drop a frame than pause everything to re-send it."
  ),
  q(
    "net-nat",
    "Why does self-hosting from home need port forwarding?",
    [
      "Home internet is too slow otherwise",
      "Inbound connections have no NAT mapping, so the router drops them",
      "ISPs charge extra for incoming traffic",
      "Port forwarding encrypts the connection",
    ],
    1,
    "NAT only remembers outbound mappings. Unsolicited inbound traffic has nowhere to go — unless you forward a port or let a tool like Tailscale punch through."
  ),
  q(
    "net-dhcp",
    "How do you keep a homelab server at the same IP every time?",
    [
      "Type the IP manually on every boot",
      "Set a DHCP reservation tied to the device's MAC address",
      "Buy a static IP from your ISP",
      "Restart the router daily",
    ],
    1,
    "DHCP leases expire — reservations pin an address to one device. Static IPs on the device itself work too, but reservations keep everything centralized on the router."
  ),
  q(
    "net-firewall",
    "What's the safe default for a firewall?",
    [
      "Allow everything, block known bad IPs",
      "Deny everything, then explicitly allow what you need",
      "Allow inbound, deny outbound",
      "No rules — the OS handles it",
    ],
    1,
    "Default deny, explicit allow. Open only the ports you need from sources you trust — same pattern on your router, your Linux box, and your cloud security groups."
  ),
  q(
    "net-http",
    "What does HTTPS add on top of HTTP?",
    [
      "Faster page loads",
      "TLS encryption so traffic can't be read or tampered with on the wire",
      "Automatic virus scanning",
      "A guarantee the website is trustworthy",
    ],
    1,
    "HTTPS wraps HTTP in TLS encryption. The padlock means the connection is private — not that the site itself is safe to trust."
  ),
  q(
    "net-ping-traceroute",
    "Ping fails to reach a server, but the web app works fine in the browser. What's a likely explanation?",
    [
      "The server is completely offline",
      "ICMP (what ping uses) is blocked, but TCP on port 443 still works",
      "Traceroute is broken",
      "DNS is misconfigured",
    ],
    1,
    "Many networks block ICMP on purpose. A failed ping doesn't prove the host is down — try curling the service or checking the port instead."
  ),

  // ── Linux ──
  q(
    "linux-fs",
    "Where do config files live on a Linux system?",
    ["/var", "/etc", "/home", "/tmp"],
    1,
    "/etc holds config, /var holds changing data like logs, /home is user files, /tmp is scratch space wiped on reboot."
  ),
  q(
    "linux-permissions",
    "What does chmod 755 give the file's owner?",
    [
      "Read only",
      "Read and write only",
      "Read, write, and execute",
      "Nothing — 755 removes permissions",
    ],
    2,
    "r=4, w=2, x=1. The first digit is the owner: 7 = 4+2+1 = rwx. Group and others get 5 = r-x."
  ),
  q(
    "linux-systemd",
    "How do you make a service start automatically at boot?",
    [
      "systemctl start nginx",
      "systemctl enable nginx",
      "journalctl -u nginx",
      "systemctl status nginx",
    ],
    1,
    "start runs it now; enable makes it start at boot. enable --now does both in one shot."
  ),
  q(
    "linux-pipes",
    "What does the pipe | actually do?",
    [
      "Runs two commands at the same time",
      "Sends one command's output into the next command's input",
      "Saves output to a file",
      "Repeats the previous command",
    ],
    1,
    "Pipes chain small tools: grep filters, sort orders, uniq counts, head trims. That's most of log analysis right there."
  ),
  q(
    "linux-ssh",
    "What does ssh-copy-id do?",
    [
      "Copies your private key to the server",
      "Puts your public key on the server so you can log in without a password",
      "Changes the server's SSH port",
      "Creates a new key pair",
    ],
    1,
    "The public key goes on servers; the private key never leaves your machine. That's the whole trick."
  ),
  q(
    "linux-packages",
    "What's the difference between apt update and apt upgrade?",
    [
      "They're the same command",
      "update refreshes the package list; upgrade installs newer versions",
      "update installs software; upgrade removes it",
      "update is for security patches only",
    ],
    1,
    "update downloads the latest list of what's available. upgrade actually installs newer versions of packages you already have. Run both."
  ),
  q(
    "linux-disk",
    "df shows plenty of free space, but apps still say 'no space left on device.' What's likely wrong?",
    [
      "The CPU is overloaded",
      "You've run out of inodes — too many small files",
      "The network cable is loose",
      "RAM is full",
    ],
    1,
    "Inodes are the filesystem's file counter. Millions of tiny files can exhaust them while gigabytes of space remain. df -i tells the story."
  ),
  q(
    "linux-processes",
    "What's the difference between kill and kill -9?",
    [
      "kill -9 is slower and safer",
      "kill sends SIGTERM (polite shutdown); kill -9 sends SIGKILL (instant, no cleanup)",
      "kill only works on root processes",
      "They're identical",
    ],
    1,
    "SIGTERM lets the process clean up. SIGKILL is the hammer — use it only when the process won't die otherwise."
  ),
  q(
    "linux-logs",
    "How do you follow a service's logs live on a systemd-based Linux box?",
    [
      "cat /var/log/messages",
      "journalctl -u servicename -f",
      "systemctl status servicename",
      "grep servicename /etc/hosts",
    ],
    1,
    "journalctl -u nginx -f tails that unit's logs in real time. systemctl status shows a snapshot; -f keeps streaming."
  ),

  // ── Docker ──
  q(
    "docker-what",
    "What is a container, really?",
    [
      "A tiny virtual machine with its own kernel",
      "A normal Linux process that's isolated — it shares the host kernel",
      "A zip file of an application",
      "A lightweight operating system",
    ],
    1,
    "Namespaces limit what a process can see, cgroups limit what it can use. Same kernel as the host — that's why containers start in milliseconds."
  ),
  q(
    "docker-images",
    "What's the relationship between an image and a container?",
    [
      "They're the same thing",
      "An image is a running container that's been paused",
      "An image is a read-only template; a container is a running instance of it",
      "A container is a compressed image",
    ],
    2,
    "One is the recipe, the other is the cake. One image can spawn a hundred containers."
  ),
  q(
    "docker-compose",
    "In Docker Compose, how does your app container reach the database container?",
    [
      "By the database's IP address",
      "By the service name, like 'db'",
      "Through the host's localhost",
      "It can't — containers are isolated",
    ],
    1,
    "Compose puts services on a shared network where they find each other by name. The app connects to 'db', never to an IP."
  ),
  q(
    "docker-volumes",
    "Where should a database container keep its data?",
    [
      "Inside the container's filesystem",
      "In a named volume",
      "In the image",
      "In a second container",
    ],
    1,
    "A container's filesystem dies with the container. Containers should be disposable; data should be sacred — that's what volumes are for."
  ),

  // ── Kubernetes ──
  q(
    "k8s-why",
    "What does 'declarative' mean in Kubernetes?",
    [
      "You script each deployment step in order",
      "You declare the end state and controllers keep making it true",
      "You have to write YAML",
      "The cluster asks before making changes",
    ],
    1,
    "You say 'keep 3 replicas running'. Controllers loop forever: observe actual state, compare to desired, fix the difference."
  ),
  q(
    "k8s-pods",
    "Why do apps talk to Services instead of directly to Pods?",
    [
      "Pods can't accept network traffic",
      "Pod IPs change constantly as pods die and get replaced",
      "Services are faster",
      "Pods only speak HTTPS",
    ],
    1,
    "Pods are mortal and their IPs churn. A Service gives one stable address that load-balances across whatever pods currently match."
  ),
  q(
    "k8s-kubectl",
    "A pod won't start and you suspect an image pull error. Which command shows the events?",
    [
      "kubectl logs <pod>",
      "kubectl describe pod <pod>",
      "kubectl get pods",
      "kubectl exec -it <pod> -- sh",
    ],
    1,
    "describe shows events: image pull errors, failed scheduling, OOM kills. logs shows what the app said — but only once it actually ran."
  ),
  q(
    "k8s-crashloop",
    "What does CrashLoopBackOff actually mean?",
    [
      "The cluster is out of resources",
      "The container starts, dies, and Kubernetes keeps restarting it with growing delays",
      "The node has crashed",
      "The image doesn't exist",
    ],
    1,
    "It's the symptom, not the disease. Check kubectl logs --previous, look for OOMKilled, and check env vars and probes."
  ),

  // ── Cloud ──
  q(
    "cloud-shared",
    "Under the shared responsibility model, who secures your S3 bucket permissions?",
    [
      "AWS",
      "You",
      "The government",
      "Nobody — buckets are public by design",
    ],
    1,
    "Providers secure the infrastructure; you secure what you build on it. The classic cloud breach is a misconfigured bucket, not a hacked datacenter."
  ),
  q(
    "cloud-compute",
    "Best fit for 'resize an image whenever a user uploads one'?",
    ["A VM running 24/7", "A Kubernetes cluster", "Serverless functions", "A bigger database"],
    2,
    "Spiky, event-driven work is serverless territory: you pay per invocation and idle time costs nothing."
  ),
  q(
    "cloud-iam",
    "What does 'least privilege' mean?",
    [
      "Grant the minimum permissions needed, nothing more",
      "Only admins get accounts",
      "Interns can't use the cloud",
      "Every service shares one role",
    ],
    0,
    "Scoped permissions limit the blast radius when (not if) credentials leak. The intern's script doesn't need AdministratorAccess."
  ),
  q(
    "cloud-costs",
    "Which of these quietly shows up on cloud bills and surprises people?",
    [
      "Data egress — traffic leaving the cloud",
      "Inbound traffic",
      "Creating IAM roles",
      "Writing YAML",
    ],
    0,
    "Egress, forgotten resources, over-provisioned instances, and cross-region traffic are the big four bill-killers."
  ),
  q(
    "cloud-regions",
    "The cheapest way to survive a single datacenter failure?",
    [
      "Deploy to multiple regions",
      "Run across at least 2 Availability Zones",
      "Buy a bigger instance",
      "Take daily backups",
    ],
    1,
    "Multi-AZ makes an AZ failure a non-event — load balancers shift traffic automatically. Multi-region is a much bigger (and rarer) commitment."
  ),

  // ── DevOps ──
  q(
    "devops-ci",
    "What does Continuous Integration do on every push?",
    [
      "Deploys straight to production",
      "Automatically builds the code and runs the tests",
      "Merges the branch automatically",
      "Notifies your manager",
    ],
    1,
    "Broken code gets caught in minutes, before it reaches anyone else. The pipeline is the referee — 'works locally' stops mattering."
  ),
  q(
    "devops-cd",
    "What's a canary deploy?",
    [
      "Deploying at night when nobody notices",
      "Sending a small % of users to the new version and watching metrics first",
      "Running the new version with no users",
      "Rolling back instantly on any error",
    ],
    1,
    "Canary: 5% of traffic goes to the new version. If metrics look good, roll wide; if not, the blast radius was tiny."
  ),
  q(
    "devops-iac",
    "Once Terraform manages a resource, what's the golden rule?",
    [
      "Never edit it by hand — the code is the source of truth",
      "Only edit it in the console",
      "Delete the state file regularly",
      "Apply changes without review",
    ],
    0,
    "Manual edits create drift, and the next apply may silently undo them. Review infra changes like code changes."
  ),
  q(
    "devops-observability",
    "Requests are slow. Which pillar tells you WHERE in the chain the time went?",
    ["Logs", "Metrics", "Traces", "Alerts"],
    2,
    "Metrics say something is wrong, traces say where (that 9-second payment call), logs say why (connection pool exhausted)."
  ),

  // ── Security ──
  q(
    "sec-passwords",
    "Which password strategy actually holds up?",
    [
      "P@ssw0rd! — symbols make it strong",
      "One strong password reused everywhere",
      "Unique random passwords from a manager, plus MFA",
      "Changing your password every week",
    ],
    2,
    "Unique matters most: reuse turns one breached site into a skeleton key. Length beats complexity, and MFA catches what leaks."
  ),
  q(
    "sec-zerotrust",
    "The core idea of zero trust?",
    [
      "Trust devices on the office network",
      "Never trust, always verify — regardless of network location",
      "Block all external traffic",
      "Use a stronger VPN",
    ],
    1,
    "The castle-and-moat model dies with one phished laptop. Every request proves identity, device, and permission — the network stops being the boundary."
  ),
  q(
    "sec-injection",
    "The real fix for SQL injection?",
    [
      "Escaping quotes in user input",
      "Parameterized queries — structure and data travel separately",
      "Blocking the word SELECT",
      "Hiding the database behind a firewall",
    ],
    1,
    "When query structure and data are separate, input can never become code. Same rule everywhere: never concatenate untrusted input into anything executable."
  ),
  q(
    "sec-tls",
    "What does a TLS certificate actually prove?",
    [
      "The site has no vulnerabilities",
      "This public key belongs to this domain — vouched for by a trusted CA",
      "The server is fast",
      "The site doesn't track you",
    ],
    1,
    "Your browser verifies the CA signature chain before showing the padlock. Encryption, integrity, and authentication — that's the TLS trio."
  ),
  q(
    "sec-mfa",
    "Your password leaked in a breach. What's the best second factor?",
    [
      "SMS text codes — convenient and secure enough",
      "An authenticator app generating TOTP codes",
      "Security questions about your childhood",
      "A longer password so you don't need 2FA",
    ],
    1,
    "App codes beat SMS — SIM swapping can steal texts. TOTP codes refresh every 30 seconds and never ride the phone network. Passkeys are even better when available."
  ),
  q(
    "sec-phishing",
    "A login page looks exactly like Microsoft. How do you verify it's real?",
    [
      "The logo and colors match — that's enough",
      "There's a padlock icon in the browser",
      "Read the URL in the address bar — the real domain should be right before the path",
      "The page loaded quickly",
    ],
    2,
    "Attackers copy the design perfectly. The padlock only means HTTPS — not that you're on the right site. The domain in the address bar is the truth."
  ),
  q(
    "sec-public-wifi",
    "On coffee shop Wi-Fi, what's actually protected when you use HTTPS?",
    [
      "Nothing — public Wi-Fi exposes everything",
      "The encrypted contents of your session — but not necessarily which sites you visit",
      "Only your email password",
      "Everything, as long as you have a VPN",
    ],
    1,
    "HTTPS scrambles what you send and receive. Metadata and plain HTTP are still more exposed. A VPN adds another layer but isn't a substitute for checking the padlock."
  ),
  q(
    "sec-updates-patches",
    "What is a CVE?",
    [
      "A type of malware that spreads through email",
      "A public label for a known software vulnerability",
      "A certificate that proves a site is secure",
      "An automatic backup of your system",
    ],
    1,
    "CVEs are wanted posters for software flaws — they tell admins and package managers exactly what to patch. High severity means act soon, not someday."
  ),

  // ── Databases ──
  q(
    "db-sql-nosql",
    "What's the boring, correct default database for most apps?",
    ["MongoDB", "Redis", "Postgres", "A CSV file"],
    2,
    "ACID transactions, joins, constraints, decades of tooling. Pick NoSQL for a reason (scale, flexible schema), not for fashion."
  ),
  q(
    "db-indexes",
    "What's the trade-off of adding an index?",
    [
      "Faster reads, slightly slower writes and more disk",
      "Faster everything, no downside",
      "Slower reads, faster writes",
      "Indexes only work on small tables",
    ],
    0,
    "Every write also updates the index. Index the columns you filter and join on — and let EXPLAIN confirm a query actually uses it."
  ),
  q(
    "db-transactions",
    "In ACID, what does Atomicity guarantee?",
    [
      "Data is encrypted at rest",
      "All operations in the transaction succeed, or none do",
      "Queries run faster",
      "Two transactions never run at the same time",
    ],
    1,
    "Debit one account, credit another — if anything fails in between, both roll back. There's no state where money vanished."
  ),
  q(
    "db-caching",
    "Which of these should you NEVER cache?",
    [
      "A product page viewed 10,000 times an hour",
      "Account balances that must be exact",
      "A country list that changes yearly",
      "Rendered avatars",
    ],
    1,
    "Cache what's frequent, expensive, and tolerates slight staleness. Balances, inventory counts, and permissions must be exact — go to the source."
  ),

  // ── Enterprise ──
  q(
    "ent-monolith",
    "When should you extract a microservice from a monolith?",
    [
      "As early as possible",
      "When a boundary proves itself — a team needing independent deploys or wildly different scaling",
      "When the monolith reaches 10,000 lines",
      "Never — monoliths are always better",
    ],
    1,
    "Complexity doesn't vanish with microservices, it moves between services. Split for organizational reasons, not fashion."
  ),
  q(
    "ent-loadbalancing",
    "What can a Layer 7 load balancer do that a Layer 4 one can't?",
    [
      "Forward TCP packets",
      "Route /api to one server pool and /static to another",
      "Health-check backends",
      "Handle more traffic",
    ],
    1,
    "L4 routes by IP and port — fast and dumb. L7 understands HTTP: path routing, TLS termination, headers, retries."
  ),
  q(
    "ent-queues",
    "Queues deliver messages at-least-once. What must consumers be?",
    [
      "Fast",
      "Idempotent — processing the same message twice must be harmless",
      "Single-threaded",
      "Stateless",
    ],
    1,
    "Duplicates will happen. Design consumers so a repeat is a no-op, and you've prevented a whole category of production bugs."
  ),
  q(
    "ent-cap",
    "During a network partition, your bank's database refuses some requests instead of risking stale balances. What did it choose?",
    ["AP — availability", "CP — consistency", "Neither", "Both, always"],
    1,
    "Banks choose CP: better an error than a wrong balance. A social feed picks AP: better stale likes than nothing. Per-feature, not per-company."
  ),
  q(
    "ent-sre",
    "Your service burned its whole error budget this month. What happens?",
    [
      "The SLO is raised",
      "Feature work pauses and reliability work takes over",
      "The on-call engineer is blamed",
      "Nothing — budgets are advisory",
    ],
    1,
    "That's the genius of error budgets: 'move fast vs stay stable' becomes a number both sides already agreed on."
  ),

  // ── Computer basics ──
  q(
    "basics-what-is-computer",
    "Your computer feels slow when you have 200 browser tabs open. What's most likely maxed out?",
    [
      "Storage — the filing cabinet is full",
      "RAM — the scratch paper is full",
      "The CPU is permanently broken",
      "Wi-Fi speed",
    ],
    1,
    "RAM holds what's running right now. Too many tabs eat RAM fast. Storage being full causes different pain — slow saves and updates."
  ),
  q(
    "basics-files-folders",
    "Two files on your computer can have the same name. When is that OK?",
    [
      "Never — names must be unique everywhere",
      "When they're in different folders",
      "Only on Windows, not Mac",
      "Only for photos",
    ],
    1,
    "A path is the full address — folder plus filename. Different folders, same filename, no conflict."
  ),
  q(
    "basics-browser-vs-os",
    "You close every browser window. What's still running?",
    [
      "Nothing — the computer is off",
      "The operating system and other apps",
      "All your websites",
      "Only Chrome extensions",
    ],
    1,
    "The browser is one app. The OS keeps running Wi-Fi, files, updates, and everything else."
  ),
  q(
    "basics-wifi-ethernet",
    "Why might you plug an ethernet cable into a desktop instead of using Wi-Fi?",
    [
      "Ethernet uses a different internet provider",
      "Ethernet is usually steadier with less lag for calls and big downloads",
      "Wi-Fi doesn't work on desktops",
      "Ethernet is only for printers",
    ],
    1,
    "Same network, different pipe. A cable avoids walls, interference, and the 'everyone's streaming' slowdown."
  ),
  q(
    "basics-accounts-passwords",
    "What's the biggest win for password safety?",
    [
      "Use your pet's name with a number",
      "Long unique passwords from a manager, plus 2FA where you can",
      "Change every password daily",
      "Write them in a notebook you never lose",
    ],
    1,
    "Length and uniqueness beat clever tricks. A manager remembers them; 2FA saves you when one site leaks."
  ),
  q(
    "basics-updates",
    "Why do security updates matter even if nothing looks broken?",
    [
      "They only add new emojis",
      "Known holes get public exploit recipes — outdated systems are easy targets",
      "Updates always make your computer faster",
      "They're optional decorations",
    ],
    1,
    "Attackers love unpatched systems because the playbook is already published. Boring updates are armor."
  ),
  q(
    "basics-cloud",
    "What is 'the cloud' in plain English?",
    [
      "A wireless storage bubble around your house",
      "Software running on someone else's computers in a data center, reached over the internet",
      "A backup that never needs internet",
      "Only for big companies, not personal use",
    ],
    1,
    "It's someone else's machine you rent. Useful for access anywhere — not magic, and not a backup substitute."
  ),
  q(
    "basics-copy-paste-screenshots",
    "You need to show tech support exactly what's on your screen. Fastest move?",
    [
      "Describe it in a long email",
      "Take a screenshot and attach the image",
      "Read the error message out loud on the phone",
      "Restart and hope it goes away",
    ],
    1,
    "A screenshot is a picture file — one attachment beats three paragraphs of 'the button near the top-ish area.'"
  ),
  q(
    "basics-safe-downloads",
    "Where should you download software from?",
    [
      "The first 'Download' button on any search result",
      "The vendor's official site or your device's official app store",
      "A random forum thread with a Mega link",
      "Whoever emails you an installer",
    ],
    1,
    "Official sources only. Fake download buttons and cracked installers are the classic malware delivery route."
  ),
  q(
    "basics-restart-when-broken",
    "When should you stop at 'just restart it' and get real help?",
    [
      "After one restart didn't fix a sluggish browser",
      "Repeated blue screens, burning smells, or data at risk with no backup",
      "Whenever Wi-Fi is slow",
      "Never — restart fixes everything",
    ],
    1,
    "Restart clears RAM and stuck apps. Grinding noises, smoke, or recurring crashes after reboot are stop-and-escalate signals."
  ),
];

export const QUIZZES: Record<string, QuizQuestion> = Object.fromEntries(
  ALL.map((question) => [question.lessonId, question])
);

export const quizForLesson = (lessonId: string): QuizQuestion | undefined =>
  QUIZZES[lessonId];
