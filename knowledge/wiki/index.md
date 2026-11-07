# Nexorium Core knowledge wiki — index

Catalog of every page, with one line each. Claude updates it on every ingest. Read it first for any question; the schema is in [knowledge/CLAUDE.md](../CLAUDE.md).

## Start here

- [Overview](overview.md) — what Nexorium Core is meant to be, what the code does, where they diverge
- [Contradictions register](contradictions.md) — 19 entries (6 high, 8 medium, 5 low), all open
- [Glossary](glossary.md) — CLAUDE.md terms ↔ five-layer docs ↔ README ↔ Prisma models
- [Log](log.md) — chronological record of ingests, queries, lint passes

## Concepts

- [Six pillars](concepts/pillars.md) — pillars mapped to UI routes, API routes and open entries
- [Five-layer model](concepts/five-layer-model.md) — the documented canonical topology model and its integrity rules
- [Flow model](concepts/flow-model.md) — stages, environment links, flow templates; transition validation not wired in
- [Connector framework](concepts/connector-framework.md) — ingestion lifecycle, connector generations, provenance, gaps
- [Snapshot and drift](concepts/snapshot-and-drift.md) — capture, compare, change detection; Node/Edge only today
- [Manual override protection](concepts/manual-override-protection.md) — invariant 8; conflict record exists, never written
- [PROD_RO read-only](concepts/prod-ro-read-only.md) — two meanings of read-only; guarded at the environment record only
- [Readiness](concepts/readiness.md) — five-part definition; current evaluation passes every rule

## Entities

- [Environment](entities/environment.md) — the landscape both topology models, snapshots and links hang off
- [Component instance (Deployment)](entities/component-instance.md) — a component deployed in exactly one environment
- [Deployed version](entities/deployed-version.md) — project_version (required), vendor_version; a row per ingestion run
- [Connection (Interface)](entities/connection.md) — directed integration between instances; ingested or manual, never inferred
- [Environment snapshot](entities/environment-snapshot.md) — JSON capture with a hash; Node/Edge graph only
- [Blueprint](entities/blueprint.md) — expected state as a JSON spec; alignment records
- [Release](entities/release.md) — target component versions grouped by name and version
- [RACI mapping](entities/raci-mapping.md) — person, role, asset; foreign key limits assets to environments; four ownership models
- [Node and Edge graph](entities/node-and-edge.md) — the first topology model, still used by snapshots and enrichments

## Sources

| Page | Source | Ingested |
|------|--------|----------|
| [Root CLAUDE.md](sources/claude-md.md) | `CLAUDE.md` | 2026-11-07 |
| [README](sources/readme.md) | `README.md` | 2026-11-07 |
| [Source ingestion strategy](sources/source-ingestion-strategy.md) | `docs/source-ingestion-strategy.md` | 2026-11-07 |
| [Cost and budget module](sources/cost-budget.md) | `docs/cost-budget.md` | 2026-11-07 |
| [Prisma schema](sources/prisma-schema.md) | `prisma/schema.prisma`, migrations | 2026-11-07 |
| [Implementation scan](sources/code-scan-40ab818.md) | 28 code and config files at commit `40ab818` | 2026-11-07 |
| [CI install failure](sources/ci-install-failure-2026-11-07.md) | `knowledge/raw/2026-11-07-npm-ci-lockfile-error.md` | 2026-11-07 |
