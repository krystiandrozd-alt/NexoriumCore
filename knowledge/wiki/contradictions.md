---
title: Contradictions register
type: register
summary: Conflicts between sources, and between documented intent and the code. Claude records them; the user decides how each one is resolved.
sources:
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: README.md
    blob: "b9478f9750ab"
  - path: docs/source-ingestion-strategy.md
    blob: "5abe417f9120"
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: prisma/seed/index.ts
    blob: "f7f803fd4ee5"
  - path: prisma/migrations/20260123131252_init/migration.sql
    blob: "d222d03eb62b"
  - path: prisma/migrations/20260126000000_add_projects_entity/migration.sql
    blob: "060eba497bf0"
  - path: package.json
    blob: "16a340f70e2d"
  - path: .gitignore
    blob: "2b6904978a4d"
  - path: .github/workflows/ci.yml
    blob: "c6abac2703d3"
  - path: knowledge/raw/2026-11-07-npm-ci-lockfile-error.md
    blob: "63c8d364489b"
  - path: src/lib/connectors/v2/base-connector.ts
    blob: "c8d9de1a3ef0"
  - path: src/lib/connectors/index.ts
    blob: "fed5ffa416c1"
  - path: src/app/api/connectors/run/route.ts
    blob: "7c72abb291c4"
  - path: src/app/api/connectors/route.ts
    blob: "39f58a6ed13e"
  - path: src/lib/services/snapshot.ts
    blob: "5158b5bd7173"
  - path: src/app/api/snapshots/route.ts
    blob: "95326f74f458"
  - path: src/lib/services/impact/index.ts
    blob: "68fa35f76b91"
  - path: src/lib/services/flow-map.ts
    blob: "4300d996f9a3"
  - path: "src/app/api/governance/readiness/[envId]/route.ts"
    blob: "f7b12a8480a9"
  - path: src/app/dashboard/governance/readiness/page.tsx
    blob: "71ba2999c443"
  - path: src/app/dashboard/governance/promotion-readiness/page.tsx
    blob: "249e59fb4f34"
  - path: "src/app/api/environments/[id]/route.ts"
    blob: "b85a42cdce34"
  - path: "src/app/api/environments/[id]/map/nodes/route.ts"
    blob: "eb8e1aeeb8bd"
  - path: "src/app/api/environments/[id]/map/edges/route.ts"
    blob: "6195069ddfa9"
  - path: "src/app/api/nodes/[id]/enrichments/route.ts"
    blob: "bb41a9ab6782"
  - path: src/app/api/flow-links/route.ts
    blob: "72b26c7a50d1"
  - path: src/app/api/organisation/raci/route.ts
    blob: "31b267e6b646"
  - path: src/app/dashboard/impact/blast-radius/page.tsx
    blob: "5472f99926f5"
  - path: src/app/dashboard/impact/dependency-paths/page.tsx
    blob: "5ba43b116274"
  - path: src/app/dashboard/layout.tsx
    blob: "6ccf804ef018"
updated: 2026-11-07
---

# Contradictions register

Each entry records claims that cannot all be true, with their sources. Claude never resolves an entry silently: the user decides, then a refresh marks it `resolved`, or `accepted` for a deliberate, documented deviation. Format and severity scale: [schema conventions](../CLAUDE.md).

First pass: 2026-11-07. Sources: [root CLAUDE.md](sources/claude-md.md), [README](sources/readme.md), [ingestion strategy](sources/source-ingestion-strategy.md), [Prisma schema](sources/prisma-schema.md) and targeted code reading at commit `40ab818` ([implementation scan](sources/code-scan-40ab818.md)). Absence claims ("no reference", "nothing calls") are scoped to that commit.

## Summary

| ID | Severity | Status | Title |
|----|----------|--------|-------|
| C-001 | high | open | Readiness passes every rule the database can hold |
| C-002 | high | open | Ingestion runs never create a snapshot |
| C-003 | high | open | Ingestion can overwrite manual edits; conflicts are never recorded |
| C-004 | high | open | Snapshots capture only the Node/Edge graph |
| C-005 | high | open | PROD_RO write protection covers only the environment record |
| C-006 | high | open | Impact pages call API routes that do not exist |
| C-007 | medium | open | Migrations create 9 of the 60 tables |
| C-008 | medium | open | Flow-link transitions are not validated |
| C-009 | medium | open | RACI mappings can only reference environments |
| C-010 | medium | open | "Environments belong to a Stage" is not enforced |
| C-011 | medium | open | Connector types differ across docs, README, schema and code |
| C-012 | medium | open | Three vocabularies for one canonical model |
| C-013 | medium | open | Re-running ingestion appends version rows |
| C-014 | medium | open | CI cannot install dependencies |
| C-015 | low | open | JSON columns on core entities |
| C-016 | low | open | Tone rules ban "insight" and "intelligence"; the product uses both |
| C-017 | low | open | README describes an earlier product |
| C-018 | low | open | Snapshot history can be deleted |
| C-019 | low | open | Provenance is incomplete for endpoints, versions and connections |

## C-001: Readiness passes every rule the database can hold
- **Status:** open
- **Severity:** high
- **Claims:**
  - Root `CLAUDE.md` `<readiness_definition>`: readiness means "Structural completeness", "Version validity", "Snapshot integrity", "No broken topology" and "Governance alignment (if blueprint exists)"; "Scoring must be deterministic."
  - [`prisma/schema.prisma`](../../prisma/schema.prisma) `enum GovernanceRuleType`: `VERSION_CHECK`, `COMPONENT_PRESENCE`, `CONNECTION_REQUIRED`, `DATA_CLASSIFICATION`, `CUSTOM`. [`prisma/seed/index.ts`](../../prisma/seed/index.ts) creates rules of the first three types.
  - [`GET /api/governance/readiness/[envId]`](../../src/app/api/governance/readiness/[envId]/route.ts), `evaluateRule()`: handles only `SNAPSHOT_EXISTS`, `MIN_COMPONENTS` and `NO_PROD_TYPE`, none of which is a `GovernanceRuleType` value. Every other type reaches `default`, which returns `passed: true` with "evaluation not implemented - defaulting to pass".
- **Assessment:** **Inference:** every evaluation passes, so `score` is 100 and `isReady` is true for every environment. Both readiness pages (`/dashboard/governance/readiness`, `/dashboard/governance/promotion-readiness`) call this route. The result is deterministic, but it measures nothing.
- **Decision needed:** evaluate the `GovernanceRuleType` values (and the five readiness components), and report unimplemented rule types as "not evaluated" rather than passed.
- **Pages:** [Readiness](concepts/readiness.md), [Six pillars](concepts/pillars.md)

## C-002: Ingestion runs never create a snapshot
- **Status:** open
- **Severity:** high
- **Claims:**
  - Root `CLAUDE.md` `<architecture_principles>`: "Every ingestion run creates a version snapshot." `<connector_framework>`: each connector implements `fetch()`, `map()`, `upsert()`, `snapshot()`, `report()`.
  - [`docs/source-ingestion-strategy.md`](../../docs/source-ingestion-strategy.md), "Connector Run Lifecycle": `fetch()` → `map()` → `upsert()` → `report()`. "Snapshot Diffing: Compare ingestion runs to detect drift" is listed under "Future Considerations (Post-MVP)".
  - [`BaseConnectorV2.run()`](../../src/lib/connectors/v2/base-connector.ts): fetch → map → upsert (skipped on `dryRun`), then updates the `ConnectorRun` row. The class has no `snapshot()` method, and no file under `src/lib/connectors/` references snapshots.
- **Assessment:** the docs and the code agree; root `CLAUDE.md` states a rule that is not built. Snapshots are created only by `POST /api/snapshots`.
- **Decision needed:** add a snapshot step to `run()`, or mark the rule in `CLAUDE.md` as target state.
- **Pages:** [Connector framework](concepts/connector-framework.md), [Snapshot and drift](concepts/snapshot-and-drift.md)

## C-003: Ingestion can overwrite manual edits; conflicts are never recorded
- **Status:** open
- **Severity:** high
- **Claims:**
  - Root `CLAUDE.md` invariant 8: "Manual overrides must never be silently overwritten by ingestion." Principle 5: "Manual enrichment must be audit-trailed."
  - `docs/source-ingestion-strategy.md`, "Conflict Handling": when a connector attempts to update a manually-edited field, the conflict is detected, an `IngestionConflict` record is created, the UI surfaces it, and the user chooses keep existing, accept incoming or manual merge.
  - `prisma/schema.prisma` defines `IngestionConflict` (`wasManuallyEdited`, `resolution`: `KEEP_EXISTING`, `ACCEPT_INCOMING`, `MANUAL_MERGE`). No file under `src/` references `ingestionConflict`.
  - `BaseConnectorV2.upsert()` updates matched rows field by field, `notes` included for network contexts, component instances and connections, without checking for earlier manual edits.
- **Assessment:** **Inference:** a manual value is overwritten whenever the source supplies a value for that field. Prisma leaves out fields that are `undefined`, so fields the source omits survive.
- **Decision needed:** conflict detection in `upsert()`, or a fixed list of fields ingestion may write.
- **Pages:** [Manual override protection](concepts/manual-override-protection.md), [Connector framework](concepts/connector-framework.md)

## C-004: Snapshots capture only the Node/Edge graph
- **Status:** open
- **Severity:** high
- **Claims:**
  - Root `CLAUDE.md` `<versioning_rules>`: "Diff must detect: Version changes, Endpoint changes, Interface changes, Component additions/removals". Invariant 7: "All version changes must be traceable."
  - [`createSnapshot()`](../../src/lib/services/snapshot.ts) serialises `nodes` (with database metadata and test data sets), `edges`, `databases` and `testDataSets`. It reads no `ComponentInstance`, `Endpoint`, `DeployedVersion` or `Connection` rows.
  - [`detectChanges()`](../../src/lib/services/impact/index.ts) compares `snapshotData.components` (id, name, version), a key `createSnapshot()` never writes. The seed creates no snapshots.
- **Assessment:** **Inference:** snapshot diffs cannot see changes to versions, endpoints or interfaces, and `detectChanges()` returns empty results for every snapshot the application creates.
- **Decision needed:** define the snapshot payload on the canonical model (decide C-012 first), then align `createSnapshot()`, the snapshot diff and `detectChanges()`.
- **Pages:** [Snapshot and drift](concepts/snapshot-and-drift.md), [Environment snapshot](entities/environment-snapshot.md), [Deployed version](entities/deployed-version.md)

## C-005: PROD_RO write protection covers only the environment record
- **Status:** open
- **Severity:** high
- **Claims:**
  - Root `CLAUDE.md` invariant 6: "Production environments (PROD_RO) are strictly read-only."
  - [`/api/environments/[id]`](../../src/app/api/environments/[id]/route.ts): `PUT`, `PATCH` and `DELETE` return 403 when `type === 'PROD_RO'`.
  - These write routes contain no PROD_RO check: [`POST /api/environments/[id]/map/nodes`](../../src/app/api/environments/[id]/map/nodes/route.ts) (creates `ManualFlowMapNode`), [`POST /api/environments/[id]/map/edges`](../../src/app/api/environments/[id]/map/edges/route.ts) (creates `ManualFlowMapEdge`), [`POST /api/nodes/[id]/enrichments`](../../src/app/api/nodes/[id]/enrichments/route.ts). There is no shared guard: elsewhere under `src/app/api/`, `PROD_RO` appears only in Zod enums and the readiness rule `NO_PROD_TYPE`.
- **Assessment:** **Inference:** manual map elements and enrichments can be written to a PROD_RO environment. Connector runs and snapshots against PROD_RO only read production, which fits "connected in READ-ONLY mode", so they are not counted here.
- **Decision needed:** one server-side read-only guard on every mutation route, with a test per route.
- **Pages:** [PROD_RO read-only](concepts/prod-ro-read-only.md), [Environment](entities/environment.md)

## C-006: Impact pages call API routes that do not exist
- **Status:** open
- **Severity:** high
- **Claims:**
  - Root `CLAUDE.md` Impact pillar: entry/exit detection, dependency path analysis, blast radius, change detection, stability index. "Impact must be computed only from stored topology + snapshot state."
  - [`/dashboard/impact/blast-radius`](../../src/app/dashboard/impact/blast-radius/page.tsx) fetches `/api/impact/blast-radius`; [`/dashboard/impact/dependency-paths`](../../src/app/dashboard/impact/dependency-paths/page.tsx) fetches `/api/impact/entry-exit/<environmentId>`. There is no `src/app/api/impact/` directory.
  - [`src/lib/services/impact/index.ts`](../../src/lib/services/impact/index.ts) exports `getEntryExitPoints`, `calculateBlastRadius`, `calculateStabilityScore`, `getDependencyPaths` and `detectChanges`. Nothing outside that file calls them.
- **Assessment:** **Inference:** both pages get 404 responses, and the impact service is unreachable from the UI.
- **Decision needed:** add thin, typed route handlers over the service, or hide the pages until they exist.
- **Pages:** [Six pillars](concepts/pillars.md), [Snapshot and drift](concepts/snapshot-and-drift.md)

## C-007: Migrations create 9 of the 60 tables
- **Status:** open
- **Severity:** medium
- **Claims:**
  - Root `CLAUDE.md` `<standards_and_conventions>`: "Use migrations".
  - [`20260123131252_init`](../../prisma/migrations/20260123131252_init/migration.sql) creates `environments`, `nodes`, `edges`, `database_metadata`, `test_data_sets`, `refresh_records`, `evidence`, `environment_snapshots`; [`20260126000000_add_projects_entity`](../../prisma/migrations/20260126000000_add_projects_entity/migration.sql) creates `projects`. `prisma/schema.prisma` defines 60 models.
  - `README.md`, Getting Started step 4: `npx prisma db push`. [`ci.yml`](../../.github/workflows/ci.yml), E2E job: `npx prisma migrate deploy`.
- **Assessment:** **Inference:** databases have been built with `db push`. A database built from migrations, as the CI E2E job does, lacks the five-layer, flow, governance, organisation, configuration and cost tables.
- **Decision needed:** a baseline migration from the current schema, then migrations as the only path.
- **Pages:** [Prisma schema](sources/prisma-schema.md), [Five-layer model](concepts/five-layer-model.md)

## C-008: Flow-link transitions are not validated
- **Status:** open
- **Severity:** medium
- **Claims:**
  - Root `CLAUDE.md` `<flow_model_rules>`: "Flow templates define allowed transitions." "Invalid transitions must be blocked unless override permission exists."
  - [`validateFlowLink()`](../../src/lib/services/flow-map.ts) checks a link against `ACTIVE` flow templates, then stage sort order. Nothing calls it.
  - [`POST /api/flow-links`](../../src/app/api/flow-links/route.ts) requires `EDIT_ENVIRONMENT`, validates the body with Zod, rejects self-links, then creates the link.
  - `validateFlowLink()` also returns valid when either environment has no stage: "Environments without stages can be linked freely".
- **Assessment:** **Inference:** any link between two different environments is accepted, backwards links (for example UAT → DEV) included. Wiring the function in would still leave a gap, because stages are optional (C-010).
- **Decision needed:** validate on create and update, add an explicit override permission, and decide the no-stage rule.
- **Pages:** [Flow model](concepts/flow-model.md)

## C-009: RACI mappings can only reference environments
- **Status:** open
- **Severity:** medium
- **Claims:**
  - Root `CLAUDE.md` Organisation pillar: "RACI mapping (R/A/C/I)", "Ownership views", "Orphaned asset detection". "RACI persistence" is a core flow to protect.
  - `prisma/schema.prisma`: `RACIMapping.entityType` is `AssetEntityType` (`ENVIRONMENT`, `COMPONENT`, `COMPONENT_INSTANCE`, `HOST`, `CONNECTION`), but its `environment` relation makes `entityId` a foreign key to `environments` (constraint name `raci_environment`).
  - [`POST /api/organisation/raci`](../../src/app/api/organisation/raci/route.ts) accepts any `AssetEntityType`.
- **Assessment:** **Inference:** a RACI mapping for a component, instance, host or connection fails on the foreign key unless its ID is also an environment ID.
- **Decision needed:** one nullable foreign key per asset type, or a polymorphic reference without the environment FK plus application-level checks ("No dangling references allowed").
- **Pages:** [RACI mapping](entities/raci-mapping.md)

## C-010: "Environments belong to a Stage" is not enforced
- **Status:** open
- **Severity:** medium
- **Claims:**
  - Root `CLAUDE.md` `<flow_model_rules>`: "Environments belong to a Stage."
  - `prisma/schema.prisma`: `Environment.stageId` is optional. `Environment.type` (`EnvironmentType`) and `Stage.key` (`StageKey`) share the same six values (`DEV`, `SIT`, `UAT`, `NFT`, `PREPROD`, `PROD_RO`), and no constraint keeps them consistent.
  - Readiness selects rules by the environment's stage; the PROD_RO guard checks its type.
- **Assessment:** **Inference:** an environment can have no stage, or type `SIT` with a `UAT` stage, and the two checks then disagree about what it is.
- **Decision needed:** make the stage required and derive the type from it, or drop one of the two.
- **Pages:** [Environment](entities/environment.md), [Flow model](concepts/flow-model.md)

## C-011: Connector types differ across docs, README, schema and code
- **Status:** open
- **Severity:** medium
- **Claims:**
  - `docs/source-ingestion-strategy.md`: "exactly 7 connector types": Mock, Config Repository, Cloud-AWS, Cloud-Azure, Cloud-GCP, Terraform, CSV. ITSM/CMDB, Kubernetes auto-discovery and GitOps live sync are out of MVP scope.
  - `README.md`, Connectors: Kubernetes Connector, GitOps Connector, Manual YAML Import.
  - `prisma/schema.prisma` `enum ConnectorType`, used by the Configuration pillar's `Connector` model: `KUBERNETES`, `GITOPS`, `CMDB`, `APM`, `MANUAL`, `CUSTOM`. `ConnectorRun.connectorType` is free text.
  - [`POST /api/connectors/run`](../../src/app/api/connectors/run/route.ts) runs the v2 connectors: `mock`, `config-repo`, `cloud-aws`, `cloud-azure`, `cloud-gcp`, `terraform`, `csv`. [`POST /api/connectors`](../../src/app/api/connectors/route.ts) still runs the earlier connectors that [`createConnector()`](../../src/lib/connectors/index.ts) builds: `kubernetes`, `gitops`, `manual`.
- **Assessment:** the docs and the v2 runtime agree. The README, the Configuration data model and the still-routed earlier connectors describe a different set, which the docs put partly out of scope.
- **Decision needed:** one connector-type list; align `ConnectorType` and the README; retire or document the earlier connectors.
- **Pages:** [Connector framework](concepts/connector-framework.md)

## C-012: Three vocabularies for one canonical model
- **Status:** open
- **Severity:** medium
- **Claims:**
  - Root `CLAUDE.md` invariant 1: "Canonical model is the single source of truth." Its data-integrity rules speak of Deployment, Endpoint and Interface.
  - `README.md`, Domain Model: Environment, Node, Edge, DatabaseMetadata, TestDataSet, Evidence, EnvironmentSnapshot.
  - `docs/source-ingestion-strategy.md`, Canonical Data Model (5-layer): NetworkContext, Host, Component, ComponentInstance, Endpoint, DeployedVersion, Connection.
  - `prisma/schema.prisma`: both graphs hang off `Environment`: `Node`/`Edge` and the five-layer models. There is no `Deployment` or `Interface` model.
- **Assessment:** **Inference:** two parallel topology models hold environment truth. Snapshots and enrichments use `Node`/`Edge` (C-004); v2 connectors, the impact service and the readiness component count use the five-layer models. The [glossary](glossary.md) maps the terms.
- **Decision needed:** declare which model is canonical, plan the retirement of the other, and align the `CLAUDE.md` vocabulary.
- **Pages:** [Glossary](glossary.md), [Five-layer model](concepts/five-layer-model.md), [Node and Edge](entities/node-and-edge.md)

## C-013: Re-running ingestion appends version rows
- **Status:** open
- **Severity:** medium
- **Claims:**
  - Root `CLAUDE.md` connector rules: "Idempotent". Invariant 7: "All version changes must be traceable."
  - `BaseConnectorV2.upsert()`, step 6: "Always create a new deployed version entry (versions are historical)". Every run inserts one `DeployedVersion` row per version in the payload, changed or not.
- **Assessment:** **Inference:** two identical runs leave two rows per instance. Version history then records ingestion runs rather than version changes.
- **Decision needed:** insert only when the version differs from the latest row, or link rows to the `ConnectorRun` explicitly.
- **Pages:** [Deployed version](entities/deployed-version.md), [Connector framework](concepts/connector-framework.md)

## C-014: CI cannot install dependencies
- **Status:** open
- **Severity:** medium
- **Claims:**
  - [`ci.yml`](../../.github/workflows/ci.yml): "All checks must pass before merge"; the lint, test, E2E and build jobs all start with `npm ci`. Root `CLAUDE.md` requires unit, integration and E2E tests with coverage thresholds.
  - [Captured evidence](../raw/2026-11-07-npm-ci-lockfile-error.md): `npm ci` at commit `40ab818` fails because `package.json` and `package-lock.json` are not in sync ("Missing: workerize-loader@2.0.2 from lock file", ...). CI run 42340845363 fails at "Install dependencies" with the same kind of list.
  - `package.json` depends on `@yfiles/yfiles` via a `file:yFiles-for-HTML-Complete-3.0.0.4-Evaluation/...` tarball; `.gitignore` excludes `yFiles-for-HTML-Complete-*/`.
  - The CI E2E job runs `npm run seed || true`; `package.json` has `db:seed` but no `seed` script.
- **Assessment:** **Inference:** even with a synced lock file, a clean checkout cannot install the yFiles tarball, so lint, type check, tests and build cannot run in CI as configured.
- **Decision needed:** resync the lock file, decide how CI obtains yFiles (or builds without it), and fix the seed step name.
- **Pages:** [CI install failure](sources/ci-install-failure-2026-11-07.md), [Overview](overview.md)

## C-015: JSON columns on core entities
- **Status:** open
- **Severity:** low
- **Claims:**
  - Root `CLAUDE.md` `<standards_and_conventions>`: "No denormalized JSON blobs for core entities".
  - `prisma/schema.prisma`: `Blueprint.specJson` (required) holds the expected state; also `EnvironmentSnapshot.snapshotData`, `EnvironmentDiagram.nodesJson`/`edgesJson`, `GovernanceRule.configJson`, `AlignmentComparison.detailsJson`, `Connector.configJson`, `Node.metadata`, `Edge.metadata`.
- **Assessment:** whether snapshot payloads and rule configurations count as core entities is a judgment call. **Inference:** `Blueprint.specJson` matters most, because blueprint alignment then compares a JSON document with relational state.
- **Decision needed:** define "core entity"; normalize the blueprint spec if alignment must be queryable.
- **Pages:** [Blueprint](entities/blueprint.md), [Environment snapshot](entities/environment-snapshot.md)

## C-016: Tone rules ban "insight" and "intelligence"; the product uses both
- **Status:** open
- **Severity:** low
- **Claims:**
  - Root `CLAUDE.md` `<brand_positioning>`: "No 'intelligence'", "No 'insight'".
  - Root `CLAUDE.md` names pillar 4 "Insight"; the dashboard navigation labels it "Insight" ([`layout.tsx`](../../src/app/dashboard/layout.tsx)); the route `src/app/dashboard/data-intelligence/` exists.
- **Assessment:** the rule and the pillar name conflict within `CLAUDE.md` itself.
- **Decision needed:** rename the pillar (for example "Reporting") or limit the tone rule to marketing copy.
- **Pages:** [Six pillars](concepts/pillars.md)

## C-017: README describes an earlier product
- **Status:** open
- **Severity:** low
- **Claims:**
  - `README.md`, Tech Stack: "React Flow" for the frontend graph. `package.json` also depends on `cytoscape`, `@antv/g6` and `@yfiles/yfiles`, and `src/app/flow-map-yfiles/` exists.
  - `README.md`, API Reference: environments, snapshots, test data sets, connectors. `src/app/api/` also has governance, organisation, configuration, cost, flow-map, flow-links, flow-templates, stages and more.
  - Connectors, domain model and database setup: see C-011, C-012 and C-007.
- **Decision needed:** rewrite the README from this wiki once C-011 and C-012 are decided.
- **Pages:** [README](sources/readme.md)

## C-018: Snapshot history can be deleted
- **Status:** open
- **Severity:** low
- **Claims:**
  - Root `CLAUDE.md`: "Snapshots are immutable"; `<enterprise_scale_assumptions>`: "Must assume audit and traceability requirements."
  - `prisma/schema.prisma`: `EnvironmentSnapshot.environment` uses `onDelete: Cascade`, and `DELETE /api/environments/[id]` blocks only PROD_RO environments.
  - `src/lib/services/snapshot.ts` exports `deleteSnapshot()`; no route under `src/app/api/snapshots/` exports `DELETE`.
- **Assessment:** no code updates a snapshot in place, so "immutable" holds. Retention does not: **Inference:** deleting an environment deletes its audit history.
- **Decision needed:** a retention rule (for example archive environments instead of deleting them), and whether `deleteSnapshot()` should exist.
- **Pages:** [Environment snapshot](entities/environment-snapshot.md)

## C-019: Provenance is incomplete for endpoints, versions and connections
- **Status:** open
- **Severity:** low
- **Claims:**
  - Root `CLAUDE.md` principle 6: "Provenance must be stored for all ingested data." `docs/source-ingestion-strategy.md`: "All entities require provenance": `sourceSystem`, `sourceRecordId`, `ingestedAt`.
  - `prisma/schema.prisma`: the provenance fields are nullable on the five-layer models; `Component` has none.
  - `BaseConnectorV2.upsert()` sets all three when it creates network contexts, hosts and component instances. `Endpoint`, `DeployedVersion` and `Connection` rows get `sourceSystem` and `ingestedAt` only. Updates refresh `ingestedAt` only.
- **Decision needed:** the minimum provenance per entity, enforced at write time.
- **Pages:** [Connector framework](concepts/connector-framework.md)
