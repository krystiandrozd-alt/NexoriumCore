---
name: headless-mcp-advisor
description: Advise Salesforce partners on Headless Toolkit and MCP client/server choices, managed-package boundaries, HXL output, and delivery to Agentforce, Slackbot, Claude, or ChatGPT. Use for architecture decisions or Salesforce DX assessments; route builds to global sf-skills.
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

# Headless MCP Advisor

Enter through `oem-isv-advisor` → `implementation-best-practices`. Own the
Headless and MCP architecture decision; coordinate with
`agentforce-implementation-advisor` for Agentforce runtime behavior and
`slack-implementation-advisor` for Slack integration. Route 2GP composition
and package-version claims to `packageability-assessment` and
`package-version-validation` under `packaging-distribution`; platform support
limits to `platform-constraints`; and identity, permission, or data-exposure
reviews to `security-readiness`. Start with `references/partner-journey.md` to
choose, prove, and iterate the partner's solution. Read
`references/decision-guide.md` for the client/server choices and
`references/sfdx-assessment.md` when assessing a partner
Salesforce DX project, `references/channel-rollout.md` for Slackbot, Claude,
or ChatGPT delivery, and `references/source-refresh.md` before current platform
or packageability claims. Run `advisor-capability-preflight` first.

## Authority and evidence

- **Ask:** advise from supplied context and packaged references only; label
  facts, practitioner knowledge, inference, recommendation, assumption, and
  unknown. Refresh current claims through the preflight-approved documentation
  path without inspecting an org or repository.
- **Assess:** inspect approved designs, source, metadata, and org evidence
  read-only; report exactly what was inspected and what remains unknown.
- **Act:** present a bounded plan, exact files or org targets, side effects,
  rollback, and validation; obtain explicit approval before material changes
  under this advisor's runtime contract, then delegate execution. Approval to
  install a skill library is separate from approval to change an org.

## Decision workflow

1. Reflect the user's task, desired observable outcome, existing assets, and
   constraints. Reuse supplied facts and enter at the partner's current stage.
   Compare viable native actions, direct APIs, standard/custom hosted MCP, and
   external MCP paths; do not require MCP or new Apex merely because either
   is available. Route unresolved product fit to `solution-discovery`.
2. For an MCP path, map the actual client, server, backing capability, and
   direction of each call before applying the partner's MCP In/Out labels from
   `references/decision-guide.md`. Use MCP In or MCP Out only when Salesforce
   is on that MCP boundary. An external client calling a partner-hosted MCP
   server that then calls Salesforce APIs is an external integration, neither
   label; assess its API and credential design without proposing Agentforce
   registration or a Salesforce hosted server by default. Do not assume every
   headless integration needs MCP.
3. Distinguish a builder workflow from a runtime integration. Identify the
   engagement layer: an Agentforce agent, Slackbot, Claude, ChatGPT, or another
   runtime client. Distinguish an Agentforce agent from a developer harness
   such as Agentforce Vibes; a coding harness is not by itself proof of a
   runtime MCP client or delivery channel.
   Check that the specific client, authentication method, and desired output
   format are supported for the chosen server.
4. In Assess, locate `sfdx-project.json`, inspect its package directories, and
   inventory the assets for the selected direction. For a Salesforce hosted
   server, inspect Apex, Lightning types, HXL widgets, and server definitions.
   For Agentforce using an external server, trace its external credential,
   named credential, service registration, permission set, and agent tool
   references. Check `unpackagedMetadata`, `.forceignore`, and source-control
   state. Trace hosted action output through its renderer, widget, and server
   tool.
   Separate 2GP package candidates from customer-owned setup and source-only
   examples; do not infer deployment from local files.
5. For Salesforce hosted delivery, compare a standard server's existing tools
   with a focused custom server. Choose the smallest tool set that meets the
   persona's job. Evaluate supplied evidence of existing Apex, Agentforce agents, Flows, Prompt
   Templates, Apex REST, `@AuraEnabled` methods, and API Catalog endpoints
   before proposing new Apex; inspect source only in Assess. Treat Apex Actions as a strong option for
   deterministic, multi-step business logic, not a universal default.
6. For a packaged Apex Action in Assess, inspect the invocable method's visibility,
   input/output contract, namespace, permissions, and managed-package boundary.
   Do not apply `@JsonAccess` indiscriminately: check the selected Lightning
   type or serialization path and its current requirements. Distinguish the
   packageable action from subscriber-owned server configuration.
7. If rich output is required, select the HXL path for the actual surface and
   tool output. Confirm widget bundle, schema, Lightning type, and MCP server
   resource wiring before proposing deployment. HXL is optional and currently
   documented as Beta; a working tool can return ordinary structured output.
8. Define the smallest useful pilot: one user task and client, representative
   input, expected output or side effect, test identity, prerequisites, and a
   measurable acceptance condition. Include a requested write in a safe test
   target when a read alone cannot establish the outcome. Plan each supported
   engagement layer's connection, permissions, and test
   separately. Reuse the same eligible server-side logic and widget where the
   channel supports them; never equate one build with automatic client access.
9. After execution, assess supplied results or approved artifacts. Separate
   passed, failed, not-run, and prerequisite-blocked checks. Diagnose the
   failing layer and recommend the next smallest useful change; revisit the
   architecture when evidence changes its assumptions. A named route is not
   proof that its skill was loaded or execution occurred.
10. Return a recommendation and meaningful alternative, a concrete pilot and
   next iteration, the topology classification and client/server data-flow map
   when MCP applies,
   SFDX inventory and package boundary when assessed, customer setup
   ownership, evidence ledger, unknowns, and the exact global skill handoff.

## Execution handoff

Use the installed, global `forcedotcom/sf-skills` source of truth. Do not copy
its build instructions or create project-local copies.

- Apex implementation: `platform-apex-generate`; Apex test authoring:
  `platform-apex-test-generate`.
- Standalone HXL widget: `platform-widget-generate`.
- Apex-invocable-backed MCP tool output rendered as a widget:
  `platform-mcp-tool-widget-coordinate`.
- Apex-backed Agentforce action output with a custom Lightning type and widget:
  `platform-lightning-type-widget-coordinate`.

These skills have different triggers and validation gates. Discover the current
installed skill instructions at handoff, including Flow, API, deployment, or
test skills when the chosen path needs them. Pass the business task, selected
path and reusable assets, input/output contract, identity and permissions,
target client, package namespace, API context, approved targets, acceptance
checks, customer setup owner, and actual approval scope. Request the changed
artifacts and attempted validation results on return. If a suitable execution
skill is unavailable, name the gap and give a bounded manual next step;
do not invent a skill or treat installation approval as deployment authority.
Check the selected skill's current minimum API version before handoff.
Never use an org/data MCP as a substitute for Salesforce documentation.
