---
title: PROD_RO read-only
type: concept
summary: Production may only be connected read-only. Two meanings are involved, and only the environment record itself is guarded in code.
tags: [invariants, environments, security]
sources:
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: "src/app/api/environments/[id]/route.ts"
    blob: "b85a42cdce34"
  - path: src/app/api/environments/route.ts
    blob: "d1ffc2c16bad"
  - path: "src/app/api/governance/readiness/[envId]/route.ts"
    blob: "f7b12a8480a9"
updated: 2026-11-07
---

# PROD_RO read-only

## Rules (root CLAUDE.md)

"Production may be connected in READ-ONLY mode only." Invariant 6: "Production environments (PROD_RO) are strictly read-only." Connector rule: "Never delete production data."

**Inference:** two meanings are involved.

1. Nexorium never writes to production systems. Connectors only read.
2. A `PROD_RO` environment's data in Nexorium is not manually editable. Ingestion and snapshots still refresh it, because that is reading production.

## Implementation (commit `40ab818`)

- [`/api/environments/[id]`](../../../src/app/api/environments/[id]/route.ts): `PUT`, `PATCH` and `DELETE` return 403 for `PROD_RO`.
- [`POST /api/environments`](../../../src/app/api/environments/route.ts) can create `PROD_RO` environments.
- The readiness rule `NO_PROD_TYPE` would fail promotion from `PROD_RO`, but no stored rule type reaches it (C-001).
- Manual map nodes and edges and node enrichments have no `PROD_RO` check (C-005).

## What a fix needs

**Inference:** one server-side guard, for example `assertWritable(environmentId)`, called by every route that mutates environment-scoped data, plus one test per route. This also settles meaning 2 explicitly.

Related: [Environment](../entities/environment.md), [Connector framework](connector-framework.md).
