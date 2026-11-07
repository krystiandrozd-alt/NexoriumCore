---
title: Blueprint
type: entity
summary: Expected-state definition for an environment or stage, stored as a JSON spec and compared with snapshots through alignment records.
tags: [governance]
sources:
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: CLAUDE.md
    blob: "41c676bf6abe"
updated: 2026-11-07
---

# Blueprint

Prisma model `Blueprint` (table `blueprints`). Root `CLAUDE.md`, Governance pillar: "Blueprints (expected state definitions)".

## Fields

- `name` (unique), `description`.
- `status`: `BlueprintStatus` (`DRAFT`, `APPROVED`, `DEPRECATED`).
- `targetStageId`: optional plain string. It has no relation to `Stage`, so no foreign key.
- `specJson`: required JSON holding the expected state (C-015).
- Approval trail: `createdBy`, `approvedBy`, `approvedAt`.
- Relations: `alignmentComparisons`, `releaseItems` ([Release](release.md)).

## Alignment

`AlignmentComparison` stores the result of a comparison:

- `comparisonType`: `BLUEPRINT_VS_SNAPSHOT`, `SNAPSHOT_VS_RELEASE`, `CROSS_ENVIRONMENT`, `NONPROD_VS_PROD`. These are the four alignment views listed in root `CLAUDE.md`.
- `status`: `ALIGNED`, `DRIFTED`, `PARTIAL`, `UNKNOWN`.
- Counters: `alignedCount`, `driftedCount`, `missingCount`, `extraCount`, plus `detailsJson`.

Readiness component 5 is "Governance alignment (if blueprint exists)". The readiness route does not read blueprints or alignment records (C-001). See [Readiness](../concepts/readiness.md).

## Not yet ingested

`src/lib/services/governance/blueprint.ts` and `alignment.ts`, which implement comparisons. They were not read in the first pass ([implementation scan](../sources/code-scan-40ab818.md)).
