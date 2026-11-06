# Practitioner knowledge for pbo-dev-hub-foundation

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

- development-environment-interview.md, lines 23–248
- setup-assistant-deep-dive.md, lines 95–178
- salesforce-source-dossier.md, lines 95–250
- salesforce-source-dossier.md, lines 920–1002

## Source extract: development-environment-interview.md, lines 23–248

## Knowledge packet 1: PBO-centered org strategy

### Confirmed principles

1. An ISV begins with its Partner Business Org (PBO).
2. The PBO is the central operational hub for partner development and business functions, including org provisioning, packaging, customer and license management, sales, orders, and support.
3. The PBO should be enabled and used as the ISV's Dev Hub.
4. Dev Hub and 2GP enablement are irreversible settings, and the Dev Hub becomes the owner/control point for the managed 2GP packages created through it.
5. This matters because partner Dev Hub entitlements provide higher capacity for scratch-org and second-generation packaging operations than a generic Developer Edition Dev Hub.
6. A disposable or inactive Dev Hub can jeopardize access to package versions, future upgrades, and new installations.
7. The PBO's instance/cloud placement also influences where scratch orgs are created.
8. Scratch-org capacity and 2GP package-version creation capacity directly affect the speed and reliability of development, automated testing, and CI/CD.
9. A generic Developer Edition org is a poor default Dev Hub for an ISV because its lower limits are easily exhausted and the org can expire through inactivity.
10. When a persistent Developer Edition-style environment is needed, prefer a Partner Developer Edition (PDE) org provisioned through Environment Hub over a generic Developer Edition org because the PDE has partner-oriented licenses, storage, API capacity, and support paths. Persistent means it has no short fixed lifetime like a scratch org; it can still be subject to inactivity-expiration policy.
11. For an ISV, the PBO must always be the Dev Hub. There are no exceptions within this skill's ISV scope.
12. The PBO is the only org a new ISV must establish immediately. Other development, test, demo, namespace, and Trialforce orgs are introduced when their specific lifecycle job arises.
13. In the new-partner path described during the interview, the PBO initially has `Trial` status and an expiration date. It is not yet the durable Active production PBO.
14. Treat PBO activation as a lifecycle milestone, not an administrative afterthought. After the partner meets the program prerequisites, including signing the Partner Application Distribution Agreement (PADA), the partner opens a Salesforce case to convert the Trial PBO to an Active, permanent PBO.
15. The initial Trial PBO term is one year. The assessment must read the org's actual status and expiration date instead of calculating from an assumed signup date.
16. A managed 2GP package submitted for Security Review is associated with its owning PBO Dev Hub. Practitioner guidance requires that PBO to have Active status and permits submission only of a promoted package version.
17. If permanent activation is not complete before expiration, request a Trial PBO extension of up to 12 months.
18. Extension preserves time to complete activation but is not a substitute for converting the qualified PBO to Active status.

### PBO capabilities named in the interview

- Higher active scratch-org allocation
- Higher daily scratch-org creation allocation
- Higher 2GP package-version creation allocation
- Environment Hub
- SignupRequest API
- License Management App (LMA)
- Feature Management App (FMA)

Detailed LMA, FMA, and SignupRequest workflows may ultimately belong to Packaging & Distribution or Operations skills. The Development Environment skill still needs enough awareness to identify the PBO and route work correctly.

### Candidate diagnostic checks

- Determine which org is the partner's PBO.
- Verify PBO access by opening Environment Hub from the App Launcher; Salesforce documents successful Environment Hub access as the PBO verification procedure.
- Run an API describe check against the candidate PBO to determine whether the `EnvironmentHubMember` standard object is available.
- Determine which org currently has Dev Hub enabled.
- Confirm that the PBO—not a generic DE org—is the Dev Hub used for scratch orgs and 2GP operations.
- Confirm that both Dev Hub and second-generation packaging are enabled before diagnosing package operations.
- Inspect the PBO's actual `Status` in Setup → Company Information or from
  partner-supplied Partner Console evidence. The standard `Organization` query
  can corroborate `OrganizationType`, `TrialExpirationDate`, and `IsSandbox`,
  but does not expose an Active/Trial status field and cannot prove `Active`.
- For a Security Review gate, pair the query result with the partner's explicit
  confirmation of the Company Information or Partner Console status. Label that
  confirmation as partner-provided evidence, not as an API-derived fact.
- Distinguish `Trial`, `Active`, and `Hold` states; do not infer permanence merely because the org is currently accessible.
- Before Security Review submission, confirm that the PBO Dev Hub that owns the managed 2GP package has Active status and that the exact package version selected for submission is promoted.
- Determine whether the PADA and other current Active-PBO eligibility requirements are complete and whether the activation case has been opened.
- If activation will not complete before the actual expiration date, confirm that an extension request is open and record the resulting expiration date.
- Inspect live `ActiveScratchOrgs`, `DailyScratchOrgs`, `Package2VersionCreates`, and `Package2VersionCreatesWithoutValidation` values rather than relying on permanently hard-coded numbers.
- Retrieve the limits through `sf limits api display --target-org <PBO>` or `GET /services/data/vXX.X/limits/`.
- Record the target org, API version, retrieval time, maximum, and remaining allocation; note the API's documented five-minute accuracy window.
- Verify that the API user has View Setup and Configuration and distinguish unavailable fields from zero remaining capacity.
- Distinguish active scratch-org exhaustion from rolling 24-hour creation exhaustion.
- Inventory org edition, purpose, instance/region, source-tracking strategy, expiration, and customer-sharing rules.
- Determine whether persistent development or test orgs were provisioned as PDEs through Environment Hub.

### Practitioner diagnostic: PBO development entitlement fingerprint

For PBO-specific development, inspect these four Limits API entries together:

- `ActiveScratchOrgs`
- `DailyScratchOrgs`
- `Package2VersionCreates`
- `Package2VersionCreatesWithoutValidation`

Compare both the maximum and remaining allocation for every entry. Presence of the four limits and their allocation profile provides a secondary PBO/Dev Hub correctness check.

Use the group as a high-signal check that:

1. The authenticated target is the intended PBO Dev Hub.
2. The org has the scratch-org capacity expected for partner development.
3. The org has the package-version capacity expected for managed 2GP development and CI.
4. Validated and skip-validation package build capacity are both available and distinguishable.

Environment Hub access remains the documented PBO identity check. The four limits provide corroborating development-entitlement evidence. If the org is believed to be the PBO but the values resemble a generic DE or are unexpectedly low, report a possible wrong-target-org or missing-entitlement condition instead of silently continuing.

### Practitioner diagnostic: verify the PBO through `EnvironmentHubMember`

Check whether the org believed to be the PBO exposes the `EnvironmentHubMember` standard object. This is a machine-verifiable PBO check because Environment Hub is expected to be available in the PBO.

Recommended read-only probe:

```text
sf sobject describe --sobject EnvironmentHubMember --target-org <candidate org> --json
```

REST equivalent:

```text
GET /services/data/vXX.X/sobjects/EnvironmentHubMember/describe
```

Interpretation:

- Successful describe: sufficient as the API-level PBO check. Querying `EnvironmentHubMember` records is not required.
- Object unavailable: the candidate might not be the PBO, or the expected partner tooling might not be available.
- Permission/access error: inconclusive; verify with a sufficiently privileged user or the documented App Launcher procedure.

Do not require member records because a valid, newly configured PBO can have no Environment Hub members yet.

### Candidate decision rules

- If an ISV is establishing a new development landscape, start with the PBO and enable its Dev Hub capabilities.
- Do not require the ISV to create every possible environment on day one. Establish the PBO first, then add purpose-specific orgs when their use cases arise.
- If the current Dev Hub is any org other than the PBO, flag the topology as
  incorrect and apply the wrong-Dev-Hub recovery decision below.
- Treat a Trial PBO as usable for early development but not ready for Security Review submission.
- Convert the PBO to Active status as soon as the partner satisfies the current benefit and agreement requirements; do not wait for the final days of the trial.
- If conversion is not ready, request an extension before the PBO expires. Verify the resulting date in the org rather than assuming the maximum was granted.
- Use scratch orgs for source-driven, disposable development and automated testing.
- Use partner-edition scratch orgs only through a PBO Dev Hub.
- Prefer PDE over generic DE when the use case requires a persistent partner development org.
- Choose the Environment Hub purpose deliberately: Development, Test/Demo, or Trialforce Source Organization.
- Do not share PDE development orgs with customers or prospects.
- Track expiration and renewal/rebuild plans for every non-permanent org.
- Select an org by lifecycle job; do not treat PBO, PDE, scratch org, sandbox, test, demo, and trial orgs as interchangeable.

### Wrong-Dev-Hub recovery decision

Use AppExchange Security Review status as the primary branch:

- **Managed 2GP has not passed Security Review:** create a new managed 2GP
  package in the correct PBO Dev Hub and redo the packaging setup there. For an
  early-stage ISV, correcting the package foundation is preferable to preserving
  an incorrectly owned development artifact.
- **Managed 2GP has passed Security Review:** use Salesforce's formal
  Support-assisted package-transfer process. This path is especially important
  when customers already use the package because it preserves the subscriber
  package identity, existing versions, ancestry, and customer upgrade paths.
- **Managed 2GP was converted from 1GP:** it cannot be transferred to another
  Dev Hub. The conversion permanently binds the package to its Dev Hub, so the
  advisor must escalate rather than promise a supported transfer.

For an ISV correcting its own topology, the destination must be the intended
PBO Dev Hub. The documented transfer contract also prohibits a Developer
Edition or trial destination and prohibits transfers across the Government
Cloud boundary.

Before requesting a transfer:

1. Verify the `033` subscriber package ID, source and destination Dev Hub org
   IDs, namespace, and whether the transfer is internal or external.
2. Keep the namespace linked to the source Dev Hub and also link it to the
   destination Dev Hub.
3. Finish all package-version creation and push-upgrade operations.
4. Delete package versions that are no longer needed.
5. Clear the Apex error-notification user.
6. File one Salesforce Customer Support case per package and wait for Support
   to schedule the transfer.

After transfer, preserve these identity and history semantics:

- the `033` subscriber package ID and all `04t` subscriber package-version IDs
  remain unchanged;
- the destination receives a new `0Ho` package ID;
- package versions, ancestry, and customer upgrade paths transfer;
- push-upgrade history, package-version create requests, the error-notification
  username, and deleted package versions do not transfer.

The source team must verify that the package is no longer associated with its
Dev Hub, request Support cleanup if the association remains, unpublish its
AppExchange listing, and remove the transferred package from its
`sfdx-project.json`. Any remaining packages that depend on it must reference a
specific `04t` or an alias that resolves to that `04t`.

For an external transfer, securely hand off the source, relevant
`sfdx-project.json` configuration, required scratch-org features and settings,
and namespace-org access. Never expose namespace credentials in advisor output
or ordinary project files.

### Failure mode captured

**Symptom:** Packaging work began in a non-PBO Dev Hub.

**Likely cause:** The team enabled Dev Hub and created the package before
validating the ISV's PBO-centered topology.

**Impact:** Package ownership is rooted in the wrong control plane. Recovery
differs sharply depending on Security Review and 1GP-conversion history.

**Preventive guidance:** Verify the PBO before package creation. Before Security
Review, rebuild the package in the correct PBO Dev Hub. After Security Review,
use the formal transfer process; never propose transfer for a package converted
from 1GP.

**Symptom:** The team quickly exhausts daily scratch-org creation or 2GP package-version creation capacity.

**Likely cause:** The team enabled Dev Hub in a generic Developer Edition org instead of using its PBO as the Dev Hub.

**Impact:** Development, test automation, CI/CD, and package build throughput are blocked or throttled.

**Preventive guidance:** Verify the PBO and Dev Hub topology before prescribing scratch-org or 2GP workflows.

**Symptom:** A managed 2GP Security Review submission is blocked because the owning Dev Hub is still a Trial PBO or the selected package version is not promoted.

**Likely cause:** The partner did not complete the Trial-to-Active PBO conversion, or selected a Beta/unpromoted package version for submission.

**Impact:** Security Review and downstream listing/release milestones are delayed even though package development is otherwise complete.

**Preventive guidance:** Add two explicit submission gates: verify that the owning PBO is Active and verify that the exact submitted package version is promoted.

**Symptom:** The PBO becomes inaccessible or is at risk of purge.

**Likely cause:** The Trial PBO expired before activation or extension completed.

**Impact:** The partner can lose access to its command center, Dev Hub, package ownership/control plane, and partner operations. Current Salesforce Help says an expired Trial org enters `Hold` and can be purged if an extension is not received within 30 days.

**Preventive guidance:** Monitor the actual expiration date, request conversion or extension early, and escalate immediately if the org reaches `Hold`.

### Terminology clarification

The interview statement "if they choose another org as their PBO (for example, a Developer Edition org)" is interpreted as "if they choose another org as their Dev Hub." A PBO is the partner business org Salesforce provisions or enables; a generic DE org can be a Dev Hub but does not become the PBO merely because Dev Hub is enabled.

### Additional current documentation observations

- Salesforce's current partner-development guidance says the PBO provides partner tooling, 2GP-oriented user licenses, and higher limits for scratch-org and 2GP operations.
- Current guidance describes a one-time setup in which the PBO is the Dev Hub, a Developer Edition org is created through Environment Hub for namespace creation, and that namespace is linked to the PBO.
- Partner-prefixed scratch-org editions are available only when the target Dev Hub is a PBO.
- A standard DE or trial Dev Hub is documented at three active scratch orgs, up to six scratch-org creations per day, and up to six package-version creations per day. Exact partner entitlements are time-sensitive and should be inspected in the target org.
- Daily scratch-org allocation is a rolling 24-hour window, while active allocation is simultaneous capacity.
- The REST Limits resource is the authoritative live source for maximum and remaining org allocations. It is available from REST API version 29.0 and requires View Setup and Configuration.
- Limits API values can lag consumption by up to approximately five minutes, so assessment logic should avoid rapid or concurrent polling.
- Current guidance notes that a PBO can initially be a trial org and may require conversion to a permanent org after the relevant partner agreement is signed. This should be evaluated for inclusion in the skill.
- Current Help documentation differentiates Environment Hub purposes and explicitly prohibits sharing PDE development orgs with customers or prospects.

## Knowledge packet 2: Scratch-org shape as code

---

## Source extract: setup-assistant-deep-dive.md, lines 95–178

### PBO heuristic correction

Package Visualizer's `isPboOrg()` requires both LMA availability and `EnvironmentHubMember` availability. The confirmed practitioner rule for this skill is narrower:

- A successful describe of `EnvironmentHubMember` is sufficient as the API-level PBO check.
- Do not require LMA to be installed for that check.
- Do not require any `EnvironmentHubMember` records; a valid PBO can have an empty Environment Hub.
- Treat a permission error as inconclusive rather than as proof that the org is not a PBO.
- Supplement the capability probe with live `Max` and `Remaining` values for `ActiveScratchOrgs`, `DailyScratchOrgs`, `Package2VersionCreates`, and `Package2VersionCreatesWithoutValidation`.

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

Do not infer that the org is Active merely because `TrialExpirationDate` is null. Package Visualizer makes that inference in its display; the advisor must inspect the actual status from Company Information or partner-supplied Partner Console evidence.

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

---

## Source extract: salesforce-source-dossier.md, lines 95–250

## 2. Verify Access to Your Salesforce Partner Business Org

URL: https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/appexchange_partner_access_pbo.htm

Source type: Atlas developer documentation page

Retrieved title: **Verify Access to Your Salesforce Partner Business Org**

### Documented procedure

1. Log in to Salesforce with the credentials used to join the Partner Community.
2. Open the App Launcher.
3. Search for **Environment Hub**.
4. Open the Environment Hub app.
5. Successful redirection to Environment Hub verifies PBO access.
6. If Environment Hub is not present, log a Salesforce Help case to request a PBO.

The page also directs partners to Partner Learning Camp training for PBO tools.

### Derived skill implications

- Environment Hub presence is a documented PBO verification procedure, not merely an informal heuristic.
- The skill should distinguish:
  - "I cannot find my PBO."
  - "I can access the PBO but Dev Hub is not enabled."
  - "Dev Hub is enabled in the wrong org."
- A missing Environment Hub should produce a case-escalation recommendation rather than instructions to treat a generic DE org as the PBO.

### Trial-to-Active PBO lifecycle

Official developer guidance:

URL: https://developer.salesforce.com/blogs/2024/11/get-started-with-modern-appexchange-development

- A new partner's PBO starts as a trial org and expires in one year.
- After the company signs the Partner Application Distribution Agreement (PADA), the partner opens a case to convert the PBO to an Active, permanent org.
- The PBO is the Dev Hub used to create and manage scratch orgs, managed 2GP packages, package versions, and namespaces.

Current Salesforce Help:

URL: https://help.salesforce.com/s/articleView?id=000380510&type=1

Retrieved title: **Requesting a Partner Business Organization (PBO) vs. Trial PBO**

- The Trial PBO's status and expiration date are visible under Setup → Company Information.
- An eligible Active PBO is a production environment for the partner's critical apps, data, and partner tooling.
- Active-PBO eligibility is tied to the applicable partner-program requirements.
- If a Trial PBO approaches expiration, the partner must request an extension to avoid `Hold` and eventual purge.

URL: https://help.salesforce.com/s/articleView?id=005132368&type=1

Retrieved title: **Trial Org Extension FAQ**

- Trial orgs with `Trial` status and an expiration date are eligible for extension.
- Active production orgs, Developer Edition orgs, and sandboxes are not eligible through this Trial-org extension process.
- When a Trial org expires, its status changes to `Hold` and users lose access.
- If Salesforce does not receive an extension request within 30 days, the org is automatically purged and cannot be recovered.
- A completed extension uses the date requested in the case or a maximum of 12 months when no other date is specified.

URL: https://help.salesforce.com/s/articleView?id=000387818&type=1

Retrieved title: **Trial Org Extension Request for Salesforce Partners**

- Salesforce instructs partners to request an extension before expiration.
- The current article describes an additional extension of up to 12 months and an automated Partner Community/Agentforce request path.

Practitioner rules supplied during the interview:

- The PBO is the only org that must be established immediately for a new ISV.
- The initial Trial PBO term is one year.
- The owning PBO Dev Hub must have Active status before submitting its managed 2GP package for Security Review.
- Only a promoted package version can be selected for Security Review submission.
- When activation is not complete, extend the Trial PBO for up to 12 additional months.

Query the actual `TrialExpirationDate` and treat the current org value as authoritative rather than calculating the date from an assumed signup date.

The reviewed official public pages confirm the Trial-to-Active lifecycle but do not state the Security Review active-status gate as explicitly as the practitioner guidance. The future advisor should enforce it as a high-confidence operational rule while checking current Partner Console or Security Review requirements when the workflow is invoked.

### Derived skill implications

- Model the PBO lifecycle explicitly: `Trial → Active` is the successful path; `Trial → Hold → Purged` is the unmanaged-expiration path.
- Add two pre-Security-Review submission gates: Active status for the owning PBO
  and promoted status for the exact package version being submitted.
- Keep the checks distinct. Active status qualifies the PBO; promotion qualifies
  the package-version artifact.
- Record PADA completion, activation-case status, actual expiration date, and any extension result.
- Do not treat an extension as permanent activation or assume that requesting the maximum guarantees the maximum date.
- Escalate immediately when a PBO is in `Hold`; the current recovery window is time-sensitive and destructive loss can follow.

---

## 3. Select and Enable a Dev Hub Org

URL: https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_setup_enable_devhub.htm

Source type: Atlas Salesforce DX Developer Guide page

Retrieved title: **Select and Enable a Dev Hub Org**

### Documented responsibilities and availability

- Dev Hub creates and manages:
  - Scratch orgs
  - Unlocked packages
  - Second-generation managed packages
  - Namespaces
- Dev Hub is available in Developer, Enterprise, Performance, and Unlimited editions.
- Scratch orgs can be created in Developer, Enterprise, Group, and Professional editions.
- Salesforce explicitly directs all ISV and OEM partners to use their PBO as Dev Hub.

### Documented enablement procedure and constraints

1. Log in as a system administrator.
2. In Setup, find **Dev Hub**.
3. Select **Enable**.

Important constraints:

- Dev Hub cannot be disabled after enablement.
- Dev Hub cannot be enabled in a sandbox.
- The Dev Hub's instance and cloud determine where scratch orgs are created. Government Cloud and Hyperforce scratch orgs follow the location of their Dev Hub.

### Documented risks of trial or generic DE Dev Hubs

- A trial or generic DE Dev Hub is documented as allowing up to six scratch-org creations and up to six package-version creations per day, with three active scratch orgs.
- Trial orgs expire on their expiration date.
- DE orgs can expire because of inactivity.
- Package versions are associated with and owned through the Dev Hub.
- If the Dev Hub expires, access to associated package versions can be lost.

### Directly relevant child page: Enable Dev Hub and Second-Generation Managed Packaging

URL: https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_pkg_enable_devhub.htm

Additional documented details:

- Enabling Dev Hub makes that org the owner of every managed 2GP package subsequently created through it.
- The PBO setup requires enabling both:
  - Dev Hub
  - Unlocked Packages and Second-Generation Managed Packages
- Neither setting can be disabled afterward.
- If a non-production Dev Hub expires or becomes inactive:
  - Installed packages can become impossible to update.
  - New installations can fail.
- Salesforce specifically recommends the PBO for package-version creation and CI because of its higher scratch-org and package-version limits.

### Derived skill implications

- Enabling Dev Hub or 2GP is an **important, irreversible action**. The future Act mode must require explicit approval and show ownership consequences first.
- Before any package creation, assess the target Dev Hub's durability, PBO status, cloud/region, and current limits.
- Treat "wrong Dev Hub" as a package-ownership and upgradeability risk, not merely a productivity inconvenience.
- Do not provide sandbox-based Dev Hub instructions.

---

## 4. Scratch Orgs

---

## Source extract: salesforce-source-dossier.md, lines 920–1002

## 12. Limits

URL: https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_limits.htm

Source type: Atlas REST API Developer Guide page

Retrieved title: **Limits**

### Documented API contract

- The resource lists limits for the authenticated target org.
- Each returned limit contains:
  - Maximum allocation
  - Remaining allocation based on current usage
- Endpoint:

```text
GET /services/data/vXX.X/limits/
```

- Supported response formats: JSON and XML.
- Authentication: OAuth bearer token.
- Available from REST API version 29.0.
- The API user requires **View Setup and Configuration**.
- Some fields have additional permission requirements. For example, data and file storage entries require **Manage Users**.

### Accuracy and request behavior

- Tabulated values are documented as accurate within five minutes of resource consumption.
- Avoid concurrent or rapid repeated requests when consistent readings are important.
- A returned remaining value can be negative for certain usage-based entitlements that permit grace overages; consumers must not assume `Remaining` is always zero or positive.

### Development-environment limits

The Salesforce Developer Experience category includes:

- `ActiveScratchOrgs`
  - Maximum simultaneously active scratch orgs.
  - Capacity returns when an org is deleted or expires.
- `DailyScratchOrgs`
  - Maximum successful scratch-org creations in the preceding rolling 24-hour window.
- `Package2VersionCreates`
  - Daily package-version creations for unlocked and managed 2GP packages.
- `Package2VersionCreatesWithoutValidation`
  - Daily package-version creations that skip validation for unlocked and managed 2GP packages.

The resource can also provide other environment-relevant data, subject to availability and permissions, such as API usage, asynchronous Apex/test execution, metadata retrieves, data storage, and file storage.

### Derived skill implications

- Query the PBO directly before advising on capacity or launching scratch-org/package-version automation.
- Support two equivalent diagnostic paths:
  - Salesforce CLI: `sf limits api display --target-org <PBO alias or username>`
  - REST: `GET /services/data/vXX.X/limits/`
- Record the target org identity, API version, retrieval time, `Max`, and `Remaining` values in assessment evidence.
- Preflight the API user's permissions and report unavailable entries instead of interpreting missing data as zero capacity.
- Treat values as near-real-time with a documented five-minute accuracy window.
- Avoid aggressive polling.
- Keep validated and skip-validation package-version capacity separate.
- This is a read-only assessment operation and is appropriate for the advisor's Assess mode.

### Practitioner interpretation: PBO development entitlement fingerprint

For ISV development assessments, treat these four values as a single evidence bundle:

- `ActiveScratchOrgs`
- `DailyScratchOrgs`
- `Package2VersionCreates`
- `Package2VersionCreatesWithoutValidation`

Compare both `Max` and `Remaining` for each entry. The bundle helps detect whether the assessment is running against the intended PBO Dev Hub, whether partner-oriented development capacity appears to be present, and how much capacity is currently available. It is an additional PBO correctness check alongside `EnvironmentHubMember` availability and the documented Environment Hub UI procedure.

If the bundle is inconsistent with the expected PBO configuration:

1. Confirm the authenticated org ID and alias.
2. Confirm Environment Hub access.
3. Confirm Dev Hub and 2GP enablement.
4. Re-query after the documented accuracy window.
5. Report a possible entitlement or target-org mismatch and recommend partner support when the mismatch persists.

---

## 13. Build Your Own Scratch Org Definition File
