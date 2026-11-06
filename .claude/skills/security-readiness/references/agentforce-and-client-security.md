# Agentforce and client-security trust boundaries

Read this reference only when the submitted solution includes Agentforce custom
actions or prompts, or a Connected App or External Client App (ECA). It turns
the current official requirements into Gate 3 and Gate 4 evidence questions;
it does not certify an implementation or replace product-specific testing.

## Agentforce custom actions

**Fact (official documentation, refreshed 2026-09-03):** Document every custom
action in the managed package with its action form, intended agent type
(employee-facing or service), and whether it returns public or nonpublic data.
For each action, record its invoked Flow, Apex, prompt template, or external
service; caller and execution identity; data read or changed; authorization
checks; and whether user confirmation is required.

All actions need an execution context appropriate to their Flow or Apex and
CRUD, FLS, and record-level access checks. Generic record references, record
IDs, object names, and field names must not be user-controlled action inputs.
For a private service-agent action, require verified customer identity, obtain
`VerifiedCustomerId` from an agent context variable rather than user input,
validate it, and scope every accessed or altered record to it. Actions that
alter org data or take a sensitive action, such as sending email on a user's
behalf, require user confirmation.

Treat LLM-generated content as untrusted when it flows into code, Flow, or a
custom UI: validate expected format and value constraints before downstream
use, and output-encode it before display. Do not log prompts or generated
responses. Third-party LLM integrations in Agentforce custom actions are not
allowed by the current official guidance; record such an integration as a Gate
3 blocker pending current-policy confirmation and redesign.

## Prompts and prompt injection

**Fact (official documentation, refreshed 2026-09-03):** Prompts in a managed
package must not contain sensitive or secret data or ask users for
authentication tokens; a one-time password for user verification is permitted.
Record prompt storage, every merge field or other untrusted-data source,
permitted data class, and the mitigation evidence. Prompt templates, protected
custom settings, and protected custom metadata are documented storage methods.

For untrusted or user-controlled prompt data, require evidence of input
validation appropriate to the use case, such as an allowlist and length limit;
exclude data that fails those criteria. Require hardened prompt instructions:
LLM role, content boundaries, expected output format, and an instruction that
enclosed data cannot override them. When untrusted data is embedded, use a new
secure random enclosure for every inference and identify it in the prompt;
prompt sandwiching can reinforce the instructions. Treat mitigation as a
combination selected for the use case, not a guarantee that injection is
impossible.

## Evidence-first Agentforce assessment

When a partner authorizes bounded read-only access to the SFDX project and
packaged metadata, inspect that evidence before interviewing them. The partner
owns the code, metadata, customer guidance, and post-install configuration;
PEAK records findings and readiness evidence without retaining those artifacts.

| Inspect from approved source or metadata | Assess against the control |
|---|---|
| Invocable Apex, Flow, prompt-template, and action metadata | Action inventory; declared input schema and exposure; caller/execution path; public/private classification when represented; and confirmation configuration when represented |
| Apex and Flow source | Sharing, CRUD/FLS/record-access markers; data reads or writes; callout and credential-reference paths; user-controlled identifiers; and downstream handling of LLM output |
| Prompt templates and their invocation source | Secret or sensitive literals; merge fields and other untrusted inputs; validation and length controls; role, boundary, and expected-output instructions; no-override instruction; random enclosure/sandwiching evidence; and prompt/response logging paths |
| Permission sets and setup metadata | Packaged privilege inventory and any documented action or prompt access boundary |
| Partner-supplied setup and post-install guidance | The documented reviewer/customer configuration route and the owner of each step |

Static evidence can show that a control is present or absent in the supplied
candidate. It cannot prove intended public/private classification when it is
not represented, data sensitivity, customer-specific configuration, runtime
confirmation behavior, effective access after installation, or test coverage.
Ask the partner only for those unresolved facts, the working-use-case setup,
and a secure reviewer-access route where applicable. Mark a required control
that is absent in supplied evidence as `blocked`; mark an unprovable control as
`unknown`. Do not infer safety from the absence of a pattern search result.

Return a concise record for each control: candidate, evidence location, factual
observation, affected gate, status, confidence, and the next owner action.
Keep source excerpts, prompt text, customer data, and configuration values in
the partner's approved location.

## Agentforce reviewer test route

For Gate 4, ask the partner for a reviewer route that covers each applicable
working use case, rather than a generic Agentforce setup checklist. Record the
secure location and owner for the route and whether it shows the exact installed
candidate, required licenses and permission assignment, action or prompt
enablement, the configured agent path, any required confirmation, expected
safe result, and cleanup or reset instructions. Include only the steps that
apply to the submitted architecture.

Source or metadata can establish packaged prerequisites, but the partner must
confirm customer-owned configuration and that the supplied review environment
actually exercises the route. Missing reviewer instructions for a known
applicable route are `blocked`; inaccessible or unverified runtime evidence is
`unknown`. Do not configure the environment, activate an action, or execute a
test in Assess mode.

## Connected Apps and External Client Apps

**Fact (official documentation, refreshed 2026-09-03):** The current Connected
App/ECA requirements apply when the partner provides or creates a Connected App
or ECA that is included in or used with the Partner Application and is used by
more than two customer production orgs. Record whether that applicability test
is met, the client type and OAuth flow, every callback URL, token storage
boundary, refresh behavior, and the owner of configuration and attestation.

The current source requires PKCE, refresh-token rotation, and a 30-day idle
refresh-token TTL. It also requires the refresh-token IP allowlist where the
documented callback-URL conditions permit that control. The source lists a
2026-05-11 compliance date and says the controls are locked after partner
self-attestation. Refresh the current policy before an eligibility decision.
Test all integrations after enabling controls; do not mark an access boundary
ready from configuration evidence alone.

## Dossier decision

For any applicable section, add an asset-backed inventory to Gate 3 and a
reviewer test route to Gate 4. Missing inventory, unresolved identity or data
scope, untested client-control change, or prohibited third-party LLM action
integration is `blocked` or `unknown`, as supported by the evidence. Keep
prompts, tokens, customer data, full callback URLs, and exploit examples out
of the portable dossier; record only the secure artifact location and owner.

## Official sources

- https://developer.salesforce.com/docs/platform/isvforce/guide/secure-agentforce-actions.html
- https://developer.salesforce.com/docs/platform/isvforce/guide/secure-agentforce-prompts.html
- https://developer.salesforce.com/docs/platform/isvforce/guide/secure-agentforce-prompt-injection-harden.html
- https://developer.salesforce.com/docs/platform/isvforce/guide/secure-agentforce-prompt-injection-data.html
- https://developer.salesforce.com/docs/platform/isvforce/guide/secure-agentforce-prompt-injection-enclosure.html
- https://developer.salesforce.com/docs/platform/isvforce/guide/secure-agentforce-prompt-injection-resources.html
- https://developer.salesforce.com/docs/platform/isvforce/guide/secure-code-ac-eca.html
