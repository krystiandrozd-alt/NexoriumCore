// Nexorium Core - Flow Map V2 Data Model
// Multi-level data model for Level 0 (Pipeline) and Level 1 (Environment Detail)

import type { FlowMapStageKey, FlowMapDomain } from '@/types/flow-map-v2';

// ============================================
// LEVEL 0 - PIPELINE VIEW TYPES
// ============================================

export interface L0Environment {
  id: string;
  name: string;
  stageKey: FlowMapStageKey;
  description: string;
  systemCount: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface L0Link {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'PROMOTION' | 'DATA_SYNC';
}

export interface L0Data {
  environments: L0Environment[];
  links: L0Link[];
}

// ============================================
// LEVEL 1 - ENVIRONMENT DETAIL TYPES
// ============================================

export type L1NodeType =
  | 'SERVER'
  | 'DATABASE'
  | 'API_SERVICE'
  | 'QUEUE'
  | 'LOAD_BALANCER'
  | 'CLOUD_SERVICE'
  | 'STORAGE'
  | 'EXTERNAL_SYSTEM';

export type HostingPlatform = 'GCP' | 'Azure' | 'AWS' | 'VMware' | 'Hyper-V' | 'KVM' | 'Bare Metal';
export type DeploymentType = 'cloud' | 'on-prem';

export interface L1Node {
  id: string;
  name: string;
  type: L1NodeType;
  domain: FlowMapDomain;
  version?: string;
  hostname?: string;
  description?: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  x?: number;
  y?: number;
  // Infrastructure details
  ip?: string;
  subnet?: string;
  hostingPlatform?: HostingPlatform;
  deploymentType?: DeploymentType;
  datacenter?: string;        // For on-prem
  vnetSegment?: string;       // For cloud (virtual network segment)
  // API-specific (for API_SERVICE type)
  listenPort?: number;
  // Database-specific
  databaseType?: 'Oracle' | 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'Redis' | 'SQLServer' | 'Other';
  databaseVersion?: string;
  // Server/Application-specific - deployed component info
  deployedComponent?: string;  // e.g., "Tacton CPQ"
  deployedVersion?: string;    // e.g., "v29.1 Patch 2"
  vendor?: string;             // e.g., "Tacton", "Salesforce", "Amdocs"
}

// ============================================
// SYSTEMS CATALOG - Available systems to add
// ============================================

export type SystemLayer = 'BSS' | 'OSS' | 'INFRA' | 'EXTERNAL';
export type SystemCapability = 'CPQ' | 'CRM' | 'BILLING' | 'SOM' | 'INVENTORY' | 'ORCHESTRATOR' | 'DB' | 'MQ' | 'API_GW' | 'IDENTITY' | 'ITSM' | 'OTHER';

export interface SystemDefinition {
  id: string;
  name: string;
  description: string;
  layer: SystemLayer;
  capability: SystemCapability;
  vendor?: string;
  defaultType: L1NodeType;
}

export const SYSTEMS_CATALOG: SystemDefinition[] = [
  // BSS Layer
  { id: 'sys-api-gateway', name: 'API-Gateway', description: 'API Gateway for external traffic', layer: 'BSS', capability: 'API_GW', vendor: 'Kong', defaultType: 'LOAD_BALANCER' },
  { id: 'sys-crm', name: 'CRM-System', description: 'Customer Relationship Management', layer: 'BSS', capability: 'CRM', vendor: 'Salesforce', defaultType: 'API_SERVICE' },
  { id: 'sys-cpq', name: 'CPQ-Engine', description: 'Configure-Price-Quote Engine', layer: 'BSS', capability: 'CPQ', vendor: 'Tacton', defaultType: 'API_SERVICE' },
  { id: 'sys-billing', name: 'Billing-System', description: 'Revenue Management & Billing', layer: 'BSS', capability: 'BILLING', vendor: 'Amdocs', defaultType: 'API_SERVICE' },
  { id: 'sys-product-catalog', name: 'Product-Catalog', description: 'Product & Offer Catalog Service', layer: 'BSS', capability: 'OTHER', vendor: 'Internal', defaultType: 'API_SERVICE' },
  { id: 'sys-identity', name: 'Identity-Manager', description: 'Identity & Access Management', layer: 'BSS', capability: 'IDENTITY', vendor: 'Okta', defaultType: 'API_SERVICE' },

  // OSS Layer
  { id: 'sys-oms', name: 'Order-Management', description: 'Order Management System', layer: 'OSS', capability: 'SOM', vendor: 'Oracle', defaultType: 'API_SERVICE' },
  { id: 'sys-orchestrator', name: 'Order-Orchestrator', description: 'Order Orchestration Service', layer: 'OSS', capability: 'ORCHESTRATOR', vendor: 'Internal', defaultType: 'API_SERVICE' },
  { id: 'sys-inventory', name: 'Inventory-Service', description: 'Resource & Service Inventory', layer: 'OSS', capability: 'INVENTORY', vendor: 'Nokia', defaultType: 'API_SERVICE' },
  { id: 'sys-provisioning', name: 'Provisioning-Engine', description: 'Service Provisioning Engine', layer: 'OSS', capability: 'ORCHESTRATOR', vendor: 'Ericsson', defaultType: 'API_SERVICE' },
  { id: 'sys-nso', name: 'Cisco-NSO', description: 'Network Service Orchestrator', layer: 'OSS', capability: 'ORCHESTRATOR', vendor: 'Cisco', defaultType: 'API_SERVICE' },
  { id: 'sys-service-assurance', name: 'Service-Assurance', description: 'Service Assurance Platform', layer: 'OSS', capability: 'OTHER', vendor: 'Nokia', defaultType: 'API_SERVICE' },
  { id: 'sys-alarm-manager', name: 'Alarm-Manager', description: 'Alarm Management Service', layer: 'OSS', capability: 'OTHER', vendor: 'Internal', defaultType: 'API_SERVICE' },
  { id: 'sys-itsm', name: 'ServiceNow-ITSM', description: 'IT Service Management', layer: 'OSS', capability: 'ITSM', vendor: 'ServiceNow', defaultType: 'API_SERVICE' },

  // INFRA Layer
  { id: 'sys-oracle-db', name: 'Oracle-Database', description: 'Oracle RAC Database', layer: 'INFRA', capability: 'DB', vendor: 'Oracle', defaultType: 'DATABASE' },
  { id: 'sys-postgres-db', name: 'PostgreSQL-Database', description: 'PostgreSQL Database', layer: 'INFRA', capability: 'DB', vendor: 'PostgreSQL', defaultType: 'DATABASE' },
  { id: 'sys-mysql-db', name: 'MySQL-Database', description: 'MySQL/MariaDB Database', layer: 'INFRA', capability: 'DB', vendor: 'MySQL', defaultType: 'DATABASE' },
  { id: 'sys-mongodb', name: 'MongoDB-Database', description: 'MongoDB Document Store', layer: 'INFRA', capability: 'DB', vendor: 'MongoDB', defaultType: 'DATABASE' },
  { id: 'sys-redis', name: 'Redis-Cache', description: 'Redis Cache Cluster', layer: 'INFRA', capability: 'DB', vendor: 'Redis', defaultType: 'DATABASE' },
  { id: 'sys-kafka', name: 'Kafka-Cluster', description: 'Apache Kafka Message Broker', layer: 'INFRA', capability: 'MQ', vendor: 'Apache', defaultType: 'QUEUE' },
  { id: 'sys-rabbitmq', name: 'RabbitMQ-Broker', description: 'RabbitMQ Message Broker', layer: 'INFRA', capability: 'MQ', vendor: 'VMware', defaultType: 'QUEUE' },
  { id: 'sys-activemq', name: 'ActiveMQ-Broker', description: 'Apache ActiveMQ', layer: 'INFRA', capability: 'MQ', vendor: 'Apache', defaultType: 'QUEUE' },
  { id: 'sys-f5-lb', name: 'F5-Load-Balancer', description: 'F5 LTM Load Balancer', layer: 'INFRA', capability: 'OTHER', vendor: 'F5', defaultType: 'LOAD_BALANCER' },
  { id: 'sys-nginx', name: 'NGINX-Proxy', description: 'NGINX Reverse Proxy', layer: 'INFRA', capability: 'OTHER', vendor: 'NGINX', defaultType: 'LOAD_BALANCER' },

  // EXTERNAL Layer
  { id: 'sys-payment-gw', name: 'Payment-Gateway', description: 'External Payment Gateway', layer: 'EXTERNAL', capability: 'OTHER', vendor: 'Stripe', defaultType: 'EXTERNAL_SYSTEM' },
  { id: 'sys-sms-gw', name: 'SMS-Gateway', description: 'External SMS Gateway', layer: 'EXTERNAL', capability: 'OTHER', vendor: 'Twilio', defaultType: 'EXTERNAL_SYSTEM' },
  { id: 'sys-email-gw', name: 'Email-Gateway', description: 'External Email Service', layer: 'EXTERNAL', capability: 'OTHER', vendor: 'SendGrid', defaultType: 'EXTERNAL_SYSTEM' },
  { id: 'sys-credit-check', name: 'Credit-Check', description: 'External Credit Check API', layer: 'EXTERNAL', capability: 'OTHER', vendor: 'Experian', defaultType: 'EXTERNAL_SYSTEM' },
  { id: 'sys-address-validation', name: 'Address-Validation', description: 'Address Validation Service', layer: 'EXTERNAL', capability: 'OTHER', vendor: 'Google', defaultType: 'EXTERNAL_SYSTEM' },
];

export interface L1Edge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  protocol?: string;
  type: 'API' | 'EVENT' | 'FILE' | 'DB' | 'INTERNAL';
  // For API edges - endpoint details
  sourceEndpoint?: string;    // ip:port
  targetEndpoint?: string;    // ip:port
}

export interface L1Data {
  environmentId: string;
  environmentName: string;
  stageKey: FlowMapStageKey;
  nodes: L1Node[];
  edges: L1Edge[];
}

// ============================================
// COLORS & STYLING
// ============================================

export const stageColors: Record<FlowMapStageKey, string> = {
  DEV: '#22c55e',
  SIT: '#3b82f6',
  UAT: '#a855f7',
  NFT: '#f97316',
  PREPROD: '#eab308',
  PROD_RO: '#ef4444',
};

export const domainColors: Record<FlowMapDomain, string> = {
  CHANNELS: '#ec4899',
  BSS: '#8b5cf6',
  OSS: '#06b6d4',
  NETWORK: '#14b8a6',
  EXTERNAL: '#f59e0b',
};

export const nodeTypeConfig: Record<L1NodeType, { label: string; icon: string; color: string }> = {
  SERVER: { label: 'Server', icon: '🖥️', color: '#64748b' },
  DATABASE: { label: 'Database', icon: '🗄️', color: '#f59e0b' },
  API_SERVICE: { label: 'API Service', icon: '🔌', color: '#22c55e' },
  QUEUE: { label: 'Queue/Event Bus', icon: '📨', color: '#8b5cf6' },
  LOAD_BALANCER: { label: 'Load Balancer', icon: '⚖️', color: '#06b6d4' },
  CLOUD_SERVICE: { label: 'Cloud Service', icon: '☁️', color: '#3b82f6' },
  STORAGE: { label: 'Storage', icon: '💾', color: '#14b8a6' },
  EXTERNAL_SYSTEM: { label: 'External System', icon: '🔗', color: '#f97316' },
};

export const edgeTypeColors: Record<L1Edge['type'], string> = {
  API: '#22c55e',
  EVENT: '#8b5cf6',
  FILE: '#f59e0b',
  DB: '#06b6d4',
  INTERNAL: '#64748b',
};

// ============================================
// SAMPLE DATA - LEVEL 0 (Pipeline View)
// ============================================

export const sampleL0Data: L0Data = {
  environments: [
    {
      id: 'env-dev',
      name: 'DEV',
      stageKey: 'DEV',
      description: 'Development Environment',
      systemCount: 12,
      status: 'healthy',
    },
    {
      id: 'env-sit',
      name: 'SIT',
      stageKey: 'SIT',
      description: 'System Integration Testing',
      systemCount: 15,
      status: 'healthy',
    },
    {
      id: 'env-uat',
      name: 'UAT',
      stageKey: 'UAT',
      description: 'User Acceptance Testing',
      systemCount: 14,
      status: 'warning',
    },
    {
      id: 'env-preprod',
      name: 'PREPROD',
      stageKey: 'PREPROD',
      description: 'Pre-Production',
      systemCount: 14,
      status: 'healthy',
    },
    {
      id: 'env-prod',
      name: 'PROD',
      stageKey: 'PROD_RO',
      description: 'Production (Read-Only)',
      systemCount: 14,
      status: 'healthy',
    },
  ],
  links: [
    { id: 'l0-1', sourceId: 'env-dev', targetId: 'env-sit', type: 'PROMOTION' },
    { id: 'l0-2', sourceId: 'env-sit', targetId: 'env-uat', type: 'PROMOTION' },
    { id: 'l0-3', sourceId: 'env-uat', targetId: 'env-preprod', type: 'PROMOTION' },
    { id: 'l0-4', sourceId: 'env-preprod', targetId: 'env-prod', type: 'PROMOTION' },
  ],
};

// ============================================
// SAMPLE DATA - LEVEL 1 (Environment Details)
// ============================================

export const sampleL1Data: Record<string, L1Data> = {
  'env-dev': {
    environmentId: 'env-dev',
    environmentName: 'DEV Environment',
    stageKey: 'DEV',
    nodes: [
      // CHANNELS - Entry points (Cloud-hosted in GCP)
      { id: 'dev-web-portal', name: 'Web-Portal-DEV', type: 'API_SERVICE', domain: 'CHANNELS', version: 'v2.1.0', hostname: 'web-dev-01.telco.internal', ip: '10.100.1.10', subnet: '10.100.1.0/24', hostingPlatform: 'GCP', deploymentType: 'cloud', vnetSegment: 'dev-channels-vpc', listenPort: 443, status: 'healthy' },
      { id: 'dev-mobile-app', name: 'Mobile-App-DEV', type: 'API_SERVICE', domain: 'CHANNELS', version: 'v3.0.1', hostname: 'mobile-dev-01.telco.internal', ip: '10.100.1.11', subnet: '10.100.1.0/24', hostingPlatform: 'GCP', deploymentType: 'cloud', vnetSegment: 'dev-channels-vpc', listenPort: 443, status: 'healthy' },
      { id: 'dev-kong', name: 'Kong-Gateway-DEV', type: 'LOAD_BALANCER', domain: 'CHANNELS', version: 'v3.4.2', hostname: 'dmz-dev-01.telco.internal', ip: '10.100.0.5', subnet: '10.100.0.0/24', hostingPlatform: 'GCP', deploymentType: 'cloud', vnetSegment: 'dev-dmz-vpc', status: 'healthy' },
      // BSS - Business Support Systems (Mixed: Salesforce SaaS, others on-prem VMware)
      { id: 'dev-crm', name: 'Salesforce-CRM-DEV', type: 'API_SERVICE', domain: 'BSS', version: 'vSpring-2024', hostname: 'app-dev-01.telco.internal', ip: '10.100.2.10', subnet: '10.100.2.0/24', hostingPlatform: 'VMware', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', listenPort: 8443, deployedComponent: 'Salesforce Service Cloud', deployedVersion: 'Spring 2024 Release', vendor: 'Salesforce', status: 'healthy' },
      { id: 'dev-cpq', name: 'CPQ-Engine-DEV', type: 'API_SERVICE', domain: 'BSS', version: 'v5.2.0', hostname: 'app-dev-02.telco.internal', ip: '10.100.2.11', subnet: '10.100.2.0/24', hostingPlatform: 'VMware', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', listenPort: 8080, deployedComponent: 'Tacton CPQ', deployedVersion: 'v29.1 Patch 2', vendor: 'Tacton', status: 'healthy' },
      { id: 'dev-billing', name: 'Billing-System-DEV', type: 'API_SERVICE', domain: 'BSS', version: 'v22.1.0', hostname: 'app-dev-03.telco.internal', ip: '10.100.2.12', subnet: '10.100.2.0/24', hostingPlatform: 'VMware', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', listenPort: 8443, deployedComponent: 'Amdocs Billing', deployedVersion: 'v22.1.0 SP3', vendor: 'Amdocs', status: 'healthy' },
      { id: 'dev-catalog', name: 'Product-Catalog-DEV', type: 'API_SERVICE', domain: 'BSS', version: 'v4.0.2', hostname: 'app-dev-04.telco.internal', ip: '10.100.2.13', subnet: '10.100.2.0/24', hostingPlatform: 'VMware', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', listenPort: 8080, deployedComponent: 'TMF Product Catalog', deployedVersion: 'v4.0.2', vendor: 'Internal', status: 'healthy' },
      { id: 'dev-crm-db', name: 'Oracle-CRM-DB-DEV', type: 'DATABASE', domain: 'BSS', version: 'v19.3.0', hostname: 'db-dev-01.telco.internal', ip: '10.100.3.10', subnet: '10.100.3.0/24', hostingPlatform: 'Bare Metal', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', databaseType: 'Oracle', databaseVersion: '19c Enterprise Edition (19.3.0)', status: 'healthy' },
      { id: 'dev-pg', name: 'PostgreSQL-Catalog-DEV', type: 'DATABASE', domain: 'BSS', version: 'v15.4', hostname: 'db-dev-02.telco.internal', ip: '10.100.3.11', subnet: '10.100.3.0/24', hostingPlatform: 'VMware', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', databaseType: 'PostgreSQL', databaseVersion: 'PostgreSQL 15.4', status: 'healthy' },
      // OSS - Operations Support Systems (AWS hosted)
      { id: 'dev-order', name: 'Order-Mgmt-DEV', type: 'API_SERVICE', domain: 'OSS', version: 'v7.3.1', hostname: 'app-dev-05.telco.internal', ip: '10.200.1.10', subnet: '10.200.1.0/24', hostingPlatform: 'AWS', deploymentType: 'cloud', vnetSegment: 'dev-oss-vpc-ap-southeast-2a', listenPort: 8443, status: 'healthy' },
      { id: 'dev-orch', name: 'Order-Orchestrator-DEV', type: 'API_SERVICE', domain: 'OSS', version: 'v3.2.0', hostname: 'oss-dev-01.telco.internal', ip: '10.200.1.11', subnet: '10.200.1.0/24', hostingPlatform: 'AWS', deploymentType: 'cloud', vnetSegment: 'dev-oss-vpc-ap-southeast-2a', listenPort: 8080, status: 'warning' },
      { id: 'dev-inventory', name: 'Inventory-Service-DEV', type: 'API_SERVICE', domain: 'OSS', version: 'v2.8.0', hostname: 'oss-dev-02.telco.internal', ip: '10.200.1.12', subnet: '10.200.1.0/24', hostingPlatform: 'AWS', deploymentType: 'cloud', vnetSegment: 'dev-oss-vpc-ap-southeast-2a', listenPort: 8080, status: 'healthy' },
      { id: 'dev-provision', name: 'Provisioning-Engine-DEV', type: 'API_SERVICE', domain: 'OSS', version: 'v4.1.2', hostname: 'oss-dev-03.telco.internal', ip: '10.200.1.13', subnet: '10.200.1.0/24', hostingPlatform: 'AWS', deploymentType: 'cloud', vnetSegment: 'dev-oss-vpc-ap-southeast-2a', listenPort: 8443, status: 'healthy' },
      { id: 'dev-oms-db', name: 'Oracle-OMS-DB-DEV', type: 'DATABASE', domain: 'OSS', version: 'v19.3.0', hostname: 'db-dev-03.telco.internal', ip: '10.200.2.10', subnet: '10.200.2.0/24', hostingPlatform: 'AWS', deploymentType: 'cloud', vnetSegment: 'dev-oss-db-vpc-ap-southeast-2a', databaseType: 'Oracle', databaseVersion: '19c Standard Edition (19.3.0)', status: 'healthy' },
      { id: 'dev-rabbit', name: 'RabbitMQ-Broker-DEV', type: 'QUEUE', domain: 'OSS', version: 'v3.12.0', hostname: 'mq-dev-01.telco.internal', ip: '10.200.1.20', subnet: '10.200.1.0/24', hostingPlatform: 'AWS', deploymentType: 'cloud', vnetSegment: 'dev-oss-vpc-ap-southeast-2a', vendor: 'VMware', status: 'healthy' },
      // NETWORK (On-prem network infrastructure)
      { id: 'dev-f5', name: 'F5-LTM-DEV', type: 'LOAD_BALANCER', domain: 'NETWORK', version: 'v17.1.0', hostname: 'dmz-dev-f5-01.telco.internal', ip: '10.100.0.10', subnet: '10.100.0.0/24', hostingPlatform: 'Bare Metal', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', status: 'healthy' },
      { id: 'dev-nso', name: 'Cisco-NSO-DEV', type: 'API_SERVICE', domain: 'NETWORK', version: 'v6.1.0', hostname: 'net-dev-01.telco.internal', ip: '10.100.4.10', subnet: '10.100.4.0/24', hostingPlatform: 'VMware', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', listenPort: 8888, status: 'healthy' },
      // EXTERNAL (Third-party services)
      { id: 'dev-credit', name: 'Credit-Check-DEV', type: 'EXTERNAL_SYSTEM', domain: 'EXTERNAL', ip: '203.0.113.50', status: 'healthy' },
      { id: 'dev-payment', name: 'Payment-Gateway-DEV', type: 'EXTERNAL_SYSTEM', domain: 'EXTERNAL', ip: '203.0.113.100', status: 'healthy' },
      { id: 'dev-sms', name: 'SMS-Provider-DEV', type: 'EXTERNAL_SYSTEM', domain: 'EXTERNAL', ip: '198.51.100.25', status: 'healthy' },
    ],
    edges: [
      // Channels -> Gateway
      { id: 'dev-e1', sourceId: 'dev-web-portal', targetId: 'dev-kong', label: 'HTTPS', type: 'API', sourceEndpoint: '10.100.1.10:443', targetEndpoint: '10.100.0.5:8443' },
      { id: 'dev-e2', sourceId: 'dev-mobile-app', targetId: 'dev-kong', label: 'HTTPS', type: 'API', sourceEndpoint: '10.100.1.11:443', targetEndpoint: '10.100.0.5:8443' },
      { id: 'dev-e3', sourceId: 'dev-kong', targetId: 'dev-crm', label: 'REST/TLS', type: 'API', sourceEndpoint: '10.100.0.5:8443', targetEndpoint: '10.100.2.10:8443' },
      { id: 'dev-e4', sourceId: 'dev-kong', targetId: 'dev-cpq', label: 'REST/TLS', type: 'API', sourceEndpoint: '10.100.0.5:8443', targetEndpoint: '10.100.2.11:8080' },
      // BSS internal
      { id: 'dev-e5', sourceId: 'dev-crm', targetId: 'dev-billing', label: 'Customer Sync', type: 'API', sourceEndpoint: '10.100.2.10:8443', targetEndpoint: '10.100.2.12:8443' },
      { id: 'dev-e6', sourceId: 'dev-cpq', targetId: 'dev-catalog', label: 'Product Query', type: 'API', sourceEndpoint: '10.100.2.11:8080', targetEndpoint: '10.100.2.13:8080' },
      { id: 'dev-e7', sourceId: 'dev-crm', targetId: 'dev-crm-db', type: 'DB' },
      { id: 'dev-e8', sourceId: 'dev-catalog', targetId: 'dev-pg', type: 'DB' },
      // BSS -> OSS
      { id: 'dev-e9', sourceId: 'dev-crm', targetId: 'dev-order', label: 'Order Submit', type: 'API', sourceEndpoint: '10.100.2.10:8443', targetEndpoint: '10.200.1.10:8443' },
      // OSS internal
      { id: 'dev-e10', sourceId: 'dev-order', targetId: 'dev-orch', label: 'Orchestrate', type: 'EVENT' },
      { id: 'dev-e11', sourceId: 'dev-orch', targetId: 'dev-inventory', label: 'Reserve', type: 'API', sourceEndpoint: '10.200.1.11:8080', targetEndpoint: '10.200.1.12:8080' },
      { id: 'dev-e12', sourceId: 'dev-orch', targetId: 'dev-provision', label: 'Activate', type: 'EVENT' },
      { id: 'dev-e13', sourceId: 'dev-order', targetId: 'dev-oms-db', type: 'DB' },
      { id: 'dev-e14', sourceId: 'dev-orch', targetId: 'dev-rabbit', label: 'Events', type: 'EVENT' },
      // OSS -> Network
      { id: 'dev-e15', sourceId: 'dev-provision', targetId: 'dev-nso', label: 'Config', type: 'API', sourceEndpoint: '10.200.1.13:8443', targetEndpoint: '10.100.4.10:8888' },
      { id: 'dev-e16', sourceId: 'dev-provision', targetId: 'dev-f5', label: 'LB Config', type: 'API', sourceEndpoint: '10.200.1.13:8443', targetEndpoint: '10.100.0.10:443' },
      // BSS -> External
      { id: 'dev-e17', sourceId: 'dev-billing', targetId: 'dev-credit', label: 'Credit Check', type: 'API', sourceEndpoint: '10.100.2.12:8443', targetEndpoint: '203.0.113.50:443' },
      { id: 'dev-e18', sourceId: 'dev-billing', targetId: 'dev-payment', label: 'Payment', type: 'API', sourceEndpoint: '10.100.2.12:8443', targetEndpoint: '203.0.113.100:443' },
      { id: 'dev-e19', sourceId: 'dev-crm', targetId: 'dev-sms', label: 'Notifications', type: 'API', sourceEndpoint: '10.100.2.10:8443', targetEndpoint: '198.51.100.25:443' },
    ],
  },
  'env-sit': {
    environmentId: 'env-sit',
    environmentName: 'SIT Environment',
    stageKey: 'SIT',
    nodes: [
      // Gateway (GCP)
      { id: 'sit-kong', name: 'Kong-SIT', type: 'LOAD_BALANCER', domain: 'BSS', version: 'v3.4.2', hostname: 'dmz-sit-01.telco.internal', ip: '10.110.0.5', subnet: '10.110.0.0/24', hostingPlatform: 'GCP', deploymentType: 'cloud', vnetSegment: 'sit-dmz-vpc', status: 'healthy' },
      // BSS (On-prem VMware)
      { id: 'sit-crm', name: 'Salesforce-CRM-SIT', type: 'API_SERVICE', domain: 'BSS', version: 'vSpring-2024', hostname: 'app-sit-01.telco.internal', ip: '10.110.2.10', subnet: '10.110.2.0/24', hostingPlatform: 'VMware', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', listenPort: 8443, status: 'healthy' },
      { id: 'sit-cpq', name: 'CPQ-Engine-SIT', type: 'API_SERVICE', domain: 'BSS', version: 'v5.2.0', hostname: 'app-sit-02.telco.internal', ip: '10.110.2.11', subnet: '10.110.2.0/24', hostingPlatform: 'VMware', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', listenPort: 8080, status: 'healthy' },
      { id: 'sit-billing', name: 'Billing-System-SIT', type: 'API_SERVICE', domain: 'BSS', version: 'v22.1.0', hostname: 'app-sit-03.telco.internal', ip: '10.110.2.12', subnet: '10.110.2.0/24', hostingPlatform: 'VMware', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', listenPort: 8443, status: 'healthy' },
      { id: 'sit-catalog', name: 'Product-Catalog-SIT', type: 'API_SERVICE', domain: 'BSS', version: 'v4.0.2', hostname: 'app-sit-04.telco.internal', ip: '10.110.2.13', subnet: '10.110.2.0/24', hostingPlatform: 'VMware', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', listenPort: 8080, status: 'healthy' },
      // OSS (AWS)
      { id: 'sit-order', name: 'Order-Mgmt-SIT', type: 'API_SERVICE', domain: 'OSS', version: 'v7.3.1', hostname: 'app-sit-05.telco.internal', ip: '10.210.1.10', subnet: '10.210.1.0/24', hostingPlatform: 'AWS', deploymentType: 'cloud', vnetSegment: 'sit-oss-vpc-ap-southeast-2a', listenPort: 8443, status: 'healthy' },
      { id: 'sit-orch', name: 'Order-Orchestrator-SIT', type: 'API_SERVICE', domain: 'OSS', version: 'v3.2.0', hostname: 'oss-sit-01.telco.internal', ip: '10.210.1.11', subnet: '10.210.1.0/24', hostingPlatform: 'AWS', deploymentType: 'cloud', vnetSegment: 'sit-oss-vpc-ap-southeast-2a', listenPort: 8080, status: 'healthy' },
      { id: 'sit-inventory', name: 'Inventory-Service-SIT', type: 'API_SERVICE', domain: 'OSS', version: 'v2.8.0', hostname: 'oss-sit-02.telco.internal', ip: '10.210.1.12', subnet: '10.210.1.0/24', hostingPlatform: 'AWS', deploymentType: 'cloud', vnetSegment: 'sit-oss-vpc-ap-southeast-2a', listenPort: 8080, status: 'healthy' },
      { id: 'sit-provision', name: 'Provisioning-Engine-SIT', type: 'API_SERVICE', domain: 'OSS', version: 'v4.1.2', hostname: 'oss-sit-03.telco.internal', ip: '10.210.1.13', subnet: '10.210.1.0/24', hostingPlatform: 'AWS', deploymentType: 'cloud', vnetSegment: 'sit-oss-vpc-ap-southeast-2a', listenPort: 8443, status: 'healthy' },
      // Network (On-prem)
      { id: 'sit-nso', name: 'Cisco-NSO-SIT', type: 'API_SERVICE', domain: 'NETWORK', version: 'v6.1.0', hostname: 'net-sit-01.telco.internal', ip: '10.110.4.10', subnet: '10.110.4.0/24', hostingPlatform: 'VMware', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', listenPort: 8888, status: 'healthy' },
      { id: 'sit-f5', name: 'F5-LTM-SIT', type: 'LOAD_BALANCER', domain: 'NETWORK', version: 'v17.1.0', hostname: 'dmz-sit-f5-01.telco.internal', ip: '10.110.0.10', subnet: '10.110.0.0/24', hostingPlatform: 'Bare Metal', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', status: 'healthy' },
      // Databases
      { id: 'sit-crm-db', name: 'Oracle-CRM-DB-SIT', type: 'DATABASE', domain: 'BSS', version: 'v19.3.0', hostname: 'db-sit-01.telco.internal', ip: '10.110.3.10', subnet: '10.110.3.0/24', hostingPlatform: 'Bare Metal', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', status: 'healthy' },
      { id: 'sit-oms-db', name: 'Oracle-OMS-DB-SIT', type: 'DATABASE', domain: 'OSS', version: 'v19.3.0', hostname: 'db-sit-02.telco.internal', ip: '10.210.2.10', subnet: '10.210.2.0/24', hostingPlatform: 'AWS', deploymentType: 'cloud', vnetSegment: 'sit-oss-db-vpc-ap-southeast-2a', status: 'healthy' },
      { id: 'sit-pg', name: 'PostgreSQL-Catalog-SIT', type: 'DATABASE', domain: 'BSS', version: 'v15.4', hostname: 'db-sit-03.telco.internal', ip: '10.110.3.11', subnet: '10.110.3.0/24', hostingPlatform: 'VMware', deploymentType: 'on-prem', datacenter: 'DC1-Sydney', status: 'healthy' },
      { id: 'sit-rabbit', name: 'RabbitMQ-Broker-SIT', type: 'QUEUE', domain: 'OSS', version: 'v3.12.0', hostname: 'mq-sit-01.telco.internal', ip: '10.210.1.20', subnet: '10.210.1.0/24', hostingPlatform: 'AWS', deploymentType: 'cloud', vnetSegment: 'sit-oss-vpc-ap-southeast-2a', status: 'healthy' },
      // External
      { id: 'sit-credit', name: 'Credit-Check-SIT', type: 'EXTERNAL_SYSTEM', domain: 'EXTERNAL', ip: '203.0.113.51', status: 'healthy' },
      { id: 'sit-payment', name: 'Payment-Gateway-SIT', type: 'EXTERNAL_SYSTEM', domain: 'EXTERNAL', ip: '203.0.113.102', status: 'healthy' },
      { id: 'sit-sms', name: 'SMS-Gateway-SIT', type: 'EXTERNAL_SYSTEM', domain: 'EXTERNAL', ip: '198.51.100.26', status: 'healthy' },
    ],
    edges: [
      { id: 'sit-e1', sourceId: 'sit-kong', targetId: 'sit-crm', label: 'REST/TLS', type: 'API', sourceEndpoint: '10.110.0.5:8443', targetEndpoint: '10.110.2.10:8443' },
      { id: 'sit-e2', sourceId: 'sit-kong', targetId: 'sit-cpq', label: 'REST/TLS', type: 'API', sourceEndpoint: '10.110.0.5:8443', targetEndpoint: '10.110.2.11:8080' },
      { id: 'sit-e3', sourceId: 'sit-crm', targetId: 'sit-billing', label: 'Customer Sync', type: 'API', sourceEndpoint: '10.110.2.10:8443', targetEndpoint: '10.110.2.12:8443' },
      { id: 'sit-e4', sourceId: 'sit-cpq', targetId: 'sit-catalog', label: 'Product Query', type: 'API', sourceEndpoint: '10.110.2.11:8080', targetEndpoint: '10.110.2.13:8080' },
      { id: 'sit-e5', sourceId: 'sit-crm', targetId: 'sit-order', label: 'Order Submit', type: 'API', sourceEndpoint: '10.110.2.10:8443', targetEndpoint: '10.210.1.10:8443' },
      { id: 'sit-e6', sourceId: 'sit-order', targetId: 'sit-orch', label: 'Orchestrate', type: 'EVENT' },
      { id: 'sit-e7', sourceId: 'sit-orch', targetId: 'sit-inventory', label: 'Reserve', type: 'API', sourceEndpoint: '10.210.1.11:8080', targetEndpoint: '10.210.1.12:8080' },
      { id: 'sit-e8', sourceId: 'sit-orch', targetId: 'sit-provision', label: 'Activate', type: 'EVENT' },
      { id: 'sit-e9', sourceId: 'sit-provision', targetId: 'sit-nso', label: 'Network Config', type: 'API', sourceEndpoint: '10.210.1.13:8443', targetEndpoint: '10.110.4.10:8888' },
      { id: 'sit-e10', sourceId: 'sit-crm', targetId: 'sit-crm-db', type: 'DB' },
      { id: 'sit-e11', sourceId: 'sit-order', targetId: 'sit-oms-db', type: 'DB' },
      { id: 'sit-e12', sourceId: 'sit-catalog', targetId: 'sit-pg', type: 'DB' },
      { id: 'sit-e13', sourceId: 'sit-orch', targetId: 'sit-rabbit', label: 'Events', type: 'EVENT' },
      { id: 'sit-e14', sourceId: 'sit-billing', targetId: 'sit-credit', label: 'Credit Check', type: 'API', sourceEndpoint: '10.110.2.12:8443', targetEndpoint: '203.0.113.51:443' },
      { id: 'sit-e15', sourceId: 'sit-billing', targetId: 'sit-payment', label: 'Payment', type: 'API', sourceEndpoint: '10.110.2.12:8443', targetEndpoint: '203.0.113.102:443' },
      { id: 'sit-e16', sourceId: 'sit-crm', targetId: 'sit-sms', label: 'Notifications', type: 'API', sourceEndpoint: '10.110.2.10:8443', targetEndpoint: '198.51.100.26:443' },
    ],
  },
  'env-uat': {
    environmentId: 'env-uat',
    environmentName: 'UAT Environment',
    stageKey: 'UAT',
    nodes: [
      { id: 'uat-kong', name: 'Kong-UAT', type: 'LOAD_BALANCER', domain: 'BSS', version: 'v3.4.2', hostname: 'dmz-uat-01.telco.internal', ip: '10.120.0.5', subnet: '10.120.0.0/24', hostingPlatform: 'Azure', deploymentType: 'cloud', vnetSegment: 'uat-dmz-vnet-australiaeast', status: 'healthy' },
      { id: 'uat-crm', name: 'Salesforce-CRM-UAT', type: 'API_SERVICE', domain: 'BSS', version: 'vSpring-2024', hostname: 'app-uat-01.telco.internal', ip: '10.120.2.10', subnet: '10.120.2.0/24', hostingPlatform: 'VMware', deploymentType: 'on-prem', datacenter: 'DC2-Melbourne', listenPort: 8443, status: 'healthy' },
      { id: 'uat-billing', name: 'Billing-System-UAT', type: 'API_SERVICE', domain: 'BSS', version: 'v22.0.0', hostname: 'app-uat-02.telco.internal', ip: '10.120.2.11', subnet: '10.120.2.0/24', hostingPlatform: 'VMware', deploymentType: 'on-prem', datacenter: 'DC2-Melbourne', listenPort: 8443, status: 'critical' },
      { id: 'uat-order', name: 'Order-Mgmt-UAT', type: 'API_SERVICE', domain: 'OSS', version: 'v7.3.1', hostname: 'oss-uat-01.telco.internal', ip: '10.220.1.10', subnet: '10.220.1.0/24', hostingPlatform: 'Azure', deploymentType: 'cloud', vnetSegment: 'uat-oss-vnet-australiaeast', listenPort: 8443, status: 'healthy' },
      { id: 'uat-crm-db', name: 'Oracle-CRM-DB-UAT', type: 'DATABASE', domain: 'BSS', version: 'v19.3.0', hostname: 'db-uat-01.telco.internal', ip: '10.120.3.10', subnet: '10.120.3.0/24', hostingPlatform: 'Bare Metal', deploymentType: 'on-prem', datacenter: 'DC2-Melbourne', databaseType: 'Oracle', databaseVersion: '19c Enterprise Edition (19.3.0)', status: 'healthy' },
      { id: 'uat-payment', name: 'Payment-Gateway-UAT', type: 'EXTERNAL_SYSTEM', domain: 'EXTERNAL', ip: '203.0.113.101', status: 'warning' },
    ],
    edges: [
      { id: 'uat-e1', sourceId: 'uat-kong', targetId: 'uat-crm', label: 'REST/TLS', type: 'API', sourceEndpoint: '10.120.0.5:8443', targetEndpoint: '10.120.2.10:8443' },
      { id: 'uat-e2', sourceId: 'uat-crm', targetId: 'uat-billing', label: 'Billing Sync', type: 'API', sourceEndpoint: '10.120.2.10:8443', targetEndpoint: '10.120.2.11:8443' },
      { id: 'uat-e3', sourceId: 'uat-crm', targetId: 'uat-order', label: 'Orders', type: 'API', sourceEndpoint: '10.120.2.10:8443', targetEndpoint: '10.220.1.10:8443' },
      { id: 'uat-e4', sourceId: 'uat-crm', targetId: 'uat-crm-db', type: 'DB' },
      { id: 'uat-e5', sourceId: 'uat-billing', targetId: 'uat-payment', label: 'Payment', type: 'API', sourceEndpoint: '10.120.2.11:8443', targetEndpoint: '203.0.113.101:443' },
    ],
  },
  'env-preprod': {
    environmentId: 'env-preprod',
    environmentName: 'PREPROD Environment',
    stageKey: 'PREPROD',
    nodes: [
      { id: 'preprod-kong', name: 'Kong-PREPROD', type: 'LOAD_BALANCER', domain: 'BSS', version: 'v3.4.2', status: 'healthy' },
      { id: 'preprod-crm', name: 'Salesforce-CRM-PREPROD', type: 'API_SERVICE', domain: 'BSS', version: 'vSpring-2024', status: 'healthy' },
      { id: 'preprod-billing', name: 'Billing-System-PREPROD', type: 'API_SERVICE', domain: 'BSS', version: 'v22.1.0', status: 'healthy' },
    ],
    edges: [
      { id: 'preprod-e1', sourceId: 'preprod-kong', targetId: 'preprod-crm', label: 'REST/TLS', type: 'API' },
      { id: 'preprod-e2', sourceId: 'preprod-crm', targetId: 'preprod-billing', label: 'Billing', type: 'API' },
    ],
  },
  'env-prod': {
    environmentId: 'env-prod',
    environmentName: 'PROD Environment',
    stageKey: 'PROD_RO',
    nodes: [
      { id: 'prod-kong', name: 'Kong-PROD', type: 'LOAD_BALANCER', domain: 'BSS', version: 'v3.4.2', status: 'healthy' },
      { id: 'prod-crm', name: 'Salesforce-CRM-PROD', type: 'API_SERVICE', domain: 'BSS', version: 'vSpring-2024', status: 'healthy' },
    ],
    edges: [
      { id: 'prod-e1', sourceId: 'prod-kong', targetId: 'prod-crm', label: 'REST/TLS', type: 'API' },
    ],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getStatusColor(status: L0Environment['status'] | L1Node['status']): string {
  switch (status) {
    case 'healthy': return '#22c55e';
    case 'warning': return '#f59e0b';
    case 'critical': return '#ef4444';
    default: return '#64748b';
  }
}

export function generateNodeId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateEdgeId(): string {
  return `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
