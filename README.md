# ⚡ ByteRush

**The scroll you won't regret.** ByteRush is a TikTok-style feed of bite-sized tech lessons — built to deliver the same dopamine hits as social media, but every swipe teaches you something real: homelab, networking, Linux, Docker, Kubernetes, cloud, DevOps, security, databases, and enterprise architecture.

## How it works

- **Pick your topics.** Choose what you want to learn during onboarding (change it anytime on the Topics tab). Your feed is built only from topics you follow.
- **Swipe the feed.** Each lesson is a full-screen story. Tap the right side to advance through its cards, tap the left side to go back — Instagram-story style, with progress segments up top. Longer subjects are split across multiple cards so nothing ever overflows one screen.
- **Feel the dopamine.** Every card earns XP with a floating `+10 XP` pop and a synthesized click. Finishing a lesson triggers confetti and a rising chime. Achievements get a full-screen fanfare.
- **Prove it with quick checks.** Every lesson ends with a one-question quiz beat. Nail it for +15 XP; miss it and you just get the explanation — no punishment, no streak damage.
- **Tell us about your lab.** Every few lessons, the feed asks one lightweight gear question (Pi-hole? Tailscale? NAS? UPS?). Your answers shape the feed: lessons matching gear you have or plan float to the top with a "picked for your lab" badge.
- **Keep the streak alive.** Finish at least one lesson a day to extend your 🔥 day streak (with a +50 XP daily bonus). Miss a day and the flame goes out.
- **Level up and collect.** XP levels with an increasing curve, plus 17 achievements from *First Byte* to *Unstoppable* (30-day streak), *Quiz Whiz* (10 correct answers), and *Lab Cartographer* (map your whole lab).

## Accounts & sync (optional)

Everything works anonymously — progress lives in your browser's
`localStorage`, no account needed. When you want your XP, streaks, quizzes,
and gear profile to follow you across devices, create an account on the
profile tab: **username + passkey**, no email, no password. On first sign-in
your local progress is merged into the account, never wiped.

Under the hood that's a Cloudflare Worker (Hono) + D1 with WebAuthn
(`@simplewebauthn`), RP ID `labthrift.com` so passkeys can be shared across
Labthrift apps — see [`docs/shared-passkeys.md`](./docs/shared-passkeys.md).

## Content

45 hand-written lessons (~135 cards) across 10 topics:

| Topic | Sample lessons |
| --- | --- |
| 🏠 Homelab | Proxmox, Pi-hole, NAS & the 3-2-1 rule, reverse proxies |
| 🌐 Networking | OSI model, subnetting, DNS, TCP vs UDP, NAT |
| 🐧 Linux | Filesystem layout, permissions, systemd, pipes, SSH |
| 📦 Docker | Containers vs VMs, images & layers, Compose, volumes |
| ☸️ Kubernetes | Pods/Deployments/Services, kubectl, CrashLoopBackOff |
| ☁️ Cloud | Shared responsibility, compute models, IAM, costs, regions & AZs |
| 🔁 DevOps | CI, CD strategies, Infrastructure as Code, observability |
| 🔐 Security | Password cracking, zero trust, SQL injection, TLS |
| 🗄️ Databases | SQL vs NoSQL, indexes, transactions & ACID, caching |
| 🏢 Enterprise | Monoliths vs microservices, load balancers, queues, CAP, SLOs |

Add your own lessons by editing `src/lib/content.ts` — each lesson is a plain object with a title, hook, and an array of cards (optionally with code snippets).

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://motion.dev) for the card, feed, and celebration animations
- [canvas-confetti](https://github.com/catdad/canvas-confetti) for the good stuff
- Web Audio API — all sounds are synthesized in `src/lib/sounds.ts`, zero audio files
- [Zustand](https://zustand.docs.pmnd.rs) with `persist` for XP, streaks, and achievements

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
  app/            # routes: / (feed), /topics, /profile
  components/
    feed/         # vertical snap feed, story-style lessons, gear questions
    onboarding/   # welcome + topic picker
    profile/      # passkey account card + "your lab" gear grid
    ui/           # shadcn/ui primitives
  lib/
    content.ts    # all topics & lessons (edit this to add content)
    quizzes.ts    # one quick-check question per lesson
    inventory.ts  # gear questions + lesson relevance map (feed tailoring)
    store.ts      # XP, streaks, achievements, sync (zustand + localStorage)
    api.ts        # fetch client for the Worker API
    authClient.ts # passkey register/sign-in flows (@simplewebauthn/browser)
    syncTypes.ts  # progress payload shared with the Worker
    sounds.ts     # synthesized sound effects (Web Audio)
    achievements.ts
worker/           # Hono Worker: WebAuthn, sessions, /api/sync (D1)
migrations/       # D1 schema (wrangler d1 migrations apply DB)
docs/             # shared-passkeys.md: RP ID + preview-vs-prod rules
```
