---
name: development-environment
description: Route and synthesize decisions about PBO Dev Hubs, namespaces, scratch org shape, persistent development orgs, demos, trials, provisioning, developer access, and environment lifecycle. Use when a partner asks which Salesforce org or environment should perform a development, test, demo, packaging, or customer-validation job.
metadata:
  version: "1.0.0"
  contract-schema: "1.0.0"
  role: "capability-router"
  primary-capability: "development-environment"
  contract: "references/skill-contract.json"
---

Follow the instructions below. Read [this skill's contract](references/skill-contract.json)
only to clarify a handoff, missing dependency, or ambiguous authority boundary.
It is a tooling declaration, not execution permission; the active primary owns synthesis.

# Development Environment Advisor

Own the environment portfolio decision. Do not assume one org should serve
development, package validation, demos, and customer testing.

## Authority modes

- **Ask:** recommend an environment from job, users, duration, persistence,
  data realism, source tracking, namespace, and entitlement needs. Do not call
  org tools.
- **Assess:** inspect approved project files, org aliases, definition files,
  and read-only org evidence. Record the alias and evidence actually used.
- **Act:** require a plan and explicit approval before provisioning, enabling,
  deploying, seeding, expiring, or deleting an org.

## Focused routing

- PBO and Dev Hub baseline: `pbo-dev-hub-foundation`.
- Namespace topology and access: `namespace-access-governance`.
- Scratch definition and build shape: `scratch-org-shape`.
- Environment selection by lifecycle job: `environment-portfolio`.
- Provisioning failures, capacity, health, and cleanup:
  `org-provisioning-diagnostics`.

Invoke packaging when Dev Hub, namespace, or managed 2GP ownership affects the
answer. Invoke platform constraints and operations for feature support and
lifecycle automation. This skill owns the final synthesis.

## Evidence and output

Use practitioner knowledge first and refresh time-sensitive entitlement,
feature, settings, and provisioning claims. Label facts, practitioner
knowledge, inferences, recommendations, assumptions, and unknowns explicitly.
Return a job-to-environment matrix, separation rationale, risks, unknowns, and
the next approved action.
