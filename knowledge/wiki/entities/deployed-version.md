---
title: Deployed version
type: entity
summary: Version record of a component instance. project_version is required, vendor_version optional; every ingestion run appends a row.
aliases: [DeployedVersion, project_version, vendor_version]
tags: [canonical-model, five-layer, versioning]
sources:
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: src/lib/connectors/v2/base-connector.ts
    blob: "c8d9de1a3ef0"
  - path: src/lib/services/snapshot.ts
    blob: "5158b5bd7173"
updated: 2026-11-07
---

# Deployed version

Prisma model `DeployedVersion` (table `deployed_versions`), layer L4 of the [five-layer model](../concepts/five-layer-model.md).

## Fields

- `componentInstanceId`: required → [Component instance](component-instance.md), `onDelete: Cascade`.
- `projectVersion`: required. `vendorVersion`, `buildRef`: optional. `capturedAt` defaults to the insert time.
- Provenance: `sourceSystem`, `sourceRecordId`, `ingestedAt`.

This matches root `CLAUDE.md` `<versioning_rules>`: every Deployment exposes `vendor_version` (optional) and `project_version` (required).

## Behaviour

- `BaseConnectorV2.upsert()` inserts a new row for every version in the payload, on every run: "Always create a new deployed version entry (versions are historical)". It sets `sourceSystem` and `ingestedAt` but not `sourceRecordId` (C-013, C-019).
- Snapshots do not include versions (C-004), so "Version changes" cannot be diffed snapshot-to-snapshot yet. See [Snapshot and drift](../concepts/snapshot-and-drift.md).

## Open questions

- **Inference:** the current version of an instance is the row with the latest `capturedAt`. How the Version Matrix page (`/dashboard/environments/[id]/versions`) chooses it was not read.
- **Inference:** "Snapshot vs Release" alignment would compare `projectVersion` with `ReleaseItem.targetVersion` ([Release](release.md)). Version comparison rules ("must be deterministic") are not specified anywhere: string equality, semantic versioning or another scheme.
