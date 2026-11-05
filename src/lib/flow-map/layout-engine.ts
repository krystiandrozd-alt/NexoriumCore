// Nexorium Core - Layout Engine
// ELK.js-based auto-layout for Flow Map
// Supports hierarchical and lane-aware layouts

import type { Node, Edge } from '@xyflow/react';
import { LANE_HEADER_HEIGHT } from './lane-utils';

// ============================================
// LAYOUT TYPES
// ============================================

export type LayoutDirection = 'LR' | 'TB' | 'RL' | 'BT';
export type LayoutMode = 'hierarchical' | 'lane-aware' | 'force' | 'manual';

export interface LayoutConfig {
  mode: LayoutMode;
  direction: LayoutDirection;
  nodeSpacing: number;
  layerSpacing: number;
  laneWidth: number;
  laneKeys?: string[];
  preserveManualPositions?: boolean;
}

export const defaultLayoutConfig: LayoutConfig = {
  mode: 'hierarchical',
  direction: 'LR',
  nodeSpacing: 60,
  layerSpacing: 200,
  laneWidth: 300,
  preserveManualPositions: true,
};

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

// ============================================
// ELK-STYLE LAYOUT (Pure JS implementation)
// Using a simplified layered layout algorithm
// ============================================

interface LayoutNode {
  id: string;
  width: number;
  height: number;
  layer: number;
  position: number;
  x: number;
  y: number;
  lane?: string;
}

/**
 * Calculate hierarchical layout using layered approach
 */
export function calculateHierarchicalLayout(
  nodes: Node[],
  edges: Edge[],
  config: LayoutConfig = defaultLayoutConfig
): LayoutResult {
  if (nodes.length === 0) return { nodes, edges };

  const isHorizontal = config.direction === 'LR' || config.direction === 'RL';
  const isReversed = config.direction === 'RL' || config.direction === 'BT';

  // Build adjacency list
  const adjacency = new Map<string, Set<string>>();
  const reverseAdj = new Map<string, Set<string>>();
  nodes.forEach((n) => {
    adjacency.set(n.id, new Set());
    reverseAdj.set(n.id, new Set());
  });
  edges.forEach((e) => {
    adjacency.get(e.source)?.add(e.target);
    reverseAdj.get(e.target)?.add(e.source);
  });

  // Assign layers using longest path
  const layers = assignLayers(nodes, adjacency, reverseAdj);

  // Group nodes by layer
  const layerGroups = new Map<number, string[]>();
  layers.forEach((layer, nodeId) => {
    if (!layerGroups.has(layer)) {
      layerGroups.set(layer, []);
    }
    layerGroups.get(layer)?.push(nodeId);
  });

  // Calculate positions within each layer
  const layoutNodes = new Map<string, LayoutNode>();
  const maxLayer = Math.max(...Array.from(layers.values()));

  nodes.forEach((n) => {
    const width = n.measured?.width ?? n.width ?? 160;
    const height = n.measured?.height ?? n.height ?? 80;
    const layer = isReversed ? maxLayer - (layers.get(n.id) ?? 0) : (layers.get(n.id) ?? 0);

    layoutNodes.set(n.id, {
      id: n.id,
      width,
      height,
      layer,
      position: 0,
      x: 0,
      y: 0,
    });
  });

  // Sort nodes within each layer by connectivity (minimize crossings)
  layerGroups.forEach((nodeIds) => {
    // Simple barycenter sorting
    const sorted = nodeIds.sort((a, b) => {
      const aConns = Array.from(adjacency.get(a) || []).concat(
        Array.from(reverseAdj.get(a) || [])
      );
      const bConns = Array.from(adjacency.get(b) || []).concat(
        Array.from(reverseAdj.get(b) || [])
      );

      const aCenter = aConns.length > 0
        ? aConns.reduce((sum, id) => sum + (layoutNodes.get(id)?.position || 0), 0) / aConns.length
        : 0;
      const bCenter = bConns.length > 0
        ? bConns.reduce((sum, id) => sum + (layoutNodes.get(id)?.position || 0), 0) / bConns.length
        : 0;

      return aCenter - bCenter;
    });

    // Assign positions within layer
    sorted.forEach((nodeId, index) => {
      const node = layoutNodes.get(nodeId);
      if (node) {
        node.position = index;
      }
    });
  });

  // Calculate final coordinates
  layerGroups.forEach((nodeIds, layer) => {
    let currentOffset = 0;

    nodeIds.forEach((nodeId) => {
      const node = layoutNodes.get(nodeId);
      if (!node) return;

      if (isHorizontal) {
        node.x = layer * config.layerSpacing;
        node.y = currentOffset;
        currentOffset += node.height + config.nodeSpacing;
      } else {
        node.x = currentOffset;
        node.y = layer * config.layerSpacing + LANE_HEADER_HEIGHT;
        currentOffset += node.width + config.nodeSpacing;
      }
    });
  });

  // Apply positions to nodes
  const resultNodes = nodes.map((n) => {
    const layout = layoutNodes.get(n.id);
    if (!layout) return n;

    // Check if we should preserve manual position
    if (config.preserveManualPositions && n.data?.isManuallyPositioned) {
      return n;
    }

    return {
      ...n,
      position: { x: layout.x, y: layout.y },
    };
  });

  return { nodes: resultNodes, edges };
}

/**
 * Assign layers using longest path from sources
 */
function assignLayers(
  nodes: Node[],
  adjacency: Map<string, Set<string>>,
  reverseAdj: Map<string, Set<string>>
): Map<string, number> {
  const layers = new Map<string, number>();
  const visited = new Set<string>();

  // Find source nodes (no incoming edges)
  const sources = nodes.filter(
    (n) => (reverseAdj.get(n.id)?.size ?? 0) === 0
  );

  // If no sources, pick first node
  const startNodes = sources.length > 0 ? sources : [nodes[0]];

  // DFS to assign layers
  function dfs(nodeId: string, depth: number) {
    if (visited.has(nodeId)) {
      // Update layer if we found a longer path
      const existing = layers.get(nodeId) ?? 0;
      if (depth > existing) {
        layers.set(nodeId, depth);
      }
      return;
    }

    visited.add(nodeId);
    layers.set(nodeId, depth);

    const neighbors = adjacency.get(nodeId) ?? new Set();
    neighbors.forEach((neighbor) => {
      dfs(neighbor, depth + 1);
    });
  }

  startNodes.forEach((n) => dfs(n.id, 0));

  // Ensure all nodes have a layer
  nodes.forEach((n) => {
    if (!layers.has(n.id)) {
      layers.set(n.id, 0);
    }
  });

  return layers;
}

/**
 * Calculate lane-aware layout
 * Groups nodes by their lane assignment and arranges within lanes
 */
export function calculateLaneAwareLayout(
  nodes: Node[],
  edges: Edge[],
  config: LayoutConfig
): LayoutResult {
  if (nodes.length === 0 || !config.laneKeys) return { nodes, edges };

  const laneKeys = config.laneKeys;
  const isHorizontal = config.direction === 'LR' || config.direction === 'RL';

  // Group nodes by lane
  const nodesByLane = new Map<string, Node[]>();
  const noLaneNodes: Node[] = [];

  laneKeys.forEach((key) => nodesByLane.set(key, []));

  nodes.forEach((node) => {
    const lane = node.data?.lane || node.data?.stageKey || node.data?.domainLane;
    if (lane && typeof lane === 'string' && nodesByLane.has(lane)) {
      nodesByLane.get(lane)?.push(node);
    } else {
      noLaneNodes.push(node);
    }
  });

  // Calculate layout within each lane
  const resultNodes: Node[] = [];

  let laneOffset = 0;
  laneKeys.forEach((laneKey) => {
    const laneNodes = nodesByLane.get(laneKey) || [];
    const laneWidth = config.laneWidth;

    // Simple vertical arrangement within lane
    let nodeOffset = LANE_HEADER_HEIGHT + config.nodeSpacing;

    laneNodes.forEach((node) => {
      const width = node.measured?.width ?? node.width ?? 160;
      const height = node.measured?.height ?? node.height ?? 80;

      // Check if we should preserve manual position
      if (config.preserveManualPositions && node.data?.isManuallyPositioned) {
        resultNodes.push(node);
        return;
      }

      const x = isHorizontal
        ? laneOffset + (laneWidth - width) / 2
        : nodeOffset;
      const y = isHorizontal
        ? nodeOffset
        : laneOffset + (laneWidth - height) / 2;

      resultNodes.push({
        ...node,
        position: { x, y },
      });

      nodeOffset += (isHorizontal ? height : width) + config.nodeSpacing;
    });

    laneOffset += laneWidth;
  });

  // Add nodes without lane at the end
  let orphanOffset = laneOffset + config.nodeSpacing;
  noLaneNodes.forEach((node) => {
    if (config.preserveManualPositions && node.data?.isManuallyPositioned) {
      resultNodes.push(node);
      return;
    }

    const height = node.measured?.height ?? node.height ?? 80;
    resultNodes.push({
      ...node,
      position: { x: orphanOffset, y: LANE_HEADER_HEIGHT + config.nodeSpacing },
    });
    orphanOffset += height + config.nodeSpacing;
  });

  return { nodes: resultNodes, edges };
}

/**
 * Main layout function - delegates to appropriate algorithm
 */
export function calculateLayout(
  nodes: Node[],
  edges: Edge[],
  config: LayoutConfig = defaultLayoutConfig
): LayoutResult {
  switch (config.mode) {
    case 'hierarchical':
      return calculateHierarchicalLayout(nodes, edges, config);
    case 'lane-aware':
      return calculateLaneAwareLayout(nodes, edges, config);
    case 'force':
      // Force-directed layout would go here
      return { nodes, edges };
    case 'manual':
    default:
      return { nodes, edges };
  }
}

/**
 * Layout selected nodes only
 */
export function calculateLayoutForSelection(
  allNodes: Node[],
  selectedNodeIds: Set<string>,
  edges: Edge[],
  config: LayoutConfig
): LayoutResult {
  const selectedNodes = allNodes.filter((n) => selectedNodeIds.has(n.id));
  const unselectedNodes = allNodes.filter((n) => !selectedNodeIds.has(n.id));

  // Only layout selected nodes
  const layoutResult = calculateLayout(selectedNodes, edges, {
    ...config,
    preserveManualPositions: false,
  });

  return {
    nodes: [...unselectedNodes, ...layoutResult.nodes],
    edges,
  };
}

/**
 * Auto-arrange nodes within a specific lane
 */
export function autoArrangeInLane(
  allNodes: Node[],
  laneKey: string,
  config: Partial<LayoutConfig> = {}
): Node[] {
  const laneNodes = allNodes.filter(
    (n) => n.data?.lane === laneKey || n.data?.stageKey === laneKey || n.data?.domainLane === laneKey
  );
  const otherNodes = allNodes.filter(
    (n) => n.data?.lane !== laneKey && n.data?.stageKey !== laneKey && n.data?.domainLane !== laneKey
  );

  if (laneNodes.length === 0) return allNodes;

  // Find lane bounds
  const laneMinX = Math.min(...laneNodes.map((n) => n.position.x));
  const laneMinY = Math.min(...laneNodes.map((n) => n.position.y));

  // Sort by current position
  const sorted = [...laneNodes].sort((a, b) => a.position.y - b.position.y);

  // Arrange vertically
  const spacing = config.nodeSpacing ?? 40;
  let currentY = Math.max(laneMinY, LANE_HEADER_HEIGHT + spacing);

  const arrangedNodes = sorted.map((node) => {
    const height = node.measured?.height ?? node.height ?? 80;
    const newNode = {
      ...node,
      position: {
        x: laneMinX,
        y: currentY,
      },
    };
    currentY += height + spacing;
    return newNode;
  });

  return [...otherNodes, ...arrangedNodes];
}
