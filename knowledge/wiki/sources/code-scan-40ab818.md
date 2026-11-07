---
title: Implementation scan at commit 40ab818
type: source
summary: Targeted code reading on 2026-11-07, checking the root CLAUDE.md invariants against connectors, snapshots, impact, flow links, readiness, RACI and PROD_RO guards.
tags: [implementation]
sources:
  - path: src/lib/connectors/v2/base-connector.ts
    blob: "c8d9de1a3ef0"
  - path: src/lib/connectors/v2/index.ts
    blob: "269b15950b57"
  - path: src/lib/connectors/v2/cloud-connector.ts
    blob: "5d2a7aa199ed"
  - path: src/lib/connectors/index.ts
    blob: "fed5ffa416c1"
  - path: src/lib/connectors/base.ts
    blob: "b42e7144263e"
  - path: src/app/api/connectors/route.ts
    blob: "39f58a6ed13e"
  - path: src/app/api/connectors/run/route.ts
    blob: "7c72abb291c4"
  - path: src/lib/services/snapshot.ts
    blob: "5158b5bd7173"
  - path: src/app/api/snapshots/route.ts
    blob: "95326f74f458"
  - path: src/lib/services/impact/index.ts
    blob: "68fa35f76b91"
  - path: src/app/dashboard/impact/blast-radius/page.tsx
    blob: "5472f99926f5"
  - path: src/app/dashboard/impact/dependency-paths/page.tsx
    blob: "5ba43b116274"
  - path: src/lib/services/flow-map.ts
    blob: "4300d996f9a3"
  - path: src/app/api/flow-links/route.ts
    blob: "72b26c7a50d1"
  - path: "src/app/api/governance/readiness/[envId]/route.ts"
    blob: "f7b12a8480a9"
  - path: src/app/dashboard/governance/readiness/page.tsx
    blob: "71ba2999c443"
  - path: src/app/dashboard/governance/promotion-readiness/page.tsx
    blob: "249e59fb4f34"
  - path: src/app/api/organisation/raci/route.ts
    blob: "31b267e6b646"
  - path: "src/app/api/environments/[id]/route.ts"
    blob: "b85a42cdce34"
  - path: "src/app/api/environments/[id]/map/nodes/route.ts"
    blob: "eb8e1aeeb8bd"
  - path: "src/app/api/environments/[id]/map/edges/route.ts"
    blob: "6195069ddfa9"
  - path: "src/app/api/nodes/[id]/enrichments/route.ts"
    blob: "bb41a9ab6782"
  - path: src/app/api/configuration/systems/route.ts
    blob: "32e52e334260"
  - path: src/app/dashboard/layout.tsx
    blob: "6ccf804ef018"
  - path: prisma/seed/index.ts
    blob: "f7f803fd4ee5"
  - path: package.json
    blob: "16a340f70e2d"
  - path: .gitignore
    blob: "2b6904978a4d"
  - path: .github/workflows/ci.yml
    blob: "c6abac2703d3"
updated: 2026-11-07
---

# Implementation scan at commit 40ab818

## Method

Not a full code review. Each architectural invariant and rule in root `CLAUDE.md` was traced to the code that should implement it: files were read where the rule lives, and repository-wide searches (`grep` over `src/`) backed the absence claims. All findings refer to commit `40ab818`. The repository then had 442 files under `src/`.

## Observations by area

| Area | What the code does | Pages |
|------|--------------------|-------|
| Connectors | v2 `BaseConnectorV2` runs fetch → map → upsert and records a `ConnectorRun`. There is no snapshot step, no conflict detection, and version rows are appended on every run. The earlier connectors (`kubernetes`, `gitops`, `manual`) are still routed through `POST /api/connectors`. | [Connector framework](../concepts/connector-framework.md); C-002, C-003, C-011, C-013, C-019 |
| Snapshots | `POST /api/snapshots` → `createSnapshot()` serialises the Node/Edge graph only. | [Snapshot and drift](../concepts/snapshot-and-drift.md); C-004, C-018 |
| Impact | The service exists but no route exposes it; the pages call missing `/api/impact/*` routes. | [Six pillars](../concepts/pillars.md); C-006 |
| Flow | `validateFlowLink()` exists but nothing calls it; `POST /api/flow-links` blocks only self-links. | [Flow model](../concepts/flow-model.md); C-008 |
| Readiness | Rule evaluation ignores every `GovernanceRuleType` value and defaults to pass. | [Readiness](../concepts/readiness.md); C-001 |
| Organisation | The RACI API accepts every asset type, but the schema's foreign key accepts environments only. `/api/configuration/systems` reads `Component` with its owners (`Person`). | [RACI mapping](../entities/raci-mapping.md); C-009 |
| PROD_RO | The guard sits only in `/api/environments/[id]` (`PUT`, `PATCH`, `DELETE`). | [PROD_RO read-only](../concepts/prod-ro-read-only.md); C-005 |
| Navigation | `src/app/dashboard/layout.tsx` lists Overview plus the six pillars. | [Six pillars](../concepts/pillars.md) |
| Delivery | `package.json` pulls `@yfiles/yfiles` from a gitignored local tarball; CI runs `npm run seed`, which does not exist. | C-014 |

## Not yet read (gaps for later ingests)

- Governance services: `src/lib/services/governance/` (`alignment.ts`, `blueprint.ts`, `release.ts`, `compliance.ts`, `policy.ts`, `approvals.ts`, `exceptions.ts`, `coupling.ts`, `audit.ts`, `enrichment.ts`, `classification.ts`).
- Insight reports: `src/lib/services/insight/reports.ts`. Organisation service: `src/lib/services/organisation/index.ts`.
- Cost engine: `src/lib/services/cost-engine.ts`. Security: `src/lib/services/security/` (roles and permissions), `middleware.ts`.
- Graph rendering and flow map UI: `src/graph/`, `src/components/flow-map-v2/`, the yFiles pages.
- The test suite under `tests/`: what the core flows in root `CLAUDE.md` `<testing_framework>` actually cover.
