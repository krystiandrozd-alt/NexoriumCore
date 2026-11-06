# Salesforce DX Headless source assessment

Use in Assess only for a partner project the user has authorized for
inspection. This advisor repository is not itself a Salesforce DX project.
Start at `sfdx-project.json`; use its actual `packageDirectories[].path`,
package names, namespace, dependencies, and source API version. Do not assume
`force-app` or that every source directory is part of the managed package.
Inspect `unpackagedMetadata.path` separately: [Salesforce uses it for package
version creation tests](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/sfdx-dev-dev2gp-unpackaged-md.html);
its contents are not installed in subscriber orgs.
Check `.forceignore` against every required Apex, Lightning type, widget, and
server file. An ignored local file can be absent from normal Salesforce CLI
source synchronization. Do not infer whether it is in a 2GP version from
`.forceignore` alone; verify package-version contents. Check which proposed
files are tracked, modified, or untracked in source control. Check deployment
manifests when relevant, but do not treat `package.xml` as proof of managed 2GP
contents. Use read-only source search and, when approved, read-only target org
metadata to distinguish local source from deployed capability.

Keep distinct evidence levels: documentation establishes type eligibility;
local files establish source presence; retrieved target-org metadata establishes
deployment; package-version contents establish inclusion; subscriber installation
establishes installed assets; and observed calls establish runtime behavior.
Record the source identity, observation date when known, and release/API scope
for each material claim. Do not infer a rolling documentation page's version
from the project's API version. A conflict needs its own scoped evidence,
not promotion of a weaker observation into a stronger one.

## Inventory and trace

| Metadata | Source-format location under a package/source directory | Assess |
|---|---|---|
| ApexClass | `main/default/classes/<Name>.cls` and `<Name>.cls-meta.xml` | Find the selected `global @InvocableMethod`, input/output `@InvocableVariable` contract, test class, namespace, class access, and any current Agentforce/HXL requirements. For referenced Apex result classes, check `@AuraEnabled` fields and whether the selected type path requires `@JsonAccess`. The actual source root may differ. |
| LightningTypeBundle | `main/default/lightningTypes/<typeName>/schema.json` and optional `renderer.json` | For HXL output, confirm renderer at the type root, widget reference, namespace, and field mapping. Agentforce output uses an Apex-based type; MCP tool output uses result wrapper plus payload object-based types. Check custom Lightning type and `@apexClassType` references against the package namespace. |
| UiWidgetBundle | `main/default/uiWidgets/<widgetName>/<widgetName>.json`, `<widgetName>.uiwidget-meta.xml`, and optional `schema.json` | Confirm composition/configuration; require schema for dynamic attributes. Check every renderer attribute against the widget schema. |
| McpServerDefinition | `main/default/mcpServerDefinitions/<serverName>.mcpServerDefinition-meta.xml` | If present, inspect tool references and HXL `<resources>`/`<uiResource>` wiring. Treat as source/deployable customer setup, not a 2GP component. |
| External MCP registration | `main/default/externalCredentials/`, `namedCredentials/`, `externalServiceRegistrations/`, and `permissionsets/` | When Agentforce is the MCP client, trace authentication and principal access, endpoint and credential linkage, `ModelContextProtocol` registration, and the actual tool schema. Check each asset's package/source directory. |
| Agent tool references | Agent definition under its observed source path, such as `main/default/aiAuthoringBundles/` | Identify referenced MCP tool actions and whether the agent source is in a package directory or under `unpackagedMetadata`. Source references do not prove an action is packageable, installed, or active. |

These are source-format patterns, not proof that the metadata is installed,
activated, discoverable by a client, or included in a package. Inspect the
actual project paths and package version contents before making those claims.
For an external server consumed by Agentforce, trace the links among External
Credential, Named Credential, External Service Registration, Permission Set
principal access, and agent tool references. Compare the structured tool schema
with any human-readable server description; report discrepancies without
treating description text as an activated tool. If source also contains a
Callable or HTTP Apex bridge, identify it as a separate path and verify a caller
before attributing the agent's MCP actions to that bridge. Do not record
secrets or infer a live connection from metadata.

For an HXL MCP tool, trace Apex invocable output → MCP tool's `outputValues` →
payload Lightning type → result-wrapper Lightning type renderer → widget
schema/composition → MCP server definition's tool and `uiResource`. Compare
each intended action with the server's actual `<tools>` entries; a similar
older action does not establish the new tool's availability. Match each
`<uiResource>` exactly to a `<resources>` entry and its Lightning type URI.
Check each tool's `apiIdentifier` and `operation` against the action identity
in the target org, especially when packaged actions gain a namespace. Compare
`readOnly`, `idempotent`, and `destructive` declarations with the action's
actual behavior; report discrepancies for review. Record missing or mismatched
names. A standard server has no partner
`McpServerDefinition` to find in the project.

For each HXL resource URI, use
`ui://widget/lightningType/<result-wrapper-CLT-API-name>` with the Lightning
type's API name as deployed in that org. Check `sourceApiVersion`, target-org
support, and the selected global skill's minimum API version before handing
off a build; a compatible source folder alone is not deployment evidence.

For widget references, Salesforce documents `@widget/c/<name>` even in an org
with a namespace. Apex class references in managed packages use the registered
package namespace. If local schemas use `c__` for a proposed managed-package
Apex reference, mark namespace resolution for package/deployment validation;
do not declare a runtime failure from source text alone. The
[HXL widget guide](https://developer.salesforce.com/docs/platform/hxl/guide/hxl-rich-ui.html)
and [Apex-based custom Lightning type guide](https://developer.salesforce.com/docs/platform/lightning-types/guide/lightning-types-apex.html)
describe these distinct reference rules.

## 2GP boundary

The current [Salesforce Metadata Coverage Report](https://developer.salesforce.com/docs/success/metadata-coverage-report/references/coverage-report/metadata-coverage-report.html)
marks `ApexClass`, `LightningTypeBundle`, and `UiWidgetBundle` for 2GP. It marks
`McpServerDefinition` for Metadata API/source tracking but **not** 2GP.
The [custom-server guide](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/custom-servers.html)
describes Metadata API deployment; that is not evidence of managed-package support.
Check the target org's release, package version, and feature availability
before treating an eligible type as successfully packaged.

If a `McpServerDefinition` is inside a directory used to build a managed 2GP
package, flag it for package-boundary review. Keep the customer-specific
server definition out of the package candidate. The partner can give the
customer exact instructions or a source example that is outside the packaged
directory. The subscriber admin creates a custom server and adds the relevant
installed Apex actions or standard tools. If HXL must render on an MCP client,
Setup alone is insufficient: the customer must also retrieve the server
definition, add the widget resource and matching tool `uiResource`, deploy that
metadata in their org, and activate the server. See the [HXL MCP server guide](https://developer.salesforce.com/docs/platform/hxl/guide/hxl-mcp-server.html).

Keep this hosted-server boundary distinct from [packageable external MCP
registration metadata](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/dev2gp-package-mcp-agentforce.html)
used when Agentforce is the client. `ExternalCredential`,
`ExternalServiceRegistration`, `NamedCredential`, and `PermissionSet` can be
2GP components; MCP tool actions and Agentforce Gateway policies cannot.
An agent definition under `unpackagedMetadata` is outside the installed
package. Hand detailed package composition and version checks to
`packageability-assessment` and `package-version-validation`.

## Assessment output

For each relevant component, report its observed path, metadata type, role,
dependency, proposed package/customer-setup owner, and evidence status
(source observed, org observed, or unknown). Identify source-control and
`.forceignore` state, action-to-widget and tool-to-resource gaps, namespace
checks, registration-to-agent gaps for external servers, non-packageable server
definitions in package roots, and client setup still required. Do not expose
credentials or call tools just to discover their output schema.

On a return assessment, add what changed, which validation was attempted,
its observed result, what remains unknown, and the next bounded check from
[the partner journey](partner-journey.md). A not-run check or a missing
prerequisite is not a failed runtime test.
