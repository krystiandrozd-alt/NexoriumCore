---
title: RACI mapping
type: entity
summary: Assigns a person a Responsible, Accountable, Consulted or Informed role on an asset. The schema only lets the asset be an environment.
aliases: [RACI, RACIMapping]
tags: [organisation, accountability]
sources:
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: src/app/api/organisation/raci/route.ts
    blob: "31b267e6b646"
  - path: src/app/api/configuration/systems/route.ts
    blob: "32e52e334260"
updated: 2026-11-07
---

# RACI mapping

Prisma model `RACIMapping` (table `raci_mappings`). Root `CLAUDE.md`, Organisation pillar: "RACI mapping (R/A/C/I)". RACI = Responsible, Accountable, Consulted, Informed (`RACIRole`).

## Fields

- `personId` → `Person` (`onDelete: Cascade`). `Person` has a unique `email`, `displayName`, `department`, `team`, `role`, `status` (`ACTIVE`, `INACTIVE`, `EXTERNAL`) and `externalId`.
- `entityType`: `AssetEntityType` (`ENVIRONMENT`, `COMPONENT`, `COMPONENT_INSTANCE`, `HOST`, `CONNECTION`). `entityId`: string.
- `raciRole`, `notes`, `assignedBy`, `assignedAt`, `expiresAt`.
- Unique on (`personId`, `entityType`, `entityId`, `raciRole`).
- The `environment` relation on `entityId` (constraint `raci_environment`, `onDelete: Cascade`) restricts `entityId` to environment IDs (C-009).

## API

[`POST /api/organisation/raci`](../../../src/app/api/organisation/raci/route.ts) validates with Zod, accepts any `AssetEntityType`, rejects duplicate assignments, and allows "Only one person can be Accountable per entity".

## Ownership is modelled four ways

1. `RACIMapping`: person, role and asset.
2. `Component.itOwnerId`, `productOwnerId`, `devOpsLeadId` → `Person` (`onDelete: SetNull`). `/api/configuration/systems` reads and writes them.
3. `EnvironmentOwnership`: free-text `ownerTeam`, `ownerEmail`, `technicalLead` and related fields, one row per environment.
4. `Node.owner`: free text, in the [Node and Edge](node-and-edge.md) model.

**Inference:** orphaned-asset detection (`OrphanedAsset`) and ownership views have to choose among these, and nothing keeps them consistent. Open question: which representation is authoritative?
