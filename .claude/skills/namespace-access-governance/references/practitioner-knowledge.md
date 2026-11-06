# Practitioner knowledge for namespace-access-governance

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

- setup-assistant-deep-dive.md, lines 178–319
- development-environment-interview.md, lines 966–1041
- salesforce-source-dossier.md, lines 435–535

## Source extract: setup-assistant-deep-dive.md, lines 178–319

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

Official sources:

- [Limited Access License for Package Developers](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_pkg_slalf_pkg_dev.htm)
- [Add a Limited Access User to Your Dev Hub Org](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_pkg_add_free_license_user.htm)
- [Create and Assign a Permission Set to Developer Users](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_setup_permission_set.htm)
- [Assign Second-Generation Managed Packaging User Permissions](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_pkg_user_permission.htm)

### Baseline package-developer capability

`Salesforce Limited Access - Free` with the `Limited Access User` profile is the documented PBO baseline for package developers who do not need ordinary production CRM access. Current documentation says a PBO includes 100 of these licenses; license counts are time-sensitive and must be checked live.

### Least-privilege package-developer permissions

For managed 2GP package and scratch-org work, grant only the required operations:

- Scratch Org Infos: Read, Create, Delete; add Edit only when the person's operation requires it.
- Active Scratch Orgs: Read, Delete; add Edit only when the broader lifecycle role requires it.
- Namespace Registries: Read.
- System permission: `Create and Update Second-Generation Packages`.

The system permission maps to Tooling API access for:

- `Package2` create/edit;
- `Package2VersionCreateRequest` create/edit;
- `Package2Version` create/edit.

Creating a scratch org from an ancestor version also requires the packaging permission unless the workflow intentionally uses `--no-ancestors`.

### Exceptions to the limited-access baseline

Limited Access users:

- cannot create or manage org shapes;
- can create a scratch org from an existing org shape only with the documented record access;
- cannot run some CLI commands, including `sf limits api display`.

An administrator or standard Salesforce-license user must perform the
unsupported operations or provide the limits evidence. The skill must therefore
reason from **user capability × operation**, not prescribe a team structure.

### Separate promotion permission

Package promotion requires the separate `Promote a package version to released`
permission. It is not part of the package-creator baseline, and promotion is
irreversible for that package version.

The ISV decides whether the permission is assigned to the same person who
creates package versions or to another person. A small ISV can combine these
responsibilities; a larger ISV can separate them. The advisor should identify
the authorized user for each operation and preserve the ISV's approval and
post-promotion verification process without imposing headcount or separation of
duties.

## Step 5 — Develop and Manage Apps with Salesforce DX

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

---

## Source extract: salesforce-source-dossier.md, lines 435–535

## 6. Manage Orgs with Environment Hub

URL: https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/environment_hub_intro.htm

Source type: Atlas packaging guide page

Retrieved title: **Manage Orgs with Environment Hub**

### Documented capabilities

- Connect, create, view, filter, and log in to Salesforce orgs from one place.
- Create standard and partner-edition orgs for development, testing, and trials.
- Automatically discover related orgs.
- Filter members by edition, creation date, instance, origin, SSO status, and other criteria.
- Create SSO mappings for easier access.
- Each member is represented by the standard `EnvironmentHubMember` object.
- The object model allows programmatic extensions such as custom fields, workflow, user mappings, and API-driven SSO configuration.

### Directly relevant child page: Environment Hub Best Practices

URL: https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/environment_hub_best_practice.htm

Documented guidance:

- For an ISV, Environment Hub is already installed in the PBO.
- Non-ISV teams should choose a frequently used org as the hub.
- Choose an SSO method according to security requirements:
  - Explicit mapping
  - Federation ID
  - Custom formula
- SSO does not work for mappings defined in a sandbox or for newly added users until the parent-org configuration exists.
- Add users, change user information, and define sandbox user mappings in the parent org.
- The Environment Hub connected app is internal:
  - Do not enable it for profiles.
  - Do not delete it.
  - Do not modify it unless Salesforce directs you to.

### Directly relevant child page: Connect an Org to the Environment Hub

URL: https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/environment_hub_manage_connect_org.htm

Retrieved title: **Connect an Org to the Environment Hub**

Source type: User-supplied complete Markdown of the official Atlas page. The
official URL and title were independently verified after browser-rendered
article-body extraction failed.

Documented behavior:

- Existing development, test, and trial orgs can be connected and managed from
  Environment Hub. Scratch orgs are excluded.
- The connecting user needs **Connect Organization to Environment Hub**.
- Connecting a related parent org automatically discovers:
  - its sandboxes;
  - patch orgs for a managed 1GP packaging org;
  - TSOs created from a Trialforce Management Org; and
  - LMA release orgs whose managed packages are registered in that LMA.
- A sandbox can't be connected directly. Connect its source org, then refresh
  the sandbox so it is added as a hub member.
- To connect an org:
  1. Open Environment Hub and select **Connect Org**.
  2. Enter the target org's administrator username and an optional description.
  3. Keep the default SSO behavior or explicitly disable **Auto-enable SSO for
     this org**.
  4. Continue the connection, authenticate as the target-org administrator, and
     select **Allow**.
- The connection creates the **Environment org** connected app. If the
  authentication/Allow step fails and that app is absent in the hub, contact
  Salesforce Support.
- Removing an org from Environment Hub disconnects it but doesn't delete it.

Practitioner guidance applies the documented connection workflow to the
dedicated namespace Developer Edition org:

- The namespace org's intended direct-login use is initial namespace
  registration and linking, not ordinary development.
- After setup, connect and track the org through Environment Hub's Manage Org
  functionality.
- The ISV chooses the owner and approval model. Ideally, the Salesforce or IT
  administrator responsible for the org inventory owns it.
- Recurring login isn't normally required, but the ISV should preserve access
  under its own security policy because a later package transfer can require
  the namespace to be linked to another Dev Hub.

### Derived skill implications

- Environment Hub is both a PBO verification surface and an org-provisioning control plane.
- Future assessment should inventory `EnvironmentHubMember` records and purpose, edition, expiration, instance, origin, and SSO state.
- Treat modifications to the internal connected app as a high-risk anti-pattern.
- Include identity/SSO governance in the environment landscape, not only org creation.
- Check **Connect Organization to Environment Hub** before offering a connect
  or disconnect action.
- Treat default SSO as a security-relevant choice and report whether it was
  accepted or disabled.
- Distinguish disconnect from deletion and explain that scratch orgs aren't
  managed through this connection workflow.
- Use Environment Hub as the durable inventory surface for a namespace org
  after registration and linking; do not turn that org into a development
  workspace.

### Practitioner diagnostic: verify the PBO through `EnvironmentHubMember`
