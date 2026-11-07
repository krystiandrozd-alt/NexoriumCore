---
title: Connector framework
type: concept
summary: API-connector ingestion into the five-layer model. Required lifecycle, the two connector generations, run tracking, provenance and known gaps.
tags: [ingestion, configuration]
sources:
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: docs/source-ingestion-strategy.md
    blob: "5abe417f9120"
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: src/lib/connectors/v2/base-connector.ts
    blob: "c8d9de1a3ef0"
  - path: src/lib/connectors/v2/index.ts
    blob: "269b15950b57"
  - path: src/lib/connectors/v2/cloud-connector.ts
    blob: "5d2a7aa199ed"
  - path: src/lib/connectors/index.ts
    blob: "fed5ffa416c1"
  - path: src/app/api/connectors/route.ts
    blob: "39f58a6ed13e"
  - path: src/app/api/connectors/run/route.ts
    blob: "7c72abb291c4"
updated: 2026-11-07
---

# Connector framework

## Required (root CLAUDE.md)

- Principles: "API-connector-based ingestion only (NO agents)"; "Every ingestion run creates a version snapshot"; "Provenance must be stored for all ingested data".
- Each connector implements `fetch()`, `map()`, `upsert()`, `snapshot()`, `report()`. Rules: "Idempotent", "Never delete production data", "Store provenance metadata", "Log warnings instead of crashing".
- The [source ingestion strategy](../sources/source-ingestion-strategy.md) uses a four-step lifecycle (no `snapshot()`), seven connector types, and fixture-based cloud adapters for MVP.

## v2 connectors (five-layer model)

- [`BaseConnectorV2`](../../../src/lib/connectors/v2/base-connector.ts): subclasses implement `fetch()` and `map()`, which returns a canonical payload. The base class provides:
  - `upsert()`, in order: network contexts → hosts → components → component instances → endpoints → deployed versions → connections. Each item has its own error handling, so one bad record adds an error or warning instead of aborting the run.
  - `report()`, which returns the run summary (counts, warnings, errors).
  - `run()`, which creates a `ConnectorRun` (`RUNNING`), executes fetch → map → upsert (upsert is skipped on `dryRun`), and sets `SUCCESS`, `PARTIAL_SUCCESS` (errors present) or `FAILED` (exception), storing the summary JSON.
- Implementations: `mock`, `config-repo`, `cloud-<provider>` (AWS, Azure and GCP fixtures), `terraform`, `csv`. They run through [`POST /api/connectors/run`](../../../src/app/api/connectors/run/route.ts).
- Matching keeps re-runs from duplicating most entities. Network contexts and component instances match on `sourceRecordId` when the source gives an external ID, and otherwise on natural keys. Hosts always match on hostname within the environment, components on name, and endpoints and connections on natural keys. Deployed versions are the exception: every run inserts them (C-013).

## Earlier connectors (Node/Edge model)

[`createConnector()`](../../../src/lib/connectors/index.ts) builds `KubernetesConnector`, `GitOpsConnector` and `ManualConnector` (`discover()` returns `DiscoveredNode` and `DiscoveredEdge`). [`POST /api/connectors`](../../../src/app/api/connectors/route.ts) still runs them.

## Configuration pillar

The `Connector` model (`ConnectorType`: `KUBERNETES`, `GITOPS`, `CMDB`, `APM`, `MANUAL`, `CUSTOM`; status; credential; config and schedule JSON) and `IntegrationRule` (source field → target field, transform, priority) describe connectors for configuration. `ConnectorRun.connectorType` is free text (C-011).

## Provenance

New network contexts, hosts and component instances get `sourceSystem` (the connector type), `sourceRecordId` and `ingestedAt`. Endpoints, versions and connections get no `sourceRecordId`. Updates refresh only `ingestedAt` (C-019).

## Gaps

No snapshot step (C-002). No conflict detection (C-003; [Manual override protection](manual-override-protection.md)). Connector types differ between sources (C-011). Version rows are appended on every run (C-013).

**Inference:** the v2 connectors only read files and fixtures, so "Never delete production data" holds by construction today. Live API connectors will need an explicit guard.
