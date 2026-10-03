# ByteRush — Architecture Decision Records

> Baseline: 2026-10-03. Product: ByteRush. Repository: `zemdregon/tech-dose`. Source-grounded design baseline; deployment and acceptance evidence is tracked separately in [release status](release-status.md).

## ADR-B001 — Inline projects in the existing feed
**Status:** accepted scope, implementation under verification. **Context:** Runs duplicates ByteRush learning. **Decision:** retain Feed/Topics/You and use All/Lessons/Projects within Feed. **Alternatives:** standalone Runs or a fourth main tab. **Consequences:** one learning surface; cards must support long content and explicit branching without swipe ambiguity. Revisit only if demonstrated usability problems require another navigation model.

## ADR-B002 — Existing ByteRush snapshot and backend
**Status:** accepted. **Decision:** extend `/api/sync` and `progress.data` v2; do not create a Runs service. **Alternatives:** dedicated tables/service per project, shared Plan storage. **Consequences:** fewer services, explicit merge/CAS/reset rules required, bounded catalog validation in both runtimes.

## ADR-B003 — Fresh start for Runs identities
**Status:** accepted. **Decision:** import content only; no Runs users, credentials or progress. Plan credentials stay separate. **Consequences:** former Runs users begin anew; no migration code or separate old-data backup. Parent RP ID alone is not SSO.

## ADR-B004 — Completion-derived project rewards
**Status:** accepted. **Decision:** unique step/project completion identifiers determine 10/25 XP; shared daily bonus is a date set. **Alternative:** increment total XP on every UI transition. **Consequences:** replay/retry merges cannot duplicate project rewards; client data is still not an anti-cheat authority.

## ADR-B005 — Reset generations and CAS
**Status:** accepted. **Decision:** retain a reset marker and use optimistic conditional writes with bounded retries. **Alternatives:** delete snapshot row or last-write-wins replacement. **Consequences:** stale devices cannot restore old progress; clients need reconnect reset handling; resume still depends on client timestamps.

## ADR-B006 — Gated permanent Runs retirement
**Status:** accepted authorization; execution gated. **Decision:** after live acceptance delete the exact Runs resources and leave no redirect/old-data backup. **Alternative:** archive or redirect service. **Consequences:** old URL ceases serving, data recovery is intentionally unavailable. Record actual deletion results separately; this decision record is not evidence deletion occurred.
