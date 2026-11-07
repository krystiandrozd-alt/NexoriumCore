---
title: Overview
type: overview
summary: What Nexorium Core is meant to be, what the code does at commit 40ab818, and where the two diverge.
sources:
  - path: CLAUDE.md
    blob: "41c676bf6abe"
  - path: README.md
    blob: "b9478f9750ab"
  - path: docs/source-ingestion-strategy.md
    blob: "5abe417f9120"
  - path: docs/cost-budget.md
    blob: "cd424ee3a871"
  - path: prisma/schema.prisma
    blob: "7cc612c38c35"
  - path: package.json
    blob: "16a340f70e2d"
  - path: src/app/dashboard/layout.tsx
    blob: "6ccf804ef018"
updated: 2026-11-07
---

# Overview

## Intent

Nexorium Core is "the architectural control layer for non-production environments" ([root CLAUDE.md](sources/claude-md.md)). It records what each environment is composed of: systems, interfaces, hosting and deployed versions. It snapshots that state, detects drift, checks alignment with blueprints and releases, computes impact and records ownership. It does not deploy, monitor, run CI/CD or control production; production is connected read-only. Six pillars structure the product: [Environments, Governance, Impact, Insight, Organisation, Configuration](concepts/pillars.md).

## Build state at commit 40ab818

- Next.js 14 (App Router) with API routes, Prisma on PostgreSQL, and Supabase client libraries (`package.json`).
- The dashboard navigation shows Overview plus the six pillars, and every pillar has UI pages.
- The schema has 60 models with two topology models side by side: the [Node and Edge graph](entities/node-and-edge.md) and the [five-layer model](concepts/five-layer-model.md) (C-012).
- The v2 [connectors](concepts/connector-framework.md) cover mock data, config repositories, AWS, Azure and GCP fixtures, Terraform state and CSV, and write the five-layer model. Cloud adapters read fixtures, not live APIs.
- A [cost and budget module](sources/cost-budget.md) sits outside the six pillars.

## Where intent and code diverge

The [contradictions register](contradictions.md) has 19 open entries, 6 of them high severity. The high ones cluster around the core promises:

1. Readiness reports "ready" for every environment (C-001). See [Readiness](concepts/readiness.md).
2. Ingestion takes no snapshot and does not protect manual edits (C-002, C-003).
3. Snapshots capture only the Node/Edge graph, so drift cannot see versions, endpoints or interfaces (C-004). See [Snapshot and drift](concepts/snapshot-and-drift.md).
4. PROD_RO is read-only only at the environment record (C-005).
5. The Impact pages call API routes that do not exist (C-006).

CI cannot install dependencies, so none of this has been caught by automated checks (C-014).

**Inference:** the six-pillar UI is ahead of the data layer. The decision with the most leverage is C-012, which topology model is canonical, because snapshots, drift, impact and readiness all depend on it.

## Using this wiki

- Start at the [index](index.md). The [glossary](glossary.md) maps CLAUDE.md terms to Prisma models.
- Pages cite sources by git blob id. `npm run wiki:lint` flags pages whose sources changed; `/wiki-lint` refreshes them.
- The first pass did not read the governance, insight, organisation, cost and security services ([implementation scan](sources/code-scan-40ab818.md), "Not yet read").
