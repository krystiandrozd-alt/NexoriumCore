---
title: Connection (Interface)
type: entity
summary: Directed integration between two component instances with a normalized protocol, which root CLAUDE.md calls an Interface. It is either ingested or manual, never inferred.
aliases: [Interface, Connection]
tags: [canonical-model, five-layer, topology]
sources:
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: src/lib/connectors/v2/base-connector.ts
    blob: "c8d9de1a3ef0"
updated: 2026-11-07
---

# Connection (Interface)

Prisma model `Connection` (table `connections`), layer L5 of the [five-layer model](../concepts/five-layer-model.md). Root `CLAUDE.md` calls it an *Interface*.

## Fields

- `environmentId`: required, `onDelete: Cascade`.
- `fromComponentInstanceId`, `toComponentInstanceId`: required → [Component instance](component-instance.md), `onDelete: Cascade`. This satisfies "An Interface must reference valid source and target Deployments."
- `protocolType`: `ConnectionProtocol` (`REST`, `SOAP`, `TCP`, `SFTP`, `GRPC`, `MQ`, `JDBC`, `OTHER`), plus `protocolDetail` and `port`.
- `origin`: `ConnectionOrigin` (`INGESTED`, `MANUAL`), default `INGESTED`. `confidence`: `ConnectionConfidence` (`HIGH`, `MED`, `LOW`), default `HIGH`.
- Provenance: `sourceSystem`, `sourceRecordId`, `ingestedAt`.

## Rules in practice

- "No silent inference of topology relationships" (invariant 4): `ConnectionOrigin` has no inferred value.
- **Inference:** nothing in the schema requires both instances to belong to the connection's environment, so cross-environment connections are possible at database level.
- `BaseConnectorV2.upsert()` skips a connection whose endpoints it cannot resolve, with a warning ("No dangling references allowed"). It matches on environment + from + to + protocol, and on update overwrites `protocolDetail`, `port` and `notes` (C-003). New rows get no `sourceRecordId` (C-019).

## Related

- The [Node and Edge](node-and-edge.md) model has its own `Edge`, with a different protocol enum and a numeric `confidenceScore` (C-012).
- Snapshots do not capture `Connection` rows (C-004). Only edges in the Node/Edge graph are diffed.
