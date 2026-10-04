# Runs content provenance

Imported from `zemdregon/labthrift-runs` commit `0183a2f` (the source checkout at import). The catalog contains all 17 project graphs, 168 nodes and 30 branching points. Project IDs, node IDs, edges, status effects, recommendation triggers and source-guide URLs are retained.

On 2026-10-04 `prism-intro` was expanded from the imported 5-node introduction into a 16-node PhotoPrism first-install walkthrough (roadmap C02), bringing the catalog to 179 nodes and 33 branching points. Its original nodes and edges remain valid so saved progress still loads.

ByteRush changes screen references from Runs Today/Continue to Feed/Resume, labels the separate Labthrift Plan instructions, formats existing command paragraphs for the shared code block, and clarifies that finishing a walkthrough does not verify installation. No old accounts, credentials, progress or database data are copied.

`schema.json` and `stack-items.json` preserve the source content vocabulary. `scripts/validate-runs-source.mjs` is the original Runs validator with adapted paths. `tests/projects.test.ts` adds complete topic/gear mapping and terminal-path validation. ByteRush maps `pihole` to `pi-hole` and source status values to `planned`, `have`, and `pass` only when an explicit action carries that effect.

The beginner sequence and gear-triggered recommendations are adapted in `src/lib/projects.ts`; topic mappings connect source themes to ByteRush topic IDs. Original source rules are retained in `recommendation-source.txt` for traceability. The runtime implementation adds followed-topic ranking and stable feed cadence.
