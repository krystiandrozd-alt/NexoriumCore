# presales-demo-scenario-generate

A Claude skill, in the [forcedotcom/sf-skills](https://github.com/forcedotcom/sf-skills) layout, that keeps a demo scenario in one JSON file and generates everything else from it:

- an executive storyline, a presenter script and a technical runbook (Markdown)
- org-prep assets for the Salesforce CLI: sObject tree files, `prepare-org.sh`, `CHECKLIST.md`
- a headless Playwright run of the click path, with a report, screenshots and video

`SKILL.md` has the full reference. This page covers installation.

## Install

Custom skills do not sync across surfaces, so install the skill on each one you use.

| Where | How |
|---|---|
| Claude Code, one repository | Copy this folder to `<repo>/.claude/skills/presales-demo-scenario-generate/` and commit it. Cloud sessions on that repository load it too. |
| Claude Code, every project on your machine | Copy this folder to `~/.claude/skills/presales-demo-scenario-generate/`. |
| claude.ai | Upload the zip of this folder as a custom skill (Pro, Max, Ultra, Team and Enterprise plans, with code execution enabled). |

Then install the script dependencies once:

```bash
cd scripts
npm ci                                                   # ajv 8.20.0, handlebars 4.7.10, pinned by package-lock.json
npm i -D playwright && npx playwright install chromium   # for run and selftest, if Playwright is not installed yet
node demo.mjs selftest                                   # should end with: Headless run: PASSED
```

## Contents

```text
SKILL.md                              how Claude uses the skill
assets/demo-scenario.schema.json      JSON Schema (draft 2020-12) for scenario files
assets/scenario-template.json         skeleton to copy for a new demo
assets/prompts/generate-scenario.prompt.md   prompt: discovery brief → scenario JSON
assets/templates/*.md.hbs             Handlebars templates for the three layers
assets/examples/comms-b2b-quote-to-order/    Communications Cloud example, with rendered outputs and org-prep
assets/examples/local-selftest/       runnable example with a bundled local app (Polish labels)
scripts/demo.mjs                      CLI: validate, render, org-prep, run, all, selftest
```
