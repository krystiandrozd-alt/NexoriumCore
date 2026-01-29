// Nexorium Core - Manual Design Mode Types
// Types for Visio-style drag & drop objects in Flow Map

import type { FlowMapDomain, FlowMapStageKey } from './flow-map-v2';

// ============================================
// CORE ENUMS
// ============================================

export type ManualNodeType =
  | 'SERVER'
  | 'DATABASE'
  | 'API_SERVICE'
  | 'QUEUE_EVENT_BUS'
  | 'LOAD_BALANCER'
  | 'CLOUD'
  | 'STORAGE'
  | 'EXTERNAL_SYSTEM'
  | 'NOTE';

export type ManualEdgeType = 'API' | 'EVENT' | 'FILE' | 'DB' | 'MANUAL';

export type ManualNodeScope = 'GLOBAL' | 'DEV' | 'SIT' | 'UAT' | 'NFT' | 'PREPROD';

export type FlowMapMode = 'auto' | 'manual' | 'hybrid';

// Domain Lane for Level 1 horizontal swimlanes
export type DomainLane = 'CSS' | 'BSS' | 'OSS' | 'NETWORK' | 'EXTERNAL';

// ============================================
// MANUAL NODE
// ============================================

export interface ManualFlowMapNode {
  id: string;
  name: string;
  nodeType: ManualNodeType;
  domain?: FlowMapDomain;
  domainLane?: DomainLane; // Level 1: which horizontal swimlane this node belongs to
  description?: string;
  scope: ManualNodeScope;
  positionX: number;
  positionY: number;
  metadata?: Record<string, unknown>;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  environmentId?: string; // If set, node is scoped to this environment (Level 1)
}

// ============================================
// MANUAL EDGE
// ============================================

export interface ManualFlowMapEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: ManualEdgeType;
  label?: string;
  metadata?: Record<string, unknown>;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  environmentId?: string; // If set, edge is scoped to this environment (Level 1)
}

// ============================================
// CREATE/UPDATE DTOs
// ============================================

export interface CreateManualNodeInput {
  name: string;
  nodeType: ManualNodeType;
  domain?: FlowMapDomain;
  domainLane?: DomainLane;
  description?: string;
  scope?: ManualNodeScope;
  positionX: number;
  positionY: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateManualNodeInput {
  name?: string;
  nodeType?: ManualNodeType;
  domain?: FlowMapDomain;
  domainLane?: DomainLane;
  description?: string;
  scope?: ManualNodeScope;
  positionX?: number;
  positionY?: number;
  metadata?: Record<string, unknown>;
}

export interface CreateManualEdgeInput {
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: ManualEdgeType;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateManualEdgeInput {
  edgeType?: ManualEdgeType;
  label?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// REACT FLOW NODE DATA
// ============================================

export interface ManualNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  nodeType: ManualNodeType;
  domain?: FlowMapDomain;
  domainLane?: DomainLane;
  description?: string;
  scope: ManualNodeScope;
  isSelected?: boolean;
  isHovered?: boolean;
}

// ============================================
// REACT FLOW EDGE DATA
// ============================================

export interface ManualEdgeData extends Record<string, unknown> {
  edgeType: ManualEdgeType;
  label?: string;
  isSelected?: boolean;
}

// ============================================
// PALETTE ITEM
// ============================================

export interface PaletteItem {
  type: ManualNodeType;
  icon: string;
  label: string;
  description: string;
}

// Palette items configuration
export const paletteItems: PaletteItem[] = [
  { type: 'SERVER', icon: 'Server', label: 'Server', description: 'Physical or virtual server' },
  { type: 'DATABASE', icon: 'Database', label: 'Database', description: 'Database instance' },
  { type: 'API_SERVICE', icon: 'Globe', label: 'API Service', description: 'REST/SOAP API service' },
  { type: 'QUEUE_EVENT_BUS', icon: 'MessageSquare', label: 'Queue/Event Bus', description: 'Message queue or event bus' },
  { type: 'LOAD_BALANCER', icon: 'Scale', label: 'Load Balancer', description: 'Load balancer' },
  { type: 'CLOUD', icon: 'Cloud', label: 'Cloud Service', description: 'Cloud service' },
  { type: 'STORAGE', icon: 'HardDrive', label: 'Storage', description: 'File/object storage' },
  { type: 'EXTERNAL_SYSTEM', icon: 'ExternalLink', label: 'External System', description: 'External system integration' },
  { type: 'NOTE', icon: 'StickyNote', label: 'Note', description: 'Annotation note' },
];

// ============================================
// EDGE TYPE STYLING
// ============================================

export const edgeTypeStyles: Record<ManualEdgeType, { color: string; dashArray?: string; label: string }> = {
  API: { color: '#8b5cf6', label: 'API' },
  EVENT: { color: '#f97316', dashArray: '5,5', label: 'Event' },
  FILE: { color: '#22c55e', dashArray: '10,5', label: 'File' },
  DB: { color: '#3b82f6', label: 'Database' },
  MANUAL: { color: '#64748b', dashArray: '3,3', label: 'Manual' },
};

// ============================================
// NODE TYPE STYLING
// ============================================

export const nodeTypeStyles: Record<ManualNodeType, { bgColor: string; borderColor: string; iconColor: string }> = {
  SERVER: { bgColor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6', iconColor: '#3b82f6' },
  DATABASE: { bgColor: 'rgba(139, 92, 246, 0.1)', borderColor: '#8b5cf6', iconColor: '#8b5cf6' },
  API_SERVICE: { bgColor: 'rgba(34, 197, 94, 0.1)', borderColor: '#22c55e', iconColor: '#22c55e' },
  QUEUE_EVENT_BUS: { bgColor: 'rgba(249, 115, 22, 0.1)', borderColor: '#f97316', iconColor: '#f97316' },
  LOAD_BALANCER: { bgColor: 'rgba(6, 182, 212, 0.1)', borderColor: '#06b6d4', iconColor: '#06b6d4' },
  CLOUD: { bgColor: 'rgba(168, 85, 247, 0.1)', borderColor: '#a855f7', iconColor: '#a855f7' },
  STORAGE: { bgColor: 'rgba(234, 179, 8, 0.1)', borderColor: '#eab308', iconColor: '#eab308' },
  EXTERNAL_SYSTEM: { bgColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', iconColor: '#ef4444' },
  NOTE: { bgColor: 'rgba(251, 191, 36, 0.1)', borderColor: '#fbbf24', iconColor: '#fbbf24' },
};

// ============================================
// DOMAIN LANE STYLING (Level 1)
// ============================================

export interface DomainLaneConfig {
  key: DomainLane;
  label: string;
  color: string;
  bgColor: string;
  sortOrder: number;
}

export const domainLanes: DomainLaneConfig[] = [
  { key: 'CSS', label: 'Customer Service Systems', color: '#f472b6', bgColor: 'rgba(244, 114, 182, 0.05)', sortOrder: 0 },
  { key: 'BSS', label: 'Business Support Systems', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.05)', sortOrder: 1 },
  { key: 'OSS', label: 'Operations Support Systems', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.05)', sortOrder: 2 },
  { key: 'NETWORK', label: 'Network Layer', color: '#14b8a6', bgColor: 'rgba(20, 184, 166, 0.05)', sortOrder: 3 },
  { key: 'EXTERNAL', label: 'External Systems', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.05)', sortOrder: 4 },
];

export const domainLaneColors: Record<DomainLane, string> = {
  CSS: '#f472b6',
  BSS: '#8b5cf6',
  OSS: '#06b6d4',
  NETWORK: '#14b8a6',
  EXTERNAL: '#f59e0b',
};

// ============================================
// UNDO/REDO HISTORY
// ============================================

export interface HistoryAction {
  type: 'create_node' | 'update_node' | 'delete_node' | 'create_edge' | 'update_edge' | 'delete_edge';
  data: ManualFlowMapNode | ManualFlowMapEdge;
  previousData?: ManualFlowMapNode | ManualFlowMapEdge;
}

export interface HistoryState {
  undoStack: HistoryAction[];
  redoStack: HistoryAction[];
}

export const MAX_HISTORY_SIZE = 50;

// ============================================
// MANUAL DESIGN CONTEXT STATE
// ============================================

export interface ManualDesignState {
  mode: FlowMapMode;
  nodes: ManualFlowMapNode[];
  edges: ManualFlowMapEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isLoading: boolean;
  error: string | null;
  snapToGrid: boolean;
  gridSize: number;
  history: HistoryState;
}

export const initialManualDesignState: ManualDesignState = {
  mode: 'auto',
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  isLoading: false,
  error: null,
  snapToGrid: false,
  gridSize: 20,
  history: {
    undoStack: [],
    redoStack: [],
  },
};
