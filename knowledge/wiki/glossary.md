---
title: Glossary
type: glossary
summary: Maps the three topology vocabularies (root CLAUDE.md, five-layer docs, README) to Prisma models, plus governance, accountability and stage terms.
sources:
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: README.md
    blob: "b9478f9750ab"
  - path: docs/source-ingestion-strategy.md
    blob: "5abe417f9120"
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: src/app/api/configuration/systems/route.ts
    blob: "32e52e334260"
updated: 2026-11-07
---

# Glossary

The same concepts carry different names in root `CLAUDE.md`, the five-layer docs and the README (C-012). Prisma model names are what the code uses; wiki pages put them in code font.

## Topology

| Root CLAUDE.md | Five-layer docs | README (Node/Edge) | Prisma model | Page |
|----------------|-----------------|--------------------|--------------|------|
| Environment | Environment | Environment | `Environment` | [Environment](entities/environment.md) |
| Stage | — | — | `Stage` | [Flow model](concepts/flow-model.md) |
| EnvironmentLink | — | — | `EnvironmentLink` | [Flow model](concepts/flow-model.md) |
| System | Component (L3a) | (part of a Node) | `Component` | [Five-layer model](concepts/five-layer-model.md) |
| Deployment | ComponentInstance (L3b) | Node | `ComponentInstance` | [Component instance](entities/component-instance.md) |
| Endpoint | Endpoint (L3c) | — (Edge has `port`, `pathOrTopic`) | `Endpoint` | [Five-layer model](concepts/five-layer-model.md) |
| project_version, vendor_version | DeployedVersion (L4) | — | `DeployedVersion.projectVersion`, `.vendorVersion` | [Deployed version](entities/deployed-version.md) |
| Interface | Connection (L5) | Edge | `Connection` | [Connection](entities/connection.md) |
| Hosting/network context | NetworkContext (L1), Host (L2) | — | `NetworkContext`, `Host` | [Five-layer model](concepts/five-layer-model.md) |
| Snapshot | — | EnvironmentSnapshot | `EnvironmentSnapshot` | [Environment snapshot](entities/environment-snapshot.md) |

"System" maps to `Component` because the Configuration screen for systems reads and writes `Component` records ([`/api/configuration/systems`](../../src/app/api/configuration/systems/route.ts)).

## Governance and accountability

| Term | Prisma model | Page |
|------|--------------|------|
| Blueprint (expected state) | `Blueprint` | [Blueprint](entities/blueprint.md) |
| Release (target grouping) | `Release`, `ReleaseItem` | [Release](entities/release.md) |
| Alignment view | `AlignmentComparison` | [Blueprint](entities/blueprint.md) |
| Governance rule, readiness | `GovernanceRule`, `RuleEvaluation` | [Readiness](concepts/readiness.md) |
| RACI (Responsible, Accountable, Consulted, Informed) | `RACIMapping`, `Person` | [RACI mapping](entities/raci-mapping.md) |
| Orphaned asset | `OrphanedAsset` | [RACI mapping](entities/raci-mapping.md) |
| Connector, connector run | `Connector`, `ConnectorRun` | [Connector framework](concepts/connector-framework.md) |
| Manual override, ingestion conflict | `AuditEvent`, `IngestionConflict` | [Manual override protection](concepts/manual-override-protection.md) |

## Environment types and stages

The values are from `EnvironmentType` and `StageKey`; the sources do not define the abbreviations, so the expansions below are common industry usage. DEV: development. SIT: system integration test. UAT: user acceptance test. NFT: non-functional test (performance, resilience). PREPROD: pre-production. PROD_RO: production, connected read-only ([PROD_RO read-only](concepts/prod-ro-read-only.md)).

## Layers

- BSS (business support systems) and OSS (operations support systems): root `CLAUDE.md` describes a "Layered architecture (BSS → OSS → Network)".
- `ArchitectureLayer` on `Component`: `BSS`, `OSS`, `INFRA`, `EXTERNAL`, `UNKNOWN`.
- `TelcoLayer` on `Node`: `BSS`, `OSS`, `NETWORK`, `SHARED`, `EXTERNAL`.
