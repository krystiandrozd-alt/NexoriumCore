---
name: ingestion-check
description: Dry-run a Nexorium Core file-based connector (config-repo manifests, Terraform state, AWS/Azure/GCP control-plane fixtures, CSV imports) and check what it would ingest against the canonical data-integrity rules, without touching the database. Use before ingesting or committing a topology source, after changing a connector's map() logic, or when ingested data is missing hosts, endpoints, versions or connections.
compatibility: Requires Node.js 18+ and installed dependencies (npm install). Run from inside the repository. Needs no database and no network access.
---

# Ingestion check

Runs a connector's own `fetch()` and `map()` on a source, then checks the canonical payload using the same reference resolution as `BaseConnectorV2.upsert()`. Each finding states what ingestion would skip, merge or store without a link. Nothing is written: no `upsert()`, no `run()`, no `ConnectorRun` record.

## Available scripts

- **`scripts/check-source.ts`**: checks one source and prints a JSON report. `--help` lists every option; `--list-codes` lists every finding code with its rule.

## Workflow

Run the commands from the repository root.

1. Check the source:
   ```bash
   npx --no tsx .claude/skills/ingestion-check/scripts/check-source.ts --type config-repo --source fixtures/config-repo/sit-topology.yaml
   ```
   `--type` is one of `config-repo`, `terraform`, `cloud-aws`, `cloud-azure`, `cloud-gcp`, `csv`. For `csv`, `--source` is a directory holding any of `hosts.csv`, `components.csv`, `instances.csv`, `endpoints.csv`, `versions.csv`, `connections.csv`.

2. Act on the exit code:

   | Exit | Meaning | Next step |
   |------|---------|-----------|
   | 0 | No error findings | Review warnings, then ingest |
   | 1 | Error findings (with `--strict`: any finding) | Fix the source or the connector, re-run |
   | 2 | Invalid arguments, or run outside the repository | Read stderr and correct the command |
   | 3 | Source missing, unreadable, or wrong kind of path for `--type` | Correct `--source` or `--type` |
   | 4 | Internal failure | Run `npm install`, re-run |

3. Read the report on stdout. `summary.byCode` totals every finding; `findings` lists the first 20, errors first. Page with `--offset <page.nextOffset>` until `nextOffset` is `null`, or list errors only with `--severity error`. For large sources, write everything to a file and query it:
   ```bash
   npx --no tsx .claude/skills/ingestion-check/scripts/check-source.ts --type csv --source imports/sit --output /tmp/sit-report.json --include-payload
   jq '.findings[] | select(.code == "E_DANGLING_CONNECTION_REF")' /tmp/sit-report.json
   ```

4. Fix the findings and re-run until the exit code is 0.

## Reading findings

Each finding has `severity`, `code`, `path` and `message`. `path` indexes the canonical payload (`connections[3]` is the fourth mapped connection); add `--output FILE --include-payload` to see the mapped record. The message states what `upsert()` would do and what to change.

| Codes | What happens on ingestion | Typical fix |
|-------|---------------------------|-------------|
| `E_DANGLING_*_REF`, `E_UNKNOWN_COMPONENT` | Records that reference no declared instance or component are skipped | Correct the reference, or declare the missing instance or component |
| `E_MISSING_PROJECT_VERSION`, `E_INVALID_VERSION_VALUE` | Deployment stored without a usable project version | Set the version; quote it in YAML (`version: "1.10"`) |
| `E_DUPLICATE_INSTANCE`, `E_AMBIGUOUS_INSTANCE_REF` | Two declared deployments collapse into one, or references hit the wrong one | Make `externalId` and `displayName` unique |
| `E_PARTIAL_SOURCE`, `E_CONNECTOR_ERROR` | Part or all of the source was not read | Fix the file named in the message |
| `W_UNRESOLVED_*`, `W_HOST_WITHOUT_NETWORK_CONTEXT` | Host or network-context link not stored | Include the referenced record in the same source |
| `W_DUPLICATE_*` | Records merged; later values overwrite earlier ones | Remove the duplicate |

Run `--list-codes` for the full list. Error codes start with `E_`, warnings with `W_`.

## Gotchas

- Current connector behaviour, not a source error: the `config-repo` connector emits no hosts, so every manifest instance with `host:` gets `W_UNRESOLVED_HOST_REF`. The `terraform` connector sets no `networkContextRef`, so every host in a state file with a VPC gets `W_HOST_WITHOUT_NETWORK_CONTEXT`.
- Findings cover one source in one run. `upsert()` does not resolve references to records from another connector or an earlier run, so neither does this check.
- Do not use a connector's `dryRun` flag instead: `run()` with `dryRun: true` still writes a `ConnectorRun` record.
- `--include-payload` requires `--output`; payloads for 30-100 systems are large.
- `npx --no` stops npx from downloading an unpinned `tsx` when dependencies are missing. Run `npm install` instead.
