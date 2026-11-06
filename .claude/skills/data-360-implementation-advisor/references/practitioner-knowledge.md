# Practitioner knowledge for data-360-implementation-advisor

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

- setup-assistant-deep-dive.md, lines 547–597
- salesforce-source-dossier.md, lines 1755–1842

## Source extract: setup-assistant-deep-dive.md, lines 547–597

### Data 360

Sources:

- [Metadata Components for Data 360 Cheat Sheet](https://developer.salesforce.com/docs/data/data-cloud-dev/guide/component-cheatsheet.html)
- [Workflow for Data 360 Second-Generation Managed Packages](https://developer.salesforce.com/docs/data/data-cloud-dev/guide/data-cloud-2gp-workflow.html)

Package Visualizer preset:

```json
{
  "edition": "Partner Developer",
  "features": [
    "CustomerDataPlatform",
    "CustomerDataPlatformLite",
    "MarketingUser"
  ],
  "settings": {
    "customerDataPlatformSettings": {
      "enableCustomerDataPlatform": true
    }
  }
}
```

Critical prerequisite: a Salesforce partner must log a Partner Support case to enable Data 360 scratch orgs, and the capability is granted only to scratch orgs created from the PBO Dev Hub.

The Data 360 workflow differs from ordinary metadata development:

1. Create Data 360 elements in the scratch org.
2. Add them to a standard data kit.
3. Download the data kit manifest.
4. Retrieve the metadata into the DX project.
5. Commit it to source control.
6. Deploy the data kit metadata to another scratch org.
7. Deploy/activate the data kit elements so they are usable.
8. Create and version the managed package.

If the app uses standard Data 360 objects, the current SSOT package can be a required `sfdx-project.json` dependency. The exact dependency ID must be retrieved from the current partner source.

The component cheat sheet shows that some Data 360 metadata supports managed 2GP while other types support only unlocked or 1GP. Check every required metadata type.

Persistent Data 360 developer/demo org provisioning is a separate Partner Support path and the app's stated partner-tier availability is time-sensitive.

The component links to a Partner Community article for the current tier rule:

- [AgentExchange Partner Program](https://partners.salesforce.com/pdx/s/learn/article/appexchange-partner-program-MC5PXFRKELXJD3HGJKJJQCKNPI5A?language=en_US)

Because that source can require Partner Community authentication, the future skill must report when it cannot verify the current tier and must not freeze the app's “Exploration and above” wording into stable instructions.

### Slack

---

## Source extract: salesforce-source-dossier.md, lines 1755–1842

## 23. Setup Assistant Linked-Source Deep Dive

Full analysis: [Package Visualizer Setup Assistant — ISV Development Environment Deep Dive](setup-assistant-deep-dive.md)

Source type: Current official Salesforce/Slack sources linked from the Package Visualizer Setup Assistant, reconciled with the app implementation and confirmed practitioner rules

Evidence caveat: Product support, CLI syntax, packageability, allocations, licenses, partner tiers, and program access change over time. The Setup Assistant is a valuable map of the workflow, but each time-sensitive claim must be refreshed from the current source or live org.

### Structural finding

The UI's visible cards encode a dependency graph rather than independent tasks:

1. PBO control-plane establishment
2. irreversible Dev Hub and managed-2GP enablement
3. irreversible namespace governance and linking
4. operation-based developer access
5. source-driven DX and scratch-shape workflow
6. gated package creation, version validation, promotion, and recommendation
7. Security Review readiness
8. conditional product-specific environment routes
9. conditional, three-phase 1GP-to-2GP migration

The preceding **Component Setup and Customization** card is Package Visualizer post-install configuration. Its durable contribution is the automation pattern—idempotent provisioning, least privilege, secret-safe manual boundaries, a read-only connectivity test, then enablement—not an ISV platform prerequisite.

### Sources that materially corrected or qualified the app

- [Enable Einstein Chatbot Features in Scratch Orgs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_setup_enable_einstein.htm) is conditional Chatbot scratch-org setup, not a universal managed-2GP prerequisite.
- [Create and Register Your Namespace for Second-Generation Managed Packages](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_dev_dev2gp_create_namespace.htm) and [Link a Namespace to a Dev Hub Org](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_reg_namespace.htm) establish the dedicated namespace-org sequence and its irreversibility.
- [Limited Access License for Package Developers](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_pkg_slalf_pkg_dev.htm) documents that Limited Access users cannot create/manage org shapes and cannot run `sf limits api display`.
- [Assign Second-Generation Managed Packaging User Permissions](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_pkg_user_permission.htm) defines the package-developer object/system permissions but does not grant the separate release-promotion permission.
- [Create Versions of a Second-Generation Managed Package](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_dev_dev2gp_create_pkg_ver.htm) distinguishes full, asynchronous, and skipped validation; skipped-validation builds cannot be promoted.
- [Release a Second-Generation Managed Package](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_dev_dev2gp_create_pkg_ver_promote.htm) establishes promotion as an irreversible release-manager action.
- [Package Agentforce Metadata Components](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/dev2gp_packageable_agentforce_md.htm) explicitly lists fewer packageable Agentforce types than the app table. Metadata API availability by itself is not proof of managed-2GP packageability.
- [Workflow for Data 360 Second-Generation Managed Packages](https://developer.salesforce.com/docs/data/data-cloud-dev/guide/data-cloud-2gp-workflow.html) requires a PBO-only Partner Support entitlement for Data 360 scratch orgs and introduces the data-kit workflow.
- [Workflow for Tableau Next Scratch Orgs](https://developer.salesforce.com/docs/analytics/tableau-next-isv-dev/guide/tn-scratch-org-workflow.html) adds the PBO entitlement prerequisite for Data 360 plus Tableau Next.
- [Use CLI to Deploy Tableau Next Assets from Sandbox to Production](https://developer.salesforce.com/docs/analytics/tableau-next-isv-dev/guide/tn-deploy-assets-using-cli.html) establishes dependency order: data kit, semantic model, workspace, visualization, dashboard.
- [Slack Partner Sandboxes](https://docs.slack.dev/tools/partner-sandboxes/) shows that Slack environments use an external partner-program path, not Environment Hub or Salesforce scratch-org provisioning.
- [Move to 2GP: Migrate Your Managed Packages with Ease](https://developer.salesforce.com/docs/atlas.en-us.pkg1_dev.meta/pkg1_dev/move_to_second_gen_pkg.htm) expands the migration card into conversion, subscriber migration, and irreversible development cutover phases.

### Namespace decision now resolved

The practitioner confirmed the Setup Assistant's recommended rule:

- register the production namespace in a separate Developer Edition org;
- link it to the PBO Dev Hub;
- connect it to Environment Hub for ongoing inventory and access;
- normally use one namespace across managed 2GP packages;
- complete the link and set `sfdx-project.json` before the first namespaced package or namespaced scratch-org workflow.

The ISV owns the namespace approval and ownership model. The advisor should
check namespace availability and ask for the ISV's decision rather than impose a
universal approval chain. Ideally, the Salesforce or IT administrator who
maintains the org inventory owns the namespace org. Retain the org ID,
namespace, linked PBO, Environment Hub connection, and owner as inventory
evidence; credential and recovery handling follows the ISV's security policy.

### Developer-capability implication

The official sources establish operation-specific capabilities:

- package developer: Limited Access plus scratch/package permissions;
- org-shape administrator: appropriately licensed user with org-shape capability;
- limits auditor/admin: user able to run the Limits API/CLI check;
- package promoter: separate promotion permission;
- Partner Community listing/case personas: distinct partner permissions.

The ISV owns its team structure and DevOps lifecycle. The advisor must not
require these labels to map to separate people. A small ISV can assign all
applicable capabilities to one administrator, while a larger ISV can separate
them. Assess the operation, identify the authorized user, and verify the
required license and permissions.

### Product-specific scratch presets

Package Visualizer's current presets are implementation evidence:

- Agentforce: Partner Developer + `Einstein1AIPlatform` + `einsteinGptSettings.enableEinsteinGptPlatform`
- Data 360: Partner Developer + `CustomerDataPlatform`, `CustomerDataPlatformLite`, `MarketingUser` + `customerDataPlatformSettings.enableCustomerDataPlatform`
- Tableau Next: the Data 360 preset plus `TableauEinstein` and `DevelopmentWave`

All presets also inherit the builder's shared `EnableSetPasswordInApi` default. The future skill must:

1. check the product entitlement or Partner Support case first;
2. verify every current feature and setting;
3. use only the capabilities required by the scenario;
4. create, deploy/install, test, delete, and recreate before treating the shape as reproducible.

### Migration findings
