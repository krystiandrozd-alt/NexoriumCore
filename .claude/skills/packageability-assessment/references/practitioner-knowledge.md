# Practitioner knowledge for packageability-assessment

This reference preserves selected material from the user-supplied
`peak-skill-development` knowledge handoff.

## Evidence handling

- Treat statements already labeled **Practitioner rule** as internal operating
  knowledge that can lead the recommendation even when public documentation is
  incomplete.
- Treat **Documented** statements as requiring current-source verification when
  they describe limits, eligibility, CLI syntax, metadata support, or policy.
- Treat **Implementation evidence** and **Live-org evidence** as examples, not
  universal platform contracts.
- Treat **Derived skill implication** as a candidate rule that must remain
  visible in testing until human review confirms it.
- Never imply that an inaccessible or restricted source was reviewed.

## Contents

- setup-assistant-deep-dive.md, lines 319–507
- packaging-lifecycle-deep-dive.md, lines 535–706
- salesforce-source-dossier.md, lines 1558–1741

## Source extract: setup-assistant-deep-dive.md, lines 319–507

## Step 5 — Develop and Manage Apps with Salesforce DX

Official sources:

- [Salesforce CLI Introduction](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Install Salesforce CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm)
- [Salesforce Extensions for Visual Studio Code](https://developer.salesforce.com/tools/vscode)
- [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm)
- [Create an Application](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro_create_new_app.htm)
- [How Salesforce DX Tooling Changes the Way You Work](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce Code Analyzer](https://developer.salesforce.com/docs/platform/salesforce-code-analyzer/guide)
- [Build Your Own Scratch Org Definition File](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file.htm)
- [Select the Salesforce Release for a Scratch Org](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_version_selection.htm)
- [Create Scratch Orgs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_create.htm)
- [Create a Scratch Org Based on an Org Shape](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_shape_intro.htm)
- [Supported Scratch Org Editions and Allocations](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_editions_and_allocations.htm)
- [How Scratch Orgs Fit in the Package Development Workflow](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/dev2gp_so_how_fit_pkg_dev.htm)
- [Quick Start: Visual Studio Code for Salesforce Development](https://trailhead.salesforce.com/content/learn/projects/quickstart-vscode-salesforce)
- [Set Up Your Workspace and Install Developer Tools](https://trailhead.salesforce.com/content/learn/trails/set-up-your-workspace-and-install-developer-tools)

Optional AI accelerators linked by the component:

- [Agentforce Skills](https://labs.agentforce.com/docs/skills)
- [SalesforceAIResearch/agentforce-adlc](https://github.com/SalesforceAIResearch/agentforce-adlc)
- [forcedotcom/sf-skills](https://github.com/forcedotcom/sf-skills)

### Durable workflow

1. Make version control the source of truth.
2. Install Salesforce CLI once using one supported installation method.
3. Verify the installed CLI and core plugins.
4. Author or clone a Salesforce DX project.
5. Check `sfdx-project.json` into source control.
6. Set the production namespace, package directories, source API version, and login behavior deliberately.
7. Author against reproducible scratch shapes from the PBO Dev Hub.
8. Deploy or install dependencies, test, retrieve intended changes, and commit through review.
9. Run Code Analyzer in local and CI workflows.

CLI, extension, Node, plugin, API-version, and Code Analyzer-version guidance is time-sensitive. The stable skill should explain the checks and then consult current official references.

### Scratch definition integration

Package Visualizer's embedded product cards apply a template to `scratchDefFileBuildCard`. The template:

- starts with the shared default `EnableSetPasswordInApi` feature;
- sets an edition;
- adds product features;
- adds companion settings;
- auto-confirms the settings editor.

Because templates add to rather than replace the initial builder state, every embedded product preset also carries `EnableSetPasswordInApi`. The future skill should include that capability only when the development or automation workflow actually requires API password setting.

The advisor must not treat UI confirmation as runtime validation. A scratch definition is complete only after:

1. current feature/setting validation;
2. clean scratch creation against the PBO;
3. package/dependency installation or metadata deployment;
4. relevant tests;
5. delete and recreate proof.

The same shape information also participates in package-version creation.
Salesforce provisions an internal build org and validates the package-directory
metadata there. Before version creation, verify that the effective definition
file contains every edition capability, feature, setting, and object setting
required by the package. Product metadata such as Agentforce or Data 360 can
fail during version creation when the developer's existing org has the
capability but the internal build shape doesn't.

Keep `config/project-scratch-def.json` scoped to daily development and
package-version creation. Do not turn it into an installation-test or
customer-edition compatibility matrix. Those concerns use the ISV's separate
environment and testing strategy. Another scratch definition is optional only
when the team intentionally needs a different scratch-org development shape.

## Step 6 — Incorporate CLI into Application Lifecycle Management

Official sources:

- [Salesforce CLI `sf` v2 Overview](https://developer.salesforce.com/blogs/2023/07/salesforce-cli-sf-v2-is-here)
- [Create a Second-Generation Managed Package](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_dev_dev2gp_create_pkg_base.htm)
- [Create Versions of a Second-Generation Managed Package](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_dev_dev2gp_create_pkg_ver.htm)
- [Release a Second-Generation Managed Package](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_dev_dev2gp_create_pkg_ver_promote.htm)
- [Recommend a Specific Package Version](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_dev_dev2gp_recommended_version.htm)
- [Current `package create` command](https://developer.salesforce.com/docs/platform/salesforce-cli-reference/guide/cli_reference_package_create.html)
- [Current `package version create` command](https://developer.salesforce.com/docs/platform/salesforce-cli-reference/guide/cli_reference_package_version_create.html)
- [Current `package version promote` command](https://developer.salesforce.com/docs/platform/salesforce-cli-reference/guide/cli_reference_package_version_promote.html)
- [Salesforce CLI command reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_unified.htm)
- [Packageable Components](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/packaging_packageable_components.htm)
- [Metadata Coverage Report](https://developer.salesforce.com/docs/success/metadata-coverage-report/references/coverage-report/metadata-coverage-report.html)
- [Scan Your Managed Package with Salesforce Code Analyzer](https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/security_review_code_analyzer_scan.htm)

### Package creation gate

Before `sf package create`, approve:

- PBO Dev Hub identity;
- managed package type;
- namespace;
- package name;
- source path/package directory;
- ownership and error-notification user.

Package type and namespace cannot be changed after creation. The Dev Hub owns the package. A package name must be unique in its namespace. Do not execute this step from an unreviewed sample command.

### Package-version creation

A package version is an immutable installable snapshot. Before creating it, verify:

- package identity;
- version number and ancestry;
- dependencies;
- definition file and required features/settings;
- agreement between package metadata dependencies and the internal build-org
  shape produced from that definition;
- installation-key policy;
- validation mode;
- code-coverage intent;
- PBO package-version capacity.

Validation choices have materially different outcomes:

- **Full validation:** normal candidate for eventual promotion.
- **Async validation:** faster access for installation/testing, but the request must later reach `Success` before promotion.
- **Skip validation:** faster build that cannot be promoted.

Submission is not completion. Track the `08c` request until a terminal state and retain the resulting `04t` identity.

The Setup Assistant sample hard-codes `--installation-key-bypass`. That is not a universal default. An installation key restricts installation; bypass lets anyone with the package version install it. The skill must ask for or apply the ISV's approved distribution policy.

For a promotable version, request code coverage and verify the current coverage requirement. Do not combine incompatible validation flags.

### Promotion and recommendation

- New managed 2GP versions begin as Beta.
- Promotion to Released is irreversible.
- Verify `Released = true` after the command.
- Only released versions can be listed or installed in production/customer orgs.
- Recommending a version is separate from promotion.
- Only one recommended version exists per package, and the normal path requires it to descend from the prior recommendation.
- Ancestor bypass is an exception requiring an explicit rationale and approval.

### Packageability and security scan

Packageability and manageability vary by metadata type and release. Query the current Packageable Components and Metadata Coverage sources for the exact type; do not copy the full catalog into stable skill instructions.

For Security Review:

- run the current AppExchange and recommended security rules;
- make sure local source matches the submitted package;
- fix findings where possible;
- document false positives;
- rerun and retain the report;
- upload the report and supporting false-positive explanation.

## Step 7 — Security Review Readiness

Sources:

- [Salesforce Security Developer Center](https://developer.salesforce.com/developer-centers/security)
- [Manage Your Team's Access to Partner Community](https://trailhead.salesforce.com/content/learn/modules/sf_partner_community/sf_partner_community_manage)
- [AgentExchange Publishing for Partners](https://trailhead.salesforce.com/content/learn/modules/appexchange-partners-publishing)
- [Request a PBO Trial Extension](https://help.salesforce.com/s/articleView?id=000387818&type=1)
- [Partner Community](https://partners.salesforce.com/)
- [Checklist Builder](https://checklistbuilder.herokuapp.com/)

### Required environment evidence

The confirmed practitioner rule is:

- The PBO Dev Hub that owns the managed 2GP package must be Active before Security Review submission.
- A new PBO can begin as a one-year Trial.
- If activation will not finish before the actual expiration date, request an extension; current practitioner guidance allows up to 12 months.
- Do not claim readiness from a missing expiration date. Inspect actual status.

### Partner personas

The Partner Community permissions are operationally distinct:

- `Manage Listings` supports listing creation/editing, package upload, and Publishing Console work.
- `Manage Cases` supports the activation, extension, and other Partner Support case paths.
- Partner administrators manage access and should avoid unnecessary broad permissions.

### Source-quality boundary

- The Security Developer Center is a broad discovery page, not sufficient readiness evidence.
- Checklist Builder is an external convenience tool, not an authoritative Salesforce decision record.
- Security Review readiness must be backed by actual PBO status, package/listing state, scan artifacts, test evidence, and current Salesforce requirements.

## Step 8 — Develop and Extend Salesforce Products

---

## Source extract: packaging-lifecycle-deep-dive.md, lines 535–706

## Package Visualizer implementation trace

### Setup Assistant

The assistant presents the current `sf` command family for:

- package creation;
- package-version creation;
- promotion; and
- recommended-version update.

Useful lessons:

- the lifecycle is presented in order;
- commands are copyable and linked to CLI reference pages;
- the version-create example includes code coverage and a definition file.

Qualifications:

- `--installation-key-bypass` is common ISV practice, but remains a
  partner-owned policy rather than a universal default;
- the promotion sample can rely on a configured default Dev Hub, but generated
  advisor commands should make the PBO target explicit;
- command syntax must be refreshed because Salesforce CLI changes frequently.

### Package and version views

The main UI separates:

- Package Details
- Versions
- Subscribers
- Push Upgrade Requests
- Version Create Requests

Package-level evidence includes name, namespace, `0Ho`, `033`, type,
org-dependence, App Analytics, Data Cloud flag, error username, and timestamps.

Version-level evidence includes version number, `05i`, `04t`, ancestor, branch,
tag, validation flags, code-coverage flag, release state, build duration,
release, creator, and timestamp.

The version view renders an ancestry tree from `AncestorId`, allows filtering by
release and validation state, and opens subscriber, LMA, dependency, and push
upgrade views.

The app's version-detail screen still renders the legacy
`sf force:package:install` command. The future skill must use the current
`sf package install` command family and current flags.

### Version-create request observability

Package Visualizer models these request stages:

```text
Queued
Initializing
VerifyingFeaturesAndSettings
VerifyingDependencies
VerifyingMetadata
PerformingValidations
FinalizingPackageVersion
Success | Error
```

It exposes:

- request `08c`
- status
- package `0Ho`
- produced `05i`
- branch and tag
- async, code-coverage, transitive-dependency, and skip-validation flags
- creator and timestamps
- request error rows

This is a strong model for the future skill: a build command is asynchronous
work with an evidence trail, not a single Boolean success.

## Read-only `PkgViz` evidence

The authorized org query confirmed:

- Alias `PkgViz` targets the production Enterprise Edition org named
  `Ronit Nuguru (Salesforce PBO)`.
- `Package2` contained 38 non-deprecated package identities: 31 Managed and
  7 Unlocked; 3 managed identities were flagged as Data Cloud packages.
- `Package2Version` contained 731 non-deprecated versions: 520 Released and
  211 unreleased candidates.
- Eleven version records showed skipped validation and five showed asynchronous
  validation.
- `Package2VersionCreateRequest` contained 1,125 requests: 731 Success and
  394 Error.
- Eleven successful requests used skipped validation. Async validation appeared
  in both Success and Error states, confirming that async is not success by
  definition.

These counts are point-in-time evidence, not expected entitlements or quality
targets.

### Concrete Package Visualizer release example

The project file currently contains:

```json
{
  "package": "Package Visualizer",
  "versionName": "Version 9.26",
  "versionNumber": "9.26.0.NEXT",
  "ancestorVersion": "9.25.0"
}
```

The live org shows:

- seven `9.25.0` candidates;
- builds 1–6 unreleased;
- build 7 Released;
- `9.26.0-1` Released with the released `9.25.0-7` `04t` as its ancestor.

This is the reference example for teaching candidate-build iteration, release
selection, alias mapping, and linear ancestry.

### Error-sample lesson

A 25-row sample of create-request errors came from only two parent requests and
was dominated by missing custom metadata types plus cascading layout,
translation, permission-set, Apex, and LWC failures.

Derived troubleshooting rule:

1. Group errors by create request.
2. Identify the earliest missing or invalid root component.
3. Distinguish root failures from downstream “parent failed,” invalid type, and
   missing action errors.
4. Inspect package-directory boundaries, dependencies, and source completeness
   before treating every error row as an independent defect.

The cross-package aggregate result for
`HasPassedCodeCoverageCheck` did not agree with direct record-level results on
the current Package Visualizer lineage. Do not use a Boolean aggregate alone as
promotion evidence; retrieve the selected version and request directly and
verify through the supported package-version report.

## Failure modes the skill must catch

- Package created under the wrong Dev Hub without branching on Security Review
  status, 1GP-conversion history, and customer-upgrade impact
- Namespace or package type chosen without approval
- “Package ID” used without distinguishing `0Ho`, `033`, `05i`, and `04t`
- CLI-only version override drift from `sfdx-project.json`
- Reused manual build number instead of `NEXT`
- Version-create request submission reported as a completed build
- Package-version build org missing features or settings required by the
  package metadata
- Async artifact mistaken for a fully validated artifact
- Skip-validation build proposed for promotion
- Installation-key bypass applied without a distribution decision
- Code coverage inferred from a stale or aggregate flag
- Candidate promoted before the partner-defined test and approval process is
  complete
- Ancestor points to an unreleased or non-highest version without an approved
  branch strategy
- Dependency failure confused with missing source in the package directory
- Patch version used for a change outside the patch contract
- Promotion performed without the separate promotion permission or the ISV's
  authorized release decision
- Released state inferred without a post-promotion report
- Legacy `force:package:*` command copied from the app
- Recommended version changed as though it were part of promotion

## Stable core versus refreshable references

---

## Source extract: salesforce-source-dossier.md, lines 1558–1741

## 22. Package Visualizer Practitioner Implementation

Source: Read-only review of `/Users/rnuguru/Desktop/POCs/Package Visualizer Master /Package-Visualizer/`

Source type: User-supplied Salesforce application and practitioner implementation

Evidence caveat: The project demonstrates real workflow decisions and failure handling, but it is not an authoritative statement of the current platform contract. Treat hard-coded feature lists, product presets, Trialforce template IDs, package version IDs, object fields, error maps, and org-purpose choices as time-sensitive. When the implementation conflicts with confirmed practitioner guidance or current official documentation, prefer the latter and retain the code only as historical evidence. Do not surface Package Visualizer's template-ID maintenance implementation as an advisor example; the ISV chooses its own mechanism.

### Dependency trace

| Entry component | Principal dependencies | Environment knowledge encoded |
|---|---|---|
| `orgExpirationCard` | `PackageVisualizerCtrl.getOrgDetails`, `trustInstanceDetail`, Salesforce Trust status API | Organization identity, sandbox/type, trial expiration, primary contact, instance, release, location, maintenance window, and service status |
| `orgLimitCard` | `orgLimits`, `LimitsController`, `Package2Interface`, optional AI summary modal | Raw REST Limits retrieval, consumption and utilization calculations, search, and capacity interpretation |
| `scratchDefFileBuildCard` | `Package2Interface.isActiveScratchOrg`, `scratchOrgConfig`, settings/row editors, `scratchBuildModal` | Scratch capability probing; edition versus org shape; features, typed settings, language, country, release, sample data; JSON rendering |
| `createSignupOrg` | `PackageVisualizerCtrl.isSignupRequest`, `createSignupTrial`, `getSignupCount`, request list/detail components, message channel, custom permission | Capability and permission checks; purpose-first Development/Test/Demo/industry provisioning; edition versus template; request monitoring and error interpretation |
| `setupAssistant` | `setupGuide`, product-specific setup children, profile/permission lookup, org details, PBO heuristic, Tooling credential services | PBO and 2GP enablement, namespace linking, developer access, CLI/source-control workflow, Security Review readiness, specialist product routing, and manual-versus-automated setup boundaries |

### Capability-probe pattern

The Apex layer uses runtime schema availability to determine whether optional partner objects exist:

- `Type.forName('EnvironmentHubMember')`
- `Type.forName('ActiveScratchOrg')`
- `Type.forName('SignupRequest')`

This supports a reusable advisor pattern:

1. Identify the capability needed for the requested action.
2. Run a read-only describe or schema-availability check.
3. Distinguish object absence from a permission/access failure.
4. Offer an action only when the capability and authorization are established.
5. Otherwise provide the appropriate setup, permission, or Partner Support route.

The app's `isPboOrg()` method requires both LMA and `EnvironmentHubMember`. The interview has since established a narrower rule: successful `EnvironmentHubMember` describe is sufficient for the API-level PBO check. The app's combined test is therefore retained as an older practitioner heuristic, not the future skill's PBO identity rule.

### Org identity, expiration, and instance health

The expiration card combines:

- Organization name
- Sandbox flag
- instance name
- organization type
- trial expiration date
- primary contact
- Salesforce Trust location, release, maintenance window, and current status

This is a useful inventory baseline, but the UI treats an absent `TrialExpirationDate` as evidence that the org is Active. The future skill must not rely on that inference for PBO activation or Security Review readiness. It should inspect the actual organization `Status` and use the expiration field as a separate lifecycle signal.

Salesforce Trust information is operational context, not PBO identity evidence. Use it to explain instance placement, release, maintenance, or service incidents; do not use it to infer partner entitlement.

### Limits implementation

`LimitsController` retrieves the current REST Limits payload and the UI derives:

```text
Used = Max - Remaining
Utilization percent = (Max - Remaining) / Max * 100
```

The project reinforces the need to:

- Keep `Max` and `Remaining` as the raw evidence.
- Derive `Used` and utilization only after validating the values.
- Handle zero or unavailable maxima without division errors.
- Label derived values accurately. One implementation property is named `remaining` while displaying `Used / Max`; the future skill must avoid this ambiguity.
- Preserve the raw payload beside any AI-generated summary.
- Focus the PBO assessment on the four confirmed development limits while retaining other limits as optional context.

### Scratch-definition workflow

The scratch builder supports:

- Edition-based creation or source-org shape
- org name and description
- sample-data choice
- current, preview, or previous release
- country and language
- features with case-insensitive duplicate prevention
- typed Boolean, String, and Integer settings
- settings confirmation that is invalidated when inputs change
- rendered, copyable, downloadable `project-scratch-def.json`

It also contains product presets that pair editions, features, and settings for capabilities such as Agentforce, Data Cloud, CRM Analytics, DevOps Center, Order Management, Revenue Cloud, Industry Clouds, Commerce, and Loyalty.

The durable design lesson is the relationship among edition, features, settings, and supporting entitlements. The preset contents are refreshable examples, not stable policy. The skill must validate selected values against the current Scratch Org Features and Metadata API Settings catalogs.

The builder stops at JSON generation. The future skill should add evidence that the definition works:

1. Static JSON and catalog validation
2. Scratch creation against the intended PBO Dev Hub
3. Dependency/package installation or metadata deployment
4. Relevant tests
5. Deletion and recreation to prove reproducibility

The modal's AI guidance correctly emphasizes minimal documented changes and preservation of user values. A separate prompt excludes `description` even though the builder emits it and official documentation supports it. This is another reason to validate generated advice against current documentation rather than copying an embedded prompt as policy.

### SignupRequest workflow and observability

The create flow checks whether `SignupRequest` exists before showing a usable provisioning path. It then gathers:

- Purpose
- edition or Trialforce template ID
- contact name and email
- unique username
- company
- country and preferred language
- My Domain/subdomain
- trial duration
- signup-email suppression choice
- Environment Hub connection choice
- legal acknowledgement

The request list and detail views retain operational evidence including:

- `Status`
- `ErrorCode`
- `CreatedOrgId`
- `CreatedOrgInstance`
- requested and resolved template IDs
- trial source org ID
- edition
- request source
- creation and modification time
- Environment Hub connection flag

The detail view translates common errors involving usernames, emails, subdomains, namespaces, OAuth configuration, templates, and expired TSOs. It also locates the resulting `EnvironmentHubMember` record when one exists.

Derived skill implications:

- Select purpose before org type.
- Keep edition and template ID mutually exclusive.
- Check capability, user permission, and current daily usage before an approved create action.
- Validate identity, subdomain, duration, legal, and Environment Hub inputs before submission.
- Treat request submission as queued work, not successful org creation.
- Poll `Status`, inspect `ErrorCode`, and report the resulting org identity.
- Use the current SignupRequest describe and official documentation for field names. The app includes implementation-era fields and choices that may no longer match the current contract.
- Keep industry template IDs outside the stable skill core.

### Setup assistant workflow

The setup assistant and generated guide encode this sequence:

1. Use the PBO as Dev Hub.
2. Enable Dev Hub and managed second-generation packaging.
3. Create a separate Developer Edition org for namespace registration.
4. Link that namespace to the PBO and use the namespace across the managed 2GP package set.
5. Provision developer access with a limited-access license/profile and the required object and managed-2GP permissions.
6. Use Salesforce CLI, a Salesforce DX project, source control, scratch definitions, and Code Analyzer.
7. Create, version, promote, and release packages.
8. Confirm PBO activation and expiration readiness before Security Review.

The namespace rule is now confirmed by the practitioner and current official
sources: use a separate namespace Developer Edition org, link it to the PBO Dev
Hub, and normally share that namespace across the managed 2GP package set.
Official documentation also establishes the Limited Access developer baseline
and its operation-specific exceptions. The ISV decides whether those
capabilities are held by one person or distributed across a larger team.

Product-specific setup children show that environment provisioning can have several backends:

- self-service scratch features and settings
- a PBO-level entitlement or Partner Support case before scratch provisioning works
- a separate case for a persistent development/demo org
- an external partner developer program or sandbox
- a specialist deployment workflow

The Development Environment skill should detect the required route and hand detailed product work to the relevant specialist skill.

### Automation and security boundary

The Tooling API setup flow provisions subscriber-owned credentials, requires a manual Setup toggle that Apex cannot perform, grants permission-set access, accepts client credentials, and verifies the integration with a live call before enabling it.

This is primarily an implementation pattern rather than Development Environment domain policy:

- Make automated provisioning idempotent.
- Do not overwrite unrelated subscriber configuration.
- Use least privilege.
- Never expose secrets.
- Surface unavoidable manual steps and approval points.
- Verify connectivity with a read-only call before enabling state-changing actions.

### Failure modes contributed by the project
