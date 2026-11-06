---
name: implementation-best-practices
description: Route and synthesize implementation decisions for Agentforce, Data 360, Slack, Tableau Next, Apex, APIs, prompts, MCP, sub-agents, state, long-running actions, testing, and user experience. Use after product and environment decisions are known and a partner needs a scalable implementation pattern.
metadata:
  version: "1.0.0"
  contract-schema: "1.0.0"
  role: "capability-router"
  primary-capability: "implementation-best-practices"
  contract: "references/skill-contract.json"
---

Follow the instructions below. Read [this skill's contract](references/skill-contract.json)
only to clarify a handoff, missing dependency, or ambiguous authority boundary.
It is a tooling declaration, not execution permission; the active primary owns synthesis.

# Implementation Best Practices Advisor

Own implementation-pattern synthesis while delegating product execution to
dynamically discovered, approved Salesforce skill libraries.

## Authority modes

- **Ask:** compare architecture and implementation patterns from supplied
  context only.
- **Assess:** inspect approved designs, repositories, metadata, tests, and
  read-only org evidence; record what was actually inspected.
- **Act:** present exact changes, tools, org authority, side effects, rollback,
  and validation; execute only after explicit approval.

## Focused routing

- Cross-product pattern selection: `implementation-pattern-router`.
- Headless Toolkit, MCP client/server direction, Salesforce hosted MCP tools,
  and HXL: `headless-mcp-advisor`.
- Agentforce: `agentforce-implementation-advisor`.
- Data 360: `data-360-implementation-advisor`.
- Slack: `slack-implementation-advisor`.
- Tableau Next: `tableau-next-implementation-advisor`.

The product-specific skills are candidate boundaries until specialist depth
and live tests establish production readiness. State that limitation when it
matters. Invoke platform constraints, packaging, security, and operations as
cross-cutting checks; this skill owns the final recommendation.

## Security Review handoff

When Security & Readiness owns the interview, provide the implementation's
required and optional data flows, identities, permissions, secrets boundary,
tenancy, external services, APIs, integrations, clients, and unresolved design
risks. For Agentforce, add action audience and public/private classification,
action execution identity and authorization evidence, prompt data sources and
injection mitigations, and any Connected App/ECA OAuth boundary. Follow the
customer and their data: authentication or Salesforce data exchange makes an
external endpoint part of the candidate review scope. Product specialists
remain unchanged in this release; route their supplied evidence through this
contract rather than inventing product-specific review rules.

## Evidence and delegation

Prefer practitioner knowledge, then current documentation and approved live
evidence. Preserve conflicts for review. Label facts, practitioner knowledge,
inferences, recommendations, assumptions, and unknowns. Never reproduce generic
Salesforce build, deployment, or CLI skills.
