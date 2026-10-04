# ⚡ ByteRush

**The scroll you won't regret.** ByteRush is a TikTok-style feed of bite-sized tech lessons and guided homelab projects — built to deliver the same dopamine hits as social media, but every swipe teaches you something real: computer basics, homelab, networking, Linux, Docker, Kubernetes, cloud, DevOps, security, databases, and enterprise architecture.

It is live at [app.labthrift.com](https://app.labthrift.com).

## How it works

- **Pick your topics.** Choose what you want to learn during onboarding (change it anytime on the Topics tab). Your feed is built only from topics you follow.
- **Swipe the feed.** The feed has three views: **All**, **Lessons**, and **Projects**. Each lesson is a full-screen story. Tap the right side to advance through its cards, tap the left side to go back — Instagram-story style, with progress segments up top. Longer subjects are split across multiple cards so nothing ever overflows one screen.
- **Do a guided project.** Projects are step-by-step homelab walkthroughs (first SSH, first backup, Immich, Pi-hole names, PoE, and more) that play inline in the feed. Some steps ask you to pick a path, you can go back, pause, skip, or replay, and your place is saved. Each completed step earns +10 XP and finishing a project earns +25 XP, counted once no matter how often you replay.
- **Feel the dopamine.** Every card earns XP with a floating `+10 XP` pop and a synthesized click. Finishing a lesson triggers confetti and a rising chime. Achievements get a full-screen fanfare.
- **Prove it with quick checks.** Every lesson ends with a one-question quiz beat. Nail it for +15 XP; miss it and you just get the explanation — no punishment, no streak damage.
- **Tell us about your lab.** Every few lessons, the feed asks one lightweight gear question (Pi-hole? Tailscale? NAS? UPS?). Your answers shape the feed: lessons matching gear you have or plan float to the top with a "picked for your lab" badge.
- **Keep the streak alive.** Finish a lesson *or* a project step each day to extend your 🔥 day streak. The first one each day also earns a single +50 XP daily bonus, shared between lessons and projects. Miss a day and the flame goes out.
- **Try it on the card.** Some cards open small built-in tools: a subnet calculator, RAID capacity calculator, port checker, traceroute walkthrough, disk-usage explorer, and phishing URL checker. Jargon in card text links to a glossary.
- **Level up and collect.** XP levels with an increasing curve, plus 17 achievements from *First Byte* to *Unstoppable* (30-day streak), *Quiz Whiz* (10 correct answers), and *Lab Cartographer* (map your whole lab).

## Accounts & sync (optional)

Everything works anonymously — progress lives in your browser's
`localStorage`, no account needed. When you want your XP, streaks, lessons,
projects, quizzes, and gear profile to follow you across devices, create an
account on the **You** tab: **username + passkey**, no email, no password.

- **First sign-in** merges the anonymous progress on this device into the
  account; nothing is wiped.
- **Switching to a different account** replaces the previous account's local
  progress with the new account's; the two are never merged.
- **Signing out** clears account progress from the device before anonymous
  learning resumes.
- **Reset all progress** (on the You tab) wipes XP, streak, achievements,
  quizzes, lessons, and projects on this device and on the synced account.
  Followed topics and lab gear are kept.

Under the hood that's a Cloudflare Worker (Hono) + D1 with WebAuthn
(`@simplewebauthn`). The passkey RP ID is the parent domain `labthrift.com`,
but ByteRush and [Labthrift Plan](https://plan.labthrift.com) keep **separate
account stores**: a ByteRush account does not sign you in to Plan, and Plan
needs its own sign-in. See [`docs/shared-passkeys.md`](./docs/shared-passkeys.md).

## Content

73 hand-written lessons (223 cards, each with a quick-check quiz) across 11 topics, plus 17 guided projects:

| Topic | Sample lessons |
| --- | --- |
| 💻 Computer basics | What's inside a computer, files & folders, passkeys, updates, downloads |
| 🏠 Homelab | Proxmox, Pi-hole, NAS & the 3-2-1 rule, reverse proxies |
| 🌐 Networking | OSI model, subnetting, DNS, TCP vs UDP, NAT |
| 🐧 Linux | Filesystem layout, permissions, systemd, pipes, SSH |
| 📦 Docker | Containers vs VMs, images & layers, Compose, volumes |
| ☸️ Kubernetes | Pods/Deployments/Services, kubectl, CrashLoopBackOff |
| ☁️ Cloud | Shared responsibility, compute models, IAM, costs, regions & AZs |
| 🔁 DevOps | CI, CD strategies, Infrastructure as Code, observability |
| 🔐 Security | Password cracking, zero trust, SQL injection, TLS, MFA, phishing |
| 🗄️ Databases | SQL vs NoSQL, indexes, transactions & ACID, caching |
| 🏢 Enterprise | Monoliths vs microservices, load balancers, queues, CAP, SLOs |

The 17 projects were imported from the retired Runs app and live as JSON in
`src/content/projects/` (see `PROVENANCE.md` there). Six of them form the
beginner sequence: *Start with what you already have*, *What OS to put on it*,
*Your first weekend*, *SSH from the couch*, *A file share*, and *A backup of the
house folder*. Two source guides they link to (`/guides/immich`,
`/guides/prism`) are currently unavailable and are labelled as such in the app.

Add your own lessons by editing `src/lib/content.ts` — each lesson is a plain object with a title, hook, and an array of cards (optionally with code snippets). [`ARCHITECTURE.md`](./ARCHITECTURE.md) lists the full checklist.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://motion.dev) for the card, feed, and celebration animations
- [canvas-confetti](https://github.com/catdad/canvas-confetti) for the good stuff
- Web Audio API — all sounds are synthesized in `src/lib/sounds.ts`, zero audio files
- [Zustand](https://zustand.docs.pmnd.rs) with `persist` for XP, streaks, achievements, and project progress

It's a mobile-first responsive web app: open it on a phone (or install it to the home screen) and it behaves like a native app. The same codebase can be wrapped with Capacitor for real Android/iOS store builds later.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000 (the dev server picks port 3000 by default; pass `-p <port>` to change it).

### Other scripts

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

## Deploying

The production build (`output: "export"`) ships to Cloudflare Workers as
static assets plus a small API Worker (`worker/`) with a D1 database, live at
`app.labthrift.com` plus a `workers.dev` preview (anonymous mode only — see
docs). See [`DEPLOY.md`](./DEPLOY.md) for the full setup: D1 creation,
`wrangler d1 migrations apply`, and deploy steps.

## Project layout

```
src/
  app/            # routes: / (feed), /topics, /profile ("You")
  components/
    feed/         # vertical snap feed, story-style lessons, projects, gear questions
    tools/        # in-card tools (subnet, RAID, ports, traceroute, ...)
    onboarding/   # welcome + topic picker
    profile/      # passkey account card + "your lab" gear grid
    ui/           # shadcn/ui primitives
  content/
    projects/     # 17 guided projects (JSON) + schema and provenance
  lib/
    content.ts    # all topics & lessons (edit this to add content)
    projects.ts   # project catalog, beginner sequence, recommendations
    projectProgress.ts # step/choice/finish transitions for projects
    feed.ts       # All / Lessons / Projects feed construction
    quizzes.ts    # one quick-check question per lesson
    inventory.ts  # gear questions + lesson relevance map (feed tailoring)
    store.ts      # XP, streaks, achievements, sync (zustand + localStorage)
    api.ts        # fetch client for the Worker API
    authClient.ts # passkey register/sign-in flows (@simplewebauthn/browser)
    syncTypes.ts  # progress payload, merge and reset rules shared with the Worker
    sounds.ts     # synthesized sound effects (Web Audio)
    achievements.ts
worker/           # Hono Worker: WebAuthn, sessions, /api/sync (D1)
migrations/       # D1 schema (wrangler d1 migrations apply DB)
docs/             # ROADMAP.md, shared-passkeys.md, design/ (requirements + release evidence)
```

## Design documentation

[Product, requirements and architecture documents](docs/design/README.md) cover the frontend, supporting backend and the Runs-to-ByteRush consolidation. Release evidence is tracked separately from design intent in [release status](docs/design/release-status.md).

[Universal completion roadmap](docs/ROADMAP.md) sequences work across all three products, with dependencies, acceptance criteria, and coverage of all 100 numbered requirements.
