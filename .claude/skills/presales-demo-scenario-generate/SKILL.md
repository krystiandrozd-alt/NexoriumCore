---
name: presales-demo-scenario-generate
description: "Salesforce presales demo scenarios from one configurable JSON file. Renders an executive storyline, a presenter script and a technical runbook, generates org-prep assets for the sf CLI, and runs the click path headless with Playwright as a smoke test with screenshots and video. TRIGGER when: user writes or reviews a demo scenario, demo script, talk track, click path or demo storyline, prepares demo data or users in a demo org, or wants to smoke-test or record a demo before presenting it. DO NOT TRIGGER when: authoring EPC catalog data (use omnistudio-epc-catalog-generate), seeding or cleaning large data volumes (use platform-data-manage), writing SOQL only (use platform-soql-query), or researching a prospect (use customer-demo or researching-telco-prospects)."
metadata:
  version: "1.0"
---

# presales-demo-scenario-generate: demo scenarios as configuration

One JSON file per demo is the single source of truth. Everything else is generated from it, deterministically:

| Output | For whom | Command |
|---|---|---|
| `01-exec-storyline.md` | Executives in the audience; leave-behind | `render` |
| `02-presenter-script.md` | The presenter: talk track, tell and value per scene, discovery questions, objections | `render` |
| `03-technical-runbook.md` | Whoever drives the org: click path, locators, data, plan B per step | `render` |
| `org-prep/` | The demo org: sObject tree files, `prepare-org.sh`, `CHECKLIST.md` | `org-prep` |
| `run/` | Rehearsal: headless Playwright run with `report.md`, `report.json`, screenshots and video | `run` |

Method: Great Demo! (customer situation first, show the end result first) and Tell-Show-Tell (each scene opens with context and closes with business value).

---

## When This Skill Owns the Task

- writing a new demo scenario from discovery notes, or reviewing an existing one
- turning a scenario into presenter, executive and technical documents
- preparing demo records and permission sets in a demo org
- smoke-testing a click path before the demo, or recording it as a plan B

## Delegate Elsewhere

- product catalog (EPC) offers and bundles → [omnistudio-epc-catalog-generate](../omnistudio-epc-catalog-generate/SKILL.md)
- bulk data, data factories, cleanup scripts → [platform-data-manage](../platform-data-manage/SKILL.md)
- SOQL for verification queries → [platform-soql-query](../platform-soql-query/SKILL.md)
- company research before the scenario exists → `customer-demo`, `researching-telco-prospects`

---

## Mode Decision

| Mode | Use when | Commands |
|---|---|---|
| Documents only | The user wants the script, storyline or runbook; no org is involved | `validate`, `render` |
| Org execution | The user wants the demo org prepared or the click path tested | `org-prep`, then `prepare-org.sh`; `run` |

Do not assume org execution. Ask before running `prepare-org.sh` or `run` against a real org.

## Required Context to Gather First

- product, demo slot in minutes, audience roles, language (`en` or `pl` labels are built in)
- discovery notes: critical business issue, problems, figures the customer actually gave
- demo org: sf CLI alias, the non-production orgs the scripts may touch, the environment variable that holds the Lightning base URL
- UI labels already confirmed in the org, if any

---

## Workflow

1. **Draft** the scenario: copy `assets/scenario-template.json`, or run `assets/prompts/generate-scenario.prompt.md` with the discovery brief.
2. **Validate and score**: `node scripts/demo.mjs validate scenario.json`. Fix every error, then work through the findings.
3. **Render** the three layers: `node scripts/demo.mjs render scenario.json`.
4. **Prepare the org**: `node scripts/demo.mjs org-prep scenario.json`, review `CHECKLIST.md`, then run `bash out/<id>/org-prep/prepare-org.sh`.
5. **Smoke-test and record**: `node scripts/demo.mjs run scenario.json`. Fix locators until every step passes; the report lists the locators the run confirmed, so you can set `"verified": true` on them.
6. **Rehearse** from the presenter script and keep the recording as plan B.

`node scripts/demo.mjs all scenario.json --run` does steps 2 to 5 in one go.

## Core Operating Rules

- **Never production.** `prepare-org.sh` refuses any org not listed in `orgPrep.allowedOrgs` and prints `OrganizationType` and `IsSandbox` before it asks for confirmation. Never list a production org.
- **No invented figures.** Customer numbers come from discovery. Unknown values are written as `TBD: ...` and listed in `meta.assumptions`; the score shows them until they are confirmed.
- **Synthetic data only** in `records`; standard objects and fields only when you are sure they exist. Anything org-specific goes into `orgPrep.manualSteps`.
- **No secrets in JSON.** Use `{{env.NAME}}`. Documents print `‹env:NAME›`, never the value; run reports redact session parameters.
- **Locators**: role with name first, then label, then text. Org-specific labels live in `variables`. Every locator not yet seen in the org has `"verified": false`.
- **Deterministic outputs.** Rendering has no timestamps: the same JSON gives the same documents.
- **The scripts never modify the scenario.** Confirmed locators are reported, not written back.
- **Network.** The scripts reach only the npm registry (during `npm ci`), the sf CLI, and the URLs in the scenario. They send nothing anywhere else.

---

## Quick Reference

Setup (Node 18 or later):

```bash
cd scripts && npm ci                                        # ajv 8.20.0, handlebars 4.7.10, pinned by package-lock.json
npm i -D playwright && npx playwright install chromium      # only for run and selftest, if Playwright is not installed yet
node demo.mjs selftest                                      # proves the runner on the bundled Quote Desk app
```

| Command | Does |
|---|---|
| `validate <file> [--json]` | Schema, references and placeholders, then the quality score |
| `render <file> [--layers exec,presenter,technical] [--out dir]` | Writes the enabled layers |
| `org-prep <file> [--out dir]` | Writes `org-prep/data/*.json`, `plan.json`, `prepare-org.sh`, `CHECKLIST.md` |
| `run <file> [--dry-run] [--headed] [--out dir]` | Headless run; `--dry-run` prints the resolved click path without a browser |
| `all <file> [--run]` | validate + render + org-prep, and the run with `--run` |
| `selftest` | Serves `assets/examples/local-selftest/app` and runs its scenario |

Exit codes: `0` ok · `1` validation errors, a blocked score or failed steps · `2` usage or configuration error.

Placeholders: `{{vars.name}}`, `{{env.NAME}}`, `{{meta.path}}`, `{{runner.path}}`. Keys that start with `x-` are allowed on every object and reach the templates unchanged.

Headless login (`runner.auth`): `none`; `url` (a pre-authenticated URL, e.g. from `sf org open --url-only`); `sfCli` (the runner calls `sf org open --url-only --json`); `storageState` (a saved Playwright session).

## Scoring

100 points: situation 25 · storyline 15 · scenes 35 · timing 5 · technical readiness 20.

| Band | Rule |
|---|---|
| demo-ready | score ≥ `quality.readyScore` (default 85) and no unverified locator |
| needs-review | score ≥ `quality.reviewScore` (default 60), or capped while locators are unverified |
| blocked | below `quality.reviewScore`; `validate` exits with 1 |

## Customising

| What | Where |
|---|---|
| Headings and labels | `output.labels`; keys in `scripts/lib/labels.mjs` |
| Layout of a layer | `output.layers.<layer>.template`: your own Handlebars file, relative to the scenario |
| Layers on or off, file names | `output.layers.<layer>.enabled`, `fileName` |
| Output folders | `output.dir`, `orgPrepDir`, `runDir` |
| Browser, viewport, locale, timeouts, video, screenshots | `runner` |
| Score thresholds and scene limits | `quality` |

Template context: `meta`, `situation`, `storyline`, `personas`, `scenes[]` (with `number`, `persona`, `startMinute`, `endMinute`, `presenterSteps`, `technicalSteps`), `variables`, `records`, `runner`, `orgPrep`, `labels`, `requiredEnv`, `authText`, `checklistItems`, `totals`, and `scenario` (the full resolved JSON, including `x-` fields). Helpers: `inc`, `join`, `cell` (escapes table cells), `eq`.

## Where It Runs

| Surface | What works | Why |
|---|---|---|
| Claude Code, local or cloud session | Everything | Full network access; install the script dependencies locally in `scripts/` |
| claude.ai (zip upload) | The prompt, schema and templates; the scripts only where the sandbox has Node.js 18+ and npm access | Network access depends on plan and admin settings; headless runs also need Playwright with a browser |
| Claude API (Skills API) | The prompt, schema and templates | No network access and no package installation, so `npm ci` cannot run |

Tested in Claude Code only. Custom skills do not sync across surfaces: copy or upload the skill to each surface you use.

## Known Limits

- A headless run logs in once. Switching personas inside one run is not supported; split the scenario per persona if you need it.
- `sf data import tree` is not idempotent. `prepare-org.sh` refuses a second import unless you pass `--reimport`; delete the demo records first.
- Salesforce UI labels differ between orgs and releases. The Communications Cloud example uses illustrative, unverified locators until a run against your org confirms them.
