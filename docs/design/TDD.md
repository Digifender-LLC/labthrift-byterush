# ByteRush — Technical Design Document

> Baseline: 2026-10-03. Product: ByteRush. Repository: `zemdregon/tech-dose`. Source-grounded design baseline; deployment and acceptance evidence is tracked separately in [release status](release-status.md).

## Chosen design
Extend ByteRush’s current snapshot and feed union with projects. Do not retain Runs server/auth code. Keep graph IDs and source URLs while adapting screen references. `project` joins `lesson` and `inventory` in the feed type. Content is build-time bundled; no network request is required to advance a project.

## Persistence and rewards
Normalize legacy snapshots into v2 with empty project defaults. Preserve their total XP as the legacy learning baseline. New project rewards are derived from `step:<project>:<step>` and `project:<project>` membership, worth 10 and 25 XP respectively. Daily activity/bonus membership is shared with lessons and uses the learner’s local calendar date. Existing lesson and quiz counters remain independent.

Merge completed steps and completion flags by union/OR. Resolve cursor, path, phase and skip state together by update timestamp, with a deterministic tie break. Resolve explicit gear edits using per-item timestamps. Do not accept client-supplied reward lists as additional XP. Legacy clients can omit new fields without deleting them; legacy XP totals are adjusted to avoid recounting project contributions echoed by the server.

## Concurrent writes and reset
Use the existing `updated_at` column as a CAS revision. Read → merge → conditional update. Batch mirror statements with a snapshot/revision guard. Retry conflicts up to eight times. DELETE persists a new generation and reset ID instead of removing the row, preventing stale snapshot resurrection. New clients persist a pending reset and retry it before PUT.

## Account lifecycle
First fetch server state when attaching an account. Anonymous learning may merge into that account. A different previous owner is cleared before fetch. In-flight responses are checked against an account epoch. Signing out clears account-owned state before anonymous work starts. Offline local changes remain available and are retried on reconnect.

## Rollout and recovery
No new database table or separate backend is needed. Release the compatible Worker and static assets together, bump service-worker caches, and record live evidence. Before Runs retirement, rollback can redeploy the earlier ByteRush release, but old clients cannot edit post-reset generations normally. After destructive retirement, restoring Runs accounts is intentionally unavailable; retain only imported content/provenance in ByteRush.
