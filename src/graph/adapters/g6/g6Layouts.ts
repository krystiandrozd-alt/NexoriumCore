/**
 * AntV G6 layout configurations
 */

import type { LayoutMode } from '../GraphRenderer';

/**
 * G6 Layout configuration type
 */
export interface G6LayoutConfig {
  type: string;
  [key: string]: unknown;
}

/**
 * Force-directed layout (force2) configuration
 */
export function getForceLayoutConfig(nodeCount: number): G6LayoutConfig {
  // Adjust parameters based on graph size
  const linkDistance = Math.max(100, Math.min(200, 250 - nodeCount / 4));
  const nodeStrength = Math.max(-300, -500 + nodeCount);

  return {
    type: 'force2',
    animate: true,
    maxSpeed: 100,
    minMovement: 0.5,
    damping: 0.9,
    interval: 0.02,
    maxIteration: 1000,
    linkDistance,
    nodeStrength,
    edgeStrength: 0.1,
    preventOverlap: true,
    nodeSize: 60,
    nodeSpacing: 20,
    gravity: 0.1,
    centripetalOptions: {
      leaf: 2,
      single: 2,
    },
  };
}

/**
 * DAG/Hierarchical layout (dagre) configuration
 */
export function getDagreLayoutConfig(): G6LayoutConfig {
  return {
    type: 'dagre',
    rankdir: 'TB', // Top to bottom
    nodesep: 60,
    ranksep: 100,
    controlPoints: true,
    sortByCombo: false,
  };
}

/**
 * Concentric/Radial layout configuration
 */
export function getConcentricLayoutConfig(): G6LayoutConfig {
  return {
    type: 'concentric',
    minNodeSpacing: 60,
    preventOverlap: true,
    equidistant: false,
    startAngle: (3 / 2) * Math.PI, // Start from top
    clockwise: true,
    sortBy: 'degree', // Sort by node degree for better visualization
    nodeSize: 50,
  };
}

/**
 * Get layout configuration by mode
 */
export function getLayoutConfig(mode: LayoutMode, nodeCount: number): G6LayoutConfig {
  switch (mode) {
    case 'force':
      return getForceLayoutConfig(nodeCount);
    case 'dagre':
      return getDagreLayoutConfig();
    case 'concentric':
      return getConcentricLayoutConfig();
    default:
      return getForceLayoutConfig(nodeCount);
  }
}

/**
 * Layout display names
 */
export const LAYOUT_NAMES: Record<LayoutMode, string> = {
  force: 'Force-Directed',
  dagre: 'Hierarchical (DAG)',
  concentric: 'Concentric',
};
