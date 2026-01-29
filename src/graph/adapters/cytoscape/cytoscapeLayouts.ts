/**
 * Cytoscape.js layout configurations
 */

import type { LayoutOptions } from 'cytoscape';
import type { LayoutMode } from '../GraphRenderer';

/**
 * Force-directed layout (fcose) configuration
 */
export function getForceLayoutConfig(nodeCount: number): LayoutOptions {
  // Adjust parameters based on graph size
  const idealEdgeLength = Math.max(80, Math.min(150, 200 - nodeCount / 5));
  const nodeRepulsion = Math.max(4500, 6000 - nodeCount * 10);

  return {
    name: 'fcose',
    quality: 'default',
    randomize: true,
    animate: true,
    animationDuration: 500,
    animationEasing: 'ease-out',
    fit: true,
    padding: 30,
    nodeDimensionsIncludeLabels: true,
    uniformNodeDimensions: false,
    packComponents: true,
    step: 'all',

    // Ideal edge length
    idealEdgeLength: idealEdgeLength,

    // Separation forces
    nodeRepulsion: () => nodeRepulsion,
    edgeElasticity: () => 0.45,

    // Gravity
    gravity: 0.25,
    gravityRange: 3.8,

    // Iterations
    numIter: 2500,

    // Tile parameters for disconnected parts
    tilingPaddingVertical: 10,
    tilingPaddingHorizontal: 10,
  } as LayoutOptions;
}

/**
 * DAG/Hierarchical layout (dagre) configuration
 */
export function getDagreLayoutConfig(): LayoutOptions {
  return {
    name: 'dagre',
    rankDir: 'TB', // Top to bottom
    nodeSep: 60,
    rankSep: 100,
    edgeSep: 30,
    animate: true,
    animationDuration: 500,
    animationEasing: 'ease-out',
    fit: true,
    padding: 30,
  } as LayoutOptions;
}

/**
 * Concentric/Radial layout configuration
 */
export function getConcentricLayoutConfig(): LayoutOptions {
  return {
    name: 'concentric',
    animate: true,
    animationDuration: 500,
    animationEasing: 'ease-out',
    fit: true,
    padding: 30,
    startAngle: (3 / 2) * Math.PI, // Start from top
    sweep: undefined, // Full circle
    clockwise: true,
    equidistant: false,
    minNodeSpacing: 60,
    avoidOverlap: true,
    nodeDimensionsIncludeLabels: true,
    height: undefined,
    width: undefined,

    // Determine level by node type/importance
    concentric: (node: { data: (key: string) => unknown }) => {
      const type = node.data('type') as string;
      const typeWeights: Record<string, number> = {
        gateway: 5,
        application: 4,
        service: 3,
        database: 2,
        external: 1,
        runtime: 1,
      };
      return typeWeights[type] || 1;
    },

    // Level width function
    levelWidth: () => 1,
  } as LayoutOptions;
}

/**
 * Get layout configuration by mode
 */
export function getLayoutConfig(mode: LayoutMode, nodeCount: number): LayoutOptions {
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
