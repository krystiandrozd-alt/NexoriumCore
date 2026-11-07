---
title: Node and Edge graph
type: entity
summary: The first topology model (Node, Edge, DatabaseMetadata, TestDataSet). README documents it, the first migration creates it, and snapshots capture it.
aliases: [Node, Edge]
tags: [topology]
sources:
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: README.md
    blob: "b9478f9750ab"
  - path: prisma/migrations/20260123131252_init/migration.sql
    blob: "d222d03eb62b"
  - path: src/lib/connectors/base.ts
    blob: "b42e7144263e"
  - path: src/lib/services/snapshot.ts
    blob: "5158b5bd7173"
updated: 2026-11-07
---

# Node and Edge graph

Prisma models `Node` and `Edge`, with `DatabaseMetadata`, `TestDataSet`, `RefreshRecord` and `Evidence`.

## Fields

- `Node`: `environmentId` (`onDelete: Cascade`), `type` `NodeType` (`APPLICATION`, `SERVICE`, `DATABASE`, `GATEWAY`, `EXTERNAL`, `RUNTIME`, `MESSAGE_QUEUE`, `LOAD_BALANCER`), `name`, `owner` (free text), `criticality` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `lastSeenAt`, `metadata` (JSON), `telcoLayer` (`BSS`, `OSS`, `NETWORK`, `SHARED`, `EXTERNAL`), `telcoSubsystem`, `networkZoneId`.
- `Edge`: `sourceNodeId`, `targetNodeId`, `protocol` `Protocol` (`REST`, `GRPC`, `MQ`, `JDBC`, `SFTP`, `EVENT`, `WEBSOCKET`, `SOAP`, `GRAPHQL`), `port`, `pathOrTopic`, `confidenceScore` (float, default 1.0), `lastObservedAt`, `metadata`.
- Related: `DatabaseMetadata` (engine, version, size) → `TestDataSet` (`sourceType` `PROD_CLONE`, `MASKED`, `SYNTHETIC`, `STATIC`; masking, classification, approvals), `EnrichmentEdit`, `NetworkZone`, `RuntimeLayer`, `HostingDomain`.

## Where it is used

- `README.md` describes the domain model in these terms. The first migration (`20260123131252_init`) creates `environments`, `nodes`, `edges`, `database_metadata`, `test_data_sets`, `refresh_records`, `evidence` and `environment_snapshots`, and nothing else.
- [Snapshots](environment-snapshot.md) capture this graph and nothing else (C-004).
- The earlier connectors in `src/lib/connectors/` describe what they find as `DiscoveredNode` and `DiscoveredEdge`. Manual enrichments are written per node (`/api/nodes/[id]/enrichments`).

## Relation to the five-layer model

- **Inference:** this is the older model. The [five-layer model](../concepts/five-layer-model.md) arrived later: only the schema and the ingestion docs describe it, and no migration creates its tables.
- The vocabularies do not line up. `Protocol` here and `ConnectionProtocol` in the five-layer model are different enums. `TelcoLayer` (`NETWORK`, `SHARED`) differs from `ArchitectureLayer` (`INFRA`, `UNKNOWN`). A node mixes catalog and instance data.
- Which model is canonical is undecided (C-012).
