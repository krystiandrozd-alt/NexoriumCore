#!/usr/bin/env -S npx --no tsx
// Command-line entry point for the ingestion-check skill. Run with --help for usage.
// The check logic lives in src/lib/connectors/v2 (payload-integrity, preview); this file
// handles arguments, output and exit codes only.

import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseArgs } from 'node:util';
import { z } from 'zod';
import {
  INTEGRITY_RULES,
  type IntegrityCode,
  type IntegrityFinding,
  type IntegritySeverity,
} from '../../../../src/lib/connectors/v2/payload-integrity';
import {
  CSV_SOURCE_FILES,
  PREVIEW_CONNECTOR_TYPES,
  PreviewSourceError,
} from '../../../../src/lib/connectors/v2/preview-source';
import type { PreviewResult } from '../../../../src/lib/connectors/v2/preview';

const SCRIPT = '.claude/skills/ingestion-check/scripts/check-source.ts';
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

const EXIT = { OK: 0, FINDINGS: 1, USAGE: 2, SOURCE: 3, INTERNAL: 4 } as const;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 1000;

const HELP = `Usage: npx --no tsx ${SCRIPT} \\
         --type TYPE --source PATH [options]

Dry-run a file-based connector and check what it would ingest against the
Nexorium Core data-integrity rules. Runs the connector's own fetch() and map();
never calls upsert() or run() and never opens a database connection.
Prints a JSON report on stdout. Errors go to stderr.
Run from the repository root (any directory inside the repository works).

Options:
  --type TYPE        Connector type: ${PREVIEW_CONNECTOR_TYPES.slice(0, 3).join(', ')},
                     ${PREVIEW_CONNECTOR_TYPES.slice(3).join(', ')}
  --source PATH      What to check, by --type:
                       config-repo  manifest file, or directory of manifests
                                    (.yaml, .yml, .json; not recursive)
                       terraform    Terraform state file
                       cloud-*      control-plane fixture file (.json)
                       csv          directory holding any of
                                    ${Object.values(CSV_SOURCE_FILES).slice(0, 3).join(', ')},
                                    ${Object.values(CSV_SOURCE_FILES).slice(3).join(', ')}
  --severity LEVEL   Lowest severity to list: error | warning (default: warning)
  --limit N          Findings to list, 0-${MAX_LIMIT} (default: ${DEFAULT_LIMIT})
  --offset N         Findings to skip before listing (default: 0)
  --strict           Exit 1 on warnings as well as errors
  --output FILE      Write the full report, every finding included, to FILE;
                     stdout then gets the summary only. "-" prints the full
                     report on stdout. Not combinable with --limit or --offset.
  --include-payload  Add the mapped canonical payload to the report.
                     Requires --output.
  --list-codes       Print every finding code, its severity and rule; exit
  -h, --help         Show this help and exit

Report fields:
  ok                 true when the exit code is 0
  sourceFiles        files the connector read
  counts             entities map() produced, per canonical entity type
  summary            error and warning totals, and totals per finding code
  findings[]         {severity, code, path, message}; path locates the record in
                     the canonical payload, e.g. "connections[3]"
  page               offset, limit, returned, total, nextOffset (null when done)

Exit codes:
  0  No error findings (with --strict: no findings at all)
  1  Error findings (with --strict: any finding)
  2  Invalid arguments, or run from outside the repository
  3  Source missing, unreadable, or the wrong kind of path for --type
  4  Internal failure, for example dependencies not installed

Examples:
  npx --no tsx ${SCRIPT} \\
    --type config-repo --source fixtures/config-repo/sit-topology.yaml
  npx --no tsx ${SCRIPT} \\
    --type terraform --source fixtures/terraform/sit-state.json --severity error
  npx --no tsx ${SCRIPT} \\
    --type csv --source imports/sit --output /tmp/sit.json --include-payload
`;

const OPTIONS = {
  type: { type: 'string' },
  source: { type: 'string' },
  severity: { type: 'string' },
  limit: { type: 'string' },
  offset: { type: 'string' },
  strict: { type: 'boolean' },
  output: { type: 'string' },
  'include-payload': { type: 'boolean' },
  'list-codes': { type: 'boolean' },
  help: { type: 'boolean', short: 'h' },
} as const;

const nonNegativeInteger = z.string().regex(/^\d+$/).transform(Number);

const ArgsSchema = z.object({
  type: z.enum(PREVIEW_CONNECTOR_TYPES),
  source: z.string().min(1),
  severity: z.enum(['error', 'warning']).default('warning'),
  limit: nonNegativeInteger.pipe(z.number().max(MAX_LIMIT)).optional(),
  offset: nonNegativeInteger.optional(),
  strict: z.boolean().default(false),
  output: z.string().min(1).optional(),
  'include-payload': z.boolean().default(false),
});

type Args = z.infer<typeof ArgsSchema>;

const EXPECTED: Record<string, string> = {
  type: `one of: ${PREVIEW_CONNECTOR_TYPES.join(', ')}`,
  source: 'the file or directory to check',
  severity: 'one of: error, warning',
  limit: `an integer from 0 to ${MAX_LIMIT}`,
  offset: 'an integer of 0 or more',
  output: 'a file path, or "-" for stdout',
};

class UsageError extends Error {}

function fail(stream: NodeJS.WriteStream, message: string, hint?: string): void {
  stream.write(`Error: ${message}\n`);
  if (hint) stream.write(`${hint}\n`);
}

function parseCommandLine(argv: string[]): Args {
  let values: Record<string, string | boolean | undefined>;
  try {
    ({ values } = parseArgs({ args: argv, options: OPTIONS, strict: true, allowPositionals: false }));
  } catch (error) {
    throw new UsageError(error instanceof Error ? error.message : String(error));
  }

  const parsed = ArgsSchema.safeParse(values);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((issue) => {
      const field = String(issue.path[0] ?? '');
      const received = values[field];
      const expected = EXPECTED[field] ?? 'a valid value';
      return received === undefined
        ? `--${field} is required: ${expected}.`
        : `--${field} must be ${expected}. Received: ${JSON.stringify(received)}`;
    });
    throw new UsageError(Array.from(new Set(messages)).join('\n       '));
  }

  const args = parsed.data;
  if (args['include-payload'] && !args.output) {
    throw new UsageError('--include-payload requires --output FILE (or --output - for stdout), because the payload can be large.');
  }
  if (args.output && (args.limit !== undefined || args.offset !== undefined)) {
    throw new UsageError('--limit and --offset page the stdout listing, while --output writes every finding. Use one or the other.');
  }
  return args;
}

function listCodes(): string {
  const codes = (Object.keys(INTEGRITY_RULES) as IntegrityCode[])
    .map((code) => ({ code, severity: INTEGRITY_RULES[code].severity, rule: INTEGRITY_RULES[code].rule }))
    // Errors first, then code-unit order: the same order as findings, independent of locale.
    .sort((a, b) => (a.severity !== b.severity ? (a.severity === 'error' ? -1 : 1) : a.code < b.code ? -1 : 1));
  return `${JSON.stringify({ codes }, null, 2)}\n`;
}

function isInsideRepository(directory: string): boolean {
  const relative = path.relative(REPO_ROOT, directory);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

const SEVERITY_RANK: Record<IntegritySeverity, number> = { error: 0, warning: 1 };

function buildReport(result: PreviewResult, args: Args) {
  const errors = result.findings.filter((f) => f.severity === 'error').length;
  const warnings = result.findings.length - errors;
  const byCode: Record<string, number> = {};
  for (const code of Array.from(new Set(result.findings.map((f) => f.code))).sort()) {
    byCode[code] = result.findings.filter((f) => f.code === code).length;
  }
  const ok = errors === 0 && (!args.strict || warnings === 0);

  const listed: IntegrityFinding[] = result.findings.filter(
    (f) => SEVERITY_RANK[f.severity] <= SEVERITY_RANK[args.severity]);
  const offset = args.output ? 0 : args.offset ?? 0;
  const limit = args.output ? listed.length : args.limit ?? DEFAULT_LIMIT;
  const page = listed.slice(offset, offset + limit);
  const next = offset + page.length;

  return {
    ok,
    connectorType: result.connectorType,
    source: result.source,
    sourceFiles: result.sourceFiles,
    counts: result.counts,
    summary: { errors, warnings, byCode },
    findings: page,
    page: {
      severity: args.severity,
      offset,
      limit,
      returned: page.length,
      total: listed.length,
      // null with --limit 0 as well, so a caller paging on nextOffset always terminates.
      nextOffset: limit > 0 && next < listed.length ? next : null,
    },
    ...(args['include-payload'] ? { payload: result.payload } : {}),
  };
}

async function main(argv: string[]): Promise<number> {
  // --help wins over every other argument and has no side effects.
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(HELP);
    return EXIT.OK;
  }

  let args: Args;
  try {
    if (argv.includes('--list-codes')) {
      if (argv.length > 1) throw new UsageError('--list-codes takes no other options.');
      process.stdout.write(listCodes());
      return EXIT.OK;
    }
    args = parseCommandLine(argv);
    if (!isInsideRepository(process.cwd())) {
      throw new UsageError(
        `run this command from inside the repository (${REPO_ROOT}). The connectors resolve the @/ path alias through its tsconfig.json.`);
    }
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    fail(process.stderr, error.message, `Usage: npx --no tsx ${SCRIPT} --type TYPE --source PATH [options]\nRun with --help for details.`);
    return EXIT.USAGE;
  }

  // Loaded only now: the connectors pull in the Prisma client, which --help and argument errors do not need.
  const { previewConnectorSource } = await import('../../../../src/lib/connectors/v2/preview');

  let result: PreviewResult;
  try {
    result = await previewConnectorSource(args.type, args.source);
  } catch (error) {
    if (!(error instanceof PreviewSourceError)) throw error;
    fail(process.stderr, error.message, 'Check --source and --type. Run with --help for the path each type expects.');
    return EXIT.SOURCE;
  }

  const report = buildReport(result, args);
  const json = `${JSON.stringify(report, null, 2)}\n`;

  if (!args.output || args.output === '-') {
    process.stdout.write(json);
  } else {
    try {
      fs.writeFileSync(args.output, json);
    } catch (error) {
      fail(process.stderr, `cannot write --output file ${args.output}: ${error instanceof Error ? error.message : String(error)}`);
      return EXIT.USAGE;
    }
    const { ok, connectorType, source, counts, summary } = report;
    process.stdout.write(`${JSON.stringify({ ok, connectorType, source, counts, summary, output: args.output }, null, 2)}\n`);
  }

  return report.ok ? EXIT.OK : EXIT.FINDINGS;
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    fail(process.stderr, `internal failure: ${message}`,
      'If this names @prisma/client or a missing module, run "npm install" in the repository root and retry.');
    process.exitCode = EXIT.INTERNAL;
  },
);
