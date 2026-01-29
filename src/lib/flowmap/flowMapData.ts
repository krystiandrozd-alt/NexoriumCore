// Nexorium Core - Shared Flow Map Data Model
// Used by both React Flow and yFiles implementations

import type { FlowMapStageKey, FlowMapDomain, FlowMapLinkType } from '@/types/flow-map-v2';

// ============================================
// CORE TYPES
// ============================================

export interface FlowNode {
  id: string;
  label: string;
  type: 'ENVIRONMENT' | 'SYSTEM' | 'EXTERNAL';
  domain: FlowMapDomain;
  environment: FlowMapStageKey;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  meta: Record<string, string>;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: FlowMapLinkType;
}

export interface FlowMapDataset {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// ============================================
// STAGE & DOMAIN COLORS
// ============================================

export const stageColors: Record<FlowMapStageKey, string> = {
  DEV: '#22c55e',     // green-500
  SIT: '#3b82f6',     // blue-500
  UAT: '#a855f7',     // purple-500
  NFT: '#f97316',     // orange-500
  PREPROD: '#eab308', // yellow-500
  PROD_RO: '#ef4444', // red-500
};

export const domainColors: Record<FlowMapDomain, string> = {
  CHANNELS: '#ec4899', // pink-500
  BSS: '#8b5cf6',     // violet-500
  OSS: '#06b6d4',     // cyan-500
  NETWORK: '#14b8a6', // teal-500
  EXTERNAL: '#f59e0b', // amber-500
};

export const edgeTypeColors: Record<FlowMapLinkType, string> = {
  PROMOTION: '#22c55e',   // green-500
  DATA_SYNC: '#3b82f6',   // blue-500
  REFERENCE: '#94a3b8',   // slate-400
};

// ============================================
// SAMPLE DATA - Enterprise Telco Flow Map
// ============================================

export const sampleFlowMapData: FlowMapDataset = {
  nodes: [
    // DEV Environment
    {
      id: 'dev-crm',
      label: 'CRM',
      type: 'SYSTEM',
      domain: 'BSS',
      environment: 'DEV',
      status: 'healthy',
      meta: {
        description: 'Customer Relationship Management',
        vendor: 'Salesforce',
        version: '2024.1',
        owner: 'BSS Team',
        hostingPlatform: 'AWS',
      },
    },
    {
      id: 'dev-billing',
      label: 'Billing Engine',
      type: 'SYSTEM',
      domain: 'BSS',
      environment: 'DEV',
      status: 'healthy',
      meta: {
        description: 'Invoice & Rating Engine',
        vendor: 'Amdocs',
        version: '12.5',
        owner: 'Revenue Team',
      },
    },
    {
      id: 'dev-order-api',
      label: 'Order API',
      type: 'SYSTEM',
      domain: 'BSS',
      environment: 'DEV',
      status: 'healthy',
      meta: {
        description: 'Order Management REST API',
        protocol: 'REST/JSON',
        version: '3.2.1',
      },
    },
    {
      id: 'dev-inventory',
      label: 'Inventory',
      type: 'SYSTEM',
      domain: 'OSS',
      environment: 'DEV',
      status: 'warning',
      meta: {
        description: 'Network Inventory Management',
        vendor: 'Nokia',
        version: '8.1',
      },
    },
    {
      id: 'dev-provisioning',
      label: 'Provisioning Engine',
      type: 'SYSTEM',
      domain: 'OSS',
      environment: 'DEV',
      status: 'healthy',
      meta: {
        description: 'Service Activation & Provisioning',
        vendor: 'Ericsson',
        version: '5.0',
      },
    },

    // SIT Environment
    {
      id: 'sit-crm',
      label: 'CRM',
      type: 'SYSTEM',
      domain: 'BSS',
      environment: 'SIT',
      status: 'healthy',
      meta: {
        description: 'Customer Relationship Management',
        vendor: 'Salesforce',
        version: '2024.1',
        owner: 'BSS Team',
      },
    },
    {
      id: 'sit-billing',
      label: 'Billing Engine',
      type: 'SYSTEM',
      domain: 'BSS',
      environment: 'SIT',
      status: 'healthy',
      meta: {
        description: 'Invoice & Rating Engine',
        vendor: 'Amdocs',
        version: '12.5',
      },
    },
    {
      id: 'sit-order-api',
      label: 'Order API',
      type: 'SYSTEM',
      domain: 'BSS',
      environment: 'SIT',
      status: 'healthy',
      meta: {
        description: 'Order Management REST API',
        protocol: 'REST/JSON',
        version: '3.2.1',
      },
    },
    {
      id: 'sit-inventory',
      label: 'Inventory',
      type: 'SYSTEM',
      domain: 'OSS',
      environment: 'SIT',
      status: 'healthy',
      meta: {
        description: 'Network Inventory Management',
        vendor: 'Nokia',
        version: '8.1',
      },
    },
    {
      id: 'sit-provisioning',
      label: 'Provisioning Engine',
      type: 'SYSTEM',
      domain: 'OSS',
      environment: 'SIT',
      status: 'healthy',
      meta: {
        description: 'Service Activation & Provisioning',
        vendor: 'Ericsson',
        version: '5.0',
      },
    },

    // UAT Environment
    {
      id: 'uat-crm',
      label: 'CRM',
      type: 'SYSTEM',
      domain: 'BSS',
      environment: 'UAT',
      status: 'healthy',
      meta: {
        description: 'Customer Relationship Management',
        vendor: 'Salesforce',
        version: '2024.1',
      },
    },
    {
      id: 'uat-billing',
      label: 'Billing Engine',
      type: 'SYSTEM',
      domain: 'BSS',
      environment: 'UAT',
      status: 'critical',
      meta: {
        description: 'Invoice & Rating Engine',
        vendor: 'Amdocs',
        version: '12.4',
        alert: 'Version mismatch with DEV/SIT',
      },
    },
    {
      id: 'uat-order-api',
      label: 'Order API',
      type: 'SYSTEM',
      domain: 'BSS',
      environment: 'UAT',
      status: 'healthy',
      meta: {
        description: 'Order Management REST API',
        protocol: 'REST/JSON',
        version: '3.2.1',
      },
    },
    {
      id: 'uat-inventory',
      label: 'Inventory',
      type: 'SYSTEM',
      domain: 'OSS',
      environment: 'UAT',
      status: 'healthy',
      meta: {
        description: 'Network Inventory Management',
        vendor: 'Nokia',
        version: '8.1',
      },
    },
    {
      id: 'uat-provisioning',
      label: 'Provisioning Engine',
      type: 'SYSTEM',
      domain: 'OSS',
      environment: 'UAT',
      status: 'healthy',
      meta: {
        description: 'Service Activation & Provisioning',
        vendor: 'Ericsson',
        version: '5.0',
      },
    },

    // PREPROD Environment
    {
      id: 'preprod-crm',
      label: 'CRM',
      type: 'SYSTEM',
      domain: 'BSS',
      environment: 'PREPROD',
      status: 'healthy',
      meta: {
        description: 'Customer Relationship Management',
        vendor: 'Salesforce',
        version: '2024.1',
      },
    },
    {
      id: 'preprod-billing',
      label: 'Billing Engine',
      type: 'SYSTEM',
      domain: 'BSS',
      environment: 'PREPROD',
      status: 'healthy',
      meta: {
        description: 'Invoice & Rating Engine',
        vendor: 'Amdocs',
        version: '12.5',
      },
    },

    // External Systems
    {
      id: 'ext-payment-gateway',
      label: 'Payment Gateway',
      type: 'EXTERNAL',
      domain: 'EXTERNAL',
      environment: 'SIT',
      status: 'healthy',
      meta: {
        description: 'External Payment Processing',
        vendor: 'Stripe',
        protocol: 'REST/TLS1.3',
      },
    },
    {
      id: 'ext-sms-provider',
      label: 'SMS Gateway',
      type: 'EXTERNAL',
      domain: 'EXTERNAL',
      environment: 'SIT',
      status: 'healthy',
      meta: {
        description: 'SMS Notification Provider',
        vendor: 'Twilio',
        protocol: 'REST',
      },
    },
  ],
  edges: [
    // DEV internal integrations
    { id: 'e-dev-1', source: 'dev-crm', target: 'dev-billing', type: 'DATA_SYNC', label: 'Customer Sync' },
    { id: 'e-dev-2', source: 'dev-order-api', target: 'dev-crm', type: 'DATA_SYNC', label: 'Order Create' },
    { id: 'e-dev-3', source: 'dev-order-api', target: 'dev-inventory', type: 'DATA_SYNC', label: 'Reserve' },
    { id: 'e-dev-4', source: 'dev-inventory', target: 'dev-provisioning', type: 'DATA_SYNC', label: 'Activate' },
    { id: 'e-dev-5', source: 'dev-billing', target: 'dev-provisioning', type: 'REFERENCE', label: 'Rating Ref' },

    // SIT internal integrations
    { id: 'e-sit-1', source: 'sit-crm', target: 'sit-billing', type: 'DATA_SYNC', label: 'Customer Sync' },
    { id: 'e-sit-2', source: 'sit-order-api', target: 'sit-crm', type: 'DATA_SYNC', label: 'Order Create' },
    { id: 'e-sit-3', source: 'sit-order-api', target: 'sit-inventory', type: 'DATA_SYNC', label: 'Reserve' },
    { id: 'e-sit-4', source: 'sit-inventory', target: 'sit-provisioning', type: 'DATA_SYNC', label: 'Activate' },
    { id: 'e-sit-5', source: 'sit-billing', target: 'ext-payment-gateway', type: 'DATA_SYNC', label: 'Payment' },
    { id: 'e-sit-6', source: 'sit-crm', target: 'ext-sms-provider', type: 'DATA_SYNC', label: 'Notify' },

    // UAT internal integrations
    { id: 'e-uat-1', source: 'uat-crm', target: 'uat-billing', type: 'DATA_SYNC', label: 'Customer Sync' },
    { id: 'e-uat-2', source: 'uat-order-api', target: 'uat-crm', type: 'DATA_SYNC', label: 'Order Create' },
    { id: 'e-uat-3', source: 'uat-order-api', target: 'uat-inventory', type: 'DATA_SYNC', label: 'Reserve' },
    { id: 'e-uat-4', source: 'uat-inventory', target: 'uat-provisioning', type: 'DATA_SYNC', label: 'Activate' },

    // PREPROD internal integrations
    { id: 'e-preprod-1', source: 'preprod-crm', target: 'preprod-billing', type: 'DATA_SYNC', label: 'Customer Sync' },

    // Cross-environment promotions (DEV -> SIT)
    { id: 'e-promo-1', source: 'dev-crm', target: 'sit-crm', type: 'PROMOTION' },
    { id: 'e-promo-2', source: 'dev-billing', target: 'sit-billing', type: 'PROMOTION' },
    { id: 'e-promo-3', source: 'dev-order-api', target: 'sit-order-api', type: 'PROMOTION' },
    { id: 'e-promo-4', source: 'dev-inventory', target: 'sit-inventory', type: 'PROMOTION' },
    { id: 'e-promo-5', source: 'dev-provisioning', target: 'sit-provisioning', type: 'PROMOTION' },

    // Cross-environment promotions (SIT -> UAT)
    { id: 'e-promo-6', source: 'sit-crm', target: 'uat-crm', type: 'PROMOTION' },
    { id: 'e-promo-7', source: 'sit-billing', target: 'uat-billing', type: 'PROMOTION' },
    { id: 'e-promo-8', source: 'sit-order-api', target: 'uat-order-api', type: 'PROMOTION' },
    { id: 'e-promo-9', source: 'sit-inventory', target: 'uat-inventory', type: 'PROMOTION' },
    { id: 'e-promo-10', source: 'sit-provisioning', target: 'uat-provisioning', type: 'PROMOTION' },

    // Cross-environment promotions (UAT -> PREPROD)
    { id: 'e-promo-11', source: 'uat-crm', target: 'preprod-crm', type: 'PROMOTION' },
    { id: 'e-promo-12', source: 'uat-billing', target: 'preprod-billing', type: 'PROMOTION' },
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getNodesByEnvironment(data: FlowMapDataset, env: FlowMapStageKey): FlowNode[] {
  return data.nodes.filter((n) => n.environment === env);
}

export function getNodesByDomain(data: FlowMapDataset, domain: FlowMapDomain): FlowNode[] {
  return data.nodes.filter((n) => n.domain === domain);
}

export function getConnectedEdges(data: FlowMapDataset, nodeId: string): FlowEdge[] {
  return data.edges.filter((e) => e.source === nodeId || e.target === nodeId);
}

export function getStatusColor(status: FlowNode['status']): string {
  switch (status) {
    case 'healthy':
      return '#22c55e'; // green-500
    case 'warning':
      return '#f59e0b'; // amber-500
    case 'critical':
      return '#ef4444'; // red-500
    default:
      return '#64748b'; // slate-500
  }
}
