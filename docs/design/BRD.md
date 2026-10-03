# ByteRush — Business Requirements Document

> Baseline: 2026-10-03. Product: ByteRush. Repository: `zemdregon/tech-dose`. Source-grounded design baseline; deployment and acceptance evidence is tracked separately in [release status](release-status.md).

## Business problem and objective
Runs and ByteRush both teach homelab concepts through small steps, creating duplicate learning surfaces and separate progress systems. Consolidate guided walkthroughs into ByteRush’s feed so a learner can move from a short lesson to a practical project without choosing another learning application.

## Stakeholders and value
Learners need anonymous access, trustworthy progress, and a place to resume. Returning account holders need their existing lessons, quizzes, XP, gear, and passkeys preserved. The maintainer needs one learning deployment, one account system, and one progress database. Labthrift’s editorial site remains the source of longer guides; Plan remains the lab notebook.

## Business requirements
| ID | Requirement | Acceptance evidence |
|---|---|---|
| BR-B1 | Consolidate all Runs learning content | 17 projects, 168 nodes, 30 branch points validated |
| BR-B2 | Preserve existing ByteRush users | Migration and account-isolation tests |
| BR-B3 | Retire redundant infrastructure only after replacement works | Live release receipt precedes deletion inventory |
| BR-B4 | Do not imply successful software installation from reading | Explicit walkthrough completion and gear choices |
| BR-B5 | Preserve Plan and main website | Independent live smoke checks |

No revenue forecast, subscription model, or paid conversion target is established by this change. Success means complete content coverage, no duplicate project rewards, recoverable offline progress, and removal of Runs-only resources after acceptance. Product adoption metrics are proposed future measures, not existing analytics: project start-to-finish ratio and resume success could be measured only after a separate privacy/data-collection decision.

## Constraints and risks
No old Runs accounts, passkeys, progress, or separate old-data backup are imported. Destructive retirement is irreversible. If deployment or live verification fails, retain all remaining Runs resources until resolved. Keep a release evidence record rather than treating a Git commit as proof of production behavior.
