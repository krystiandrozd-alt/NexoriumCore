// Nexorium Core - Flow Map V2 Integration Types
// Enterprise-grade edge/integration data model for yFiles diagram

import type { FlowMapDomain } from './flow-map-v2';

// ============================================
// NODE TAG (System in the environment)
// ============================================

export interface NodeTag {
  id: string;
  name: string;
  domain: FlowMapDomain;
  systemType: string; // e.g., 'CRM-System', 'API-Gateway', 'Database'
  environment: string; // e.g., 'SIT', 'UAT'
  // Optional infrastructure details
  hostname?: string;
  ip?: string;
  subnet?: string;
  vendor?: string;
  version?: string;
  notes?: string;
  // For grouping/folding
  groupId?: string;
  // Status
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
}

// ============================================
// EDGE TAG (Integration between systems)
// ============================================

export type IntegrationDirection = 'A_TO_B' | 'B_TO_A' | 'BIDIRECTIONAL';

export type IntegrationProtocol =
  | 'REST'
  | 'SOAP'
  | 'EVENTS'
  | 'MQ'
  | 'DB'
  | 'FILE'
  | 'OTHER';

export type IntegrationPattern = 'SYNC' | 'ASYNC' | 'BATCH';

export type IntegrationTransport =
  | 'HTTP'
  | 'HTTPS'
  | 'AMQP'
  | 'JMS'
  | 'KAFKA'
  | 'RABBITMQ'
  | 'AZURE_SERVICE_BUS'
  | 'TCP'
  | 'SFTP'
  | 'OTHER';

export type IntegrationAuth =
  | 'OAUTH2'
  | 'MTLS'
  | 'API_KEY'
  | 'BASIC'
  | 'NONE';

export interface EdgeTag {
  id: string;
  fromSystemId: string;
  toSystemId: string;
  direction: IntegrationDirection;
  protocol: IntegrationProtocol;
  pattern: IntegrationPattern;
  transport?: IntegrationTransport;
  auth?: IntegrationAuth;
  contractName?: string;
  notes?: string;
  // For aggregation
  aggregatedCount?: number;
  aggregatedEdgeIds?: string[];
}

// ============================================
// PROTOCOL STYLING CONFIG
// ============================================

export interface ProtocolStyle {
  color: string;
  dashArray?: number[]; // null = solid, [5, 3] = dashed, [2, 2] = dotted
  label: string;
  shortLabel: string;
}

export const PROTOCOL_STYLES: Record<IntegrationProtocol, ProtocolStyle> = {
  REST: {
    color: '#22c55e', // green-500
    dashArray: undefined, // solid
    label: 'REST API',
    shortLabel: 'REST',
  },
  SOAP: {
    color: '#3b82f6', // blue-500
    dashArray: undefined, // solid
    label: 'SOAP/XML',
    shortLabel: 'SOAP',
  },
  EVENTS: {
    color: '#8b5cf6', // violet-500
    dashArray: [8, 4], // dashed
    label: 'Event-Driven',
    shortLabel: 'EVT',
  },
  MQ: {
    color: '#f59e0b', // amber-500
    dashArray: [8, 4], // dashed
    label: 'Message Queue',
    shortLabel: 'MQ',
  },
  DB: {
    color: '#06b6d4', // cyan-500
    dashArray: [3, 3], // dotted
    label: 'Database',
    shortLabel: 'DB',
  },
  FILE: {
    color: '#14b8a6', // teal-500
    dashArray: [6, 3, 2, 3], // dash-dot
    label: 'File Transfer',
    shortLabel: 'FILE',
  },
  OTHER: {
    color: '#64748b', // slate-500
    dashArray: [4, 4],
    label: 'Other',
    shortLabel: 'OTH',
  },
};

export const PATTERN_STYLES: Record<IntegrationPattern, { label: string; icon: string }> = {
  SYNC: { label: 'Synchronous', icon: '⟳' },
  ASYNC: { label: 'Asynchronous', icon: '⟿' },
  BATCH: { label: 'Batch', icon: '▦' },
};

export const DIRECTION_LABELS: Record<IntegrationDirection, string> = {
  A_TO_B: 'A → B (One-way)',
  B_TO_A: 'B → A (One-way)',
  BIDIRECTIONAL: 'A ↔ B (Bidirectional)',
};

// ============================================
// LAYOUT MODES
// ============================================

export type LayoutMode = 'swimlane' | 'hierarchic' | 'organic';

export const LAYOUT_MODE_CONFIG: Record<LayoutMode, { label: string; icon: string; description: string }> = {
  swimlane: {
    label: 'Swimlane',
    icon: '▤',
    description: 'Horizontal lanes by domain',
  },
  hierarchic: {
    label: 'Hierarchic',
    icon: '⊞',
    description: 'Left-to-right flow layout',
  },
  organic: {
    label: 'Organic',
    icon: '◎',
    description: 'Clustered dependency view',
  },
};

// ============================================
// FILTER STATE
// ============================================

export interface IntegrationFilters {
  protocols: IntegrationProtocol[];
  showOnlySelected: boolean;
  highlightHops: 0 | 1 | 2;
}

export const DEFAULT_FILTERS: IntegrationFilters = {
  protocols: ['REST', 'SOAP', 'EVENTS', 'MQ', 'DB', 'FILE', 'OTHER'],
  showOnlySelected: false,
  highlightHops: 0,
};

// ============================================
// PERSISTENCE / SERIALIZATION
// ============================================

export interface FlowMapV2State {
  environmentId: string;
  nodes: NodeTag[];
  edges: EdgeTag[];
  layoutMode: LayoutMode;
  nodePositions: Record<string, { x: number; y: number }>;
  collapsedGroups: string[];
  filters: IntegrationFilters;
  lastModified: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function generateIntegrationId(): string {
  return `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getProtocolStyle(protocol: IntegrationProtocol): ProtocolStyle {
  return PROTOCOL_STYLES[protocol] || PROTOCOL_STYLES.OTHER;
}

export function isAsyncProtocol(protocol: IntegrationProtocol): boolean {
  return protocol === 'EVENTS' || protocol === 'MQ' || protocol === 'FILE';
}

export function getDefaultPattern(protocol: IntegrationProtocol): IntegrationPattern {
  if (protocol === 'FILE') return 'BATCH';
  if (isAsyncProtocol(protocol)) return 'ASYNC';
  return 'SYNC';
}

export function getDefaultTransport(protocol: IntegrationProtocol): IntegrationTransport {
  switch (protocol) {
    case 'REST':
    case 'SOAP':
      return 'HTTPS';
    case 'EVENTS':
    case 'MQ':
      return 'KAFKA';
    case 'DB':
      return 'TCP';
    case 'FILE':
      return 'SFTP';
    default:
      return 'OTHER';
  }
}
