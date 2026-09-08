# ByteRush / Tech Dose — architecture

Static Next.js export served by a Cloudflare Worker. The Worker owns `/api/*` (passkey auth + progress sync); everything else is static assets from `./out`.

```
Browser → Worker
  /api/*     → Hono (auth, sync)
  /*         → static Next export (out/)
```

## Client state (`src/lib/store.ts`)

Zustand + `localStorage` (`byterush-store`). Anonymous users never hit the API; signed-in users debounce-sync (1.5s) on every learning action and retry when the browser comes back online.

**Sync model:** grow-only merge (`src/lib/syncTypes.ts`). Client sends a full snapshot; server merges with stored JSON and echoes the result. Counters use `max`, sets use union, streak follows the newer `lastActiveDay`. Quiz answers and inventory: incoming client wins per key on conflict.

**Account switch:** `progressUserId` tracks which account local progress belongs to. Signing into a *different* account pulls server state only — local progress from another user is not merged in.

## Feed (`src/components/feed/Feed.tsx`)

1. Filter `LESSONS` to followed topics.
2. Round-robin interleave across topics.
3. Unfinished lessons first; stable sort by `gearBoost()` (inventory relevance).
4. Weave up to 3 unanswered inventory questions every 4 lessons.

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

## Worker / D1

| Table | Role |
|-------|------|
| `users`, `credentials` | Passkey accounts |
| `challenges` | Single-use WebAuthn ceremonies |
| `sessions` | SHA-256 hashed session tokens (30d TTL, expired rows purged on read) |
| `progress` | Full `ProgressPayload` JSON — hydration source |
| `quiz_answers`, `inventory` | Structured write mirrors for analytics |

Migrations: `migrations/*.sql` — apply with `npm run d1:migrate` / `d1:migrate:local`.

## Auth

WebAuthn passkeys (`@simplewebauthn/*`). RP ID `labthrift.com` (see `docs/shared-passkeys.md`). Cookies: `byterush_session` (httpOnly, secure, SameSite=Lax), `byterush_challenge` (auth routes only, 5 min).

Register → verify → session → `syncNow()` (merge local). Login → same, unless `progressUserId` differs (pull only). Bootstrap in `BottomNav` reconciles cookie vs persisted user on load.
