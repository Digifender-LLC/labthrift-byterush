# ByteRush — Functional Requirements Document

> Baseline: 2026-10-03. Product: ByteRush. Repository: `zemdregon/tech-dose`. Source-grounded design baseline; deployment and acceptance evidence is tracked separately in [release status](release-status.md).

## Functional contract
| ID | Trigger | Result / exception |
|---|---|---|
| FR-B1 | Select All/Lessons/Projects | New stable session; Projects contains every project |
| FR-B2 | Start/Resume | Cursor becomes active; no XP for viewing |
| FR-B3 | Continue or choose a branch | Complete departing step once; append valid edge to history |
| FR-B4 | Back | Pop current path; keep earned completions; alternate choices remain available |
| FR-B5 | Pause or leave card | Save current cursor; no branch chosen |
| FR-B6 | Skip | Mark skipped and paused; discoverable under Projects |
| FR-B7 | Replay | Start a fresh traversal; retain unique completion rewards |
| FR-B8 | Finish walkthrough | Only terminal step permits completion; first finish adds 25 XP |
| FR-B9 | First completed step | Add 10 XP and record local-calendar activity |
| FR-B10 | First daily activity | At most one shared 50 XP bonus across projects and lessons |
| FR-B11 | Explicit gear-status choice | Map interested/planned, installed/have, skipped/pass |
| FR-B12 | Sign in | Merge anonymous work only into account being attached; replace another owner’s work |
| FR-B13 | Reset | Clear learning/project rewards; retain topics and gear; retry remote reset offline |

`pihole` maps to existing `pi-hole`; the nine other Runs entries become distinct gear items. Merely opening or finishing a card never marks gear installed. Source guides stay linked and the Plan passkey project clearly identifies the separate Plan application.

## Server interface
Existing GET/PUT/DELETE `/api/sync` remain cookie-authenticated. GET returns `{progress}` or null. PUT accepts `{progress}` and returns the merged v2 snapshot. Invalid payload returns 400, unauthenticated access 401, exhausted concurrent-write retries 503. DELETE accepts `{id,generation}` for an idempotent reset and returns `{ok,progress}`. Legacy bodyless DELETE remains supported. Unknown API paths return JSON 404.

Failure to sync leaves local work intact. Newer reset generations replace stale snapshots. A legacy client omitting project fields cannot remove them. Automated checks trace FR-B2–B13 to graph traversal, reward, merge, and account tests.
