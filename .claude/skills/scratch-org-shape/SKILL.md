---
name: scratch-org-shape
description: Use when designing or assessing project-scratch-def.json, editions, features, settings, object settings, product entitlements, or package-build shape. Owns Scratch definition as code, editions, features, settings, product entitlement checks, and package-build shape.
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

# Scratch Org Shape

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
- Run the `advisor-capability-preflight` skill before making a current Salesforce claim.
  When the required source is unavailable, label the specific value as unknown
  rather than inferring it from a prior release.
- Prefer practitioner knowledge first. Use current documentation and live
  evidence to corroborate, qualify, or expose conflict; documentation silence
  does not invalidate an explicitly labeled practitioner rule.
- Use `references/approved-scratch-org-templates.md` for the canonical baseline
  and approved capability additions. Read the baseline and selected capability
  heading only. For a broad or unmatched request, use the documentation path
  in `references/source-refresh.md`; inspect the selected setting reference and
  field documentation before generating nested fields or values.

## Authority modes

- **Ask:** collect the development purpose, edition, package/build context,
  required capabilities, and constraints from supplied context. Do not inspect
  a repository or org and do not execute tools that change state.
- **Assess:** inspect only approved definition files, `sfdx-project.json`,
  package-directory configuration, CLI definition overrides, and relevant
  metadata. Report exact observations, missing evidence, and risks. Do not
  inspect a Dev Hub or scratch org unless the partner separately approves
  read-only org evidence. Do not write a definition file or provision an org.
- **Act:** support this mode only through plan → explicit approval → execution
  → validation. Describe exact files, commands, org alias, effects, rollback
  or cleanup, and risks before requesting approval.

## Decision workflow

1. Identify the development purpose, target edition, package/build context,
   required capabilities, and constraints. Hand off to `environment-portfolio`
   when persistence or lifecycle, rather than definition shape, is the active
   decision.
2. Treat shape as versioned code. For Assess, identify every candidate
   definition file and the effective package-build definition, including
   `packageDirectories[].definitionFile` and any `--definition-file` override.
3. Separate features, settings, and object settings. Start with the canonical
   baseline and apply an approved capability addition when it fits. For a broad
   or unmatched request, use the current feature or settings catalog to provide
   up to three verified candidate settings groups and their documentation
   links. Map the approved source and package metadata to a
   capability-to-feature/setting mapping; inspect each selected setting's field
   documentation and check current catalogs and PBO entitlement before
   presenting current values or nested JSON fields.
4. Produce a minimal proposed JSON definition or patch. Explain which values
   satisfy the development and package-build job, and keep unrelated features
   out so they do not hide accidental dependencies.
5. Distinguish package-build readiness from subscriber/customer-compatibility
   testing. A daily-development or package-build definition is not, by itself,
   an installation or customer-edition test plan.
6. If approved read-only evidence shows a creation, entitlement, capacity,
   expiration, or cleanup problem, hand off diagnosis to
   `org-provisioning-diagnostics` rather than guessing at definition changes.
7. For an approved Act, prove the proposed shape by clean create, deploy or
   install, test, delete, and recreate.

## Execution delegation

Advisory ownership remains here. Delegate implementation to: forcedotcom/sf-skills, Salesforce CLI.
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
5. Capability-to-feature/setting mapping and a minimal proposed JSON snippet
   or patch when enough evidence is available.
6. Questions still required to reach the goal.
7. Proposed next action and whether approval is required.
8. For Assess, artifacts actually inspected, effective build definition, and
   read-only validation performed.
9. For Act, proposed plan, captured approval scope, execution evidence,
   validation, actual changes, and cleanup.

## Boundaries

This skill does not own:

- application implementation
- package promotion
