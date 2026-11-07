---
title: Cost and budget module (docs)
type: source
summary: Cost tracking, rollups and what-if simulation for non-production environments; explicitly not a FinOps platform.
tags: [cost]
sources:
  - path: docs/cost-budget.md
    blob: "cd424ee3a871"
updated: 2026-11-07
---

# Cost and budget module (docs)

[`docs/cost-budget.md`](../../../docs/cost-budget.md), read in full on 2026-11-07.

## Key claims

- Purpose: understand and simulate the cost of non-production environments (for example CPQ, ITSM and OSS stacks). "This module is designed for test environments only and is NOT a full FinOps platform."
- Entities: `CostModel`, `CostItem` (types `HOST`, `COMPONENT_LICENSE`, `SHARED_PLATFORM`, `OTHER`), `EnvironmentCostOverride`, `EnvironmentCostAllocation`, `CostSimulation`.
- Calculation: direct items cost `quantity * unit_cost`, with quantity per environment, per host or per component instance; shared items are split equally across the selected environments; a fixed monthly override takes precedence.
- Assumptions: currency USD by default (USD, EUR, GBP and NOK supported, one per model); monthly period; environment "family" inferred from component capability types; hosting type taken from `NetworkContext.hostingType`.
- Audit: override changes are written to `audit_events`.
- UI: `/dashboard/cost`, `/dashboard/cost/models`, `/dashboard/cost/simulator`, `/dashboard/cost/environments/[id]`.
- Limitations: no cloud billing integration, no chargeback, no optimization recommendations, no trend history, equal-split sharing only.

## Position in the product

- Cost sits outside the six pillars. Root `CLAUDE.md` mentions it only as a "Cost analysis" report under Insight and "Cost engine math (if active)" in the test plan. See [Six pillars](../concepts/pillars.md).
- Its tables have no migration (C-007).
- **Inference:** quantities depend on host and component-instance counts, so cost figures inherit the five-layer data quality issues listed in the [register](../contradictions.md).
