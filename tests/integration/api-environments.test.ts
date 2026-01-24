// TelEnvIQ - API Integration Tests
// Tests for environment API routes with mocked Prisma

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  SIT_ENVIRONMENT,
  UAT_ENVIRONMENT,
  ALL_ENVIRONMENTS,
  ALL_INSTANCES,
  ALL_CONNECTIONS,
  ENV_IDS,
  INSTANCE_IDS,
} from '@tests/fixtures';

// ============================================
// MOCK SETUP (hoisted)
// ============================================

// Create mocks using vi.hoisted
const {
  mockGetEnvironment,
  mockUpdateEnvironment,
  mockDeleteEnvironment,
  mockPrismaFindUnique,
  mockPrismaUpdate,
  mockPrismaTransaction,
  mockAuditEventCreateMany,
} = vi.hoisted(() => ({
  mockGetEnvironment: vi.fn(),
  mockUpdateEnvironment: vi.fn(),
  mockDeleteEnvironment: vi.fn(),
  mockPrismaFindUnique: vi.fn(),
  mockPrismaUpdate: vi.fn(),
  mockPrismaTransaction: vi.fn(),
  mockAuditEventCreateMany: vi.fn(),
}));

// Mock the db module
vi.mock('@/lib/db', () => ({
  default: {
    environment: {
      findUnique: mockPrismaFindUnique,
      update: mockPrismaUpdate,
    },
    auditEvent: {
      createMany: mockAuditEventCreateMany,
    },
    $transaction: mockPrismaTransaction,
  },
}));

// Mock the service module
vi.mock('@/lib/services/environment', () => ({
  getEnvironment: mockGetEnvironment,
  updateEnvironment: mockUpdateEnvironment,
  deleteEnvironment: mockDeleteEnvironment,
  listEnvironments: vi.fn(),
}));

// Import after mocking
import { GET, PUT, PATCH, DELETE } from '@/app/api/environments/[id]/route';

// Re-export for test use
const getEnvironment = mockGetEnvironment;
const updateEnvironment = mockUpdateEnvironment;
const deleteEnvironment = mockDeleteEnvironment;

// ============================================
// HELPER FUNCTIONS
// ============================================

function createMockRequest(method: string, body?: unknown): NextRequest {
  const url = 'http://localhost:3000/api/environments/test-id';
  const init: RequestInit = { method };

  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }

  return new NextRequest(url, init);
}

async function createParams(id: string): Promise<{ params: Promise<{ id: string }> }> {
  return { params: Promise.resolve({ id }) };
}

// ============================================
// GET /api/environments/[id] TESTS
// ============================================

describe('GET /api/environments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return environment when found', async () => {
    const mockEnv = {
      ...SIT_ENVIRONMENT,
      componentInstances: ALL_INSTANCES.filter(i => i.environmentId === ENV_IDS.SIT),
    };
    (getEnvironment as ReturnType<typeof vi.fn>).mockResolvedValue(mockEnv);

    const request = createMockRequest('GET');
    const response = await GET(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(ENV_IDS.SIT);
    expect(data.data.name).toBe('System Integration Test');
  });

  it('should return 404 when environment not found', async () => {
    (getEnvironment as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const request = createMockRequest('GET');
    const response = await GET(request, await createParams('non-existent-id'));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Environment not found');
  });

  it('should return 500 on service error', async () => {
    (getEnvironment as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Database error'));

    const request = createMockRequest('GET');
    const response = await GET(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});

// ============================================
// PUT /api/environments/[id] TESTS
// ============================================

describe('PUT /api/environments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update environment name', async () => {
    const updatedEnv = { ...SIT_ENVIRONMENT, name: 'Updated SIT' };
    (updateEnvironment as ReturnType<typeof vi.fn>).mockResolvedValue(updatedEnv);

    const request = createMockRequest('PUT', { name: 'Updated SIT' });
    const response = await PUT(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(updateEnvironment).toHaveBeenCalledWith(ENV_IDS.SIT, { name: 'Updated SIT' });
  });

  it('should update environment type', async () => {
    const updatedEnv = { ...SIT_ENVIRONMENT, type: 'UAT' };
    (updateEnvironment as ReturnType<typeof vi.fn>).mockResolvedValue(updatedEnv);

    const request = createMockRequest('PUT', { type: 'UAT' });
    const response = await PUT(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(updateEnvironment).toHaveBeenCalledWith(ENV_IDS.SIT, { type: 'UAT' });
  });

  it('should reject invalid type value', async () => {
    const request = createMockRequest('PUT', { type: 'INVALID_TYPE' });
    const response = await PUT(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should reject empty name', async () => {
    const request = createMockRequest('PUT', { name: '' });
    const response = await PUT(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 500 on service error', async () => {
    (updateEnvironment as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Update failed'));

    const request = createMockRequest('PUT', { name: 'Valid Name' });
    const response = await PUT(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});

// ============================================
// PATCH /api/environments/[id] TESTS
// ============================================

describe('PATCH /api/environments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default Prisma mocks for PATCH
    mockPrismaFindUnique.mockResolvedValue({
      entryComponentInstanceId: null,
      exitComponentInstanceId: null,
    });

    mockPrismaUpdate.mockResolvedValue({
      id: ENV_IDS.SIT,
      name: 'System Integration Test',
      entryComponentInstanceId: INSTANCE_IDS.KONG_API_GW,
      exitComponentInstanceId: null,
    });

    mockAuditEventCreateMany.mockResolvedValue({ count: 1 });

    mockPrismaTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      // Create a mock transaction object
      const txMock = {
        environment: {
          update: mockPrismaUpdate,
        },
        auditEvent: {
          createMany: mockAuditEventCreateMany,
        },
      };
      return fn(txMock);
    });
  });

  it('should update entry override', async () => {
    const request = createMockRequest('PATCH', {
      entryComponentInstanceId: INSTANCE_IDS.KONG_API_GW,
    });
    const response = await PATCH(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockPrismaUpdate).toHaveBeenCalled();
    expect(mockAuditEventCreateMany).toHaveBeenCalled();
  });

  it('should update exit override', async () => {
    mockPrismaUpdate.mockResolvedValue({
      id: ENV_IDS.SIT,
      name: 'System Integration Test',
      entryComponentInstanceId: null,
      exitComponentInstanceId: INSTANCE_IDS.ORACLE_BRM,
    });

    const request = createMockRequest('PATCH', {
      exitComponentInstanceId: INSTANCE_IDS.ORACLE_BRM,
    });
    const response = await PATCH(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should allow null to clear overrides', async () => {
    mockPrismaFindUnique.mockResolvedValue({
      entryComponentInstanceId: INSTANCE_IDS.KONG_API_GW,
      exitComponentInstanceId: null,
    });

    mockPrismaUpdate.mockResolvedValue({
      id: ENV_IDS.SIT,
      name: 'System Integration Test',
      entryComponentInstanceId: null,
      exitComponentInstanceId: null,
    });

    const request = createMockRequest('PATCH', {
      entryComponentInstanceId: null,
    });
    const response = await PATCH(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should reject invalid UUID', async () => {
    const request = createMockRequest('PATCH', {
      entryComponentInstanceId: 'not-a-uuid',
    });
    const response = await PATCH(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 404 when environment not found', async () => {
    mockPrismaFindUnique.mockResolvedValue(null);

    const request = createMockRequest('PATCH', {
      entryComponentInstanceId: INSTANCE_IDS.KONG_API_GW,
    });
    const response = await PATCH(request, await createParams('non-existent'));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('should create audit event for entry override', async () => {
    const request = createMockRequest('PATCH', {
      entryComponentInstanceId: INSTANCE_IDS.KONG_API_GW,
    });
    await PATCH(request, await createParams(ENV_IDS.SIT));

    expect(mockAuditEventCreateMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          entityType: 'Environment',
          field: 'entryComponentInstanceId',
          action: 'MANUAL_OVERRIDE',
        }),
      ]),
    });
  });
});

// ============================================
// DELETE /api/environments/[id] TESTS
// ============================================

describe('DELETE /api/environments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete environment successfully', async () => {
    (deleteEnvironment as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const request = createMockRequest('DELETE');
    const response = await DELETE(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(deleteEnvironment).toHaveBeenCalledWith(ENV_IDS.SIT);
  });

  it('should return 500 on deletion failure', async () => {
    (deleteEnvironment as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Delete failed'));

    const request = createMockRequest('DELETE');
    const response = await DELETE(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});

// ============================================
// RESPONSE FORMAT TESTS
// ============================================

describe('API Response Format', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should always return success field', async () => {
    (getEnvironment as ReturnType<typeof vi.fn>).mockResolvedValue(SIT_ENVIRONMENT);

    const request = createMockRequest('GET');
    const response = await GET(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(data).toHaveProperty('success');
    expect(typeof data.success).toBe('boolean');
  });

  it('should return data field on success', async () => {
    (getEnvironment as ReturnType<typeof vi.fn>).mockResolvedValue(SIT_ENVIRONMENT);

    const request = createMockRequest('GET');
    const response = await GET(request, await createParams(ENV_IDS.SIT));
    const data = await response.json();

    expect(data).toHaveProperty('data');
    expect(data.success).toBe(true);
  });

  it('should return error field on failure', async () => {
    (getEnvironment as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const request = createMockRequest('GET');
    const response = await GET(request, await createParams('non-existent'));
    const data = await response.json();

    expect(data).toHaveProperty('error');
    expect(data.success).toBe(false);
  });
});

// ============================================
// CONCURRENT REQUEST HANDLING
// ============================================

describe('Concurrent Request Handling', () => {
  it('should handle multiple GET requests concurrently', async () => {
    (getEnvironment as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(SIT_ENVIRONMENT)
      .mockResolvedValueOnce(UAT_ENVIRONMENT);

    const requests = [
      GET(createMockRequest('GET'), await createParams(ENV_IDS.SIT)),
      GET(createMockRequest('GET'), await createParams(ENV_IDS.UAT)),
    ];

    const responses = await Promise.all(requests);

    expect(responses[0].status).toBe(200);
    expect(responses[1].status).toBe(200);

    const [data1, data2] = await Promise.all(responses.map(r => r.json()));
    expect(data1.data.name).toBe('System Integration Test');
    expect(data2.data.name).toBe('User Acceptance Test');
  });
});
