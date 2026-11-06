# Source refresh guide

Read this reference before stating a Salesforce feature, setting, allocation,
edition, entitlement, API-version, or CLI claim as current.

## Current-source path

1. Run the `advisor-capability-preflight` skill through the active host catalog.
2. Prefer Salesforce Docs MCP when connected; otherwise use approved official
   Salesforce documentation read-only.
3. Verify the exact value against the relevant source:
   - [Scratch Org Features catalog](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm)
   - [Metadata API Settings catalog](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_settings.htm)
   - [Supported Scratch Org Editions and Allocations](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_editions_and_allocations.htm)
   - [Project Configuration File for a Second-Generation Managed Package](https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_dev2gp_config_file.htm)
     when determining the effective package-build definition, including the
     `definitionFile` package-directory parameter.
4. For a setting, open the selected setting's specific setting reference and
   its field documentation before naming nested JSON fields or values.
5. Check the partner's selected edition, PBO/Dev Hub entitlement, and relevant
   API/release context before presenting a current recommendation.

## Approval-gated scratch-org execution

For an approved Act plan, verify the current CLI syntax only for the selected
creation strategy and cleanup scope. Use these official references as needed:

- [org create scratch](https://developer.salesforce.com/docs/platform/salesforce-cli-reference/guide/cli_reference_org_create_scratch.html)
- [org create shape](https://developer.salesforce.com/docs/platform/salesforce-cli-reference/guide/cli_reference_org_create_shape.html)
- [org create snapshot](https://developer.salesforce.com/docs/platform/salesforce-cli-reference/guide/cli_reference_org_create_snapshot.html)
- [org create user](https://developer.salesforce.com/docs/platform/salesforce-cli-reference/guide/cli_reference_org_create_user.html)
- [org delete scratch](https://developer.salesforce.com/docs/platform/salesforce-cli-reference/guide/cli_reference_org_delete_scratch.html)
- [org delete snapshot](https://developer.salesforce.com/docs/platform/salesforce-cli-reference/guide/cli_reference_org_delete_snapshot.html)

Do not load or reproduce commands before the partner selects a strategy and
approves the exact file, org, source, test, and cleanup scope.

## Evidence rule

Record the source identity and label the result as fact, practitioner
knowledge, inference, recommendation, assumption, or unknown. If the required
source is unavailable, label the exact value as **unknown** rather than
inferring it from a template or prior release.
