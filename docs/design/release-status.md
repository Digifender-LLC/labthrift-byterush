# Release and evidence status

Baseline authored 2026-10-03. These design documents are source-grounded records and requirements, not proof of deployment.

- ByteRush Runs merge: local implementation and verification in progress. Production acceptance and Runs resource deletion are pending until recorded below.
- Plan: independent existing notebook; no runtime change required by the merge. Current design includes a known read/check/update save race; an atomic CAS improvement is proposed separately.
- Main website: independent editorial site and metrics backend. Source guide and surviving link checks remain part of the merge release gate.
- No old Runs user data is imported. Its permanent deletion occurs only after replacement deployment and live sync acceptance.

## Evidence log

Local verification completed: production build, frontend lint, Worker typecheck, seven focused automated tests, original content validator, and authenticated local GET/PUT/DELETE sync integration with four concurrent requests. Browser checks confirmed mobile layout (390×844), keyboard Continue, explicit branching/backtracking without duplicate XP, saved cursor after reload, scroll-to-pause, and offline reload/advancement under reduced motion.

Source-guide audit: 13 of 15 unique URLs return HTTP 200; `/guides/immich` and `/guides/prism` already return 404. Their original source URLs are retained and marked currently unavailable in the project UI. Prism remains the original short introductory stub; importing it does not turn it into a full installation guide. No new editorial content or product claims were invented to hide these inherited gaps.

Physical touchscreen verification is not available through this browser tool; mobile layout, button interaction and scroll behavior were checked. A final device pass remains useful for hardware-specific gestures. Product-specific source baselines are identified in each repository’s documents. Open questions: no formal SLA, quantitative adoption target, or future cross-product SSO design has been approved.
