# Readiness dossier

Maintain this structure in the partner-facing assessment or a supplied report.
It is a portable evidence ledger, not an upload template or proof of approval.

| Section | Record |
|---|---|
| Scope | Partner goal, mode, exact package candidate, distribution path, products, and in-scope APIs/integrations. |
| Gate ledger | Status, rationale, accountable owner, and next action for each lifecycle gate. |
| Evidence ledger | Artifact or source identity, evidence label, freshness or capture date, scope, and what was actually inspected. |
| Trust boundaries | Data classes and flows, identities, permissions, secrets, tenancy, external services, API/integration boundary, and unresolved risk. |
| Agentforce controls | For each in-scope action or prompt: control category, factual source observation, affected gate, status, confidence, owner, next action, and secure evidence location. Do not include prompt text, source excerpts, configuration values, or customer data. |
| Findings | Safe finding-ledger summary: candidate, finding class, reported severity, source classification, affected boundary, disposition, coverage, owner, next action, and secure detailed-ledger location. |
| Submission decision | Gate 6 recommendation (`ready`, `blocked`, `unknown`, or `not-required`), rationale, blockers, assumptions, policy unknowns, confidence, and partner-controlled next action. |
| Follow-through | Reviewer questions, approved remediation, retest evidence, release/operations handoff, and outcome. |

## Architecture-dependent materials

Confirm the current official requirements before deciding readiness. Build the
material inventory from the whole solution rather than from the package alone.

| Solution scope | Evidence to account for |
|---|---|
| Salesforce-native managed package | Developer Edition test org when required; Managed package in managed-released state and installed; source provenance sufficient to establish the scanned source matches that version; Code Analyzer and Source Code Scanner (Checkmarx) reports; false-positive explanations; solution documentation. A version-control tag or commit is useful optional provenance, not a submission-readiness requirement. |
| Managed package with external app, service, API, or mobile client | All managed-package evidence plus external component credentials in an approved secure location, complete test paths, DAST reports for external endpoints, and client installation access when applicable. |
| API-only solution | Developer Edition test org when required, external access route and credentials, DAST report, false-positive explanations, and solution documentation; do not invent a package-scan requirement when no package or component is submitted. |
| Extension package | Determine whether each base solution has passed review. Submit only the extension when all base solutions have passed; otherwise submit the extension plus the unreviewed base solutions. In every case, install the complete solution—the extension and all base and dependent packages—in the submitted Developer Edition org, and include architecture-appropriate scans for any external boundary. |

Marketing Cloud and mobile-client paths have additional or different materials;
refresh the official matrix instead of extrapolating from the rows above.

## Reviewer-ready asset bundle

**Practitioner workflow (user supplied, 2026-09-01):** For the submitted
solution, the partner supplies the assets that let Security Review understand
and exercise its working use cases. Record the secure location, owner,
candidate scope, and freshness for each provided asset. The bundle normally
includes an architecture or data-flow diagram, associated solution
documentation, and setup and test instructions for the reviewer. Add
integration, credential-access, or client-installation instructions when the
architecture requires them.

Do not require a universal diagram or setup template. Assess whether the
partner's assets make every in-scope trust boundary and working use case
understandable and testable; compare them to current architecture-dependent
official materials before a submission decision.

## Optional checklist aid

**User-provided tool, accessed 2026-09-01:** [Security Review Submission
Requirements Checklist Builder](https://checklistbuilder.herokuapp.com/) lets a
partner describe a managed package, base/extension package, and external
website, API, mobile, browser-extension, or desktop/client components, then
compile a printable checklist.

Use it in Ask to identify material questions the interview might otherwise
miss. Treat its output as a partner-provided working artifact, not current
Salesforce policy, proof of complete scope, or submission readiness. Reconcile
every checklist item with the exact candidate, trust-boundary inventory, and
current official requirements before marking a dossier gate `ready`.

## Test-org access and execution

**Practitioner workflow (user supplied, 2026-09-01):** The partner provisions
the Developer Edition test environment through Environment Hub, opens the
required support cases for solution-specific licenses, and installs the exact
released or promoted package set planned for submission. Product Security uses
that environment to test the solution. Before submission, the partner also
configures the org into the working state for the in-scope use cases: required
licenses, users and permissions, package and Agentforce configuration, test
data where needed, external access routes, and reviewer instructions. A
package installed in an otherwise unconfigured org is not evidence that the
complete solution is testable.

**Practitioner rule (user supplied, 2026-09-01):** The submitted Developer
Edition test environment must not have a scheduled expiration date. An expiring
Enterprise or trial test org is not submission-ready and can be blocked during
Security Review Operations verification. Record the environment's purpose,
edition evidence, and expiration state; do not infer a suitable Developer
Edition environment from an org alias or `OrganizationType` alone.

CLI access supplied by the partner permits read-only assessment of the org's
installed packages, configuration, and approved evidence. It does not authorize
package installation, configuration changes, external calls, or test execution
by itself. Before any test or analyzer could create runtime side effects, show
the target org, exact candidate, intended tests, data/credential exposure,
expected effects, cleanup, and validation; obtain explicit approval.

## Evidence rules

- Identify the analyzer and version, rule set, scan scope, report date, and
  source/package candidate that the report represents.
- Retain a false-positive explanation with the report and accountable owner;
  do not silently suppress a finding.
- Keep detailed finding records in partner-controlled, access-restricted
  storage. Use `finding-ledger.md` for the dispositions, coverage states,
  successor-candidate rule, and safe portable-summary boundary.
- Record partner-provided artifacts as evidence, not as independently verified
  Salesforce requirements.
- For a failed-review report, record a secure artifact location and the exact
  reviewed candidate, but keep report excerpts, live endpoints, code samples,
  screenshots, and credentials out of this portable ledger. Read
  `failed-review-report-intake.md` before using the report for remediation.
- Keep secrets, credentials, customer data, and security-sensitive exploit
  detail out of the dossier. For external component credentials, record only
  the accountable owner, approved secure location, validity, and testability.
- For an Agentforce assessment, use
  `agentforce-and-client-security.md` to distinguish a directly observed
  control from a partner-confirmed runtime fact. A missing required control is
  `blocked`; an unprovable runtime control is `unknown`.
- A clean scan, a complete dossier, or a prior approval is evidence only. None
  is a guarantee of current or future Security Review approval.
