# Headless and MCP decision guide

Read with the skill's source-refresh guide. The MCP In/Out names below are the
partner's working vocabulary, not a claim that Salesforce's docs define those
terms. Always describe the roles and direction explicitly.

## Start with the client/server map

First establish the user task and viable alternatives with
[the partner journey](partner-journey.md). Use the map below when MCP fits;
do not make an ISV invent a server architecture before explaining its goal.

| Partner label | MCP client and engagement layer | MCP server and tool owner | Direction of the protocol call | Primary choice |
|---|---|---|---|---|
| MCP In | Agentforce agent in Salesforce | Partner's externally hosted MCP server | Agentforce → external server | Register external server in Agentforce Registry; activate selected tools |
| MCP Out | Slackbot, Claude, or ChatGPT outside the Salesforce UI | Salesforce hosted standard or custom MCP server | External client → Salesforce server | Enable standard server or configure custom server and connect client |
| Neither: external integration | An external client such as Claude or ChatGPT | Partner-hosted MCP server that calls Salesforce APIs | External client → partner server → Salesforce API | Assess the partner's API and credential design; do not introduce Agentforce registration or a Salesforce hosted server merely because Salesforce data is involved |

An Agentforce agent can also be *exposed* as a tool on a Salesforce hosted
custom server. In that case the external assistant is the MCP client and the
Agentforce agent is the Salesforce-side backing capability: classify it as MCP
Out under the partner vocabulary. Do not infer direction from where Apex code
or data is stored. If a partner uses the labels differently, use their terms
but retain the concrete map.

The third row has no Salesforce MCP boundary. Its partner-hosted MCP server
may be a sensible product architecture, but its Salesforce call is a normal
API integration. Do not apply the Agentforce external-registration packaging
guidance or Salesforce hosted custom-server setup to it unless the architecture
also adds one of those Salesforce MCP boundaries.

Headless Toolkit also includes APIs, Salesforce CLI, plugins, and skills. If
the partner wants a builder workflow, assess those development tools. If an
ordinary application needs Salesforce functionality without an AI MCP client,
assess a direct API. Reserve a hosted or external MCP server for an actual MCP
client and tool workflow.

Keep the builder harness separate from the runtime client. Claude Code,
Agentforce Vibes, and Builder Central are development environments; an
Agentforce agent, Slackbot, Claude, or ChatGPT can be the runtime engagement
layer. Ask which Agentforce surface the partner means before assigning an MCP
direction or client-connection path.

Ask only for information that changes the choice:

1. What is the user trying to do, and in which client: Agentforce, Slackbot,
   Claude, ChatGPT, or another surface? Which product/version and channel?
2. Who hosts the MCP endpoint? Is the partner bringing an external server into
   Agentforce, or making Salesforce capabilities available to an external client?
3. Which tools already exist, and who owns them: standard server, packaged
   Apex, Flow, Agentforce agent, Prompt Template, Apex REST, `@AuraEnabled`,
   API Catalog endpoint, or partner service?
4. Does the use case need a read, write, delete, multi-step transaction, or
   reasoning? Which identity, data scope, and permissions govern the call?
5. Is this a managed product? Who installs the package, registers or enables
   a Salesforce MCP server when one exists, connects the client, and maintains
   the tool descriptions? For an external integration, establish separately
   what distributes and configures the partner's API credentials.
6. Is a rich widget needed, or is structured text/JSON sufficient? If rich,
   which output schema and target channels must be rendered?

## Choose the Salesforce hosted tool source

- Check the [standard server reference](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/servers-reference.html)
  and [Headless MCP solutions](https://developer.salesforce.com/docs/platform/headless-get-started/guide/headless-mcp.html)
  for an existing scoped tool. Standard server tool sets are fixed and enabled
  by an admin; availability, product entitlement, Beta status, and client
  support must be refreshed per server. Current examples include SObject Reads,
  Mutations, Deletes, and All; Data 360; Headless 360 (Beta); Content; and
  Tableau Next. The broader MCP Solutions catalog also covers Salesforce DX
  and product-specific servers such as Heroku and MuleSoft; do not assume all
  share the same org authentication or client support. Prefer a narrow read or
  mutation server over a broad server when it satisfies the job.
- Choose a [custom Salesforce hosted server](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/custom-servers.html)
  to curate tools for one persona or expose custom capabilities. The documented
  backing choices include Apex Invocable Actions, autolaunched Flows,
  `@AuraEnabled` methods, Apex REST, and supported API Catalog endpoints.
  Agentforce agents built with the current Agent Script Builder and Prompt
  Templates can also be exposed; check their separate requirements. Give each
  tool a specific name and description so the client can choose it.
- Select an [Apex Action](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/invocable-actions.html)
  when logic requires server-side validation, orchestration, or integration.
  For this MCP backing type, Salesforce currently requires a `global`
  `@InvocableMethod`. Its invocable input and output variables define the
  tool contract. Preserve list-oriented invocable signatures and bulk behavior;
  refresh the Apex annotation rules before authoring. Existing admin-owned
  declarative logic may fit an autolaunched Flow better.
- For managed delivery, package the supported backing assets and let the
  subscriber admin configure the Salesforce hosted custom server. The reviewed
  [Metadata Coverage Report](https://developer.salesforce.com/docs/success/metadata-coverage-report/references/coverage-report/metadata-coverage-report.html)
  does not mark `McpServerDefinition` for 2GP. This is distinct from a packageable *external server
  registration* for Agentforce MCP In.
- For an external Claude or ChatGPT client connecting to a Salesforce hosted
  server, check the [client connection guide](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/client-connection-overview.html)
  for the current External Client App, OAuth, server URL, and client setup.
  A Connected App is not the documented MCP authentication mechanism. Use
  `channel-rollout.md` for the distinct Slackbot connection path and for
  channel-by-channel validation.
- For MCP In, check the [Agentforce external MCP registration packaging guide](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/dev2gp-package-mcp-agentforce.html).
  It lists ExternalCredential, ExternalServiceRegistration, NamedCredential,
  and PermissionSet as packageable metadata, while MCP tool actions and
  Agentforce Gateway policies are not. Plan subscriber authentication,
  activation, and tool selection separately.

## Apex and rich output

- A global invocable method is required for the current Salesforce hosted MCP
  Apex Action backing. For an Agentforce action supplied by a managed package,
  the indexed excerpt of Salesforce's [Apex Developer Guide](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/salesforce_apex_developer_guide.pdf)
  additionally calls for the containing class, global static invocable method,
  input/output wrapper classes, their `@InvocableVariable` fields, and custom
  data types in those wrappers to be global. Keep the global entry point thin
  because managed global APIs are hard to change. Review namespace, Apex class
  access, sharing, CRUD/FLS, governor limits, and returned data. Recheck the
  current guide before treating the Agentforce and hosted MCP requirements as
  identical.
- `@JsonAccess(serializable='always' deserializable='always')` is specifically
  documented for Apex classes used by [Apex-based custom Lightning types](https://developer.salesforce.com/docs/platform/lightning-types/guide/lightning-types-apex.html)
  in Agentforce, along with top-level global classes and `@AuraEnabled` fields.
  Do not present it as a blanket prerequisite for every MCP Apex Action. Check
  the exact serialization and rendering path.
- [HXL widgets](https://developer.salesforce.com/docs/platform/hxl/guide/hxl-rich-ui.html)
  are documented for Agentforce Employee agent in Lightning Experience and
  MCP channels in Slackbot, Claude, and ChatGPT. A widget bundle has a required
  JSON composition and `.uiwidget-meta.xml`; `schema.json` is optional for
  static content but required for dynamic attribute mapping. Check available
  [components](https://developer.salesforce.com/docs/platform/hxl/guide/playground-components.html)
  and preview in the [Playground](https://developer.salesforce.com/docs/platform/hxl/guide/playground.html).
- For Agentforce action output, the documented HXL path uses an Apex-based
  custom Lightning type and direct widget attribute mapping. For an Apex
  invocable action exposed as a Salesforce hosted MCP tool, it uses two
  object-based custom Lightning types: a result wrapper and a payload type.
  The wrapper maps nested `outputValues` into the widget's flat attributes.
  Route these to the two distinct global coordinator skills in the main skill.
- For an HXL widget on an MCP channel, [Setup creates/selects the custom server and adds the Apex action](https://developer.salesforce.com/docs/platform/hxl/guide/hxl-mcp-server.html).
  Current documentation then requires retrieving its metadata, adding a
  widget resource and matching tool `uiResource`, deploying it, and activating
  the server. Setup alone does not yet configure the HXL resource.

For a partner Salesforce DX project assessment, use `sfdx-assessment.md` to
inventory source paths, verify the 2GP boundary, and identify what the customer
must configure after installing the package. Salesforce currently marks
`ApexClass`, `LightningTypeBundle`, and `UiWidgetBundle` for 2GP, but not
`McpServerDefinition`; source presence is not proof of package inclusion.

## Partner readout

State the partner goal; topology classification (MCP In, MCP Out, external
integration, or no MCP) plus concrete client → server → tool path; standard
versus custom/external server choice; reused versus new backing logic; identity
and permissions; package versus subscriber setup ownership;
observed SFDX paths and package boundary when assessed; whether HXL is needed
and its channel-specific path; a measurable pilot or next diagnostic check;
evidence labels and sources; unknowns; and the bounded global skill handoff
with its actual approval scope. Preserve a conflict
when live org evidence differs from this source snapshot.
