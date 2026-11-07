---
title: Source ingestion strategy (docs)
type: source
summary: MVP ingestion design. Five-layer canonical model, seven connector types, normalization rules, conflict handling and run lifecycle.
tags: [ingestion, canonical-model]
sources:
  - path: docs/source-ingestion-strategy.md
    blob: "5abe417f9120"
updated: 2026-11-07
---

# Source ingestion strategy (docs)

[`docs/source-ingestion-strategy.md`](../../../docs/source-ingestion-strategy.md), read in full on 2026-11-07.

## Key claims

- **Canonical data model (five layers):** L1 NetworkContext, L2 Host, L3a Component, L3b ComponentInstance, L3c Endpoint, L4 DeployedVersion ("Project version (REQUIRED)"), L5 Connection. See [Five-layer model](../concepts/five-layer-model.md).
- **In scope for MVP:** Mock connector; Config Repository (YAML/JSON manifests); AWS, Azure and GCP adapters that read fixture JSON ("no real AWS API calls"); Terraform state (preferred); CSV import (fallback).
- **Out of scope:** ITSM/CMDB, CMDB relationship graphs, NSO intent/service state, agent-based discovery ("Architecture principle violation"), real-time monitoring, deployment orchestration, Kubernetes auto-discovery, GitOps live sync.
- **Exactly seven connector types:** Mock, Config Repository, Cloud-AWS, Cloud-Azure, Cloud-GCP, Terraform, CSV. "No custom connectors are added without schema/architecture review." The v2 code agrees; the README and the `ConnectorType` enum do not (C-011).
- **Normalization:** provenance (`sourceSystem`, `sourceRecordId`, `ingestedAt`) on all entities; protocols REST, SOAP, TCP, SFTP, GRPC, MQ, JDBC, OTHER; endpoint schemes TCP, HTTP, HTTPS, GRPC, JDBC, AMQP; component categories BSS, OSS, DATABASE, MESSAGING, INTEGRATION, SECURITY, MONITORING, OTHER.
- **Fixtures:** `fixtures/cloud/{aws,azure,gcp}/sit-environment.json`, `fixtures/config-repo/sit-topology.yaml`, `fixtures/terraform/sit-state.json`. All five exist.
- **Manual enrichment:** field overrides tracked in `AuditEvent`, notes fields, diagram layouts in `EnvironmentDiagram`.
- **Conflict handling:** ingestion that meets a manually edited field creates an `IngestionConflict`, and the user resolves it. Not implemented (C-003); see [Manual override protection](../concepts/manual-override-protection.md).
- **Run lifecycle:** `fetch()` → `map()` → `upsert()` (with conflict detection) → `report()`, tracked in `ConnectorRun`. No snapshot step (C-002).
- **Post-MVP:** Kubernetes connector, GitOps polling, webhooks, scheduled runs, snapshot diffing across ingestion runs.

## Agreement with the code

- The protocol and endpoint-scheme lists match the `ConnectionProtocol` and `EndpointScheme` enums exactly.
- The schema's `ComponentCategory` adds `INFRA` to the documented categories.
- Provenance is only partly written (C-019).
