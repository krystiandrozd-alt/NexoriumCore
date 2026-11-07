---
title: Prisma schema
type: source
summary: The database schema. 60 models and 66 enums on PostgreSQL with UUID keys, holding two topology models side by side.
tags: [canonical-model, database]
sources:
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: prisma/migrations/20260123131252_init/migration.sql
    blob: "d222d03eb62b"
  - path: prisma/migrations/20260126000000_add_projects_entity/migration.sql
    blob: "060eba497bf0"
updated: 2026-11-07
---

# Prisma schema

[`prisma/schema.prisma`](../../../prisma/schema.prisma) (1,711 lines), read on 2026-11-07, plus the two migrations.

## Facts

- PostgreSQL datasource (`DATABASE_URL`, `DIRECT_URL`). 60 models, 66 enums.
- All 60 models use `@id @default(uuid())`, which meets the "UUID primary keys" standard.
- Only 9 tables have migrations (C-007).

## Model groups

This grouping is the wiki's, not the schema's.

| Group | Models |
|-------|--------|
| Core | `Project`, `Environment`, `EnvironmentSnapshot`, `EnvironmentActivityLog`, `EnvironmentOwnership` |
| Node/Edge graph and test data | `Node`, `Edge`, `DatabaseMetadata`, `TestDataSet`, `RefreshRecord`, `Evidence`, `EnrichmentEdit`, `ComplianceAudit`, `PolicyViolation`, `NetworkZone`, `NetworkZoneConnection`, `RuntimeLayer`, `HostingDomain`, `NodeHostingDomain` |
| Five-layer model | `NetworkContext`, `Host`, `Component`, `ComponentInstance`, `Endpoint`, `DeployedVersion`, `Connection` |
| Ingestion and audit | `ConnectorRun`, `ConnectorCredential`, `AuditEvent`, `IngestionConflict`, `EnvironmentDiagram` |
| Flow | `Stage`, `EnvironmentLink`, `FlowTemplate`, `FlowTemplateStage`, `FlowMapLayout`, `ManualFlowMapNode`, `ManualFlowMapEdge` |
| Governance | `Blueprint`, `Release`, `ReleaseItem`, `GovernanceRule`, `RuleEvaluation`, `AlignmentComparison`, `PolicyControl`, `ComplianceResult`, `ApprovalItem`, `ExceptionItem`, `CouplingLink` |
| Organisation | `Person`, `RACIMapping`, `OrphanedAsset` |
| Configuration | `Connector`, `IntegrationRule`, `PlatformSetting` |
| Cost | `CostModel`, `CostItem`, `EnvironmentCostOverride`, `EnvironmentCostAllocation`, `CostSimulation` |

## Pages built from this source

[Environment](../entities/environment.md), [Component instance](../entities/component-instance.md), [Deployed version](../entities/deployed-version.md), [Connection](../entities/connection.md), [Environment snapshot](../entities/environment-snapshot.md), [Blueprint](../entities/blueprint.md), [Release](../entities/release.md), [RACI mapping](../entities/raci-mapping.md), [Node and Edge](../entities/node-and-edge.md), [Five-layer model](../concepts/five-layer-model.md), [Flow model](../concepts/flow-model.md).

## Schema-level findings

C-007 (migrations), C-009 (RACI foreign key), C-010 (optional stage), C-012 (two topology models), C-015 (JSON columns), C-018 (snapshot cascade).
