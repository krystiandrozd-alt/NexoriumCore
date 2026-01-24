// TelEnvIQ - Network Context Fixtures
// Deterministic network context test data

import type { NetworkContext } from '@prisma/client';
import { ENV_IDS } from './environments';

const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const UPDATED_AT = new Date('2026-01-15T10:00:00.000Z');
const INGESTED_AT = new Date('2026-01-10T08:00:00.000Z');

// ============================================
// STABLE NETWORK CONTEXT IDS
// ============================================

export const NETWORK_CONTEXT_IDS = {
  BSS_VPC: '20000000-0000-4000-8000-000000000001',
  OSS_VPC: '20000000-0000-4000-8000-000000000002',
  ONPREM_DC: '20000000-0000-4000-8000-000000000003',
  DMZ: '20000000-0000-4000-8000-000000000004',
} as const;

// ============================================
// NETWORK CONTEXT FIXTURES
// ============================================

export const BSS_VPC_CONTEXT: NetworkContext = {
  id: NETWORK_CONTEXT_IDS.BSS_VPC,
  environmentId: ENV_IDS.SIT,
  hostingType: 'CLOUD',
  cloudProvider: 'AWS',
  region: 'ap-southeast-2',
  vpcVnet: 'vpc-bss-sit-001',
  subnetCidr: '10.10.0.0/16',
  zoneLabel: 'BSS-SIT',
  hasLoadBalancer: true,
  loadBalancerRef: 'alb-bss-sit-001',
  hasPrivateEndpoint: true,
  privateEndpointRef: 'vpce-bss-001',
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'vpc-bss-sit-001',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const OSS_VPC_CONTEXT: NetworkContext = {
  id: NETWORK_CONTEXT_IDS.OSS_VPC,
  environmentId: ENV_IDS.SIT,
  hostingType: 'CLOUD',
  cloudProvider: 'AWS',
  region: 'ap-southeast-2',
  vpcVnet: 'vpc-oss-sit-001',
  subnetCidr: '10.20.0.0/16',
  zoneLabel: 'OSS-SIT',
  hasLoadBalancer: true,
  loadBalancerRef: 'alb-oss-sit-001',
  hasPrivateEndpoint: false,
  privateEndpointRef: null,
  notes: null,
  sourceSystem: 'mock',
  sourceRecordId: 'vpc-oss-sit-001',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const ONPREM_DC_CONTEXT: NetworkContext = {
  id: NETWORK_CONTEXT_IDS.ONPREM_DC,
  environmentId: ENV_IDS.SIT,
  hostingType: 'ON_PREM',
  cloudProvider: null,
  region: 'Sydney DC1',
  vpcVnet: null,
  subnetCidr: '192.168.0.0/16',
  zoneLabel: 'Legacy Infrastructure',
  hasLoadBalancer: false,
  loadBalancerRef: null,
  hasPrivateEndpoint: false,
  privateEndpointRef: null,
  notes: 'Legacy on-premises data center',
  sourceSystem: 'mock',
  sourceRecordId: 'onprem-dc1',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const DMZ_CONTEXT: NetworkContext = {
  id: NETWORK_CONTEXT_IDS.DMZ,
  environmentId: ENV_IDS.SIT,
  hostingType: 'CLOUD',
  cloudProvider: 'AWS',
  region: 'ap-southeast-2',
  vpcVnet: 'vpc-dmz-sit-001',
  subnetCidr: '10.100.0.0/24',
  zoneLabel: 'DMZ',
  hasLoadBalancer: true,
  loadBalancerRef: 'alb-dmz-sit-001',
  hasPrivateEndpoint: false,
  privateEndpointRef: null,
  notes: 'External-facing DMZ',
  sourceSystem: 'mock',
  sourceRecordId: 'vpc-dmz-sit-001',
  ingestedAt: INGESTED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

// ============================================
// ALL NETWORK CONTEXTS
// ============================================

export const ALL_NETWORK_CONTEXTS: NetworkContext[] = [
  BSS_VPC_CONTEXT,
  OSS_VPC_CONTEXT,
  ONPREM_DC_CONTEXT,
  DMZ_CONTEXT,
];
