// TelEnvIQ - Graph Analysis Utility
// Deterministic computation of entry/exit nodes without inference engine

import type { GraphAnalysisResult } from '@/types';

interface GraphNode {
  id: string;
}

interface GraphEdge {
  fromId: string;
  toId: string;
}

/**
 * Compute entry and exit candidates from a directed graph.
 *
 * Entry candidates: nodes with in_degree == 0 (no incoming edges)
 * Exit candidates: nodes with out_degree == 0 (no outgoing edges)
 *
 * @param nodes - Array of nodes with id property
 * @param edges - Array of edges with fromId and toId properties
 * @param overriddenEntryId - Optional manual override for entry node
 * @param overriddenExitId - Optional manual override for exit node
 * @returns GraphAnalysisResult with entry/exit candidates and overrides
 */
export function analyzeGraphTopology(
  nodes: GraphNode[],
  edges: GraphEdge[],
  overriddenEntryId?: string | null,
  overriddenExitId?: string | null
): GraphAnalysisResult {
  // Build degree maps
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();

  // Initialize all nodes with 0 degrees
  for (const node of nodes) {
    inDegree.set(node.id, 0);
    outDegree.set(node.id, 0);
  }

  // Count degrees from edges
  for (const edge of edges) {
    // Increment in-degree of target node
    if (inDegree.has(edge.toId)) {
      inDegree.set(edge.toId, (inDegree.get(edge.toId) || 0) + 1);
    }

    // Increment out-degree of source node
    if (outDegree.has(edge.fromId)) {
      outDegree.set(edge.fromId, (outDegree.get(edge.fromId) || 0) + 1);
    }
  }

  // Find entry candidates (in_degree == 0)
  const entryCandidates: string[] = [];
  Array.from(inDegree.entries()).forEach(([nodeId, degree]) => {
    if (degree === 0) {
      entryCandidates.push(nodeId);
    }
  });

  // Find exit candidates (out_degree == 0)
  const exitCandidates: string[] = [];
  Array.from(outDegree.entries()).forEach(([nodeId, degree]) => {
    if (degree === 0) {
      exitCandidates.push(nodeId);
    }
  });

  // Sort for deterministic output
  entryCandidates.sort();
  exitCandidates.sort();

  return {
    entryCandidates,
    exitCandidates,
    overriddenEntry: overriddenEntryId || null,
    overriddenExit: overriddenExitId || null,
  };
}

/**
 * Determine if a node is an entry point based on graph analysis.
 * Uses override if set, otherwise checks if node is in entry candidates.
 */
export function isEntryNode(
  nodeId: string,
  analysis: GraphAnalysisResult
): boolean {
  if (analysis.overriddenEntry) {
    return nodeId === analysis.overriddenEntry;
  }
  return analysis.entryCandidates.includes(nodeId);
}

/**
 * Determine if a node is an exit point based on graph analysis.
 * Uses override if set, otherwise checks if node is in exit candidates.
 */
export function isExitNode(
  nodeId: string,
  analysis: GraphAnalysisResult
): boolean {
  if (analysis.overriddenExit) {
    return nodeId === analysis.overriddenExit;
  }
  return analysis.exitCandidates.includes(nodeId);
}

/**
 * Compute topological sort of nodes for layer-based layout.
 * Returns nodes in order from entry to exit (left to right within layer).
 * Falls back to stable name-based sort if graph is cyclic.
 */
export function topologicalSort(
  nodes: GraphNode[],
  edges: GraphEdge[]
): string[] {
  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    if (adjacency.has(edge.fromId) && inDegree.has(edge.toId)) {
      adjacency.get(edge.fromId)!.push(edge.toId);
      inDegree.set(edge.toId, (inDegree.get(edge.toId) || 0) + 1);
    }
  }

  // Kahn's algorithm for topological sort
  const queue: string[] = [];
  const result: string[] = [];

  // Start with nodes that have no incoming edges
  Array.from(inDegree.entries()).forEach(([nodeId, degree]) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  // Sort queue for deterministic order
  queue.sort();

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        // Insert in sorted order for determinism
        const insertIndex = queue.findIndex(id => id > neighbor);
        if (insertIndex === -1) {
          queue.push(neighbor);
        } else {
          queue.splice(insertIndex, 0, neighbor);
        }
      }
    }
  }

  // If we didn't process all nodes, graph has a cycle
  // Fall back to stable sort by node ID
  if (result.length < nodes.length) {
    const processedSet = new Set(result);
    const remaining = nodes
      .filter(n => !processedSet.has(n.id))
      .map(n => n.id)
      .sort();
    return [...result, ...remaining];
  }

  return result;
}

/**
 * Group nodes by their layer for swimlane layout.
 */
export function groupNodesByLayer<T extends { id: string; layer: string }>(
  nodes: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const node of nodes) {
    const layer = node.layer || 'UNKNOWN';
    if (!groups.has(layer)) {
      groups.set(layer, []);
    }
    groups.get(layer)!.push(node);
  }

  return groups;
}

/**
 * Compute positions for nodes using layer-based auto-layout.
 * BSS at top (row 1), then INFRA, then OSS (row 3).
 * EXTERNAL on left/right column, UNKNOWN at bottom.
 */
export function computeLayerPositions(
  nodes: Array<{ id: string; layer: string }>,
  edges: GraphEdge[],
  options: {
    width?: number;
    height?: number;
    nodeWidth?: number;
    nodeHeight?: number;
    horizontalGap?: number;
    verticalGap?: number;
  } = {}
): Map<string, { x: number; y: number }> {
  const {
    width = 1200,
    nodeWidth = 180,
    nodeHeight = 80,
    horizontalGap = 40,
    verticalGap = 120,
  } = options;

  const positions = new Map<string, { x: number; y: number }>();

  // Layer order (top to bottom)
  const layerOrder = ['BSS', 'INFRA', 'OSS', 'UNKNOWN'];
  const externalLayer = 'EXTERNAL';

  // Group nodes by layer
  const layerGroups = groupNodesByLayer(nodes);

  // Get topological order for horizontal positioning within layers
  const topoOrder = topologicalSort(nodes, edges);
  const topoIndex = new Map<string, number>();
  topoOrder.forEach((id, idx) => topoIndex.set(id, idx));

  // Position each layer
  let currentY = 50; // Start with some padding

  // Position non-external layers
  for (const layer of layerOrder) {
    const layerNodes = layerGroups.get(layer) || [];
    if (layerNodes.length === 0) continue;

    // Sort by topological order for horizontal positioning
    layerNodes.sort((a, b) => (topoIndex.get(a.id) || 0) - (topoIndex.get(b.id) || 0));

    // Calculate horizontal positions
    const totalWidth = layerNodes.length * nodeWidth + (layerNodes.length - 1) * horizontalGap;
    let startX = (width - totalWidth) / 2;
    if (startX < 50) startX = 50;

    for (let i = 0; i < layerNodes.length; i++) {
      positions.set(layerNodes[i].id, {
        x: startX + i * (nodeWidth + horizontalGap),
        y: currentY,
      });
    }

    currentY += nodeHeight + verticalGap;
  }

  // Position external nodes on the left
  const externalNodes = layerGroups.get(externalLayer) || [];
  if (externalNodes.length > 0) {
    const externalX = 20;
    const totalExternalHeight = externalNodes.length * nodeHeight + (externalNodes.length - 1) * verticalGap / 2;
    let externalStartY = (currentY - totalExternalHeight) / 2;
    if (externalStartY < 50) externalStartY = 50;

    for (let i = 0; i < externalNodes.length; i++) {
      positions.set(externalNodes[i].id, {
        x: externalX,
        y: externalStartY + i * (nodeHeight + verticalGap / 2),
      });
    }
  }

  return positions;
}
