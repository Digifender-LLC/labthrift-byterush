# ByteRush test coverage

Updated 2026-10-03 for roadmap items [B03 and X01](../ROADMAP.md). This maps each contract that B03 names, and each FRD/SRS row, to the check that covers it. "Manual" rows are still open and belong to B01 or B02.

## How to run the checks

| Command | What it covers | Needs |
|---|---|---|
| `npm test` | Content validator, then 19 Node tests: graphs, rewards, merges, store/account flows, Worker sync routes, and the service worker | Nothing beyond `npm ci` |
| `npm run lint` | ESLint | Nothing |
| `npm run typecheck:worker` | Worker TypeScript | Nothing |
| `npm run build` | Next export, service-worker cache identity, then `scripts/verify-offline-shell.mjs` (every project graph ships in a precached asset; no API path is precached) | Nothing |
| `node tests/sync-integration.mjs` | Real D1 GET/PUT/DELETE, concurrent writes and the gated mirror tables against a running local preview on port 8804 | `npm run cf:preview` and a migrated local D1 |
| `node tests/sync-integration.mjs --remote` | The same against live ByteRush | Production access; run only as an explicit release step |

The release gate is CI (`.github/workflows/ci.yml`), which runs the first four rows on every pull request and on `main`. CI uses no secrets and never calls production. The two integration rows remain manual release steps.

## Scenario coverage

| Contract | Requirement | Test |
|---|---|---|
| Lesson and quiz rewards stay distinct; first quiz attempt only; lessons and quizzes survive project actions and legacy merges | SR-B5, SR-B12 | `learning.test.ts` › lessons and quizzes keep distinct, first-attempt rewards |
| Topic filter, gear relevance (have/planned boost, pass does not), completed lessons last | FR-B1 | `learning.test.ts` › feed honors topics and gear relevance; `projects.test.ts` › feed cadence |
| Stable session ordering; actions do not rebuild the mounted list | FR-B1 | `learning.test.ts` › feed honors topics…; `projects.test.ts` › feed cadence |
| All-project discovery: Projects lists all 17 once, resumable first, skipped still listed | FR-B1, FR-B6 | `learning.test.ts` › feed honors topics… |
| Local-calendar day boundaries across time zones, DST, month, year and leap days | FR-B9 | `learning.test.ts` › one shared 50 XP bonus per local calendar day |
| One shared daily bonus across lessons and projects, including two devices on one day | FR-B10 | `learning.test.ts` › one shared 50 XP bonus…; `projects.test.ts` › migration, two-device rewards |
| Branching, Back, Pause/Resume, Skip, Replay, explicit Finish, no gear installation | FR-B2–B8, FR-B11 | `projects.test.ts` › branch choice…; finish is explicit… |
| An advance with no target is ignored | FR-B3 | `learning.test.ts` › one shared 50 XP bonus… |
| Duplicate retry, replay and two-device merges cannot duplicate project rewards | SR-B4 | `projects.test.ts` › finish is explicit…; `worker-api.test.ts` › retries, two devices and legacy clients converge |
| Old clients cannot erase project fields | SR-B6 | `projects.test.ts` › migration…; `worker-api.test.ts` › retries, two devices and legacy clients… |
| Concurrent write between read and commit is retried and merged | SR-B7 | `worker-api.test.ts` › a concurrent write… (in-memory D1); `sync-integration.mjs` (real D1) |
| Account switching, sign-out, late response from a former account | SR-B8 | `accounts.test.ts`; `learning.test.ts` › a late response from a former account |
| Interrupted anonymous attach retries into the intended account only | FR-B12, SR-B9 | `learning.test.ts` › an interrupted anonymous attach |
| Reset clears rewards, keeps topics and gear, is idempotent, retries offline, and stale or v1 snapshots cannot resurrect progress | FR-B13, SR-B9 | `accounts.test.ts`; `worker-api.test.ts` › reset is idempotent… |
| API responses are `no-store` and never cached by the service worker | SR-B10 | `worker-api.test.ts` › API answers are never cacheable; `service-worker.test.mjs` › loaded projects reload offline |
| Loaded projects reload offline; upgrades drop old caches and serve the new shell offline | SR-B10 | `service-worker.test.mjs`; `scripts/verify-offline-shell.mjs` during build |
| 17 graphs, valid edges, reachability, terminal paths, topics and gear | SR-B1, SR-B2 | `validate-runs-source.mjs`; `projects.test.ts` › all 17 graphs |
| Touch, keyboard, focus, reduced motion and mute | SR-B11 | Manual (B01) |
| Real passkey registration, sign-in, second device, expired session | FR-B12, SR-B8 | Manual (B02); routes in `worker/auth.ts` are replaced by a stub in `worker-api.test.ts` |

## Limits

- `worker-api.test.ts` runs the real Hono routes, merge rules and `updateProgress` CAS loop against an in-memory D1 that implements only the progress-row statements. The quiz and inventory mirror tables are covered by `sync-integration.mjs` against real D1, not by CI.
- `service-worker.test.mjs` evaluates `public/sw.js` with simulated caches and network. It does not replace a browser offline reload on a device.
- Session lookup is stubbed in the Worker tests, so they do not test cookie handling or passkey ceremonies.
