# Practitioner knowledge for tableau-next-implementation-advisor

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

- setup-assistant-deep-dive.md, lines 608–649
- setup-assistant-deep-dive.md, lines 547–597

## Source extract: setup-assistant-deep-dive.md, lines 608–649

### Tableau Next

Sources:

- [Workflow for Tableau Next Scratch Orgs](https://developer.salesforce.com/docs/analytics/tableau-next-isv-dev/guide/tn-scratch-org-workflow.html)
- [Use CLI to Deploy Tableau Next Assets from Sandbox to Production](https://developer.salesforce.com/docs/analytics/tableau-next-isv-dev/guide/tn-deploy-assets-using-cli.html)

Package Visualizer preset:

```json
{
  "edition": "Partner Developer",
  "features": [
    "TableauEinstein",
    "DevelopmentWave",
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

The official workflow requires PBO Partner Support enablement for Data 360 and Tableau Next scratch orgs, then a scratch definition, Data 360 provisioning verification, and Tableau Next enablement in Setup.

Deployment ordering is material:

1. data kits and their data dependencies;
2. semantic models;
3. workspaces;
4. visualizations;
5. dashboards.

Visualizations depend on semantic models and workspaces; dashboards depend on visualizations. If the data kit publishing sequence is wrong, deployment fails.

The linked sandbox-to-production guide is a Metadata API deployment path. It is adjacent to, but not identical with, managed-2GP packaging.

## Step 9 — Migrate an Existing Managed 1GP Package to 2GP

---

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
