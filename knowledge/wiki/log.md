# Log

Append-only and chronological; newest entries at the bottom. Entry header format: `## [YYYY-MM-DD] <ingest|query|lint|refresh|schema> | <title>`. List recent entries with `grep "^## \[" knowledge/wiki/log.md | tail -5`.

## [2026-11-07] schema | Wiki created from the LLM Wiki pattern

- Instantiated Andrej Karpathy's "LLM Wiki" idea file for this repository. Layers: sources (repository files and `knowledge/raw/`), wiki (`knowledge/wiki/`), schema (`knowledge/CLAUDE.md`).
- Changes from the original pattern: provenance pinned by git blob id (sources in a codebase change, unlike the gist's immutable raw folder); a contradictions register with severity; a deterministic lint (`npm run wiki:lint`) that also runs in `npm test`; a confidentiality rule because the repository is public.
- Claude Code skills `/wiki-ingest`, `/wiki-query`, `/wiki-lint`. Root `CLAUDE.md` gained a `<knowledge_base>` pointer.
