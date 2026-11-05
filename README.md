# Nexorium Core

The architectural control layer for non-production environments.

Nexorium Core records what each non-production environment contains (systems, interfaces, hosting and deployed versions) and checks it against blueprints and release intent. It shows how environments connect, what changed between snapshots, and who owns each asset.

It does not deploy, monitor, run pipelines or control production. Production is connected read-only.

> **Status: prototype.** Every pillar has screens, but several are not yet backed by working services. A fresh clone needs the yFiles package supplied locally, and the API must not be exposed outside a trusted network. Read [Current status](#current-status) before use.

## What it answers

- What is this environment composed of?
- Which version is deployed where?
- How are components connected?
- Has the environment drifted?
- Is it structurally ready, and aligned with its blueprint and release?
- Who owns what?

It is built for enterprise BSS/OSS landscapes: layered architecture (BSS → OSS → Network), 10–50+ systems per environment, and parallel environments such as DEV, SIT1, SIT2, UAT, NFT and PREPROD, with production as a read-only reference.

## Use cases

Pages are under `/dashboard`.

| Use case | Pillar | Page | Status |
|---|---|---|---|
| Inventory of an environment: systems, hosts, endpoints, interfaces | Environments | `environments/[id]`, `…/graph`, `…/architecture` | Connected |
| Environment flow: DEV → SIT → UAT → PREPROD | Environments | `environments/flow-map` | Partial: links are stored in the browser; requires yFiles |
| Version matrix | Environments | `environments/[id]/versions` | Not connected |
| Snapshots and drift | Environments | `environments/[id]/snapshots` | Not connected (the snapshot API exists) |
| Blueprints and releases | Governance | `governance/blueprints`, `governance/releases` | Partial: lists only; create buttons are not wired |
| Blueprint and release alignment | Governance | `governance/alignment` | Not connected |
| Readiness | Governance | `governance/readiness`, `governance/promotion-readiness` | Partial: rule evaluation defaults to pass |
| Policy controls, exceptions, approvals | Governance | `governance/controls`, `…/exceptions`, `…/approvals` | Connected |
| Cross-environment coupling | Governance | `governance/coupling` | Connected |
| Test data classification and masking | Governance | `data-governance` | Connected |
| Dependency paths, blast radius | Impact | `impact/dependency-paths`, `impact/blast-radius` | Not connected |
| Change detection, stability | Impact | `impact/change-detection`, `impact/stability` | Placeholder |
| Dashboard and reports | Insight | `insight/dashboard`, `insight/reports` | Placeholder |
| People, RACI, orphaned assets | Organisation | `organisation/people`, `…/raci`, `…/orphaned-assets` | Partial: read-only views; RACI applies to environments only |
| Connectors, systems, flow templates, settings | Configuration | `configuration/…` | Partial: connector runs started here are simulated |
| Environment cost and simulation | — | `cost`, `cost/simulator` | Connected |

**Connected**: the page reads from the API and database. **Partial**: connected, with the noted gap. **Not connected**: the page calls an API route that does not exist yet. **Placeholder**: the page shows fixed or sample data.

## How it works

The design, with the full rules in [`CLAUDE.md`](CLAUDE.md):

1. **Ingest.** Connectors read source data and map it to one canonical model, with provenance: source system, record ID and ingestion time.
2. **Snapshot.** Every ingestion run creates an immutable snapshot. Drift is computed snapshot to snapshot.
3. **Enrich.** Manual edits are audit-trailed and never silently overwritten by ingestion.
4. **Govern.** Snapshots are compared with blueprints (expected state) and releases (target versions). Readiness is scored deterministically.
5. **Analyse impact.** Dependency paths and blast radius come from traversing the stored topology.
6. **Protect production.** `PROD_RO` environments are read-only.

[Current status](#current-status) lists where the code does not yet meet this design.

## Pillars

| Pillar | Responsibility | Section |
|---|---|---|
| Environments | Structural truth: flow map, graphs, systems, versions, snapshots, health | `/dashboard/environments` |
| Governance | Alignment: blueprints, releases, rules, readiness, controls, exceptions, approvals, coupling | `/dashboard/governance` |
| Impact | Risk: dependency paths, blast radius, change detection, stability | `/dashboard/impact` |
| Insight | Reporting: dashboard and reports | `/dashboard/insight` |
| Organisation | Accountability: people, RACI, ownership, orphaned assets | `/dashboard/organisation` |
| Configuration | Control surface: connectors, systems, flow templates, integration rules, platform settings | `/dashboard/configuration` |

Outside the pillars, `/dashboard` also has `overview`, `cost`, `data-governance`, `data-intelligence`, `activity` and `connectors`.

## Domain model

`prisma/schema.prisma` defines 60 models. The terms used in `CLAUDE.md` map to them as follows: a *deployment* is a `ComponentInstance`, an *interface* is a `Connection`, and `DeployedVersion` holds `projectVersion` (required) and `vendorVersion` (optional).

| Group | Models |
|---|---|
| Environments and flow | Project, Environment, Stage, EnvironmentLink, FlowTemplate, FlowTemplateStage |
| Canonical topology | Host, NetworkContext, Component, ComponentInstance, Endpoint, DeployedVersion, Connection |
| Ingestion and snapshots | Connector, ConnectorRun, ConnectorCredential, IntegrationRule, IngestionConflict, Evidence, EnvironmentSnapshot |
| Governance | Blueprint, Release, ReleaseItem, GovernanceRule, RuleEvaluation, AlignmentComparison, PolicyControl, ComplianceResult, PolicyViolation, ExceptionItem, ApprovalItem, CouplingLink |
| Organisation | Person, RACIMapping, OrphanedAsset, EnvironmentOwnership |
| Audit | AuditEvent, EnvironmentActivityLog (hash-chained), EnrichmentEdit |
| Test data | DatabaseMetadata, TestDataSet, RefreshRecord, ComplianceAudit |
| Cost | CostModel, CostItem, EnvironmentCostOverride, EnvironmentCostAllocation, CostSimulation |
| Legacy topology | Node, Edge, NetworkZone, NetworkZoneConnection, RuntimeLayer, HostingDomain, NodeHostingDomain |
| Flow map and layout | FlowMapLayout, ManualFlowMapNode, ManualFlowMapEdge, EnvironmentDiagram |
| Settings | PlatformSetting |

Canonical components are classified by architecture layer (BSS, OSS, Infra, External) and capability (CRM, CPQ, Billing, SOM, Inventory, Orchestrator and others). Legacy nodes carry a finer telco taxonomy: layer (BSS, OSS, Network, Shared, External) and 30 subsystem types, including Product Catalog, Rating, Mediation, Provisioning, Service Assurance, HSS, PCRF and IMS.

## Connectors

| Connector | Version | Input | Notes |
|---|---|---|---|
| Kubernetes | v1 | Kubernetes resources supplied in the request | Does not connect to a cluster yet |
| GitOps | v1 | Manifest content supplied in the request | Does not fetch the repository yet |
| Manual | v1 | YAML or JSON topology | |
| Cloud | v2 | AWS, Azure or GCP inventory JSON (local file) | Samples in `fixtures/cloud` |
| Terraform | v2 | Terraform state (local file) | Sample in `fixtures/terraform` |
| Config repository | v2 | Topology YAML (local file) | Sample in `fixtures/config-repo` |
| CSV | v2 | CSV files (local) | |
| Mock | v2 | Generated data | For demos |

v1 connectors write to the legacy Node/Edge model through `POST /api/connectors`. v2 connectors write to the canonical model through `POST /api/connectors/run`.

## Getting started

### Prerequisites

- Node.js 20 (the version CI uses)
- PostgreSQL 14 or later, local or on Supabase
- A Supabase project for sign-in (email and password)
- yFiles for HTML 3.0, a commercial library that is not in the repository

### 1. Add yFiles

The flow map uses yFiles for HTML. `package.json` and the flow map pages expect the yFiles package folder at the repository root:

```
yFiles-for-HTML-Complete-3.0.0.4-Evaluation/
├── lib/license.json
└── lib-dev/yfiles-30.0.4+eval-dev.tgz
```

The folder is excluded from git. Without it, installation and the TypeScript check fail. The repository references an evaluation build; check the yWorks licence terms before any other use.

### 2. Install

```bash
npm install
```

`npm ci` fails until `package-lock.json` is regenerated.

### 3. Configure

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DIRECT_URL` | Direct connection used by Prisma CLI commands. Required by `schema.prisma` but missing from `.env.example`, so add it. For a local database, use the same value as `DATABASE_URL`. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project used for sign-in |
| `CREDENTIAL_ENCRYPTION_KEY` | 64 hex characters used to encrypt connector credentials (AES-256-GCM). Generate with `openssl rand -hex 32`. |

### 4. Create the database

```bash
npx prisma db push
npx prisma db seed
```

Use `prisma db push`. The migrations in `prisma/migrations` create only 9 of the 60 tables, so `prisma migrate deploy` produces an incomplete database.

Use `npx prisma db seed`, which loads `.env`. `npm run db:seed` runs ts-node directly, which does not read `.env`, so it fails with "Environment variable not found: DATABASE_URL" unless the variables are already set in your shell.

The seed loads a sample telco landscape: seven environments (DEV, SIT, UAT, NFT, PREPROD, a second SIT and a second DEV) with CRM, CPQ, product catalog, order management, billing, orchestration, inventory, provisioning and assurance systems, plus governance, organisation and cost data.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3003. Pages do not ask for sign-in yet: `middleware.ts` sits at the repository root, but in a project with a `src/app` directory Next.js only loads `src/middleware.ts`, so the sign-in check never runs.

> **Warning:** in development mode the API skips authentication and treats every caller as an administrator. Run `npm run dev` only on your own machine.

For production mode, run `npm run build` and then `npm start`. Every signed-in user then receives the Editor role, which cannot manage credentials, run connectors or delete environments. Role assignment is not implemented yet.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server on port 3003 |
| `npm run build`, `npm start` | Production build and server on port 3003 |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint (currently fails, see [Current status](#current-status)) |
| `npm test` | Unit and integration tests (Vitest) |
| `npm run test:coverage` | Tests with a coverage report |
| `npm run test:e2e` | End-to-end tests (Playwright) |
| `npm run db:push`, `npx prisma db seed`, `npm run db:studio` | Push the schema, load sample data, open Prisma Studio |

## Project structure

```
prisma/
  schema.prisma              Data model (60 models)
  migrations/                Migrations (incomplete, see Current status)
  seed/                      Sample telco landscape
src/
  app/
    (landing)/               Landing page (not served, see Current status)
    login/                   Sign-in
    dashboard/               Application: one folder per pillar, plus cost and data governance
    api/                     REST API (108 route files)
    flow-map/, flow-map-v2/, flow-map-yfiles/, yfiles-lab/,
    playground/, landing-a/ … landing-e/, landing-selector/
                             Experiments and alternative versions
  components/                UI: flow map, topology graphs, overview, governance, UI kit
  lib/
    services/                Domain services: governance, impact, insight, organisation,
                             snapshots, cost, security (credentials, roles)
    connectors/              Ingestion connectors (v1 and v2)
    auth/, supabase/         Authentication
    flow-map/, utils/        Layout and graph utilities
  graph/                     Cytoscape and G6 renderer adapters (playground)
  modules/health-status/     Health signal module (sample data)
fixtures/                    Sample connector inputs: Terraform, config repository, AWS/Azure/GCP
tests/                       Vitest unit and integration tests, Playwright E2E tests, fixtures
docs/                        Cost model, source ingestion strategy
_app-yfiles-test/            Unused yFiles experiment (not routed)
CLAUDE.md                    Product rules and architectural invariants
```

## API

REST routes live in `src/app/api`. Most return `{ success: true, data }` or `{ success: false, error }`.

| Area | Routes |
|---|---|
| Environments | `/api/environments`, `/api/environments/[id]` and its sub-routes (`topology`, `topology5`, `stats`, `diagram`, `map`, `layout`, `ownership`, `cost`, `activity-logs`), `/api/projects`, `/api/stages` |
| Topology | `/api/components`, `/api/connections/[id]`, `/api/nodes/[id]/…`, `/api/network-zones`, `/api/hosting-domains`, `/api/enrichments` |
| Snapshots | `/api/snapshots`, `/api/snapshots/[id]`, `/api/snapshots/[id]/compare` |
| Flow | `/api/flow-links`, `/api/flow-templates`, `/api/flow-map` |
| Governance | `/api/governance/…`: `blueprints`, `releases`, `rules`, `readiness/[envId]`, `compliance`, `controls`, `exceptions`, `approvals`, `violations`, `coupling`, `overview` |
| Organisation | `/api/organisation/people`, `/api/organisation/raci`, `/api/organisation/orphans` |
| Configuration | `/api/configuration/systems`, `/api/configuration/connectors`, `/api/configuration/settings` |
| Ingestion | `/api/connectors`, `/api/connectors/run`, `/api/connectors/runs`, `/api/connectors/credentials` |
| Test data | `/api/datasets` |
| Cost | `/api/cost-models`, `/api/cost/compute`, `/api/cost/simulations`, `/api/cost/rollups` |
| Overview | `/api/overview` |

## Testing

- `npm test` runs 282 Vitest tests from `tests/unit` and `tests/integration`. Prisma is mocked, so no database or network is needed.
- `npm run test:e2e` runs the Playwright smoke and sign-in tests against the dev server.
- CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests and a build on pushes and pull requests to `main`, and end-to-end tests against PostgreSQL.

## Current status

State of `main` at commit `40ab818`.

**Setup and CI**

- `npm ci` fails because `package-lock.json` is out of sync with `package.json`. CI runs `npm ci`, so every CI job fails at installation.
- The yFiles package must be supplied locally. With the yFiles pages removed, the rest of the application builds.
- `npm run lint` fails: ESLint 9 rejects the legacy options that `next lint` passes to it.
- The migrations create 9 of the 60 tables. Use `prisma db push`.
- `npm run db:seed` fails unless the database variables are set in the shell. Use `npx prisma db seed`.
- `.env.example` and the CI workflow do not define `DIRECT_URL`.
- 21 of 282 tests fail: 18 environment API tests (authentication was added to the routes after the tests were written), 2 layout tests and 1 fixture test.
- Playwright waits for port 3000, but the dev server runs on port 3003.
- `/` is defined twice. `src/app/page.tsx` redirects it to `/dashboard`, so the landing page in `src/app/(landing)` is never shown.

**Security**

- Pages do not require sign-in: `middleware.ts` is at the repository root, where Next.js ignores it in a project with `src/app`. It belongs in `src/middleware.ts`.
- Development mode disables API authentication.
- 18 of the 108 API route files have no authentication check.
- Every signed-in user receives the Editor role; there is no role assignment.
- The production read-only rule is enforced on the environment record only, not on its topology, connectors or links.
- Several actions take the acting user's name from the request, so audit records can be falsified.
- Do not expose the application outside a trusted network.

**Product logic**

- Two topology models exist side by side: legacy Node/Edge (v1 connectors, snapshots, enrichment) and the canonical model (v2 connectors, governance, impact). Snapshots capture only legacy data.
- Snapshot comparison does not cover versions or endpoints, and the snapshot hash reflects only top-level fields.
- Readiness rule evaluation defaults to pass.
- Ingestion can overwrite manual edits; ingestion conflicts are not recorded.
- Impact and Insight have no API routes; their pages show placeholder data.
- RACI assignments work for environments only.
- Connector runs started from Configuration are simulated, and credential tests always pass.
- Connectors read supplied payloads or local files; none connects to a live source yet.

## Licence

MIT. The repository does not include a LICENSE file yet.

yFiles for HTML is a commercial library licensed separately by yWorks. It is not included in the repository and is not covered by this licence.
