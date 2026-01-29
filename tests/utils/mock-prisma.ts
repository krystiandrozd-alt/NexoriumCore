// Nexorium Core - Mock Prisma Client
// Type-safe mocking for Prisma client in tests

import { vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';

// ============================================
// MOCK PRISMA CLIENT TYPE
// ============================================

type MockPrismaClient = {
  [K in keyof PrismaClient]: K extends `$${string}`
    ? PrismaClient[K]
    : {
        findMany: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
        findFirst: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        createMany: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        updateMany: ReturnType<typeof vi.fn>;
        upsert: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        deleteMany: ReturnType<typeof vi.fn>;
        count: ReturnType<typeof vi.fn>;
        aggregate: ReturnType<typeof vi.fn>;
        groupBy: ReturnType<typeof vi.fn>;
      };
};

// ============================================
// CREATE MOCK PRISMA
// ============================================

export function createMockPrisma(): MockPrismaClient {
  const mockModelMethods = () => ({
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  });

  return {
    // Core models
    environment: mockModelMethods(),
    networkContext: mockModelMethods(),
    host: mockModelMethods(),
    component: mockModelMethods(),
    componentInstance: mockModelMethods(),
    connection: mockModelMethods(),
    endpoint: mockModelMethods(),
    deployedVersion: mockModelMethods(),

    // Legacy/additional models
    node: mockModelMethods(),
    edge: mockModelMethods(),
    environmentSnapshot: mockModelMethods(),
    connectorRun: mockModelMethods(),
    auditEvent: mockModelMethods(),
    environmentDiagram: mockModelMethods(),
    ingestionConflict: mockModelMethods(),

    // Cost models
    costModel: mockModelMethods(),
    costItem: mockModelMethods(),
    environmentCostOverride: mockModelMethods(),
    environmentCostAllocation: mockModelMethods(),
    costSimulation: mockModelMethods(),

    // Other models
    networkZone: mockModelMethods(),
    networkZoneConnection: mockModelMethods(),
    runtimeLayer: mockModelMethods(),
    hostingDomain: mockModelMethods(),
    nodeHostingDomain: mockModelMethods(),
    environmentOwnership: mockModelMethods(),
    environmentActivityLog: mockModelMethods(),
    enrichmentEdit: mockModelMethods(),
    databaseMetadata: mockModelMethods(),
    testDataSet: mockModelMethods(),
    refreshRecord: mockModelMethods(),
    evidence: mockModelMethods(),
    complianceAudit: mockModelMethods(),
    policyViolation: mockModelMethods(),
    connectorCredential: mockModelMethods(),

    // Prisma client methods
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn().mockImplementation((fn: unknown) => {
      if (typeof fn === 'function') {
        return fn(createMockPrisma());
      }
      return Promise.resolve([]);
    }),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
    $on: vi.fn(),
    $extends: vi.fn(),
  } as unknown as MockPrismaClient;
}

// ============================================
// RESET ALL MOCKS
// ============================================

export function resetMockPrisma(mockPrisma: MockPrismaClient): void {
  const resetMethods = (obj: Record<string, unknown>) => {
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        for (const method of Object.values(value as Record<string, unknown>)) {
          if (typeof method === 'function' && 'mockReset' in method) {
            (method as ReturnType<typeof vi.fn>).mockReset();
          }
        }
      }
    }
  };

  resetMethods(mockPrisma);
}

// ============================================
// MOCK DATA HELPERS
// ============================================

export function mockFindMany<T>(
  mockPrisma: MockPrismaClient,
  model: keyof Omit<MockPrismaClient, `$${string}`>,
  data: T[]
): void {
  const modelObj = mockPrisma[model] as { findMany: ReturnType<typeof vi.fn> };
  modelObj.findMany.mockResolvedValue(data);
}

export function mockFindUnique<T>(
  mockPrisma: MockPrismaClient,
  model: keyof Omit<MockPrismaClient, `$${string}`>,
  data: T | null
): void {
  const modelObj = mockPrisma[model] as { findUnique: ReturnType<typeof vi.fn> };
  modelObj.findUnique.mockResolvedValue(data);
}

export function mockCreate<T>(
  mockPrisma: MockPrismaClient,
  model: keyof Omit<MockPrismaClient, `$${string}`>,
  data: T
): void {
  const modelObj = mockPrisma[model] as { create: ReturnType<typeof vi.fn> };
  modelObj.create.mockResolvedValue(data);
}

export function mockUpdate<T>(
  mockPrisma: MockPrismaClient,
  model: keyof Omit<MockPrismaClient, `$${string}`>,
  data: T
): void {
  const modelObj = mockPrisma[model] as { update: ReturnType<typeof vi.fn> };
  modelObj.update.mockResolvedValue(data);
}

export function mockCount(
  mockPrisma: MockPrismaClient,
  model: keyof Omit<MockPrismaClient, `$${string}`>,
  count: number
): void {
  const modelObj = mockPrisma[model] as { count: ReturnType<typeof vi.fn> };
  modelObj.count.mockResolvedValue(count);
}
