// TelEnvIQ - Component Instance Fixtures
// Deterministic component instance test data

import type { ComponentInstance } from '@prisma/client';
import { ENV_IDS } from './environments';
import { HOST_IDS } from './hosts';
import { COMPONENT_IDS } from './components';

const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const UPDATED_AT = new Date('2026-01-15T10:00:00.000Z');
const INGESTED_AT = new Date('2026-01-10T08:00:00.000Z');

// ============================================
// STABLE INSTANCE IDS
// ============================================

export const INSTANCE_IDS = {
  // BSS Instances
  AMDOCS_CRM: '10000000-0000-4000-8000-000000000001',
  NETCRACKER_SOM: '10000000-0000-4000-8000-000000000002',
  ORACLE_BRM: '10000000-0000-4000-8000-000000000003',
  SALESFORCE_CPQ: '10000000-0000-4000-8000-000000000004',
  // OSS Instances
  NOKIA_NSP: '10000000-0000-4000-8000-000000000005',
  ERICSSON_ENM: '10000000-0000-4000-8000-000000000006',
  // Infrastructure Instances
  ORACLE_DB: '10000000-0000-4000-8000-000000000007',
  POSTGRESQL: '10000000-0000-4000-8000-000000000008',
  KAFKA: '10000000-0000-4000-8000-000000000009',
  REDIS: '10000000-0000-4000-8000-000000000010',
  // Integration Instances
  KONG_API_GW: '10000000-0000-4000-8000-000000000011',
  KEYCLOAK: '10000000-0000-4000-8000-000000000012',
} as const;

// ============================================
// BSS INSTANCE FIXTURES
// ============================================

export const AMDOCS_CRM_INSTANCE: ComponentInstance = {
  id: INSTANCE_IDS.AMDOCS_CRM,
  environmentId: ENV_IDS.SIT,
  componentId: COMPONENT_IDS.AMDOCS_CRM,
  hostId: HOST_IDS.BSS_APP_01,
  displayName: 'Amdocs CRM (SIT)',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'amdocs-crm-sit',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const NETCRACKER_SOM_INSTANCE: ComponentInstance = {
  id: INSTANCE_IDS.NETCRACKER_SOM,
  environmentId: ENV_IDS.SIT,
  componentId: COMPONENT_IDS.NETCRACKER_SOM,
  hostId: HOST_IDS.BSS_APP_02,
  displayName: 'Netcracker SOM (SIT)',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'netcracker-som-sit',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const ORACLE_BRM_INSTANCE: ComponentInstance = {
  id: INSTANCE_IDS.ORACLE_BRM,
  environmentId: ENV_IDS.SIT,
  componentId: COMPONENT_IDS.ORACLE_BRM,
  hostId: HOST_IDS.LEGACY_BRM,
  displayName: 'Oracle BRM (SIT)',
  notes: 'Legacy billing system',
  sourceSystem: 'mock',
  sourceRecordId: 'oracle-brm-sit',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const SALESFORCE_CPQ_INSTANCE: ComponentInstance = {
  id: INSTANCE_IDS.SALESFORCE_CPQ,
  environmentId: ENV_IDS.SIT,
  componentId: COMPONENT_IDS.SALESFORCE_CPQ,
  hostId: HOST_IDS.BSS_APP_02,
  displayName: 'Salesforce CPQ (SIT)',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'salesforce-cpq-sit',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// ============================================
// OSS INSTANCE FIXTURES
// ============================================

export const NOKIA_NSP_INSTANCE: ComponentInstance = {
  id: INSTANCE_IDS.NOKIA_NSP,
  environmentId: ENV_IDS.SIT,
  componentId: COMPONENT_IDS.NOKIA_NSP,
  hostId: HOST_IDS.OSS_APP_01,
  displayName: 'Nokia NSP (SIT)',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'nokia-nsp-sit',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const ERICSSON_ENM_INSTANCE: ComponentInstance = {
  id: INSTANCE_IDS.ERICSSON_ENM,
  environmentId: ENV_IDS.SIT,
  componentId: COMPONENT_IDS.ERICSSON_ENM,
  hostId: HOST_IDS.OSS_APP_01,
  displayName: 'Ericsson ENM (SIT)',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'ericsson-enm-sit',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// ============================================
// INFRASTRUCTURE INSTANCE FIXTURES
// ============================================

export const ORACLE_DB_INSTANCE: ComponentInstance = {
  id: INSTANCE_IDS.ORACLE_DB,
  environmentId: ENV_IDS.SIT,
  componentId: COMPONENT_IDS.ORACLE_DB,
  hostId: HOST_IDS.BSS_DB_01,
  displayName: 'Oracle Database (SIT)',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'oracle-db-sit',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const POSTGRESQL_INSTANCE: ComponentInstance = {
  id: INSTANCE_IDS.POSTGRESQL,
  environmentId: ENV_IDS.SIT,
  componentId: COMPONENT_IDS.POSTGRESQL,
  hostId: HOST_IDS.OSS_DB_01,
  displayName: 'PostgreSQL (SIT)',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'postgresql-sit',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const KAFKA_INSTANCE: ComponentInstance = {
  id: INSTANCE_IDS.KAFKA,
  environmentId: ENV_IDS.SIT,
  componentId: COMPONENT_IDS.KAFKA,
  hostId: HOST_IDS.MQ_BROKER_01,
  displayName: 'Apache Kafka (SIT)',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'kafka-sit',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const REDIS_INSTANCE: ComponentInstance = {
  id: INSTANCE_IDS.REDIS,
  environmentId: ENV_IDS.SIT,
  componentId: COMPONENT_IDS.REDIS,
  hostId: HOST_IDS.BSS_APP_01,
  displayName: 'Redis (SIT)',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'redis-sit',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// ============================================
// INTEGRATION INSTANCE FIXTURES
// ============================================

export const KONG_API_GW_INSTANCE: ComponentInstance = {
  id: INSTANCE_IDS.KONG_API_GW,
  environmentId: ENV_IDS.SIT,
  componentId: COMPONENT_IDS.KONG_API_GW,
  hostId: HOST_IDS.API_GW_01,
  displayName: 'Kong API Gateway (SIT)',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'kong-api-gw-sit',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const KEYCLOAK_INSTANCE: ComponentInstance = {
  id: INSTANCE_IDS.KEYCLOAK,
  environmentId: ENV_IDS.SIT,
  componentId: COMPONENT_IDS.KEYCLOAK,
  hostId: HOST_IDS.BSS_APP_01,
  displayName: 'Keycloak (SIT)',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'keycloak-sit',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// ============================================
// ALL INSTANCES
// ============================================

export const ALL_INSTANCES: ComponentInstance[] = [
  AMDOCS_CRM_INSTANCE,
  NETCRACKER_SOM_INSTANCE,
  ORACLE_BRM_INSTANCE,
  SALESFORCE_CPQ_INSTANCE,
  NOKIA_NSP_INSTANCE,
  ERICSSON_ENM_INSTANCE,
  ORACLE_DB_INSTANCE,
  POSTGRESQL_INSTANCE,
  KAFKA_INSTANCE,
  REDIS_INSTANCE,
  KONG_API_GW_INSTANCE,
  KEYCLOAK_INSTANCE,
];

// ============================================
// INSTANCES BY LAYER (for graph analysis tests)
// ============================================

export const BSS_INSTANCES = [
  AMDOCS_CRM_INSTANCE,
  NETCRACKER_SOM_INSTANCE,
  ORACLE_BRM_INSTANCE,
  SALESFORCE_CPQ_INSTANCE,
];

export const OSS_INSTANCES = [NOKIA_NSP_INSTANCE, ERICSSON_ENM_INSTANCE];

export const INFRA_INSTANCES = [
  ORACLE_DB_INSTANCE,
  POSTGRESQL_INSTANCE,
  KAFKA_INSTANCE,
  REDIS_INSTANCE,
  KEYCLOAK_INSTANCE,
];

export const EXTERNAL_INSTANCES = [KONG_API_GW_INSTANCE];
