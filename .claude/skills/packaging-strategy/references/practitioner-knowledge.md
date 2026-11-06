# Practitioner knowledge for packaging-strategy

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

- packaging-lifecycle-deep-dive.md, lines 1–190
- setup-assistant-deep-dive.md, lines 25–63
- setup-assistant-deep-dive.md, lines 721–743

## Source extract: packaging-lifecycle-deep-dive.md, lines 1–190

# ISV Managed 2GP Packaging Lifecycle — Interview Deep Dive

Reviewed: 2026-07-23

Purpose: Capture the packaging knowledge that follows PBO, namespace, developer
access, Salesforce DX project, and scratch-org setup. This is an interview
artifact for the planned ISV Development Environment skill, not the final
skill.

## Evidence model

- **Documented:** Confirmed by the linked current Salesforce documentation.
- **Practitioner rule:** Supplied during the interview.
- **Implementation evidence:** Observed in the user-supplied Package Visualizer
  project.
- **Live-org evidence:** Observed through read-only Tooling API queries against
  the authorized `PkgViz` org.
- **Derived skill implication:** Proposed behavior for the future advisor.
- **Time-sensitive:** Must be refreshed from the current CLI documentation,
  platform documentation, project, or target Dev Hub.

The Package Visualizer implementation and `PkgViz` records are valuable examples,
but they do not override the current platform contract.

## Lifecycle in one view

1. Establish the PBO as Dev Hub, link the production namespace, grant
   operation-specific permissions, and confirm package-version capacity.
2. Configure the package directory and namespace in `sfdx-project.json`.
3. Create the package identity once with `sf package create`.
4. Create immutable package-version candidates with
   `sf package version create`.
5. Track each create request through success or error and inspect its evidence.
6. Install and test candidate versions in non-production orgs.
7. Promote exactly the approved candidate to Released.
8. Verify release state, then distribute, recommend, list, or upgrade through
   the appropriate downstream process.

Promotion is not merely the last build command. It closes the selected
`major.minor.patch` release line and makes an irreversible distribution
decision.

## Packaging identity and record model

| Layer | Observed identifier | Role |
|---|---|---|
| Package identity | `0Ho…` | Top-level `Package2` record created once for a package |
| Subscriber package | `033…` | Subscriber-facing package identity |
| Version-create request | `08c…` | Asynchronous build/validation job created for a package-version request |
| Internal package version | `05i…` | `Package2Version` record produced by a successful request |
| Installable subscriber version | `04t…` | Immutable artifact installed in test or subscriber orgs |
| Request error | Object-specific ID | One error row associated with a failed create request |

Identifier prefixes are useful diagnostics, but the skill should reason from
object and field names rather than treating every observed prefix as a permanent
API contract.

Derived skill implications:

- Never use “package ID” without saying which identity is required.
- Preserve the complete mapping from create request to internal version to
  subscriber version.
- Use the `04t` identifier or a package-version alias for installation and
  promotion commands that accept a subscriber package version.
- Use the `0Ho` identifier or package alias when the command targets the
  package container.
- Treat a successful `08c` request as evidence that a version was built, not
  evidence that it was promoted or released.

## Gate 0: Preconditions before package creation

The packaging workflow assumes that the environment decisions have already been
made correctly:

- The ISV's PBO is the Dev Hub. There are no exceptions within the interview's
  ISV scope.
- Dev Hub and managed second-generation packaging are enabled in that PBO.
- The production namespace was registered in its dedicated Developer Edition
  namespace org, linked to the PBO, connected to Environment Hub for inventory,
  and added to `sfdx-project.json`.
- Package builders have `Create and Update Second-Generation Packages`.
- Release managers separately have `Promote a package version to released`.
- The team checked live `Package2VersionCreates` and
  `Package2VersionCreatesWithoutValidation` capacity.
- The source directory, package boundary, dependency model, and package type
  were approved.

These are not cleanup tasks after `sf package create`. Package ownership,
package type, and namespace are foundational decisions.

## Step 1: Create the package identity once

The documented command is `sf package create`.

Example shape:

```bash
sf package create \
  --name "Package Name" \
  --description "Package Description" \
  --package-type Managed \
  --path force-app \
  --target-dev-hub "PBOAlias"
```

Documented behavior:

- The package is the top-level container for its name, description, namespace,
  type, source directory, and subsequent versions.
- The package name must be unique within the namespace.
- Package type is `Managed` or `Unlocked`.
- `--no-namespace` applies only to unlocked packages. New managed metadata
  should be namespaced.
- The command adds the package name and `0Ho` identifier to
  `packageAliases` unless project auto-update is disabled.
- Name, description, and package-error username can be updated later.
- Namespace and package type cannot be changed after creation.

Practitioner rule: run package creation once per package. Iteration happens by
creating package versions, not by recreating the package identity.

Derived approval gate:

Before package creation, report and obtain approval for:

- PBO Dev Hub identity
- package name and boundary
- package type
- namespace
- source path
- error-notification owner

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

---

## Source extract: setup-assistant-deep-dive.md, lines 25–63

## Executive interpretation

The Setup Assistant is not a flat nine-item checklist. It represents four layers:

1. **Package Visualizer installation setup:** configure the installed app and its Tooling API integration.
2. **ISV control-plane baseline:** establish the PBO, enable Dev Hub and managed 2GP, register and link the namespace, and provision developer access.
3. **Source-driven package lifecycle:** configure DX, scratch shapes, source control, package creation/versioning/promotion, and Security Review evidence.
4. **Conditional routes:** add product-specific environments only when the solution needs them, or run the separate 1GP-to-2GP migration program only for an existing 1GP estate.

The durable dependency sequence is:

```text
Partner enrollment
  -> PBO verification
  -> PBO Dev Hub + managed 2GP enablement
  -> production namespace decision
  -> dedicated namespace DE org
  -> link namespace to PBO
  -> developer personas and least-privilege access
  -> DX project + source control + scratch-shape strategy
  -> immutable package creation gate
  -> package-version validation and testing
  -> release approval and promotion
  -> Security Review readiness

Conditional product path:
  product requirement
    -> current packageability check
    -> PBO entitlement / Partner Support / external program check
    -> product-specific scratch or persistent environment

Existing 1GP path:
  migration assessment
    -> conversion tests
    -> subscriber migrations
    -> irreversible development cutover
```

## Step 0 — Component Setup and Customization

---

## Source extract: setup-assistant-deep-dive.md, lines 721–743

## Skill routing model derived from the component

The Development Environment skill should own:

- PBO identification and lifecycle;
- Dev Hub ownership and enablement;
- namespace-org decision and link;
- developer-environment capabilities and Dev Hub permissions;
- scratch-shape selection and reproducibility;
- product-environment prerequisite detection;
- environment evidence passed to packaging, security, and operations specialists.

It should route:

- package architecture, ancestry, versioning, and promotion detail to Packaging & Distribution;
- scan interpretation and Security Review remediation to Security & Readiness;
- LMA/FMA and subscriber lifecycle to Packaging/Operations;
- Agentforce, Data 360, Slack, and Tableau implementation detail to their product specialists;
- production migration waves and push upgrades to Operations & Release.

The handoff must retain the PBO org ID, Dev Hub alias, namespace, limits, permissions, scratch definition, product entitlement evidence, and approval decisions.

## Additional implementation links and navigation targets
