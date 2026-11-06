---
name: package-version-validation
description: Use when creating or diagnosing managed 2GP package versions, internal build-org shape, validation timing, code coverage, installation keys, and candidate test evidence. Owns Build-org shape, validation mode, code coverage, installation keys, candidate testing, and version-create diagnostics.
metadata:
  version: "1.0.0"
  contract-schema: "1.0.0"
  role: "focused-advisor"
  primary-capability: "packaging-distribution"
  contract: "references/skill-contract.json"
---

Follow the instructions below. Read [this skill's contract](references/skill-contract.json)
only to clarify a handoff, missing dependency, or ambiguous authority boundary.
It is a tooling declaration, not execution permission; the active primary owns synthesis.

# Package Version Validation

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

1. Resolve effective project and CLI configuration.
2. Validate build-org edition, features, settings, and entitlements.
3. Choose standard, async, or skipped validation deliberately.
4. Choose installation-key policy without exposing secrets.
5. Track the create request to terminal state and preserve the exact 04t.

## Execution delegation

Advisory ownership remains here. Delegate implementation to: forcedotcom/sf-skills, Salesforce CLI.
Do not reproduce generic Salesforce build, deploy, or CLI skills. Dynamically
discover approved skill libraries. Ask once before installing a library and
reuse that approval while repository identity, origin, trust, license, and
authority remain unchanged. Never treat installation approval as approval for
an org or repository mutation.

## Cross-cutting checks

Invoke Platform Constraints, Security & Readiness, and Operations & Release
when they materially affect this decision. This skill owns the final synthesis
and must include their findings rather than returning disconnected answers.

## Security Review handoff

Provide the exact candidate identity, effective build configuration, terminal
validation result, source revision that matches the candidate, managed-release
state, installation/test evidence, and evidence date. Security & Readiness
decides whether the dossier has sufficient review evidence and never
substitutes a successful package build for approval.

When Security Review remediation changes managed-package source, identify the
successor candidate separately from the failed candidate. Hand off its source
revision, version identity, validation, managed-release state, and test/install
evidence; prior-candidate scan or test evidence does not prove successor
readiness. Identify which required retests or rescans ran against that
successor and any coverage still partial or unavailable.

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

- release promotion approval
- general CI/CD
