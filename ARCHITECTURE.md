# ByteRush / Tech Dose — architecture

Static Next.js export served by a Cloudflare Worker. The Worker owns `/api/*` (passkey auth + progress sync); everything else is static assets from `./out`.

```
Browser → Worker
  /api/*     → Hono (auth, sync)
  /*         → static Next export (out/)
```

## Client state (`src/lib/store.ts`)

Zustand + `localStorage` (`byterush-store`). Anonymous users never hit the API; signed-in users debounce-sync (1.5s) on every learning action and retry when the browser comes back online.

**Sync model:** grow-only merge of a v2 snapshot (`src/lib/syncTypes.ts`, shared with the Worker). Client sends a full snapshot; server merges with stored JSON and echoes the result. Counters use `max`, sets use union. Streak and best streak are derived from the union of `activityDays`; any completed lesson or project step marks the day active, and `dailyBonusDays` grants one +50 XP per day across both. Project XP is derived from unique step/project completion IDs (10/25 XP), so replays and retried merges never double-count. Per project, the most recently updated cursor wins while completed steps are unioned. Quiz answers: incoming client wins per key. Inventory: newer `inventoryUpdatedAt` wins per key. The Worker writes with a conditional `updated_at` check and bounded retries.

**Reset:** "Reset all progress" advances a `generation` and stores a reset marker (`DELETE /api/sync`). A snapshot from an older generation is replaced, never merged, so stale devices cannot resurrect pre-reset work. Followed topics and inventory survive a reset.

**Account switch:** `progressUserId` tracks which account local progress belongs to. First sign-in from anonymous merges local progress into the account. Signing into a *different* account first clears local state to `EMPTY_PROGRESS`, then loads that account's server state — progress from another user is never merged in. Sign-out clears account progress from the device.

## Feed (`src/lib/feed.ts`, rendered by `src/components/feed/Feed.tsx`)

The feed has three filters: **All**, **Lessons**, **Projects**. The lesson stream is built as:

1. Filter `LESSONS` to followed topics.
2. Round-robin interleave across topics.
3. Unfinished lessons first; stable sort by `gearBoost()` (inventory relevance).
4. Weave up to 3 unanswered inventory questions every 4 lessons.

**All** starts with the resumable project (if any), then interleaves up to two recommended projects (by followed topics and inventory) and the gear questions between lessons. **Projects** lists the resumable project, the six-project beginner sequence, then every remaining project.

Feed order is **stable while scrolling** (completing a lesson does not reshuffle) but **rebuilds when followed topics change** so the Topics screen promise holds.

## Content model (`src/lib/content.ts`)

```ts
Card   { heading?, body, code?, tool? }   // tool → CardToolButton registry
Lesson { id, topicId, title, hook, cards: Card[] }
Topic  { id, name, emoji, tagline, gradient }
```

Static compile-time data — no CMS. Adding a lesson:

1. Append to `LESSONS` in `content.ts`.
2. Add `q(...)` in `quizzes.ts` (`id: q-{lessonId}`).
3. Optional: `LESSON_GEAR` in `inventory.ts`, glossary terms in `glossary.ts`.

Lesson flow: cover → cards (tap zones; `CodeBlock` owns gestures) → optional quiz beat → complete.

Projects are JSON graphs in `src/content/projects/` (17 projects, validated against `schema.json`; provenance in `PROVENANCE.md`). Each beat has either a `continue` target, explicit `choices`, or `end`. Transitions (advance, back, pause, skip, replay, finish) live in `src/lib/projectProgress.ts`; steps and choices can set inventory status for stack items. Rendered by `ProjectView.tsx`.

## Worker / D1

| Table | Role |
|-------|------|
| `users`, `credentials` | Passkey accounts |
| `challenges` | Single-use WebAuthn ceremonies |
| `sessions` | SHA-256 hashed session tokens (30d TTL, expired rows purged on read) |
| `progress` | Full v2 `ProgressPayload` JSON (lessons, projects, activity days, reset generation) — hydration source |
| `quiz_answers`, `inventory` | Structured write mirrors for analytics |

Migrations: `migrations/*.sql` — apply with `npm run d1:migrate` / `d1:migrate:local`.

## Auth

WebAuthn passkeys (`@simplewebauthn/*`). RP ID `labthrift.com` (see `docs/shared-passkeys.md`). Cookies: `byterush_session` (httpOnly, secure, SameSite=Lax), `byterush_challenge` (auth routes only, 5 min).

Register → verify → session → `attachAccount()` (merge local anonymous progress). Login → same, unless `progressUserId` differs (clear local, then pull). Bootstrap in `BottomNav` reconciles cookie vs persisted user on load. The parent RP ID is not single sign-on: Labthrift Plan has its own users and credentials.

## Further reading

- [Design documents](docs/design/README.md) — requirements, HLD/LLD, and ADRs.
- [Release status](docs/design/release-status.md) — deployment and verification evidence.
- [Roadmap](docs/ROADMAP.md) — open work across ByteRush, Plan, and the website.
