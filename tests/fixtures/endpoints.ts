// TelEnvIQ - Endpoint Fixtures
// Deterministic endpoint test data

import type { Endpoint } from '@prisma/client';
import { INSTANCE_IDS } from './component-instances';

const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const UPDATED_AT = new Date('2026-01-15T10:00:00.000Z');
const INGESTED_AT = new Date('2026-01-10T08:00:00.000Z');

// ============================================
// STABLE ENDPOINT IDS
// ============================================

export const ENDPOINT_IDS = {
  CRM_HTTPS: '60000000-0000-4000-8000-000000000001',
  SOM_HTTPS: '60000000-0000-4000-8000-000000000002',
  BRM_HTTPS: '60000000-0000-4000-8000-000000000003',
  BRM_TCP: '60000000-0000-4000-8000-000000000004',
  ORACLE_DB_JDBC: '60000000-0000-4000-8000-000000000005',
  POSTGRESQL_JDBC: '60000000-0000-4000-8000-000000000006',
  KAFKA_TCP: '60000000-0000-4000-8000-000000000007',
  REDIS_TCP: '60000000-0000-4000-8000-000000000008',
  KONG_HTTP: '60000000-0000-4000-8000-000000000009',
  KONG_HTTPS: '60000000-0000-4000-8000-000000000010',
  KEYCLOAK_HTTP: '60000000-0000-4000-8000-000000000011',
} as const;

// ============================================
// ENDPOINT FIXTURES
// ============================================

export const CRM_HTTPS_ENDPOINT: Endpoint = {
  id: ENDPOINT_IDS.CRM_HTTPS,
  componentInstanceId: INSTANCE_IDS.AMDOCS_CRM,
  kind: 'URL',
  value: 'https://amdocs-crm-sit:8443',
  port: 8443,
  scheme: 'HTTPS',
  basePath: '/api/v1',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const SOM_HTTPS_ENDPOINT: Endpoint = {
  id: ENDPOINT_IDS.SOM_HTTPS,
  componentInstanceId: INSTANCE_IDS.NETCRACKER_SOM,
  kind: 'URL',
  value: 'https://netcracker-som-sit:443',
  port: 443,
  scheme: 'HTTPS',
  basePath: '/som/api',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const BRM_HTTPS_ENDPOINT: Endpoint = {
  id: ENDPOINT_IDS.BRM_HTTPS,
  componentInstanceId: INSTANCE_IDS.ORACLE_BRM,
  kind: 'URL',
  value: 'https://oracle-brm-sit:443',
  port: 443,
  scheme: 'HTTPS',
  basePath: '/BRMWebServices',
  notes: 'SOAP endpoint',
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const BRM_TCP_ENDPOINT: Endpoint = {
  id: ENDPOINT_IDS.BRM_TCP,
  componentInstanceId: INSTANCE_IDS.ORACLE_BRM,
  kind: 'IP',
  value: '192.168.1.50',
  port: 11960,
  scheme: 'TCP',
  basePath: null,
  notes: 'Native BRM protocol',
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const ORACLE_DB_JDBC_ENDPOINT: Endpoint = {
  id: ENDPOINT_IDS.ORACLE_DB_JDBC,
  componentInstanceId: INSTANCE_IDS.ORACLE_DB,
  kind: 'HOSTNAME',
  value: 'bss-db-01.sit.telco.local',
  port: 1521,
  scheme: 'JDBC',
  basePath: null,
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const POSTGRESQL_JDBC_ENDPOINT: Endpoint = {
  id: ENDPOINT_IDS.POSTGRESQL_JDBC,
  componentInstanceId: INSTANCE_IDS.POSTGRESQL,
  kind: 'HOSTNAME',
  value: 'oss-db-01.sit.telco.local',
  port: 5432,
  scheme: 'JDBC',
  basePath: null,
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const KAFKA_TCP_ENDPOINT: Endpoint = {
  id: ENDPOINT_IDS.KAFKA_TCP,
  componentInstanceId: INSTANCE_IDS.KAFKA,
  kind: 'HOSTNAME',
  value: 'mq-broker-01.sit.telco.local',
  port: 9092,
  scheme: 'TCP',
  basePath: null,
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const REDIS_TCP_ENDPOINT: Endpoint = {
  id: ENDPOINT_IDS.REDIS_TCP,
  componentInstanceId: INSTANCE_IDS.REDIS,
  kind: 'HOSTNAME',
  value: 'bss-app-01.sit.telco.local',
  port: 6379,
  scheme: 'TCP',
  basePath: null,
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const KONG_HTTP_ENDPOINT: Endpoint = {
  id: ENDPOINT_IDS.KONG_HTTP,
  componentInstanceId: INSTANCE_IDS.KONG_API_GW,
  kind: 'URL',
  value: 'http://api-gw-01.sit.telco.local:8000',
  port: 8000,
  scheme: 'HTTP',
  basePath: null,
  notes: 'Internal HTTP endpoint',
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const KONG_HTTPS_ENDPOINT: Endpoint = {
  id: ENDPOINT_IDS.KONG_HTTPS,
  componentInstanceId: INSTANCE_IDS.KONG_API_GW,
  kind: 'URL',
  value: 'https://api.sit.telco.local:443',
  port: 443,
  scheme: 'HTTPS',
  basePath: '/api',
  notes: 'Public HTTPS endpoint',
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const KEYCLOAK_HTTP_ENDPOINT: Endpoint = {
  id: ENDPOINT_IDS.KEYCLOAK_HTTP,
  componentInstanceId: INSTANCE_IDS.KEYCLOAK,
  kind: 'URL',
  value: 'http://keycloak-sit:8080',
  port: 8080,
  scheme: 'HTTP',
  basePath: '/auth',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: null,
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// ============================================
// ALL ENDPOINTS
// ============================================

export const ALL_ENDPOINTS: Endpoint[] = [
  CRM_HTTPS_ENDPOINT,
  SOM_HTTPS_ENDPOINT,
  BRM_HTTPS_ENDPOINT,
  BRM_TCP_ENDPOINT,
  ORACLE_DB_JDBC_ENDPOINT,
  POSTGRESQL_JDBC_ENDPOINT,
  KAFKA_TCP_ENDPOINT,
  REDIS_TCP_ENDPOINT,
  KONG_HTTP_ENDPOINT,
  KONG_HTTPS_ENDPOINT,
  KEYCLOAK_HTTP_ENDPOINT,
];
