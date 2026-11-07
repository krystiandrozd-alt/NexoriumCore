# Log

Append-only and chronological; newest entries at the bottom. Entry header format: `## [YYYY-MM-DD] <ingest|query|lint|refresh|schema> | <title>`. List recent entries with `grep "^## \[" knowledge/wiki/log.md | tail -5`.

## [2026-11-07] schema | Wiki created from the LLM Wiki pattern

- Instantiated Andrej Karpathy's "LLM Wiki" idea file for this repository. Layers: sources (repository files and `knowledge/raw/`), wiki (`knowledge/wiki/`), schema (`knowledge/CLAUDE.md`).
- Changes from the original pattern: provenance pinned by git blob id (sources in a codebase change, unlike the gist's immutable raw folder); a contradictions register with severity; a deterministic lint (`npm run wiki:lint`) that also runs in `npm test`; a confidentiality rule because the repository is public.
- Claude Code skills `/wiki-ingest`, `/wiki-query`, `/wiki-lint`. Root `CLAUDE.md` gained a `<knowledge_base>` pointer.

## [2026-11-07] ingest | Bootstrap: CLAUDE.md, README, docs, Prisma schema, implementation scan

- Sources: root `CLAUDE.md`, `README.md`, `docs/source-ingestion-strategy.md`, `docs/cost-budget.md`, `prisma/schema.prisma` with migrations, targeted code reading at commit `40ab818`, and one raw source (`2026-11-07-npm-ci-lockfile-error.md`).
- Created: overview, glossary, contradictions register, 7 source pages, 8 concept pages, 9 entity pages.
- Opened C-001 to C-019 (6 high, 8 medium, 5 low).

## [2026-11-07] lint | First pass: 0 errors, 0 warnings

- Deterministic lint clean after the bootstrap.
- Semantic gaps recorded for later ingests: governance, insight, organisation, cost and security services; flow map UI behaviour; test coverage of the core flows in root `CLAUDE.md`. See the implementation scan's "Not yet read" list.
