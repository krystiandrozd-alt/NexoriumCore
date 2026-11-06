# Practitioner knowledge for slack-implementation-advisor

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

- setup-assistant-deep-dive.md, lines 597–608
- setup-assistant-deep-dive.md, lines 507–649

## Source extract: setup-assistant-deep-dive.md, lines 597–608

### Slack

Sources:

- [Slack Developer Program](https://api.slack.com/developer-program)
- [Slack Partner Sandboxes](https://docs.slack.dev/tools/partner-sandboxes/)

Slack partner sandboxes are external, fully featured Enterprise Grid non-production environments for proof of concept, app development/testing, and demos. Current documented limits include 45 users, 10 workspaces, and up to 8 active sandboxes per partner developer; these values are time-sensitive.

Eligibility requires Salesforce Partner Program membership and Slack Developer Program enrollment, followed by Slack partner-program approval. This is not a Salesforce scratch-org or Environment Hub path.

### Tableau Next

---

## Source extract: setup-assistant-deep-dive.md, lines 507–649

## Step 8 — Develop and Extend Salesforce Products

This is a conditional router. It should run only after the core PBO/Dev Hub/namespace/DX baseline is ready and the solution actually requires one of these products.

### Agentforce

Sources:

- [Package Agentforce Metadata Components](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/dev2gp_packageable_agentforce_md.htm)
- [Get Access to Scratch Orgs That Have Agentforce](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/dev2gp_scratch_orgs_agentforce.htm)
- [AiAuthoringBundle](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_aiauthoringbundle.htm)
- [EinsteinGptSettings](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_einsteingptsettings.htm)

Current documented scratch preset:

```json
{
  "edition": "Partner Developer",
  "features": ["Einstein1AIPlatform"],
  "settings": {
    "einsteinGptSettings": {
      "enableEinsteinGptPlatform": true
    }
  }
}
```

Partner Developer, Partner Enterprise, Developer, and Enterprise scratch editions can use `Einstein1AIPlatform`. Agentforce plus Data 360 should be requested only when required because Data 360 increases provisioning time and requires a PBO-only Partner Support entitlement.

The current packageable Agentforce topic explicitly lists:

- Agent Actions — `GenAiFunction`
- Agent Topics — `GenAiPlugin`
- Prompt Templates — `GenAiPromptTemplate`
- Agent Templates — `BotTemplate`, `GenAiPlannerBundle`

Packaged actions and topics must be in the Agentforce Asset Library.

Package Visualizer's table also includes `AiAuthoringBundle` and `LightningTypeBundle`, labels `GenAiPlugin` as Subagents, and records Next Gen/Legacy Builder support. Those additional support claims are not established by the linked packageable-Agentforce topic. `AiAuthoringBundle` is documented as metadata available in API 65.0+, but metadata availability alone is not proof of managed-2GP packageability. The skill must check the current packageability source for each exact type.

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

Sources:

- [Slack Developer Program](https://api.slack.com/developer-program)
- [Slack Partner Sandboxes](https://docs.slack.dev/tools/partner-sandboxes/)

Slack partner sandboxes are external, fully featured Enterprise Grid non-production environments for proof of concept, app development/testing, and demos. Current documented limits include 45 users, 10 workspaces, and up to 8 active sandboxes per partner developer; these values are time-sensitive.

Eligibility requires Salesforce Partner Program membership and Slack Developer Program enrollment, followed by Slack partner-program approval. This is not a Salesforce scratch-org or Environment Hub path.

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
