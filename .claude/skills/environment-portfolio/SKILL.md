---
name: environment-portfolio
description: Use when choosing scratch, PDE, Test/Demo, Trialforce Source, template-backed, customer-trial, sandbox, or other partner environments for a lifecycle job. Owns Choosing scratch, PDE, test/demo, Trialforce source, template, customer trial, and other partner environments by job.
metadata:
  version: "1.0.0"
  contract-schema: "1.0.0"
  role: "focused-advisor"
  primary-capability: "development-environment"
  contract: "references/skill-contract.json"
---

Follow the instructions below. Read [this skill's contract](references/skill-contract.json)
only to clarify a handoff, missing dependency, or ambiguous authority boundary.
It is a tooling declaration, not execution permission; the active primary owns synthesis.

# Environment Portfolio

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
- **Act:** this skill does not own execution. Produce the decision and hand off to the bounded Act owner or approved execution library without granting mutation authority.

## Decision workflow

1. Identify the job, user, duration, persistence, and data realism.
2. Separate development, package build, installation, demo, and customer access.
3. Choose PDE versus scratch deliberately.
4. Model TSO and template lifecycle without inventing ID governance.
5. Track expiration, sharing restrictions, and rebuild triggers.
6. State the evidence-bound access or provisioning path for the recommended
   environment. Do not assume entitlement, administrator access, or authority
   to create an environment.

## Scratch-definition handoff

When `scratch-org-shape` needs to know whether a development environment must
be persistent or longer-lived than a disposable scratch-org lifecycle, own that
environment decision. Return that lifecycle constraint to `scratch-org-shape`;
do not prescribe the scratch definition or compete with its build-shape
recommendation.

## Execution delegation

Advisory ownership remains here. Delegate implementation to: Salesforce Docs MCP, Salesforce Platform MCP.
Do not reproduce generic Salesforce build, deploy, or CLI skills. Dynamically
discover approved skill libraries. Ask once before installing a library and
reuse that approval while repository identity, origin, trust, license, and
authority remain unchanged. Never treat installation approval as approval for
an org or repository mutation.

## Cross-cutting checks

Invoke Platform Constraints, Security & Readiness, and Operations & Release
when they materially affect this decision. When `development-environment` is
the active primary capability, return bounded findings to it; the primary owns
the final partner-facing synthesis.

## Required output

Return:

1. Partner goal and current decision point.
2. Recommendation and alternatives considered.
3. Evidence ledger with explicit labels and source identity.
4. Unknowns, conflicts, risks, and time-sensitive claims requiring refresh.
5. Questions still required to reach the goal.
6. Recommended environment access or provisioning path, including any missing
   authority or entitlement evidence.
7. Proposed next action and whether approval is required.
8. For Assess, artifacts actually inspected and read-only validation performed.
9. For Act, proposed plan, captured approval scope, execution evidence,
   validation, actual changes, and cleanup.

## Boundaries

This skill does not own:

- provisioning execution
- trial experience implementation

## Reviewed clarifications

When a partner question uses a term or evidence gap covered by `references/reviewed-clarifications.md`, read that focused reference and expand acronyms on first use.
