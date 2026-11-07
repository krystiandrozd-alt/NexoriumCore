// Nexorium Core - Knowledge wiki lint (pure core)
//
// Deterministic integrity checks for knowledge/ (schema: knowledge/CLAUDE.md).
// No filesystem, git or network access: callers pass file contents in, so the
// same checks run in the CLI (scripts/wiki/lint-cli.ts) and in Vitest.
//
// Provenance is content-addressed: every cited source carries the git blob id
// of the exact content that was read. A page is stale when the blob id of the
// current file differs. This needs no git history, so it also works in shallow
// CI clones and after squash merges.

import { createHash } from 'node:crypto';
import path from 'node:path';
import yaml from 'js-yaml';
import { z } from 'zod';

const posix = path.posix;

// ============================================
// CONSTANTS
// ============================================

export const KNOWLEDGE_ROOT = 'knowledge';
export const WIKI_ROOT = `${KNOWLEDGE_ROOT}/wiki`;
export const RAW_ROOT = `${KNOWLEDGE_ROOT}/raw`;
export const INDEX_PAGE = `${WIKI_ROOT}/index.md`;
export const LOG_PAGE = `${WIKI_ROOT}/log.md`;
export const REGISTER_PAGE = `${WIKI_ROOT}/contradictions.md`;
const RAW_README = `${RAW_ROOT}/README.md`;

export const PAGE_TYPES = [
  'overview',
  'glossary',
  'register',
  'source',
  'entity',
  'concept',
  'decision',
  'analysis',
] as const;
export type PageType = (typeof PAGE_TYPES)[number];

/** Wiki sub-folder → page types allowed in it. '' is the wiki root. */
const FOLDER_TYPES: Readonly<Record<string, readonly PageType[]>> = {
  '': ['overview', 'glossary', 'register'],
  sources: ['source'],
  entities: ['entity'],
  concepts: ['concept'],
  decisions: ['decision'],
  analyses: ['analysis'],
};

export const LOG_OPERATIONS = ['ingest', 'query', 'lint', 'refresh', 'schema'] as const;
export const REGISTER_STATUSES = ['open', 'resolved', 'accepted'] as const;

const TEXT_EXTENSIONS = new Set(['.md', '.markdown', '.txt', '.csv', '.json', '.yaml', '.yml']);
const PAGE_FILE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const LOG_HEADER = new RegExp(
  `^## \\[(\\d{4}-\\d{2}-\\d{2})\\] (${LOG_OPERATIONS.join('|')}) \\| \\S.*$`
);
const REGISTER_HEADER = /^## (C-\d{3}): \S.*$/;
const REGISTER_STATUS = new RegExp(`^- \\*\\*Status:\\*\\* (${REGISTER_STATUSES.join('|')})\\b`);
const CONTRADICTION_REF = /\bC-\d{3}\b/g;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;

// ============================================
// FRONTMATTER SCHEMA
// ============================================

const repoPath = z
  .string()
  .min(1)
  .refine(
    (p) => !p.startsWith('/') && !p.includes('\\') && !p.split('/').includes('..'),
    'must be a repo-relative path with forward slashes and no ".."'
  );

const blobId = z
  .string()
  .regex(/^[0-9a-f]{7,40}$/, 'must be 7-40 lowercase hex characters (git blob id)');

export const sourceRefSchema = z.strictObject({
  path: repoPath,
  blob: blobId,
});

export const frontmatterSchema = z
  .strictObject({
    title: z.string().min(1),
    type: z.enum(PAGE_TYPES),
    summary: z.string().min(1).max(240),
    aliases: z.array(z.string().min(1)).optional(),
    tags: z.array(z.string().min(1)).optional(),
    sources: z.array(sourceRefSchema).optional(),
    updated: z.string().refine(isIsoDate, 'must be a valid date in YYYY-MM-DD format'),
  })
  .superRefine((fm, ctx) => {
    if (fm.type !== 'analysis' && (fm.sources ?? []).length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['sources'],
        message: `at least one source is required for type "${fm.type}"`,
      });
    }
  });

export type Frontmatter = z.infer<typeof frontmatterSchema>;
export type SourceRef = z.infer<typeof sourceRefSchema>;

// ============================================
// TYPES
// ============================================

export type Severity = 'error' | 'warning';

export interface Finding {
  severity: Severity;
  rule: string;
  file: string;
  line?: number;
  message: string;
}

export interface KnowledgeFile {
  /** Repo-relative path with forward slashes, e.g. knowledge/wiki/index.md */
  path: string;
  content: string;
}

export interface LintInput {
  /** Text files under knowledge/ (see isTextPath). */
  files: readonly KnowledgeFile[];
  /** Every file path under knowledge/, text or binary. */
  knowledgePaths: readonly string[];
  /** File bytes for a repo-relative path, or null when it is not a file. */
  readRepoFile: (repoPath: string) => Uint8Array | null;
  /** True when a repo-relative path exists as a file or directory. */
  pathExists: (repoPath: string) => boolean;
}

export interface LintStats {
  pages: number;
  sourcesCited: number;
  registerEntries: number;
  openEntries: number;
}

export interface LintResult {
  findings: Finding[];
  stats: LintStats;
}

interface ParsedPage {
  file: string;
  frontmatter: Frontmatter | null;
  body: string;
  bodyStartLine: number;
}

interface LinkRef {
  target: string;
  line: number;
}

type ResolvedLink =
  | { kind: 'ignored' }
  | { kind: 'absolute' }
  | { kind: 'outside-repo' }
  | { kind: 'repo'; path: string };

// ============================================
// HELPERS
// ============================================

function isIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function isTextPath(repoPath: string): boolean {
  return TEXT_EXTENSIONS.has(posix.extname(repoPath).toLowerCase());
}

/**
 * Git blob id (SHA-1 of "blob <size>\0<content>"), as `git hash-object` prints it.
 * CRLF is normalised to LF for text content (no NUL byte in the first 8000
 * bytes), so a Windows checkout with core.autocrlf yields the same id.
 */
export function gitBlobId(bytes: Uint8Array): string {
  const data = looksBinary(bytes) ? bytes : stripCarriageReturns(bytes);
  return createHash('sha1').update(`blob ${data.byteLength}\0`).update(data).digest('hex');
}

function looksBinary(bytes: Uint8Array): boolean {
  const limit = Math.min(bytes.byteLength, 8000);
  for (let i = 0; i < limit; i++) {
    if (bytes[i] === 0) return true;
  }
  return false;
}

function stripCarriageReturns(bytes: Uint8Array): Uint8Array {
  const out = new Uint8Array(bytes.byteLength);
  let length = 0;
  for (let i = 0; i < bytes.byteLength; i++) {
    if (bytes[i] === 0x0d && bytes[i + 1] === 0x0a) continue;
    out[length++] = bytes[i];
  }
  return out.subarray(0, length);
}

function splitFrontmatter(content: string): { raw: string | null; body: string; bodyStartLine: number } {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  if (lines[0] !== '---') return { raw: null, body: lines.join('\n'), bodyStartLine: 1 };
  const end = lines.indexOf('---', 1);
  if (end === -1) return { raw: null, body: lines.join('\n'), bodyStartLine: 1 };
  return {
    raw: lines.slice(1, end).join('\n'),
    body: lines.slice(end + 1).join('\n'),
    bodyStartLine: end + 2,
  };
}

/**
 * Lines outside fenced code blocks. `raw` is the line as written (used for
 * headings); `text` has inline code spans removed (used for links and C-###
 * references, so code examples are not treated as either).
 */
function proseLines(body: string, firstLine: number): Array<{ raw: string; text: string; line: number }> {
  const out: Array<{ raw: string; text: string; line: number }> = [];
  let fence: string | null = null;
  body.split('\n').forEach((raw, index) => {
    const marker = /^\s*(`{3,}|~{3,})/.exec(raw)?.[1];
    if (marker) {
      if (fence === null) fence = marker[0];
      else if (marker[0] === fence) fence = null;
      return;
    }
    if (fence !== null) return;
    out.push({ raw, text: raw.replace(/`[^`]*`/g, ''), line: firstLine + index });
  });
  return out;
}

function extractLinks(body: string, firstLine: number): LinkRef[] {
  const links: LinkRef[] = [];
  const pattern = /!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+["'(][^)]*)?\)/g;
  for (const { text, line } of proseLines(body, firstLine)) {
    // Array.from: the root tsconfig has no target (ES5), where for-of over an iterator is a type error.
    for (const match of Array.from(text.matchAll(pattern))) {
      links.push({ target: match[1], line });
    }
  }
  return links;
}

function resolveLink(fromFile: string, target: string): ResolvedLink {
  if (target.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(target)) return { kind: 'ignored' };
  if (target.startsWith('/')) return { kind: 'absolute' };
  const withoutFragment = target.split('#')[0].split('?')[0];
  let decoded = withoutFragment;
  try {
    decoded = decodeURIComponent(withoutFragment);
  } catch {
    // Keep the raw target; the existence check reports it.
  }
  const joined = posix.normalize(posix.join(posix.dirname(fromFile), decoded)).replace(/\/$/, '');
  if (joined === '..' || joined.startsWith('../')) return { kind: 'outside-repo' };
  return { kind: 'repo', path: joined };
}

function wikiFolder(file: string): string {
  const relative = posix.relative(WIKI_ROOT, posix.dirname(file));
  return relative === '' ? '' : relative;
}

function isWikiPage(file: string): boolean {
  return file.startsWith(`${WIKI_ROOT}/`) && file.endsWith('.md');
}

function compareFindings(a: Finding, b: Finding): number {
  if (a.severity !== b.severity) return a.severity === 'error' ? -1 : 1;
  if (a.file !== b.file) return a.file < b.file ? -1 : 1;
  if ((a.line ?? 0) !== (b.line ?? 0)) return (a.line ?? 0) - (b.line ?? 0);
  if (a.rule !== b.rule) return a.rule < b.rule ? -1 : 1;
  return a.message < b.message ? -1 : a.message > b.message ? 1 : 0;
}

// ============================================
// LINT
// ============================================

export function lintWiki(input: LintInput): LintResult {
  const findings: Finding[] = [];
  const add = (severity: Severity, rule: string, file: string, message: string, line?: number) =>
    findings.push({ severity, rule, file, message, ...(line !== undefined ? { line } : {}) });

  const contentByPath = new Map(input.files.map((f) => [f.path, f.content]));
  const wikiPages = input.knowledgePaths.filter(isWikiPage).sort();
  const wikiPageSet = new Set(wikiPages);

  // 1. Parse pages: file names, folders, frontmatter
  const pages: ParsedPage[] = [];
  for (const file of wikiPages) {
    const content = contentByPath.get(file) ?? '';
    const { raw, body, bodyStartLine } = splitFrontmatter(content);
    const page: ParsedPage = { file, frontmatter: null, body, bodyStartLine };
    pages.push(page);

    if (!PAGE_FILE_NAME.test(posix.basename(file))) {
      add('error', 'file-name', file, 'page file names must be kebab-case .md');
    }
    if (file === INDEX_PAGE || file === LOG_PAGE) continue;

    const folder = wikiFolder(file);
    const allowedTypes = FOLDER_TYPES[folder];
    if (!allowedTypes) {
      add('error', 'unknown-folder', file, `pages may not live in "${folder}/" (see knowledge/CLAUDE.md layout)`);
    }
    if (raw === null) {
      add('error', 'frontmatter-missing', file, 'page must start with YAML frontmatter between --- lines');
      continue;
    }
    let data: unknown;
    try {
      // js-yaml 4 load() constructs no custom types; FAILSAFE_SCHEMA also keeps
      // every scalar a string, so blob ids such as 1234567 stay strings.
      data = yaml.load(raw, { schema: yaml.FAILSAFE_SCHEMA });
    } catch (error) {
      const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
      add('error', 'frontmatter-invalid', file, `YAML does not parse: ${reason}`);
      continue;
    }
    const parsed = frontmatterSchema.safeParse(data ?? {});
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const where = issue.path.length > 0 ? issue.path.join('.') : 'frontmatter';
        add('error', 'frontmatter-invalid', file, `${where}: ${issue.message}`);
      }
      continue;
    }
    page.frontmatter = parsed.data;
    if (allowedTypes && !allowedTypes.includes(parsed.data.type)) {
      const folderName = folder === '' ? 'the wiki root' : `${folder}/`;
      add('error', 'type-folder-mismatch', file, `type "${parsed.data.type}" is not allowed in ${folderName} (allowed: ${allowedTypes.join(', ')})`);
    }
  }

  // 2. Required special pages
  if (!wikiPageSet.has(INDEX_PAGE)) add('error', 'index-missing', INDEX_PAGE, 'index.md is required');
  if (!wikiPageSet.has(LOG_PAGE)) add('error', 'log-missing', LOG_PAGE, 'log.md is required');

  // 3. Links: existence, index coverage, inbound links
  const indexTargets = new Set<string>();
  const inbound = new Map<string, number>();
  for (const page of pages) {
    for (const link of extractLinks(page.body, page.bodyStartLine)) {
      const resolved = resolveLink(page.file, link.target);
      if (resolved.kind === 'ignored') continue;
      if (resolved.kind === 'absolute') {
        add('error', 'absolute-link', page.file, `use a relative link instead of "${link.target}"`, link.line);
        continue;
      }
      if (resolved.kind === 'outside-repo') {
        add('error', 'link-outside-repo', page.file, `"${link.target}" points outside the repository`, link.line);
        continue;
      }
      const target = resolved.path;
      const insideKnowledge = target === KNOWLEDGE_ROOT || target.startsWith(`${KNOWLEDGE_ROOT}/`);
      if (!input.pathExists(target)) {
        if (insideKnowledge) {
          add('error', 'broken-link', page.file, `link target not found: ${link.target}`, link.line);
        } else {
          add('warning', 'dangling-repo-link', page.file, `repository path not found: ${target}`, link.line);
        }
        continue;
      }
      if (page.file === INDEX_PAGE) indexTargets.add(target);
      if (wikiPageSet.has(target) && target !== page.file && page.file !== INDEX_PAGE && page.file !== LOG_PAGE) {
        inbound.set(target, (inbound.get(target) ?? 0) + 1);
      }
    }
  }

  if (wikiPageSet.has(INDEX_PAGE)) {
    for (const file of wikiPages) {
      if (file !== INDEX_PAGE && !indexTargets.has(file)) {
        add('error', 'not-in-index', file, 'page is not linked from index.md');
      }
    }
  }
  for (const file of wikiPages) {
    if (wikiFolder(file) === '') continue; // hub pages: index, log, overview, glossary, register
    if ((inbound.get(file) ?? 0) === 0) {
      add('warning', 'orphan-page', file, 'no inbound links from other pages (index.md and log.md do not count)');
    }
  }

  // 4. Log format and order
  const logPage = pages.find((p) => p.file === LOG_PAGE);
  if (logPage) {
    let previous: string | null = null;
    for (const { raw, line } of proseLines(logPage.body, logPage.bodyStartLine)) {
      if (!raw.startsWith('## ')) continue;
      const match = LOG_HEADER.exec(raw);
      if (!match) {
        add('error', 'log-format', LOG_PAGE, `entry header must be "## [YYYY-MM-DD] <${LOG_OPERATIONS.join('|')}> | <title>"`, line);
        continue;
      }
      const date = match[1];
      if (!isIsoDate(date)) {
        add('error', 'log-format', LOG_PAGE, `invalid date ${date}`, line);
        continue;
      }
      if (previous !== null && date < previous) {
        add('error', 'log-order', LOG_PAGE, `entry dated ${date} follows ${previous}; the log is append-only and chronological`, line);
      }
      previous = date;
    }
  }

  // 5. Contradictions register
  const registerIds = new Set<string>();
  let openEntries = 0;
  const registerPage = pages.find((p) => p.file === REGISTER_PAGE);
  if (registerPage) {
    let current: { id: string; line: number; hasStatus: boolean } | null = null;
    const closeEntry = () => {
      if (current && !current.hasStatus) {
        add('error', 'register-status', REGISTER_PAGE, `${current.id} needs a "- **Status:** ${REGISTER_STATUSES.join('|')}" line`, current.line);
      }
    };
    for (const { raw, line } of proseLines(registerPage.body, registerPage.bodyStartLine)) {
      if (raw.startsWith('## ')) {
        closeEntry();
        current = null;
        if (!/^## C[-\d]/.test(raw)) continue; // other level-2 headings are allowed
        const match = REGISTER_HEADER.exec(raw);
        if (!match) {
          add('error', 'register-format', REGISTER_PAGE, 'entry heading must be "## C-###: <title>"', line);
          continue;
        }
        if (registerIds.has(match[1])) {
          add('error', 'register-duplicate', REGISTER_PAGE, `${match[1]} is used more than once`, line);
        }
        registerIds.add(match[1]);
        current = { id: match[1], line, hasStatus: false };
        continue;
      }
      const status = REGISTER_STATUS.exec(raw);
      if (current && status) {
        current.hasStatus = true;
        if (status[1] === 'open') openEntries++;
      }
    }
    closeEntry();
  }
  for (const page of pages) {
    for (const { text, line } of proseLines(page.body, page.bodyStartLine)) {
      for (const match of Array.from(text.matchAll(CONTRADICTION_REF))) {
        if (!registerIds.has(match[0])) {
          add('error', 'unknown-contradiction', page.file, `${match[0]} is not in contradictions.md`, line);
        }
      }
    }
  }

  // 6. Provenance: cited sources must still match the content that was read
  const currentBlob = new Map<string, string | null>();
  const blobFor = (repoFile: string): string | null => {
    if (!currentBlob.has(repoFile)) {
      const bytes = input.readRepoFile(repoFile);
      currentBlob.set(repoFile, bytes ? gitBlobId(bytes) : null);
    }
    return currentBlob.get(repoFile) ?? null;
  };
  const citedPaths = new Set<string>();
  let sourcesCited = 0;
  for (const page of pages) {
    for (const source of page.frontmatter?.sources ?? []) {
      sourcesCited++;
      citedPaths.add(source.path);
      const isRaw = source.path.startsWith(`${RAW_ROOT}/`);
      const blob = blobFor(source.path);
      if (blob === null) {
        add(isRaw ? 'error' : 'warning', 'source-missing', page.file, `cited source not found: ${source.path}`);
        continue;
      }
      if (!blob.startsWith(source.blob)) {
        if (isRaw) {
          add('error', 'raw-source-modified', page.file, `${source.path} changed after ingest; raw sources are immutable (cited ${source.blob}, now ${blob.slice(0, 12)})`);
        } else {
          add('warning', 'stale-source', page.file, `${source.path} changed since ingest (cited ${source.blob}, now ${blob.slice(0, 12)}); refresh the page`);
        }
      }
    }
  }
  for (const file of input.knowledgePaths) {
    if (file.startsWith(`${RAW_ROOT}/`) && file !== RAW_README && !citedPaths.has(file)) {
      add('warning', 'raw-not-ingested', file, 'raw source is not cited by any wiki page yet');
    }
  }

  // 7. Public repository: flag possible e-mail addresses anywhere in knowledge/
  for (const file of input.files) {
    const lines = file.content.split(/\r?\n/);
    const index = lines.findIndex((text) => EMAIL.test(text));
    if (index !== -1) {
      add('warning', 'possible-email', file.path, 'possible e-mail address; knowledge/ is public', index + 1);
    }
  }

  findings.sort(compareFindings);
  return {
    findings,
    stats: { pages: wikiPages.length, sourcesCited, registerEntries: registerIds.size, openEntries },
  };
}

// ============================================
// REPORT
// ============================================

export function formatReport(result: LintResult): string {
  const errors = result.findings.filter((f) => f.severity === 'error').length;
  const warnings = result.findings.length - errors;
  const { pages, sourcesCited, registerEntries, openEntries } = result.stats;
  const lines = [
    `Wiki lint: ${pages} pages, ${sourcesCited} source citations, ${registerEntries} register entries (${openEntries} open)`,
  ];
  for (const f of result.findings) {
    const location = f.line !== undefined ? `${f.file}:${f.line}` : f.file;
    lines.push(`${f.severity === 'error' ? 'ERROR' : 'WARN '}  ${f.rule.padEnd(22)} ${location}  ${f.message}`);
  }
  lines.push(`${errors} error(s), ${warnings} warning(s)`);
  return lines.join('\n');
}
