# Practitioner knowledge for package-release-promotion

This reference preserves selected material from the user-supplied
`peak-skill-development` knowledge handoff.

## Evidence handling

- Treat statements already labeled **Practitioner rule** as internal operating
  knowledge that can lead the recommendation even when public documentation is
  incomplete.
- Treat **Documented** statements as requiring current-source verification when
  they describe limits, eligibility, CLI syntax, metadata support, or policy.
- Treat **Implementation evidence** and **Live-org evidence** as examples, not
  universal platform contracts.
- Treat **Derived skill implication** as a candidate rule that must remain
  visible in testing until human review confirms it.
- Never imply that an inaccessible or restricted source was reviewed.

## Contents

- packaging-lifecycle-deep-dive.md, lines 398–465
- packaging-lifecycle-deep-dive.md, lines 679–731
- development-environment-interview.md, lines 1116–1150

## Source extract: packaging-lifecycle-deep-dive.md, lines 398–465

## Step 6: Promote the approved version to Released

The documented command is `sf package version promote`.

Example shape:

```bash
sf package version promote \
  --package "Package Version Alias" \
  --target-dev-hub "PBOAlias"
```

Documented behavior:

- Newly created versions are Beta.
- Promotion changes the selected version to Released.
- Released versions can be installed in customer production orgs and used for
  AppExchange distribution.
- Promotion requires a separate Dev Hub permission.
- Promotion can occur only once for that version-number line and cannot be
  undone.
- Verify the result with a version report rather than relying only on command
  exit.

Promotion decision model for the future skill:

- **Salesforce promotability checks:** identify the exact candidate `04t`;
  confirm that its version-create request reached terminal `Success`, that it
  wasn't created with skipped validation, and that applicable platform
  requirements such as packaged-Apex code coverage are satisfied.
- **Partner-owned release acceptance:** the ISV's DevOps and development
  lifecycle determines the exact tests, evidence, approvers, and sign-off
  needed before promotion. The advisor must discover and apply that policy
  rather than impose a universal test matrix.
- **General best practice:** install the exact candidate in a scratch org or
  sandbox and execute the partner's testing process. When the partner is
  satisfied with the results, it can promote that version so it can be
  installed in production-type orgs.
- **Recommended traceability, not a universal gate:** keep the tested `04t`
  connected to its source commit, create request, test results, and approval
  record in whatever system the partner uses.

Package Visualizer exposes a Promote button and asks for confirmation, then
patches `Package2Version.IsReleased` through Tooling API. That proves promotion
can be represented in a UI, but the future skill should use current supported
CLI/API guidance, show the Salesforce technical state and the partner-defined
release evidence, and require explicit approval before any write.

## Optional post-promotion step: recommended version

Package Visualizer's Setup Assistant includes:

```bash
sf package update \
  --package "0Ho..." \
  --target-dev-hub "PBOAlias" \
  --recommended-version-id "04t..."
```

Recommended version is a package-level distribution signal, not part of
promotion itself. It should be changed only after the team defines:

- which subscriber audience follows the recommendation;
- how recommendation relates to listing, rollout, push upgrade, and support;
- who approves the change; and
- how the prior recommendation is recorded.

## Recovery when the package was created under the wrong Dev Hub

---

## Source extract: packaging-lifecycle-deep-dive.md, lines 679–731

## Failure modes the skill must catch

- Package created under the wrong Dev Hub without branching on Security Review
  status, 1GP-conversion history, and customer-upgrade impact
- Namespace or package type chosen without approval
- “Package ID” used without distinguishing `0Ho`, `033`, `05i`, and `04t`
- CLI-only version override drift from `sfdx-project.json`
- Reused manual build number instead of `NEXT`
- Version-create request submission reported as a completed build
- Package-version build org missing features or settings required by the
  package metadata
- Async artifact mistaken for a fully validated artifact
- Skip-validation build proposed for promotion
- Installation-key bypass applied without a distribution decision
- Code coverage inferred from a stale or aggregate flag
- Candidate promoted before the partner-defined test and approval process is
  complete
- Ancestor points to an unreleased or non-highest version without an approved
  branch strategy
- Dependency failure confused with missing source in the package directory
- Patch version used for a change outside the patch contract
- Promotion performed without the separate promotion permission or the ISV's
  authorized release decision
- Released state inferred without a post-promotion report
- Legacy `force:package:*` command copied from the app
- Recommended version changed as though it were part of promotion

## Stable core versus refreshable references

Stable skill core:

- package identity is created once;
- versions are immutable artifacts;
- build iteration is distinct from promotion;
- ancestry and dependencies are different relationships;
- skipped validation is not promotable evidence;
- promotion is irreversible and requires a separate permission, which the ISV
  can assign within its own team model;
- all asynchronous requests require terminal-state evidence;
- exact identities and source provenance must be preserved.

Refreshable references:

- CLI flags and aliases
- packageable metadata and size limits
- code-coverage enforcement details
- patch enablement and restrictions
- Tooling API fields and identifier prefixes
- package-version allocations
- product-specific definition files
- AppExchange, Security Review, listing, and upgrade procedures

## Sources

---

## Source extract: development-environment-interview.md, lines 1116–1150

### When should an ISV require an installation key?

Package-version creation requires the partner to choose one of two options:

- pass `--installation-key <key>` when installation must be protected by a key;
  or
- pass `--installation-key-bypass` to remove the installation-key requirement.

With bypass, anyone can install the package, subject to the ordinary Salesforce
permissions needed to perform an installation. ISVs commonly use bypass, but
the correct choice is entirely dependent on the partner's requirements. The
advisor should explain the consequence, capture the partner's decision, and
generate the matching parameter without imposing one option as the default.

If the partner chooses a key, the advisor must not write that secret to source
control, transcripts, logs, or generated reports.

### What testing and evidence are required before promotion?

The partner's DevOps and development lifecycle owns the answer. Salesforce
defines the technical conditions that make a version promotable, but it does
not prescribe one universal ISV test plan, evidence packet, or approval chain.

As a general best practice, the ISV installs the exact package-version
candidate in a scratch org or sandbox and performs the testing required by its
own process. Once the team is satisfied with the results and its internal
approval requirements are met, it promotes that exact version so it can be
installed in production-type orgs.

The future advisor should ask for the partner's release policy, identify any
missing partner-defined evidence, and clearly distinguish those internal gates
from Salesforce's platform requirements. It should not elevate recommended
traceability artifacts into universal prerequisites.

### Which features and settings belong in the managed-2GP baseline scratch definition?
