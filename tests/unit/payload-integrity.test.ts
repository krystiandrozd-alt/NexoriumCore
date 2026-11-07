// Nexorium Core - Canonical Payload Integrity Tests
// Each finding must describe what BaseConnectorV2.upsert() would do with the payload.

import { describe, it, expect } from 'vitest';
import type { CanonicalDiscoveryPayload } from '@/lib/connectors/v2/types';
import {
  INTEGRITY_RULES,
  checkPayloadIntegrity,
  sortFindings,
  type IntegrityFinding,
} from '@/lib/connectors/v2/payload-integrity';

// ============================================
// HELPERS
// ============================================

function payload(overrides: Partial<CanonicalDiscoveryPayload> = {}): CanonicalDiscoveryPayload {
  return {
    networkContexts: [],
    hosts: [],
    components: [],
    componentInstances: [],
    endpoints: [],
    deployedVersions: [],
    connections: [],
    ...overrides,
  };
}

/** A consistent BSS -> OSS slice: CRM calls Order Management over TMF622. */
function cleanPayload(): CanonicalDiscoveryPayload {
  return payload({
    networkContexts: [{ externalId: 'vpc-1', hostingType: 'CLOUD', vpcVnet: 'vpc-1', region: 'eu-west-1' }],
    hosts: [
      { hostname: 'bss-app-01', networkContextRef: 'vpc-1' },
      { hostname: 'oss-app-01', networkContextRef: 'vpc-1' },
    ],
    components: [{ name: 'CRM' }, { name: 'Order Management' }],
    componentInstances: [
      { externalId: 'crm', componentName: 'CRM', displayName: 'CRM (crm)', hostRef: 'bss-app-01' },
      { externalId: 'om', componentName: 'Order Management', displayName: 'OM (om)', hostRef: 'oss-app-01' },
    ],
    endpoints: [
      { componentInstanceRef: 'CRM (crm)', kind: 'URL', value: 'crm:443', port: 443, scheme: 'HTTPS' },
      { componentInstanceRef: 'om', kind: 'URL', value: 'om:8443', port: 8443, scheme: 'HTTPS' },
    ],
    deployedVersions: [
      { componentInstanceRef: 'CRM (crm)', projectVersion: '2026.1.0', vendorVersion: '62.0' },
      { componentInstanceRef: 'om', projectVersion: '11.2.0' },
    ],
    connections: [
      { fromComponentRef: 'CRM (crm)', toComponentRef: 'om', protocolType: 'REST', protocolDetail: 'TMF622', port: 8443 },
    ],
  });
}

function codes(findings: IntegrityFinding[]): Array<[string, string]> {
  return findings.map((f) => [f.code, f.path]);
}

// ============================================
// TESTS
// ============================================

describe('checkPayloadIntegrity', () => {
  it('returns no findings for a consistent payload', () => {
    expect(checkPayloadIntegrity(cleanPayload())).toEqual([]);
  });

  it('reports an empty payload once', () => {
    expect(codes(checkPayloadIntegrity(payload()))).toEqual([['E_EMPTY_PAYLOAD', 'payload']]);
  });

  describe('component instances', () => {
    it('reports an unknown component once, counting the dependent records upsert() also skips', () => {
      const p = cleanPayload();
      p.componentInstances.push({ externalId: 'bill', componentName: 'Billing', displayName: 'Billing (bill)' });
      p.endpoints.push({ componentInstanceRef: 'bill', kind: 'URL', value: 'bill:443', port: 443 });
      p.deployedVersions.push({ componentInstanceRef: 'Billing (bill)', projectVersion: '7.1' });
      p.connections.push({ fromComponentRef: 'om', toComponentRef: 'bill', protocolType: 'REST', protocolDetail: 'TMF678' });

      const findings = checkPayloadIntegrity(p);

      expect(codes(findings)).toEqual([['E_UNKNOWN_COMPONENT', 'componentInstances[2]']]);
      expect(findings[0].message).toContain('3 dependent record(s)');
    });

    it('reports a duplicate externalId as a merge into the earlier record', () => {
      const p = cleanPayload();
      p.componentInstances.push({ externalId: 'crm', componentName: 'CRM', displayName: 'CRM copy', hostRef: 'bss-app-01' });

      const findings = checkPayloadIntegrity(p);

      expect(codes(findings)).toEqual([['E_DUPLICATE_INSTANCE', 'componentInstances[2]']]);
      expect(findings[0].message).toContain('componentInstances[0]');
    });

    it('matches instances without externalId on component and displayName', () => {
      const p = cleanPayload();
      p.componentInstances.push(
        { componentName: 'CRM', displayName: 'CRM shared' },
        { componentName: 'CRM', displayName: 'CRM shared' },
      );
      p.deployedVersions.push({ componentInstanceRef: 'CRM shared', projectVersion: '1.0.0' });

      expect(codes(checkPayloadIntegrity(p))).toEqual([['E_DUPLICATE_INSTANCE', 'componentInstances[3]']]);
    });

    it('follows the rename a merge applies to the stored record', () => {
      const p = cleanPayload();
      p.componentInstances.push(
        { externalId: 'crm', componentName: 'CRM', displayName: 'CRM renamed' },
        { componentName: 'CRM', displayName: 'CRM renamed' },
      );

      expect(codes(checkPayloadIntegrity(p))).toEqual([
        ['E_DUPLICATE_INSTANCE', 'componentInstances[2]'],
        ['E_DUPLICATE_INSTANCE', 'componentInstances[3]'],
      ]);
    });

    it('reports a reference key claimed by two different instances', () => {
      const p = cleanPayload();
      p.componentInstances.push({ externalId: 'CRM (crm)', componentName: 'CRM', displayName: 'CRM shadow' });
      p.deployedVersions.push({ componentInstanceRef: 'CRM shadow', projectVersion: '1.0.0' });

      const findings = checkPayloadIntegrity(p);

      expect(codes(findings)).toContainEqual(['E_AMBIGUOUS_INSTANCE_REF', 'componentInstances[2]']);
      expect(findings.find((f) => f.code === 'E_AMBIGUOUS_INSTANCE_REF')?.message).toContain('componentInstances[0]');
    });

    it('warns about unresolved host references and missing display names', () => {
      const p = cleanPayload();
      p.componentInstances[0].hostRef = 'bss-app-99';
      p.componentInstances.push({ componentName: 'CRM' });
      p.deployedVersions.push({ componentInstanceRef: 'unused', projectVersion: '1.0.0' });

      expect(codes(checkPayloadIntegrity(p))).toEqual([
        ['E_DANGLING_VERSION_REF', 'deployedVersions[2]'],
        ['E_MISSING_PROJECT_VERSION', 'componentInstances[2]'],
        ['W_MISSING_DISPLAY_NAME', 'componentInstances[2]'],
        ['W_UNRESOLVED_HOST_REF', 'componentInstances[0]'],
      ]);
    });
  });

  describe('dangling references', () => {
    it('reports endpoints, versions and connections that match no instance', () => {
      const p = cleanPayload();
      p.endpoints.push({ componentInstanceRef: 'Billing', kind: 'URL', value: 'bill:443', port: 443 });
      p.deployedVersions.push({ componentInstanceRef: 'Billing', projectVersion: '7.1' });
      p.connections.push({ fromComponentRef: 'CRM (crm)', toComponentRef: 'Billing', protocolType: 'REST', protocolDetail: 'TMF678' });
      p.connections.push({ fromComponentRef: 'Mediation', toComponentRef: 'Billing', protocolType: 'SFTP', protocolDetail: 'CDR' });

      const findings = checkPayloadIntegrity(p);

      expect(codes(findings)).toEqual([
        ['E_DANGLING_CONNECTION_REF', 'connections[1]'],
        ['E_DANGLING_CONNECTION_REF', 'connections[2]'],
        ['E_DANGLING_ENDPOINT_REF', 'endpoints[2]'],
        ['E_DANGLING_VERSION_REF', 'deployedVersions[2]'],
      ]);
      expect(findings[0].message).toContain('target "Billing" matches no instance');
      expect(findings[1].message).toContain('source "Mediation" and target "Billing" match no instance');
    });
  });

  describe('deployed versions', () => {
    it('requires a deployed version for every stored instance', () => {
      const p = cleanPayload();
      p.deployedVersions = p.deployedVersions.slice(1);

      expect(codes(checkPayloadIntegrity(p))).toEqual([['E_MISSING_PROJECT_VERSION', 'componentInstances[0]']]);
    });

    it('reports an empty projectVersion on the version record only', () => {
      const p = cleanPayload();
      p.deployedVersions[0].projectVersion = '  ';

      expect(codes(checkPayloadIntegrity(p))).toEqual([['E_MISSING_PROJECT_VERSION', 'deployedVersions[0]']]);
    });

    it('reports version fields that YAML parsed as numbers', () => {
      const p = cleanPayload();
      p.deployedVersions[0].projectVersion = 1.1 as unknown as string;
      p.deployedVersions[0].buildRef = 20260107 as unknown as string;

      const findings = checkPayloadIntegrity(p);

      expect(codes(findings)).toEqual([
        ['E_INVALID_VERSION_VALUE', 'deployedVersions[0]'],
        ['E_INVALID_VERSION_VALUE', 'deployedVersions[0]'],
      ]);
      expect(findings.map((f) => f.message).join('\n')).toContain('projectVersion for instance "CRM (crm)" is the number 1.1');
    });

    it('warns when one run carries several versions for an instance', () => {
      const p = cleanPayload();
      p.deployedVersions.push({ componentInstanceRef: 'crm', projectVersion: '2026.1.1' });

      const findings = checkPayloadIntegrity(p);

      expect(codes(findings)).toEqual([['W_MULTIPLE_VERSIONS', 'componentInstances[0]']]);
      expect(findings[0].message).toContain('deployedVersions[0], deployedVersions[2]');
    });
  });

  describe('ports', () => {
    it('rejects ports outside 1-65535 and shows NaN as NaN', () => {
      const p = cleanPayload();
      p.endpoints[0].port = Number.NaN;
      p.endpoints[1].port = 0;
      p.connections[0].port = 70000;

      const findings = checkPayloadIntegrity(p);

      expect(codes(findings)).toEqual([
        ['E_INVALID_PORT', 'connections[0]'],
        ['E_INVALID_PORT', 'endpoints[0]'],
        ['E_INVALID_PORT', 'endpoints[1]'],
      ]);
      expect(findings[1].message).toContain('has port NaN');
    });
  });

  describe('network contexts and hosts', () => {
    it('reports a network context upsert() cannot key', () => {
      const p = cleanPayload();
      p.networkContexts.push({ hostingType: 'ON_PREM' }, { hostingType: 'CLOUD', region: 'eu-west-1' });

      const findings = checkPayloadIntegrity(p);

      expect(codes(findings)).toEqual([
        ['E_UNKEYED_NETWORK_CONTEXT', 'networkContexts[1]'],
        ['E_UNKEYED_NETWORK_CONTEXT', 'networkContexts[2]'],
      ]);
      expect(findings[0].message).toContain('any network context in the environment');
      expect(findings[1].message).toContain('any network context in region "eu-west-1"');
    });

    it('reports duplicates by externalId, and by vpcVnet when region is missing', () => {
      const p = cleanPayload();
      p.networkContexts.push(
        { externalId: 'vpc-1', hostingType: 'CLOUD', vpcVnet: 'vpc-1b' },
        { hostingType: 'CLOUD', vpcVnet: 'vpc-1' },
      );

      expect(codes(checkPayloadIntegrity(p))).toEqual([
        ['W_DUPLICATE_NETWORK_CONTEXT', 'networkContexts[1]'],
        ['W_DUPLICATE_NETWORK_CONTEXT', 'networkContexts[2]'],
      ]);
    });

    it('reports duplicate hosts and hosts outside the payload network contexts', () => {
      const p = cleanPayload();
      p.hosts.push(
        { hostname: 'bss-app-01', networkContextRef: 'vpc-1' },
        { hostname: 'bss-db-01', networkContextRef: 'vpc-9' },
        { hostname: 'bss-mq-01' },
      );

      expect(codes(checkPayloadIntegrity(p))).toEqual([
        ['W_DUPLICATE_HOST', 'hosts[2]'],
        ['W_HOST_WITHOUT_NETWORK_CONTEXT', 'hosts[4]'],
        ['W_UNRESOLVED_NETWORK_CONTEXT_REF', 'hosts[3]'],
      ]);
    });

    it('does not require a network context when the payload defines none', () => {
      const p = cleanPayload();
      p.networkContexts = [];
      p.hosts = p.hosts.map(({ hostname }) => ({ hostname }));

      expect(checkPayloadIntegrity(p)).toEqual([]);
    });
  });

  describe('components, endpoints and connections', () => {
    it('reports duplicate components and endpoints', () => {
      const p = cleanPayload();
      p.components.push({ name: 'CRM', layer: 'BSS' });
      p.endpoints.push({ componentInstanceRef: 'crm', kind: 'URL', value: 'crm:443' });

      expect(codes(checkPayloadIntegrity(p))).toEqual([
        ['W_DUPLICATE_COMPONENT', 'components[2]'],
        ['W_DUPLICATE_ENDPOINT', 'endpoints[2]'],
      ]);
    });

    it('reports self, duplicate and unspecified-protocol connections', () => {
      const p = cleanPayload();
      p.connections.push(
        { fromComponentRef: 'crm', toComponentRef: 'om', protocolType: 'REST', protocolDetail: 'TMF641' },
        { fromComponentRef: 'om', toComponentRef: 'OM (om)', protocolType: 'OTHER' },
        { fromComponentRef: 'om', toComponentRef: 'crm', protocolType: 'OTHER', protocolDetail: 'NETCONF' },
      );

      const findings = checkPayloadIntegrity(p);

      expect(codes(findings)).toEqual([
        ['W_DUPLICATE_CONNECTION', 'connections[1]'],
        ['W_PROTOCOL_UNSPECIFIED', 'connections[2]'],
        ['W_SELF_CONNECTION', 'connections[2]'],
      ]);
      expect(findings[0].message).toContain('keeps the later protocolDetail and port');
    });
  });

  describe('determinism', () => {
    it('returns identical findings for identical input', () => {
      const build = () => {
        const p = cleanPayload();
        p.endpoints.push({ componentInstanceRef: 'Billing', kind: 'URL', value: 'bill:443' });
        p.connections.push({ fromComponentRef: 'om', toComponentRef: 'om', protocolType: 'OTHER' });
        return p;
      };
      expect(checkPayloadIntegrity(build())).toEqual(checkPayloadIntegrity(build()));
    });

    it('orders by severity, code, then numeric position', () => {
      const finding = (code: keyof typeof INTEGRITY_RULES, path: string): IntegrityFinding =>
        ({ code, path, severity: INTEGRITY_RULES[code].severity, message: '' });

      const sorted = sortFindings([
        finding('W_SELF_CONNECTION', 'connections[10]'),
        finding('W_SELF_CONNECTION', 'connections[2]'),
        finding('E_INVALID_PORT', 'endpoints[1]'),
        finding('E_INVALID_PORT', 'connections[3]'),
        finding('E_DANGLING_ENDPOINT_REF', 'endpoints[0]'),
      ]);

      expect(codes(sorted)).toEqual([
        ['E_DANGLING_ENDPOINT_REF', 'endpoints[0]'],
        ['E_INVALID_PORT', 'connections[3]'],
        ['E_INVALID_PORT', 'endpoints[1]'],
        ['W_SELF_CONNECTION', 'connections[2]'],
        ['W_SELF_CONNECTION', 'connections[10]'],
      ]);
    });
  });
});

describe('INTEGRITY_RULES', () => {
  it('names error codes E_ and warning codes W_', () => {
    for (const [code, { severity }] of Object.entries(INTEGRITY_RULES)) {
      expect(code.startsWith(severity === 'error' ? 'E_' : 'W_')).toBe(true);
    }
  });
});
