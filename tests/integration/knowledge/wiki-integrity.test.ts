// @vitest-environment node
// Nexorium Core - Knowledge wiki integrity
// Runs the deterministic wiki lint on the real knowledge/ tree. Errors fail the
// suite; warnings (for example a source that changed since ingest) do not.

import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadLintInput } from '../../../scripts/wiki/fs-input';
import { formatReport, lintWiki } from '../../../scripts/wiki/lint-core';

const repoRoot = path.resolve(__dirname, '../../..');

describe('knowledge wiki integrity', () => {
  it('has no lint errors (run npm run wiki:lint for the full report)', () => {
    const result = lintWiki(loadLintInput(repoRoot));
    const errors = result.findings.filter((f) => f.severity === 'error');
    expect(errors, formatReport(result)).toEqual([]);
  });
});
