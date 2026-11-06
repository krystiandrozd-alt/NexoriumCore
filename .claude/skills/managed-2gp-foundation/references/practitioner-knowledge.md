# Practitioner knowledge for managed-2gp-foundation

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

- packaging-lifecycle-deep-dive.md, lines 25–191
- setup-assistant-deep-dive.md, lines 105–264
- development-environment-interview.md, lines 966–1041

## Source extract: packaging-lifecycle-deep-dive.md, lines 25–191

## Lifecycle in one view

1. Establish the PBO as Dev Hub, link the production namespace, grant
   operation-specific permissions, and confirm package-version capacity.
2. Configure the package directory and namespace in `sfdx-project.json`.
3. Create the package identity once with `sf package create`.
4. Create immutable package-version candidates with
   `sf package version create`.
5. Track each create request through success or error and inspect its evidence.
6. Install and test candidate versions in non-production orgs.
7. Promote exactly the approved candidate to Released.
8. Verify release state, then distribute, recommend, list, or upgrade through
   the appropriate downstream process.

Promotion is not merely the last build command. It closes the selected
`major.minor.patch` release line and makes an irreversible distribution
decision.

## Packaging identity and record model

| Layer | Observed identifier | Role |
|---|---|---|
| Package identity | `0Ho…` | Top-level `Package2` record created once for a package |
| Subscriber package | `033…` | Subscriber-facing package identity |
| Version-create request | `08c…` | Asynchronous build/validation job created for a package-version request |
| Internal package version | `05i…` | `Package2Version` record produced by a successful request |
| Installable subscriber version | `04t…` | Immutable artifact installed in test or subscriber orgs |
| Request error | Object-specific ID | One error row associated with a failed create request |

Identifier prefixes are useful diagnostics, but the skill should reason from
object and field names rather than treating every observed prefix as a permanent
API contract.

Derived skill implications:

- Never use “package ID” without saying which identity is required.
- Preserve the complete mapping from create request to internal version to
  subscriber version.
- Use the `04t` identifier or a package-version alias for installation and
  promotion commands that accept a subscriber package version.
- Use the `0Ho` identifier or package alias when the command targets the
  package container.
- Treat a successful `08c` request as evidence that a version was built, not
  evidence that it was promoted or released.

## Gate 0: Preconditions before package creation

The packaging workflow assumes that the environment decisions have already been
made correctly:

- The ISV's PBO is the Dev Hub. There are no exceptions within the interview's
  ISV scope.
- Dev Hub and managed second-generation packaging are enabled in that PBO.
- The production namespace was registered in its dedicated Developer Edition
  namespace org, linked to the PBO, connected to Environment Hub for inventory,
  and added to `sfdx-project.json`.
- Package builders have `Create and Update Second-Generation Packages`.
- Release managers separately have `Promote a package version to released`.
- The team checked live `Package2VersionCreates` and
  `Package2VersionCreatesWithoutValidation` capacity.
- The source directory, package boundary, dependency model, and package type
  were approved.

These are not cleanup tasks after `sf package create`. Package ownership,
package type, and namespace are foundational decisions.

## Step 1: Create the package identity once

The documented command is `sf package create`.

Example shape:

```bash
sf package create \
  --name "Package Name" \
  --description "Package Description" \
  --package-type Managed \
  --path force-app \
  --target-dev-hub "PBOAlias"
```

Documented behavior:

- The package is the top-level container for its name, description, namespace,
  type, source directory, and subsequent versions.
- The package name must be unique within the namespace.
- Package type is `Managed` or `Unlocked`.
- `--no-namespace` applies only to unlocked packages. New managed metadata
  should be namespaced.
- The command adds the package name and `0Ho` identifier to
  `packageAliases` unless project auto-update is disabled.
- Name, description, and package-error username can be updated later.
- Namespace and package type cannot be changed after creation.

Practitioner rule: run package creation once per package. Iteration happens by
creating package versions, not by recreating the package identity.

Derived approval gate:

Before package creation, report and obtain approval for:

- PBO Dev Hub identity
- package name and boundary
- package type
- namespace
- source path
- error-notification owner

## Step 2: Treat `sfdx-project.json` as the package blueprint

The project configuration file determines package contents and version
attributes. Relevant fields include:

- `packageDirectories[].path`
- `packageDirectories[].package`
- `packageDirectories[].default`
- `packageDirectories[].versionName`
- `packageDirectories[].versionNumber`
- `packageDirectories[].ancestorVersion` or `ancestorId`
- `packageDirectories[].definitionFile`
- `packageDirectories[].dependencies`
- `namespace`
- `packageAliases`
- optional release-note, installation, and delete-script URLs or paths

The documented version format is:

```text
MAJOR.MINOR.PATCH.BUILD
```

The CLI and Package Visualizer display it as:

```text
major.minor.patch-build
```

The interview's earlier `major.minor.path-build` wording is normalized to
`major.minor.patch-build`.

Documented behavior:

- The partner or development team chooses what qualifies as a major or minor
  change.
- Increase the major version for major changes.
- Increase the minor version for smaller improvements.
- A nonzero patch number creates a restricted patch version.
- `NEXT` can be used for the build segment, for example `9.26.0.NEXT`.
- `--version-number` can override the project value for one command, but does
  not update `sfdx-project.json`.
- Package and version create commands normally update `packageAliases`.
- CLI flags override corresponding project-file values.

Derived skill implications:

- Prefer a committed `versionNumber` ending in `NEXT` over hand-managed build
  numbers.
- Treat a CLI-only version override as drift unless the project file and release
  record are deliberately reconciled.
- Inspect the effective configuration, not just the command line.
- Keep the package alias map as audit evidence connecting human-readable
  versions to immutable `04t` artifacts.
- Treat `packageDirectories[].definitionFile` and any CLI
  `--definition-file` override as part of the package's build contract, not only
  as a developer scratch-org convenience.

## Step 3: Create an immutable package-version candidate

---

## Source extract: setup-assistant-deep-dive.md, lines 105–264

## Step 1 — Establish and Verify the Partner Business Org

### Documented purpose

The PBO is the partner control plane for development and business operations. The linked Partner Community guidance covers partner enrollment, the PBO, Environment Hub, LMA, and partner support resources.

Official source:

- [Join the Salesforce Partner Community](https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/appexchange_partner_join.htm)
- [Take Advantage of Tools and Resources for AgentExchange Partners](https://trailhead.salesforce.com/content/learn/modules/isvforce_basics/isvforce_basics_tools_resources)

The Partner Community join topic recommends using a separate partner username even when the person already has a Salesforce username; joining provides access to the PBO and partner business-management tooling.

### Confirmed advisor rule

- The PBO is the first org a new ISV must establish.
- For an ISV, the PBO must always be the Dev Hub. There are no exceptions in this skill's scope.
- The PBO owns the managed 2GP packages, package versions, namespaces, and scratch-org lifecycle.
- Other orgs are introduced only when their specific namespace, development, test, demo, Trialforce, or customer-trial job arises.

### Evidence required

1. Successful `EnvironmentHubMember` describe.
2. Live limits evidence for the four confirmed development limits.
3. Actual org lifecycle status and expiration evidence.
4. PBO org ID and the authenticated Dev Hub alias used by the team.

Do not infer that the org is Active merely because `TrialExpirationDate` is null. Package Visualizer makes that inference in its display; the advisor must inspect the actual status.

## Step 2 — Enable Dev Hub and Managed 2GP

Official sources:

- [Enable Dev Hub and Second-Generation Managed Packaging](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_pkg_enable_devhub.htm)
- [Select and Enable a Dev Hub Org](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_setup_enable_devhub.htm)
- [Enable Unlocked Packages and Second-Generation Managed Packages](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_setup_enable_secondgen_pkg.htm)
- [Enable Einstein Chatbot Features in Scratch Orgs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_setup_enable_einstein.htm)
- [Transfer a Second-Generation Managed Package to a Different Dev Hub](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_dev2gp_package_transfer.htm)

### Required baseline

In the PBO:

1. Enable Dev Hub.
2. Enable Unlocked Packages and Second-Generation Managed Packages.
3. Record the PBO as the team default Dev Hub.
4. Re-run the capability and limits checks.

The first two enablement choices are irreversible. The Dev Hub becomes the owner of every managed 2GP package created against it. A sandbox cannot be a Dev Hub. A generic Developer Edition or trial Dev Hub has lower limits and introduces expiration and ownership risk.

If a managed 2GP package was already created in the wrong Dev Hub, use Security
Review status as the recovery boundary: recreate an unreviewed package in the
correct PBO Dev Hub, or use Salesforce's Support-assisted transfer process
after Security Review. A package converted from 1GP can't be transferred.

### Einstein correction

The Setup Assistant presents **Enable Einstein Features** beside the two baseline toggles. The linked topic is narrower: it pre-accepts terms so scratch orgs created with the Chatbot feature do not require manual acceptance.

Therefore:

- It is not a universal managed-2GP prerequisite.
- Recommend it only when the intended scratch shapes require the documented Chatbot capability.
- Do not confuse it with the `Einstein1AIPlatform` feature and `einsteinGptSettings` used by the Agentforce scratch preset.

### Completion evidence

- Dev Hub feature enabled.
- Managed 2GP feature enabled.
- Target Dev Hub resolves to the PBO org ID.
- `EnvironmentHubMember` describe succeeds.
- Four development limits are retrievable by an authorized user.

## Step 3 — Create and Register the Namespace

Official sources:

- [Create and Register Your Namespace for Second-Generation Managed Packages](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_dev_dev2gp_create_namespace.htm)
- [Link a Namespace to a Dev Hub Org](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_reg_namespace.htm)
- [Understanding Namespaces](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_unlocked_pkg_plan_namespaces.htm)
- [Connect an Org to the Environment Hub](https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/environment_hub_manage_connect_org.htm)

### Confirmed practitioner rule

- Create a separate Developer Edition org solely to register the production namespace.
- Do not use the PBO, a scratch org, or an ordinary development org as the namespace-registration org.
- Link the registered namespace to the PBO Dev Hub through Namespace Registries.
- Connect the namespace org to Environment Hub so the Salesforce or IT
  administrator can retain it in the ISV's org inventory.
- Use one namespace across the ISV's managed 2GP packages unless a separately approved architecture requires otherwise.

One namespace simplifies code sharing between packages. If multiple namespaces are intentionally used, official guidance recommends a separate Salesforce DX project per namespace.

The namespace org's normal direct-login use is limited to initial registration
and linking. It isn't a persistent development workspace. After setup, manage
and locate it through Environment Hub. Preserve access according to the ISV's
own policy because exceptional events such as a managed-2GP Dev Hub transfer can
require the namespace to be linked to another Dev Hub.

### Environment Hub connection

The PBO user performing the connection needs **Connect Organization to
Environment Hub**:

1. Open Environment Hub and select **Connect Org**.
2. Enter the namespace org's administrator username and a short inventory
   description.
3. Deliberately keep or disable the default **Auto-enable SSO for this org**
   choice.
4. Continue, authenticate to the namespace org, and select **Allow**.

The connection creates the **Environment org** connected app. If authentication
and authorization fail and that app isn't present in the PBO, contact Salesforce
Support. Removing the hub member later disconnects the namespace org but doesn't
delete it.

This workflow excludes scratch orgs. More generally, connecting a parent org can
automatically discover its sandboxes; related managed-1GP patch orgs, TSO child
orgs, and LMA release orgs are also discovered in their documented parent
scenarios.

### Exact trigger

Complete the namespace decision, registration, and link **before the first namespaced managed 2GP package is created** and before the project is used to create namespaced scratch orgs. Put the registered namespace in `sfdx-project.json` before package creation.

### Governance gate

Namespace registration and package association are effectively irreversible:

- a namespace is only 1–15 alphanumeric characters;
- the namespace prefixes component API names;
- a registered namespace cannot simply be renamed or reused elsewhere;
- the package namespace cannot be changed after package creation;
- a disposable test namespace must never be a namespace the ISV may want to use in production.

Before saving:

1. Check availability.
2. Follow the ISV's own product, brand, and technical-approval process.
3. Confirm the namespace is not personal or sensitive.
4. Record the ISV-selected owner. Ideally, use the Salesforce or IT
   administrator who maintains the org inventory.
5. Authenticate to the namespace org as its System Administrator when linking.

The advisor must not require a universal approval chain or recovery-access
record. It should retain enough inventory evidence to identify the namespace
org, namespace, linked PBO, Environment Hub connection, and ISV-selected owner.
Credential custody and backup access follow the ISV's security policy.

### Completion evidence

- Dedicated namespace DE org ID.
- Registered namespace.
- Namespace Registry record in the PBO.
- Environment Hub connection for the namespace org.
- Environment Hub permission, description, and SSO decision recorded.
- `namespace` in `sfdx-project.json`.
- ISV-selected owner recorded in the org inventory.

## Step 4 — Provision Access to Developers

---

## Source extract: development-environment-interview.md, lines 966–1041

### What is the managed-2GP namespace-org rule, and when should it be applied?

Create a separate Developer Edition org solely for namespace registration, link the namespace to the PBO Dev Hub, and normally use one namespace across the ISV's managed 2GP packages.

Complete the namespace decision, registration, and link before the first namespaced managed 2GP package is created and before the project is used to create namespaced scratch orgs. Put the registered namespace in `sfdx-project.json` before package creation.

Because the namespace and the namespace assigned at package creation cannot be
changed casually, check availability and obtain whatever product, brand, and
technical approval the ISV's own governance process requires. Salesforce does
not prescribe the approver or owner in this interview model. Ideally, the
Salesforce or IT administrator who maintains the ISV's org inventory owns the
namespace org. Never use a disposable test namespace that the ISV may later
want in production.

After registration and linking, connect the namespace org through Environment
Hub's Manage Org workflow. The namespace org isn't an ordinary development org
and normally requires no recurring direct login. Retain access according to the
ISV's policy because exceptional operations—such as linking the namespace to a
destination Dev Hub during a supported package transfer—can require the
namespace-org administrator again.

The Environment Hub connection requires **Connect Organization to Environment
Hub**. From Environment Hub, select **Connect Org**, enter the namespace org's
administrator username and an optional identifying description, choose whether
to keep the default auto-enabled SSO, then authenticate to the namespace org and
select **Allow**. If authorization fails and the PBO doesn't contain the
**Environment org** connected app, route the issue to Salesforce Support.

Record that scratch orgs don't use this connection workflow. Removing the
namespace org from Environment Hub disconnects it but doesn't delete the org.

### Who should approve and own the namespace org?

The ISV decides. The advisor must not invent a mandatory business approver,
ownership role, or recovery record. As a recommended operating model, assign
the org to the Salesforce or IT administrator who maintains the ISV's org
inventory.

The org's intended direct-login use is limited to registering and linking the
namespace. Afterward, connect and track it through Environment Hub's Manage Org
functionality. Record enough inventory evidence to identify the org,
description, namespace, linked PBO, SSO choice, and ISV-selected owner, but let
the ISV's security and recovery policy determine credentials and backup access.
Preserve a supported way to regain administrator access because a future Dev
Hub transfer can require the namespace to be linked to the destination.

### What developer-access baseline is documented for the PBO?

Use `Salesforce Limited Access - Free` with the `Limited Access User` profile as the baseline for package developers who do not need ordinary CRM access. Grant only the object and system permissions required by their operations:

- Scratch Org Infos: Read, Create, Delete; add Edit only when required.
- Active Scratch Orgs: Read, Delete; add Edit only when required.
- Namespace Registries: Read.
- `Create and Update Second-Generation Packages`.

Use an appropriately licensed and authorized administrator or standard
Salesforce-license user for unsupported operations such as creating/managing
org shapes and running `sf limits api display`. Grant `Promote a package
version to released` separately because promotion is irreversible. The user
holding that permission can be the same person who performs other packaging
work if that matches the ISV's team and DevOps model.

### How should an ISV divide development, packaging, administration, limits, and promotion responsibilities?

The ISV decides based on its team size and DevOps lifecycle. The advisor must
not require separate people for package development, package-version creation,
org-shape administration, limits inspection, or promotion.

Instead, model the capabilities required by each operation, identify which
authorized user performs it, and verify that the user has the appropriate
license and permissions. A small ISV can assign several or all capabilities to
one administrator; a larger ISV can split them across multiple people. The
separate promotion permission remains a technical requirement, but it doesn't
imply a mandatory separate release-manager person.

### How should a partner choose major versus minor package versions?
