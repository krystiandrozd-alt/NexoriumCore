---
title: Component instance (Deployment)
type: entity
summary: A component deployed in exactly one environment, which root CLAUDE.md calls a Deployment. It carries endpoints, versions and connections.
aliases: [Deployment, ComponentInstance]
tags: [canonical-model, five-layer]
sources:
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: docs/source-ingestion-strategy.md
    blob: "5abe417f9120"
  - path: src/lib/connectors/v2/base-connector.ts
    blob: "c8d9de1a3ef0"
updated: 2026-11-07
---

# Component instance (Deployment)

Prisma model `ComponentInstance` (table `component_instances`), layer L3b of the [five-layer model](../concepts/five-layer-model.md). Root `CLAUDE.md` calls it a *Deployment* ([glossary](../glossary.md)).

## Fields and relations

- `environmentId`: required, `onDelete: Cascade`. This satisfies "A Deployment belongs to exactly one Environment."
- `componentId`: required → `Component`, the catalog entry (for example "Oracle Database", with vendor, `ArchitectureLayer`, `CapabilityType` and owners).
- `hostId`: optional → `Host`.
- `displayName`, `notes`.
- Provenance: `sourceSystem`, `sourceRecordId`, `ingestedAt`, all nullable.
- Children: `endpoints` (each belongs to exactly this instance), `deployedVersions` ([Deployed version](deployed-version.md)), `outgoingConnections` and `incomingConnections` ([Connection](connection.md)).
- An instance can be an environment's entry or exit point (`Environment.entryComponentInstanceId`, `exitComponentInstanceId`).

## Ingestion behaviour

From [`BaseConnectorV2.upsert()`](../../../src/lib/connectors/v2/base-connector.ts):

- An instance whose component is not in the payload is skipped with a warning.
- Matching uses `sourceRecordId` within the environment when the source supplies an external ID; otherwise environment + component + `displayName`.
- A missing `displayName` defaults to `<componentName>-<first 8 characters of the environment id>`.
- On update, `hostId`, `displayName`, `notes` and `ingestedAt` are overwritten without a manual-edit check (C-003). See [Manual override protection](../concepts/manual-override-protection.md).

## Open questions

- Root `CLAUDE.md`: "Project_version is mandatory for every Deployment." `DeployedVersion.projectVersion` is required, but nothing in the schema stops an instance from having no version row at all. Enforcement elsewhere was not checked.
- **Inference:** `Node` in the [Node and Edge](node-and-edge.md) model plays the same role in the other topology model (C-012).
