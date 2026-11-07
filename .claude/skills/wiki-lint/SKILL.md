---
name: wiki-lint
description: Health-check the Nexorium Core knowledge wiki (knowledge/wiki). Runs the deterministic lint, refreshes pages whose sources changed, and does a semantic pass for contradictions, gaps and missing pages.
disable-model-invocation: true
---

1. Read `knowledge/CLAUDE.md`. Follow its Lint and Refresh workflows.
2. Run `npm run wiki:lint`. Fix every error.
3. For each `stale-source` warning: compare the cited and current blobs, update the affected pages, then log a `refresh` entry.
4. Semantic pass across pages: contradictions, superseded claims, concepts without a page, missing cross-links, sources worth adding. Record new contradictions in `knowledge/wiki/contradictions.md`.
5. Re-run `npm run wiki:lint` until it reports 0 errors. Append a `lint` entry to `knowledge/wiki/log.md`.
6. Report to the user: what changed, new contradictions, decisions needed (highest severity first).
