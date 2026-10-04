# Labthrift universal completion roadmap

Updated 2026-10-03. This is the shared execution plan for **ByteRush, Labthrift Plan, and the Labthrift website**, including their supporting Workers and databases. It brings all 27 design documents into one backlog and maps all 100 numbered business, product, functional, and software requirements to completion work.

The Runs-to-ByteRush implementation is already deployed and has recorded acceptance evidence. The remaining work is to close content gaps, finish retirement, complete verification of the three products, and resolve the documented reliability and operating decisions. This roadmap does not turn a proposed feature into an approved requirement.

This file is the canonical roadmap. The three repository READMEs and design indexes link here; maintain one status record rather than three copies. Product design documents define behavior, and each product's release record proves what shipped. When they disagree, investigate and update the affected documents before closing the task.

## How to use this roadmap

- **Recorded complete** means dated release evidence exists. It does not mean every future version is automatically verified.
- **Partial** means implementation or some checks exist, but the listed acceptance evidence is incomplete.
- **Open** means work or verification remains. A verification task does not imply that the existing feature is missing or broken.
- **Blocked** names a specific external prerequisite.
- **Decision** means a proposal needs an explicit adopt, defer, or reject disposition. Adoption creates implementation work; deferral must name the limitation and a revisit trigger.

The owner columns name the responsible product or discipline, not an assigned person. Assign an implementer when starting a task. Follow the dependency order below; dates and staffing are not yet committed. Do not use a percentage complete: building an existing feature, verifying it, and making a product decision are different kinds of work.

## Current baseline

| Area | Recorded state | Evidence and remaining boundary |
|---|---|---|
| ByteRush projects | Recorded complete for the deployed merge | 17 projects, 168 nodes, 30 branches; inline feed, persistence, rewards, sync, reset, and offline assets. Implementation `0e5c337`, presentation follow-up `dcebb16`; Worker version `c1e7a942-7652-4954-aba3-ab357c994142`. See [release receipt](design/release-status.md). |
| ByteRush verification | Partial overall | Build, lint, Worker typecheck, seven focused tests, local/live sync concurrency, and browser checks are recorded. Physical touchscreen and new physical-passkey ceremonies were not verified by that receipt. |
| Runs retirement | Partial | D1 and local checkout/state removed; port 8802 stopped; Worker/domain/route absent; beta DNS answered NXDOMAIN. GitHub repository still exists, confirmed by a read-only check on 2026-10-03. Last deletion attempt lacked `delete_repo` token scope. |
| Plan | Existing product preserved | Live shell and anonymous API boundary checked. Full notebook, import/export, passkey, and concurrent-save acceptance remains separate. The save race is documented in ADR-P004. |
| Website | Existing product preserved | Live HTML and a representative Markdown guide checked. The merge receipt found 13 of 15 unique source URLs available; Immich and Prism URLs returned 404. Full serving/metrics/publication contracts remain to be verified. |
| Design documents | Recorded complete as authored baseline | Nine documents per product are committed. Their statements are requirements/design evidence, not blanket acceptance of every feature. |

The recorded live results above come from the dated release receipts; this roadmap was not a new full production audit. Source review for this roadmap reconfirmed Plan's separate read/check/update save sequence and found no committed GitHub Actions workflows or Plan/website test suites in the inspected trees.

## Delivery order and dependencies

| Phase | Work | Exit condition |
|---|---|---|
| 0 Preserve the accepted baseline | Keep the existing release receipt and three independent product boundaries | Already recorded; use it to avoid rebuilding completed work |
| 1 Close merge gaps | D01, C01, C02, R01 | Documentation agrees with runtime, source continuity is resolved, and every Runs resource has a final disposition |
| 2 Verify ByteRush | B01, B02, B03 | Remaining device, authentication, learning, and recovery evidence is recorded |
| 3 Verify Plan and resolve its save race | P01–P05 | Existing notebook contracts pass; CAS proposal is either implemented and verified or explicitly deferred with the limitation retained |
| 4 Verify the editorial site | W01–W03 | Serving, discovery, publication boundaries, metrics, and app links pass |
| 5 Make completion repeatable | X01, X02, X03 | Checks are runnable, operating decisions are explicit, and all required items have release evidence |

Phases 2, 3, and 4 can proceed independently after the baseline is understood. C01 must finish before claiming full guide continuity in W01/X03. P01 and a decision in P05 precede a CAS implementation. R01 is blocked only on GitHub authorization; it does not prevent local verification elsewhere. X03 depends on every required item, adopted proposal, and decision disposition. A failed new release pauses further destructive retirement until that failure is resolved.

## Phase 1 Close merge gaps

### D01 Align the documentation with the released products

**Status:** Open. ByteRush part done in this repository: README, ARCHITECTURE, DEPLOY, the passkey note, and ADR-B001 now match the catalog (73 lessons, 11 topics, 17 projects), the shared lesson/project streak, account switching, separate Plan sign-in, and link to release evidence. Plan and website documents remain. **Owner:** documentation across all three repositories. **Dependency:** recorded baseline.

Reconcile stale release-language and links across the 27 documents, READMEs, deployment instructions, and passkey notes. ByteRush's older README still describes a lesson-only streak, old content counts, and passkeys as shareable across apps without making the separate account stores sufficiently clear. ADR-B001 also still says implementation is under verification. Preserve historical decisions while linking their current execution evidence.

**Done when:** current user-facing descriptions include projects and the shared streak rule, counts match the catalog, account switching and separate Plan sign-in are accurate, and every document links to the canonical roadmap/release evidence. Accepted architecture is not presented as a pending implementation or as proof of checks never run.

### C01 Restore the two missing source guide destinations

**Status:** Partial; written, awaiting deploy. `/guides/immich` and `/guides/prism` (PhotoPrism, per Ender's 2026-10-04 decision) and their Markdown twins are in [labthrift#4](https://github.com/zemdregon/labthrift/pull/4). C01 closes when they are live and ByteRush links them again. **Owner:** website editorial, with ByteRush integration review. **Dependency:** source-guide inventory in the merge receipt.

Resolve `/guides/immich` and `/guides/prism`, preserving the imported source URLs and provenance. Prefer substantive guides and matching Markdown twins at those destinations. If the editorial decision is to use another canonical guide or retain an unavailable guide, record that decision and explicitly revise the continuity requirement; do not silently count a 404 or a placeholder as complete.

**Done when:** all 15 unique source-guide destinations across the 17 projects have reviewed content and successful live responses, with matching available Markdown representations and working discovery links. Remove ByteRush's unavailable label only after the affected destination is verified. Record redirects or URL corrections if any are chosen.

### C02 Review the imported walkthrough content as learning material

**Status:** Partial. The [catalog review](design/catalog-review.md) records all 17 projects (2 Pass, 11 Pass with notes, 4 fixed in the same change); Prism is PhotoPrism (decided 2026-10-04); the Immich/Prism source comparison against the new guides remains. **Owner:** ByteRush content and website editorial. **Dependency:** C01 for final link acceptance.

Review all 17 projects for agreement with their source guides, clear command prerequisites, explicit choices and completion wording, and Plan-specific labels. Preserve IDs, the six-project beginner sequence, all valid graph paths, and provenance. The imported Prism project is a short introductory stub: explicitly accept that limited scope or commission a full walkthrough as a separate content change. A content expansion must update count expectations and validation deliberately.

**Done when:** a catalog review records each project's source, scope, and review result; no instructions claim reading installed equipment; Prism's scope is explicit; and any edits pass the graph/topic/gear validator and relevant traversal checks.

### R01 Finish permanent Runs retirement

**Status:** Blocked on GitHub CLI authorization. **Owner:** repository/infrastructure maintainer. **Dependency:** accepted ByteRush live release, already recorded; valid `delete_repo` scope for the remaining GitHub operation.

After authorization, delete only `zemdregon/labthrift-runs` and verify its absence using an authenticated lookup with a working account context. Recheck the retirement inventory for unexpected remaining Runs-only resources. Preserve the no-redirect and no-old-data-backup policy. The old D1 ID is `08638b10-ad6e-463c-8f0b-8472565a489a`; its deletion is already recorded and must not be repeated against another database.

**Done when:** GitHub repository, Runs Worker/custom domain/routes, beta DNS, exact D1, preview listener, checkout, and local database state are all absent with dated evidence. ByteRush, Plan, and the website still pass their preservation checks. Update all release records with the final result; do not replace the pending state with an assumption.

## Phase 2 Verify ByteRush

### B01 Finish device and accessibility acceptance

**Status:** Partial. **Owner:** ByteRush frontend and QA. **Dependency:** deployed project experience.

Use a physical touch device and a desktop keyboard to exercise long steps, inner scrolling versus feed swiping, branch choices, Back, Pause/Resume, Skip/Replay, and explicit completion. Check focus visibility/order, readable code/glossary content, reduced motion, and mute. Existing viewport/browser checks remain evidence for the cases they covered.

**Done when:** a device/browser matrix records the remaining cases and any fixes. Swiping never selects a branch, controls stay reachable on long content, progress survives navigation, and motion/sound preferences hold. Attach focused screenshots or recordings without account secrets.

### B02 Verify real passkey and account journeys

**Status:** Partial; snapshot/session integration and automated account-isolation checks already passed. **Owner:** ByteRush frontend/backend and QA. **Dependency:** disposable accounts and passkey-capable devices on an allowed origin.

Test registration, sign-in, sign-out, anonymous attachment, switching account A to B, expired-session recovery, and continuation on a second device. Include an interrupted anonymous attachment and a late response from the former account. Keep Plan authentication independent. Use local development with its configured RP or the supported production origin; the workers.dev host is not a production passkey test origin.

**Done when:** real ceremonies and the resulting account state are verified, anonymous work attaches only to its intended account, prior account data is not exposed or merged into another owner, and disposable fixtures are removed. Distinguish physical authentication evidence from the already-passed injected-session sync test.

### B03 Close learning and recovery regression coverage

**Status:** Partial. Every automatable scenario below now has a passing test, mapped in [test coverage](design/test-coverage.md); the signed-in device journey waits on B02. **Owner:** ByteRush frontend/backend and QA. **Dependency:** B02 for the complete signed-in device journey; C02 for changed content.

Compare the existing tests with every contract in FRD/SRS. Fill meaningful gaps for lesson/quiz preservation, topic/filter and gear relevance, stable session ordering, all-project discovery, local-calendar day boundaries, shared daily bonuses, reset/reconnect, and service-worker upgrades with loaded projects offline. Reuse existing migration, reward-set, cursor/history, concurrent-write, and stale-reset fixtures rather than recreating equivalent tests.

**Done when:** each required scenario has a passing test or a dated manual result. Duplicate retry/replay/two-device merges cannot duplicate project rewards; old clients cannot erase project fields; reset cannot resurrect stale progress; API responses are not cached offline. Run build/lint/Worker typecheck and the focused suites for code changes, and repeat live sync checks when those paths change.

## Phase 3 Verify Plan and resolve its save race

### P01 Verify notebook ownership and editing contracts

**Status:** Open verification of existing features. **Owner:** Plan frontend/backend and QA. **Dependency:** disposable users and a repeatable local Worker/D1 test setup.

Exercise one lab per user, cross-account isolation, equipment, services, checklists, rack slots/ports, hosts, purchase notes, and capacity estimates. Check sanitization and boundaries, including 100-item collections, 1–42 rack units, string lengths, numeric limits, and invalid references. Check autosave feedback, missing notebook behavior, and sequential stale saves with explicit force resolution.

**Done when:** API fixtures and browser checks show correct ownership, round-trip data, limits, defaults, and honest save/conflict states. Measured infrastructure health is never implied by planning values. Record the simultaneous-write limitation until P05 resolves it.

### P02 Verify portable imports and exports

**Status:** Open verification. **Owner:** Plan frontend/backend and QA. **Dependency:** P01 fixtures.

Round-trip schema-v2 exports and legacy/v1/v2 imports, reject unknown versions, and verify sanitization and replacement semantics. Include representative inventory, services, checklist, rack, hosts, BOM, and capacity data. Importing never transfers credentials.

**Done when:** fixtures cover accepted and rejected versions; the exported file contains its version/timestamp/lab; replacement behavior is clear before submission; no supported fields are silently lost in a valid round trip.

### P03 Verify passkeys and account lifecycle

**Status:** Open verification. **Owner:** Plan authentication/backend and QA. **Dependency:** isolated test users and supported passkey devices/origins.

Test register/login, `/auth/me`, expiry, enrollment on a second device, passkey listing/addition/revocation, last-passkey protection, and account deletion using disposable data. Verify configured RP/origin checks and ownership of sessions, enrollment tokens, and notebook records. Document the lack of email recovery rather than inventing a recovery promise.

**Done when:** positive and negative authentication cases pass; another user's lab is inaccessible; last-key behavior and account deletion match the UI contract; test records are cleaned up; the limitations of per-isolate rate limiting remain explicit.

### P04 Verify offline behavior and aggregate metrics

**Status:** Open verification. **Owner:** Plan frontend/backend and QA. **Dependency:** P01 and P03 journeys.

Interrupt networking during navigation, session checks, and saves. Confirm fallback/error states distinguish unsaved changes from successful persistence and never invent authentication. Inspect metric schema and write payloads for day/metric/count aggregation without user IDs, raw IP, or raw UA.

**Done when:** outage/reconnect results and metric fixtures are recorded. Any stronger offline editing guarantee is treated as a new decision, not inferred from the PWA shell.

### P05 Resolve the proposed atomic save improvement

**Status:** Decision; recommended reliability follow-up, not implemented or accepted by the original merge. **Owner:** Plan maintainer. **Dependency:** P01 baseline and ADR-P004.

Recommended path: adopt a conditional database write using the expected revision in the UPDATE predicate, handle zero-row updates as conflicts, and ensure revisions cannot collide for successful rapid writes. Define explicit force-save and import behavior before implementation. Add a new verifiable concurrency requirement and update TDD/LLD/ADR together.

**Done when adopted:** two simultaneous ordinary saves from one revision cannot silently overwrite each other; one succeeds and the other receives a recoverable conflict containing current state. Sequential stale saves, explicit force, imports, and autosave UI are tested, and the changed Plan release is deployed and verified. **Done as a decision only when deferred/rejected:** record the reason, accepted race limitation, and revisit trigger. A deferral does not make Plan concurrency-safe.

## Phase 4 Verify the editorial site

### W01 Verify public serving and guide continuity

**Status:** Partial. The local request matrix passes (`npm test`, `npm run check` in [labthrift#4](https://github.com/zemdregon/labthrift/pull/4)), which fixed negotiated-Markdown HEAD length and the type of missing `/md` pages. The live run and C01 remain. **Owner:** website Worker and QA. **Dependency:** C01 for full source continuity.

Test GET/HEAD for representative pages and all project source-guide URLs. Cover Markdown/HTML Accept preferences including q-values and ties, `Vary: Accept`, missing-twin fallback, Markdown HEAD body/length, direct `/md` routes, and unknown-page behavior. Compare available HTML/Markdown twins for materially consistent instructions.

**Done when:** the request matrix passes locally and representative live responses match; all imported source URLs resolve as agreed in C01. Public reading requires no login and no request writes learning or notebook state.

### W02 Verify publication boundaries and discovery

**Status:** Partial. Locally, every private path returns 404, sitemap and llms targets resolve, discovery headers and media types pass, and ByteRush/Plan links are labelled with no Runs links ([labthrift#4](https://github.com/zemdregon/labthrift/pull/4)). The live run, the D01 wording pass and the final C01 audit remain. **Owner:** website publishing and QA. **Dependency:** D01 and C01 for final catalog/reference audit.

Review the root asset directory and publishing exclusions. Verify docs, migrations, credentials, dependencies, and local runtime state cannot be served. Check cache/security/content headers, workers.dev noindex behavior, homepage Link headers, catalog media type, OpenAPI, llms text, robots, sitemap, and correct ByteRush/Plan destinations. Check responsive reading and honest product labels.

**Done when:** artifact inspection and direct route checks establish publication boundaries; discovery targets and app links work; relevant Runs learning links are corrected without erasing historical provenance. Record actual serving behavior rather than relying only on ignore files.

### W03 Verify aggregate metrics and failure behavior

**Status:** Partial. Fixtures in [labthrift#4](https://github.com/zemdregon/labthrift/pull/4) cover bucketing, normalization, eligibility, bot heuristics and write failure, and the fix stops redirects being double counted. The design documents already call classification heuristic and keep platform logs separate. Deploy and a live read of the D1 table remain. **Owner:** website backend and QA. **Dependency:** local metrics fixtures.

Test UTC-day/path/kind bucketing, normalization and length limits, eligible methods/statuses, asset/direct-Markdown exclusions, bot classification, and aggregate increments. Inject a metrics-write failure and confirm page serving succeeds. Review Worker logs separately from the D1 table's privacy properties.

**Done when:** fixtures demonstrate the counting contract and best-effort failure handling; stored counters contain no visitor profiles; documentation describes human/bot classification as heuristic and does not equate aggregate D1 metrics with absence of platform logs.

## Phase 5 Make completion repeatable

### X01 Establish repeatable checks for each repository

**Status:** Partial. ByteRush chose CI: `.github/workflows/ci.yml` runs lint, Worker typecheck, tests and build on every pull request, documented in [test coverage](design/test-coverage.md). The website has `npm test` and `npm run check [base-url]` as a documented manual release gate ([labthrift#4](https://github.com/zemdregon/labthrift/pull/4)). Plan remains open. **Owner:** maintainers of all three repositories. **Dependency:** B03, P01–P04, W01–W03 as their checks become available.

Keep commands alongside the code. ByteRush already has `npm test`, `npm run lint`, `npm run typecheck:worker`, `npm run build`, and `node tests/sync-integration.mjs` for a running local preview. The integration script's `--remote` option targets live ByteRush and must remain an explicit production test operation. The website now has `npm test` and `npm run check [base-url]` ([labthrift#4](https://github.com/zemdregon/labthrift/pull/4)). Plan still needs documented, repeatable checks for the contracts above; its package scripts currently do not expose a test suite.

**Done when:** a fresh checkout can run the documented local validation with disposable fixtures, missing prerequisites fail clearly, and meaningful checks can be run before release. CI is recommended but not required by the original documents; explicitly choose CI or a documented manual release gate. Do not embed production credentials or destructive retirement operations in ordinary tests.

### X02 Resolve open product and operating decisions

**Status:** Decision. **Owner:** product and infrastructure maintainer. **Dependency:** findings from the verification tasks.

| Decision | Proposed disposition until explicitly changed | Closure evidence |
|---|---|---|
| Service availability, latency, recovery objectives | No numerical promises yet; decide what can be measured and supported for each product | Document chosen targets and validation, or explicit deferral with a revisit trigger; stronger guarantees require implementation work |
| Passkey loss and recovery expectations | Explain existing recovery limits; do not add email recovery implicitly | Product-specific recovery/support wording and any separately approved recovery design |
| Adoption metrics and privacy | Keep current aggregates; no new learner funnel tracking by default | Adopt/defer/reject additional events, with purpose, fields, retention, and privacy decision before instrumentation |
| Shared SSO or inventory synchronization | Defer; accounts/databases remain independent | Record the boundary; adoption would require a new ADR, consent/ownership mapping, conflicts, migration, and recovery plan |
| Plan module extraction | Defer unless needed for a concrete verified change | Document whether extraction is necessary for tests/CAS; avoid an unrelated rewrite |
| Catalog lazy loading | Defer while the bundled catalog meets needs | Revisit on measured size/offline constraints; do not replace offline behavior without acceptance criteria |
| Prism walkthrough expansion | Resolve through C02; Prism is PhotoPrism (decided 2026-10-04) | Explicitly accept its introduction scope or specify the new content and validation |
| Commercial models, CMS, provisioning, monitoring, native apps | Outside this completion baseline | Do not count an excluded or speculative feature as missing approved functionality |

Closing this task requires explicit dispositions, not implementation of every possible future feature. A decision that adopts new scope adds task IDs, dependencies, and acceptance criteria here before it can be marked complete.

### X03 Record final cross-product acceptance

**Status:** Open. **Owner:** release maintainer. **Dependency:** every required task complete, proposals explicitly resolved, and any adopted work deployed and verified.

Run the three-product journey: read a Labthrift guide, open and resume the matching ByteRush project, follow clearly labeled Plan instructions, and use Plan as a separate notebook. Recheck healthy domains and authenticated boundaries, independent accounts/databases, no automatic gear installation, and the completed Runs inventory. Deploy only repositories with runtime/content changes; documentation-only updates do not require redeployment.

**Done when:** every requirement group below links to evidence containing the tested commit, environment, date, result, and remaining limits. Record deployed versions separately from commits and local results. Update affected release-status files and ADR execution notes, verify guide links and repository documentation links, and close the roadmap only after remaining limitations have an explicit disposition.

## Requirement coverage

Each numbered requirement appears once in the tables below. Tasks often contribute to more than one requirement; the mapping identifies the work needed to establish or retain acceptance. Existing implementation evidence is preserved through the recorded baseline, not represented as new construction work.

### ByteRush requirement coverage

| Requirement IDs | Completion work |
|---|---|
| BR-B1, PR-B1, SR-B1, SR-B2 | Recorded merge baseline; C01, C02, B03 |
| BR-B2, PR-B8, FR-B12, SR-B5, SR-B6, SR-B8 | B02, B03 |
| BR-B3 | R01, X03 |
| BR-B4, PR-B7, FR-B8, FR-B11 | C02, B01, B03 |
| BR-B5 | P01, W01, X03 |
| PR-B2, FR-B2, FR-B3, FR-B4, FR-B5, FR-B6, FR-B7, SR-B3, SR-B11 | B01, B03 |
| PR-B3, PR-B4, PR-B5, PR-B6, FR-B1 | B03 |
| FR-B9, FR-B10, SR-B4, SR-B12 | B03 |
| FR-B13, SR-B7, SR-B9, SR-B10 | B02, B03 |

### Plan requirement coverage

| Requirement IDs | Completion work |
|---|---|
| BR-P1, BR-P4, PR-P8, SR-P8 | R01, X03; preserve separate ownership throughout |
| BR-P2, PR-P1, PR-P2, PR-P3, FR-P3, FR-P4, SR-P1, SR-P2 | P01 |
| BR-P3, PR-P5, FR-P6, FR-P7, SR-P3, SR-P4 | P02 |
| BR-P5, SR-P7 | P04 |
| PR-P4, FR-P5, SR-P5 | P01; P05 adds stronger concurrency semantics only if adopted |
| PR-P6, FR-P1, FR-P2, FR-P8, FR-P9, SR-P6 | P03 |
| PR-P7, FR-P10, SR-P9 | P04 |

### Website requirement coverage

| Requirement IDs | Completion work |
|---|---|
| BR-W1, PR-W1, PR-W4, FR-W1, SR-W1, SR-W2 | C01, W01 |
| BR-W2, BR-W3, PR-W2, PR-W3, SR-W7 | D01, W02, X03 |
| BR-W4, PR-W5, FR-W2, FR-W3, FR-W4, SR-W3, SR-W4 | W01 |
| BR-W5, FR-W7, FR-W8, SR-W5 | W03 |
| PR-W6, PR-W7, FR-W5, FR-W6, FR-W9, FR-W10, SR-W6 | W02 |
| SR-W8 | R01, X03 |

## Design and decision coverage

TDD, SDD, HLD, and LLD describe the same systems at different levels; they are not separate applications to build. Their modules, data models, interfaces, algorithms, and failure handling are exercised by the tasks below. Update all affected views when an implementation changes their contracts.

| Product | Technical design closure | Architecture decisions retained or resolved |
|---|---|---|
| ByteRush | C02, B01–B03 cover content, feed, traversal, store, auth, rewards, CAS, reset and PWA; R01/X03 cover rollout/retirement | ADR-B001 through ADR-B005 retained and checked by D01/B01–B03; ADR-B006 execution closed through R01 |
| Plan | P01–P04 cover SPA, sanitizers, ownership, portable model, auth/enrollment, D1, offline and metrics; P05 addresses the specific save-race proposal | ADR-P001, ADR-P002, ADR-P003, ADR-P005 retained; ADR-P004 disposition and any successor implementation recorded in P05 |
| Website | C01 and W01–W03 cover content/twins, request pipeline, negotiation, headers, discovery, aggregate SQL, exclusions and failure handling | ADR-W001 through ADR-W004 retained and verified; ADR-W005 retirement execution closed through R01/X03 |

### Source documents

| Document | ByteRush | Plan | Website |
|---|---|---|---|
| BRD | [Business](design/BRD.md) | [Business](https://github.com/zemdregon/labthrift-plan/blob/main/docs/design/BRD.md) | [Business](https://github.com/zemdregon/labthrift/blob/main/docs/design/BRD.md) |
| PRD | [Product](design/PRD.md) | [Product](https://github.com/zemdregon/labthrift-plan/blob/main/docs/design/PRD.md) | [Product](https://github.com/zemdregon/labthrift/blob/main/docs/design/PRD.md) |
| FRD | [Functions](design/FRD.md) | [Functions](https://github.com/zemdregon/labthrift-plan/blob/main/docs/design/FRD.md) | [Functions](https://github.com/zemdregon/labthrift/blob/main/docs/design/FRD.md) |
| SRS | [Software requirements](design/SRS.md) | [Software requirements](https://github.com/zemdregon/labthrift-plan/blob/main/docs/design/SRS.md) | [Software requirements](https://github.com/zemdregon/labthrift/blob/main/docs/design/SRS.md) |
| TDD | [Technical design](design/TDD.md) | [Technical design](https://github.com/zemdregon/labthrift-plan/blob/main/docs/design/TDD.md) | [Technical design](https://github.com/zemdregon/labthrift/blob/main/docs/design/TDD.md) |
| SDD | [Software design](design/SDD.md) | [Software design](https://github.com/zemdregon/labthrift-plan/blob/main/docs/design/SDD.md) | [Software design](https://github.com/zemdregon/labthrift/blob/main/docs/design/SDD.md) |
| HLD | [High-level design](design/HLD.md) | [High-level design](https://github.com/zemdregon/labthrift-plan/blob/main/docs/design/HLD.md) | [High-level design](https://github.com/zemdregon/labthrift/blob/main/docs/design/HLD.md) |
| LLD | [Low-level design](design/LLD.md) | [Low-level design](https://github.com/zemdregon/labthrift-plan/blob/main/docs/design/LLD.md) | [Low-level design](https://github.com/zemdregon/labthrift/blob/main/docs/design/LLD.md) |
| ADR | [Decisions](design/ADR.md) | [Decisions](https://github.com/zemdregon/labthrift-plan/blob/main/docs/design/ADR.md) | [Decisions](https://github.com/zemdregon/labthrift/blob/main/docs/design/ADR.md) |

Release records: [ByteRush](design/release-status.md), [Plan](https://github.com/zemdregon/labthrift-plan/blob/main/docs/design/release-status.md), [website](https://github.com/zemdregon/labthrift/blob/main/docs/design/release-status.md).

## Completion rule

The roadmap is complete when all 100 baseline requirements have acceptance evidence, required open/partial/blocked tasks are closed, every proposed change has an explicit disposition, adopted changes have their own acceptance evidence, and Runs retirement is fully verified. A deferred proposal remains a documented limitation or future option; it cannot hide a failing baseline requirement. Each release must retain independent accounts, honest learning versus installation language, source provenance, and distinct local, committed, deployed, and live status.

Start with **D01 and C01**, request the missing authorization for **R01** only if the earlier authorization attempt is no longer usable, and arrange the remaining device/passkey checks. Work on the Plan and website verification suites independently while those external prerequisites are pending.
