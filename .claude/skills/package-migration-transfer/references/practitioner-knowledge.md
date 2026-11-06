# Practitioner knowledge for package-migration-transfer

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

- packaging-lifecycle-deep-dive.md, lines 465–535
- setup-assistant-deep-dive.md, lines 649–703
- salesforce-source-dossier.md, lines 2032–2151

## Source extract: packaging-lifecycle-deep-dive.md, lines 465–535

## Recovery when the package was created under the wrong Dev Hub

For an ISV, the package should be owned by the PBO Dev Hub. If packaging work
began elsewhere, branch on the package's history:

- If the managed 2GP package has not passed AppExchange Security Review, create
  a new managed 2GP package in the correct PBO Dev Hub and repeat the packaging
  setup there.
- If the managed 2GP package has passed Security Review, use Salesforce's
  Support-assisted transfer process. This preserves the established subscriber
  package and version identities and is particularly important when customers
  already use the package.
- If the package was converted from managed 1GP to 2GP, it cannot be transferred
  because conversion permanently associates it with its Dev Hub.

For an ISV-internal correction, the destination is the correct PBO Dev Hub. The
destination cannot be a Developer Edition or trial org, and a transfer cannot
cross between Government Cloud and a Dev Hub outside Government Cloud.

### Transfer request and preflight

File one Salesforce Customer Support case per package. Record:

- the `033` subscriber package ID, verified with `sf package list --verbose`;
- source and destination Dev Hub org IDs;
- namespace;
- internal or external transfer type; and
- acknowledgment that the transfer preflight is complete.

Before Support initiates the transfer:

1. Keep the namespace linked to the source Dev Hub and link it to the
   destination Dev Hub.
2. Wait for every package-version creation and push-upgrade operation to finish.
3. Delete package versions that are no longer needed.
4. Clear the package's error-notification user:

   ```bash
   sf package update --error-notification-username=
   ```

5. Coordinate the scheduled transfer time with Salesforce Support.

For an external transfer, the source owner must securely deliver the source,
required `sfdx-project.json` configuration, scratch-org features and settings,
and namespace-org access. Credentials must use an approved secure handoff and
must not appear in source control, generated reports, or advisor transcripts.

### Identity, history, and source-project effects

After a successful transfer:

| Record or history | Result |
|---|---|
| Subscriber package ID (`033`) | Remains unchanged |
| Subscriber package-version IDs (`04t`) | Remain unchanged |
| Package ID (`0Ho`) | Destination receives a new ID |
| Versions, ancestry, and customer upgrade paths | Transfer |
| Push-upgrade history | Does not transfer |
| Package-version create requests | Do not transfer |
| Error-notification username | Does not transfer |
| Deleted package versions | Do not transfer and aren't recoverable |

The source owner must verify with `sf package list` that the package is no
longer associated with its Dev Hub, request Support cleanup if it remains,
unpublish its AppExchange listing, and remove the transferred package's package
directory and alias references from `sfdx-project.json`. Any packages that
still depend on the transferred package must identify the dependency by exact
`04t` or by an alias that resolves to that `04t`.

## Package Visualizer implementation trace

---

## Source extract: setup-assistant-deep-dive.md, lines 649–703

## Step 9 — Migrate an Existing Managed 1GP Package to 2GP

Sources:

- [Managed 2GP with Package Migrations Is Now Generally Available](https://developer.salesforce.com/blogs/2025/06/move-to-managed-2gp-with-package-migrations)
- [Move to 2GP: Migrate Your Managed Packages with Ease](https://developer.salesforce.com/docs/atlas.en-us.pkg1_dev.meta/pkg1_dev/move_to_second_gen_pkg.htm)

This branch is irrelevant for a new package with no 1GP subscribers. For an existing managed 1GP estate, it is a staged migration program.

### Phase 1 — Plan and test

- Continue creating and releasing package innovation in 1GP.
- Convert released 1GP versions for testing.
- Test converted packages and subscriber migration in scratch orgs or sandboxes.
- Inventory subscriber versions and dependencies.
- Where possible, align subscribers on the same version.

### Phase 2 — Transition subscribers

- Convert the latest managed-released 1GP major/minor version.
- Promote the converted 2GP version before production migration.
- Migrate subscribers manually or through the applicable push-upgrade path.
- Continue building all new package innovation in 1GP during this phase, then convert and promote each necessary version.
- Treat migration as a one-time operation per subscriber/package. Future upgrades for a migrated subscriber use 2GP.

The subscriber's installed 1GP major/minor/patch version must match the converted 2GP migration version. For dependency graphs, migrate leaf packages first, then extensions, then the base package, because a 1GP package cannot depend on a 2GP package.

### Phase 3 — Irreversible development cutover

After extensive conversion and subscriber-migration tests:

1. Retrieve the latest converted package version source.
2. Update `versionName`, `versionNumber`, and `ancestorVersion`.
3. In the 1GP packaging org, choose **Move to 2GP**.
4. Review and acknowledge the irreversible statements.
5. Proceed only with explicit approval.

After cutover, the packaging org can no longer create new major or minor 1GP versions for that package. Unmigrated subscribers must migrate to continue receiving later version updates. Older pre-cutover lines can have limited 1GP patch behavior as documented.

### Conversion gates and limitations

- The PBO Dev Hub association established by the first conversion cannot be changed or transferred.
- The 1GP namespace must be linked to the PBO Dev Hub.
- Only managed-released versions can be converted.
- Metadata must be supported in managed 2GP.
- Current documentation requires API 57+ for conversion and API 64+ for promotion.
- Packages containing Data Cloud metadata cannot currently be converted.
- Packages with 20,000 or more metadata files are not currently supported.
- The conversion process performs limited validation; test beyond a successful command.
- A converted version is Beta until promoted.
- Use `--code-coverage` during conversion when the version will be promoted; configure any test permission sets and unpackaged metadata dependencies.
- Validate LMA and FMA behavior after migration.
- Push-migration availability, limits, and status are time-sensitive and must be checked before planning a production wave.

## Cross-step corrections to preserve in the future skill

---

## Source extract: salesforce-source-dossier.md, lines 2032–2151

## 25. Transfer a Second-Generation Managed Package to a Different Dev Hub

URL: https://developer.salesforce.com/docs/atlas.en-us.pkg2_dev.meta/pkg2_dev/sfdx_dev2gp_package_transfer.htm

Source type: User-supplied complete Markdown of the official Atlas managed-2GP
guide page. The official URL and article title were independently verified, but
the Salesforce page didn't expose its article body to the available extractor.

### Documented eligibility and exclusions

- A managed 2GP package can be transferred internally between Dev Hubs owned by
  one company or externally to another Salesforce Partner or ISV.
- Managed-2GP transfer is available only after the package passes AppExchange
  Security Review.
- When a package hasn't passed Security Review, Salesforce recommends creating
  a new managed 2GP package in the preferred Dev Hub.
- A managed 2GP package converted from managed 1GP cannot be transferred. Its
  Dev Hub association is permanent.
- The transfer capability also applies to unlocked packages. It doesn't apply
  to managed 1GP or unmanaged packages because those package types don't use
  Dev Hubs.
- The destination Dev Hub can't be a Developer Edition or trial org.
- Transfers can't cross between Government Cloud and a Dev Hub outside
  Government Cloud.

### Documented request and preparation

The source owner opens one Salesforce Customer Support case per package with:

- the `033` subscriber package ID, verified by running
  `sf package list --verbose` against the source Dev Hub;
- source and destination Dev Hub org IDs;
- namespace;
- internal or external transfer type; and
- acknowledgment that the preparation steps are complete.

Before the scheduled transfer:

1. Keep the namespace linked to the source Dev Hub and link it to the
   destination Dev Hub.
2. Complete every push upgrade and package-version creation operation.
3. Delete package versions that are no longer needed.
4. Clear the error-notification user with:

   ```bash
   sf package update --error-notification-username=
   ```

5. Wait for Salesforce Support to review, approve, and schedule the transfer.

For an external transfer, the source owner also provides the source and
Salesforce DX configuration, including `sfdx-project.json` settings, required
scratch-org features and settings, and namespace-org credentials needed to link
the namespace.

### Documented identity and history effects

| Evidence | Transfer result |
|---|---|
| Subscriber package ID (`033`) | Remains unchanged |
| Subscriber package-version IDs (`04t`) | Remain unchanged |
| Package ID (`0Ho`) | Destination receives a new unique ID |
| Package versions and ancestry | Transfer |
| Customer upgrade paths | Aren't affected |
| Push-upgrade history | Doesn't transfer |
| Package-version create requests | Don't transfer |
| Apex/error-notification username | Doesn't transfer |
| Deleted package versions | Don't transfer and aren't recoverable |

After transfer, the source owner:

- runs `sf package list` to verify that the source Dev Hub no longer owns the
  package;
- opens a Support cleanup case if the package remains visible after the
  recipient confirms success;
- unpublishes the existing AppExchange listing;
- removes the transferred package from the package-directory and package-alias
  sections of `sfdx-project.json`; and
- changes any remaining package dependency to an exact `04t` or an alias that
  resolves to that `04t`.

### Practitioner recovery rule

For an ISV, the correct destination is the PBO Dev Hub:

- Before Security Review, rebuild the package identity and packaging
  configuration in the correct PBO. The additional setup is preferable to
  preserving the wrong ownership foundation.
- After Security Review, use the supported transfer path. This becomes
  especially important when customers already use the package because the
  stable `033` and `04t` identities, ancestry, and customer upgrade paths must
  be preserved.
- Never recommend a transfer for a package converted from 1GP.

Security Review is the documented eligibility boundary. Having customers isn't
a separate eligibility requirement; it increases the operational importance of
preserving the existing package lifecycle.

### Derived skill implications

- Detect the wrong Dev Hub before `sf package create` whenever possible.
- When recovery is required, collect package type, Security Review status,
  1GP-conversion history, customer-installation impact, source and destination
  org identities, namespace links, current operations, and package IDs before
  recommending a path.
- Treat transfer as a Support-coordinated, approval-gated operation rather than
  a normal CLI write.
- Explain the `033`/`04t` continuity and `0Ho` replacement explicitly so source
  and destination teams don't confuse transferred subscriber identities with
  the Dev-Hub-local package identity.
- Preserve the source-side project cleanup and dependency rewrite as part of
  completion evidence.
- Handle namespace credentials only through an approved secure channel; never
  place them in advisor output, source control, or audit reports.
- Retrieve the current destination-acceptance companion page before an Act-mode
  transfer because the supplied source describes the source-owner workflow.

---

## Consolidated decision rules supported by the sources
