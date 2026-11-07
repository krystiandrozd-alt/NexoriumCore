// Nexorium Core - ingestion-check CLI Tests
// Runs .claude/skills/ingestion-check/scripts/check-source.ts as an agent would: a child process,
// JSON on stdout, errors on stderr, meaningful exit codes. DATABASE_URL points at a closed local
// port, so any database access would fail the run.

import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { INTEGRITY_RULES } from '@/lib/connectors/v2/payload-integrity';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, '.claude', 'skills', 'ingestion-check', 'scripts', 'check-source.ts');
const TSX_CLI = path.join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const CONFIG_REPO_FIXTURE = 'fixtures/config-repo/sit-topology.yaml';

let tmp: string;

function cli(...args: string[]) {
  const result = spawnSync(process.execPath, [TSX_CLI, SCRIPT, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: 30000,
    env: { ...process.env, DATABASE_URL: 'postgresql://preview:preview@127.0.0.1:1/none', NODE_ENV: 'test' },
  });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nexorium-cli-'));
});

afterAll(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe('ingestion-check CLI', () => {
  it('prints help and exits 0 without other arguments being valid', () => {
    const { code, stdout, stderr } = cli('--type', 'not-a-type', '--help');

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toContain('Usage: npx --no tsx .claude/skills/ingestion-check/scripts/check-source.ts');
    for (const type of ['config-repo', 'terraform', 'cloud-aws', 'cloud-azure', 'cloud-gcp', 'csv']) {
      expect(stdout).toContain(type);
    }
    expect(stdout).toContain('Exit codes:');
    expect(Math.max(...stdout.split('\n').map((line) => line.length))).toBeLessThanOrEqual(80);
  }, 30000);

  it('reports a source as paginated JSON and exits 0 when only warnings exist', () => {
    const { code, stdout, stderr } = cli('--type', 'config-repo', '--source', CONFIG_REPO_FIXTURE, '--limit', '3');
    const report = JSON.parse(stdout);

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(report.ok).toBe(true);
    expect(report.summary).toEqual({ errors: 0, warnings: 10, byCode: { W_UNRESOLVED_HOST_REF: 10 } });
    expect(report.findings).toHaveLength(3);
    expect(report.page).toEqual({ severity: 'warning', offset: 0, limit: 3, returned: 3, total: 10, nextOffset: 3 });
    expect(report).not.toHaveProperty('payload');
  }, 30000);

  it('exits 1 on warnings with --strict', () => {
    const { code, stdout } = cli('--type', 'config-repo', '--source', CONFIG_REPO_FIXTURE, '--strict', '--limit', '0');

    expect(code).toBe(1);
    expect(JSON.parse(stdout)).toMatchObject({ ok: false, findings: [], page: { nextOffset: null } });
  }, 30000);

  it('writes the full report and payload to --output and prints the summary', () => {
    const output = path.join(tmp, 'report.json');

    const { code, stdout } = cli('--type', 'config-repo', '--source', CONFIG_REPO_FIXTURE, '--output', output, '--include-payload');
    const summary = JSON.parse(stdout);
    const report = JSON.parse(fs.readFileSync(output, 'utf8'));

    expect(code).toBe(0);
    expect(summary).toEqual({
      ok: true,
      connectorType: 'config-repo',
      source: CONFIG_REPO_FIXTURE,
      counts: report.counts,
      summary: report.summary,
      output,
    });
    expect(report.findings).toHaveLength(10);
    expect(report.payload.componentInstances).toHaveLength(10);
  }, 30000);

  it('exits 2 with a usage message for an invalid --type', () => {
    const { code, stdout, stderr } = cli('--type', 'xml', '--source', CONFIG_REPO_FIXTURE);

    expect(code).toBe(2);
    expect(stdout).toBe('');
    expect(stderr).toContain('Error: --type must be one of: config-repo, terraform, cloud-aws, cloud-azure, cloud-gcp, csv. Received: "xml"');
  }, 30000);

  it('exits 3 when the source does not exist', () => {
    const { code, stderr } = cli('--type', 'terraform', '--source', 'fixtures/terraform/missing.json');

    expect(code).toBe(3);
    expect(stderr).toContain('Error: Source not found: fixtures/terraform/missing.json');
  }, 30000);

  it('lists every finding code', () => {
    const { code, stdout } = cli('--list-codes');
    const listed = JSON.parse(stdout).codes.map((entry: { code: string }) => entry.code).sort();

    expect(code).toBe(0);
    expect(listed).toEqual(Object.keys(INTEGRITY_RULES).sort());
  }, 30000);
});
