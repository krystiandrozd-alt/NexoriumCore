// TelEnvIQ - Deployed Version Fixtures
// Deterministic deployed version test data

import type { DeployedVersion } from '@prisma/client';
import { INSTANCE_IDS } from './component-instances';

const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const UPDATED_AT = new Date('2026-01-15T10:00:00.000Z');
const INGESTED_AT = new Date('2026-01-10T08:00:00.000Z');
const CAPTURED_AT = new Date('2026-01-10T08:00:00.000Z');

// ============================================
// STABLE VERSION IDS
// ============================================

export const VERSION_IDS = {
  CRM_V1: '70000000-0000-4000-8000-000000000001',
  SOM_V1: '70000000-0000-4000-8000-000000000002',
  BRM_V1: '70000000-0000-4000-8000-000000000003',
  CPQ_V1: '70000000-0000-4000-8000-000000000004',
  NSP_V1: '70000000-0000-4000-8000-000000000005',
  ENM_V1: '70000000-0000-4000-8000-000000000006',
  ORACLE_DB_V1: '70000000-0000-4000-8000-000000000007',
  POSTGRESQL_V1: '70000000-0000-4000-8000-000000000008',
  KAFKA_V1: '70000000-0000-4000-8000-000000000009',
  REDIS_V1: '70000000-0000-4000-8000-000000000010',
  KONG_V1: '70000000-0000-4000-8000-000000000011',
  KEYCLOAK_V1: '70000000-0000-4000-8000-000000000012',
} as const;

// ============================================
// DEPLOYED VERSION FIXTURES
// ============================================

export const CRM_VERSION: DeployedVersion = {
  id: VERSION_IDS.CRM_V1,
  componentInstanceId: INSTANCE_IDS.AMDOCS_CRM,
  projectVersion: '21.3.1',
  vendorVersion: '21.3',
  buildRef: 'build-abc123',
  capturedAt: CAPTURED_AT,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const SOM_VERSION: DeployedVersion = {
  id: VERSION_IDS.SOM_V1,
  componentInstanceId: INSTANCE_IDS.NETCRACKER_SOM,
  projectVersion: '11.1.2',
  vendorVersion: '11.1',
  buildRef: 'build-def456',
  capturedAt: CAPTURED_AT,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const BRM_VERSION: DeployedVersion = {
  id: VERSION_IDS.BRM_V1,
  componentInstanceId: INSTANCE_IDS.ORACLE_BRM,
  projectVersion: '12.0.0.3',
  vendorVersion: '12.0',
  buildRef: 'patch-2024Q4',
  capturedAt: CAPTURED_AT,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const CPQ_VERSION: DeployedVersion = {
  id: VERSION_IDS.CPQ_V1,
  componentInstanceId: INSTANCE_IDS.SALESFORCE_CPQ,
  projectVersion: '2024.1.0',
  vendorVersion: 'Spring 24',
  buildRef: null,
  capturedAt: CAPTURED_AT,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const NSP_VERSION: DeployedVersion = {
  id: VERSION_IDS.NSP_V1,
  componentInstanceId: INSTANCE_IDS.NOKIA_NSP,
  projectVersion: '23.11',
  vendorVersion: '23.11',
  buildRef: 'release-2311',
  capturedAt: CAPTURED_AT,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const ENM_VERSION: DeployedVersion = {
  id: VERSION_IDS.ENM_V1,
  componentInstanceId: INSTANCE_IDS.ERICSSON_ENM,
  projectVersion: '23.4',
  vendorVersion: '23.4',
  buildRef: null,
  capturedAt: CAPTURED_AT,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const ORACLE_DB_VERSION: DeployedVersion = {
  id: VERSION_IDS.ORACLE_DB_V1,
  componentInstanceId: INSTANCE_IDS.ORACLE_DB,
  projectVersion: '19.19',
  vendorVersion: '19c',
  buildRef: null,
  capturedAt: CAPTURED_AT,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const POSTGRESQL_VERSION: DeployedVersion = {
  id: VERSION_IDS.POSTGRESQL_V1,
  componentInstanceId: INSTANCE_IDS.POSTGRESQL,
  projectVersion: '15.4',
  vendorVersion: '15',
  buildRef: null,
  capturedAt: CAPTURED_AT,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const KAFKA_VERSION: DeployedVersion = {
  id: VERSION_IDS.KAFKA_V1,
  componentInstanceId: INSTANCE_IDS.KAFKA,
  projectVersion: '3.6.0',
  vendorVersion: '3.6',
  buildRef: null,
  capturedAt: CAPTURED_AT,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const REDIS_VERSION: DeployedVersion = {
  id: VERSION_IDS.REDIS_V1,
  componentInstanceId: INSTANCE_IDS.REDIS,
  projectVersion: '7.2.3',
  vendorVersion: '7.2',
  buildRef: null,
  capturedAt: CAPTURED_AT,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const KONG_VERSION: DeployedVersion = {
  id: VERSION_IDS.KONG_V1,
  componentInstanceId: INSTANCE_IDS.KONG_API_GW,
  projectVersion: '3.4.0',
  vendorVersion: '3.4',
  buildRef: 'kong-3.4.0-alpine',
  capturedAt: CAPTURED_AT,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const KEYCLOAK_VERSION: DeployedVersion = {
  id: VERSION_IDS.KEYCLOAK_V1,
  componentInstanceId: INSTANCE_IDS.KEYCLOAK,
  projectVersion: '23.0.3',
  vendorVersion: '23.0',
  buildRef: null,
  capturedAt: CAPTURED_AT,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// ============================================
// ALL VERSIONS
// ============================================

export const ALL_VERSIONS: DeployedVersion[] = [
  CRM_VERSION,
  SOM_VERSION,
  BRM_VERSION,
  CPQ_VERSION,
  NSP_VERSION,
  ENM_VERSION,
  ORACLE_DB_VERSION,
  POSTGRESQL_VERSION,
  KAFKA_VERSION,
  REDIS_VERSION,
  KONG_VERSION,
  KEYCLOAK_VERSION,
];

// ============================================
// VERSION LOOKUP MAP
// ============================================

export const VERSION_BY_INSTANCE: Record<string, DeployedVersion> = {
  [INSTANCE_IDS.AMDOCS_CRM]: CRM_VERSION,
  [INSTANCE_IDS.NETCRACKER_SOM]: SOM_VERSION,
  [INSTANCE_IDS.ORACLE_BRM]: BRM_VERSION,
  [INSTANCE_IDS.SALESFORCE_CPQ]: CPQ_VERSION,
  [INSTANCE_IDS.NOKIA_NSP]: NSP_VERSION,
  [INSTANCE_IDS.ERICSSON_ENM]: ENM_VERSION,
  [INSTANCE_IDS.ORACLE_DB]: ORACLE_DB_VERSION,
  [INSTANCE_IDS.POSTGRESQL]: POSTGRESQL_VERSION,
  [INSTANCE_IDS.KAFKA]: KAFKA_VERSION,
  [INSTANCE_IDS.REDIS]: REDIS_VERSION,
  [INSTANCE_IDS.KONG_API_GW]: KONG_VERSION,
  [INSTANCE_IDS.KEYCLOAK]: KEYCLOAK_VERSION,
};
