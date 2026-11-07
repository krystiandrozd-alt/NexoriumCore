---
title: Snapshot and drift
type: concept
summary: How environment state is frozen and compared. The rules require snapshot-to-snapshot diffs of versions, endpoints and interfaces; the code diffs the Node/Edge graph only.
tags: [drift, environments, impact]
sources:
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: docs/source-ingestion-strategy.md
    blob: "5abe417f9120"
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: src/lib/services/snapshot.ts
    blob: "5158b5bd7173"
  - path: src/lib/services/impact/index.ts
    blob: "68fa35f76b91"
updated: 2026-11-07
---

# Snapshot and drift

## Rules (root CLAUDE.md)

- Invariants: "Snapshots are immutable." "All diffs are snapshot-to-snapshot only." "All version changes must be traceable."
- "Every ingestion run creates a version snapshot."
- "Diff must detect: Version changes, Endpoint changes, Interface changes, Component additions/removals." "Version comparisons must be deterministic."
- Drift appears in three places: Governance alignment views (blueprint vs snapshot, snapshot vs release, cross-environment, non-prod vs prod), the Impact change detection, and the Insight drift report.

## Implementation (commit `40ab818`)

| Step | Code | Gap |
|------|------|-----|
| Capture | `POST /api/snapshots` → `createSnapshot()`: Node/Edge graph, database metadata, test data sets, plus a hash | No five-layer data (C-004). Ingestion does not snapshot (C-002). |
| Compare | `compareSnapshots()` in `src/lib/services/snapshot.ts`: added, removed and modified nodes and edges. It compares node `type`, `owner`, `criticality` and edge `port`, `pathOrTopic`, `confidenceScore`; for example, `confidenceDropped` when an edge's confidence falls by more than 0.2 | Compares no version field; no five-layer data |
| Change detection | `detectChanges()` in `src/lib/services/impact/index.ts` compares `snapshotData.components` | That key is never written (C-004); no route exposes the function (C-006) |
| Alignment | `AlignmentComparison` stores the four comparison types with aligned, drifted, missing and extra counts | The comparison services were not read yet ([Blueprint](../entities/blueprint.md)) |
| Retention | `EnvironmentSnapshot` cascades with its environment; `deleteSnapshot()` exists | C-018 |

## Assessment

**Inference:** drift detection, the product's core promise, is currently limited to the [Node and Edge](../entities/node-and-edge.md) graph. Making it work on the [five-layer model](five-layer-model.md) needs three things together:

1. the canonical model decision (C-012);
2. a snapshot payload that includes instances, endpoints, versions and connections;
3. one diff function that the snapshot API, Impact and Insight all share.

Related: [Environment snapshot](../entities/environment-snapshot.md), [Deployed version](../entities/deployed-version.md).
