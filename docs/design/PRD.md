# ByteRush — Product Requirements Document

> Baseline: 2026-10-03. Product: ByteRush. Repository: `zemdregon/tech-dose`. Source-grounded design baseline; deployment and acceptance evidence is tracked separately in [release status](release-status.md).

## Experience
Feed, Topics, and You remain the three primary destinations. Feed defaults to All, with Lessons and Projects filters. Projects appear as full feed cards with their steps rendered inside the card. A vertical swipe changes the feed item and preserves the current project cursor; only an explicit choice selects a branch.

## Product requirements
| ID | Behavior | Priority |
|---|---|---|
| PR-B1 | All 17 projects accessible, including completed and skipped | Required |
| PR-B2 | Back, Continue, choices, Pause, Resume, Skip, Replay | Required |
| PR-B3 | Most recently active resumable project first on return | Required |
| PR-B4 | Introduce projects after four lesson cards, at most two per session | Required |
| PR-B5 | Freeze ordering during the session; rebuild on visit, topic/filter changes, Next project | Required |
| PR-B6 | Preserve beginner sequence; recommend other projects by topics and gear | Required |
| PR-B7 | Explicit final action finishes reading without asserting installation | Required |
| PR-B8 | Immediate anonymous persistence with optional account sync | Required |

Gear questions are separated from project introductions by ordinary lessons. Projects use existing typography, colors, glossary, code blocks, and sound preference. Long text scrolls within the card, with visible keyboard-operable controls; reduced motion avoids unnecessary movement. Project totals remain separate from lesson and quiz totals.

## Main journeys
A new learner follows topics, reads four lessons, starts a suggested project, chooses a branch, pauses, and returns at the same step. A returning learner can replay without farming XP or switch to Projects to recover a skipped walkthrough. A signed-in learner can continue on another device. Switching accounts replaces the previous owner’s learning state before another snapshot loads.

## Exclusions and release gate
No Runs-data migration, standalone Runs backend, project navigation tab, automatic equipment installation, or shared Plan account is introduced. Release only after graph tests, build/lint/typecheck, browser/offline checks, and live feed/sync acceptance. Runs deletion is a later gated operation.
