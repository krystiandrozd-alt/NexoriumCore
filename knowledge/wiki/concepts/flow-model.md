---
title: Flow model
type: concept
summary: Stages, environment links (upstream to downstream, branching allowed) and flow templates. Transition validation exists in code but is not wired in.
tags: [environments, flow]
sources:
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: src/lib/services/flow-map.ts
    blob: "4300d996f9a3"
  - path: src/app/api/flow-links/route.ts
    blob: "72b26c7a50d1"
updated: 2026-11-07
---

# Flow model

## Rules (root CLAUDE.md `<flow_model_rules>`)

"Environments belong to a Stage." "EnvironmentLink defines upstream → downstream." "Flow Map must auto-update on link changes." "Flow templates define allowed transitions." "Invalid transitions must be blocked unless override permission exists." "Branching environments must be supported."

## Schema

- `Stage`: `key` (`StageKey`: `DEV`, `SIT`, `UAT`, `NFT`, `PREPROD`, `PROD_RO`, unique), `name`, `sortOrder`, `color`.
- `EnvironmentLink`: `upstreamEnvironmentId` → `downstreamEnvironmentId`, unique per pair; `linkType` (`PROMOTION` default, `DATA_SYNC`, `REFERENCE`); `isActive`. An environment can have several downstream links, which is how branching (for example SIT1 and SIT2) is supported.
- `FlowTemplate` (`DRAFT`, `ACTIVE`, `DEPRECATED`; `isDefault`) with ordered `FlowTemplateStage` rows (`sortOrder`, `isRequired`). A template is an ordered list of stages, not a list of allowed transitions.
- Flow map persistence: `FlowMapLayout`, `ManualFlowMapNode`, `ManualFlowMapEdge`.
- `Environment.stageId` is optional (C-010).

## Code

- [`POST /api/flow-links`](../../../src/app/api/flow-links/route.ts): requires `EDIT_ENVIRONMENT`, validates with Zod, rejects self-links, creates the link.
- [`validateFlowLink()`](../../../src/lib/services/flow-map.ts): a link is valid when the downstream stage comes after the upstream stage in any `ACTIVE` template; otherwise it falls back to `Stage.sortOrder`; links involving an environment without a stage are always valid. Nothing calls it (C-008).
- Not yet verified: "Flow Map must auto-update on link changes" (UI behaviour).

Related: [Environment](../entities/environment.md), [Six pillars](pillars.md).
