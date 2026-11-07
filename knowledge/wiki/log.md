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

## [2026-11-07] lint | Independent fact-check of the register: 8 corrections, C-020 opened

- A separate Claude agent re-verified every non-inference claim in the register, plus about 45 claims on four other pages, against the code. Quotes, counts and absence claims all held. 16 of the 19 entries had no problems.
- Corrected:
  - C-003: `notes` is also overwritten on hosts and endpoints; three fields change even when the source omits them.
  - C-004: the snapshot diff does compare Node/Edge fields; what it misses is five-layer data and any version field.
  - C-006: only the dependency-paths page sends a request (and gets a 404); the blast-radius fetch is never called.
  - Matching keys in [Connector framework](concepts/connector-framework.md).
  - Version wording in [Readiness](concepts/readiness.md), [Deployed version](entities/deployed-version.md), [Release](entities/release.md), [Connection](entities/connection.md) and [Environment snapshot](entities/environment-snapshot.md).
- Opened C-020 (medium): many ID columns have no foreign key, against "No dangling references allowed". The fact-check found the [Five-layer model](concepts/five-layer-model.md) exception list incomplete; the full list was verified in `prisma/schema.prisma`.
