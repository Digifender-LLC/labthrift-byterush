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

## Portfolio legal-link release — 2026-10-03

Source commit `5157e9b` was pushed to `zemdregon/tech-dose` main and deployed as Worker version `e066da9e-6824-442f-b5de-04c50690db9c`. The welcome screen, topic-selection step and profile now show direct labeled **Draft terms**, **Draft privacy policy** and **Draft cookie notice** links to Digifender's LabThrift collection, plus a small Digifender attribution and legal-contact link. The links appear before topic completion or profile account actions; displaying them does not record agreement or adopt the drafts.

The production build, targeted lint and diff check passed. Local and live browser checks at 390px and 1440px found all five exact destinations on welcome, topics and profile without horizontal overflow. The live root returned 200 and anonymous `/api/sync` remained 401. Digifender's portfolio audit cleared ByteRush and reported 24 remaining gaps on Whumpo, the main Labthrift site and Plan.

The company-document team revised all three LabThrift drafts on October 3 to describe guided-project paths, steps, choices, completion, rewards, local storage and optional account sync. Those revised web, print and PDF copies are now live on Digifender Worker `d2c1ba20-7450-48b6-8974-2fb721b10437`. All 88 company release files matched production; desktop/mobile document, accessibility, PDF download and print checks passed, and all eight revised PDF pages were visually reviewed. [Product issue #1](https://github.com/zemdregon/tech-dose/issues/1#issuecomment-5973540141) is closed for its completed UI-link and factual-draft-review scope. The documents remain explicitly drafts; operational confirmations, legal adoption and company formation remain pending. This follow-up changed company-hosted documents, not the ByteRush runtime.

## Returning-browser and feed link follow-up — 2026-10-03

Source `2806bbb` was deployed as Worker `76104fa4-853a-41b9-bf79-e4d8a9fa6c19`. The feed closing screen now reuses the same explicitly labeled draft-policy/company/legal-contact component as onboarding and profile. A returning browser had shown the pre-policy profile during client navigation until a full reload. The prior release reused its service-worker cache version; the build now derives cache identity from every exported file and the worker template so changed route payloads, pages and unbundled public assets invalidate old caches automatically.

Production build, targeted lint, diff check, deterministic cache-identity checks, and desktop/390px rendered checks passed. All 57 deployed public assets match the reviewed output after removing Cloudflare-injected HTML. Cloudflare readback confirms identical backend code, bindings and runtime; anonymous `/api/sync` remains 401. The same existing browser was used without clearing storage: feed-to-profile client navigation retained all five destinations, and its visible level 2 / 60 XP state remained. No account operation, migration, or policy adoption was performed. Evidence is in the oversight task's `outputs/labthrift-source-recovery-2026-10-03/`.
