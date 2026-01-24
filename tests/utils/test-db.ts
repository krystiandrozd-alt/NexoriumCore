// TelEnvIQ - Test Database Utilities
// Helpers for database-backed integration tests

import { PrismaClient } from '@prisma/client';
import {
  ALL_ENVIRONMENTS,
  ALL_NETWORK_CONTEXTS,
  ALL_HOSTS,
  ALL_COMPONENTS,
  ALL_INSTANCES,
  ALL_CONNECTIONS,
  ALL_ENDPOINTS,
  ALL_VERSIONS,
} from '@tests/fixtures';

// ============================================
// TEST DATABASE CLIENT
// ============================================

let testPrisma: PrismaClient | null = null;

/**
 * Get or create the test database client.
 * Uses DATABASE_URL from environment (should be test database).
 */
export function getTestPrisma(): PrismaClient {
  if (!testPrisma) {
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://localhost:5432/telenviq_test',
        },
      },
      log: process.env.DEBUG_PRISMA ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }
  return testPrisma;
}

/**
 * Disconnect the test database client.
 */
export async function disconnectTestDb(): Promise<void> {
  if (testPrisma) {
    await testPrisma.$disconnect();
    testPrisma = null;
  }
}

// ============================================
// DATABASE CLEANUP
// ============================================

/**
 * Clear all tables in the test database.
 * Order matters due to foreign key constraints.
 */
export async function clearTestDb(): Promise<void> {
  const prisma = getTestPrisma();

  // Delete in reverse dependency order
  await prisma.$transaction([
    // Cost domain
    prisma.costSimulation.deleteMany(),
    prisma.environmentCostAllocation.deleteMany(),
    prisma.environmentCostOverride.deleteMany(),
    prisma.costItem.deleteMany(),
    prisma.costModel.deleteMany(),

    // Ingestion tracking
    prisma.ingestionConflict.deleteMany(),
    prisma.auditEvent.deleteMany(),
    prisma.connectorRun.deleteMany(),

    // Diagram
    prisma.environmentDiagram.deleteMany(),

    // 5-layer model (bottom up)
    prisma.deployedVersion.deleteMany(),
    prisma.endpoint.deleteMany(),
    prisma.connection.deleteMany(),
    prisma.componentInstance.deleteMany(),
    prisma.host.deleteMany(),
    prisma.networkContext.deleteMany(),
    prisma.component.deleteMany(),

    // Legacy model
    prisma.edge.deleteMany(),
    prisma.node.deleteMany(),
    prisma.environmentSnapshot.deleteMany(),
    prisma.environmentActivityLog.deleteMany(),
    prisma.environmentOwnership.deleteMany(),
    prisma.environment.deleteMany(),

    // Other domains
    prisma.networkZoneConnection.deleteMany(),
    prisma.networkZone.deleteMany(),
    prisma.connectorCredential.deleteMany(),
  ]);
}

// ============================================
// DATABASE SEEDING
// ============================================

/**
 * Seed the test database with fixture data.
 */
export async function seedTestDb(): Promise<void> {
  const prisma = getTestPrisma();

  // Seed in dependency order
  await prisma.$transaction(async (tx) => {
    // 1. Environments
    await tx.environment.createMany({
      data: ALL_ENVIRONMENTS,
      skipDuplicates: true,
    });

    // 2. Network contexts
    await tx.networkContext.createMany({
      data: ALL_NETWORK_CONTEXTS,
      skipDuplicates: true,
    });

    // 3. Hosts
    await tx.host.createMany({
      data: ALL_HOSTS,
      skipDuplicates: true,
    });

    // 4. Components
    await tx.component.createMany({
      data: ALL_COMPONENTS,
      skipDuplicates: true,
    });

    // 5. Component instances
    await tx.componentInstance.createMany({
      data: ALL_INSTANCES,
      skipDuplicates: true,
    });

    // 6. Endpoints
    await tx.endpoint.createMany({
      data: ALL_ENDPOINTS,
      skipDuplicates: true,
    });

    // 7. Deployed versions
    await tx.deployedVersion.createMany({
      data: ALL_VERSIONS,
      skipDuplicates: true,
    });

    // 8. Connections
    await tx.connection.createMany({
      data: ALL_CONNECTIONS,
      skipDuplicates: true,
    });
  });
}

/**
 * Reset and seed the test database.
 */
export async function resetTestDb(): Promise<void> {
  await clearTestDb();
  await seedTestDb();
}

// ============================================
// SETUP/TEARDOWN HELPERS
// ============================================

/**
 * Setup hook for integration test suites.
 * Call in beforeAll().
 */
export async function setupIntegrationTests(): Promise<void> {
  await resetTestDb();
}

/**
 * Teardown hook for integration test suites.
 * Call in afterAll().
 */
export async function teardownIntegrationTests(): Promise<void> {
  await clearTestDb();
  await disconnectTestDb();
}

/**
 * Reset database between tests if needed.
 * Call in beforeEach() or afterEach() for isolated tests.
 */
export async function resetBetweenTests(): Promise<void> {
  await clearTestDb();
  await seedTestDb();
}

// ============================================
// TRANSACTION HELPER FOR ISOLATED TESTS
// ============================================

/**
 * Run a test within a transaction that gets rolled back.
 * Useful for tests that modify data but shouldn't persist.
 */
export async function withRollback<T>(
  testFn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = getTestPrisma();

  // Note: This is a simplified approach. For true isolation,
  // you might want to use Prisma's interactive transactions
  // with savepoints in a real implementation.
  const result = await testFn(prisma);

  // Reset after test
  await resetTestDb();

  return result;
}
