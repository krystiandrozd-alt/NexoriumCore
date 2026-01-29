// Nexorium Core - Connector Unit Tests
// Tests for connector framework behavior

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ConnectorConfig, CanonicalDiscoveryPayload } from '@/lib/connectors/v2/types';
import { ENV_IDS } from '@tests/fixtures';

// ============================================
// MOCK PRISMA SETUP (hoisted)
// ============================================

// Use vi.hoisted to create mock functions before vi.mock runs
const {
  mockConnectorRunCreate,
  mockConnectorRunUpdate,
  mockNetworkContextFindFirst,
  mockNetworkContextCreate,
  mockNetworkContextUpdate,
  mockHostFindUnique,
  mockHostCreate,
  mockHostUpdate,
  mockComponentFindUnique,
  mockComponentCreate,
  mockComponentUpdate,
  mockComponentInstanceFindFirst,
  mockComponentInstanceCreate,
  mockComponentInstanceUpdate,
  mockEndpointFindFirst,
  mockEndpointCreate,
  mockEndpointUpdate,
  mockDeployedVersionCreate,
  mockConnectionFindFirst,
  mockConnectionCreate,
  mockConnectionUpdate,
} = vi.hoisted(() => ({
  mockConnectorRunCreate: vi.fn(),
  mockConnectorRunUpdate: vi.fn(),
  mockNetworkContextFindFirst: vi.fn(),
  mockNetworkContextCreate: vi.fn(),
  mockNetworkContextUpdate: vi.fn(),
  mockHostFindUnique: vi.fn(),
  mockHostCreate: vi.fn(),
  mockHostUpdate: vi.fn(),
  mockComponentFindUnique: vi.fn(),
  mockComponentCreate: vi.fn(),
  mockComponentUpdate: vi.fn(),
  mockComponentInstanceFindFirst: vi.fn(),
  mockComponentInstanceCreate: vi.fn(),
  mockComponentInstanceUpdate: vi.fn(),
  mockEndpointFindFirst: vi.fn(),
  mockEndpointCreate: vi.fn(),
  mockEndpointUpdate: vi.fn(),
  mockDeployedVersionCreate: vi.fn(),
  mockConnectionFindFirst: vi.fn(),
  mockConnectionCreate: vi.fn(),
  mockConnectionUpdate: vi.fn(),
}));

// Mock prisma module
vi.mock('@/lib/db', () => ({
  default: {
    connectorRun: {
      create: mockConnectorRunCreate,
      update: mockConnectorRunUpdate,
    },
    networkContext: {
      findFirst: mockNetworkContextFindFirst,
      create: mockNetworkContextCreate,
      update: mockNetworkContextUpdate,
    },
    host: {
      findUnique: mockHostFindUnique,
      create: mockHostCreate,
      update: mockHostUpdate,
    },
    component: {
      findUnique: mockComponentFindUnique,
      create: mockComponentCreate,
      update: mockComponentUpdate,
    },
    componentInstance: {
      findFirst: mockComponentInstanceFindFirst,
      create: mockComponentInstanceCreate,
      update: mockComponentInstanceUpdate,
    },
    endpoint: {
      findFirst: mockEndpointFindFirst,
      create: mockEndpointCreate,
      update: mockEndpointUpdate,
    },
    deployedVersion: {
      create: mockDeployedVersionCreate,
    },
    connection: {
      findFirst: mockConnectionFindFirst,
      create: mockConnectionCreate,
      update: mockConnectionUpdate,
    },
  },
}));

// Import after mocking
import { BaseConnectorV2 } from '@/lib/connectors/v2/base-connector';

// ============================================
// TEST CONNECTOR IMPLEMENTATION
// ============================================

class TestConnector extends BaseConnectorV2 {
  readonly connectorType = 'test';

  private testPayload: CanonicalDiscoveryPayload | null = null;
  private shouldFail = false;

  setTestPayload(payload: CanonicalDiscoveryPayload): void {
    this.testPayload = payload;
  }

  setFailure(fail: boolean): void {
    this.shouldFail = fail;
  }

  async fetch(): Promise<unknown> {
    if (this.shouldFail) {
      throw new Error('Simulated fetch failure');
    }
    return { raw: 'test-data' };
  }

  async map(): Promise<CanonicalDiscoveryPayload> {
    if (this.testPayload) {
      return this.testPayload;
    }
    return {
      networkContexts: [],
      hosts: [],
      components: [],
      componentInstances: [],
      endpoints: [],
      deployedVersions: [],
      connections: [],
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function createTestConfig(overrides: Partial<ConnectorConfig> = {}): ConnectorConfig {
  return {
    environmentId: ENV_IDS.SIT,
    connectorType: 'test',
    dryRun: false,
    ...overrides,
  };
}

function createEmptyPayload(): CanonicalDiscoveryPayload {
  return {
    networkContexts: [],
    hosts: [],
    components: [],
    componentInstances: [],
    endpoints: [],
    deployedVersions: [],
    connections: [],
  };
}

// ============================================
// CONNECTOR INITIALIZATION TESTS
// ============================================

describe('BaseConnectorV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock behavior
    mockConnectorRunCreate.mockResolvedValue({ id: 'run-1', status: 'RUNNING' });
    mockConnectorRunUpdate.mockResolvedValue({ id: 'run-1', status: 'SUCCESS' });

    // Default: no existing records
    mockNetworkContextFindFirst.mockResolvedValue(null);
    mockHostFindUnique.mockResolvedValue(null);
    mockComponentFindUnique.mockResolvedValue(null);
    mockComponentInstanceFindFirst.mockResolvedValue(null);
    mockEndpointFindFirst.mockResolvedValue(null);
    mockConnectionFindFirst.mockResolvedValue(null);

    // Default creates
    mockNetworkContextCreate.mockResolvedValue({ id: 'nc-1' });
    mockHostCreate.mockResolvedValue({ id: 'host-1' });
    mockComponentCreate.mockResolvedValue({ id: 'comp-1' });
    mockComponentInstanceCreate.mockResolvedValue({ id: 'inst-1' });
    mockEndpointCreate.mockResolvedValue({ id: 'ep-1' });
    mockDeployedVersionCreate.mockResolvedValue({ id: 'ver-1' });
    mockConnectionCreate.mockResolvedValue({ id: 'conn-1' });
  });

  describe('initialization', () => {
    it('should initialize with empty summary', () => {
      const connector = new TestConnector(createTestConfig());
      const summary = connector.report();

      expect(summary.networkContextsCreated).toBe(0);
      expect(summary.hostsCreated).toBe(0);
      expect(summary.componentsCreated).toBe(0);
      expect(summary.warnings).toEqual([]);
      expect(summary.errors).toEqual([]);
    });

    it('should store config correctly', () => {
      const config = createTestConfig({ dryRun: true });
      const connector = new TestConnector(config);

      expect(connector['config']).toEqual(config);
    });
  });

  describe('run pipeline', () => {
    it('should execute fetch -> map -> upsert pipeline', async () => {
      const connector = new TestConnector(createTestConfig());
      connector.setTestPayload(createEmptyPayload());

      const fetchSpy = vi.spyOn(connector, 'fetch');
      const mapSpy = vi.spyOn(connector, 'map');
      const upsertSpy = vi.spyOn(connector, 'upsert');

      await connector.run();

      expect(fetchSpy).toHaveBeenCalled();
      expect(mapSpy).toHaveBeenCalled();
      expect(upsertSpy).toHaveBeenCalled();

      // Verify order: fetch before map
      expect(fetchSpy.mock.invocationCallOrder[0]).toBeLessThan(
        mapSpy.mock.invocationCallOrder[0]
      );
    });

    it('should skip upsert in dry run mode', async () => {
      const connector = new TestConnector(createTestConfig({ dryRun: true }));
      connector.setTestPayload(createEmptyPayload());

      const upsertSpy = vi.spyOn(connector, 'upsert');

      await connector.run();

      expect(upsertSpy).not.toHaveBeenCalled();
    });

    it('should return payload in dry run mode', async () => {
      const payload = createEmptyPayload();
      const connector = new TestConnector(createTestConfig({ dryRun: true }));
      connector.setTestPayload(payload);

      const result = await connector.run();

      expect(result.payload).toEqual(payload);
    });

    it('should create connector run record on start', async () => {
      const connector = new TestConnector(createTestConfig());
      connector.setTestPayload(createEmptyPayload());

      await connector.run();

      expect(mockConnectorRunCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            environmentId: ENV_IDS.SIT,
            connectorType: 'test',
            status: 'RUNNING',
          }),
        })
      );
    });

    it('should update connector run record on success', async () => {
      const connector = new TestConnector(createTestConfig());
      connector.setTestPayload(createEmptyPayload());

      await connector.run();

      expect(mockConnectorRunUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'SUCCESS',
          }),
        })
      );
    });

    it('should return runId on success', async () => {
      const connector = new TestConnector(createTestConfig());
      connector.setTestPayload(createEmptyPayload());

      const result = await connector.run();

      expect(result.runId).toBe('run-1');
      expect(result.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle fetch failures gracefully', async () => {
      const connector = new TestConnector(createTestConfig());
      connector.setFailure(true);

      const result = await connector.run();

      expect(result.success).toBe(false);
      expect(result.summary.errors).toContain('Simulated fetch failure');
    });

    it('should update connector run with FAILED status on error', async () => {
      const connector = new TestConnector(createTestConfig());
      connector.setFailure(true);

      await connector.run();

      expect(mockConnectorRunUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'FAILED',
            errorMessage: 'Simulated fetch failure',
          }),
        })
      );
    });

    it('should mark as PARTIAL_SUCCESS when some operations fail', async () => {
      const connector = new TestConnector(createTestConfig());
      connector.setTestPayload(createEmptyPayload());

      // Manually add an error to simulate partial failure
      connector['addError']('Simulated partial failure');

      // Mock a successful upsert
      vi.spyOn(connector, 'upsert').mockResolvedValue(connector.report());

      await connector.run();

      expect(mockConnectorRunUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PARTIAL_SUCCESS',
          }),
        })
      );
    });
  });

  describe('upsert operations', () => {
    it('should create network context when not exists', async () => {
      const payload: CanonicalDiscoveryPayload = {
        ...createEmptyPayload(),
        networkContexts: [
          {
            hostingType: 'CLOUD',
            cloudProvider: 'AWS',
            region: 'ap-southeast-2',
            vpcVnet: 'vpc-test',
          },
        ],
      };

      const connector = new TestConnector(createTestConfig());
      connector.setTestPayload(payload);

      await connector.run();

      expect(mockNetworkContextCreate).toHaveBeenCalled();
      expect(connector.report().networkContextsCreated).toBe(1);
    });

    it('should update network context when exists', async () => {
      mockNetworkContextFindFirst.mockResolvedValue({ id: 'existing-nc' });
      mockNetworkContextUpdate.mockResolvedValue({ id: 'existing-nc' });

      const payload: CanonicalDiscoveryPayload = {
        ...createEmptyPayload(),
        networkContexts: [
          {
            hostingType: 'CLOUD',
            cloudProvider: 'AWS',
            region: 'ap-southeast-2',
            vpcVnet: 'vpc-test',
          },
        ],
      };

      const connector = new TestConnector(createTestConfig());
      connector.setTestPayload(payload);

      await connector.run();

      expect(mockNetworkContextUpdate).toHaveBeenCalled();
      expect(connector.report().networkContextsUpdated).toBe(1);
    });

    it('should create host when not exists', async () => {
      const payload: CanonicalDiscoveryPayload = {
        ...createEmptyPayload(),
        hosts: [
          {
            hostname: 'test-host.local',
            ip: '10.0.0.1',
          },
        ],
      };

      const connector = new TestConnector(createTestConfig());
      connector.setTestPayload(payload);

      await connector.run();

      expect(mockHostCreate).toHaveBeenCalled();
      expect(connector.report().hostsCreated).toBe(1);
    });

    it('should create component when not exists', async () => {
      const payload: CanonicalDiscoveryPayload = {
        ...createEmptyPayload(),
        components: [
          {
            name: 'Test Component',
            category: 'OTHER',
            layer: 'BSS',
            capabilityType: 'CRM',
          },
        ],
      };

      const connector = new TestConnector(createTestConfig());
      connector.setTestPayload(payload);

      await connector.run();

      expect(mockComponentCreate).toHaveBeenCalled();
      expect(connector.report().componentsCreated).toBe(1);
    });

    it('should warn when component not found for instance', async () => {
      const payload: CanonicalDiscoveryPayload = {
        ...createEmptyPayload(),
        components: [], // No components
        componentInstances: [
          {
            componentName: 'NonExistent',
            displayName: 'Instance 1',
          },
        ],
      };

      const connector = new TestConnector(createTestConfig());
      connector.setTestPayload(payload);

      await connector.run();

      // Check that a warning was generated (component not found)
      const warnings = connector.report().warnings;
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some((w: string) => w.includes('NonExistent'))).toBe(true);
    });
  });

  describe('summary reporting', () => {
    it('should track all created entities in summary', async () => {
      // Component does NOT exist, so it will be created
      mockComponentFindUnique.mockResolvedValue(null);

      const payload: CanonicalDiscoveryPayload = {
        networkContexts: [{ hostingType: 'CLOUD', vpcVnet: 'vpc-1' }],
        hosts: [{ hostname: 'host-1' }],
        components: [{ name: 'Comp1', category: 'OTHER' }],
        componentInstances: [], // Skip instances for this test
        endpoints: [],
        deployedVersions: [],
        connections: [],
      };

      const connector = new TestConnector(createTestConfig());
      connector.setTestPayload(payload);

      await connector.run();

      const summary = connector.report();
      expect(summary.networkContextsCreated).toBe(1);
      expect(summary.hostsCreated).toBe(1);
      expect(summary.componentsCreated).toBe(1);
    });

    it('should include summary in connector run record', async () => {
      const connector = new TestConnector(createTestConfig());
      connector.setTestPayload(createEmptyPayload());

      await connector.run();

      expect(mockConnectorRunUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            summaryJson: expect.any(Object),
          }),
        })
      );
    });
  });
});

// ============================================
// IDEMPOTENCY TESTS
// ============================================

describe('Connector idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockConnectorRunCreate.mockResolvedValue({ id: 'run-1', status: 'RUNNING' });
    mockConnectorRunUpdate.mockResolvedValue({ id: 'run-1' });
  });

  it('should update existing records instead of creating duplicates', async () => {
    const existingHost = { id: 'existing-host', hostname: 'test-host.local' };
    mockHostFindUnique.mockResolvedValue(existingHost);
    mockHostUpdate.mockResolvedValue(existingHost);

    const payload: CanonicalDiscoveryPayload = {
      ...createEmptyPayload(),
      hosts: [{ hostname: 'test-host.local', ip: '10.0.0.2' }], // Updated IP
    };

    const connector = new TestConnector(createTestConfig());
    connector.setTestPayload(payload);

    await connector.run();

    expect(mockHostCreate).not.toHaveBeenCalled();
    expect(mockHostUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ip: '10.0.0.2',
        }),
      })
    );
    expect(connector.report().hostsUpdated).toBe(1);
    expect(connector.report().hostsCreated).toBe(0);
  });
});
