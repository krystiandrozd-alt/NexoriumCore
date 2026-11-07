---
title: Environment
type: entity
summary: A non-production (or read-only production) landscape. Both topology models, snapshots, links and ownership hang off it.
tags: [environments, canonical-model]
sources:
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: "src/app/api/environments/[id]/route.ts"
    blob: "b85a42cdce34"
  - path: src/app/api/environments/route.ts
    blob: "d1ffc2c16bad"
  - path: "src/app/api/governance/readiness/[envId]/route.ts"
    blob: "f7b12a8480a9"
updated: 2026-11-07
---

# Environment

Prisma model `Environment` (table `environments`).

## Fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `name` | string | Not unique, so parallel environments such as SIT1 and SIT2 can coexist. |
| `type` | `EnvironmentType` | `DEV`, `SIT`, `UAT`, `NFT`, `PREPROD`, `PROD_RO` |
| `stageId` | optional → `Stage` | Root `CLAUDE.md` says "Environments belong to a Stage" (C-010). |
| `projectId` | optional → `Project` | |
| `entryComponentInstanceId`, `exitComponentInstanceId` | optional → `ComponentInstance` | Entry and exit points for impact analysis. |

## Relations

- Both topology models: `nodes`/`edges` ([Node and Edge](node-and-edge.md)) and `networkContexts`, `hosts`, `componentInstances`, `connections` ([five-layer model](../concepts/five-layer-model.md)). See C-012.
- History and governance: `snapshots` ([Environment snapshot](environment-snapshot.md)), `ruleEvaluations`, `blueprintAlignments`, `activityLogs`, `connectorRuns`.
- Flow: `upstreamLinks`, `downstreamLinks` (`EnvironmentLink`), `flowMapLayouts`, `manualNodes`, `manualEdges`, `diagram`. See [Flow model](../concepts/flow-model.md).
- Accountability and cost: `raciMappings` ([RACI mapping](raci-mapping.md)), `ownership`, `costOverride`, `costAllocations`.
- Most child relations use `onDelete: Cascade`, so deleting an environment deletes its graph, snapshots and links (C-018).

## Behaviour in the API

- [`/api/environments/[id]`](../../../src/app/api/environments/[id]/route.ts): `PUT`, `PATCH` and `DELETE` return 403 for `PROD_RO` ("Cannot modify production read-only environment"). Other write routes do not check (C-005). See [PROD_RO read-only](../concepts/prod-ro-read-only.md).
- [`POST /api/environments`](../../../src/app/api/environments/route.ts) accepts all six types, including `PROD_RO`.
- Readiness selects governance rules by the environment's stage key, not its type.

## Open questions

- Should `type` exist alongside `stage`? (C-010)
- Root `CLAUDE.md` lists DEV, SIT, UAT, PREPROD and PROD_RO; the schema adds NFT (non-functional testing). Nothing conflicts, but `CLAUDE.md` could list it.
