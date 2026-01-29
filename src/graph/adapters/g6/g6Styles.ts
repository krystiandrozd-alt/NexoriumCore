/**
 * AntV G6 visual styles for Nexorium Core graph rendering
 */

import {
  NODE_TYPE_COLORS,
  HEALTH_COLORS,
  ZONE_COLORS,
  LAYER_COLORS,
  type PlaygroundNodeType,
  type PlaygroundNetworkZone,
  type PlaygroundTelcoLayer,
  type PlaygroundHealthStatus,
  type PlaygroundProtocol,
} from '../../model/types';

/**
 * Map playground shapes to G6 shapes
 */
export function mapShapeToG6(type: PlaygroundNodeType): string {
  const shapeMap: Record<PlaygroundNodeType, string> = {
    application: 'rect',
    service: 'rect',
    database: 'ellipse', // G6 uses ellipse instead of barrel
    gateway: 'diamond',
    external: 'rect',
    runtime: 'rect', // G6 doesn't have hexagon by default
  };
  return shapeMap[type] || 'rect';
}

/**
 * Get node style configuration
 */
export interface G6NodeStyle {
  fill: string;
  stroke: string;
  lineWidth: number;
  lineDash?: number[];
  radius?: number;
}

/**
 * Get base node style for type
 */
export function getNodeStyleForType(type: PlaygroundNodeType): G6NodeStyle {
  const colors = NODE_TYPE_COLORS[type] || NODE_TYPE_COLORS.application;

  const style: G6NodeStyle = {
    fill: colors.color,
    stroke: colors.borderColor,
    lineWidth: 2,
  };

  // External nodes have dashed borders
  if (type === 'external') {
    style.lineDash = [5, 3];
  }

  // Add border radius for services
  if (type === 'service') {
    style.radius = 8;
  }

  return style;
}

/**
 * Get health badge color
 */
export function getHealthBadgeColor(health: PlaygroundHealthStatus): string {
  return HEALTH_COLORS[health] || HEALTH_COLORS.unknown;
}

/**
 * Get network zone background color
 */
export function getNetworkZoneStyle(zone: PlaygroundNetworkZone): { bg: string; border: string } {
  return ZONE_COLORS[zone] || ZONE_COLORS.unknown;
}

/**
 * Get telco layer style
 */
export function getTelcoLayerStyle(layer: PlaygroundTelcoLayer): { bg: string; border: string } {
  return LAYER_COLORS[layer] || LAYER_COLORS.Unknown;
}

/**
 * Get edge style based on protocol
 */
export function getProtocolEdgeColor(protocol: PlaygroundProtocol): string {
  const colors: Record<PlaygroundProtocol, string> = {
    REST: '#3b82f6',
    MQ: '#f59e0b',
    JDBC: '#10b981',
    SFTP: '#8b5cf6',
    EVENT: '#ec4899',
    OTHER: '#94a3b8',
  };
  return colors[protocol] || colors.OTHER;
}

/**
 * Get edge line dash based on confidence
 */
export function getConfidenceLineDash(confidence: number): number[] | undefined {
  if (confidence >= 0.8) return undefined; // Solid
  if (confidence >= 0.5) return [8, 4]; // Dashed
  return [3, 3]; // Dotted
}

/**
 * Get edge opacity based on staleness
 */
export function getEdgeOpacity(stale: boolean): number {
  return stale ? 0.4 : 1;
}

/**
 * Default node configuration
 */
export const DEFAULT_NODE_CONFIG = {
  size: [50, 50],
  labelCfg: {
    position: 'bottom',
    offset: 8,
    style: {
      fontSize: 11,
      fontFamily: 'Inter, system-ui, sans-serif',
      fill: '#374151',
      textAlign: 'center',
    },
  },
  style: {
    cursor: 'pointer',
  },
};

/**
 * Default edge configuration
 */
export const DEFAULT_EDGE_CONFIG = {
  style: {
    stroke: '#94a3b8',
    lineWidth: 2,
    endArrow: {
      path: 'M 0,0 L 8,4 L 8,-4 Z',
      fill: '#94a3b8',
    },
  },
};

/**
 * Selected state styles
 */
export const SELECTED_NODE_STYLE = {
  stroke: '#8b5cf6',
  lineWidth: 3,
  shadowColor: 'rgba(139, 92, 246, 0.3)',
  shadowBlur: 10,
};

export const SELECTED_EDGE_STYLE = {
  stroke: '#8b5cf6',
  lineWidth: 3,
};

/**
 * Hover state styles
 */
export const HOVER_NODE_STYLE = {
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  shadowBlur: 8,
};

/**
 * Search highlight styles
 */
export const SEARCH_HIGHLIGHT_STYLE = {
  stroke: '#06b6d4',
  lineWidth: 4,
  shadowColor: 'rgba(6, 182, 212, 0.4)',
  shadowBlur: 15,
};

export const DIMMED_NODE_STYLE = {
  opacity: 0.3,
};

export const DIMMED_EDGE_STYLE = {
  opacity: 0.15,
};
