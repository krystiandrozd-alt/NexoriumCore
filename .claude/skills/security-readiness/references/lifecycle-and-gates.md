# Security Review lifecycle and gates

Use these seven readiness gates for a partner engineering lead preparing an
AgentExchange Security Review. They cover a managed package, Salesforce API
solution, and connected APIs or integrations. Ask for evidence from its owner;
do not require the engineering lead to attest to business, security, or release
decisions they do not own.

The seven readiness gates are PEAK's preparation and follow-through workflow.
Do not confuse them with the five Salesforce review stages: submission,
verification, placement in the Product Security queue, testing, and results.
Read `review-wizard-and-outcomes.md` for the AgentExchange Partner Console
wizard path and the state-specific recovery actions.

| Gate | Interview decision | Required evidence | Exit |
|---|---|---|---|
| 1. Documentation preflight | Can current requirements be verified? | Preflight receipt and source access state | Record the source path or `unknown`. |
| 2. Scope and eligibility | What solution and distribution path are under review, and is a new review required? | Exact candidate, solution type, owning PBO Dev Hub and its verified `Active` status, package owner, managed-released/promoted state, Partner Console listing readiness (`Ready to List` or `Security Review Required`), ancestry and dependency evidence, and current prerequisites | Scope and review need are identified; inherited listing readiness is not mislabeled as a new approval. |
| 3. Trust boundaries | Where do the customer and their data go? | Data classes and flows, identity model, permissions, secrets, tenancy, external services, connected APIs/integrations, required and optional clients, and third-party testing authority | Every in-scope boundary has an accountable owner, test route, and unresolved risk. |
| 4. Evidence and analysis | Can Product Security test the entire solution? | Architecture-dependent materials, complete non-expiring Developer Edition test environment when required, managed package and base/dependent packages installed, working-use-case configuration, reviewer-ready asset bundle, external access route, tests, and scan artifacts | Every required component is testable for the review period or recorded as a blocker. |
| 5. Remediation and retest | Which findings and coverage gaps remain after manual and automated testing? | Applicable Code Analyzer, Checkmarx, DAST, and manual-test coverage; detailed finding ledger; safe dossier summary; disposition, remediation, false-positive rationale, successor-candidate evidence, and retest evidence | Each material finding is fixed, explained with accountable ownership, or blocks progress; a coverage gap is not mislabeled as a clean scan. |
| 6. Submission readiness | Is the dossier sufficient to recommend the next submission action? | Completed applicable gates, current-policy evidence, exact solution candidate, required materials, open-risk decision, and partner submission decision | Return the separate submission recommendation in `submission-decision.md`; never promise approval. |
| 7. Reviewer response and release | How will Salesforce verification, testing, and results be handled? | Submission receipt and verification state, reviewer question log, returned-submission feedback, report, approved change plan, rerun scan evidence, state-specific resubmission decision, expiry monitoring, and release/operations handoff | Track the official review stages and responses until the owner records the outcome and next action. |

## Gate status

- `ready`: required evidence is present and the accountable owner has no
  unresolved blocker for that gate.
- `blocked`: a known missing artifact, unresolved finding, or required decision
  prevents advancement.
- `not-applicable`: the gate does not apply to the documented scope; record why.
- `unknown`: current policy, evidence, or authority cannot be verified. Do not
  convert it to a pass based on memory or an unavailable source.

The lifecycle is iterative. A changed integration, package candidate, or
reviewer finding reopens the affected trust-boundary, evidence, and remediation
gates.

Gate statuses describe evidence quality. They are not a direction to submit or
not submit. Read `submission-decision.md` to aggregate them into Gate 6's
partner-facing recommendation.

**Practitioner rule (reviewed PBO foundation knowledge):** Before submitting a
managed 2GP package, verify that the PBO Dev Hub which owns the package is in
actual `Active` status and that the exact selected version is promoted or
managed-released. A `Trial` PBO, an activation case, or a trial extension is
not evidence of Active status. PBO Dev Hub Foundation owns the read-only status
evidence; Security & Readiness records a missing or non-Active status as a
submission blocker. Refresh current Partner Console requirements when they are
accessible; public development guidance corroborates the Trial-to-Active PBO
lifecycle but does not itself state this review-submission gate.

**Practitioner query pattern (user supplied, 2026-09-01):** To inspect an
exact package version's `IsSecurityReviewed` value, run the read-only Tooling
API query against the package-owning PBO Dev Hub—not the submitted Developer
Edition test org—and filter `SubscriberPackageVersion` by its exact Id. Record
the result as candidate evidence. It does not replace the partner's Partner
Console check of the package version's listing-readiness value. **Fact
(official documentation, refreshed 2026-09-03):** the Partner Console
Solutions page reports `Ready to List` or `Security Review Required` for a
managed-released version.

**Inference for Gate 2:** When the exact managed-released candidate has
`IsSecurityReviewed = true` and the partner records current Partner Console
listing readiness as `Ready to List`, treat the prior review outcome as
evidence that a new Security Review submission is not needed for that same
candidate. Route the partner to listing or release work, while preserving the
review evidence in the dossier. When the values conflict, listing readiness is
missing, or the candidate or solution scope has changed, return `unknown` or
reopen the review decision; do not infer a new approval from a prior result.

If a review is not approved, treat reported findings as representative issue
types rather than an exhaustive defect list. Find and fix all instances across
the entire solution, rerun the required scans, and resubmit the revised solution
and reports only after the new dossier passes the applicable gates.
