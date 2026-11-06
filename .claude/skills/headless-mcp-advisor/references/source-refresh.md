# Source refresh guide

## Focused refresh: 2026-10-22

Retrieved the official Metadata Coverage Report, custom-server guide,
external MCP registration packaging guide, and HXL rich UI guide through the
approved public-web fallback. Salesforce Docs MCP was not exposed by the
active harness. The rolling coverage page did not identify a target release
in the retrieved content; these observations must not be assigned the
partner project's API version.

- The coverage report marks `ApexClass`, `LightningTypeBundle`, and
  `UiWidgetBundle` for 2GP; it does not mark `McpServerDefinition` for 2GP.
  This establishes type eligibility, not a successful package build or install.
- The external-registration packaging guide lists `ExternalCredential`,
  `ExternalServiceRegistration`, `NamedCredential`, and `PermissionSet`;
  it excludes MCP tool actions and Agentforce Gateway policies.
- The HXL guide establishes widget structure and Metadata API/CLI deployment.
  Its `package.xml` example does not establish managed 2GP inclusion.
- The retrieved custom-server guide describes Metadata API deployment but
  does not explicitly state the ISV managed-package exclusion. Attribute the
  2GP boundary to the coverage report, not that guide.

Source identities are linked below under Packaging and Apex, Salesforce
hosted server choices, and HXL. Keep documentation eligibility, source,
deployed org, package-version, installation, and runtime evidence separate.

## Earlier review and remaining limitations

Reviewed 2026-10-20 through approved public, rendered Salesforce developer
documentation and the official Slack pages supplied for this review. The
static preflight allowlist does not include Slack hosts; for later runs, use
Slack pages only when the customer or workspace permits those URLs, and label
unrefreshed Slack setup steps. The linked Atlas Apex Developer Guide pages
loaded no readable body in this review. An official Apex Developer Guide PDF
search excerpt exposed the managed Agentforce global-visibility section, but
the PDF fetch timed out; treat that section as partially reviewed and recheck
before build.
The readable hosted MCP, Actions API, Lightning Types, HXL, and packaging pages
below support the other specific claims in `decision-guide.md`.

Run `advisor-capability-preflight` first. Prefer an exposed Salesforce Docs MCP
for read-only documentation. If unavailable, use only approved official
documentation and record the fallback. Refresh enablement, client support,
Beta status, packageability, authentication, metadata versions, and Setup UI
steps before making a current recommendation. Do not use an org/data MCP for
documentation.

## Sources by decision

- Headless scope and core concepts:
  [Toolkit](https://developer.salesforce.com/docs/platform/headless-get-started/guide/headless-get-started.html),
  [core concepts](https://developer.salesforce.com/docs/platform/headless-get-started/guide/headless-toolkit-core-concepts.html),
  [MCP solutions](https://developer.salesforce.com/docs/platform/headless-get-started/guide/headless-mcp.html).
- Salesforce hosted server choices:
  [standard servers](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/servers-reference.html),
  [custom servers](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/custom-servers.html),
  [Apex Actions](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/invocable-actions.html),
  [Agentforce agents and Prompt Templates](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/agentforce.html),
  [client connection](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/client-connection-overview.html).
- Packaging and Apex:
  [Metadata Coverage Report for ApexClass, LightningTypeBundle, UiWidgetBundle, and McpServerDefinition](https://developer.salesforce.com/docs/success/metadata-coverage-report/references/coverage-report/metadata-coverage-report.html),
  [unpackaged metadata in package-version tests](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/sfdx-dev-dev2gp-unpackaged-md.html),
  [Lightning Type source layout and packaging](https://developer.salesforce.com/docs/platform/lightning-types/guide/lightning-types-core.html),
  [external MCP registration in managed packages](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/dev2gp-package-mcp-agentforce.html),
  [Apex Actions API](https://developer.salesforce.com/docs/platform/api-action/guide/actions-obj-apex.html),
  [Apex-based custom Lightning types](https://developer.salesforce.com/docs/platform/lightning-types/guide/lightning-types-apex.html),
  [Apex Developer Guide PDF](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/salesforce_apex_developer_guide.pdf)
  (indexed excerpt only for managed Agentforce global visibility).
  Recheck the user-linked [managed Apex](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_manpkgs_agent.htm),
  [JsonAccess](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_annotation_JsonAccess.htm),
  and [InvocableMethod](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_annotation_InvocableMethod.htm)
  pages through a readable official source before attributing a claim to them.
- HXL:
  [overview](https://developer.salesforce.com/docs/platform/hxl/guide/get-started.html),
  [rich UI and Lightning type paths](https://developer.salesforce.com/docs/platform/hxl/guide/hxl-rich-ui.html),
  [composition](https://developer.salesforce.com/docs/platform/hxl/guide/hxl-widget-composition.html),
  [configuration](https://developer.salesforce.com/docs/platform/hxl/guide/hxl-widget-configuration.html),
  [schema](https://developer.salesforce.com/docs/platform/hxl/guide/hxl-widget-schema.html),
  [components](https://developer.salesforce.com/docs/platform/hxl/guide/playground-components.html),
  [playground](https://developer.salesforce.com/docs/platform/hxl/guide/playground.html),
  [custom MCP server widget wiring](https://developer.salesforce.com/docs/platform/hxl/guide/hxl-mcp-server.html).
- Channel delivery:
  [Slack developer sandboxes](https://docs.slack.dev/tools/developer-sandboxes/),
  [Slack partner sandboxes](https://docs.slack.dev/tools/partner-sandboxes/),
  [connect Salesforce and Slack](https://slack.com/help/articles/30754346665747-Connect-Salesforce-and-Slack),
  [connect Slackbot with MCP](https://slack.com/help/articles/52462858006675-Connect-Slackbot-to-Salesforce-with-MCP),
  [create an External Client App](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/create-external-client-app.html),
  [configure Claude](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/claude.html),
  [configure ChatGPT](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/chatgpt.html),
  [Headless 360 (Beta)](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/headless-360-mcp.html).

The global `forcedotcom/sf-skills` skills named in `SKILL.md` are execution
dependencies. Confirm their current installed versions and instructions when
handing off; this advisor does not vendor or replace them.
