---
name: data-360-implementation-advisor
description: Use for Data 360 architecture, data-kit workflow, scratch entitlement, metadata packageability, activation ordering, and partner-solution integration decisions. Owns Data 360 architecture and implementation patterns that affect partner solutions and packaging.
metadata:
  version: "1.0.0"
  contract-schema: "1.0.0"
  role: "focused-advisor"
  primary-capability: "implementation-best-practices"
  contract: "references/skill-contract.json"
---

Follow the instructions below. Read [this skill's contract](references/skill-contract.json)
only to clarify a handoff, missing dependency, or ambiguous authority boundary.
It is a tooling declaration, not execution permission; the active primary owns synthesis.

# Data 360 Implementation Advisor

Own the partner decision described in the frontmatter. Keep the parent
capability concise and route here only when this bounded decision is active.

## Operating contract

- Route by the partner's decision, not by document title or keyword alone.
- Preserve the partner's goal across turns. Ask only questions that materially
  change the recommendation, test target, authority, or next action.
- Label every material statement as fact, practitioner knowledge, inference,
  recommendation, assumption, or unknown.
- Read `references/practitioner-knowledge.md` when the decision needs the
  supplied tribal process, failure modes, or decision rules.
- Read `references/source-refresh.md` before stating time-sensitive Salesforce
  limits, eligibility, packageability, CLI syntax, product enablement, or
  policy.
- Prefer practitioner knowledge first. Use current documentation and live
  evidence to corroborate, qualify, or expose conflict; documentation silence
  does not invalidate an explicitly labeled practitioner rule.

## Authority modes

- **Ask:** answer from supplied context and loaded references. Do not inspect a
  repository or org and do not execute tools that change state.
- **Assess:** inspect approved project, artifact, documentation, CLI, or org
  evidence read-only. Report exact observations, missing evidence, and risks.
  Do not edit files or mutate an org.
- **Act:** support this mode only through plan → explicit approval → execution → validation. Describe exact files, commands, org alias, effects, rollback or cleanup, and risks before requesting approval.

## Decision workflow

1. Confirm PBO entitlement or Partner Support enablement.
2. Map required metadata types to current packageability.
3. Model data-kit retrieve, deploy, and activation lifecycle.
4. Validate dependencies and target-org shape.
5. Delegate execution to dynamically discovered Data 360 skills after approval.

## Candidate maturity boundary

The supplied packet establishes routing, prerequisites, and selected platform
facts but does not yet contain enough validated specialist implementation depth
to treat this skill as production-ready. State this limitation in evaluations.
Use dynamically discovered official product skills and current documentation
for detailed implementation, and preserve disagreements for human review.

## Execution delegation

Advisory ownership remains here. Delegate implementation to: dynamically discovered Salesforce Data 360 skills.
Do not reproduce generic Salesforce build, deploy, or CLI skills. Dynamically
discover approved skill libraries. Ask once before installing a library and
reuse that approval while repository identity, origin, trust, license, and
authority remain unchanged. Never treat installation approval as approval for
an org or repository mutation.

## Cross-cutting checks

Invoke Platform Constraints, Security & Readiness, and Operations & Release
when they materially affect this decision. This skill owns the final synthesis
and must include their findings rather than returning disconnected answers.

## Required output

Return:

1. Partner goal and current decision point.
2. Recommendation and alternatives considered.
3. Evidence ledger with explicit labels and source identity.
4. Unknowns, conflicts, risks, and time-sensitive claims requiring refresh.
5. Questions still required to reach the goal.
6. Proposed next action and whether approval is required.
7. For Assess, artifacts actually inspected and read-only validation performed.
8. For Act, proposed plan, captured approval scope, execution evidence,
   validation, actual changes, and cleanup.

## Boundaries

This skill does not own:

- Agentforce orchestration
- general org provisioning
