---
title: Five-layer model
type: concept
summary: The documented canonical topology model. Network context, host, component, component instance with endpoints, deployed version, connection.
tags: [canonical-model]
sources:
  - path: docs/source-ingestion-strategy.md
    blob: "5abe417f9120"
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: CLAUDE.md
    blob: "41c676bf6abe"
updated: 2026-11-07
---

# Five-layer model

The [source ingestion strategy](../sources/source-ingestion-strategy.md) defines it: "All connectors ingest data into these canonical entities". The [Prisma schema](../sources/prisma-schema.md) implements it.

| Layer | Model | Belongs to | Key fields |
|-------|-------|-----------|------------|
| L1 | `NetworkContext` | Environment | `hostingType` (`CLOUD`, `ON_PREM`, `HYBRID`, `THIRD_PARTY`, `EDGE`), `cloudProvider`, `region`, `vpcVnet`, `subnetCidr`, `zoneLabel`, load balancer and private endpoint flags and references |
| L2 | `Host` | Environment; optional network context | `hostname` (unique per environment), `ip`, `natIp`, `os` |
| L3a | `Component` | Global catalog | `name` (unique), `category`, `vendor`, `layer` (`BSS`, `OSS`, `INFRA`, `EXTERNAL`, `UNKNOWN`), `capabilityType` (`CPQ`, `CRM`, `BILLING`, `SOM`, `INVENTORY`, `ORCHESTRATOR`, `DB`, `MQ`, `API_GW`, `IDENTITY`, `ITSM`, `OTHER`, `UNKNOWN`), owner links |
| L3b | `ComponentInstance` | Environment, component, optional host | [Component instance (Deployment)](../entities/component-instance.md) |
| L3c | `Endpoint` | One component instance | `kind` (`HOSTNAME`, `IP`, `NAT`, `VIP`, `URL`), `value`, `port`, `scheme` (`TCP`, `HTTP`, `HTTPS`, `GRPC`, `JDBC`, `AMQP`), `basePath` |
| L4 | `DeployedVersion` | One component instance | [Deployed version](../entities/deployed-version.md) |
| L5 | `Connection` | Environment, two component instances | [Connection (Interface)](../entities/connection.md) |

All ingested layers carry nullable provenance fields (`sourceSystem`, `sourceRecordId`, `ingestedAt`); `Component` has none (C-019).

## Data-integrity rules (root CLAUDE.md) against the schema

| Rule | Schema |
|------|--------|
| "A Deployment belongs to exactly one Environment." | Met: `ComponentInstance.environmentId` is required. |
| "An Endpoint belongs to exactly one Deployment." | Met: `Endpoint.componentInstanceId` is required. |
| "An Interface must reference valid source and target Deployments." | Met: both foreign keys are required. |
| "Project_version is mandatory for every Deployment." | Partly: the field is required, but an instance may have no version row. |
| "No dangling references allowed." | Partly. The five-layer models use foreign keys, and ingestion skips unresolved references. Many other ID columns have no foreign key: `RACIMapping.entityId` (C-009), `Blueprint.targetStageId`, `AlignmentComparison.targetEnvironmentId`, the IDs on `PolicyViolation`, `ComplianceResult`, `ApprovalItem`, `ExceptionItem` and `CouplingLink`, and the polymorphic `entityType`/`entityId` pairs. Full list in C-020. |

## Status

- **Inference:** this model is the target. Connectors v2, the impact service and the readiness component count use it, but snapshots do not (C-004), and no migration creates its tables (C-007).
- Root `CLAUDE.md` describes layers as "BSS → OSS → Network". `ArchitectureLayer` uses `INFRA` instead of a network layer; the [Node and Edge](../entities/node-and-edge.md) `TelcoLayer` has `NETWORK`.
- Canonical or not is undecided (C-012). Terms are mapped in the [glossary](../glossary.md).
