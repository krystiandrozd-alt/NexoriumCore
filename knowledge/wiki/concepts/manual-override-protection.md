---
title: Manual override protection
type: concept
summary: The rule that ingestion never silently overwrites manual edits. The schema has the conflict record; the connector code never creates it.
tags: [ingestion, audit, invariants]
sources:
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: docs/source-ingestion-strategy.md
    blob: "5abe417f9120"
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: src/lib/connectors/v2/base-connector.ts
    blob: "c8d9de1a3ef0"
updated: 2026-11-07
---

# Manual override protection

## Rules

- Root `CLAUDE.md` invariant 8: "Manual overrides must never be silently overwritten by ingestion." Invariant 5: "No hidden auto-corrections of data." Principle 5: "Manual enrichment must be audit-trailed."
- `docs/source-ingestion-strategy.md`: manual field overrides are tracked in `AuditEvent`. When ingestion meets a manually edited field, an `IngestionConflict` is created, the UI shows it, and the user chooses keep existing, accept incoming or manual merge.

## Schema support

- `AuditEvent`: `entityType`, `entityId`, `field`, `oldValue`, `newValue`, `action` (`CREATE`, `UPDATE`, `DELETE`, `MANUAL_OVERRIDE`, `CONFLICT_DETECTED`), `editedBy`, `editedAt`, `reason`.
- `IngestionConflict`: `entityType`, `entityId`, `field`, `existingValue`, `incomingValue`, `wasManuallyEdited`, `resolved`, `resolution` (`KEEP_EXISTING`, `ACCEPT_INCOMING`, `MANUAL_MERGE`), `connectorRunId`.
- `EnrichmentEdit`: manual enrichments, attached to `Node` (the [Node and Edge](../entities/node-and-edge.md) model).

## Implementation

[`BaseConnectorV2.upsert()`](../../../src/lib/connectors/v2/base-connector.ts) updates matched records directly and never consults `AuditEvent` or writes `IngestionConflict`. No code under `src/` references `ingestionConflict` (C-003).

## Option for the decision

**Inference**, not taken from any source: before each update, look up `AuditEvent` rows with `action = MANUAL_OVERRIDE` for the same entity and field. If the incoming value differs, write an `IngestionConflict` and skip the field. This uses only existing tables and keeps ingestion deterministic.

Related: [Connector framework](connector-framework.md), [Component instance](../entities/component-instance.md), [Connection](../entities/connection.md).
