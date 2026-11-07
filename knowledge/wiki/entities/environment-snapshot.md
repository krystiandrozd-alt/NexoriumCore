---
title: Environment snapshot
type: entity
summary: Point-in-time JSON capture of an environment with a hash. Created on request and never updated, but it covers only the Node/Edge graph.
aliases: [Snapshot, EnvironmentSnapshot]
tags: [environments, drift]
sources:
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: src/lib/services/snapshot.ts
    blob: "5158b5bd7173"
  - path: src/app/api/snapshots/route.ts
    blob: "95326f74f458"
updated: 2026-11-07
---

# Environment snapshot

Prisma model `EnvironmentSnapshot` (table `environment_snapshots`).

## Fields

- `environmentId`: required, `onDelete: Cascade` (C-018).
- `snapshotHash`: string. `snapshotData`: JSON (C-015). `createdAt`.
- No `updatedAt`, consistent with "Snapshots are immutable".
- Referenced by `RuleEvaluation.snapshotId` and `AlignmentComparison.snapshotId`.

## How snapshots are made

- Only [`POST /api/snapshots`](../../../src/app/api/snapshots/route.ts) creates them, through [`createSnapshot(environmentId)`](../../../src/lib/services/snapshot.ts). Ingestion runs do not (C-002).
- Content: `nodes` (with database metadata and test data sets), `edges`, `databases`, `testDataSets`, hashed with `generateSnapshotHash()`. No five-layer data (C-004).
- Comparison: `src/lib/services/snapshot.ts` diffs nodes and edges between two snapshots. For example, it flags an edge whose confidence score dropped by more than 0.2 (`confidenceDropped`).

## Where snapshots are consumed

- Readiness has a `SNAPSHOT_EXISTS` rule (7 days), but no stored rule type can reach it (C-001). See [Readiness](../concepts/readiness.md).
- Impact `detectChanges()` expects a `components` key that snapshots do not contain (C-004).

See [Snapshot and drift](../concepts/snapshot-and-drift.md).
