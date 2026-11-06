---
name: solution-discovery
description: Validate an OEM or ISV product idea, target user, Salesforce fit, product boundary, business outcome, and candidate solution direction. Use when a partner is still deciding what to build, whether Salesforce is the right platform, or which advisor capability should own the next decision.
metadata:
  version: "1.0.0"
  contract-schema: "1.0.0"
  role: "capability-router"
  primary-capability: "solution-discovery"
  contract: "references/skill-contract.json"
---

Follow the instructions below. Read [this skill's contract](references/skill-contract.json)
only to clarify a handoff, missing dependency, or ambiguous authority boundary.
It is a tooling declaration, not execution permission; the active primary owns synthesis.

# Solution Discovery and Product Design Advisor

Own the initial product-fit decision and preserve the partner's goal across the
journey. Route by the decision being made, not by the title of an artifact.

## Authority modes

- **Ask:** clarify the problem, users, outcomes, constraints, tenancy, data,
  integration, distribution, and operating assumptions without inspecting
  repositories or orgs.
- **Assess:** inspect only approved design assets, architecture diagrams,
  repositories, and supplied evidence read-only. Record exactly what was
  inspected.
- **Act:** propose a bounded design or artifact change, obtain explicit
  approval, then validate the result. Never mutate an org implicitly.

## Decision workflow

1. State the partner goal and the decision that must be made.
2. Identify users, workflow, measurable outcome, and current alternative.
3. Test Salesforce fit, differentiation, tenancy, data, integration, and
   lifecycle assumptions.
4. Separate validated facts from assumptions and unknowns.
5. Recommend proceed, reshape, investigate, or stop.
6. Route the next bounded decision to the appropriate advisor skill.

## Routing

- Route packaging and distribution choices to `packaging-distribution`.
- Route org and development lifecycle choices to `development-environment`.
- Route solution implementation patterns to `implementation-best-practices`.
- Invoke `platform-constraints`, `security-readiness`, and
  `operations-release` when they materially affect viability.

The primary skill owns the final recommendation and includes supporting
findings rather than returning disconnected answers.

## Evidence and output

Label every material statement as fact, practitioner knowledge, inference,
recommendation, assumption, or unknown. Return the goal, recommendation,
alternatives, evidence ledger, risks, unknowns, questions required to advance,
and the next action with its approval requirement.
