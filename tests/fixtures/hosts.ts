// Nexorium Core - Host Fixtures
// Deterministic host test data

import type { Host } from '@prisma/client';
import { ENV_IDS } from './environments';
import { NETWORK_CONTEXT_IDS } from './network-contexts';

const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const UPDATED_AT = new Date('2026-01-15T10:00:00.000Z');
const INGESTED_AT = new Date('2026-01-10T08:00:00.000Z');

// ============================================
// STABLE HOST IDS
// ============================================

export const HOST_IDS = {
  BSS_APP_01: '30000000-0000-4000-8000-000000000001',
  BSS_APP_02: '30000000-0000-4000-8000-000000000002',
  BSS_DB_01: '30000000-0000-4000-8000-000000000003',
  OSS_APP_01: '30000000-0000-4000-8000-000000000004',
  OSS_DB_01: '30000000-0000-4000-8000-000000000005',
  LEGACY_BRM: '30000000-0000-4000-8000-000000000006',
  API_GW_01: '30000000-0000-4000-8000-000000000007',
  MQ_BROKER_01: '30000000-0000-4000-8000-000000000008',
} as const;

// ============================================
// HOST FIXTURES
// ============================================

export const BSS_APP_01_HOST: Host = {
  id: HOST_IDS.BSS_APP_01,
  environmentId: ENV_IDS.SIT,
  networkContextId: NETWORK_CONTEXT_IDS.BSS_VPC,
  hostname: 'bss-app-01.sit.telco.local',
  ip: '10.10.1.10',
  natIp: null,
  os: 'RHEL 8.6',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'host-bss-app-01',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const BSS_APP_02_HOST: Host = {
  id: HOST_IDS.BSS_APP_02,
  environmentId: ENV_IDS.SIT,
  networkContextId: NETWORK_CONTEXT_IDS.BSS_VPC,
  hostname: 'bss-app-02.sit.telco.local',
  ip: '10.10.1.11',
  natIp: null,
  os: 'RHEL 8.6',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'host-bss-app-02',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const BSS_DB_01_HOST: Host = {
  id: HOST_IDS.BSS_DB_01,
  environmentId: ENV_IDS.SIT,
  networkContextId: NETWORK_CONTEXT_IDS.BSS_VPC,
  hostname: 'bss-db-01.sit.telco.local',
  ip: '10.10.2.10',
  natIp: null,
  os: 'RHEL 8.6',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'host-bss-db-01',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const OSS_APP_01_HOST: Host = {
  id: HOST_IDS.OSS_APP_01,
  environmentId: ENV_IDS.SIT,
  networkContextId: NETWORK_CONTEXT_IDS.OSS_VPC,
  hostname: 'oss-app-01.sit.telco.local',
  ip: '10.20.1.10',
  natIp: null,
  os: 'Ubuntu 22.04',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'host-oss-app-01',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const OSS_DB_01_HOST: Host = {
  id: HOST_IDS.OSS_DB_01,
  environmentId: ENV_IDS.SIT,
  networkContextId: NETWORK_CONTEXT_IDS.OSS_VPC,
  hostname: 'oss-db-01.sit.telco.local',
  ip: '10.20.2.10',
  natIp: null,
  os: 'Ubuntu 22.04',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'host-oss-db-01',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const LEGACY_BRM_HOST: Host = {
  id: HOST_IDS.LEGACY_BRM,
  environmentId: ENV_IDS.SIT,
  networkContextId: NETWORK_CONTEXT_IDS.ONPREM_DC,
  hostname: 'legacy-brm-01.dc1.telco.local',
  ip: '192.168.1.50',
  natIp: '203.0.113.50',
  os: 'Solaris 11',
  notes: 'Legacy billing system',
  sourceSystem: 'mock',
  sourceRecordId: 'host-legacy-brm-01',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const API_GW_01_HOST: Host = {
  id: HOST_IDS.API_GW_01,
  environmentId: ENV_IDS.SIT,
  networkContextId: NETWORK_CONTEXT_IDS.DMZ,
  hostname: 'api-gw-01.sit.telco.local',
  ip: '10.100.0.10',
  natIp: '203.0.113.10',
  os: 'Alpine Linux',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'host-api-gw-01',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const MQ_BROKER_01_HOST: Host = {
  id: HOST_IDS.MQ_BROKER_01,
  environmentId: ENV_IDS.SIT,
  networkContextId: NETWORK_CONTEXT_IDS.BSS_VPC,
  hostname: 'mq-broker-01.sit.telco.local',
  ip: '10.10.100.20',
  natIp: null,
  os: 'RHEL 8.6',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'host-mq-broker-01',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// ============================================
// ALL HOSTS
// ============================================

export const ALL_HOSTS: Host[] = [
  BSS_APP_01_HOST,
  BSS_APP_02_HOST,
  BSS_DB_01_HOST,
  OSS_APP_01_HOST,
  OSS_DB_01_HOST,
  LEGACY_BRM_HOST,
  API_GW_01_HOST,
  MQ_BROKER_01_HOST,
];
