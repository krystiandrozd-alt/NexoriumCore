# Partner Console review wizard and outcomes

Use this reference when preparing, submitting, tracking, returning to, or
recovering an AgentExchange Security Review in the Partner Console. The wizard
is an authenticated external system. Ask may explain the workflow; Assess may
inspect partner-supplied wizard evidence read-only; Act requires an approved,
bounded plan before entering, changing, paying for, uploading, or submitting
anything in the console.

Refresh the linked official sources before a time-sensitive action. Salesforce
may change labels, fees, review times, or wizard fields.

## Draft and submission

**Fact (official documentation, 2026-09-01):** A user with `Manage Listings`
opens **Publishing | Technologies | Solutions**, selects the solution, and uses
**Start Review** to open the security review wizard. The solution or its
Salesforce org must already be connected to the Partner Console. The partner
can save a partial draft with **Save & Exit** and later use **Edit Review**.

Before an approved submission action, record the exact solution/version and
confirm the applicable prerequisites: ISV Partner Program enrollment and a
distribution agreement, a connected Dev Hub or packaging org for solutions
with a package, and a Developer Edition test environment with the solution
installed. The wizard submission includes required details and the applicable
review fee. Record the planned fee owner and payment approval; never record
payment details.

**Recommendation:** Treat an unsubmitted wizard draft as evidence collection,
not as submission readiness. Do not submit, upload, pay, or schedule an
appointment without explicit approval.

## Verification

**Fact (official documentation, 2026-09-01):** After submission, the review
team verifies the supplied material. If material needed for testing is missing
or incorrect, the status is **Returned** and feedback appears on the wizard
Overview page. Address every stated issue, then use **Review & Submit** and
**Submit**.

If the partner disagrees with verification feedback, they can use **Request a
Second Look**, explain the concern in detail, and resubmit. Current guidance
says there is no charge for this reconsideration and that most requests receive
a response within two weeks; refresh this timing before planning against it.

A Returned submission is not a failed Security Review. It is a verification
blocker: retain the feedback, accountable owner, corrective action, and
resubmission approval in the dossier.

## Queue and testing

**Fact (official documentation, 2026-09-01):** A verified submission moves
through the Product Security queue and testing stages. The Partner Console
Overview page exposes detailed status, feedback, and recommended actions. The
current submission guidance says the review process takes up to four weeks
after verification; treat this as planning information, not a commitment.

**Recommendation:** Freeze the reviewed candidate and access routes while the
review is active. Any candidate, trust-boundary, credential-validity, or test
environment change reopens the relevant readiness gates. Log every reviewer
question and response with its owner and source freshness.

## Results, reports, and false positives

**Fact (official documentation, 2026-09-01):** When a solution does not pass,
the vulnerabilities are documented in a review report. Download it from the
failed solution/version's **View Report** action in the wizard. Treat the
report as sensitive partner evidence: retain its owner, approved storage
location, candidate identity, and access restrictions; never paste it or its
secrets into the dossier. Read `failed-review-report-intake.md` before using a
partner-supplied report for analysis or remediation planning.

There are two distinct false-positive-only paths:

- **Returned during verification:** when scan results show issues without the
  required false-positive documentation, the review is paused. From the
  returned solution's Overview, use **Upload Documentation**, then **Review &
  Submit** and **Submit**. Current guidance says evaluation of that documentation
  has no fee.
- **Failed review:** only when *all vulnerabilities* in the review are false
  positives, open **View Report**, select the all-vulnerabilities-false-positives
  option, upload the document, and submit. Current guidance says that evaluation
  has no fee. If any finding is valid, this path does not apply; remediate all
  instances, retest, refresh required scan evidence, and make a new
  approval-gated resubmission decision.

Do not label a partner's false-positive assertion as an official conclusion.
Record the rationale, affected finding IDs, evidence owner, reviewer outcome,
and any required retest.

## Status and expiry

Use the security review column on **Publishing | Technologies | Solutions**
for the high-level status. Use **Check Status** and the wizard's Overview page
for detailed status, feedback, and action items.

**Fact (official documentation, 2026-09-01):** A review can become **Expired**
when the solution no longer meets AgentExchange distribution criteria. Missing
a periodic re-review can expire approval for every version; an expired public
listing can be removed. Other documented causes include overdue review fees or
unpaid revenue sharing. After a missed re-review, relisting requires a new
version and a new review. For payment-related expiry, work with the account
manager after resolving the payment issue.

**Recommendation:** Operations owns current Partner Console company contacts,
re-review notices, billing status, expiry monitoring, and escalation. Expiry is
an operational distribution state, not a vulnerability finding.

## Official source identities

- `security-review-start.md`
- `security-review-edit.md`
- `security-review-submit-solution.md`
- `security-review-update-returned.md`
- `security-review-check-status.md`
- `security-review-request-second-look.md`
- `security-review-download-report.md`
- `security-review-resubmit-returned-false-positives.md`
- `security-review-resubmit-failed-false-positives.md`
- `security-review-expired.md`
- `security-review-troubleshoot-expired.md`
