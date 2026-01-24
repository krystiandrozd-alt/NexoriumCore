// TelEnvIQ - Connection Fixtures
// Deterministic connection test data

import type { Connection } from '@prisma/client';
import { ENV_IDS } from './environments';
import { INSTANCE_IDS } from './component-instances';

const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const UPDATED_AT = new Date('2026-01-15T10:00:00.000Z');
const INGESTED_AT = new Date('2026-01-10T08:00:00.000Z');

// ============================================
// STABLE CONNECTION IDS
// ============================================

export const CONNECTION_IDS = {
  // API Gateway -> BSS
  KONG_TO_CRM: '50000000-0000-4000-8000-000000000001',
  KONG_TO_SOM: '50000000-0000-4000-8000-000000000002',
  // CRM -> SOM
  CRM_TO_SOM: '50000000-0000-4000-8000-000000000003',
  // SOM -> BRM
  SOM_TO_BRM: '50000000-0000-4000-8000-000000000004',
  // CRM -> DB
  CRM_TO_ORACLE_DB: '50000000-0000-4000-8000-000000000005',
  // SOM -> DB
  SOM_TO_POSTGRESQL: '50000000-0000-4000-8000-000000000006',
  // CRM -> Kafka
  CRM_TO_KAFKA: '50000000-0000-4000-8000-000000000007',
  // SOM -> Kafka
  SOM_TO_KAFKA: '50000000-0000-4000-8000-000000000008',
  // Kong -> Keycloak
  KONG_TO_KEYCLOAK: '50000000-0000-4000-8000-000000000009',
  // Kong -> Redis
  KONG_TO_REDIS: '50000000-0000-4000-8000-000000000010',
  // NSP -> ENM
  NSP_TO_ENM: '50000000-0000-4000-8000-000000000011',
  // NSP -> PostgreSQL
  NSP_TO_POSTGRESQL: '50000000-0000-4000-8000-000000000012',
} as const;

// ============================================
// CONNECTION FIXTURES
// ============================================

// API Gateway to BSS Services
export const KONG_TO_CRM_CONNECTION: Connection = {
  id: CONNECTION_IDS.KONG_TO_CRM,
  environmentId: ENV_IDS.SIT,
  fromComponentInstanceId: INSTANCE_IDS.KONG_API_GW,
  toComponentInstanceId: INSTANCE_IDS.AMDOCS_CRM,
  protocolType: 'REST',
  protocolDetail: '/api/v1/customers',
  port: 8443,
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'conn-kong-crm',
  ingestedAt: INGESTED_AT,
  origin: 'INGESTED',
  confidence: 'HIGH',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const KONG_TO_SOM_CONNECTION: Connection = {
  id: CONNECTION_IDS.KONG_TO_SOM,
  environmentId: ENV_IDS.SIT,
  fromComponentInstanceId: INSTANCE_IDS.KONG_API_GW,
  toComponentInstanceId: INSTANCE_IDS.NETCRACKER_SOM,
  protocolType: 'REST',
  protocolDetail: 'TMF641',
  port: 443,
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'conn-kong-som',
  ingestedAt: INGESTED_AT,
  origin: 'INGESTED',
  confidence: 'HIGH',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// BSS Internal Connections
export const CRM_TO_SOM_CONNECTION: Connection = {
  id: CONNECTION_IDS.CRM_TO_SOM,
  environmentId: ENV_IDS.SIT,
  fromComponentInstanceId: INSTANCE_IDS.AMDOCS_CRM,
  toComponentInstanceId: INSTANCE_IDS.NETCRACKER_SOM,
  protocolType: 'REST',
  protocolDetail: 'TMF622',
  port: 443,
  notes: 'Order submission flow',
  sourceSystem: 'mock',
  sourceRecordId: 'conn-crm-som',
  ingestedAt: INGESTED_AT,
  origin: 'INGESTED',
  confidence: 'HIGH',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const SOM_TO_BRM_CONNECTION: Connection = {
  id: CONNECTION_IDS.SOM_TO_BRM,
  environmentId: ENV_IDS.SIT,
  fromComponentInstanceId: INSTANCE_IDS.NETCRACKER_SOM,
  toComponentInstanceId: INSTANCE_IDS.ORACLE_BRM,
  protocolType: 'SOAP',
  protocolDetail: '/BRMWebServices',
  port: 443,
  notes: 'Billing integration',
  sourceSystem: 'mock',
  sourceRecordId: 'conn-som-brm',
  ingestedAt: INGESTED_AT,
  origin: 'INGESTED',
  confidence: 'HIGH',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// Database Connections
export const CRM_TO_ORACLE_DB_CONNECTION: Connection = {
  id: CONNECTION_IDS.CRM_TO_ORACLE_DB,
  environmentId: ENV_IDS.SIT,
  fromComponentInstanceId: INSTANCE_IDS.AMDOCS_CRM,
  toComponentInstanceId: INSTANCE_IDS.ORACLE_DB,
  protocolType: 'JDBC',
  protocolDetail: 'oracle:thin:@',
  port: 1521,
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'conn-crm-oracledb',
  ingestedAt: INGESTED_AT,
  origin: 'INGESTED',
  confidence: 'HIGH',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const SOM_TO_POSTGRESQL_CONNECTION: Connection = {
  id: CONNECTION_IDS.SOM_TO_POSTGRESQL,
  environmentId: ENV_IDS.SIT,
  fromComponentInstanceId: INSTANCE_IDS.NETCRACKER_SOM,
  toComponentInstanceId: INSTANCE_IDS.POSTGRESQL,
  protocolType: 'JDBC',
  protocolDetail: 'postgresql://',
  port: 5432,
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'conn-som-postgresql',
  ingestedAt: INGESTED_AT,
  origin: 'INGESTED',
  confidence: 'HIGH',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// Messaging Connections
export const CRM_TO_KAFKA_CONNECTION: Connection = {
  id: CONNECTION_IDS.CRM_TO_KAFKA,
  environmentId: ENV_IDS.SIT,
  fromComponentInstanceId: INSTANCE_IDS.AMDOCS_CRM,
  toComponentInstanceId: INSTANCE_IDS.KAFKA,
  protocolType: 'MQ',
  protocolDetail: 'customer-events',
  port: 9092,
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'conn-crm-kafka',
  ingestedAt: INGESTED_AT,
  origin: 'INGESTED',
  confidence: 'HIGH',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const SOM_TO_KAFKA_CONNECTION: Connection = {
  id: CONNECTION_IDS.SOM_TO_KAFKA,
  environmentId: ENV_IDS.SIT,
  fromComponentInstanceId: INSTANCE_IDS.NETCRACKER_SOM,
  toComponentInstanceId: INSTANCE_IDS.KAFKA,
  protocolType: 'MQ',
  protocolDetail: 'order-events',
  port: 9092,
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'conn-som-kafka',
  ingestedAt: INGESTED_AT,
  origin: 'INGESTED',
  confidence: 'HIGH',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// Integration Connections
export const KONG_TO_KEYCLOAK_CONNECTION: Connection = {
  id: CONNECTION_IDS.KONG_TO_KEYCLOAK,
  environmentId: ENV_IDS.SIT,
  fromComponentInstanceId: INSTANCE_IDS.KONG_API_GW,
  toComponentInstanceId: INSTANCE_IDS.KEYCLOAK,
  protocolType: 'REST',
  protocolDetail: '/auth/realms',
  port: 8080,
  notes: 'OAuth2 token validation',
  sourceSystem: 'mock',
  sourceRecordId: 'conn-kong-keycloak',
  ingestedAt: INGESTED_AT,
  origin: 'INGESTED',
  confidence: 'HIGH',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const KONG_TO_REDIS_CONNECTION: Connection = {
  id: CONNECTION_IDS.KONG_TO_REDIS,
  environmentId: ENV_IDS.SIT,
  fromComponentInstanceId: INSTANCE_IDS.KONG_API_GW,
  toComponentInstanceId: INSTANCE_IDS.REDIS,
  protocolType: 'TCP',
  protocolDetail: null,
  port: 6379,
  notes: 'Rate limiting cache',
  sourceSystem: 'mock',
  sourceRecordId: 'conn-kong-redis',
  ingestedAt: INGESTED_AT,
  origin: 'INGESTED',
  confidence: 'HIGH',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// OSS Connections
export const NSP_TO_ENM_CONNECTION: Connection = {
  id: CONNECTION_IDS.NSP_TO_ENM,
  environmentId: ENV_IDS.SIT,
  fromComponentInstanceId: INSTANCE_IDS.NOKIA_NSP,
  toComponentInstanceId: INSTANCE_IDS.ERICSSON_ENM,
  protocolType: 'REST',
  protocolDetail: 'NETCONF',
  port: 443,
  notes: 'Network orchestration',
  sourceSystem: 'mock',
  sourceRecordId: 'conn-nsp-enm',
  ingestedAt: INGESTED_AT,
  origin: 'INGESTED',
  confidence: 'MED',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const NSP_TO_POSTGRESQL_CONNECTION: Connection = {
  id: CONNECTION_IDS.NSP_TO_POSTGRESQL,
  environmentId: ENV_IDS.SIT,
  fromComponentInstanceId: INSTANCE_IDS.NOKIA_NSP,
  toComponentInstanceId: INSTANCE_IDS.POSTGRESQL,
  protocolType: 'JDBC',
  protocolDetail: null,
  port: 5432,
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'conn-nsp-postgresql',
  ingestedAt: INGESTED_AT,
  origin: 'INGESTED',
  confidence: 'HIGH',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// ============================================
// MANUAL CONNECTION (for testing provenance)
// ============================================

export const MANUAL_CONNECTION: Connection = {
  id: '50000000-0000-4000-8000-000000000099',
  environmentId: ENV_IDS.SIT,
  fromComponentInstanceId: INSTANCE_IDS.SALESFORCE_CPQ,
  toComponentInstanceId: INSTANCE_IDS.AMDOCS_CRM,
  protocolType: 'REST',
  protocolDetail: '/api/quotes',
  port: 443,
  notes: 'Manually added connection',
  sourceSystem: null,
  sourceRecordId: null,
  ingestedAt: null,
  origin: 'MANUAL',
  confidence: 'LOW',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// ============================================
// ALL CONNECTIONS
// ============================================

export const ALL_CONNECTIONS: Connection[] = [
  KONG_TO_CRM_CONNECTION,
  KONG_TO_SOM_CONNECTION,
  CRM_TO_SOM_CONNECTION,
  SOM_TO_BRM_CONNECTION,
  CRM_TO_ORACLE_DB_CONNECTION,
  SOM_TO_POSTGRESQL_CONNECTION,
  CRM_TO_KAFKA_CONNECTION,
  SOM_TO_KAFKA_CONNECTION,
  KONG_TO_KEYCLOAK_CONNECTION,
  KONG_TO_REDIS_CONNECTION,
  NSP_TO_ENM_CONNECTION,
  NSP_TO_POSTGRESQL_CONNECTION,
];

// Including manual connection
export const ALL_CONNECTIONS_WITH_MANUAL: Connection[] = [...ALL_CONNECTIONS, MANUAL_CONNECTION];
