# Source refresh guide

Use this file when a recommendation depends on current Salesforce behavior.
Salesforce Docs MCP is the first read-only source and needs no per-call
approval. If a relevant page is not machine-readable through MCP, use the
approved rendered-document fallback and record that fallback. Never claim a
source was reviewed when it was inaccessible.

Refresh before stating current limits, eligibility, packageability, CLI flags,
Security Review policy, program tier, or product enablement.

## URLs retained from the selected source extracts

- https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/dev2gp_packageable_agentforce_md.htm
- https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/dev2gp_scratch_orgs_agentforce.htm
- https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_aiauthoringbundle.htm
- https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_einsteingptsettings.htm
- https://developer.salesforce.com/docs/ai/agentforce/guide/agent-script.html

## Agent Script packaging refresh contract

Refresh these questions independently; do not collapse them into one
"Agentforce is packageable" answer:

1. Is the authored Agent Script source itself supported in the selected package
   type and API version?
2. Which exact dependencies are packageable now: prompt templates, actions,
   topics, templates, planner bundles, or other metadata?
3. Which current CLI or API operation creates or imports the customer-owned
   agent/template after installation?
4. What customer permissions, feature enablement, activation, and validation
   are required?

Documentation silence about the SME carrier-and-install pattern is not evidence
that the pattern is invalid. Record the public support boundary separately from
the practitioner recommendation and flag a genuine contradiction for review.
