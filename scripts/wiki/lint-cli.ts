// Nexorium Core - Knowledge wiki lint (CLI)
//
// Run from the repository root:
//   npm run wiki:lint                       check knowledge/; exit 1 when there are errors
//   npm run wiki:lint -- --hash <path>...   print the frontmatter source entry for each file

import fs from 'node:fs';
import path from 'node:path';
import { formatReport, gitBlobId, KNOWLEDGE_ROOT, lintWiki } from './lint-core';
import { loadLintInput } from './fs-input';

const BLOB_PREFIX_LENGTH = 12;

const USAGE = `Usage:
  npm run wiki:lint                      Check knowledge/ (schema: knowledge/CLAUDE.md)
  npm run wiki:lint -- --hash <path>...  Print the source entry to cite for each repo file`;

function printSourceEntries(repoRoot: string, paths: string[]): number {
  if (paths.length === 0) {
    console.error(USAGE);
    return 2;
  }
  let status = 0;
  for (const given of paths) {
    const absolute = path.resolve(repoRoot, given);
    const relative = path.relative(repoRoot, absolute).split(path.sep).join('/');
    if (relative.startsWith('..') || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
      console.error(`not a file inside the repository: ${given}`);
      status = 2;
      continue;
    }
    const blob = gitBlobId(fs.readFileSync(absolute)).slice(0, BLOB_PREFIX_LENGTH);
    console.log(`  - path: ${relative}\n    blob: "${blob}"`);
  }
  return status;
}

function main(argv: string[]): number {
  const repoRoot = process.cwd();
  if (argv[0] === '--hash') return printSourceEntries(repoRoot, argv.slice(1));
  if (argv.length > 0) {
    console.log(USAGE);
    return argv.includes('--help') || argv.includes('-h') ? 0 : 2;
  }
  if (!fs.existsSync(path.join(repoRoot, KNOWLEDGE_ROOT))) {
    console.error(`${KNOWLEDGE_ROOT}/ not found. Run from the repository root.`);
    return 2;
  }
  const result = lintWiki(loadLintInput(repoRoot));
  console.log(formatReport(result));
  return result.findings.some((f) => f.severity === 'error') ? 1 : 0;
}

process.exitCode = main(process.argv.slice(2));
