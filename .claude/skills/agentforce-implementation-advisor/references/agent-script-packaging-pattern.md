# Agent Script packaging and distribution pattern

Use this reference when an ISV/OEM partner needs to distribute an Agentforce
agent authored with Agent Script. It captures reviewed Salesforce practitioner
knowledge that is more specific than the conventional metadata-packageability
route.

## Evidence classification

- **Practitioner rule:** The authored Agent Script source must not be presented
  as natively packageable metadata unless a current packageability source and a
  package-version test prove support for the exact artifact and package type.
- **Practitioner rule:** An unsupported Agent Script artifact does not make the
  partner solution undistributable. Separate the script from its natively
  packageable dependencies and use the carrier-and-install pattern below.
- **Documented fact requiring refresh:** Selected Agentforce dependencies can be
  packageable, but support is metadata-type, package-type, and release specific.
  Verify each exact type using `source-refresh.md`.
- **Implementation evidence:** The supplied sample demonstrates a managed 2GP
  project containing packageable Agentforce dependencies and a generated agent
  template/planner bundle. It is evidence for the workflow, not proof that all
  Agent Script artifacts are universally packageable.

Use evidence source ID `practitioner-agent-script-packaging-pattern` for the
rules in this file. Label them `practitioner`, not `fact` or undocumented
platform guarantees.

## The two-layer pattern

### Layer 1 — package the durable application foundation

Put ordinary package-owned assets in the managed 2GP boundary when supported:

- Apex and other core business logic;
- objects, fields, and package data model;
- LWC and setup user experience;
- permission sets and least-privilege configuration;
- exact supported Agentforce dependencies such as prompt templates, actions,
  topics, templates, or planner bundles after current verification.

The package owns these dependencies and their upgrade lineage.

### Layer 2 — carry the Agent Script as installable intelligence

Carry the authored script inside a packageable asset instead of claiming the
script itself is package metadata. Select the carrier deliberately:

| Carrier | Prefer when | Tradeoffs to surface |
| --- | --- | --- |
| LWC data module | Agent Studio or a setup assistant should present one or more scripts with copy/import UX | Practical module-size and format constraints; keep script data separate from component behavior |
| Static resource | Scripts are large, file-oriented, or use JSON, XML, YAML, or plain text and existing pipelines already manage files | Requires retrieval/parsing and a deliberate version/manifest convention |
| Custom metadata | Instructions need queryable, configurable records and fit the record/schema limits | Size, namespace, editability, and upgrade semantics must be designed explicitly |

The reviewed reference implementation favors an LWC data module for interactive
Agent Studio workflows and multi-script handling. Static resources are the
strong alternative for larger or non-JavaScript files. Do not declare one
carrier universal without asking about script size, count, format, customer
editability, setup UX, and pipeline tooling.

## Installation and activation boundary

Package installation delivers the supported dependencies and the script
carrier. It does not, by itself, prove that a runnable Agent Script agent exists
in the subscriber org.

After installation, guide the customer through a visible setup flow that:

1. verifies Agentforce enablement, permissions, licenses, and required package
   dependencies;
2. retrieves or presents the delivered Agent Script;
3. creates or imports the customer-owned agent/template/Bot and BotVersion using
   the currently supported Agentforce CLI, API, or documented UI route;
4. resolves namespaced references to the packaged actions, topics, prompt
   templates, Apex, and other dependencies;
5. validates compilation/import, activation prerequisites, permissions, and a
   representative simulated and live conversation before declaring success;
6. records what the package owns versus what the subscriber created so upgrades
   do not silently overwrite customer changes.

Offer two adoption paths:

- **Programmatic/API-assisted:** setup checks, script retrieval/import, native
  validation, and status reporting are automated where current supported APIs
  permit it. Act mode requires the exact plan and explicit approval.
- **Guided documentation:** a step-by-step setup assistant supplies the script,
  screenshots or video, native verification steps, troubleshooting, and support
  escalation when automation is not supported or not desired.

Never describe a post-install operation as automatic if the chosen package,
API, permissions, or customer policy still requires human setup or approval.

## Upgrade decisions

Before recommending an update model, ask who owns the installed agent and
whether customers may edit it. Distinguish:

- package-owned dependencies that follow normal package versioning;
- delivered script revisions in the selected carrier;
- subscriber-created agent metadata and activation state;
- customer modifications that require merge, replace, side-by-side, or manual
  migration behavior.

An upgrade plan must identify idempotency, version detection, rollback, customer
change preservation, and revalidation. Installing a new script carrier is not
proof that an existing customer agent was safely upgraded.

## Interview questions that materially change the recommendation

1. Is the agent authored in Agent Script, legacy/next-generation Agent Builder,
   or generated from another representation?
2. How many scripts are delivered, in what formats, and what are their expected
   sizes?
3. Must customers inspect or edit the script before creating the agent?
4. Should setup be programmatic/API-assisted or guided in Agent Studio?
5. Which actions, topics, prompt templates, Apex classes, flows, and data assets
   does the script reference?
6. Who owns subscriber changes and how must upgrades preserve them?
7. Which exact org shape, licenses, permissions, and activation steps have been
   proven in a clean install org?

## Required partner-facing synthesis

For this decision, the answer must explicitly include:

1. the conventional packageability limitation;
2. the practitioner carrier-and-install pattern;
3. the selected carrier and why it fits the partner's constraints;
4. package-owned versus subscriber-created boundaries;
5. post-install and upgrade responsibilities;
6. exact unknowns that require current documentation or clean-org proof.

Do not stop at "Agent Script is not packageable." That is an incomplete partner
answer when this pattern applies.

## Reviewed source provenance

Salesforce SMEs reviewed this pattern and its reference implementation on
2026-08-01. The internal source artifacts and integrity hashes remain in the
testing evidence repository; they are not distributed with the partner-facing
skill. Use source ID `practitioner-agent-script-packaging-pattern` in the
partner evidence ledger.

This is practitioner and implementation evidence. It does not replace the
current official packageability check for each exact metadata type.
