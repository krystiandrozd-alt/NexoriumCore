// TelEnvIQ - Dagre Layout Utility
// Layered north→south auto-layout using Dagre algorithm

import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import type { ArchitectureLayer } from '@/types';

// Layer rank mapping for north→south layout
const LAYER_RANK: Record<ArchitectureLayer, number> = {
  EXTERNAL: 0,
  BSS: 1,
  INFRA: 2,
  OSS: 3,
  UNKNOWN: 4,
};

interface DagreLayoutOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number; // Vertical spacing between layers
  nodeSep?: number; // Horizontal spacing between nodes in same layer
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
}

/**
 * Apply Dagre layout to React Flow nodes and edges.
 * Groups nodes by architecture layer and arranges north→south.
 */
export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  options: DagreLayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  const {
    nodeWidth = 200,
    nodeHeight = 80,
    rankSep = 100,
    nodeSep = 50,
    direction = 'TB',
  } = options;

  // Create a new dagre graph
  const g = new dagre.graphlib.Graph();

  // Set graph options
  g.setGraph({
    rankdir: direction,
    ranksep: rankSep,
    nodesep: nodeSep,
    marginx: 50,
    marginy: 50,
  });

  // Default edge label (required by dagre)
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph
  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
      // Store layer for rank assignment
      layer: (node.data as { layer?: ArchitectureLayer })?.layer || 'UNKNOWN',
    });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Apply layout
  dagre.layout(g);

  // Map layout back to React Flow nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}

/**
 * Apply Dagre layout with layer-aware ranking.
 * Ensures nodes in same layer are on same horizontal level.
 */
export function applyLayerAwareDagreLayout(
  nodes: Node[],
  edges: Edge[],
  options: DagreLayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  const {
    nodeWidth = 200,
    nodeHeight = 80,
    rankSep = 120,
    nodeSep = 60,
    direction = 'TB',
  } = options;

  // Group nodes by layer
  const nodesByLayer = new Map<ArchitectureLayer, Node[]>();
  nodes.forEach((node) => {
    const layer = (node.data as { layer?: ArchitectureLayer })?.layer || 'UNKNOWN';
    if (!nodesByLayer.has(layer)) {
      nodesByLayer.set(layer, []);
    }
    nodesByLayer.get(layer)!.push(node);
  });

  // Create dagre graph
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: direction,
    ranksep: rankSep,
    nodesep: nodeSep,
    marginx: 50,
    marginy: 50,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes with rank constraints
  nodes.forEach((node) => {
    const layer = (node.data as { layer?: ArchitectureLayer })?.layer || 'UNKNOWN';
    const rank = LAYER_RANK[layer];

    g.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
      rank, // Dagre uses this for grouping
    });
  });

  // Add edges
  edges.forEach((edge) => {
    // Only add edge if both nodes exist
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  });

  // Apply layout
  dagre.layout(g);

  // Adjust Y positions to align nodes within same layer
  const layerYPositions = new Map<ArchitectureLayer, number>();
  const sortedLayers: ArchitectureLayer[] = ['EXTERNAL', 'BSS', 'INFRA', 'OSS', 'UNKNOWN'];

  let currentY = 50;
  sortedLayers.forEach((layer) => {
    const layerNodes = nodesByLayer.get(layer);
    if (layerNodes && layerNodes.length > 0) {
      layerYPositions.set(layer, currentY);
      currentY += nodeHeight + rankSep;
    }
  });

  // Map layout back with layer alignment
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    const layer = (node.data as { layer?: ArchitectureLayer })?.layer || 'UNKNOWN';
    const layerY = layerYPositions.get(layer) ?? nodeWithPosition.y - nodeHeight / 2;

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: layerY,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}

/**
 * Get canvas bounds for all nodes.
 */
export function getCanvasBounds(nodes: Node[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const { x, y } = node.position;
    const width = (node.width ?? 200) as number;
    const height = (node.height ?? 80) as number;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
