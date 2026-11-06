---
name: packageability-assessment
description: Use when a partner wants a read-only repository assessment for packageable metadata, source boundaries, dependencies, unsupported components, or remediation evidence. Owns Repository and metadata packageability inspection, unsupported components, boundaries, and remediation evidence.
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

# Packageability Assessment

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

1. Inspect Salesforce DX project structure.
2. Inventory metadata by package directory.
3. Verify current packageability and metadata coverage.
4. Separate unsupported metadata from missing dependencies.
5. Produce evidence-backed remediation without deploying.

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

For a review interview, provide the source/package alignment, metadata scope,
Code Analyzer and Checkmarx report identities and scope, DAST evidence for
external endpoints when applicable, findings that affect the package boundary,
and each false-positive explanation. Security & Readiness owns finding
disposition and submission readiness; this skill does not treat a clean or
generic security scan as satisfying the full evidence contract.

Classify each reported result as first-party, vendor/dependency, or another
accountable component; provide the component version, package-boundary impact,
and any known scan-coverage gap. Do not silently exclude minified or vendor
content from the Security Review handoff.

For each false-positive explanation, include the reported location, the source
revision inspected, the technical rationale, and any supporting test evidence.
Keep report excerpts and sensitive exploit evidence in their approved source
location rather than this handoff.

## Required output

Return:

1. Partner goal and current decision point.
2. Recommendation and alternatives considered.
3. Evidence ledger with explicit labels and source identity.
4. Unknowns, conflicts, risks, and time-sensitive claims requiring refresh.
5. Questions still required to reach the goal.
6. Proposed next action and whether approval is required.
7. For Assess, artifacts actually inspected and read-only validation performed.
8. For a separately approved delegated Act, request the execution owner's
   approval scope, observed changes, validation, and cleanup; do not claim local execution.

## Boundaries

This skill does not own:

- metadata deployment
- source conversion
