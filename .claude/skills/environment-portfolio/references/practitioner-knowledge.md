# Practitioner knowledge for environment-portfolio

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

- development-environment-interview.md, lines 366–517
- development-environment-interview.md, lines 927–966
- salesforce-source-dossier.md, lines 735–920
- salesforce-source-dossier.md, lines 1252–1558

## Source extract: development-environment-interview.md, lines 366–517

## Knowledge packet 3: Trialforce-backed Test/Demo environments

### Confirmed principles

1. Use a Trialforce Source Organization (TSO) as the maintained source or "golden org" from which Trialforce templates are created.
2. A Trialforce template is an approximate snapshot, not an exact copy, of a TSO at a point in time. It can include Setup only or both Setup and data.
3. When an ISV has an appropriate Trialforce template, use its template ID to provision a Test/Demo org for repeatable testing and controlled demonstrations. When the partner catalog provides an Industry PDE or other development template, use that template-backed development org for persistent industry development.
4. Template-backed environments are especially useful for Industry Cloud and other specialized products where the environment must arrive with a coordinated set of product technology, licenses, permissions, entitlements, configuration, and sample data.
5. A TSO and a Test/Demo org have different jobs:
   - Author and maintain the reusable provisioned experience in the TSO.
   - Generate a versioned template from the TSO.
   - Consume the successful template in newly provisioned Test/Demo or trial orgs.
6. Do not use the TSO as the team's ordinary feature-development org. Changes in the TSO should be deliberate changes to the reusable template experience.
7. Regenerate a template after updating the TSO. Existing templates are point-in-time artifacts and do not inherit later TSO changes.
8. Treat published template IDs, product/license inventories, availability, and expiration periods as time-sensitive reference data. Look them up at the time of provisioning instead of hard-coding them into the skill's core instructions.
9. Organize Trialforce around independently maintained experiences. Salesforce recommends one company TMO, one TSO per solution, and one template per solution version; when audiences or industry verticals require materially different maintained experiences, use separate TSOs.
10. Trialforce supports customer acquisition and internal enablement. It can provision prospect trials, internal sales-engineering demos, training environments, and documentation environments, but the access and lifecycle rules differ by delivery method.
11. Keep the TSO, template, and provisioned org distinct:
    - The TSO is the maintained authoring source.
    - The template is an immutable provisionable artifact.
    - A trial, Test/Demo org, or Test Drive org is a consumer of that artifact.

### Trialforce lifecycle

```text
PBO / Environment Hub
        |
        +--> create or manage TSO
                |
                +--> install solution and required packages
                +--> configure licenses, settings, users, sample data, and experience
                +--> generate Trialforce template
                        |
                        +--> successful template ID
                                |
                                +--> Environment Hub Test/Demo orgs for internal testing or demos
                                +--> shared read-only AgentExchange Test Drive
                                +--> independent editable AgentExchange trial org
                                +--> manual or API-driven SignupRequest org
                                +--> hosted website trial
```

Salesforce also supports creating a TSO through a Trialforce Management Org (TMO). Use a TMO when branded Trialforce emails or login pages are required; use Environment Hub when creating a Professional Edition TSO. Unless custom login-page or email branding is required, Environment Hub is the simpler TSO-creation path. Within this Development Environment skill, those are routing conditions rather than reasons to replace the PBO as Dev Hub.

### Template readiness checks

Before recommending or using a Trialforce template:

- Confirm that the source is a TSO and is still a trial org. A TSO converted to an active paid org can no longer create templates, and its associated templates can no longer create trial orgs.
- Confirm that the TSO is no larger than the current documented template limit.
- Confirm that the TSO administrator has a license for the installed solution.
- Confirm that the intended package versions, dependencies, product licenses, permissions, configuration, profiles/users, records, and sample data are present.
- Confirm that Salesforce Partner Support has set the intended resulting-org duration for the TSO. This is a one-time request per TSO.
- If the template will be used through SignupRequest, confirm that the specific template has Partner Support approval and that SignupRequest is available in the PBO. Approval of an older template does not approve its replacement.
- Decide whether the template should contain **Setup Only** or **All Data and Setup**.
- For templates containing dates, decide whether dates should be rebased relative to each new org's creation date.
- Decide whether to exclude Chatter feed items.
- Decide whether the template is public or private and, for a private template, which orgs can use it.
- Require a `Success` template status before provisioning. `In Progress`, `Error`, `Deleted`, or stale templates are not ready.
- Track the TSO's expiration and request an extension before it expires.
- Track which TSO state, package version, Salesforce release, intended audience, data mode, delivery channels, and approval state produced each template ID.

Current documentation limits a TSO to 10 templates unless Salesforce Support approves more, requires the TSO to be no larger than 1 GB, and defaults resulting trials to 10 days unless Support changes the duration. These are current-reference values and must be rechecked rather than embedded as timeless policy.

### Trial delivery chooser

| Need | Delivery model | Key behavior |
|---|---|---|
| Let an existing Salesforce customer evaluate the package with their own data | Installable trial | Installs into the customer's sandbox or production org and is governed by the package trial license. |
| Offer the easiest shared listing demo | AgentExchange Test Drive | Uses one preconfigured org and a read-only evaluation user; prospects do not receive independent editable orgs. |
| Give each prospect a complete editable environment | Trialforce trial | Provisions a new org from a successful template; the org can be retained and converted when the prospect purchases, subject to the applicable commercial process. |
| Publish one simple template from the listing | AgentExchange Trialforce listing | Easiest independent-trial channel, but the current Trailhead workflow supports only one Trialforce template on the listing at a time. |
| Choose among templates or collect/qualify more prospect information | SignupRequest | Can be created manually or through the API and records prospect, template, status, and provisioning history. |
| Automate branded trials from the ISV's site | Hosted website trial | An HTML form creates a SignupRequest API request; form fields must match the request model and the prospect must accept the Salesforce agreement. |
| Produce a controlled internal demo or test environment | Environment Hub Test/Demo | Provision from the appropriate template ID and retain it under the ISV's environment inventory and access policy. |

The Trialforce org lifetime and the managed-package trial license are separate controls. Do not infer one from the other: Partner Support sets the TSO-derived org duration, while LMA controls the package's trial-license terms.

### Trial experience design and maintenance

- Configure the TSO as the exact story the audience should experience: installed solution, profiles, users, permissions, records, branding, configuration, and representative sample data.
- Prefer sample data that uses the terminology, workflows, and scenarios of the intended role or industry.
- Choose **Setup Only** when users should bring their own data; choose **All Data and Setup** when sample data is part of the experience.
- Rebase date fields when static dates would make a newly provisioned trial look stale.
- Avoid embedding literal 15- or 18-character Salesforce IDs in strings, JavaScript, or files because Trialforce replaces values that resemble Salesforce IDs.
- Test the complete signup, email, first-login, access, and product experience before publishing a template through any customer-facing channel.
- A template cannot be edited. Update the TSO, create a new template, wait for `Success`, test it, then deliberately replace the template used by each delivery channel.
- For AgentExchange delivery, connect the successful replacement template to the listing in the AgentExchange Partner Console.
- For SignupRequest API delivery, open a new template-approval case after creating the replacement. Include the TSO ID, updated template ID, and org used to create signups. AgentExchange-only delivery does not require this approval case.
- Plan how sample data will be removed if a prospect converts a Trialforce org into a retained production org.

### Template-ID governance

Creating a new template from the TSO produces a new template ID. The ISV decides
how to store, maintain, distribute, replace, and retire its template IDs based
on its own requirements. The advisor must not prescribe a naming convention,
documentation system, configuration pattern, package-release strategy, owner,
or approval process for maintaining those IDs.

The advisor can identify that a workflow still references an older, deleted, or
unapproved template ID and explain that the consumer must be updated. It should
then defer to the ISV's chosen maintenance process.

### Environment selection rules

- Use a scratch org when the needed shape is supported through edition, `features`, `settings`, packages, and scripted data, and the goal is fast disposable development or automation.
- Use a PDE when the team needs a long-lived partner development org.
- Use a TSO when the team must author or update a reusable Trialforce template.
- Use a template-backed Industry PDE or other approved development template when active development requires a persistent pre-provisioned Industry Cloud or specialized product shape.
- Use a template-backed Test/Demo org when the team must repeatedly reproduce a pre-provisioned solution or customer-representative environment for testing or a partner-controlled demonstration.
- Use a customer Trialforce path when a prospect must receive an independent editable environment.
- Use a published Test Drive only when a shared, read-only prospect experience is intentional. Do not expose an ordinary partner-controlled Test/Demo org merely because its source was a Trialforce template.

### Quick environment chooser

| Goal | Default environment | Switch when |
|---|---|---|
| Build an app or feature | Partner-edition scratch org | Use a PDE when work must persist beyond 30 days; use an approved template-backed industry development org when backend product provisioning cannot be reproduced in a scratch definition. |
| Test a new idea quickly | Scratch org | Use an SDO or IDO only to learn or demonstrate an already preconfigured Salesforce product experience, not to develop the partner package. |
| Run package or edition compatibility tests | Fresh scratch shapes or Environment Hub Test/Demo orgs | Use a Trialforce template when the test requires a coordinated pre-provisioned product, license, entitlement, configuration, and data state. |
| Maintain a reusable provisioned experience | TSO | Generate a new template for consumers; do not perform unrelated testing in the TSO. |
| Give a controlled live demonstration | Test/Demo org or the approved partner demo type for that product | Publish a secured Test Drive for shared read-only prospect access; use a Trialforce trial or Clean Demo path when the customer needs an independent environment. |
| Let a prospect explore independently | Customer trial org | Do not hand over a partner-only SDO, IDO, PDE, or Test/Demo org. |
| Learn or play in a prebuilt Salesforce scenario | SDO, IDO, autoNTO, or another current Partner Learning Camp environment | Move to scratch/PDE when creating partner solution metadata; move to trial/CDO when customer access is needed. |

### Demo and customer-access guardrails from the supplied partner guidance

- Simple Demo Orgs (SDOs) and Industry Demo Orgs (IDOs) are preconfigured partner learning and demonstration environments, not general development orgs or customer trial orgs.
- Do not load customer data into an SDO or IDO.
- Do not let a customer independently access or navigate an SDO or IDO.
- Do not use an SDO or IDO as a customer proof of concept, customer project environment, package-development org, or production environment.
- When customer access is required, use an approved customer trial or Clean Demo Org path appropriate to the engagement; a Clean Demo Org does not become the customer's production org.
- An individual partner demo-org catalog, template-ID catalog, request path, and expiry notice can change. Consult the current Partner Learning Camp or partner guidance at the time of use.

### Failure modes to capture

- **TSO confused with Test/Demo org:** routine development changes corrupt the maintained template source, or the team performs testing in the authoring org instead of a reproducible consumer.
- **Stale template:** a Test/Demo org contains an old package version, old provisioning, or pre-release product configuration because a new template was not generated after TSO changes.
- **Template and source identities blurred:** the team treats a template as editable or assumes that a provisioned org changes when its TSO changes.
- **Template status ignored:** provisioning is attempted with a template still in progress, in error, or deleted.
- **Incomplete entitlement snapshot:** the resulting org lacks a necessary industry license, permission, package, or configuration and no longer represents the target customer environment.
- **Release drift:** a persistent industry PDE or old template does not receive a newly introduced feature automatically; a refreshed TSO/template or newly provisioned org is required.
- **Sensitive data copied:** custom-object or custom-field PII is copied because only User-object PII is scrubbed automatically.
- **Partner demo used as customer trial:** customer access, customer data, or customer project work is placed in an org whose terms and lifecycle do not permit it.
- **Test Drive confused with Trialforce:** the team expects a shared read-only evaluation org to behave like an independent editable prospect org, or exposes excessive access and sensitive data to a shared evaluation user.
- **Conversion path ignored:** a prospect enters valuable data into a Trialforce org, but the ISV has no plan for conversion or removal of seeded sample data.
- **Signup path unapproved:** the website or automation attempts to use SignupRequest before the source/template path is approved or the capability is available in the PBO.
- **Replacement template approval assumed:** a template used by SignupRequest is replaced, but the new template ID is never approved because the prior approval is treated as transferable.
- **Stale template reference:** a consumer still uses a deleted, superseded, expired, unapproved, or wrong-release template ID. The advisor identifies the mismatch but lets the ISV choose how to maintain and distribute the replacement.
- **Expiry unmanaged:** the TSO or resulting environment expires before a replacement or extension is ready.

## Knowledge packet 4: Package Visualizer practitioner workflow

---

## Source extract: development-environment-interview.md, lines 927–966

### When should a partner use a PDE versus a partner-edition scratch org?

- Use a PDE for long-lived development or initial testing that must persist beyond 30 days.
- Use a partner-edition scratch org for disposable development and testing with a maximum 30-day lifetime and a shape defined through edition, features, settings, and related configuration.
- Prefer scratch orgs when the goal is rapid, repeatable feature-shape provisioning. Supported features available to the PBO Dev Hub can be requested in the definition file without a Partner Support case.
- Treat PDE expiration as an inactivity-policy concern rather than a fixed short duration. Verify current policy and the specific org instead of hard-coding one inactivity period.

### When should a partner use a Test/Demo org versus a Trialforce Source Organization?

- Use the TSO to install and configure the solution, licenses, entitlements, settings, users, and representative data that define a reusable Trialforce experience.
- Generate a new Trialforce template whenever the maintained TSO state changes.
- Use a successful template ID to provision Test/Demo orgs that reproduce that state for testing or partner-controlled demonstrations.
- When an approved Industry PDE or other development template exists, use it to create a persistent pre-provisioned development environment for that product.
- This template-backed route is especially valuable for Industry Cloud and specialized product shapes that require coordinated backend provisioning and are not fully or reliably expressed by a scratch-org definition.
- If a prospect needs independent access, provision through an approved customer trial or Clean Demo path rather than handing over a partner-only Test/Demo, SDO, or IDO.

### What event requires a new TSO or Trialforce template?

- Maintain the existing TSO for an existing offering or audience experience.
- Generate a new template after every TSO update that must appear in newly provisioned orgs, including a package-version, configuration, branding, license, entitlement, permission, user, or sample-data change.
- Generate and validate a new template for every solution release that changes the maintained trial experience.
- Treat a Salesforce release as an end-to-end validation trigger. It requires a new template only when the TSO or intended experience must change.
- Create a separate TSO when the ISV needs a separately maintained solution, industry, audience, edition, or materially different experience—not merely because a new immutable template is required.
- Existing provisioned orgs and templates do not inherit later TSO changes. After the new template reaches `Success`, test it and deliberately update each Environment Hub, Test Drive, listing, SignupRequest, or website reference that should use it.
- When AgentExchange is the only delivery channel, update the listing with the new successful template; no template-approval case is required for that channel.
- When SignupRequest API is a delivery channel, obtain Partner Support approval for every new template ID before switching API or website provisioning to it.

### How should an ISV maintain and distribute Trialforce template IDs?

Creating a new template in the TSO produces a new template ID. How that ID is
stored, maintained, distributed, replaced, and retired is entirely the ISV's
decision based on its requirements.

The skill must not recommend or present example maintenance mechanisms, naming
conventions, ownership models, documentation systems, configuration patterns,
or package-release strategies. It can detect a stale or unusable template
reference and explain that the consuming workflow must use the appropriate new
ID, then defer to the ISV's maintenance process.

### What is the managed-2GP namespace-org rule, and when should it be applied?

---

## Source extract: salesforce-source-dossier.md, lines 735–920

## 10. Choose the Right Salesforce Org for the Right Job

URL: https://developer.salesforce.com/blogs/2024/05/choose-the-right-salesforce-org-for-the-right-job

Source type: Salesforce Developers Blog

### Documented org characteristics

- **Production**
  - Final destination for applications and operational data.
  - Avoid direct code or metadata changes.
  - Use governed change management.
- **Sandboxes**
  - Copies of production shape and metadata, with data volume based on type.
  - Developer/Developer Pro: individual development, preferably one per developer.
  - Partial Copy: realistic subset for UAT and some performance testing.
  - Full: comprehensive staging, testing, and training.
  - Persistent and refreshable; useful for work lasting longer than scratch-org lifetimes.
- **Scratch orgs**
  - Empty, configurable, source-tracked by default, disposable, and independent of production.
  - Useful for parallel development, automation, peer review, CI/CD, and performance testing.
  - Vital to 2GP development for ISVs and partners.
  - Often used together with sandboxes rather than as an exclusive replacement.
- **Generic Developer Edition**
  - Useful for learning, experimentation, namespace creation, and some evaluation.
  - Less suitable as a permanent development environment.
  - Not refreshable, limited storage, no production synchronization, no sandbox creation, and no default source tracking.
  - A generic DE Dev Hub is documented with three active and six daily scratch-org allocations.
- Other special orgs include preview DEs, limited-time DEs, Trailhead Playgrounds, and partner trial orgs.

### Documented ALM mapping

| ALM stage | Candidate environments |
|---|---|
| Plan | Trial, DE, Developer/Developer Pro sandbox, scratch |
| Build | Developer/Developer Pro sandbox, scratch |
| Test | Scratch, Partial Copy, Full |
| Release | Partial Copy, Full, production |
| Observe | Full, production |

### Derived skill implications

- Ask what job the org must do before recommending an org type.
- A persistent org is not automatically better than a disposable one; choose based on data, duration, reproducibility, feature availability, and lifecycle stage.
- For ISVs, layer partner-specific PBO/PDE/partner-edition options on top of the general org-selection guidance.

---

## 11. Benefits of Using a Partner Development Org and Demo Environment

URL: https://help.salesforce.com/s/articleView?id=000391959&type=1

Source type: Salesforce Help article

Retrieved title: **Benefits of Using a Partner Development Org and Demo Environment**

Publish date shown: 2025-01-29

Retrieval caveat: The Help page is shell-heavy, but browser-rendered extraction returned the article body and tables. Counts and allocations are time-sensitive.

### PDE versus generic DE

| Attribute | Generic DE | Partner Developer Edition |
|---|---:|---:|
| Intended purpose | Initial development, prototyping | Application development, initial testing |
| Price | Free | Free to Salesforce partners |
| Provisioning | Developer site | Environment Hub |
| Sandboxes | None | None |
| File storage | 20 MB | 1 GB |
| Data storage | 5 MB | 250 MB |
| API allocation per 24 hours | 15,000 | 50,000 |
| Expiration | After one year of inactivity | After one year of inactivity |
| Feature/license/limit requests | Not available | Submit a case |
| Managed beta testing | Supported | Supported |

### PDE versus DE license counts

| User license | Generic DE | PDE |
|---|---:|---:|
| Analytics Cloud Integration User | 2 | 2 |
| Chatter External | 500 | 500 |
| Chatter Free | 5,000 | 5,000 |
| Chatter Only | 0 | 20 |
| Customer Community | 5 | 20 |
| Customer Community Login | 5 | 200 |
| Customer Community Plus | 5 | 20 |
| Customer Community Plus Login | 5 | 200 |
| Partner App Subscription | 2 | 0 |
| Partner Community | 5 | 20 |
| Partner Community Login | 5 | 380 |
| Salesforce | 2 | 20 |
| Salesforce Platform | 3 | 20 |
| Service Cloud | 0 | 20 |

### Partner demo environment comparison

All listed demo environments are free to partners and provisioned through Environment Hub.

| Demo edition | Sandboxes | Data / file storage | API calls per 24h | Expiration | Managed beta testing | Platform Encryption for encryptable custom managed fields |
|---|---|---|---:|---|---|---|
| Enterprise | 25 Developer, 1 Partial Copy | 10 GB / 1 GB | 100,000 | 1 year | Yes | Yes |
| Professional | 10 Developer | 10 GB / 11 GB | 100,000 | 30 days | Yes | No |
| Partner Enterprise | 60 Developer, 2 Partial Copy, 1 Full | 20 GB / 67 GB | 100,000 | 1 year | Yes | No |
| Partner Professional | 20 Developer | 10 GB / 13 GB | 100,000 | 1 year | Yes | No |
| Consulting Partner | 25 Developer, 1 Partial Copy | 12 GB / 5 GB | 100,000 | 1 year | No | No |

The article separately lists license counts for each demo edition. Those counts should be read from the current article when a design depends on a specific license type.

### PDE persistence and Developer Edition inactivity policy

Practitioner guidance uses PDE when an ISV needs a development org that persists beyond a scratch org's 30-day maximum. "Persistent" must not be interpreted as "incapable of expiration."

Supplied release note:

URL: https://help.salesforce.com/s/articleView?id=release-notes.rn_de_org_expiration.htm&language=en_US&release=238&type=5

Retrieved title: **Updates to Developer Edition Org Expiration Policy**

- The 2022 release note says DE orgs with no login for 180 days, reduced from 365, are marked inactive and queued for deletion.
- Salesforce sends an impending-expiration email.
- Logging in before the stated date keeps the org active.

Current child article:

URL: https://help.salesforce.com/s/articleView?id=sf.admin_de_org_expiration.htm&language=en_US&type=5

Retrieved title: **Developer Org Expiration**

- The current article distinguishes:
  - Newer Developer Edition orgs: 45 days without login.
  - Developer Edition (Legacy) orgs: 180 days without login.
- It documents limited reactivation windows after an org is flagged.
- It lists expiration exemptions for several scenarios, including:
  - Orgs with a released managed package, including 2GP Dev Hubs
  - Namespace-registration orgs
  - Orgs with Environment Hub enabled
  - Orgs used for Trailblazer or Partner Community login
  - Trialforce Source Organizations
  - Orgs in which a connected app was created

The PDE comparison table on this page's source article states one year of inactivity. Because these official sources differ by org type and publication date, treat inactivity duration and exemption status as time-sensitive.

### Practitioner decision rule

- Use PDE for persistent partner application development and initial testing that must last longer than 30 days.
- Verify current inactivity policy, exemption status, org-specific expiration date, and warning emails.
- Do not promise that a PDE can never expire.
- Establish an activity or expiry-monitoring practice for any persistent development org.

### Environment Hub purpose choices

- **Development**
  - Creates a PDE for building, packaging, and uploading a solution.
  - Includes more users, storage, and partner-oriented capabilities than generic DE.
  - Must not be shared with customers or prospects.
- **Test/Demo**
  - Tests compatibility across editions or supports live demonstrations.
  - Must not be handed to customers/prospects for independent use outside the controlled demonstration.
- **Trialforce Source Organization**
  - Produces trial templates.
  - The article notes a branding limitation for TSOs created through Environment Hub.

### Expiration checks

The article recommends:

- Review expiration dates under Setup → Company Settings → Company Information.
- Query:

```sql
SELECT TrialExpirationDate FROM Organization
```

- Optionally use Salesforce Labs' Org Expiry Notifier.

### Derived skill implications

- Prefer PDE over generic DE for persistent partner development and initial testing.
- PDE does not supply sandboxes; do not imply otherwise.
- Add explicit "not for customer sharing" guardrails to Development and Test/Demo environment recommendations.
- Inventory expiration dates and establish renewal/rebuild plans for every non-permanent org.
- Treat the detailed allocation tables as current-reference data, not timeless constants embedded permanently in the skill.

---

## 12. Limits

---

## Source extract: salesforce-source-dossier.md, lines 1252–1558

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

Source: User-supplied partner guidance in `/Users/rnuguru/.codex/attachments/23391079-6d39-4ef2-8472-680a6a56b81f/pasted-text.txt`

Audience stated in the source: Consulting Partners, ISV Partners, Cloud Resellers, and Managed Service Providers

Source caveat: This partner material contains operational notices, expiration periods, request paths, product inventories, and Trialforce template IDs that can change. The skill should use it to understand environment categories and guardrails, then retrieve the current partner catalog when recommending a specific org.

### PBO guidance

- The PBO is the partner's business and tooling hub.
- The source names Channel Order App, Checkout Management App, License Management App, Dev Hub, and Environment Hub as important PBO tools.
- This reinforces the separation between the durable partner control plane and provisioned development, test, demo, and trial environments.

### Partner demo catalog

| Environment | Intended use | Customer access | Typical lifecycle in the supplied guidance |
|---|---|---|---|
| Enterprise Demo Org (EDO) | Shared, preconfigured, zero-setup demonstration | The source identifies this as the demo type that can be shared with customers/prospects | No expiry stated |
| Simple Demo Org (SDO) | Customizable, preconfigured complex partner demo | No | 30 days unless otherwise specified |
| autoNTO | Read-only Northern Trail Outfitters demonstration | No | No expiry stated |
| Clean Demo Org (CDO) | Clean product/licensing environment for pilots or proofs of concept | May be used when customer access is required under its specific terms; it is not customer production and cannot be converted to production | 30 days |
| Developer Experience Demo Org (DXDO) | Platform and trusted-services demonstration | No | 30 days |

Operational guardrails in the source:

- Never upload customer data to an SDO or IDO.
- Do not give customers access to SDOs or IDOs.
- Do not use SDOs or IDOs to build a partner solution or package, run a customer proof of concept, or deliver a customer project.
- If a customer needs independent access, use the approved customer trial or Clean Demo path instead of handing over a partner-only org.
- Salesforce owns and controls partner demo-org lifecycle, including cloning, expiration, extensions, and changes.

### Environment Hub development and test choices

The supplied material distinguishes:

- **Partner Group, Partner Enterprise, Partner Professional, and Consulting Partner orgs:** Environment Hub-provisioned environments for edition compatibility, partner testing, or controlled demonstrations.
- **Partner Developer Edition:** a long-lived partner environment for application and Lightning Web Component development, package work, and initial testing.
- **Scratch org:** a source-driven, disposable environment created through Dev Hub, with a maximum lifetime of 30 days.

The source's duration and allocation values vary by environment. They should be checked against the current Environment Hub UI and Salesforce partner documentation before provisioning.

### Industry and specialized product environments

- **Industry Demo Orgs (IDOs):** preconfigured industry learning/demo environments for partners; not for customer access and generally short-lived.
- **Industry PDEs:** development and testing environments for industry value-added solutions. The source says they are provisioned through Environment Hub using approved Trialforce template IDs.
- These templates can supply the product technology, licenses, entitlements, permissions, configuration, and sample data needed for a specific industry shape.
- After a Salesforce release, an existing persistent org might not receive every new feature automatically. A new environment or refreshed template can be required.
- The source includes a large catalog spanning Automotive, Communications, Consumer Goods, Education, Energy, Financial Services, Health, Insurance, Life Sciences, Loyalty, Manufacturing, Media, Nonprofit, and Public Sector products.
- It also routes specialized environments for Commerce, Data Cloud, Government Cloud, Hyperforce, Marketing, Net Zero, Order Management, Quip, Revenue Cloud, Salesforce Maps, Slack, MuleSoft, Scheduler, Spiff, and other products.

Do not copy the catalog's current template IDs or request URLs into immutable core instructions. Store them in a refreshable reference or retrieve the current partner guidance when the advisor needs to recommend a specific template.

### Official corroborating source

URL: https://developer.salesforce.com/blogs/2024/07/salesforce-org-recommendations-for-isvs

Salesforce's ISV org recommendations explain that:

- Environment Hub Test/Demo orgs can use a standard edition or a Trialforce template ID containing preconfigured customizations.
- A Test/Demo org can represent the customer's environment for solution testing or a partner-controlled demonstration.
- In Environment Hub, a partner creates a TSO, creates a template from it, then uses the template ID to create new trial orgs.

### Derived skill implications

- Ask first whether the partner needs to build, automate, test edition compatibility, demonstrate under partner control, run a customer-accessible trial, or author a reusable provisioned template.
- Recommend template-backed Test/Demo or industry development environments when the required shape depends on coordinated backend provisioning that a scratch definition does not provide.
- Preserve customer-access and customer-data constraints in every recommendation.
- Add expiration, rebuild, and release-refresh plans to every provisioned environment.
- Keep current template IDs and product request routes outside the stable reasoning core of the skill.

---

## 22. Package Visualizer Practitioner Implementation
