---
title: Six pillars
type: concept
summary: The product structure from root CLAUDE.md, mapped to UI routes, API routes and open register entries.
tags: [product, navigation]
sources:
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: src/app/dashboard/layout.tsx
    blob: "6ccf804ef018"
  - path: docs/cost-budget.md
    blob: "cd424ee3a871"
updated: 2026-11-07
---

# Six pillars

Root `CLAUDE.md` structures the product into six pillars and requires that "Navigation must reflect these pillars explicitly". The dashboard navigation ([`layout.tsx`](../../../src/app/dashboard/layout.tsx)) lists Overview followed by the six pillars in the documented order. Route lists below come from the directory tree at commit `40ab818`.

| Pillar | Responsibility (root CLAUDE.md) | UI: `src/app/dashboard/…` | API: `src/app/api/…` | Open entries |
|--------|--------------------------------|---------------------------|----------------------|--------------|
| Environments | Truth layer: flow map, environment graph, systems and interfaces, version matrix, snapshots timeline, health overlay, settings | `environments/`: `overview`, `flow-map`, `new`, `[id]/` (`architecture`, `canvas`, `graph`, `health`, `map`, `settings`, `snapshots`, `systems`, `versions`, `view`) | `environments/`, `snapshots/`, `stages/`, `flow-links/`, `flow-map/`, `nodes/`, `components/`, `connections/`, `projects/` | C-002, C-004, C-005, C-010, C-012 |
| Governance | Alignment layer: blueprints, releases, alignment views, promotion readiness. "Governance logic must be deterministic. No workflow engines in MVP." | `governance/`: `alignment`, `approvals`, `blueprints`, `compliance`, `controls`, `coupling`, `exceptions`, `promotion-readiness`, `readiness`, `releases` | `governance/`: `approvals`, `blueprints`, `compliance`, `controls`, `coupling`, `exceptions`, `overview`, `readiness`, `releases`, `rules`, `violations` | C-001, C-008, C-015 |
| Impact | Risk layer: entry/exit detection, dependency paths, blast radius, change detection, stability index | `impact/`: `blast-radius`, `change-detection`, `dependency-paths`, `stability` | none (no `impact/` directory) | C-006 |
| Insight | Reporting layer: dashboard and deterministic reports (environment health, drift, cost, release compliance, flow health, stability risk, dependency criticality, test data integrity) | `insight/`: `dashboard`, `reports` | not mapped yet; reports live in `src/lib/services/insight/reports.ts` | C-016 |
| Organisation | Accountability layer: people registry, RACI, ownership views, orphaned assets | `organisation/`: `orphaned-assets`, `ownership`, `people`, `raci` | `organisation/`: `orphans`, `people`, `raci` | C-009 |
| Configuration | Control surface: connectors, flow templates, integration rules, platform settings, RBAC | `configuration/`: `connectors`, `flow-templates`, `integration-rules`, `platform-settings`, `systems` | `configuration/` (`connectors`, `settings`, `systems`), `flow-templates/`, `connectors/` | C-011 |

## Notes

- Pages: [Readiness](readiness.md), [Snapshot and drift](snapshot-and-drift.md), [Flow model](flow-model.md), [Connector framework](connector-framework.md), [RACI mapping](../entities/raci-mapping.md).
- RBAC: API routes check permissions with `requirePermission(Permission.…)`, for example `EDIT_ENVIRONMENT` on `POST /api/flow-links`. There is no RBAC page under `configuration/`.
- Governance has an approvals queue (`approvals`, with approve and reject endpoints). **Inference:** whether that counts as a "workflow engine" in the MVP sense is a product decision; it is not recorded as a contradiction.
- Outside the pillars: `cost/` ([Cost and budget module](../sources/cost-budget.md)), `data-governance/`, `data-intelligence/` (C-016), `connectors/` and `activity/` under the dashboard. At the top level: `flow-map`, `flow-map-v2`, `flow-map-yfiles`, `playground`, `yfiles-lab`, `landing-a` to `landing-e`, `landing-selector`, `login` and `connectors/health-status`. **Inference:** experiments and landing-page variants live next to the product shell.
