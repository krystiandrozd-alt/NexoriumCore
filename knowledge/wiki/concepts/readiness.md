---
title: Readiness
type: concept
summary: Deterministic promotion readiness per environment. The definition has five components; the current evaluation passes every rule the database can hold.
tags: [governance, readiness]
sources:
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: prisma/seed/index.ts
    blob: "f7f803fd4ee5"
  - path: "src/app/api/governance/readiness/[envId]/route.ts"
    blob: "f7b12a8480a9"
updated: 2026-11-07
---

# Readiness

## Definition (root CLAUDE.md `<readiness_definition>`)

"Environment Readiness means: 1. Structural completeness 2. Version validity 3. Snapshot integrity 4. No broken topology 5. Governance alignment (if blueprint exists). Scoring must be deterministic."

## Implementation: `GET /api/governance/readiness/[envId]`

[Route](../../../src/app/api/governance/readiness/[envId]/route.ts):

1. Loads the environment with its stage and its component-instance count.
2. Selects active `GovernanceRule`s whose `targetStages` is empty or contains the environment's stage key.
3. Loads the latest snapshot.
4. `evaluateRule()` switches on `ruleType`: `SNAPSHOT_EXISTS` (a snapshot no older than 7 days), `MIN_COMPONENTS` (at least one instance), `NO_PROD_TYPE` (not `PROD_RO`). Any other type passes with "evaluation not implemented - defaulting to pass".
5. `score` = passed ÷ evaluated × 100, rounded (100 when there are no rules). `isReady` = no failed rule of severity `BLOCKER`. `warnings` counts failed `WARNING` rules; failed `ERROR` and `INFO` rules count in neither.
6. Nothing is persisted: the route writes no `RuleEvaluation` rows.

`GovernanceRuleType` holds `VERSION_CHECK`, `COMPONENT_PRESENCE`, `CONNECTION_REQUIRED`, `DATA_CLASSIFICATION`, `CUSTOM`, and the seed creates the first three. None of them matches a case in step 4, so every evaluation passes (C-001).

## Definition components against the code

| Component | Candidate rule type | Status |
|-----------|---------------------|--------|
| Structural completeness | `COMPONENT_PRESENCE` | Not evaluated |
| Version validity | `VERSION_CHECK` | Not evaluated; snapshots hold no versions (C-004) |
| Snapshot integrity | (`SNAPSHOT_EXISTS` in code, not in the enum) | Unreachable |
| No broken topology | `CONNECTION_REQUIRED` | Not evaluated |
| Governance alignment | Blueprint alignment ([Blueprint](../entities/blueprint.md)) | Not read by the route |

**Inference:** a failed `ERROR` rule leaves `isReady` true, so the severity scale (`INFO`, `WARNING`, `ERROR`, `BLOCKER`) needs a documented meaning for readiness.

Related: [Six pillars](pillars.md), [Snapshot and drift](snapshot-and-drift.md).
