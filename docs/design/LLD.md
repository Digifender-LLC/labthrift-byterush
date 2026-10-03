# ByteRush — Low-Level Design

> Baseline: 2026-10-03. Product: ByteRush. Repository: `zemdregon/tech-dose`. Source-grounded design baseline; deployment and acceptance evidence is tracked separately in [release status](release-status.md).

## Project state machine
```text
unstarted --Start--> active --Pause / leave card--> paused
paused --Resume--> active
active --Continue / choice--> active at next valid node
active --Back--> previous node on current path
active terminal --Finish walkthrough--> finished
any --Skip--> paused + skipped
finished --Replay--> active at entry, prior completions retained
```

`path[0]` must equal `startBeat`; each adjacent pair must be a continue edge or explicit choice edge; `path[-1]` equals `stepId`. Invalid advances are ignored locally and malformed paths are rejected by sync validation. Backtracking pops the path without removing completed-step membership. Each accepted action timestamps the cursor monotonically on the device.

## Feed algorithm
Interleave followed topics’ lessons, prioritize unfinished lessons, then gear relevance. In All, prepend the newest unskipped resumable project. Introduce at most two other relevant projects after lesson 4 and lesson 8. Place unanswered gear prompts at offset lesson positions to avoid adjacent introductions. Projects filter deduplicates resume, beginner sequence and remaining catalog IDs. Store the resulting array for the mounted session; progress actions do not sort it again.

## Snapshot algorithms
Normalization computes `xp = learningXp + 10 * uniqueSteps + 25 * completedProjects + 50 * dailyBonusDays`. Activity days determine current/best streak while preserving historic best. Merge first compares reset generations; newer replaces older. Equal generations union completion/activity/reward membership and apply the cursor rule in TDD. Inventory updates only follow explicit answers/status choices.

SQL CAS updates `progress` only where prior `updated_at` matches. An absent row uses insert-on-conflict-do-nothing. Mirror deletes/inserts are gated by exact revision and serialized snapshot within the same D1 batch. Retry from the latest stored row after a lost CAS; do not overwrite with the stale computed result.

## Interfaces and validation
`actOnProject(payload,id,action,day,now)` returns a normalized snapshot and does no I/O. `buildFeed(...)` is deterministic for given input. `isProgressPayload` bounds histories and checks known project/step IDs. Tests can supply a fixed calendar date and clock. This separation keeps traversal, reward and sync checks independent of React rendering.
