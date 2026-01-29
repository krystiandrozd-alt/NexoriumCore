// Nexorium Core - Flow Map V2 Types
// Clean, clarity-first type definitions for enterprise environment visualization

// ============================================
// CORE ENUMS
// ============================================

export type FlowMapStageKey = 'DEV' | 'SIT' | 'UAT' | 'NFT' | 'PREPROD' | 'PROD_RO';
export type FlowMapDomain = 'CHANNELS' | 'BSS' | 'OSS' | 'NETWORK' | 'EXTERNAL';
export type FlowMapLinkType = 'PROMOTION' | 'DATA_SYNC' | 'REFERENCE';
export type FlowMapMode = 'auto' | 'manual' | 'hybrid';

// ============================================
// ENVIRONMENT NODE
// ============================================

export interface FlowMapV2Environment {
  id: string;
  name: string;
  type: string;
  stageKey: FlowMapStageKey | null;
  stageName: string | null;
  domain?: FlowMapDomain;
  systemCount: number;
  connectionCount: number;
  description?: string;
  // Hosting metadata for hover popover
  hostingPlatform?: string;
  vpc?: string;
  subnet?: string;
  updatedAt?: Date;
}

// ============================================
// INTEGRATION EDGE
// ============================================

export interface FlowMapV2Integration {
  id: string;
  sourceId: string;
  targetId: string;
  linkType: FlowMapLinkType;
  protocol?: string;
  isActive: boolean;
  notes?: string;
}

// ============================================
// STAGE CONFIGURATION
// ============================================

export interface FlowMapV2Stage {
  id: string;
  key: FlowMapStageKey;
  name: string;
  color: string;
  sortOrder: number;
  environmentCount: number;
}

// ============================================
// FILTER STATE
// ============================================

export interface FlowMapV2Filters {
  stages: FlowMapStageKey[];
  domains: FlowMapDomain[];
  searchQuery: string;
  showDomainGrouping: boolean;
}

// Default filter state
export const defaultFlowMapV2Filters: FlowMapV2Filters = {
  stages: ['DEV', 'SIT', 'UAT', 'NFT', 'PREPROD', 'PROD_RO'],
  domains: ['BSS', 'OSS', 'NETWORK', 'EXTERNAL'],
  searchQuery: '',
  showDomainGrouping: false,
};

// ============================================
// LAYOUT PERSISTENCE
// ============================================

export interface FlowMapV2LayoutPosition {
  x: number;
  y: number;
}

export interface FlowMapV2Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface FlowMapV2Layout {
  id: string;
  name: string;
  positions: Record<string, FlowMapV2LayoutPosition>;
  viewport?: FlowMapV2Viewport;
  isDefault: boolean;
  updatedAt: Date;
  updatedBy?: string;
}

// ============================================
// REACT FLOW NODE DATA
// ============================================

export interface FlowMapV2NodeData extends Record<string, unknown> {
  id: string;
  name: string;
  type: string;
  stageKey: FlowMapStageKey | null;
  stageName: string | null;
  stageColor: string | null;
  domain?: FlowMapDomain;
  systemCount: number;
  connectionCount: number;
  description?: string;
  hostingPlatform?: string;
  vpc?: string;
  subnet?: string;
  updatedAt?: Date;
  isSelected?: boolean;
  isHovered?: boolean;
}

// ============================================
// REACT FLOW EDGE DATA
// ============================================

export interface FlowMapV2EdgeData extends Record<string, unknown> {
  linkType: FlowMapLinkType;
  protocol?: string;
  isActive: boolean;
  isSelected?: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface FlowMapV2Data {
  environments: FlowMapV2Environment[];
  integrations: FlowMapV2Integration[];
  stages: FlowMapV2Stage[];
}

// ============================================
// STAGE COLORS (Default)
// ============================================

export const stageColors: Record<FlowMapStageKey, string> = {
  DEV: '#22c55e',     // green-500
  SIT: '#3b82f6',     // blue-500
  UAT: '#a855f7',     // purple-500
  NFT: '#f97316',     // orange-500
  PREPROD: '#eab308', // yellow-500
  PROD_RO: '#ef4444', // red-500
};

// ============================================
// DOMAIN COLORS
// ============================================

export const domainColors: Record<FlowMapDomain, string> = {
  CHANNELS: '#ec4899', // pink-500
  BSS: '#8b5cf6',     // violet-500
  OSS: '#06b6d4',     // cyan-500
  NETWORK: '#14b8a6', // teal-500
  EXTERNAL: '#f59e0b', // amber-500
};
