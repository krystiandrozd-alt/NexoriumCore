# Submission decision

Use this reference only at Gate 6, after recording every applicable gate. It
returns PEAK's evidence-based recommendation; it does not authorize, prohibit,
or perform a Partner Console Security Review submission.

## Recommendation outcomes

| Outcome | Use when | Next action |
|---|---|---|
| `ready` | Applicable gates are `ready` or documented `not-applicable`, the exact candidate and required materials are evidenced, and no known blocker or policy/evidence unknown remains. | Recommend that the partner decide whether to approve a bounded submission action. |
| `blocked` | A known required artifact, material finding, coverage gap, candidate mismatch, or owner decision remains unresolved. | Identify the accountable owner and the specific evidence or remediation needed. The partner may still choose to submit. |
| `unknown` | Candidate alignment, scope, current policy, evidence, authority, or applicability cannot be verified. | Identify the unknown and its evidence owner. The partner may still choose to submit. |
| `not-required` | The exact managed-released candidate and unchanged solution scope have evidence of prior review (`IsSecurityReviewed = true`) and current Partner Console listing readiness as `Ready to List`; no evidence conflicts. | Recommend listing or release work instead of an additional review. The partner may still intentionally request a review. |

`not-required` is a recommendation outcome, not a gate status or a Salesforce
approval. Do not use it from an `IsSecurityReviewed` query alone, an old result,
or a changed package/API/Agentforce scope.

## Aggregation order

1. If a known applicable gate is `blocked`, return `blocked`.
2. Otherwise, if any applicable gate, candidate alignment, or current-policy
   decision is `unknown`, return `unknown`.
3. Otherwise, if the exact unchanged candidate satisfies all `not-required`
   evidence above, return `not-required`.
4. Otherwise, if every applicable gate is `ready` or documented
   `not-applicable`, return `ready`.
5. If none applies, return `unknown` and name the missing decision evidence.

State the outcome, evidence actually inspected, conflicting evidence, confidence,
and the next partner-controlled action. Do not say that PEAK, Salesforce, or
the Partner Console prevented submission. A `ready` recommendation does not
guarantee approval, and a `blocked` or `unknown` recommendation does not
remove the partner's ability to submit.
