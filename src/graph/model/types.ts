/**
 * Canonical Graph Model Types
 *
 * These types are independent of any renderer (React Flow, Cytoscape, G6)
 * and represent the domain-specific graph structure for Nexorium Core.
 */

// Node type taxonomy matching Nexorium Core domain
export type PlaygroundNodeType =
  | 'application'
  | 'service'
  | 'database'
  | 'gateway'
  | 'external'
  | 'runtime';

export type PlaygroundHostingType =
  | 'cloud'
  | 'onprem'
  | 'hybrid'
  | 'thirdparty'
  | 'unknown';

export type PlaygroundNetworkZone =
  | 'prod'
  | 'nonprod'
  | 'dmz'
  | 'partner'
  | 'internet'
  | 'securecore'
  | 'lab'
  | 'unknown';

export type PlaygroundTelcoLayer =
  | 'BSS'
  | 'OSS'
  | 'Network'
  | 'Shared'
  | 'External'
  | 'Unknown';

export type PlaygroundHealthStatus =
  | 'up'
  | 'down'
  | 'degraded'
  | 'unknown';

export type PlaygroundProtocol =
  | 'REST'
  | 'MQ'
  | 'JDBC'
  | 'SFTP'
  | 'EVENT'
  | 'OTHER';

/**
 * Canonical node representation for graph renderers
 */
export interface CanonicalGraphNode {
  /** Unique identifier */
  id: string;

  /** Display label */
  label: string;

  /** Node classification */
  type: PlaygroundNodeType;

  /** Hosting context */
  hostingType: PlaygroundHostingType;

  /** Network zone placement */
  networkZone: PlaygroundNetworkZone;

  /** Telco architecture layer */
  telcoLayer: PlaygroundTelcoLayer;

  /** Health status indicator */
  health: PlaygroundHealthStatus;

  /** Data confidence score (0-1) */
  confidence: number;

  /** Last data observation timestamp */
  lastSeenAt: Date | null;

  /** Arbitrary metadata for display */
  meta: Record<string, unknown>;
}

/**
 * Canonical edge representation for graph renderers
 */
export interface CanonicalGraphEdge {
  /** Unique identifier */
  id: string;

  /** Source node ID */
  source: string;

  /** Target node ID */
  target: string;

  /** Connection protocol */
  protocol: PlaygroundProtocol;

  /** Port number (optional) */
  port?: number;

  /** Edge label (optional) */
  label?: string;

  /** Data confidence score (0-1) */
  confidence: number;

  /** Last observation timestamp */
  lastObservedAt?: Date;

  /** Whether edge data is stale */
  stale: boolean;
}

/**
 * Complete graph structure for an environment
 */
export interface CanonicalEnvironmentGraph {
  /** Environment ID (optional for synthetic data) */
  environmentId?: string;

  /** Environment display name */
  environmentName?: string;

  /** Environment type (DEV, SIT, UAT, etc.) */
  environmentType?: string;

  /** All nodes in the graph */
  nodes: CanonicalGraphNode[];

  /** All edges in the graph */
  edges: CanonicalGraphEdge[];
}

/**
 * Visual style configuration
 */
export interface NodeVisualStyle {
  /** Fill color */
  color: string;

  /** Border color */
  borderColor: string;

  /** Shape type (renderer-specific interpretation) */
  shape: 'rectangle' | 'roundrectangle' | 'ellipse' | 'diamond' | 'barrel' | 'hexagon';

  /** Whether border should be dashed */
  borderDashed: boolean;
}

export interface EdgeVisualStyle {
  /** Stroke color */
  color: string;

  /** Line style */
  lineStyle: 'solid' | 'dashed' | 'dotted';

  /** Opacity (0-1) */
  opacity: number;

  /** Stroke width */
  width: number;
}

/**
 * Color palette for node types
 */
export const NODE_TYPE_COLORS: Record<PlaygroundNodeType, { color: string; borderColor: string }> = {
  application: { color: '#e0e7ff', borderColor: '#6366f1' },     // Indigo
  service: { color: '#ede9fe', borderColor: '#8b5cf6' },         // Violet
  database: { color: '#d1fae5', borderColor: '#10b981' },        // Emerald
  gateway: { color: '#fef3c7', borderColor: '#f59e0b' },         // Amber
  external: { color: '#f1f5f9', borderColor: '#64748b' },        // Gray
  runtime: { color: '#cffafe', borderColor: '#06b6d4' },         // Cyan
};

/**
 * Health status colors
 */
export const HEALTH_COLORS: Record<PlaygroundHealthStatus, string> = {
  up: '#10b981',       // Green
  down: '#ef4444',     // Red
  degraded: '#f59e0b', // Amber
  unknown: '#6b7280',  // Gray
};

/**
 * Network zone background colors
 */
export const ZONE_COLORS: Record<PlaygroundNetworkZone, { bg: string; border: string }> = {
  prod: { bg: '#fef3c7', border: '#fcd34d' },
  nonprod: { bg: '#dbeafe', border: '#93c5fd' },
  dmz: { bg: '#fce7f3', border: '#f9a8d4' },
  partner: { bg: '#e0e7ff', border: '#a5b4fc' },
  internet: { bg: '#fee2e2', border: '#fca5a5' },
  securecore: { bg: '#d1fae5', border: '#6ee7b7' },
  lab: { bg: '#f3e8ff', border: '#c4b5fd' },
  unknown: { bg: '#f1f5f9', border: '#cbd5e1' },
};

/**
 * Telco layer tint colors
 */
export const LAYER_COLORS: Record<PlaygroundTelcoLayer, { bg: string; border: string }> = {
  BSS: { bg: '#dbeafe', border: '#93c5fd' },
  OSS: { bg: '#fef3c7', border: '#fcd34d' },
  Network: { bg: '#e0e7ff', border: '#a5b4fc' },
  Shared: { bg: '#f1f5f9', border: '#cbd5e1' },
  External: { bg: '#ecfdf5', border: '#6ee7b7' },
  Unknown: { bg: '#f8fafc', border: '#e2e8f0' },
};

/**
 * Shape mapping for node types
 */
export const NODE_TYPE_SHAPES: Record<PlaygroundNodeType, NodeVisualStyle['shape']> = {
  application: 'rectangle',
  service: 'roundrectangle',
  database: 'barrel',
  gateway: 'diamond',
  external: 'rectangle',
  runtime: 'hexagon',
};

/**
 * Helper to get edge line style based on confidence
 */
export function getEdgeLineStyle(confidence: number): EdgeVisualStyle['lineStyle'] {
  if (confidence >= 0.8) return 'solid';
  if (confidence >= 0.5) return 'dashed';
  return 'dotted';
}

/**
 * Helper to get edge opacity based on staleness
 */
export function getEdgeOpacity(stale: boolean): number {
  return stale ? 0.4 : 1;
}
