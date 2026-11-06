# Source refresh guide

Use this guide before stating a current Salesforce Security Review policy,
submission requirement, partner eligibility, analyzer behavior, or product
support claim.

1. Run `advisor-capability-preflight` and record its capability receipt.
2. Prefer an exposed Salesforce Docs MCP tool for read-only documentation.
3. If the relevant material is unavailable through MCP, use only the approved
   read-only official domains returned by the `advisor-capability-preflight`
   skill after the project's documented consent path is satisfied. Invoke that
   skill through the host catalog; do not construct paths into its installation.
4. Treat Partner Community, partner portals, org endpoints, and unapproved
   domains as unavailable unless the partner supplies approved evidence. Record
   the result as `unknown`; do not claim the source was reviewed.
5. Record source identity, access date, scope, and whether it corroborates,
   qualifies, or conflicts with practitioner knowledge or partner evidence.

Packaged practitioner knowledge may lead an operating recommendation only when
it carries the provenance required by the product-wide practitioner-knowledge
policy. Documentation silence does not erase that guidance, but it does not
turn it into a current Salesforce guarantee.

## Reviewed canonical sources

The following official sources were first reviewed on 2026-09-01. Retain these
exact identities in the evidence ledger and fetch their current content before
a time-sensitive decision. The Markdown form is preferred for machine reading;
use the corresponding HTML page only when Markdown is unavailable.

- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-how-it-works.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-required-materials.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-listing-readiness.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-check-listing-readiness.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-test-all.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-code-analyzer-scan.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-partner-security-portal-set-up-login.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-partner-security-portal-scanners.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-partner-security-portal-office-hours.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-schedule-office-hours.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-start.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-edit.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-submit-solution.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-update-returned.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-check-status.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-request-second-look.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-download-report.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-resubmit-returned-false-positives.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-resubmit-failed-false-positives.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-expired.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-troubleshoot-expired.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-document-responses.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-example-checkmarx-scan.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/security-review-example-failure-report.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/secure-agentforce-actions.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/secure-agentforce-prompts.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/secure-agentforce-prompt-injection-harden.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/secure-agentforce-prompt-injection-data.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/secure-agentforce-prompt-injection-enclosure.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/secure-agentforce-prompt-injection-resources.md
- https://developer.salesforce.com/docs/platform/isvforce/guide/secure-code-ac-eca.md

The official sf-skills repository is an optional execution source, not policy
authority for submission requirements:

- https://github.com/forcedotcom/sf-skills/tree/main/skills/dx-code-analyzer-run
- https://github.com/forcedotcom/sf-skills/tree/main/skills/dx-code-analyzer-configure
- https://github.com/forcedotcom/sf-skills/tree/main/skills/dx-code-analyzer-custom-rule-create

This supporting public source corroborates the PBO Trial-to-Active lifecycle;
it does not by itself establish the reviewed practitioner rule that Active PBO
status is a Security Review submission gate:

- https://developer.salesforce.com/blogs/2024/11/get-started-with-modern-appexchange-development

Current Salesforce documentation uses the AgentExchange name while the Code
Analyzer submission selector remains named `AppExchange`. Preserve both terms
where they identify different interfaces; do not rename a CLI selector.

## Refresh receipt: 2026-09-03

**Fact:** The `codex` harness had no exposed Salesforce Docs MCP tools. The
project's approved documentation-domain preference permitted the official-web
fallback. The following public HTML sources were refreshed on 2026-09-03:

- security-review-how-it-works
- security-review-required-materials
- security-review-check-listing-readiness
- security-review-test-all
- security-review-code-analyzer-scan
- security-review-document-responses
- secure-agentforce-actions
- secure-agentforce-prompts
- secure-agentforce-prompt-injection-harden
- secure-agentforce-prompt-injection-data
- secure-agentforce-prompt-injection-enclosure
- secure-code-ac-eca

The refresh corroborated the skill's five review stages, managed-released and
complete-extension-solution evidence, whole-solution and external-endpoint
testing boundary, Code Analyzer and Checkmarx requirements for managed
packages, false-positive response fields, and Agentforce action/prompt
controls. Recheck these sources before a partner-specific decision; this
receipt does not make inaccessible Partner Community or portal content current.
