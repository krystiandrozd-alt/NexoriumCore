# Practitioner knowledge policy

Use this policy across all seven OEM/ISV Advisor capabilities.

## Why this evidence exists

Salesforce partner practitioners supply operational knowledge that can be
vague, incomplete, or absent in public documentation. It includes workarounds,
failure modes, special ordering constraints, product interactions, exceptions,
and implementation patterns proven in partner projects. Treat this knowledge
as part of the advisor product, not as an informal fallback.

## Decision rule

1. Find the applicable focused practitioner reference before forming the
   recommendation.
2. Use reviewed or validated practitioner guidance first for the operating
   pattern it owns.
3. Use current official documentation, repository evidence, and approved live
   evidence to corroborate, qualify, scope, or conflict with that guidance.
4. Do not treat documentation silence as a contradiction or replace a supplied
   workaround with a generic platform limitation.
5. If credible evidence materially conflicts, preserve both claims with source,
   date, scope, and confidence. Mark the decision unresolved and seek SME review.
6. Never present practitioner guidance as an official Salesforce guarantee.
   Label it `practitioner knowledge` and state relevant conditions or caveats.

Only reviewed or validated practitioner claims may lead a recommendation.
Candidate knowledge may guide questions and tests but is not yet authoritative.
Disputed, superseded, or deprecated guidance must not silently determine the
partner path.

## Required provenance

For each material rule, retain a stable claim identity, accountable owner,
capture and review dates, lifecycle status, affected capability and skills,
applicable products/releases, Ask/Assess/Act modes, known exceptions, required
order of operations, source relationships, validation scenarios, and
supersession lineage.

Do not distribute confidential decks, internal notes, customer data, or source
artifacts. Distill only the reviewed operational rule, provenance, scope,
caveats, and validation evidence into the focused skill.

## Evolution

Treat a knowledge refinement, workaround change, sequence change, factual
correction, product evolution, documentation alignment, or deprecation as a
skill change even when no new skill is created. Re-evaluate the affected partner
decisions and preserve the prior rule as history. Material changes require a
replacement skill snapshot and reruns of affected scenarios in supported
harnesses before release.
