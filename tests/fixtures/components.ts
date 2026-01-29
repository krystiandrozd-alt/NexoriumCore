// Nexorium Core - Component Fixtures
// Deterministic component catalog test data

import type { Component } from '@prisma/client';

const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const UPDATED_AT = new Date('2026-01-15T10:00:00.000Z');

// ============================================
// STABLE COMPONENT IDS
// ============================================

export const COMPONENT_IDS = {
  // BSS Components
  AMDOCS_CRM: '40000000-0000-4000-8000-000000000001',
  NETCRACKER_SOM: '40000000-0000-4000-8000-000000000002',
  ORACLE_BRM: '40000000-0000-4000-8000-000000000003',
  SALESFORCE_CPQ: '40000000-0000-4000-8000-000000000004',
  // OSS Components
  NOKIA_NSP: '40000000-0000-4000-8000-000000000005',
  ERICSSON_ENM: '40000000-0000-4000-8000-000000000006',
  // Infrastructure
  ORACLE_DB: '40000000-0000-4000-8000-000000000007',
  POSTGRESQL: '40000000-0000-4000-8000-000000000008',
  KAFKA: '40000000-0000-4000-8000-000000000009',
  REDIS: '40000000-0000-4000-8000-000000000010',
  // Integration
  KONG_API_GW: '40000000-0000-4000-8000-000000000011',
  KEYCLOAK: '40000000-0000-4000-8000-000000000012',
} as const;

// ============================================
// BSS COMPONENT FIXTURES
// ============================================

export const AMDOCS_CRM_COMPONENT: Component = {
  id: COMPONENT_IDS.AMDOCS_CRM,
  name: 'Amdocs CRM',
  category: 'BSS',
  vendor: 'Amdocs',
  description: 'Customer Relationship Management system',
  layer: 'BSS',
  capabilityType: 'CRM',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const NETCRACKER_SOM_COMPONENT: Component = {
  id: COMPONENT_IDS.NETCRACKER_SOM,
  name: 'Netcracker SOM',
  category: 'BSS',
  vendor: 'Netcracker',
  description: 'Service Order Management',
  layer: 'BSS',
  capabilityType: 'SOM',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const ORACLE_BRM_COMPONENT: Component = {
  id: COMPONENT_IDS.ORACLE_BRM,
  name: 'Oracle BRM',
  category: 'BSS',
  vendor: 'Oracle',
  description: 'Billing and Revenue Management',
  layer: 'BSS',
  capabilityType: 'BILLING',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const SALESFORCE_CPQ_COMPONENT: Component = {
  id: COMPONENT_IDS.SALESFORCE_CPQ,
  name: 'Salesforce CPQ',
  category: 'BSS',
  vendor: 'Salesforce',
  description: 'Configure Price Quote',
  layer: 'BSS',
  capabilityType: 'CPQ',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// ============================================
// OSS COMPONENT FIXTURES
// ============================================

export const NOKIA_NSP_COMPONENT: Component = {
  id: COMPONENT_IDS.NOKIA_NSP,
  name: 'Nokia NSP',
  category: 'OSS',
  vendor: 'Nokia',
  description: 'Network Services Platform',
  layer: 'OSS',
  capabilityType: 'ORCHESTRATOR',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const ERICSSON_ENM_COMPONENT: Component = {
  id: COMPONENT_IDS.ERICSSON_ENM,
  name: 'Ericsson ENM',
  category: 'OSS',
  vendor: 'Ericsson',
  description: 'Ericsson Network Manager',
  layer: 'OSS',
  capabilityType: 'ORCHESTRATOR',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// ============================================
// INFRASTRUCTURE COMPONENT FIXTURES
// ============================================

export const ORACLE_DB_COMPONENT: Component = {
  id: COMPONENT_IDS.ORACLE_DB,
  name: 'Oracle Database',
  category: 'DATABASE',
  vendor: 'Oracle',
  description: 'Relational database',
  layer: 'INFRA',
  capabilityType: 'DB',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const POSTGRESQL_COMPONENT: Component = {
  id: COMPONENT_IDS.POSTGRESQL,
  name: 'PostgreSQL',
  category: 'DATABASE',
  vendor: 'PostgreSQL',
  description: 'Open-source relational database',
  layer: 'INFRA',
  capabilityType: 'DB',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const KAFKA_COMPONENT: Component = {
  id: COMPONENT_IDS.KAFKA,
  name: 'Apache Kafka',
  category: 'MESSAGING',
  vendor: 'Apache',
  description: 'Distributed event streaming platform',
  layer: 'INFRA',
  capabilityType: 'MQ',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const REDIS_COMPONENT: Component = {
  id: COMPONENT_IDS.REDIS,
  name: 'Redis',
  category: 'DATABASE',
  vendor: 'Redis Labs',
  description: 'In-memory data store',
  layer: 'INFRA',
  capabilityType: 'DB',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// ============================================
// INTEGRATION COMPONENT FIXTURES
// ============================================

export const KONG_API_GW_COMPONENT: Component = {
  id: COMPONENT_IDS.KONG_API_GW,
  name: 'Kong API Gateway',
  category: 'INTEGRATION',
  vendor: 'Kong',
  description: 'API Gateway and service mesh',
  layer: 'EXTERNAL',
  capabilityType: 'API_GW',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const KEYCLOAK_COMPONENT: Component = {
  id: COMPONENT_IDS.KEYCLOAK,
  name: 'Keycloak',
  category: 'SECURITY',
  vendor: 'Red Hat',
  description: 'Identity and access management',
  layer: 'INFRA',
  capabilityType: 'IDENTITY',
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// ============================================
// ALL COMPONENTS
// ============================================

export const ALL_COMPONENTS: Component[] = [
  AMDOCS_CRM_COMPONENT,
  NETCRACKER_SOM_COMPONENT,
  ORACLE_BRM_COMPONENT,
  SALESFORCE_CPQ_COMPONENT,
  NOKIA_NSP_COMPONENT,
  ERICSSON_ENM_COMPONENT,
  ORACLE_DB_COMPONENT,
  POSTGRESQL_COMPONENT,
  KAFKA_COMPONENT,
  REDIS_COMPONENT,
  KONG_API_GW_COMPONENT,
  KEYCLOAK_COMPONENT,
];

// ============================================
// COMPONENTS BY LAYER
// ============================================

export const BSS_COMPONENTS = [
  AMDOCS_CRM_COMPONENT,
  NETCRACKER_SOM_COMPONENT,
  ORACLE_BRM_COMPONENT,
  SALESFORCE_CPQ_COMPONENT,
];

export const OSS_COMPONENTS = [NOKIA_NSP_COMPONENT, ERICSSON_ENM_COMPONENT];

export const INFRA_COMPONENTS = [
  ORACLE_DB_COMPONENT,
  POSTGRESQL_COMPONENT,
  KAFKA_COMPONENT,
  REDIS_COMPONENT,
  KEYCLOAK_COMPONENT,
];

export const EXTERNAL_COMPONENTS = [KONG_API_GW_COMPONENT];
