# Practitioner knowledge for package-version-validation

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

- packaging-lifecycle-deep-dive.md, lines 191–345
- packaging-lifecycle-deep-dive.md, lines 535–679
- development-environment-interview.md, lines 1095–1179

## Source extract: packaging-lifecycle-deep-dive.md, lines 191–345

## Step 3: Create an immutable package-version candidate

The documented command is `sf package version create`.

Example shape:

```bash
sf package version create \
  --package "Package Name" \
  --wait 20 \
  --code-coverage \
  --definition-file config/project-scratch-def.json \
  --target-dev-hub "PBOAlias" \
  --installation-key-bypass
```

The sample reflects Package Visualizer's Setup Assistant. The installation-key
choice is not a universal recommendation, even though bypass is common ISV
practice.

### Internal build-org shape

Practitioner guidance explains why the definition file matters to
package-version creation: Salesforce provisions an internal build org and tests
the package-directory metadata in that shape. The effective definition must
therefore include the edition, features, settings, and object settings required
by the package contents.

For example, a package containing Agentforce or Data 360 metadata requires the
current corresponding features and companion settings in the build definition.
A developer org that was enabled manually or provisioned with a richer shape
can hide this dependency and allow local development to succeed while
package-version creation fails.

Practitioner guidance scopes the canonical `config/project-scratch-def.json` to
daily development and package-version creation. Installation tests and
customer-edition compatibility use separate environment and testing decisions,
not an expanded package-build definition.

Before submission:

1. Determine the effective definition from `sfdx-project.json` and CLI
   overrides.
2. Map package metadata to its required platform features and settings.
3. Confirm the selected PBO Dev Hub has the supporting entitlement.
4. Validate the definition through a clean scratch-org creation when the
   capability can be reproduced that way.

Documented behavior:

- A package version is an immutable snapshot of the package-directory contents.
- Version creation produces a request that can be polled until a terminal state.
- A successful request produces an internal version and an installable `04t`
  artifact.
- `--wait` controls how long the CLI waits before returning. If it returns
  early, continue tracking the request rather than treating the command as
  failed or complete.
- `--code-coverage` runs package-version code coverage and supplies evidence
  required for promotion when the package contains Apex.
- The scratch-definition file supplies required org features and settings for
  the build context. Patch versions inherit these from their ancestor.
- Branch, tag, release notes, post-install scripts, and related values can
  preserve release provenance.

### Validation modes

Validation timing and code coverage are separate choices:

| Validation path | Intended use | Promotion rule |
|---|---|---|
| Standard validation | Complete dependency, ancestor, metadata, and requested code-coverage validation before the artifact is returned as validated | Can be promoted only after successful validation and all other release gates pass |
| `--async-validation` | Return the new `04t` before validation finishes so installation and testing can start sooner, particularly in CI | Do not promote until the create request reaches terminal `Success` |
| `--skip-validation` | Fast, disposable development feedback when suppressed errors are an accepted risk | Cannot be promoted |

Additional documented constraints:

- Async validation changes when the artifact is returned, not the requirement
  that validation eventually succeed.
- Skip validation omits dependency, package-ancestor, and metadata validation.
  Important errors can therefore surface later.
- `--skip-validation` cannot be combined with `--code-coverage`.
- An async artifact can be installed and tested before validation completes,
  but availability of the `04t` does not make it promotable.

### Code coverage

`--code-coverage` is not itself a validation-timing mode. It calculates and
stores package-level coverage by running the packaged Apex tests during
validation.

Confirmed rules:

- Before a managed or unlocked package version can be promoted and released,
  its Apex code must meet the minimum 75% coverage requirement.
- Coverage isn't calculated for org-dependent unlocked packages.
- Coverage isn't calculated for versions created with `--skip-validation`.
- A package version can use skip validation or code coverage, but not both.

Practitioner shorthand can call a validated `--code-coverage` build a
“full-validation build,” but the advisor should preserve the technical
distinction: standard versus async controls when the artifact becomes available;
`--code-coverage` controls whether packaged Apex coverage is calculated and
stored.

### Installation-key decision

Package-version creation requires one of these mutually exclusive choices:

- `--installation-key <key>` protects installation with a key.
- `--installation-key-bypass` removes the installation-key requirement. With
  no key barrier, anyone can install the package, subject to the ordinary
  Salesforce permissions needed to perform an installation.

The choice depends on the partner's requirements. Package Visualizer uses
`--installation-key-bypass`, and ISVs commonly choose bypass, but the future
advisor must treat this as a partner-owned distribution decision rather than a
universal default.

Never place an installation key in a committed project file, transcript, log,
or generated report.

## Step 4: Iterate builds without confusing them with releases

Before promotion, the platform can contain multiple different `04t` artifacts
for the same `major.minor.patch` line. `NEXT` increments the build segment and
helps the team keep those candidates distinct.

Example:

```text
9.25.0-1  candidate
9.25.0-2  candidate
…
9.25.0-7  approved and promoted
```

Each build remains a distinct immutable artifact even if its version number is
similar to another build.

Documented closure rule:

- After a version on a `major.minor.patch` line is promoted, no more versions
  can be created on that same line.

Derived skill implications:

- Do not promote merely to “mark the latest build.”
- Promote the exact `04t` that the partner tested and accepted under its own
  DevOps and development-lifecycle policy.
- Preserve enough traceability to connect that `04t` to its create request,
  source, ancestry, and partner-defined test evidence.
- Keep unpromoted candidates visibly labeled Beta or candidate.
- Decide how abandoned candidates are retained, access-protected, or deleted.

## Step 5: Preserve linear ancestry and explicit dependencies

---

## Source extract: packaging-lifecycle-deep-dive.md, lines 535–679

## Package Visualizer implementation trace

### Setup Assistant

The assistant presents the current `sf` command family for:

- package creation;
- package-version creation;
- promotion; and
- recommended-version update.

Useful lessons:

- the lifecycle is presented in order;
- commands are copyable and linked to CLI reference pages;
- the version-create example includes code coverage and a definition file.

Qualifications:

- `--installation-key-bypass` is common ISV practice, but remains a
  partner-owned policy rather than a universal default;
- the promotion sample can rely on a configured default Dev Hub, but generated
  advisor commands should make the PBO target explicit;
- command syntax must be refreshed because Salesforce CLI changes frequently.

### Package and version views

The main UI separates:

- Package Details
- Versions
- Subscribers
- Push Upgrade Requests
- Version Create Requests

Package-level evidence includes name, namespace, `0Ho`, `033`, type,
org-dependence, App Analytics, Data Cloud flag, error username, and timestamps.

Version-level evidence includes version number, `05i`, `04t`, ancestor, branch,
tag, validation flags, code-coverage flag, release state, build duration,
release, creator, and timestamp.

The version view renders an ancestry tree from `AncestorId`, allows filtering by
release and validation state, and opens subscriber, LMA, dependency, and push
upgrade views.

The app's version-detail screen still renders the legacy
`sf force:package:install` command. The future skill must use the current
`sf package install` command family and current flags.

### Version-create request observability

Package Visualizer models these request stages:

```text
Queued
Initializing
VerifyingFeaturesAndSettings
VerifyingDependencies
VerifyingMetadata
PerformingValidations
FinalizingPackageVersion
Success | Error
```

It exposes:

- request `08c`
- status
- package `0Ho`
- produced `05i`
- branch and tag
- async, code-coverage, transitive-dependency, and skip-validation flags
- creator and timestamps
- request error rows

This is a strong model for the future skill: a build command is asynchronous
work with an evidence trail, not a single Boolean success.

## Read-only `PkgViz` evidence

The authorized org query confirmed:

- Alias `PkgViz` targets the production Enterprise Edition org named
  `Ronit Nuguru (Salesforce PBO)`.
- `Package2` contained 38 non-deprecated package identities: 31 Managed and
  7 Unlocked; 3 managed identities were flagged as Data Cloud packages.
- `Package2Version` contained 731 non-deprecated versions: 520 Released and
  211 unreleased candidates.
- Eleven version records showed skipped validation and five showed asynchronous
  validation.
- `Package2VersionCreateRequest` contained 1,125 requests: 731 Success and
  394 Error.
- Eleven successful requests used skipped validation. Async validation appeared
  in both Success and Error states, confirming that async is not success by
  definition.

These counts are point-in-time evidence, not expected entitlements or quality
targets.

### Concrete Package Visualizer release example

The project file currently contains:

```json
{
  "package": "Package Visualizer",
  "versionName": "Version 9.26",
  "versionNumber": "9.26.0.NEXT",
  "ancestorVersion": "9.25.0"
}
```

The live org shows:

- seven `9.25.0` candidates;
- builds 1–6 unreleased;
- build 7 Released;
- `9.26.0-1` Released with the released `9.25.0-7` `04t` as its ancestor.

This is the reference example for teaching candidate-build iteration, release
selection, alias mapping, and linear ancestry.

### Error-sample lesson

A 25-row sample of create-request errors came from only two parent requests and
was dominated by missing custom metadata types plus cascading layout,
translation, permission-set, Apex, and LWC failures.

Derived troubleshooting rule:

1. Group errors by create request.
2. Identify the earliest missing or invalid root component.
3. Distinguish root failures from downstream “parent failed,” invalid type, and
   missing action errors.
4. Inspect package-directory boundaries, dependencies, and source completeness
   before treating every error row as an independent defect.

The cross-package aggregate result for
`HasPassedCodeCoverageCheck` did not agree with direct record-level results on
the current Package Visualizer lineage. Do not use a Boolean aggregate alone as
promotion evidence; retrieve the selected version and request directly and
verify through the supported package-version report.

## Failure modes the skill must catch

---

## Source extract: development-environment-interview.md, lines 1095–1179

### How should synchronous, async, code-coverage, and skipped validation be interpreted?

- Standard validation completes validation work before the artifact is returned
  as validated.
- `--async-validation` returns the new package version before validation
  completes, enabling earlier installation and testing and reducing CI elapsed
  time. It is not promotable until the request reaches `Success`.
- `--code-coverage` calculates and stores coverage by running the packaged Apex
  tests. Managed and unlocked package Apex must meet the minimum 75% requirement
  before promotion.
- Coverage isn't calculated for org-dependent unlocked packages or versions
  created with `--skip-validation`.
- `--skip-validation` skips dependency, ancestor, and metadata validation,
  cannot be combined with code coverage, can hide errors until later, and
  produces an unpromotable version.

Practitioner shorthand can describe a validated code-coverage build as a
“full-validation build,” but the skill must keep timing and coverage separate:
async versus standard controls when the artifact becomes available, while
`--code-coverage` controls the packaged-Apex coverage calculation.

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

There is no universal product-feature baseline. The file must include the
edition, features, settings, and object settings required to:

1. create the intended developer scratch org; and
2. provision the internal build org used during package-version creation.

The second purpose is critical. Salesforce validates the package-directory
metadata in a theoretical build scratch org. If the package contains Agentforce,
Data 360, or other product-dependent metadata, the selected definition must
enable the corresponding current features and companion settings so that
technology exists in the build org. Keep unrelated capabilities out of the
baseline because an over-provisioned build can conceal accidental subscriber
dependencies.

### How should `project-scratch-def.json` be divided from other environment definitions?

Use `config/project-scratch-def.json` for two purposes:

1. daily development scratch-org creation; and
2. the internal package-version build shape.

It isn't normally used for installation testing or customer-edition
compatibility. Handle those through the ISV's separate environment-selection
and testing strategy. Do not require a collection of scenario-specific scratch
definitions by default. Add another definition only when the team deliberately
needs a different scratch-org development shape.

## Sources supplied during the interview
