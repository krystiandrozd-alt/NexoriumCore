---
name: wiki-query
description: Answer a question about Nexorium Core (product intent, domain model, pillars, invariants, implementation state, decisions, known contradictions) from the project knowledge wiki in knowledge/wiki, with citations. Use before reading the codebase from scratch for "what/why/where/how does Nexorium..." questions.
argument-hint: "<question>"
---

Answer: $ARGUMENTS

1. Read `knowledge/CLAUDE.md` (claim rules) and `knowledge/wiki/index.md`.
2. Read the relevant pages. Check `knowledge/wiki/contradictions.md` for open entries that affect the answer.
3. If a page is missing, thin or stale for this question (`npm run wiki:lint` lists stale sources), read the underlying sources and say that you did.
4. Answer first. Link the wiki pages and sources you used. Label inference. State gaps.
5. If the answer is reusable, offer to file it as `knowledge/wiki/analyses/<slug>.md` per the Query workflow. Write it only if the user agrees.
