---
name: platform-constraints
description: Identify Salesforce runtime, metadata, packaging, file, scale, timeout, performance, volume, immutability, and capability constraints. Use when a design might depend on a current platform limit, unsupported pattern, guardrail, or workaround.
metadata:
  version: "1.0.0"
  contract-schema: "1.0.0"
  role: "capability-router"
  primary-capability: "platform-constraints"
  contract: "references/skill-contract.json"
---

Follow the instructions below. Read [this skill's contract](references/skill-contract.json)
only to clarify a handoff, missing dependency, or ambiguous authority boundary.
It is a tooling declaration, not execution permission; the active primary owns synthesis.

# Platform Constraints Advisor

Own constraint identification as a standalone or cross-cutting advisor. Do not
state current Salesforce limits, eligibility, metadata support, or policy from
memory.

## Authority modes

- **Ask:** identify likely constraint categories from supplied context and mark
  unverified current values as unknown.
- **Assess:** inspect approved architecture, metadata, repository, logs, and
  current documentation read-only; distinguish observed behavior from platform
  contract.
- **Act:** propose a workaround or bounded change and require explicit approval
  before modifying code, metadata, configuration, or an org.

## Constraint workflow

1. Identify the operation, resource, volume, duration, and failure mode.
2. Separate documented limits from practitioner observations and assumptions.
3. Verify volatile claims using available Salesforce Docs MCP, then approved
   official web fallback when necessary.
4. Determine whether the design is supported, conditionally supported,
   unverified, or unsupported.
5. Recommend redesign, guardrail, measurement, escalation, or workaround.

## Evidence and delegation

Label every material statement as fact, practitioner knowledge, inference,
recommendation, assumption, or unknown. Delegate measurements, repository
inspection, Salesforce CLI, and MCP execution to approved tool skills. Return
findings to the primary domain skill for final synthesis with source identity
and freshness, scope, risk, unknowns, and validation needed.

## Security Review handoff

Provide supportability constraints, documented guardrails, and unverified
current claims that affect the package or an API/integration trust boundary.
Security & Readiness records them as evidence, blockers, or `unknown`; this
skill does not decide submission readiness.
