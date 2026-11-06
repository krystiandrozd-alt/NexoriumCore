# Partner journey: choose, prove, and iterate

Use this journey with the owning advisor's authority and evidence contract.
Enter at the partner's current stage; a defined architecture can proceed to
its pilot or an observed failure without restarting discovery.

## Start from the user task

Reflect who needs to do what, the desired observable outcome, existing assets,
and constraints. Reuse supplied facts. Ask only for a missing fact that changes
the recommendation, authority, or next test; do not present a fixed questionnaire.
Identify reads/writes, sensitive data, execution identity, tenant boundaries,
distribution, and target environment when they matter. Route unresolved
product fit to `solution-discovery`; retain Headless architecture once the
product goal is established.

## Compare the viable approaches

Evaluate only paths that can meet the task and documented client support:

| Approach | When to consider it | Decision to establish |
| --- | --- | --- |
| Native agent capability or action | The task stays in the chosen Salesforce agent surface | Whether existing actions meet the workflow without an MCP boundary |
| Direct API | A conventional application or fixed integration needs a capability | Whether protocol/tool discovery adds value to this caller |
| Standard Salesforce hosted MCP | An actual MCP client needs an existing platform capability | Whether a narrow standard tool set meets the job and permissions |
| Custom Salesforce hosted MCP | The client needs curated or differentiated Salesforce capabilities | Which Apex, Flow, agent, or API assets can be reused and are supported |
| Externally hosted MCP | A partner service already supplies tools or logic belongs externally | Supported client/authentication, data leaving Salesforce, and registration ownership |
| External integration | An external client calls a partner-hosted MCP server that uses Salesforce APIs | Whether the API and credential integration meets the task without adding a Salesforce MCP boundary |

Use [the decision guide](decision-guide.md) for the concrete client → server →
tool map. Existing Apex can reduce integration work without making a custom
MCP server the automatic answer. Existing Flow/API assets may remove the need
for new Apex. If no MCP client or tool-selection need exists, a direct API may
be the simpler fit. Refresh platform support before asserting eligibility.

Classify MCP In or MCP Out only when Salesforce participates in the MCP
protocol boundary. An external client → partner-hosted MCP server → Salesforce
API path is an external integration, neither label. It needs API and credential
assessment, and it does not inherit Agentforce registration or Salesforce
hosted-server setup requirements.

Explain the recommended path and one materially different viable alternative:
fit, reused assets, required new work, customer setup, and the fact that would
change the choice. If there is no viable alternative, state the constraint
rather than inventing one. Label facts, recommendations, assumptions, and
unknowns; a supplied asset is not proof of its availability in a customer org.

## Give a consistent partner readout

Keep the final recommendation compact and complete:

1. Recommended path and one meaningful alternative, with the deciding fact.
2. Topology classification and the concrete client → server → tool or API map.
3. Reused and new assets, then package-owned and subscriber-owned setup.
4. A smallest useful pilot with its measurable acceptance condition.
5. Evidence labels, source identities, and material unknowns.
6. The bounded global execution-skill handoff, including approval scope and
   what results must return for the next iteration.

For an external integration, name the partner API/credential owner explicitly.
Do not present Salesforce MCP packaging or customer setup as applicable unless
the selected architecture includes that Salesforce MCP boundary.

## Define the smallest useful pilot

Specify one user task and runtime client, the smallest sufficient capability
set, representative input, expected output or side effect, authorized test
identity, environment prerequisites, and a measurable pass/fail condition.
State which uncertainty the pilot resolves. Do not invent an org, entitlement,
or target release. Mark missing prerequisites separately from a failed test.

A read-only pilot fits only if it can establish the intended outcome. When
the task requires a write, propose that behavior with appropriate safeguards
in an approved safe target; a successful read does not prove the write. Include
unauthorized identity, duplicate request, retry-after-timeout, and partial
completion checks when relevant. Do not execute them without the actual
authority needed for the target and data.

Add HXL when rich output improves the user's task; structured output can be a
complete pilot. Validate additional clients separately after proving the first
path, unless comparing clients is the pilot's purpose. Do not promise elapsed
build time, universal compatibility, or automatic access across channels.

## Hand off execution

Discover the suitable installed global skill and read its current instructions.
The entrypoint's Apex/HXL skills are examples, not the entire execution menu.
Discover Flow/API, environment, deployment, or testing skills for the selected
work. Use global `sf-skills`; do not copy build instructions into this advisor.

Pass a bounded brief containing:

- Business task, selected approach, alternative, and reusable assets.
- Inputs, output schema or side effects, execution identity, permissions, and
  material data/tenant boundaries.
- Target client, namespace/API context, authorized files/orgs, prerequisites,
  and package versus subscriber setup ownership.
- Observable acceptance checks, actual approval scope, applicable rollback,
  and the artifacts/results the advisor needs back.

If a skill or tool is unavailable, identify the missing capability and a
bounded manual next step or the remaining choice. Do not invent a skill,
silently replace it with an unrelated one, or install a library implicitly.
Approval to use a library is not approval to deploy or configure an org.

## Assess the return and iterate

From supplied results or explicitly approved read-only inspection, record
what changed, what was attempted, the observed result, evidence source, and
remaining unknowns. Distinguish passed, failed, not run, and blocked by a
missing prerequisite. Compare the result with the pilot's acceptance condition.
Recommend the next smallest useful adjustment, its owner, and its validation.

Preserve a compact recap of the goal, selected path and why, facts already
established, current blocker, and next action in the conversation. Do not add
a durable state file or repeat settled questions. Reopen earlier choices when
new evidence changes assumptions, client needs, or customer setup constraints.

Keep expected routing, a response recommending a specialist, and observed
skill loading/execution distinct. Record observed use only with supporting
tool or harness evidence. A skill load is not proof of delegation, and a
suggested build/test is not an executed one. Keep unavailable evidence unknown.

## Diagnose the failing layer

| Stage | Evidence to establish | Next investigation |
| --- | --- | --- |
| Environment and authorization | Required feature/client access and intended identity | Entitlement, scopes, permissions, account mapping |
| Connection and discovery | Endpoint connection and visibility of intended tools | Transport, authentication, activation, selected server, tool access |
| Direct tool invocation | Known input gives the expected structured response | Schema, action identity, namespace, dependencies, backing logic |
| Model selection | Representative user intent selects the intended tool | Descriptions, overlapping tools, ambiguous intent, client behavior |
| Business behavior | Correct data and side effects under the real identity | Business validation, authorization, partial errors, transaction behavior |
| Rendering | Valid structured data renders on the selected client | Type mapping, widget schema, resource wiring, client capability |

An authenticated connection proves neither tool visibility nor business
correctness. Successful direct execution with poor model selection calls for
tool-selection diagnosis before changing working business logic. A rendering
failure does not invalidate an independently verified structured tool result;
retain a useful structured fallback when the user task permits it.

After a timed-out write, establish whether it committed before proposing a
retry. Check actual duplicate controls and transaction behavior; `readOnly`,
`idempotent`, and `destructive` declarations are assertions to compare with
implementation evidence, not enforcement proof. Include customer/tenant and
execution-identity scope rather than generalizing a single-user test.

Route security/vendor assurance and tenant boundaries to `security-readiness`,
runtime constraints to `platform-constraints`, package/upgrade composition to
the packaging owner, and release/monitoring/support to `operations-release`
when material. Include their findings in the active primary advisor's final
recommendation, including latency or cost evidence when it affects viability.
