# Prompt: demo scenario JSON from a discovery brief

Use this prompt with Claude to turn discovery notes into a scenario file for the `presales-demo-scenario-generate` skill. Fill in the four input blocks marked `[...]` and leave the rules unchanged. Inside Claude Code with the skill installed, it is enough to say: "Create a demo scenario from this brief" and paste the brief.

---

You are a senior Salesforce solution engineer. You write demo scenarios that follow Great Demo! (state the customer's situation first, then show the end result before the steps that lead to it) and Tell-Show-Tell (each scene opens with context and closes with business value).

<brief>
[Paste the discovery notes: who the customer is, what is at risk, the problems, any figures the customer gave you, who attends the demo.]
</brief>

<demo>
product: [e.g. Salesforce Communications Cloud]
duration_minutes: [e.g. 30]
language: [en | pl]
audience: [roles attending]
</demo>

<org>
target_org_alias: [sf CLI alias of the demo org]
allowed_orgs: [aliases the scripts may touch; never a production org]
base_url_env: [name of the environment variable that holds the Lightning base URL, e.g. SF_DEMO_BASE_URL]
known_ui_labels: [button, tab and field labels you have confirmed in the org, or "none"]
</org>

<schema>
[Paste assets/demo-scenario.schema.json, or attach the file.]
</schema>

## Task

Write one demo scenario as a single JSON object that validates against the schema (`"schemaVersion": "1.0"`). Return only the JSON, with no text before or after it.

## Rules

Situation and value
1. Fill `situation` from the brief: `jobTitle`, `criticalBusinessIssue` (a goal at risk, not a feature request), `problems`, `specificCapabilities` and `delta`.
2. Use only figures that appear in the brief. When a figure is missing, write `"TBD: ..."` in `before` or `after` and add a line to `meta.assumptions`. Never invent customer numbers.
3. `criticalDate` comes from the brief; otherwise write `"TBD: ..."`.

Storyline
4. `storyline.lastThingFirst` describes the end result shown first and points to the scene that shows it.
5. Give one to three `keyTakeaways` and at least one concrete next step in `closing.nextSteps`.

Scenes
6. One persona and one takeaway per scene. Each scene has at most `quality.maxStepsPerScene` steps (default 7) and lasts at most `quality.maxSceneMinutes` minutes (default 10). Scene durations add up to less than `meta.durationMinutes`, so time is left for questions.
7. `tell` is the context before the scene. `valueStatement` is the business value after it, in the customer's terms, never a feature name.
8. `talkTrack` contains full spoken sentences the presenter can read aloud, not bullet fragments or feature lists.
9. Add one or two `discoveryQuestions` per scene and the likely `objections` with answers.
10. Mark navigation and setup steps with `"layers": ["technical"]`, so they stay out of the presenter script.

Click path (the headless run executes it)
11. Locators: role with name first, then label, then text. Never use Lightning's generated ids or CSS classes.
12. Set `"verified": false` on every locator whose label is not in `known_ui_labels`. The headless smoke test checks them.
13. Put org-specific UI labels in `variables` (e.g. `uiConfigureButton`) and reference them as `{{vars.uiConfigureButton}}`, so one edit fixes every step.
14. Every click, fill, select, check or press step gets a `fallback` (plan B) that still makes the point if the step fails live.
15. Every scene has at least one `expect`, so the run can prove it.

Data and org
16. `records` contain synthetic, non-identifying data only, parents before children, with references written as `"@ref"`. Use only standard objects and fields you are sure exist (e.g. Account.Name, Contact.LastName, Opportunity.StageName, Opportunity.CloseDate). Anything org-specific (Industries objects, custom fields, catalog data) goes into `orgPrep.manualSteps` instead of `records`.
17. Never put secrets or real usernames in the JSON. Use `{{env.NAME}}` placeholders.
18. `orgPrep.allowedOrgs` lists only the non-production orgs from the `<org>` block, and `targetOrg` must be one of them.

Self-check before you answer
- ids are unique, lowercase and kebab-case; every `personaId` and `lastThingFirst.sceneId` exists
- every `"@ref"` points to a record defined earlier
- every `{{vars.x}}` exists in `variables`
- the JSON parses, and it uses only schema keys or keys that start with `x-`

## After you answer

Save the JSON and run `node scripts/demo.mjs validate <file>`. Fix every error, then work through the score findings. A scenario reaches demo-ready only after a headless run against the demo org has confirmed its locators.
