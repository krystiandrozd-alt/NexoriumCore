# CLAUDE.md — Nexorium Core knowledge wiki (schema)

This file is the schema for `knowledge/`. It defines how the wiki is structured and which workflows Claude follows when ingesting sources, answering questions and maintaining pages. Root `CLAUDE.md` rules still apply.

Pattern: "LLM Wiki" by Andrej Karpathy (https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), instantiated for a codebase.

<purpose>
The wiki compiles what is known about Nexorium Core — product intent, domain model, implementation state, decisions and open contradictions — into interlinked pages that are kept current. It answers "what is true about Nexorium Core, and where does that claim come from?" without re-reading the repository each time.

The wiki is derived knowledge. It never overrides its sources: root `CLAUDE.md`, the code and `prisma/schema.prisma` remain the sources of truth. When the wiki and a source disagree, the source wins and the wiki page is stale.
</purpose>

<confidentiality>
This repository is PUBLIC. Everything under `knowledge/` is published.

- Never add client names, deal or contract details, pricing, personal data, credentials, internal hostnames or unpublished partner material — not in `raw/`, not in `wiki/`.
- Sanitize before ingesting: replace identifiers with neutral descriptions ("Tier-1 EU telco", "BSS vendor A").
- If a source cannot be sanitized without losing its value, do not ingest it here. It belongs in a private knowledge base.
- The lint warns on e-mail addresses. Treat that warning as a stop sign, not as noise.
</confidentiality>

<layers>
| Layer | Location | Owner | Rule |
|-------|----------|-------|------|
| Sources | Repository files (code, docs, schema, root `CLAUDE.md`) and `knowledge/raw/` | Humans | Claude reads sources and does not edit them as part of a wiki operation. Files in `raw/` are immutable once committed. |
| Wiki | `knowledge/wiki/` | Claude | Claude writes and maintains every page. Humans review changes through pull request diffs. |
| Schema | `knowledge/CLAUDE.md` (this file) | Human and Claude | Co-evolved. Change it when a workflow proves wrong, and log the change. |
</layers>

<layout>
```
knowledge/
├── CLAUDE.md              # this schema
├── raw/                   # external sources, immutable, sanitized (see raw/README.md)
└── wiki/
    ├── index.md           # catalog of every page (content-oriented); read it first
    ├── log.md             # append-only record of operations (chronological)
    ├── overview.md        # type: overview  — the synthesis
    ├── glossary.md        # type: glossary  — vocabulary map across sources
    ├── contradictions.md  # type: register  — C-### entries
    ├── sources/           # type: source    — one page per ingested source
    ├── entities/          # type: entity    — domain objects (Environment, Connection, ...)
    ├── concepts/          # type: concept   — cross-cutting ideas (drift, readiness, ...)
    ├── decisions/         # type: decision  — decisions found in sources or taken by the user
    └── analyses/          # type: analysis  — answers filed back from queries
```

- File names are kebab-case `.md`. The folder determines the page type; the lint enforces it.
- Create `decisions/` and `analyses/` when the first page of that type is written.
</layout>

<page_format>
Every page except `index.md` and `log.md` starts with YAML frontmatter:

```yaml
---
title: Component instance (Deployment)
type: entity
summary: One line. index.md repeats it.
aliases: [Deployment]        # optional
tags: [canonical-model]      # optional
sources:                     # required on every type except analysis
  - path: prisma/schema.prisma
    blob: "1a2b3c4d5e6f"
updated: 2026-11-07
---
```

- `blob` is the git blob id of the exact content that was read. It pins every claim on the page to that content. Print ready-to-paste entries with `npm run wiki:lint -- --hash <path>...` (`git hash-object <path>` gives the same id). Quote it.
- Body: `# Title`, then content. Keep pages short; split a page that grows past about 150 lines.
- Links: relative markdown links only, for example `[Environment](../entities/environment.md)`. No `[[wikilinks]]`: the repository is also read on GitHub.
- Link code with repo-relative links and name the symbol, for example `` [`BaseConnectorV2.run()`](../../../src/lib/connectors/v2/base-connector.ts) ``. Do not cite line numbers; they rot.
- Obsidian works as a viewer: open the repository root (or `knowledge/`) as a vault, and set new links to relative paths.
</page_format>

<claim_rules>
The wiki feeds client-facing work. Accuracy rules:

1. Every factual claim traces to a source in the page frontmatter. Name the section, rule or symbol.
2. Label inference. Start the sentence with **Inference:**. Never present inference as fact.
3. Quote requirement text verbatim when the wording matters (invariants, rules, definitions).
4. Never invent TM Forum API numbers, Salesforce object or API names, release names, licensing details or figures. If no source states it, the wiki does not state it.
5. Absence claims ("nothing calls X") state their scope and the commit, for example: "no reference under `src/` at commit `40ab818`".
6. Record contradictions; never resolve them silently. Add a `C-###` entry to `contradictions.md` and link it from every affected page. Resolving an entry is the user's decision.
7. No hidden corrections: never update a `blob` without re-reading the source and revising the claims that depend on it.
</claim_rules>

<workflows>
### Ingest — `/wiki-ingest <path>`
1. Confirm the source. Repository files can be ingested in place. External material must first be saved, sanitized, in `knowledge/raw/` (see `raw/README.md`). Never edit a raw file after it is committed.
2. Read the source in full and get its blob id.
3. When the user is in the session, share the key takeaways and the planned page changes before writing. In unattended runs, proceed and report afterwards.
4. Write or update the source page in `sources/`.
5. Update every affected entity, concept and decision page. Create pages for important new entities or concepts. A typical ingest touches 5 to 15 pages.
6. Compare the new claims with existing pages. Record conflicts in `contradictions.md` (claim rule 6).
7. Update `overview.md` if the synthesis changed, `glossary.md` for new terms, and `index.md` for new pages and changed summaries.
8. Append to `log.md`: `## [YYYY-MM-DD] ingest | <source title>`, listing pages touched and register entries opened.
9. Run `npm run wiki:lint` and fix every error.
10. Commit wiki changes separately from code changes.

### Query — `/wiki-query <question>`
1. Read `index.md`, then the relevant pages. Go to the sources only when pages are missing, insufficient or stale.
2. Answer with links to wiki pages and their sources. Label inference. State gaps.
3. If the answer is reusable (comparison, analysis, decision input), offer to file it as `analyses/<slug>.md`. If the user accepts: link it from related pages and `index.md`, and log it as `query`.

### Lint — `/wiki-lint`
1. Run `npm run wiki:lint` (deterministic checks below). Fix every error.
2. For each `stale-source` warning, run Refresh.
3. Semantic pass: contradictions between pages, claims superseded by newer sources, concepts mentioned without a page, missing cross-links, questions worth investigating, sources worth adding.
4. Report findings to the user, record contradictions, and append `## [YYYY-MM-DD] lint | <summary>`.

### Refresh — after sources change
1. See what changed: `git diff <cited-blob> <current-blob>` (the lint prints both ids).
2. Re-read the changed parts, revise the affected claims, update `blob` and `updated`.
3. Close register entries the change resolves (status `resolved`, with a one-line resolution) only when the source now clearly settles them.
4. Append `## [YYYY-MM-DD] refresh | <source>`.
</workflows>

<deterministic_lint>
`npm run wiki:lint` (code in `scripts/wiki/`) checks:

- Errors: missing or invalid frontmatter; page type not allowed in its folder; file name not kebab-case; broken link inside `knowledge/`; absolute link; link leaving the repository; page missing from `index.md`; missing `index.md` or `log.md`; malformed log header or out-of-order dates; malformed register entry, missing status or duplicate ID; reference to an unknown `C-###`; raw source changed or missing after ingest.
- Warnings: repository source changed since ingest (`stale-source`); cited repository file missing; dangling link to a repository file outside `knowledge/`; orphan page (no inbound links except from `index.md` and `log.md`); raw file not yet ingested; possible e-mail address.

`npm test` runs the same checks (`tests/integration/knowledge/wiki-integrity.test.ts`). Errors fail the suite; warnings do not, because code is expected to move ahead of the wiki between refreshes.
</deterministic_lint>

<conventions>
- Dates: ISO `YYYY-MM-DD`. Language: English. Tone: plain and declarative, per the root brand rules.
- Product terms: when CLAUDE.md vocabulary and Prisma model names differ, write the Prisma model in code font and give the CLAUDE.md term in prose. `glossary.md` holds the mapping.
- One page per entity or concept. Extend an existing page rather than create a near-duplicate.
- Register entries: `## C-###: <title>`, then `- **Status:** open|resolved|accepted`, `- **Severity:** high|medium|low`, the conflicting claims with sources, the assessment, the decision needed, and the affected pages.
- Severity: high = breaks an architectural invariant or data-integrity rule in root `CLAUDE.md`; medium = documented intent and implementation disagree on a feature; low = naming, documentation or tone.
- Log entries: `## [YYYY-MM-DD] <ingest|query|lint|refresh|schema> | <title>`. Newest last. `grep "^## \[" knowledge/wiki/log.md | tail -5` lists recent activity.
</conventions>
