// Nexorium Core - Environment Fixtures
// Deterministic environment test data

import type { Environment } from '@prisma/client';

// Fixed timestamps for determinism
const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const UPDATED_AT = new Date('2026-01-15T10:00:00.000Z');

// ============================================
// STABLE ENVIRONMENT IDS
// ============================================

export const ENV_IDS = {
  DEV: '00000000-0000-4000-8000-000000000001',
  SIT: '00000000-0000-4000-8000-000000000002',
  UAT: '00000000-0000-4000-8000-000000000003',
  NFT: '00000000-0000-4000-8000-000000000004',
  PREPROD: '00000000-0000-4000-8000-000000000005',
  PROD_RO: '00000000-0000-4000-8000-000000000006',
} as const;

// ============================================
// ENVIRONMENT FIXTURES
// ============================================

export const DEV_ENVIRONMENT: Environment = {
  id: ENV_IDS.DEV,
  name: 'Development',
  type: 'DEV',
  description: 'Development environment for local testing',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
  entryComponentInstanceId: null,
  exitComponentInstanceId: null,
  stageId: null,
};

export const SIT_ENVIRONMENT: Environment = {
  id: ENV_IDS.SIT,
  name: 'System Integration Test',
  type: 'SIT',
  description: 'SIT environment with full OSS/BSS stack',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
  entryComponentInstanceId: null,
  exitComponentInstanceId: null,
  stageId: null,
};

export const UAT_ENVIRONMENT: Environment = {
  id: ENV_IDS.UAT,
  name: 'User Acceptance Test',
  type: 'UAT',
  description: 'UAT environment for business validation',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
  entryComponentInstanceId: null,
  exitComponentInstanceId: null,
  stageId: null,
};

export const NFT_ENVIRONMENT: Environment = {
  id: ENV_IDS.NFT,
  name: 'Non-Functional Test',
  type: 'NFT',
  description: 'Performance and load testing environment',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
  entryComponentInstanceId: null,
  exitComponentInstanceId: null,
  stageId: null,
};

export const PREPROD_ENVIRONMENT: Environment = {
  id: ENV_IDS.PREPROD,
  name: 'Pre-Production',
  type: 'PREPROD',
  description: 'Pre-production staging environment',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
  entryComponentInstanceId: null,
  exitComponentInstanceId: null,
  stageId: null,
};

export const PROD_RO_ENVIRONMENT: Environment = {
  id: ENV_IDS.PROD_RO,
  name: 'Production (Read-Only)',
  type: 'PROD_RO',
  description: 'Production environment - read-only view',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
  entryComponentInstanceId: null,
  exitComponentInstanceId: null,
  stageId: null,
};

// ============================================
// ALL ENVIRONMENTS ARRAY
// ============================================

export const ALL_ENVIRONMENTS: Environment[] = [
  DEV_ENVIRONMENT,
  SIT_ENVIRONMENT,
  UAT_ENVIRONMENT,
  NFT_ENVIRONMENT,
  PREPROD_ENVIRONMENT,
  PROD_RO_ENVIRONMENT,
];

// ============================================
// ENVIRONMENT WITH ENTRY/EXIT OVERRIDES
// ============================================

export function createEnvironmentWithOverrides(
  base: Environment,
  overrides: Partial<Environment>
): Environment {
  return { ...base, ...overrides };
}

export const SIT_WITH_ENTRY_EXIT: Environment = {
  ...SIT_ENVIRONMENT,
  entryComponentInstanceId: '10000000-0000-4000-8000-000000000001', // Kong API Gateway
  exitComponentInstanceId: '10000000-0000-4000-8000-000000000010', // Oracle BRM
};
