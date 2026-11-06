# Practitioner knowledge for package-ancestry-dependencies

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

- packaging-lifecycle-deep-dive.md, lines 133–191
- packaging-lifecycle-deep-dive.md, lines 312–398
- development-environment-interview.md, lines 1041–1116

## Source extract: packaging-lifecycle-deep-dive.md, lines 133–191

## Step 2: Treat `sfdx-project.json` as the package blueprint

The project configuration file determines package contents and version
attributes. Relevant fields include:

- `packageDirectories[].path`
- `packageDirectories[].package`
- `packageDirectories[].default`
- `packageDirectories[].versionName`
- `packageDirectories[].versionNumber`
- `packageDirectories[].ancestorVersion` or `ancestorId`
- `packageDirectories[].definitionFile`
- `packageDirectories[].dependencies`
- `namespace`
- `packageAliases`
- optional release-note, installation, and delete-script URLs or paths

The documented version format is:

```text
MAJOR.MINOR.PATCH.BUILD
```

The CLI and Package Visualizer display it as:

```text
major.minor.patch-build
```

The interview's earlier `major.minor.path-build` wording is normalized to
`major.minor.patch-build`.

Documented behavior:

- The partner or development team chooses what qualifies as a major or minor
  change.
- Increase the major version for major changes.
- Increase the minor version for smaller improvements.
- A nonzero patch number creates a restricted patch version.
- `NEXT` can be used for the build segment, for example `9.26.0.NEXT`.
- `--version-number` can override the project value for one command, but does
  not update `sfdx-project.json`.
- Package and version create commands normally update `packageAliases`.
- CLI flags override corresponding project-file values.

Derived skill implications:

- Prefer a committed `versionNumber` ending in `NEXT` over hand-managed build
  numbers.
- Treat a CLI-only version override as drift unless the project file and release
  record are deliberately reconciled.
- Inspect the effective configuration, not just the command line.
- Keep the package alias map as audit evidence connecting human-readable
  versions to immutable `04t` artifacts.
- Treat `packageDirectories[].definitionFile` and any CLI
  `--definition-file` override as part of the package's build contract, not only
  as a developer scratch-org convenience.

## Step 3: Create an immutable package-version candidate

---

## Source extract: packaging-lifecycle-deep-dive.md, lines 312–398

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

### Ancestry

For a normal upgrade path:

- The ancestor must be a Released version.
- It should normally be the highest promoted version.
- `ancestorVersion: "HIGHEST"` is the documented convenience for linear
  versioning.
- A specific version or `04t` can be used when the team needs an explicit
  ancestor.

`ancestorVersion: "NONE"` and `--skip-ancestor-check` are exception paths. They
can break the normal upgrade lineage and therefore require an explicit
architecture and release approval. They must not be advisor defaults.

### Dependencies

Dependencies are separate from ancestry:

- ancestry defines the upgrade lineage within one package;
- dependencies declare other package versions that this package requires.

Package Visualizer queries `SubscriberPackageVersion.Dependencies` and resolves
each dependent `04t` back to version details. The future skill should:

- inspect dependencies before version creation;
- confirm compatible, installable dependency versions;
- install dependencies in the correct order in clean test orgs;
- distinguish a missing package dependency from a missing metadata component in
  the current package directory.

## Patch versions

A nonzero patch segment creates a patch version. Current documentation limits
patches to small fixes on an existing released major/minor line.

Important constraints include restrictions on adding or deleting components,
changing APIs or visibility, adding features, settings, dependencies, or web
services, and changing certain Apex relationships or modifiers.

Other documented prerequisites:

- the patch ancestor is Released;
- the patch shares the ancestor's major and minor numbers;
- the patch inherits features and settings from its ancestor;
- Partner Support must enable patch versioning in the namespace org;
- managed-package patching is tied to Security Review eligibility.

Derived skill implication: recommend a new minor version unless the requested
change fits the current patch contract and patch enablement is confirmed.

## Step 6: Promote the approved version to Released

---

## Source extract: development-environment-interview.md, lines 1041–1116

### How should a partner choose major versus minor package versions?

The choice is owned by the partner or development team:

- Increase the major version when introducing major changes.
- Increase the minor version for smaller improvements.

Salesforce fixes the `MAJOR.MINOR.PATCH.BUILD` structure and applies special
restrictions to patch versions, but it does not impose a universal semantic
boundary between major and minor changes.

### How should `calculateTransitiveDependencies` be configured?

Use `false` as the normal/default value. When it is `false`, the project must
list the package's direct and indirect dependencies explicitly, including
multilevel chains such as `pkgC → pkgB → pkgA`.

Set it to `true` when the team wants to declare direct dependencies only and
have Salesforce calculate the indirect dependencies. This setting also enables
the hierarchical dependency graph:

```bash
sf package version displaydependencies \
  --package "<04t, alias, or 08c>" \
  --target-dev-hub "PBOAlias"
```

The command supports unlocked and managed 2GP package versions and emits
GraphViz code. Its default `root-first` direction starts with the base package,
which is installed last. Add `--edge-direction root-last` when the desired
output is dependency installation order. Add `--verbose` to include each
package-version ID and version number.

### Which changes justify a patch rather than a minor release?

Use a patch for a small corrective change, such as a bug fix, when the change
fits Salesforce's complete patch restriction set. A patch isn't a vehicle for
new features or structural expansion: it can't add or delete components, alter
the listed API or visibility contracts, introduce the listed Apex relationship
or modifier changes, or add features, settings, dependencies, or web services.
Use a minor or major release when the proposed work exceeds that contract.

Before creating a patch, confirm that:

- the package has passed AppExchange Security Review;
- Partner Support enabled patch versioning in the namespace org;
- the selected ancestor is managed-released;
- the patch and ancestor have matching major and minor numbers;
- the planned metadata changes comply with every patch restriction; and
- the intended ancestry follows the patch/non-patch rules.

The patch inherits its ancestor's scratch-definition features and settings and
the upgrade path of the corresponding non-patch major/minor version.

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
