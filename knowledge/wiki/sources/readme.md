---
title: README
type: source
summary: Public project description, setup steps, API reference and domain model; partly superseded by the code (C-017).
tags: [documentation]
sources:
  - path: README.md
    blob: "b9478f9750ab"
updated: 2026-11-07
---

# README

[`README.md`](../../../README.md), read in full on 2026-11-07.

## Key claims

- Same positioning line as root `CLAUDE.md`. It frames two problems: "Structural Ambiguity" (no authoritative view of what exists across SIT/UAT/NFT) and "Governance Gaps" (no way to enforce alignment with blueprints, releases or standards).
- Capabilities: environment modelling, governance alignment, cross-environment visibility, structural accountability, controlled change (snapshots, comparison, readiness).
- Connectors: Kubernetes (read-only namespace discovery), GitOps (manifest repositories), Manual YAML Import. These differ from the docs and the v2 code (C-011).
- Visualization: layered BSS → OSS → Network views, filters by owner, protocol and node type, SVG/PNG export.
- Tech stack: Next.js 14 App Router, TypeScript, React, TailwindCSS, React Flow; Next.js API routes; PostgreSQL with Prisma.
- Setup: `npx prisma generate`, then `npx prisma db push` (C-007); seed with `ts-node`; dev server on port 3003.
- API reference: environments, snapshots, test data sets, connectors.
- Domain model: Environment, Node, Edge, DatabaseMetadata, TestDataSet, Evidence, EnvironmentSnapshot. This is the [Node and Edge](../entities/node-and-edge.md) model; the five-layer model is not mentioned (C-012).
- License: MIT.

## Assessment

**Inference:** the README describes the product as it was before the five-layer model, the six pillars and the governance features were added. C-017 lists what is out of date.
