---
title: CI install failure (2026-11-07)
type: source
summary: Captured evidence that npm ci fails on main because package.json and package-lock.json are out of sync.
tags: [delivery]
sources:
  - path: knowledge/raw/2026-11-07-npm-ci-lockfile-error.md
    blob: "63c8d364489b"
  - path: .github/workflows/ci.yml
    blob: "c6abac2703d3"
  - path: package.json
    blob: "16a340f70e2d"
updated: 2026-11-07
---

# CI install failure (2026-11-07)

Raw source: [2026-11-07-npm-ci-lockfile-error.md](../../raw/2026-11-07-npm-ci-lockfile-error.md), captured while the wiki was set up. It includes a local `npm ci` at commit `40ab818` and the log of CI run 42340845363.

## Key claims

- `npm ci` refuses to install: package.json and package-lock.json are not in sync. The lock file lacks entries such as `workerize-loader@2.0.2` and `webpack@5.112.2`.
- CI run 42340845363 failed at "Install dependencies" with the same kind of list, and the type check and ESLint were skipped. The five most recent CI runs all failed.
- [`ci.yml`](../../../.github/workflows/ci.yml) runs `npm ci` in the lint, test, E2E and build jobs, and gates merges on lint, test and build ("CI Complete").

## Consequences

C-014. **Inference:** no test, type check or build result from CI can be relied on until installation works. That includes the wiki integrity test added with this wiki.
