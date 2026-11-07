---
title: Release
type: entity
summary: Named, versioned grouping of target component versions, used for snapshot-versus-release alignment.
tags: [governance, versioning]
sources:
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: CLAUDE.md
    blob: "41c676bf6abe"
updated: 2026-11-07
---

# Release

Prisma models `Release` and `ReleaseItem` (tables `releases`, `release_items`). Root `CLAUDE.md`, Governance pillar: "Releases (target groupings)", with the alignment view "Snapshot vs Release".

## Fields

- `Release`: `name` + `version` (unique together), `description`, `status` (`PLANNING`, `IN_PROGRESS`, `READY`, `DEPLOYED`, `CANCELLED`), `targetDate`, `deployedAt`, `createdBy`.
- `ReleaseItem`: `releaseId` (required, `onDelete: Cascade`), optional `componentId` → `Component`, optional `blueprintId` → [Blueprint](blueprint.md), required `targetVersion` (string), `notes`.

## Observations

- A release targets catalog components (`Component`), not instances. **Inference:** "Snapshot vs Release" compares each `ReleaseItem.targetVersion` with the [Deployed version](deployed-version.md) of the matching instances in an environment. Snapshots do not contain versions yet (C-004).
- Not yet ingested: `src/lib/services/governance/release.ts` and the release pages.
