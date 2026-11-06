# Practitioner knowledge for scratch-org-shape

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

- development-environment-interview.md, lines 248–366
- development-environment-interview.md, lines 1150–1179
- salesforce-source-dossier.md, lines 1002–1252
- setup-assistant-deep-dive.md, lines 359–410

## Source extract: development-environment-interview.md, lines 248–366

## Knowledge packet 2: Scratch-org shape as code

### Confirmed principles

1. Store the primary scratch-org definition in the Salesforce DX project under `config/project-scratch-def.json`.
2. Treat the file as the reproducible blueprint for the scratch org's edition, features, settings, and related shape configuration.
3. Add required Scratch Org Feature values explicitly.
4. Add required Scratch Org Settings explicitly.
5. Use the current Scratch Org Features catalog and Metadata API Settings catalog as the source of truth because supported values evolve by Salesforce release.
6. Some Salesforce capabilities require both a feature entitlement and a companion setting.
7. Commit the shared, non-personal definition to version control.
8. Use a scratch definition when creating a developer scratch org so Salesforce
   provisions the required edition, features, settings, and object settings.
9. Use the appropriate definition during package-version creation as well.
   Salesforce creates an internal build org to validate the package-directory
   metadata, so every feature and setting required by that metadata must be
   available in the build shape.
10. Limit the canonical `project-scratch-def.json` to daily development and
    package-version creation. Installation testing and customer-edition
    compatibility are separate environment and test-design concerns.
11. Treat the build definition as a package dependency contract. If packaged
    metadata depends on Agentforce, Data 360, or another gated capability, add
    the current required features and companion settings before creating the
    package version.

### Features versus settings

- `features` provisions add-on functionality, licenses, permissions, or incremental capacity that is not part of the base edition.
- `settings` configures fine-grained org and product preferences exposed through Metadata API.
- Feature names are case-insensitive.
- Features shown as `FeatureName:<value>` require an allocation value.
- Metadata API setting types use UpperCamelCase, while scratch definition keys use lower camel case:
  - `SecuritySettings` → `securitySettings`
  - `CommunitiesSettings` → `communitiesSettings`
- A feature can be valid but unavailable if the PBO Dev Hub lacks the required license or permission.

### Candidate assessment checks

- Confirm that the expected scratch definition exists under `config/`.
- Confirm that `edition` is specified.
- Review the `features` array against the current official feature catalog.
- Review the `settings` object against the current Metadata API Settings catalog.
- Check companion feature/setting dependencies.
- Check whether each capability is supported by the selected edition and PBO entitlement.
- Check whether settings require a particular API version.
- Review `objectSettings` for package-required sharing models or default record types.
- Identify personal values that should be moved from the shared file into a local, uncommitted variant.
- Create a clean daily-development scratch org from the file and validate the
  package source and dependencies without manual Setup steps.
- Inspect each package directory's effective `definitionFile` and any
  `--definition-file` override before package-version creation.
- Compare package metadata dependencies with the build definition's edition,
  features, settings, object settings, and PBO entitlements.

### Candidate decision rules

- Prefer `config/project-scratch-def.json` as the team default.
- Use that canonical file for daily development and package-version creation.
- Do not expand it to model installation testing, customer-edition
  compatibility, or every downstream test environment.
- Create another definition only when the ISV explicitly needs a different
  scratch-org development shape; do not make scenario-specific definitions a
  default requirement.
- Add only capabilities required by the solution or scenario.
- Avoid adding paid or uncommon features merely to make a deployment pass; doing so can hide accidental customer dependencies.
- Prefer declarative settings in the definition file over undocumented post-creation Setup steps.
- Consult the current official catalogs instead of relying on remembered feature or setting names.
- Do not assume that successful deployment to an already configured developer
  org proves package-version readiness; the internal build org must be able to
  provision the required shape from the selected definition.

### Failure modes to capture

- **Missing feature:** package metadata cannot deploy or install because the org lacks a required entitlement or capability.
- **Missing setting:** the capability exists, but the required behavior remains disabled.
- **Feature without Dev Hub entitlement:** scratch creation fails even though the feature name is valid.
- **Wrong setting casing or nesting:** scratch creation fails or the intended preference is not applied.
- **Over-provisioned shape:** development succeeds in an unrealistically capable org, hiding compatibility problems for customer editions.
- **Canonical definition expanded for every downstream scenario:** installation
  and customer-compatibility concerns over-provision the daily development and
  package-build shape.
- **Manual post-creation setup:** environments drift and cannot be reproduced reliably in CI.
- **Developer org works but package-version creation fails:** the developer org
  was manually enabled or used a richer shape than the definition supplied to
  the internal package build.
- **Product metadata without its build capability:** Agentforce, Data 360, or
  other product metadata is evaluated in a build org that lacks its required
  features or settings.

### Environment selection: PDE versus partner-edition scratch org

Use a PDE when the ISV needs a persistent partner development environment that must last beyond the maximum scratch-org lifetime. PDEs have higher partner-oriented limits than generic DE orgs and do not have a predetermined 1–30 day duration.

Do not describe a PDE as unconditionally non-expiring. Developer Edition inactivity policies can apply, and official Salesforce sources currently contain different timelines by DE type and publication date:

- The supplied 2022 release note says DE orgs with no login for 180 days are marked inactive and queued for deletion.
- Current Salesforce Help distinguishes newer DE orgs at 45 days of no login from DE (Legacy) orgs at 180 days.
- Current Help also lists exemptions, including certain packaging/Dev Hub, namespace, Environment Hub, Partner Community, TSO, and connected-app scenarios.
- The previously reviewed 2025 PDE comparison article lists PDE expiration after one year of inactivity.

Therefore, the advisor must describe PDEs as long-lived rather than immortal, check current policy, inspect org-specific expiration information and warnings, and recommend an activity/monitoring practice.

Use a partner-edition scratch org for rapid, disposable development or testing when:

- The environment can be recreated from source and configuration.
- The required lifetime is 30 days or less.
- The ISV wants to define edition, features, settings, and shape in code.
- The team wants to create fresh environments without waiting for manual feature provisioning in a persistent trial or development org.

For features supported by scratch-org configuration and available through the PBO Dev Hub, the team can add the values to `features` and create the org without opening a Partner Support case. Some features still require a supporting Dev Hub license or permission, so the advisor must distinguish self-service scratch configuration from missing backend entitlements.

### Additional failure modes

- **PDE treated as immortal:** inactivity deletion or policy changes surprise the team.
- **Scratch org used for persistent work:** the org reaches its maximum 30-day lifetime and unretrieved work is lost.
- **Persistent org used for rapid feature-shape testing:** the team waits on Partner Support for feature enablement that a scratch definition could provision.
- **Scratch feature assumed to bypass all licensing:** creation fails because the PBO Dev Hub lacks a required entitlement or permission.

## Knowledge packet 3: Trialforce-backed Test/Demo environments

---

## Source extract: development-environment-interview.md, lines 1150–1179

### Which features and settings belong in the managed-2GP baseline scratch definition?

There is no universal product-feature baseline. The file must include the
edition, features, settings, and object settings required to:

1. create the intended developer scratch org; and
2. provision the internal build org used during package-version creation.

The second purpose is critical. Salesforce validates the package-directory
metadata in a theoretical build scratch org. If the package contains Agentforce,
Data 360, or other product-dependent metadata, the selected definition must
enable the corresponding current features and companion settings so that
technology exists in the build org. Keep unrelated capabilities out of the
baseline because an over-provisioned build can conceal accidental subscriber
dependencies.

### How should `project-scratch-def.json` be divided from other environment definitions?

Use `config/project-scratch-def.json` for two purposes:

1. daily development scratch-org creation; and
2. the internal package-version build shape.

It isn't normally used for installation testing or customer-edition
compatibility. Handle those through the ISV's separate environment-selection
and testing strategy. Do not require a collection of scenario-specific scratch
definitions by default. Add another definition only when the team deliberately
needs a different scratch-org development shape.

## Sources supplied during the interview

---

## Source extract: salesforce-source-dossier.md, lines 1002–1252

## 13. Build Your Own Scratch Org Definition File

URL: https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file.htm

Source type: Atlas Salesforce DX Developer Guide page

Retrieved title: **Build Your Own Scratch Org Definition File**

### Documented model

- The definition file is a blueprint that mimics an org shape used in the development lifecycle, such as a sandbox, packaging environment, or production org.
- Shape includes:
  - Salesforce edition
  - Add-on features
  - Org and product settings
- Multiple definition files can represent different development and test shapes.
- `hasSampleData` can request standard sample data and metadata.
- Salesforce recommends storing the shared definition file in the project and committing it to version control.
- A team definition can be shared while developers keep local variants for personal values such as administrator email or last name.

### File location and naming

- The CLI accepts any accessible path and filename supplied to `sf org create scratch`.
- Salesforce Extensions for VS Code require the file to:
  - Be under the project's `config` directory.
  - End in `scratch-def.json`.
- The standard Salesforce DX project convention is:

```text
config/project-scratch-def.json
```

- Descriptive alternatives can model scenarios, such as:
  - `config/dev-edition-scratch-def.json`
  - `config/packaging-scratch-def.json`

### Definition options

| Option | Purpose |
|---|---|
| `orgName` | Display name; defaults to Company |
| `country` | Two-character ISO country; affects locale |
| `username` | Optional globally unique administrator username |
| `adminEmail` | Administrator email; defaults from the Dev Hub user |
| `edition` | Required org edition, including partner editions when available |
| `description` | Documents the scratch org's purpose in Dev Hub |
| `hasSampleData` | Requests standard sample data; defaults to false |
| `language` | Overrides the locale-derived language |
| `features` | Add-on feature and allocation configuration |
| `release` | `preview` or `previous` during release transitions |
| `settings` | Fine-grained Metadata API-supported org settings |
| `objectSettings` | Object sharing models and default record types |
| Custom fields | Values for custom `ScratchOrgInfo` fields in Dev Hub |
| `snapshot` | Creates the org from a named scratch-org snapshot |
| `sourceOrg` | Creates the org from a captured Org Shape |

### `objectSettings`

- Keys are lowercase object API names such as `account` or `opportunity`.
- Supported configuration includes:
  - `sharingModel`
  - `defaultRecordType`
- Available sharing values vary by object and can include private, read, read/write, full access, or controlled-by relationships.
- Some package installations require object sharing or a default record type to exist before installation.

### DevOps metadata on `ScratchOrgInfo`

- Teams can add custom fields to the `ScratchOrgInfo` object in Dev Hub and pass their values in the definition file.
- Examples include work-item or release identifiers.
- `ScratchOrgInfo` is not available in sandboxes or scratch orgs.
- Changing this object in the PBO/production Dev Hub requires production-level caution.

### Practitioner rule: one shape contract, two provisioning contexts

The definition file serves two related purposes:

1. `sf org create scratch` uses it to provision a developer or test scratch org.
2. Package-version creation uses the effective definition to provision an
   internal build org in which Salesforce evaluates the package-directory
   metadata.

The build purpose means the definition is part of the package contract. If
package metadata depends on Agentforce, Data 360, or another product
capability, the internal build org needs the current corresponding feature and
setting configuration. A manually enabled or over-provisioned developer org can
otherwise hide a missing build dependency.

Practitioner guidance limits `config/project-scratch-def.json` to those two
contexts: daily development and package-version creation. It isn't normally an
installation-testing or customer-edition compatibility definition. Those
concerns belong to the ISV's separate environment-selection and testing
strategy.

### Derived skill implications

- Treat `config/project-scratch-def.json` as the default convention, not an absolute CLI requirement.
- Keep durable, non-personal shape configuration in version control.
- Keep personal administrator identity values in an uncommitted local override when needed.
- Use the `description` or approved `ScratchOrgInfo` fields for lifecycle traceability.
- Add another descriptive definition only when the ISV deliberately needs a
  different scratch-org development shape; do not require a definition-file
  matrix for installation and customer-compatibility testing.
- Do not mix snapshot-, source-org-, and definition-driven assumptions without explicitly selecting the intended creation strategy.
- Inspect `packageDirectories[].definitionFile` and CLI overrides to identify the
  effective package-version build shape.
- Compare packaged metadata to the selected definition's features, settings,
  object settings, edition, and PBO entitlements before version creation.
- Do not infer package-version readiness solely from successful work in an
  existing developer org.

---

## 14. Scratch Org Features

URL: https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm

Source type: Atlas Salesforce DX Developer Guide catalog

Retrieved title: **Scratch Org Features**

### Documented syntax and behavior

- `features` contains the supported add-on features that determine scratch-org shape.
- Feature names are case-insensitive.
- Multiple values are supplied as a JSON array:

```json
"features": ["ServiceCloud", "API", "AuthorApex"]
```

- A catalog entry shown as `FeatureName:<value>` requires an incremental allocation or limit, for example:

```json
"features": ["AddCustomObjects:10"]
```

- Some features require a corresponding license or permission in the Dev Hub. A valid feature name alone does not guarantee that the PBO can provision it.
- Some capabilities require both a feature and a setting. Documented examples include:
  - `Communities` plus `communitiesSettings.enableNetworksEnabled`
  - `CoreCpq` plus `revenueManagementSettings.enableCoreCPQ`
  - Certain Data Cloud configurations requiring both feature and setting enablement
- A feature can provision licenses, permissions, capacity, metadata support, or access to a product capability. It does not necessarily install a related managed package.

### Catalog strategy

The catalog is large and evolves by Salesforce release. It includes:

- Product and cloud licenses
- Developer capabilities such as Apex, APIs, and change data capture
- Experience Cloud, service, commerce, Data Cloud, Agentforce, industry, and analytics capabilities
- Incremental capacity features with explicit numeric ranges
- Preview or limited-availability capabilities

### Derived skill implications

- Do not embed the full feature catalog permanently in the skill. Consult the current official page for exact names, dependencies, availability, and value ranges.
- Validate requested features against:
  - Target scratch edition
  - PBO/Dev Hub entitlements
  - Salesforce release/API version
  - Required companion settings
- Add only features required for development, package installation, or an explicit test scenario. Extra features can hide compatibility problems and create accidental dependencies on paid or uncommon capabilities.
- Report whether a creation failure is caused by invalid syntax, unsupported edition, missing Dev Hub entitlement, or a missing companion setting.
- For supported features already available through the PBO Dev Hub, scratch-org provisioning is self-service and does not require a Partner Support case. If the Dev Hub lacks a prerequisite license or permission, scratch configuration alone cannot bypass that entitlement.

---

## 15. Scratch Org Settings

URL: https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_settings.htm

Source type: Atlas Salesforce DX Developer Guide page

Retrieved title: **Scratch Org Settings**

### Documented model

- `settings` defines fine-grained org preferences in the scratch-org definition.
- Every setting supported by Metadata API is supported for scratch-org configuration.
- Settings can configure individual fields rather than merely switching an entire feature on or off.
- Metadata API setting types are documented in UpperCamelCase, but the JSON definition must use lower camel case.

Examples:

| Metadata API type | Scratch definition key |
|---|---|
| `CommunitiesSettings` | `communitiesSettings` |
| `LightningExperienceSettings` | `lightningExperienceSettings` |
| `SecuritySettings` | `securitySettings` |
| `NameSettings` | `nameSettings` |

- Nested values retain their documented structure. For example, session timeout is nested under `securitySettings.sessionSettings`.
- `NameSettings` can enable middle names and suffixes for Contact, Lead, Person Account, and User.

### Derived skill implications

- Validate both the setting type's lower-camel key and its nested field names.
- Do not assume enabling a feature automatically enables all required org preferences.
- Use settings to make scratch creation deterministic instead of relying on post-creation Setup clicks.
- Treat security, identity, sharing, email, and customer-data settings as review-sensitive configuration.

---

## 16. Settings (Metadata API)

URL: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_settings.htm

Source type: Atlas Metadata API Developer Guide catalog

Retrieved title: **Settings**

### Documented model

- The Metadata API `Settings` type represents org preferences for product capabilities, security, sessions, network access, and other features.
- `Settings` is available from API version 27.0.
- Individual setting components were introduced in different API versions; consult each component's version information.
- Not every Salesforce feature preference is exposed through Metadata API.
- Settings metadata is stored under a package directory's `settings` folder.
- A component filename removes the `Settings` suffix:
  - `SecuritySettings` → `Security.settings`
- A package manifest likewise uses the member without the suffix:

```xml
<types>
    <members>Security</members>
    <name>Settings</name>
</types>
```

- `*` retrieves or deploys all available Settings components.
- The catalog contains individual component types such as account, activities, Agentforce, Apex, communities, Dev Hub, email, Field Service, Flow, Lightning Experience, mobile, name, Omni-Channel, platform events, privacy, security, sharing, sites, surveys, and user management settings.

### Relationship to scratch definitions

| Metadata representation | Scratch definition representation |
|---|---|
| `SecuritySettings` | `securitySettings` |
| `Security.settings` | Nested JSON under `settings.securitySettings` |
| UpperCamelCase component name | Lower camel case JSON key |
| Metadata API version-dependent fields | Scratch creation is subject to the selected/current API release |

### Derived skill implications

- Use the current Metadata API catalog as the source of truth for supported setting types and fields.
- Check the component's minimum API version before adding a setting.
- Do not assume a Setup preference is scratch-configurable unless Metadata API exposes it.
- Keep release-specific setting names and availability in reference material, not immutable core instructions.

---

## 17. Trialforce Lifecycle and Delivery

---

## Source extract: setup-assistant-deep-dive.md, lines 359–410

### Scratch definition integration

**Practitioner rule (this interview):** treat `EnableSetPasswordInApi` as part
of this skill's canonical default baseline. Approved capability templates are
additive guidance; they are not UI implementation dependencies.

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
