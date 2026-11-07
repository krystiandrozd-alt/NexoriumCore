---
name: wiki-ingest
description: Ingest a source into the Nexorium Core knowledge wiki (knowledge/wiki). Use when the user adds a file to knowledge/raw/ or asks to ingest, re-ingest or refresh a repository document (CLAUDE.md, docs/, prisma/schema.prisma, code) into the wiki.
argument-hint: "<source path>"
disable-model-invocation: true
---

Ingest `$ARGUMENTS` into the Nexorium Core knowledge wiki.

1. Read `knowledge/CLAUDE.md` in full. It is the schema: follow its Ingest workflow and claim rules exactly.
2. Read `knowledge/wiki/index.md`, then the pages the source is likely to affect.
3. Get the source entry to cite: `npm run wiki:lint -- --hash <path>`.
4. For a file under `knowledge/raw/`, check it for confidential content first (schema: confidentiality). Stop and ask when in doubt.
5. Follow the Ingest steps. Record every conflict with existing pages in `knowledge/wiki/contradictions.md`; never resolve a conflict yourself.
6. Run `npm run wiki:lint` until it reports 0 errors.
7. Report: pages created, pages updated, contradictions opened, open questions.

If no path was given, list the raw files that the lint reports as `raw-not-ingested` and ask which one to ingest.
