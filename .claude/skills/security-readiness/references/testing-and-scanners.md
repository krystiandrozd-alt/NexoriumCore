# Testing and scanner evidence

Read this reference when defining test scope, selecting scanners, delegating a
Code Analyzer action, or evaluating scan evidence. These rules were distilled
from the official sources listed in `source-refresh.md`; refresh current tool
requirements and CLI behavior before execution.

## Test the whole solution

Use a follow-the-data boundary: wherever the customer authenticates or
Salesforce credentials or data travel is in scope. Test required and optional
packages, clients, services, and external endpoints end to end. Combine manual
testing with automated scans because scanners provide only first-pass evidence.

Before active testing of a third-party endpoint, record the endpoint owner's
permission and applicable allowlist constraints. Missing authority blocks that
test; it does not make the endpoint out of scope.

## Scanner matrix

| Evidence | When it applies | Non-substitution rule |
|---|---|---|
| Salesforce Code Analyzer | Required for a managed-package submission; scan local source that matches the exact submitted version. Verify the current required selectors, including `AppExchange` and `Recommended:Security`, and the accepted report format before execution. | A generic security-only scan does not automatically satisfy the current submission contract. |
| Source Code Scanner (Checkmarx) | Required for a submission containing a Salesforce package or component; run near submission and retain the report. | Code Analyzer does not replace Checkmarx. |
| DAST, such as ZAP or Burp Suite | Required for in-scope external endpoints; exercise the complete authenticated and data-transfer surface and retain target, date, and findings. | Static package scans do not cover external endpoints. |
| Manual testing | Required across the complete architecture and authorization model. | A clean automated report does not prove the solution is secure. |

Reports need not show zero findings. Fix every violation that can be fixed,
rerun the same required scan against the revised candidate, and document each
remaining false positive with finding identity, rationale, and owner. If Code
Analyzer cannot be run, record the current Salesforce-required justification;
do not silently omit the report.

## Code Analyzer execution evidence

Before execution, record the installed Salesforce CLI and Code Analyzer plugin
versions and verify the command is available. Use only flags accepted by that
installed version; do not make auto-fix support or a particular auto-fix flag a
precondition for Security Review evidence. A scan for evidence must not apply
fixes without a separate, explicit remediation approval.

Record the selected rule selector, target scope, vendor or auxiliary content
separated from first-party triage, report paths, and each engine's completion
state. An engine error,
including a data-flow-engine error, means the run is not a clean all-engine
result. Preserve the error and either resolve it or record the affected analysis
as unavailable; do not let results from completed engines imply that the failed
engine passed. Use `finding-ledger.md` to record that error as `partial` or
`unavailable` coverage, and to retain vendor/dependency ownership and required
action without silently removing it from the review scope.

## sf-skills delegation

Use these only when they are already installed or after the repository's
separate discovery, trust, and installation approval flow succeeds:

- `dx-code-analyzer-run`: execute and interpret Code Analyzer scans. Pass the
  current Security Review selectors, exact candidate scope, and required output
  format from this skill; do not accept its generic security preset without
  checking it against the current official submission page.
- `dx-code-analyzer-configure`: install or troubleshoot prerequisites, manage
  configuration, or integrate scans into CI. Configuration and installation are
  Act operations and require their own approval.
- `dx-code-analyzer-custom-rule-create`: create an approved project-specific
  rule only after existing rules cannot express the need. Custom rules supplement
  rather than replace the current required selectors.

Security & Readiness retains dossier ownership. An execution skill returns the
tool version, rule selectors, targets, candidate identity, timestamps, report
paths, findings, and errors; it does not decide submission readiness.
