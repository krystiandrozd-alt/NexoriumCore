# Finding ledger

Use this reference when a scan, manual test, or Security Review report produces
a finding, or when deciding Gate 5. It defines a two-layer evidence contract;
it does not create a PEAK repository artifact or authorize remediation.

## Partner-controlled detailed ledger

Keep the detailed record in the partner's approved, access-controlled location.
For each finding, record:

- finding and report/scanner identity; exact candidate; source type, version,
  scope, and capture date;
- source classification (`first-party`, `vendor/dependency`, or another
  accountable component) and affected trust boundary;
- reported severity or priority, accountable security and engineering owners,
  disposition, next required evidence, and secure record location;
- remediation change record and successor candidate when a managed-package
  change is needed; or false-positive location, technical rationale, and
  supporting evidence; and
- retest or rescan candidate, scope, result, and date.

Do not copy report excerpts, code locations, endpoints, credentials, customer
data, or exploit detail into the portable dossier. A partner may use its own
tracker and vocabulary in the detailed location, but map each active record to
the shared dispositions and coverage states below.

## Portable dossier summary

For each record, retain only the exact candidate, finding class, reported
severity, source classification, accountable owner, disposition, coverage
status, next action, and secure detailed-ledger location. This summary is
evidence of the partner's process, not an assertion that Salesforce accepts a
finding as fixed or false positive.

## Disposition and coverage

Use one finding disposition:

| Disposition | Meaning and evidence needed to leave it |
|---|---|
| `open` | A reported or observed issue awaits accountable assessment. |
| `remediating` | An approved scoped change is in progress. |
| `fixed-awaiting-retest` | The change is available but matching-candidate test and rescan evidence is absent. |
| `fixed-verified` | Matching-candidate retest/rescan evidence supports the fix. |
| `false-positive` | Location, technical security rationale, supporting evidence, and accountable owner are recorded; partner assertion remains distinct from reviewer outcome. |
| `not-applicable` | The documented scope shows the record does not apply. |

Track scanner and test coverage separately:

| Coverage | Meaning |
|---|---|
| `complete` | Applicable selected evidence completed for the documented candidate and scope. |
| `partial` | Some applicable evidence completed, but a selected engine, target, or test route is incomplete. |
| `unavailable` | Required evidence cannot currently be produced; record why and the owner. |
| `not-applicable` | Document why the scanner, engine, or test route does not apply. |

A selected scanner-engine failure is a coverage record, not a vulnerability
finding. A vendor/dependency result remains in scope: identify the component,
version, owner, and required action rather than treating it as first-party code
or silently excluding it.

## Bounded reassessment

When a partner asks to revisit a fixed finding, reuse its detailed-ledger
record rather than starting a separate interview. Ask for the prior record,
the exact successor candidate, the changed source or metadata locations, the
partner's fix rationale, and applicable retest or rescan evidence. Assess the
supplied delta read-only before requesting broader evidence.

Compare the change with the original control requirement and inspect related
in-scope instances when the finding class makes that necessary. Then establish
whether the control is now present in the supplied candidate and whether the
matching configured route has been retested. A source-only reassessment can
move a record to `fixed-awaiting-retest`; use `fixed-verified` only when the
candidate-aligned retest evidence supports the fix. Retain `false-positive`,
`blocked`, or `unknown` when their respective evidence boundaries apply.

State the reassessment boundary: changed paths and controls reviewed, evidence
sources reviewed, and controls, package areas, routes, or runtime configuration
not reassessed. It is not a new whole-solution certification. Do not rerun a
scan, modify source, configure an org, or execute a route without the
corresponding authority and approval.

## Gate 5 decision and transitions

Gate 5 is `ready` only when every applicable evidence source is `complete` or
documented `not-applicable`; no finding remains `open`, `remediating`, or
`fixed-awaiting-retest`; each `fixed-verified` finding has matching-candidate
evidence; and each false-positive record is complete. It is `blocked` for a
known unresolved material finding, failed retest, known incomplete required
coverage, or managed-package remediation without successor-candidate evidence.
It is `unknown` when candidate alignment, scope, ownership, applicability, or
evidence cannot be verified.

Normal progression is `open` → `remediating` → `fixed-awaiting-retest` →
`fixed-verified`. A finding can instead become `false-positive` or
`not-applicable` only with the stated evidence. A changed candidate or trust
boundary, failed retest, or reviewer challenge reopens the affected record.

Treat a reported vulnerability class as a cue to inspect all in-scope instances,
not just the cited location. Gate 5 readiness is never a forecast of Security
Review approval.
