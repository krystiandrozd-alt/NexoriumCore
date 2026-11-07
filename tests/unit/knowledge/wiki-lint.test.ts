// @vitest-environment node
// Nexorium Core - Knowledge wiki lint: unit tests
// Pure core only: in-memory fixtures, no filesystem, git or network access.

import { describe, expect, it } from 'vitest';
import {
  formatReport,
  gitBlobId,
  lintWiki,
  type Finding,
  type LintInput,
} from '../../../scripts/wiki/lint-core';

// ============================================
// FIXTURES
// ============================================

type Files = Record<string, string>;

const encoder = new TextEncoder();
const SCHEMA_PATH = 'prisma/schema.prisma';
const SCHEMA_TEXT = 'model Environment {\n  id String @id @default(uuid())\n}\n';
const blobOf = (text: string) => gitBlobId(encoder.encode(text)).slice(0, 12);

interface Source {
  path: string;
  blob: string;
}

const SCHEMA_SOURCE: Source = { path: SCHEMA_PATH, blob: blobOf(SCHEMA_TEXT) };

/** Frontmatter plus "# Title"; body text appended by the caller starts on line 12 when there is one source. */
function page(title: string, type: string, sources: Source[] = [SCHEMA_SOURCE], extra: string[] = []): string {
  const sourceLines = sources.flatMap((s) => [`  - path: ${s.path}`, `    blob: "${s.blob}"`]);
  return [
    '---',
    `title: ${title}`,
    `type: ${type}`,
    `summary: ${title} summary.`,
    ...(sources.length > 0 ? ['sources:', ...sourceLines] : []),
    ...extra,
    'updated: 2026-11-07',
    '---',
    '',
    `# ${title}`,
    '',
  ].join('\n');
}

function validWiki(): Files {
  return {
    'knowledge/CLAUDE.md': '# Schema\n',
    'knowledge/raw/README.md': '# Raw sources\n',
    'knowledge/wiki/index.md': [
      '# Index',
      '',
      '- [Overview](overview.md)',
      '- [Contradictions](contradictions.md)',
      '- [Log](log.md)',
      '- [Environment](entities/environment.md)',
      '- [Prisma schema](sources/prisma-schema.md)',
      '',
    ].join('\n'),
    'knowledge/wiki/log.md': '# Log\n\n## [2026-11-01] schema | Wiki created\n\n## [2026-11-07] ingest | Prisma schema\n',
    'knowledge/wiki/overview.md': page('Overview', 'overview') + 'See [Environment](entities/environment.md) and C-001.\n',
    'knowledge/wiki/contradictions.md':
      page('Contradictions', 'register') +
      '## C-001: Example conflict\n- **Status:** open\n- **Pages:** [Environment](entities/environment.md)\n',
    'knowledge/wiki/entities/environment.md':
      page('Environment', 'entity') +
      'Defined in [the schema page](../sources/prisma-schema.md); code: [schema.prisma](../../../prisma/schema.prisma).\n',
    'knowledge/wiki/sources/prisma-schema.md':
      page('Prisma schema', 'source') + 'Defines [Environment](../entities/environment.md).\n',
  };
}

const TEXT_FILE = /\.(md|txt|csv|json|ya?ml)$/;

function lint(knowledge: Files, repo: Files = { [SCHEMA_PATH]: SCHEMA_TEXT }) {
  const all: Files = { ...repo, ...knowledge };
  const input: LintInput = {
    files: Object.entries(knowledge)
      .filter(([p]) => TEXT_FILE.test(p))
      .map(([path, content]) => ({ path, content })),
    knowledgePaths: Object.keys(knowledge).sort(),
    readRepoFile: (p) => (p in all ? encoder.encode(all[p]) : null),
    pathExists: (p) => p in all || Object.keys(all).some((k) => k.startsWith(`${p}/`)),
  };
  return lintWiki(input);
}

function rules(findings: Finding[], severity: 'error' | 'warning'): string[] {
  return findings.filter((f) => f.severity === severity).map((f) => f.rule);
}

function withIndexEntry(files: Files, line: string): Files {
  return { ...files, 'knowledge/wiki/index.md': `${files['knowledge/wiki/index.md']}${line}\n` };
}

// ============================================
// BLOB IDS
// ============================================

describe('gitBlobId', () => {
  it('matches git hash-object', () => {
    expect(gitBlobId(encoder.encode('hello\n'))).toBe('ce013625030ba8dba906f756967f9e9ca394464a');
    expect(gitBlobId(new Uint8Array())).toBe('e69de29bb2d1d6434b8b29ae775ad8c2e48c5391');
  });

  it('hashes CRLF text like LF text (Windows checkouts)', () => {
    expect(gitBlobId(encoder.encode('a\r\nb\r\n'))).toBe(gitBlobId(encoder.encode('a\nb\n')));
  });

  it('does not normalise binary content', () => {
    const binary = new Uint8Array([0x00, 0x0d, 0x0a, 0x41]);
    expect(gitBlobId(binary)).not.toBe(gitBlobId(new Uint8Array([0x00, 0x0a, 0x41])));
  });
});

// ============================================
// LINT
// ============================================

describe('lintWiki', () => {
  it('accepts a valid wiki without findings', () => {
    const result = lint(validWiki());
    expect(result.findings).toEqual([]);
    expect(result.stats).toEqual({ pages: 6, sourcesCited: 4, registerEntries: 1, openEntries: 1 });
  });

  it('is deterministic and lists errors before warnings', () => {
    const files = validWiki();
    files['knowledge/wiki/entities/environment.md'] += '[gone](../concepts/missing.md)\n';
    files['knowledge/wiki/overview.md'] += 'Contact: someone@example.com\n';
    const first = lint(files);
    expect(lint(files)).toEqual(first);
    expect(first.findings.map((f) => f.severity)).toEqual(['error', 'warning']);
  });

  describe('frontmatter', () => {
    it('requires frontmatter on pages other than index.md and log.md', () => {
      const files = validWiki();
      files['knowledge/wiki/entities/environment.md'] = '# Environment\n\n[Schema](../sources/prisma-schema.md)\n';
      expect(rules(lint(files).findings, 'error')).toEqual(['frontmatter-missing']);
    });

    it('rejects unknown page types', () => {
      const files = validWiki();
      files['knowledge/wiki/entities/environment.md'] = page('Environment', 'thing') + '[S](../sources/prisma-schema.md)\n';
      const errors = lint(files).findings.filter((f) => f.severity === 'error');
      expect(errors.map((f) => f.rule)).toEqual(['frontmatter-invalid']);
      expect(errors[0].message).toMatch(/^type:/);
    });

    it('requires sources except on analysis pages', () => {
      const files = validWiki();
      files['knowledge/wiki/entities/environment.md'] = page('Environment', 'entity', []) + '[S](../sources/prisma-schema.md)\n';
      const errors = lint(files).findings.filter((f) => f.severity === 'error');
      expect(errors.map((f) => f.rule)).toEqual(['frontmatter-invalid']);
      expect(errors[0].message).toMatch(/^sources:/);

      const withAnalysis = withIndexEntry(validWiki(), '- [Q](analyses/question.md)');
      withAnalysis['knowledge/wiki/analyses/question.md'] = page('Question', 'analysis', []) + 'Answer.\n';
      withAnalysis['knowledge/wiki/overview.md'] += '[Q](analyses/question.md)\n';
      expect(lint(withAnalysis).findings).toEqual([]);
    });

    it('validates blob ids, dates and unknown keys', () => {
      const files = validWiki();
      files['knowledge/wiki/entities/environment.md'] =
        page('Environment', 'entity', [{ path: SCHEMA_PATH, blob: 'XYZ' }], ['owner: someone']).replace(
          'updated: 2026-11-07',
          'updated: 2026-02-30'
        ) + '[S](../sources/prisma-schema.md)\n';
      const messages = lint(files).findings.filter((f) => f.rule === 'frontmatter-invalid').map((f) => f.message);
      expect(messages).toHaveLength(3);
      expect(messages.some((m) => m.startsWith('sources.0.blob'))).toBe(true);
      expect(messages.some((m) => m.startsWith('updated'))).toBe(true);
    });

    it('reports YAML that does not parse', () => {
      const files = validWiki();
      files['knowledge/wiki/entities/environment.md'] = '---\ntitle: [unclosed\n---\n\n[S](../sources/prisma-schema.md)\n';
      const errors = lint(files).findings.filter((f) => f.severity === 'error');
      expect(errors.map((f) => f.rule)).toEqual(['frontmatter-invalid']);
      expect(errors[0].message).toMatch(/YAML does not parse/);
    });

    it('rejects source paths that leave the repository', () => {
      const files = validWiki();
      files['knowledge/wiki/entities/environment.md'] =
        page('Environment', 'entity', [{ path: '../secrets.txt', blob: 'abcdef1' }]) + '[S](../sources/prisma-schema.md)\n';
      expect(rules(lint(files).findings, 'error')).toEqual(['frontmatter-invalid']);
    });
  });

  describe('structure', () => {
    it('enforces the page type of each folder', () => {
      const files = validWiki();
      files['knowledge/wiki/entities/environment.md'] = page('Environment', 'concept') + '[S](../sources/prisma-schema.md)\n';
      expect(rules(lint(files).findings, 'error')).toEqual(['type-folder-mismatch']);
    });

    it('rejects unknown folders and non-kebab-case file names', () => {
      const files = withIndexEntry(withIndexEntry(validWiki(), '- [X](misc/x.md)'), '- [Y](entities/Bad_Name.md)');
      files['knowledge/wiki/misc/x.md'] = page('X', 'entity') + '[S](../sources/prisma-schema.md)\n';
      files['knowledge/wiki/entities/Bad_Name.md'] = page('Y', 'entity') + '[S](../sources/prisma-schema.md)\n';
      files['knowledge/wiki/overview.md'] += '[X](misc/x.md) [Y](entities/Bad_Name.md)\n';
      const errors = rules(lint(files).findings, 'error');
      expect(errors).toContain('unknown-folder');
      expect(errors).toContain('file-name');
    });

    it('requires index.md and log.md', () => {
      const files = validWiki();
      delete files['knowledge/wiki/index.md'];
      delete files['knowledge/wiki/log.md'];
      const errors = rules(lint(files).findings, 'error');
      expect(errors).toContain('index-missing');
      expect(errors).toContain('log-missing');
    });
  });

  describe('links', () => {
    it('reports broken links inside knowledge/ with their line', () => {
      const files = validWiki();
      files['knowledge/wiki/entities/environment.md'] = page('Environment', 'entity') + '[Missing](../concepts/missing.md)\n';
      const finding = lint(files).findings.find((f) => f.rule === 'broken-link');
      expect(finding).toMatchObject({ severity: 'error', file: 'knowledge/wiki/entities/environment.md', line: 12 });
    });

    it('ignores links in code, external links and same-page anchors', () => {
      const files = validWiki();
      files['knowledge/wiki/entities/environment.md'] +=
        '```md\n[x](nope.md)\n```\n`[y](nope.md)` [web](https://example.org) [mail](mailto:x) [top](#environment)\n';
      expect(lint(files).findings).toEqual([]);
    });

    it('accepts anchors and titles on existing targets', () => {
      const files = validWiki();
      files['knowledge/wiki/entities/environment.md'] += '[Sec](../sources/prisma-schema.md#defines "title")\n';
      expect(lint(files).findings).toEqual([]);
    });

    it('rejects absolute links and links that leave the repository', () => {
      const files = validWiki();
      files['knowledge/wiki/entities/environment.md'] += '[a](/README.md) [b](../../../../outside.md)\n';
      const errors = rules(lint(files).findings, 'error');
      expect(errors).toEqual(['absolute-link', 'link-outside-repo']);
    });

    it('warns on dangling links to repository files outside knowledge/', () => {
      const files = validWiki();
      files['knowledge/wiki/entities/environment.md'] += '[gone](../../../src/removed.ts)\n';
      expect(rules(lint(files).findings, 'warning')).toEqual(['dangling-repo-link']);
      expect(rules(lint(files).findings, 'error')).toEqual([]);
    });

    it('requires every page in index.md', () => {
      const files = validWiki();
      files['knowledge/wiki/index.md'] = files['knowledge/wiki/index.md'].replace('- [Log](log.md)\n', '');
      expect(lint(files).findings).toMatchObject([{ rule: 'not-in-index', file: 'knowledge/wiki/log.md' }]);
    });

    it('warns on orphan pages; links from index.md and log.md do not count', () => {
      const files = validWiki();
      files['knowledge/wiki/log.md'] += '\nSee [Prisma schema](sources/prisma-schema.md).\n';
      files['knowledge/wiki/entities/environment.md'] = page('Environment', 'entity') + 'No links.\n';
      expect(lint(files).findings).toMatchObject([
        { severity: 'warning', rule: 'orphan-page', file: 'knowledge/wiki/sources/prisma-schema.md' },
      ]);
    });
  });

  describe('log', () => {
    it('validates entry headers', () => {
      const files = validWiki();
      files['knowledge/wiki/log.md'] += '\n## 2026-11-08 ingest - wrong\n\n## [2026-11-08] deploy | not an operation\n';
      expect(rules(lint(files).findings, 'error')).toEqual(['log-format', 'log-format']);
    });

    it('rejects impossible dates and out-of-order entries', () => {
      const files = validWiki();
      files['knowledge/wiki/log.md'] += '\n## [2026-02-30] lint | impossible\n\n## [2026-10-01] lint | earlier\n';
      expect(rules(lint(files).findings, 'error')).toEqual(['log-format', 'log-order']);
    });

    it('accepts inline code in entry titles', () => {
      const files = validWiki();
      files['knowledge/wiki/log.md'] += '\n## [2026-11-08] refresh | `prisma/schema.prisma`\n';
      expect(lint(files).findings).toEqual([]);
    });
  });

  describe('contradictions register', () => {
    it('requires a status line per entry', () => {
      const files = validWiki();
      files['knowledge/wiki/contradictions.md'] += '\n## C-002: No status\n- **Severity:** low\n';
      expect(lint(files).findings).toMatchObject([{ rule: 'register-status', line: 16 }]);
    });

    it('rejects duplicate and malformed entry headings', () => {
      const files = validWiki();
      files['knowledge/wiki/contradictions.md'] +=
        '\n## C-001: Again\n- **Status:** open\n\n## C-02: Short id\n- **Status:** open\n\n## Legend\nAllowed.\n';
      expect(rules(lint(files).findings, 'error')).toEqual(['register-duplicate', 'register-format']);
    });

    it('rejects references to unknown entries but ignores code', () => {
      const files = validWiki();
      files['knowledge/wiki/overview.md'] += 'See C-999. `C-998` is an example.\n';
      expect(lint(files).findings).toMatchObject([{ rule: 'unknown-contradiction', message: 'C-999 is not in contradictions.md' }]);
    });

    it('counts open entries', () => {
      const files = validWiki();
      files['knowledge/wiki/contradictions.md'] += '\n## C-002: Fixed\n- **Status:** resolved\n';
      expect(lint(files).stats).toMatchObject({ registerEntries: 2, openEntries: 1 });
    });
  });

  describe('provenance', () => {
    it('warns when a repository source changed since ingest', () => {
      const result = lint(validWiki(), { [SCHEMA_PATH]: `${SCHEMA_TEXT}model Host {}\n` });
      expect(rules(result.findings, 'warning')).toEqual(['stale-source', 'stale-source', 'stale-source', 'stale-source']);
      expect(rules(result.findings, 'error')).toEqual([]);
    });

    it('warns when a repository source is missing', () => {
      const files = validWiki();
      files['knowledge/wiki/entities/environment.md'] = files['knowledge/wiki/entities/environment.md'].replace(
        '(../../../prisma/schema.prisma)',
        '(../sources/prisma-schema.md)'
      );
      const result = lint(files, {});
      expect(new Set(rules(result.findings, 'warning'))).toEqual(new Set(['source-missing']));
      expect(rules(result.findings, 'error')).toEqual([]);
    });

    it('treats raw sources as immutable', () => {
      const rawPath = 'knowledge/raw/2026-11-07-standup.md';
      const files = withIndexEntry(validWiki(), '- [Standup](sources/standup.md)');
      files[rawPath] = 'Decision: keep Node/Edge until migration.\n';
      files['knowledge/wiki/sources/standup.md'] =
        page('Standup', 'source', [{ path: rawPath, blob: blobOf(files[rawPath]) }]) + 'About [Environment](../entities/environment.md).\n';
      files['knowledge/wiki/entities/environment.md'] += '[Standup](../sources/standup.md)\n';
      expect(lint(files).findings).toEqual([]);

      files[rawPath] = 'Decision: drop Node/Edge now.\n';
      expect(rules(lint(files).findings, 'error')).toEqual(['raw-source-modified']);

      delete files[rawPath];
      expect(rules(lint(files).findings, 'error')).toEqual(['source-missing']);
    });

    it('warns on raw files that no page cites yet, including binary files', () => {
      const files = { ...validWiki(), 'knowledge/raw/vendor-deck.pdf': '%PDF-1.7' };
      expect(lint(files).findings).toMatchObject([
        { severity: 'warning', rule: 'raw-not-ingested', file: 'knowledge/raw/vendor-deck.pdf' },
      ]);
    });
  });

  it('warns on possible e-mail addresses anywhere in knowledge/', () => {
    const files: Files = { ...validWiki(), 'knowledge/raw/notes.txt': 'line one\nmail jane.doe@client.example\n' };
    const emails = lint(files).findings.filter((f) => f.rule === 'possible-email');
    expect(emails).toMatchObject([{ severity: 'warning', file: 'knowledge/raw/notes.txt', line: 2 }]);
  });

  it('formats a readable report', () => {
    const files = validWiki();
    files['knowledge/wiki/entities/environment.md'] += '[gone](../concepts/missing.md)\n';
    const report = formatReport(lint(files));
    expect(report).toContain('Wiki lint: 6 pages, 4 source citations, 1 register entries (1 open)');
    expect(report).toContain('ERROR  broken-link');
    expect(report).toContain('knowledge/wiki/entities/environment.md:13');
    expect(report.endsWith('1 error(s), 0 warning(s)')).toBe(true);
  });
});
