# ByteRush — Software Design Description

> Baseline: 2026-10-03. Product: ByteRush. Repository: `zemdregon/tech-dose`. Source-grounded design baseline; deployment and acceptance evidence is tracked separately in [release status](release-status.md).

## Component responsibilities
| Component | Responsibility |
|---|---|
| `src/content/projects/*.json` | Imported graph bodies, IDs and source URLs |
| `src/lib/projects.ts` | Catalog, topic map, beginner sequence, gear-aware recommendations |
| `src/lib/feed.ts` | Pure construction of a stable session feed |
| `src/lib/projectProgress.ts` | Explicit traversal and gear effects |
| `src/lib/syncTypes.ts` | Versioned contract, validation, normalization, rewards, merge/reset |
| `src/lib/store.ts` | Immediate persistence, lesson/project actions, account-owned sync queue |
| `src/components/feed/ProjectView.tsx` | Inline steps, navigation, completion and saved-state feedback |
| `worker/index.ts` | Authenticated sync HTTP routes |
| `worker/db.ts` | Optimistic snapshot updates and mirror batch |
| `public/sw.js`, `scripts/cache-assets.mjs` | Versioned offline shell and build asset precache |

## Runtime collaboration
UI actions invoke the store, which applies the pure project reducer and persists the result. A debounced sync sends the snapshot only after the account handshake. The server validates and merges against the latest snapshot using compare-and-swap retries. The client merges the response only while the originating account remains current.

Project completion/reward membership grows within a reset generation. Resume position does not: the newest update wins the whole cursor/history tuple, allowing backtracking and replay without resurrecting discarded branches. Reset advances a generation so pre-reset devices cannot grow old state back.

## Presentation design
Each project is a feed section, with a scrollable body and explicit controls. Source guides are external links. The shared glossary and code block components remain available; sounds follow the existing mute setting. Completion feedback is inline and restrained rather than opening another learning surface.

## Extension points
Add a graph only with topic mappings, known gear references, valid terminal paths and updated count expectations. Changing reward values or merge semantics requires a schema compatibility review. Plan-specific instructions must remain labeled and must not call Plan APIs with ByteRush credentials.
