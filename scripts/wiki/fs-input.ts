// Nexorium Core - Knowledge wiki lint (filesystem adapter)
//
// Reads knowledge/ from disk into the pure LintInput used by lint-core.ts.
// Shared by the CLI and the integrity test so both check the same thing.

import fs from 'node:fs';
import path from 'node:path';
import { isTextPath, KNOWLEDGE_ROOT, type LintInput } from './lint-core';

/** Repo-relative paths (forward slashes) of the files under a directory. Skips dot entries such as .obsidian/. */
function listFiles(repoRoot: string, relativeDir: string): string[] {
  const absolute = path.join(repoRoot, relativeDir);
  if (!fs.existsSync(absolute)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const child = `${relativeDir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...listFiles(repoRoot, child));
    else if (entry.isFile()) out.push(child);
  }
  return out.sort();
}

export function loadLintInput(repoRoot: string): LintInput {
  const knowledgePaths = listFiles(repoRoot, KNOWLEDGE_ROOT);
  const files = knowledgePaths
    .filter(isTextPath)
    .map((p) => ({ path: p, content: fs.readFileSync(path.join(repoRoot, p), 'utf8') }));

  return {
    files,
    knowledgePaths,
    readRepoFile: (repoPath) => {
      const absolute = path.join(repoRoot, repoPath);
      try {
        return fs.statSync(absolute).isFile() ? fs.readFileSync(absolute) : null;
      } catch {
        return null;
      }
    },
    pathExists: (repoPath) => fs.existsSync(path.join(repoRoot, repoPath)),
  };
}
