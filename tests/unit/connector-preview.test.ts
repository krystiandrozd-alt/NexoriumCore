// Nexorium Core - Connector Preview Tests
// previewConnectorSource() runs fetch() and map() on real fixtures and must never touch the database.

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Any property read on the Prisma client is recorded and fails the call that made it.
const { dbAccess } = vi.hoisted(() => ({ dbAccess: [] as string[] }));
vi.mock('@/lib/db', () => {
  const client = new Proxy({}, {
    get(_target, property) {
      if (typeof property === 'symbol' || property === 'then') return undefined;
      dbAccess.push(String(property));
      throw new Error(`Database access during preview: prisma.${String(property)}`);
    },
  });
  return { default: client, prisma: client };
});

import { previewConnectorSource } from '@/lib/connectors/v2/preview';
import { PreviewSourceError } from '@/lib/connectors/v2/preview-source';

const FIXTURES = path.resolve(__dirname, '..', '..', 'fixtures');
let tmp: string;

function write(relativePath: string, content: string): string {
  const target = path.join(tmp, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  return target;
}

function countByCode(findings: Array<{ code: string }>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const { code } of findings) counts[code] = (counts[code] ?? 0) + 1;
  return counts;
}

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nexorium-preview-'));
});

afterAll(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

beforeEach(() => {
  dbAccess.length = 0;
});

describe('previewConnectorSource', () => {
  describe('bundled fixtures', () => {
    it('maps the config-repo fixture and reports the host links upsert() would drop', async () => {
      const result = await previewConnectorSource('config-repo', path.join(FIXTURES, 'config-repo', 'sit-topology.yaml'));

      expect(result.counts).toEqual({
        networkContexts: 0,
        hosts: 0,
        components: 10,
        componentInstances: 10,
        endpoints: 13,
        deployedVersions: 10,
        connections: 9,
      });
      expect(countByCode(result.findings)).toEqual({ W_UNRESOLVED_HOST_REF: 10 });
      expect(dbAccess).toEqual([]);
    });

    it('reports Terraform hosts without a network context link', async () => {
      const result = await previewConnectorSource('terraform', path.join(FIXTURES, 'terraform', 'sit-state.json'));

      expect(result.counts.networkContexts).toBe(1);
      expect(result.counts.hosts).toBe(5);
      expect(countByCode(result.findings)).toEqual({ W_HOST_WITHOUT_NETWORK_CONTEXT: 5 });
      expect(dbAccess).toEqual([]);
    });

    it.each([
      ['cloud-aws', 'aws'],
      ['cloud-azure', 'azure'],
      ['cloud-gcp', 'gcp'],
    ] as const)('maps the %s fixture without findings', async (type, folder) => {
      const result = await previewConnectorSource(type, path.join(FIXTURES, 'cloud', folder, 'sit-environment.json'));

      expect(result.counts.hosts).toBeGreaterThan(0);
      expect(result.findings).toEqual([]);
      expect(dbAccess).toEqual([]);
    });
  });

  describe('connector failures', () => {
    it('treats an unparseable manifest as an error and keeps the readable ones', async () => {
      const dir = path.join(tmp, 'manifests');
      write('manifests/a-valid.yaml', [
        'components:',
        '  - name: crm',
        '    component: CRM',
        '    version: "2026.1.0"',
      ].join('\n'));
      write('manifests/b-broken.yaml', 'components:\n  - name: om\n   version: "1"\n');
      write('manifests/notes.txt', 'ignored');

      const result = await previewConnectorSource('config-repo', dir);

      expect(result.sourceFiles).toEqual([path.join(dir, 'a-valid.yaml'), path.join(dir, 'b-broken.yaml')]);
      expect(result.counts.componentInstances).toBe(1);
      expect(countByCode(result.findings)).toEqual({ E_PARTIAL_SOURCE: 1 });
      expect(result.findings[0].message).toContain('b-broken.yaml');
    });

    it('turns a connector exception into a finding instead of throwing', async () => {
      const statePath = write('state/not-terraform.json', '{"version": 4}');

      const result = await previewConnectorSource('terraform', statePath);

      expect(result.findings.map((f) => f.code)).toEqual(['E_CONNECTOR_ERROR']);
      expect(result.counts.hosts).toBe(0);
    });

    it('reads the CSV files present in a directory and checks the result', async () => {
      const dir = path.join(tmp, 'csv');
      write('csv/components.csv', 'name,category,vendor,description\nCRM,BSS,Vendor,\n');
      write('csv/instances.csv', 'display_name,component_name,host_ref,notes\nCRM-1,CRM,,\n');
      write('csv/endpoints.csv', 'instance_ref,kind,value,port,scheme,base_path\nCRM-1,URL,crm:80,eighty,http,\n');
      write('csv/versions.csv', 'instance_ref,project_version,vendor_version,build_ref\nCRM-1,2.4.0,,\n');

      const result = await previewConnectorSource('csv', dir);

      expect(result.sourceFiles).toHaveLength(4);
      expect(countByCode(result.findings)).toEqual({ E_INVALID_PORT: 1 });
      expect(dbAccess).toEqual([]);
    });
  });

  describe('source validation', () => {
    beforeAll(() => {
      fs.mkdirSync(path.join(tmp, 'empty-dir'), { recursive: true });
      write('csv/components.csv', 'name,category,vendor,description\n');
    });

    it.each([
      ['terraform', 'missing.json', /Source not found/],
      ['terraform', '.', /expects a Terraform state file/],
      ['csv', 'csv/components.csv', /expects a directory/],
      ['config-repo', 'empty-dir', /contains no \.yaml, \.yml, \.json manifest files/],
      ['csv', 'empty-dir', /contains none of: hosts\.csv/],
    ] as const)('rejects %s source %s', async (type, relative, message) => {
      const attempt = previewConnectorSource(type, path.join(tmp, relative));

      await expect(attempt).rejects.toBeInstanceOf(PreviewSourceError);
      await expect(attempt).rejects.toThrow(message);
    });
  });
});
