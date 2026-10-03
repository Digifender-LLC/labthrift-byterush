# ByteRush — Software Requirements Specification

> Baseline: 2026-10-03. Product: ByteRush. Repository: `zemdregon/tech-dose`. Source-grounded design baseline; deployment and acceptance evidence is tracked separately in [release status](release-status.md).

## Normative requirements
“Shall” identifies release requirements. Product choices are defined in PRD; this document defines verifiable software obligations.

| ID | The system shall… | Verification |
|---|---|---|
| SR-B1 | Bundle exactly 17 known graphs with stable IDs | Content validator and graph tests |
| SR-B2 | Validate entry, edges, reachability, terminal paths, topics and gear | Graph test suite |
| SR-B3 | Persist cursor/history together and completed steps as a set | Reducer/merge tests |
| SR-B4 | Derive step/project rewards from unique completion identifiers | Replay and two-device tests |
| SR-B5 | Preserve v1 lesson, quiz, inventory, XP and account state | Migration fixture |
| SR-B6 | Prevent old client omission from erasing project state | Legacy payload test |
| SR-B7 | Protect snapshot writes against concurrent updates | CAS integration test |
| SR-B8 | Isolate account-owned state and ignore stale account responses | Account-switch tests |
| SR-B9 | Retry reset and sync after reconnecting | Offline recovery checks |
| SR-B10 | Serve loaded projects offline without caching APIs | Service worker offline reload |
| SR-B11 | Support touch, keyboard and reduced motion | Mobile/desktop manual acceptance |
| SR-B12 | Keep lesson/quiz behavior and counts distinct | Regression checks |

## Data and compatibility
Snapshot schema v2 adds generation/reset ID, learning XP baseline, activity/daily-bonus days, project map, reward IDs and inventory timestamps. Project state contains step ID, traversed path, phase, skipped flag, update time, completed step IDs and completion flag. Invalid graph paths must be rejected. Reset-generation counters are advanced only by the server reset operation for signed-in state.

## Quality and operational limits
No formal availability SLA or latency budget is yet approved. Release must pass production build, frontend lint, Worker typecheck and focused tests. Anonymous localStorage is device-local; clearing browser storage removes anonymous work. Client-clock ordering provides deterministic resume conflict resolution but is not proof of real-world event order. XP is educational state supplied by the client, not an anti-cheat or monetary entitlement system.

## Traceability
BR-B1 → PR-B1 → FR-B1/B3 → SR-B1/B2. BR-B2 → PR-B8 → FR-B12/B13 → SR-B5–B9. BR-B4 → PR-B7 → FR-B8/B11 → SR-B3/B4. BR-B3/B5 → release checklist and resource inventory.
