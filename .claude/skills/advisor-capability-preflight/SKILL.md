---
name: advisor-capability-preflight
description: Check and configure documentation capabilities before an OEM/ISV Advisor interaction. Use when the advisor starts, when Salesforce Docs MCP or official-documentation access may be missing, when a customer asks to install or approve documentation tools, or when the active harness changes.
metadata:
  version: "1.0.0"
  contract-schema: "1.0.0"
  role: "capability-preflight"
  primary-capability: "foundation"
  contract: "references/skill-contract.json"
---

Follow the instructions below. Read [this skill's contract](references/skill-contract.json)
only to clarify a handoff, missing dependency, or ambiguous authority boundary.
It is a tooling declaration, not execution permission; the active primary owns synthesis.

# Advisor capability preflight

Establish documentation capability without touching a Salesforce org. Keep this
setup separate from the partner's advisory decision.

Salesforce Docs MCP is optional but highly recommended. Missing or declined MCP
access must never block the advisor; continue with the approved fallback and
label unsupported current claims as unknown.

## Preflight

1. Read `references/documentation-policy.json`.
2. Inspect only the tools exposed by the current harness. Do not probe an org,
   Salesforce CLI, credentials, or unrelated MCP servers.
3. Treat Salesforce Docs MCP as connected only when an exposed tool name matches
   the policy patterns. Never infer connection from a file, product name, or
   remembered installation.
4. Read `.advisor/capabilities.json` under the explicitly selected project root
   when available. Reuse choices only for the same harness, project, and policy.
   Legacy records without project scope need one confirmation, not silent reuse
   in another project. Recorded preference is not proof of host access. In app
   sessions without durable project storage, retain the decision only in session
   context; do not claim it persists into another conversation.
5. If MCP is missing, recommend it once and offer exactly these choices:
   - install or connect Salesforce Docs MCP when the harness exposes an identified
     installation candidate;
   - continue with approved official Salesforce web documentation;
   - continue without external documentation.
6. Before installation, show the server identity, transport, URL or marketplace
   source, requested permissions, and whether authentication is required. Ask
   for explicit approval. One approval covers only that identified identity.
7. If no maintainer-listed or otherwise established installation source is available, say so. Recommend the
   Salesforce-managed marketplace or workspace-admin route; do not invent an
   endpoint and do not substitute an org/data MCP.
8. If Docs MCP is unavailable and web fallback is needed, ask once whether the
   exact documentation domains may be used read-only for this project, unless
   an applicable recorded choice or explicit repository policy already covers
   them. Do not ask about unused web fallback when Docs MCP is exposed. Host
   or enterprise prompts still apply and always win.
9. Record an approved or declined choice only after the customer answers. Run
   `scripts/record_preference.py` to save the decision without secrets.
10. Continue in degraded mode when the customer declines or configuration is
    blocked. Do not fail readiness solely because MCP is absent. Label
    unsupported current claims as unknown.

Run `scripts/check_preflight.py --harness <active-harness> --project-root <approved-project-root>`
when deterministic status is useful. It reads that project's `.advisor/capabilities.json`
by default; pass `--preferences <approved-preference-file>` to select another
record explicitly. Record choices with the same `--project-root` and policy
version. Pass each exposed tool as `--tool <name>`; never probe an org to discover
documentation tools. Deferred tools may need loading through the host before
use. Exposed names are not proof of a successful fetch. If the script or file
tools are unavailable, follow this procedure from session context instead.
`ready` describes documentation setup; `advisory_ready` permits bounded Ask
guidance even when optional setup is incomplete.
Read `references/harness-setup.md` only for the active harness.

## Source order

1. Practitioner knowledge supplied by the owning advisor skill.
2. Connected Salesforce Docs MCP.
3. Machine-readable content on an approved official domain.
4. Public HTML on an approved official domain.
5. Unknown with the missing source identified.

Documentation may corroborate or conflict with practitioner knowledge; silence
does not invalidate explicitly labeled practitioner knowledge.

## Output

Return a compact capability receipt containing:

- harness;
- Salesforce Docs MCP status: `connected`, `not_connected`, or `unavailable`;
- approved-web status;
- consent still required;
- configuration action performed or blocked;
- fallback mode;
- evidence labels and exact source identities.

Do not repeatedly display the receipt after readiness is established unless the
harness, policy version, MCP identity, or customer preference changes.

## Configuration authority

Ask explains options; Assess inspects only approved configuration. Installing
or connecting an MCP or recording durable preferences is configuration-only
Act: show the exact project/harness/server scope and obtain explicit approval.
This does not authorize org access or other domain actions.
