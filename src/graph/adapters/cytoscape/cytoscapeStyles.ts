/**
 * Cytoscape.js visual styles for Nexorium Core graph rendering
 */

import type { StylesheetStyle } from 'cytoscape';

type Stylesheet = StylesheetStyle;
import {
  NODE_TYPE_COLORS,
  HEALTH_COLORS,
  ZONE_COLORS,
  LAYER_COLORS,
  NODE_TYPE_SHAPES,
  type PlaygroundNodeType,
} from '../../model/types';

/**
 * Map playground shapes to Cytoscape shapes
 */
function mapShape(shape: string): string {
  const shapeMap: Record<string, string> = {
    rectangle: 'rectangle',
    roundrectangle: 'round-rectangle',
    ellipse: 'ellipse',
    diamond: 'diamond',
    barrel: 'barrel',
    hexagon: 'hexagon',
  };
  return shapeMap[shape] || 'rectangle';
}

/**
 * Get base node styles
 */
export function getBaseNodeStyles(): Stylesheet[] {
  return [
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 8,
        'font-size': '11px',
        'font-family': 'Inter, system-ui, sans-serif',
        color: '#374151',
        'text-wrap': 'ellipsis',
        'text-max-width': '100px',
        'background-color': '#e0e7ff',
        'border-color': '#6366f1',
        'border-width': 2,
        width: 50,
        height: 50,
        'overlay-opacity': 0,
        'transition-property': 'border-color, border-width, background-color',
        'transition-duration': 150,
      },
    },
    {
      selector: 'node:selected',
      style: {
        'border-color': '#8b5cf6',
        'border-width': 3,
        'overlay-color': '#8b5cf6',
        'overlay-opacity': 0.15,
      },
    },
    {
      selector: 'node:active',
      style: {
        'overlay-opacity': 0.1,
      },
    },
  ];
}

/**
 * Get node type-specific styles
 */
export function getNodeTypeStyles(): Stylesheet[] {
  const styles: Stylesheet[] = [];

  for (const [type, colors] of Object.entries(NODE_TYPE_COLORS)) {
    const shape = mapShape(NODE_TYPE_SHAPES[type as PlaygroundNodeType]);

    styles.push({
      selector: `node[type = "${type}"]`,
      style: {
        'background-color': colors.color,
        'border-color': colors.borderColor,
        shape: shape as 'rectangle' | 'round-rectangle' | 'ellipse' | 'diamond' | 'barrel' | 'hexagon',
      },
    });
  }

  // External nodes have dashed borders
  styles.push({
    selector: 'node[type = "external"]',
    style: {
      'border-style': 'dashed',
    },
  });

  return styles;
}

/**
 * Get health status badge styles
 */
export function getHealthStyles(): Stylesheet[] {
  const styles: Stylesheet[] = [];

  for (const [status, color] of Object.entries(HEALTH_COLORS)) {
    styles.push({
      selector: `node[health = "${status}"]`,
      style: {
        'background-opacity': 1,
        'background-image': `data:image/svg+xml,${encodeURIComponent(
          `<svg width="12" height="12" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="5" fill="${color}" stroke="white" stroke-width="1"/></svg>`
        )}`,
        'background-position-x': '85%',
        'background-position-y': '15%',
        'background-width': '12px',
        'background-height': '12px',
        'background-fit': 'none',
        'background-clip': 'none',
      },
    });
  }

  return styles;
}

/**
 * Get network zone coloring styles
 */
export function getNetworkZoneStyles(): Stylesheet[] {
  const styles: Stylesheet[] = [];

  for (const [zone, colors] of Object.entries(ZONE_COLORS)) {
    styles.push({
      selector: `node[networkZone = "${zone}"]`,
      style: {
        'background-color': colors.bg,
        'border-color': colors.border,
      },
    });
  }

  return styles;
}

/**
 * Get telco layer styles
 */
export function getTelcoLayerStyles(): Stylesheet[] {
  const styles: Stylesheet[] = [];

  for (const [layer, colors] of Object.entries(LAYER_COLORS)) {
    styles.push({
      selector: `node[telcoLayer = "${layer}"]`,
      style: {
        'background-color': colors.bg,
        'border-color': colors.border,
      },
    });
  }

  return styles;
}

/**
 * Get base edge styles
 */
export function getBaseEdgeStyles(): Stylesheet[] {
  return [
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': '#94a3b8',
        'target-arrow-color': '#94a3b8',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'arrow-scale': 0.8,
        'overlay-opacity': 0,
        'transition-property': 'line-color, target-arrow-color, opacity',
        'transition-duration': 150,
      },
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': '#8b5cf6',
        'target-arrow-color': '#8b5cf6',
        width: 3,
      },
    },
  ];
}

/**
 * Get confidence-based edge styles
 */
export function getConfidenceEdgeStyles(): Stylesheet[] {
  return [
    {
      selector: 'edge[confidence >= 0.8]',
      style: {
        'line-style': 'solid',
      },
    },
    {
      selector: 'edge[confidence >= 0.5][confidence < 0.8]',
      style: {
        'line-style': 'dashed',
      },
    },
    {
      selector: 'edge[confidence < 0.5]',
      style: {
        'line-style': 'dotted',
      },
    },
  ];
}

/**
 * Get stale edge styles
 */
export function getStaleEdgeStyles(): Stylesheet[] {
  return [
    {
      selector: 'edge[stale = true]',
      style: {
        opacity: 0.4,
      },
    },
  ];
}

/**
 * Get protocol-based edge color styles
 */
export function getProtocolEdgeStyles(): Stylesheet[] {
  return [
    {
      selector: 'edge[protocol = "REST"]',
      style: {
        'line-color': '#3b82f6',
        'target-arrow-color': '#3b82f6',
      },
    },
    {
      selector: 'edge[protocol = "MQ"]',
      style: {
        'line-color': '#f59e0b',
        'target-arrow-color': '#f59e0b',
      },
    },
    {
      selector: 'edge[protocol = "JDBC"]',
      style: {
        'line-color': '#10b981',
        'target-arrow-color': '#10b981',
      },
    },
    {
      selector: 'edge[protocol = "SFTP"]',
      style: {
        'line-color': '#8b5cf6',
        'target-arrow-color': '#8b5cf6',
      },
    },
    {
      selector: 'edge[protocol = "EVENT"]',
      style: {
        'line-color': '#ec4899',
        'target-arrow-color': '#ec4899',
      },
    },
  ];
}

/**
 * Get search highlight styles
 */
export function getSearchHighlightStyles(): Stylesheet[] {
  return [
    {
      selector: 'node.search-highlight',
      style: {
        'border-color': '#06b6d4',
        'border-width': 4,
        'background-color': '#cffafe',
        'z-index': 10,
      },
    },
    {
      selector: 'node.dimmed',
      style: {
        opacity: 0.3,
      },
    },
    {
      selector: 'edge.dimmed',
      style: {
        opacity: 0.15,
      },
    },
  ];
}

/**
 * Combine all stylesheets based on options
 */
export interface StyleOptions {
  showHealthOverlay: boolean;
  showConfidenceStyling: boolean;
  showStaleEdges: boolean;
  useNetworkZoneColoring: boolean;
  useTelcoLayerGrouping: boolean;
}

export function buildStylesheet(options: StyleOptions): Stylesheet[] {
  const styles: Stylesheet[] = [
    ...getBaseNodeStyles(),
    ...getNodeTypeStyles(),
    ...getBaseEdgeStyles(),
    ...getProtocolEdgeStyles(),
    ...getSearchHighlightStyles(),
  ];

  if (options.showHealthOverlay) {
    styles.push(...getHealthStyles());
  }

  if (options.showConfidenceStyling) {
    styles.push(...getConfidenceEdgeStyles());
  }

  if (options.showStaleEdges) {
    styles.push(...getStaleEdgeStyles());
  }

  if (options.useNetworkZoneColoring) {
    styles.push(...getNetworkZoneStyles());
  }

  if (options.useTelcoLayerGrouping) {
    styles.push(...getTelcoLayerStyles());
  }

  return styles;
}
