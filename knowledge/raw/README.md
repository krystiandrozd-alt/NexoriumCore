# knowledge/raw — external sources

Immutable inputs for the wiki. Claude reads these files and never edits them. Schema: [knowledge/CLAUDE.md](../CLAUDE.md).

## Before you add a file

This repository is public. Add only material that may be published:

- public articles, standards excerpts you are allowed to share, your own sanitized notes;
- no client names, contract or pricing details, personal data, credentials or internal hostnames.

Sanitize identifiers first ("Tier-1 EU telco"). If sanitizing removes the value, keep the source out of this repository.

## Naming

`YYYY-MM-DD-short-slug.ext`, for example `2026-11-07-oda-component-notes.md`. Markdown or plain text works best; PDFs and images are fine.

## Then

Run `/wiki-ingest knowledge/raw/<file>` in Claude Code. `npm run wiki:lint` lists raw files that no wiki page cites yet (`raw-not-ingested`).

## Rules

- Do not edit a file after it is committed. To correct a source, add a new dated file and ingest it; the wiki records which source supersedes which.
- Wiki pages cite each raw file by its blob id. The lint fails when a cited raw file changes or disappears.
