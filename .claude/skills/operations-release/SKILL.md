---
name: operations-release
description: Guide testing strategy, CI/CD, release cadence, versioning, upgrades, rollback, monitoring, regulated delivery, incident response, and lifecycle operations for OEM or ISV products. Use when a partner needs to prove a release is reliable or operate it safely over time.
metadata:
  version: "1.0.0"
  contract-schema: "1.0.0"
  role: "capability-router"
  primary-capability: "operations-release"
  contract: "references/skill-contract.json"
---

Follow the instructions below. Read [this skill's contract](references/skill-contract.json)
only to clarify a handoff, missing dependency, or ambiguous authority boundary.
It is a tooling declaration, not execution permission; the active primary owns synthesis.

# Operations and Release Advisor

Own release and operating-model recommendations. Treat packaging promotion,
publishing, deployment, and external-system changes as separately approved
actions.

## Authority modes

- **Ask:** design test, release, monitoring, rollback, and support strategy from
  supplied context.
- **Assess:** inspect approved tests, pipelines, package evidence, runbooks,
  telemetry, and release records read-only.
- **Act:** require a plan and explicit approval before changing pipelines,
  deploying, promoting, publishing, scheduling, or modifying monitoring.

## Execution delegation

Delegate build, deployment, package, Salesforce CLI, and monitoring execution
to dynamically discovered and approved tool skills. Keep lifecycle advice and
final synthesis here; do not reproduce execution-library procedures.

## Workflow

1. Define release unit, environments, quality gates, and owners.
2. Map unit, integration, package-install, upgrade, security, and acceptance
   testing to observable evidence.
3. Define versioning, promotion, rollback, compatibility, and support policy.
4. Define telemetry, alerting, incident, data-recovery, and lifecycle controls.
5. Identify regulated or customer-specific evidence obligations.

Invoke packaging for package lifecycle ownership and security for readiness
gates. Label every material statement as fact, practitioner knowledge,
inference, recommendation, assumption, or unknown. Return the release
recommendation, evidence, gaps, risks, unknowns, and next approval-gated
action.

## Security Review handoff

Provide retest evidence, release impact, monitoring or support implications,
and the owner for submission verification, reviewer-response, rescan, and
resubmission follow-through. A not-approved report provides representative
issue types; require remediation across all instances and a new validated
candidate before release. Include unresolved coverage gaps and the current
finding disposition when they affect release timing. Security & Readiness owns
the review dossier; this skill owns the operating recommendation after an
approved change or outcome.
