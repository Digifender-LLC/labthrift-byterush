# Release and evidence status

Baseline authored 2026-10-03. These design documents are source-grounded records and requirements, not proof of deployment.

- ByteRush Runs merge: implemented, committed and deployed. Live feed and authenticated sync verified. GitHub repository deletion remains blocked by the current CLI token scope; all other identified Runs resources are absent or removed.
- Plan: independent existing notebook; no runtime change required by the merge. Current design includes a known read/check/update save race; an atomic CAS improvement is proposed separately.
- Main website: independent editorial site and metrics backend. Source guide and surviving link checks remain part of the merge release gate.
- No old Runs user data is imported. Its permanent deletion occurs only after replacement deployment and live sync acceptance.

## Evidence log

Local verification completed: production build, frontend lint, Worker typecheck, seven focused automated tests, original content validator, and authenticated local GET/PUT/DELETE sync integration with four concurrent requests. Browser checks confirmed mobile layout (390×844), keyboard Continue, explicit branching/backtracking without duplicate XP, saved cursor after reload, scroll-to-pause, and offline reload/advancement under reduced motion. A terminal step required explicit Finish walkthrough, awarded its final 10 step XP plus 25 walkthrough XP, and left all 19 gear items unanswered. Next project advanced to the next beginner project; the profile showed one completed project and 16 project steps separately from zero lessons and quizzes.

Source-guide audit: 13 of 15 unique URLs return HTTP 200; `/guides/immich` and `/guides/prism` already return 404. Their original source URLs are retained and marked currently unavailable in the project UI. Prism remains the original short introductory stub; importing it does not turn it into a full installation guide. No new editorial content or product claims were invented to hide these inherited gaps.

Physical touchscreen verification is not available through this browser tool; mobile layout, button interaction and scroll behavior were checked. A final device pass remains useful for hardware-specific gestures. Product-specific source baselines are identified in each repository’s documents. Open questions: no formal SLA, quantitative adoption target, or future cross-product SSO design has been approved.

## Release receipt — 2026-10-03

- Replacement commit: `0e5c337` on `zemdregon/tech-dose` main, pushed before deployment.
- Initial accepted Worker version: `bb551418-d79a-4926-9c36-1bdbbd35aa7d`, served at https://app.labthrift.com/.
- Live browser: onboarding, All/Lessons/Projects controls, 17 project regions, Start/Continue, first step +10 XP and one shared +50 daily bonus verified. Mobile and desktop layouts inspected; [mobile evidence](evidence/live-project-mobile.png).
- Live authenticated integration: disposable isolated test identity exercised GET/PUT/DELETE, four concurrent progress submissions, duplicate retry, v1 omission preservation, reset retry and stale pre-reset write rejection. Test identity/session and temporary fixture files removed afterward. This tests the sync/session boundary, not a new physical-passkey enrollment.
- Existing services: Labthrift HTML 200; first-SSH guide Markdown 200; Plan HTML 200 and anonymous lab API 401; ByteRush HTML 200 and anonymous sync API 401.
- Local previews preserved: Labthrift 8801, Plan 8803, ByteRush 8804. The long-running ByteRush preview was restarted after repeated asset rebuilds invalidated its development asset state; production did not exhibit that failure.

## Runs retirement inventory

| Resource | Verified result |
|---|---|
| Worker `labthrift-runs` | Absent before and after release |
| Runs custom domain / zone route | No Runs custom domain; zone routes empty |
| `beta.labthrift.com` | NXDOMAIN from both authoritative Cloudflare nameservers; A/AAAA/CNAME/TXT lookups absent. OAuth DNS listing is not permitted, so authoritative DNS is the evidence used |
| D1 `08638b10-ad6e-463c-8f0b-8472565a489a` | Exact ID/name verified, DELETE succeeded, subsequent lookup absent |
| Local preview 8802 | Stopped; no listener |
| Local checkout and `.wrangler` state | Removed at the exact `labthrift-runs` path; no backup created |
| `zemdregon/labthrift-runs` | Deletion attempted; GitHub returned 403 requiring `delete_repo`. Authorization requested; pending |

No surviving public-site or Plan application references to the old beta host or Runs repository were found in the targeted source audit. Historical provenance/design references remain intentionally descriptive. Main, Plan and ByteRush databases/domains were kept distinct during removal.

Final presentation polish: commit `dcebb16`, Worker version `c1e7a942-7652-4954-aba3-ab357c994142`. Production reload retained the same project step and XP and showed the corrected singular step label. No backend logic changed in this follow-up.
