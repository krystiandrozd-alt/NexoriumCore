# Evidence-first assessment

Use this reference after a partner explicitly authorizes a bounded, read-only
inspection of source, metadata, an org, scan reports, or other review evidence.
It improves the interview; it does not expand the supplied authority or create
a PEAK artifact from partner evidence.

## Establish the assessment boundary

Record the exact candidate, evidence locations or org aliases, allowed
read-only checks, data-handling constraints, and the operations that remain
out of scope. Source access alone does not authorize changes, deployments,
tests with side effects, external calls, credential use, report sharing, or a
Security Review submission.

If the partner says a working copy represents a candidate but that cannot be
independently established, record it as partner-supplied candidate alignment.
Do not treat unrelated working-tree changes as a security defect, and do not
claim they prove the candidate either.

## Inspect before asking

Use approved evidence to establish facts that it can show directly:

| Evidence | Inspectable readiness facts |
|---|---|
| SFDX project and package metadata | package identity, declared version/dependencies, package-boundary metadata, prompts, Agentforce actions, permission sets, and configuration inventory |
| Source | action entry points, callout paths, data reads/writes, authorization checks, input/output validation, prompt invocation, and configured credentials or endpoints without exposing their values |
| Approved scan report | analyzer/version, selected scope, engine completion, candidate alignment, and finding identity/classification |
| Approved read-only org evidence | installed candidate set, configuration inventory, PBO/package state, and test-environment facts available to that access. Use narrow queries for non-sensitive Organization fields and installed-package inventory; do not use a command whose normal output can expose session credentials. |

When an observation conflicts with a verbal summary, record the observation and
ask the partner to clarify the intended scope. Do not silently prefer either
source. A static observation is a finding candidate or evidence fact, not a
conclusion that the implementation is vulnerable or approved.

## Offer Assess before requesting confirmation

When a partner identifies an evidence location, report, org alias, or project
that could resolve the next decision, explain the bounded read-only assessment
that is available: exact target, proposed checks, evidence that will be
inspected, and confirmation that no changes or side-effecting tests will occur.
Do this before asking the partner to manually confirm inspectable facts.

An explicit request to “check,” “assess,” or inspect the named evidence
authorizes only the read-only checks necessary for that stated decision. Record
that scope. A bare path or alias does not authorize inspection: invite the
partner to authorize the proposed bounded pass instead. After inspection, ask
only for the owner-resolved facts that remain.

## Ask only for owner-resolved facts

After inspection, ask only questions that source or read-only metadata cannot
reliably establish:

- intended data classification, public/private action audience, and valid
  business purpose;
- external endpoint ownership, testing authority, DAST coverage, and secure
  reviewer access route;
- credential-delivery owner and approved secure location, never the secret;
- working-use-case configuration, reviewer setup instructions, and test data;
- human confirmation or runtime behavior that is not represented in the
  supplied evidence; and
- accountable business, security, release, or API owner when no named role is
  evidenced.

Do not ask whether an action, prompt, callout, permission set, or package
dependency exists when the approved evidence already answers it. Ask about its
purpose, ownership, or unverified control only when that changes a gate
decision.

## Record and stop

For every inspection, record evidence label, candidate scope, observation,
confidence, and affected gate. Classify a missing or inaccessible artifact as
`unknown`; classify a known required gap as `blocked`. Keep raw source,
credentials, report content, endpoint values, and customer data in the
partner's approved location.

Stop the Assess pass when the remaining question requires partner authority,
missing evidence, or an Act operation. Return the concise evidence-ledger
summary, findings or coverage gaps, and only the unresolved owner questions.
