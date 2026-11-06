# Practitioner knowledge for org-provisioning-diagnostics

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

- development-environment-interview.md, lines 517–618
- salesforce-source-dossier.md, lines 567–637
- salesforce-source-dossier.md, lines 1252–1485
- salesforce-source-dossier.md, lines 1610–1698

## Source extract: development-environment-interview.md, lines 517–618

## Knowledge packet 4: Package Visualizer practitioner workflow

Source: Read-only review of the user-supplied Package Visualizer project, including the named LWCs and their Apex, child-component, permission, message-channel, and configuration dependencies.

Source caveat: Package Visualizer is practitioner implementation evidence, not a timeless platform specification. It contains durable workflow ideas alongside implementation-era heuristics, field names, product presets, package IDs, Trialforce template IDs, and feature catalogs. Confirmed interview rules and current official Salesforce sources take precedence when they differ.

### Lifecycle encoded by the project

1. Inspect the current org's identity, edition/type, sandbox flag, trial expiration, primary contact, instance, release, and Trust status.
2. Qualify the org for PBO duties and establish the PBO as the Dev Hub and managed-2GP control plane.
3. Create a separate Developer Edition org for namespace registration, link
   that namespace to the PBO Dev Hub, connect the org to Environment Hub for
   inventory and access, and keep it out of ordinary development work.
4. Give developers purpose-built, least-privilege access to the PBO rather than broad administrative access.
5. Define disposable development and test shapes as inspectable scratch-definition JSON.
6. Use Environment Hub and SignupRequest for persistent Development, Test/Demo, industry, or template-backed environments when the use case requires them.
7. Monitor org expiration, live capacity, provisioning requests, and provisioning failures.
8. Route product-specific enablement such as Agentforce, Data Cloud, Slack, and Tableau to the appropriate entitlement, case, or partner-program path.

The namespace rule is now confirmed by the practitioner and corroborated by
current official guidance: use a separate Developer Edition org to register the
namespace, link it to the PBO Dev Hub, connect it to Environment Hub, and
normally use that namespace across the managed 2GP package set. Direct login is
normally needed only for initial namespace registration and linking; afterward,
the org is tracked through Environment Hub rather than used for ordinary
development. Current official documentation also establishes the Limited Access
license/profile baseline and its operation-specific limitations. The ISV decides
how those capabilities map to people; the advisor must not prescribe team size
or mandatory separation of duties.

### Reusable diagnostics

- Probe optional partner capabilities before recommending or attempting actions:
  - `EnvironmentHubMember` availability for the API-level PBO check
  - `ActiveScratchOrg` availability before exposing scratch-org management
  - `SignupRequest` availability before exposing programmatic org provisioning
- Keep the confirmed PBO rule: successful `EnvironmentHubMember` describe is sufficient. Package Visualizer's older combined `LMA + EnvironmentHubMember` PBO heuristic is historical evidence and does not override that rule.
- Retrieve raw Limits API `Max` and `Remaining` values, then derive:
  - `Used = Max - Remaining`
  - utilization percentage
- Label derived values precisely. Never display `Used` as though it were `Remaining`, and do not let an AI-generated capacity summary replace the raw evidence.
- Inventory `Organization` facts and the Salesforce Trust instance, but do not infer `Status = Active` solely because `TrialExpirationDate` is absent. Query or inspect the actual status when making lifecycle or Security Review decisions.
- After a SignupRequest is submitted, track at least `Status`, `ErrorCode`, `CreatedOrgId`, `CreatedOrgInstance`, resolved template, creation time, and whether the new org connected to Environment Hub.

### Scratch-definition builder lessons

The project models scratch-shape construction as an explicit sequence:

1. Choose an edition-based shape or an org-shape source.
2. Capture org identity, description, country, language, release channel, and sample-data choice.
3. Select only the required features.
4. Configure typed settings and companion feature/setting dependencies.
5. Invalidate prior confirmation whenever the settings change.
6. Render inspectable `project-scratch-def.json`.
7. Preserve user-entered values and apply only minimal, documented additions.

The future skill must extend this UI-oriented workflow with an execution validation loop:

1. Validate JSON structure and current feature/setting names.
2. Create the scratch org against the intended PBO Dev Hub.
3. Deploy or install the solution and its dependencies.
4. Run the relevant tests.
5. Delete and recreate the org to prove the shape is reproducible and not dependent on hidden Setup changes.

Package Visualizer's product presets are useful examples of how features and settings travel together. They are not a stable catalog and must be verified against the current Salesforce release before reuse.

### SignupRequest provisioning lessons

- Check API availability and user authorization before offering provisioning.
- Choose the environment purpose before selecting an edition or Trialforce template.
- Treat standard edition and template ID as mutually exclusive provisioning strategies.
- Preflight contact identity, unique username, company, country, language, My Domain/subdomain, trial duration, legal acknowledgement, and Environment Hub connection.
- Keep Trialforce template IDs outside stable skill instructions.
- Make org creation an explicit approved action and retain an audit record of the request.
- Poll the resulting SignupRequest rather than treating request submission as successful org creation.
- Translate known failures into corrective guidance, especially duplicate username, invalid or unavailable subdomain, missing/unapproved/deleted template, expired TSO, invalid email, and invalid namespace.
- Re-read the current object describe and official documentation before generating a request. Package Visualizer contains implementation-era field names and purpose options that should not be copied blindly.

### Automation boundary

The setup assistant demonstrates a useful cross-cutting rule: distinguish what can be provisioned safely and idempotently from what still requires a human Setup step, Partner Support case, agreement, external partner program, or secret entry.

For credential-backed automation:

- Provision repeatably without overwriting unrelated subscriber configuration.
- Grant least privilege.
- Never expose client secrets in output or logs.
- Verify configuration with a live, read-only call before enabling an action path.
- Report unavoidable manual steps explicitly rather than implying that the workflow is fully automated.

### Failure modes exposed by the project

- **Capability assumed rather than probed:** the advisor recommends an Environment Hub, scratch-org, or SignupRequest action that the target org cannot perform.
- **Active status inferred from a missing expiration date:** the advisor declares Security Review readiness without checking the actual PBO status.
- **Consumed capacity mislabeled as remaining capacity:** the team believes it has more scratch-org or package-build headroom than it does.
- **Generated JSON accepted without execution validation:** the definition is syntactically plausible but cannot create, deploy, install, or reproduce the intended org.
- **Release-specific preset frozen into the skill:** a renamed feature, changed setting, retired template ID, or superseded product entitlement breaks provisioning.
- **SignupRequest submission treated as completion:** queued or failed org creation is reported as success before `Status` and `ErrorCode` are inspected.
- **Manual enablement hidden:** a flow stalls because a Setup toggle, permission assignment, Partner Support case, agreement, or partner-program enrollment was never surfaced.
- **Product-specific guidance overwhelms the environment skill:** detailed Agentforce, Data Cloud, Slack, or Tableau procedures become stale instead of being routed to specialist knowledge.

## Knowledge packet 5: Setup Assistant dependency and source deep dive

---

## Source extract: salesforce-source-dossier.md, lines 567–637

## 7. SignupRequest

URL: https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_signuprequest.htm

Source type: Atlas Object Reference page

Retrieved title: **SignupRequest**

### Documented scope and limits

- `SignupRequest` represents a request to create a new signup/trial org.
- Available from API version 27.0.
- Unsupported in sandboxes.
- Default documented limit: 20 signups per day.
- Partners can request additional capacity through a Partner Community support case using the AppExchange/managed-packages topic.
- Supported calls include create, delete, query, retrieve, undelete, `getDeleted`, `getUpdated`, describe layout, and describe objects.

### Important request and result fields

- Identity and company:
  - `Company`
  - `FirstName`
  - `LastName`
  - `SignupEmail`
  - `Username`
  - `Country`
  - `PreferredLanguage`
- Org definition:
  - `Edition`, including Partner Developer and other partner editions
  - `TemplateId`
  - `TrialDays`
  - `Subdomain`
  - `SignupSource`
- Environment Hub:
  - `ShouldConnectToEnvHub`
  - When true, the new org connects to Environment Hub; the request must originate from the hub main org or a spoke org.
- Automated connected-app authorization:
  - `ConnectedAppConsumerKey`
  - `ConnectedAppCallbackUrl`
  - `AuthCode` returned after processing
- Status and diagnostics:
  - `Status`: New, In Progress, Error, or Success
  - `CreatedOrgId`
  - `CreatedOrgInstance`
  - `ErrorCode`
- Email control:
  - `SuppressSignupEmails`, used for proxy signup

### Provisioning and error handling

- The documented example authenticates to the Trialforce Management Organization and posts to the `SignupRequest` REST endpoint.
- Error families include:
  - Duplicate username
  - Invalid or conflicting My Domain/subdomain
  - Connected-app/OAuth configuration errors
  - Missing, invalid, wrong-version, unapproved, or expired template/TSO
  - Invalid parameters, email, or namespace
  - Transient scratch-org creation and release errors
  - Fatal errors requiring Salesforce Support

### Derived skill implications

- Keep `SignupRequest` limits separate from scratch-org allocations.
- Validate uniqueness, subdomain rules, template approval and lifetime, trial duration, edition, and Environment Hub connection behavior before execution.
- Poll `Status` and surface the specific `ErrorCode`; do not reduce failures to a generic provisioning error.
- The documentation's password-plus-security-token REST sample is an older integration pattern. Any executable skill should prefer current, securely managed OAuth credentials and avoid displaying or persisting secrets.
- Provisioning new orgs is an Act operation requiring approval and an audit record.

---

## 8. Manage Licenses for Managed Packages

---

## Source extract: salesforce-source-dossier.md, lines 1252–1485

## 17. Trialforce Lifecycle and Delivery

Canonical Markdown sources for this topic:

- https://developer.salesforce.com/docs/platform/isvforce/guide/trialforce-conceptual-overview.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/trialforce-template-considerations.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/trialforce-creating-template.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/free-trial-modify-upgrade.md

Source type: Current Salesforce Developers Markdown pages

Retrieved titles: **Trialforce Key Concepts and Relationships**, **Considerations for Trialforce Templates**, **Create a Trialforce Template**, and **Update Your Trialforce Template**.

All four current Markdown pages were fully readable. Broken or login-gated links from the earlier source set are excluded from the working Trialforce evidence.

### Documented model

- Trialforce delivers free trials of a partner solution in Salesforce orgs that customers can keep and customize.
- A complete Trialforce setup consists of:
  - A Trialforce Management Org (TMO)
  - One or more Trialforce Source Organizations (TSOs)
  - Trialforce templates
- The TSO is used to create Trialforce templates.
- Trialforce templates are the basis of resulting customer trial orgs.
- A template is an approximate snapshot, not an exact copy, of its TSO.
- Templates can also provision demo orgs through Environment Hub and trial orgs through SignupRequest.
- Salesforce's current page uses **AgentExchange** terminology. Older URLs and partner materials can still say AppExchange.

### Documented topology and recommended organization

- A TMO creates and manages one or more TSOs and can supply custom branding.
- A TSO must be a trial org. It holds the installed solution, configuration, users, and sample data for one maintained experience.
- A TSO can produce multiple immutable templates.
- Salesforce recommends one TMO per company, one TSO per solution, and one template per solution version.
- The best-practices page also recommends separate TSOs for audiences such as industry verticals. These statements combine into one practical rule: use one TSO per independently maintained experience and a new template for each version of that experience.
- From the PBO, Environment Hub can create Development, Test/Demo, or TSO member orgs. Unless custom login-page or email branding is required, Salesforce recommends Environment Hub for TSO creation. A TMO is required for branded TSOs.
- Environment Hub currently documents a limit of 20 member-org creates per day; higher needs require a Partner Community support case. Treat this as time-sensitive.

### Lifecycle documented across the overview's child topics

1. Request or configure Trialforce management.
2. Create a TSO.
3. Install the partner solution in the TSO and configure it as customers should experience it.
4. Generate a Trialforce template.
5. Connect or approve the template for the intended signup path.
6. Provision new orgs from the template.
7. When the solution or branding changes, update the TSO and generate an updated template.

The template itself cannot be updated. After a new template reaches `Success`, the ISV must test it and deliberately change the template reference used by each downstream channel.

### Documented template-update workflow

1. Install the updated managed package or extension package in the existing TSO.
2. Update the TSO's configuration, sample data, or custom branding.
3. Create a new Trialforce template.
4. For AgentExchange delivery, connect the updated template to the listing in the AgentExchange Partner Console.
5. For SignupRequest API delivery, open a new Salesforce Support case to approve the replacement template.

The SignupRequest approval case identifies the TSO ID, updated template ID, and org used to create signups. The documented product/topic route is **Partner Programs & Benefits** → **ISV Technology Request**. If AgentExchange is the only delivery channel, the template-approval case is not required.

### Template-ID maintenance boundary

Creating a new template in the TSO produces a new template ID. The ISV decides
how to store, maintain, distribute, replace, and retire that ID based on its own
requirements.

The future advisor must not prescribe or present example naming conventions,
documentation systems, application-configuration patterns, package-release
strategies, ownership models, or approval processes for ID maintenance. It can
detect an older, deleted, or unapproved template reference and explain that the
consumer must use the appropriate replacement, then defer to the ISV's chosen
process.

### Trial type and delivery decisions

| Model | Documented behavior | Advisor distinction |
|---|---|---|
| Installable trial | Installs the package in an existing customer's sandbox or production org and uses their data. | Best when the product's value is demonstrated safely with existing customer data. |
| AgentExchange Test Drive | A single preconfigured org with sample data and a read-only evaluation user. | Shared read-only experience; it is not an independent editable Trialforce org. |
| Trialforce | Provisions a new fully functioning org from a template for each prospect. | Best when the experience needs rich seeded data, special configuration, or independent user access. |
| AgentExchange Trialforce listing | Connects a Trialforce template to a listing and provisions prospect orgs. | Easiest independent-trial channel; the reviewed Trailhead workflow supports one listing template at a time. |
| SignupRequest | A standard object identifies the prospect and template and records provisioning status/history; records can be created manually or by API. | Use when selecting among templates, qualifying prospects, suppressing the initial email for post-provision work, or integrating the ISV's process. |
| Hosted website trial | An ISV-hosted HTML form creates a SignupRequest API request and Salesforce provisions from the selected template. | Form fields must align with SignupRequest, and the prospect must accept the Salesforce Main Services Agreement. |
| Environment Hub Test/Demo | Creates a partner-controlled consumer org, optionally from a Trialforce template ID. | Use for repeatable internal testing and controlled demos; publishing as a Test Drive is a separate secured listing workflow. |

Previously reviewed public guidance distinguishes the shared-read-only Test Drive path from the per-prospect Trialforce listing path. Keep that distinction, but use the four canonical Markdown pages above for the Trialforce hierarchy, template constraints, template creation, and update workflow.

### Trialforce and SignupRequest operational details

- A new PBO normally includes SignupRequest. If it does not, the partner must open a support case.
- Before SignupRequest use, the specific template ID must be approved through Partner Support. A replacement template requires its own approval.
- SignupRequest needs a globally unique Salesforce-format username. A duplicate username appears as an error in request history.
- Suppressing the signup email allows the ISV to finish special configuration before handing over the org and also supports internal demo provisioning.
- A website can map friendly experience names to template IDs. Avoid exposing mutable or stale template IDs as hard-coded advisor policy.
- AgentExchange listing trials collect prospect contact information and can feed the ISV's lead-management process.
- The managed-package trial license configured through LMA and the Trialforce org duration set for the TSO are separate controls.

### Trial experience best practices

- Create audience-specific experiences and use representative sample data, terminology, workflows, reports, and dashboards.
- Choose Setup Only when users should supply data; choose All Data and Setup when seeded data is part of the story.
- Rebase date fields when otherwise the seeded experience would look stale.
- Trialforce replaces data that resembles 15- or 18-character Salesforce IDs. Avoid embedding such IDs in strings, JavaScript, or files.
- Apply branding to signup, login, and email surfaces when needed.
- Test the full signup, email, first-login, permissions, and product experience.
- Update the source and create a new template for every solution release that changes the experience.
- If a prospect can retain the trial org after purchase, plan how seeded sample data is removed or separated from the prospect's data.

### Derived skill implications

- Distinguish the three Trialforce roles. Do not use TMO, TSO, template, and resulting org as synonyms.
- Treat the TSO as a maintained authoring source and the template as an immutable point-in-time artifact.
- Route listing publication, lead collection, branded signup, and customer-trial delivery to Packaging & Distribution while retaining the environment lifecycle and readiness checks here.
- Recognize both AgentExchange and AppExchange vocabulary when matching user intent.
- Ask whether the user needs existing-data evaluation, shared read-only evaluation, an independent editable org, internal provisioning, or website/API automation before recommending a trial mechanism.
- Do not use **Test/Demo**, **Test Drive**, and **Trialforce trial** as interchangeable labels.
- Treat a Salesforce release as a validation trigger. Create a new template when the maintained TSO or intended experience changes, not solely because a release date passed.
- Treat the channel cutover as part of the template release: update the AgentExchange listing or obtain approval for the new SignupRequest template before directing new trials to it.
- Do not prescribe or present example template-ID maintenance mechanisms. The
  ISV owns that choice.

---

## 18. Create a Trialforce Template

URL: https://developer.salesforce.com/docs/platform/isvforce/guide/trialforce-creating-template.md

Source type: Current Salesforce Developers Markdown task

Retrieved title: **Create a Trialforce Template**

### Documented prerequisites

- A Trialforce template is an approximate snapshot of the TSO at a point in time.
- Template management requires **Modify All Data**.
- Before template creation:
  - Review the documented template considerations.
  - Install the partner packages in the TSO.
  - Configure the TSO exactly as the resulting experience should appear, including appropriate sample data, profiles, users, and records.
- Contact Salesforce Partner Support once per TSO to set the duration for trials created from that TSO.

### Documented template choices

- **All Data and Setup:** includes the metadata and data saved in the TSO at template creation.
- **Setup Only:** includes metadata but excludes TSO data.
- Optional controls:
  - Rebase date fields relative to each resulting org's creation date.
  - Exclude Chatter feed items.
  - Mark the template private.
  - For a private template, authorize up to 51 org IDs to use it.
- Templates are public by default.

### Documented statuses and update behavior

| Status | Meaning |
|---|---|
| `In Progress` | Template generation has started and has not finished. |
| `Success` | The template can create trial orgs. |
| `Error` | Generation failed and requires diagnosis. |
| `Deleted` | The template is unavailable and will be removed during system updates. |

After generation succeeds, Salesforce emails the new template ID. Salesforce instructs partners to generate a new template after every update to the TSO so that new orgs reflect the latest source state.

### Derived skill implications

- Require `Success` before recommending a template for Test/Demo or trial provisioning.
- Record the template ID with its TSO identity, package versions, Salesforce release, data mode, creation date, intended purpose, and approval state.
- Never imply that an existing template updates when the TSO changes.
- Treat template creation as an Act operation: it produces a new provisionable artifact and can include data.
- Require an explicit data review before selecting **All Data and Setup**.

---

## 19. Considerations for Trialforce Templates

URL: https://developer.salesforce.com/docs/platform/isvforce/guide/trialforce-template-considerations.md

Source type: Current Salesforce Developers Markdown reference

Retrieved title: **Considerations for Trialforce Templates**

### Documented constraints

- Templates can be created only when the TSO is a trial org.
- The TSO must be no larger than 1 GB.
- The TSO administrator must have a license for the installed solution.
- A TSO can have up to 10 templates. More requires Salesforce Partner Support.
- Salesforce scrubs personally identifiable information from the standard User object, including address fields.
- Salesforce does **not** scrub PII in custom objects or custom fields.
- If a TSO is converted from a trial org to an active org:
  - It can no longer create a Trialforce template.
  - Its existing templates can no longer create trial orgs.
- Salesforce sets an initial default trial duration of 10 days. Support can help change it.

### Derived skill implications

- Add a preflight for TSO trial status, size, admin licensing, template count, and data classification.
- Do not treat Salesforce's limited User-object scrubbing as a complete privacy control.
- Block template creation until custom-object and custom-field data has been reviewed for customer, production, personal, secret, or regulated data.
- Treat the numerical limits and default duration as time-sensitive documentation facts, not immutable skill constants.

---

## 20. Create and Manage Trialforce Source Orgs

URL: https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/trialforce_create_source_organization.htm

Source type: Directly relevant Atlas child page

Retrieved title: **Create and Manage Trialforce Source Orgs**

### Documented creation paths

- A TSO can be created through Environment Hub or a TMO.
- Either method is acceptable in most cases, with two documented routing rules:
  - Use a TMO when branded emails or a branded login page are required.
  - Use Environment Hub to create a Professional Edition TSO.
- For an Environment Hub path, use the Environment Hub in the PBO, then install the package and configure the TSO as customers should experience it.
- TSOs expire after one year. Salesforce instructs partners to request an extension before expiration.

### Practitioner lifecycle rule

Use the TSO only to author and maintain the reusable provisioned experience. Provision fresh consumer orgs from a successful template for repeatable development, testing, controlled demos, or customer trials. This separation prevents ad hoc testing from changing the template source without review.

### Derived skill implications

- In environment inventory, label each org as authoring source or provisioned consumer.
- Track TSO owner, creation path, edition, expiration, package state, source release, and current template IDs.
- An expiring TSO requires an extension or replacement plan before downstream provisioning is interrupted.
- TMO is a Trialforce management role. It is not an exception to the rule that the PBO is the ISV's Dev Hub.

---

## 21. Learn | Demo and Dev Station

---

## Source extract: salesforce-source-dossier.md, lines 1610–1698

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
