---
title: Root CLAUDE.md (project instructions)
type: source
summary: Product definition, six pillars, architectural invariants and engineering rules; the most complete statement of intent in the repository.
tags: [intent]
sources:
  - path: CLAUDE.md
    blob: "41c676bf6abe"
updated: 2026-11-07
---

# Root CLAUDE.md (project instructions)

[`CLAUDE.md`](../../../CLAUDE.md), read in full on 2026-11-07. Every Claude Code session in this repository loads it. In practice it is the product specification.

## Key claims

- **Positioning:** "Nexorium Core is the architectural control layer for non-production environments." It does not perform deployment, monitoring/observability, CI/CD orchestration or production control. "Production may be connected in READ-ONLY mode only."
- **Scope test:** a feature that "does not strengthen environment truth, governance alignment, impact visibility, or accountability" is out of scope.
- **Six pillars**, which "Navigation must reflect … explicitly": Environments, Governance, Impact, Insight, Organisation, Configuration. See [Six pillars](../concepts/pillars.md).
- **Eight architectural invariants**, quoted on the pages they govern: canonical model as single source of truth; immutable snapshots; snapshot-to-snapshot diffs only; no silent inference of topology; no hidden auto-corrections; PROD_RO strictly read-only; traceable version changes; manual overrides never silently overwritten by ingestion.
- **Architecture principles:** API-connector ingestion only ("NO agents"); every ingestion run creates a version snapshot; manual enrichment is audit-trailed; provenance is stored for all ingested data. See [Connector framework](../concepts/connector-framework.md).
- **Data-integrity rules** use the terms Deployment, Endpoint and Interface. The [glossary](../glossary.md) maps them to Prisma models.
- **Readiness** has five components, and "Scoring must be deterministic". See [Readiness](../concepts/readiness.md).
- **Flow model:** environments belong to a stage; `EnvironmentLink` defines upstream → downstream; flow templates define allowed transitions; branching is supported. See [Flow model](../concepts/flow-model.md).
- **Engineering standards:** TypeScript only, strict typing, Zod; UUID primary keys; "Use migrations"; "No denormalized JSON blobs for core entities"; at least 70% global and 85% core-logic test coverage.
- **Tone:** no buzzwords, no "intelligence", no "insight", no "360", no hype.
- **Knowledge base:** `<knowledge_base>` points sessions to this wiki. It was added on 2026-11-07, together with the wiki.

## Where the implementation disagrees

Entries that conflict with a rule stated in this file: C-001, C-002, C-003, C-004, C-005, C-007, C-008, C-010, C-012, C-013, C-015, C-016, C-019 and C-020. See the [contradictions register](../contradictions.md).

## Notes

- The file states rules ("must", "never") without marking which are implemented. **Inference:** it describes the target state, not the current build.
- Environment types: it lists DEV, SIT, UAT, PREPROD and PROD_RO. The schema also has NFT.
