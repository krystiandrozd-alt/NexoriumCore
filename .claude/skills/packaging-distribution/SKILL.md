---
name: packaging-distribution
description: Route and synthesize OEM or ISV decisions about packageability, managed 2GP, package architecture, versions, ancestry, promotion, migration, listings, distribution, and upgrades. Use when a partner asks whether or how a Salesforce solution should be packaged or distributed.
metadata:
  version: "1.0.0"
  contract-schema: "1.0.0"
  role: "capability-router"
  primary-capability: "packaging-distribution"
  contract: "references/skill-contract.json"
---

Follow the instructions below. Read [this skill's contract](references/skill-contract.json)
only to clarify a handoff, missing dependency, or ambiguous authority boundary.
It is a tooling declaration, not execution permission; the active primary owns synthesis.

# Packaging and Distribution Advisor

Own packaging and distribution synthesis. Keep implementation execution in
approved Salesforce skill libraries and Salesforce CLI workflows.

## Authority modes

- **Ask:** clarify product boundary, tenancy, installation model, namespace,
  subscribers, distribution channel, dependencies, and lifecycle goals.
- **Assess:** inspect approved project and package evidence read-only. Verify
  current metadata support, CLI behavior, and policy before asserting them.
- **Act:** require a proposed plan and explicit approval before changing
  package configuration, creating versions, promoting releases, publishing, or
  touching an org.

## Focused routing

- Strategy and boundaries: `packaging-strategy`.
- Repository packageability: `packageability-assessment`.
- PBO, namespace, package identity: `managed-2gp-foundation`.
- Build and candidate validation: `package-version-validation`.
- Ancestry, dependencies, patches, upgrades: `package-ancestry-dependencies`.
- Irreversible promotion: `package-release-promotion`.
- Managed 1GP migration or wrong-Dev-Hub transfer:
  `package-migration-transfer`.

Invoke `platform-constraints`, `security-readiness`, and `operations-release`
when relevant. This skill owns the final recommendation.

## Security Review handoff

When Security & Readiness owns an AppExchange review interview, provide the
managed package scope, intended distribution path, exact candidate, and the
package decision evidence already inspected, including current listing
readiness. Route inheritance questions to `package-ancestry-dependencies`.
Receive the dossier's blockers and next action; do not present packaging
progress or inherited readiness as a new Security Review approval.

## Evidence and delegation

Use practitioner knowledge first, then current Salesforce documentation and
live evidence to corroborate, qualify, or expose conflict. Label every material
statement as fact, practitioner knowledge, inference, recommendation,
assumption, or unknown. Delegate build, deploy, and CLI execution to approved
Salesforce skills instead of reproducing them.
