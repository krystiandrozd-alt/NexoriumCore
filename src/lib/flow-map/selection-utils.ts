// Nexorium Core - Selection & Alignment Utilities
// Multi-select, alignment, distribution, and copy/paste

import type { Node, Edge } from '@xyflow/react';

// ============================================
// TYPES
// ============================================

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
}

// ============================================
// BOUNDING BOX CALCULATIONS
// ============================================

export function getNodeBounds(node: Node): BoundingBox {
  const width = node.measured?.width ?? node.width ?? 160;
  const height = node.measured?.height ?? node.height ?? 80;

  return {
    minX: node.position.x,
    maxX: node.position.x + width,
    minY: node.position.y,
    maxY: node.position.y + height,
    width,
    height,
    centerX: node.position.x + width / 2,
    centerY: node.position.y + height / 2,
  };
}

export function getSelectionBounds(nodes: Node[]): BoundingBox | null {
  if (nodes.length === 0) return null;

  const bounds = nodes.map(getNodeBounds);

  const minX = Math.min(...bounds.map((b) => b.minX));
  const maxX = Math.max(...bounds.map((b) => b.maxX));
  const minY = Math.min(...bounds.map((b) => b.minY));
  const maxY = Math.max(...bounds.map((b) => b.maxY));

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

// ============================================
// ALIGNMENT OPERATIONS
// ============================================

export type AlignmentType = 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom';

export function alignNodes(
  nodes: Node[],
  alignment: AlignmentType
): Node[] {
  if (nodes.length < 2) return nodes;

  const bounds = getSelectionBounds(nodes);
  if (!bounds) return nodes;

  return nodes.map((node) => {
    const nodeBounds = getNodeBounds(node);
    let newX = node.position.x;
    let newY = node.position.y;

    switch (alignment) {
      case 'left':
        newX = bounds.minX;
        break;
      case 'center-h':
        newX = bounds.centerX - nodeBounds.width / 2;
        break;
      case 'right':
        newX = bounds.maxX - nodeBounds.width;
        break;
      case 'top':
        newY = bounds.minY;
        break;
      case 'center-v':
        newY = bounds.centerY - nodeBounds.height / 2;
        break;
      case 'bottom':
        newY = bounds.maxY - nodeBounds.height;
        break;
    }

    return {
      ...node,
      position: { x: newX, y: newY },
    };
  });
}

// ============================================
// DISTRIBUTION OPERATIONS
// ============================================

export type DistributionType = 'horizontal' | 'vertical';

export function distributeNodes(
  nodes: Node[],
  direction: DistributionType
): Node[] {
  if (nodes.length < 3) return nodes;

  const bounds = getSelectionBounds(nodes);
  if (!bounds) return nodes;

  // Sort nodes by position
  const sortedNodes = [...nodes].sort((a, b) => {
    if (direction === 'horizontal') {
      return a.position.x - b.position.x;
    }
    return a.position.y - b.position.y;
  });

  // Calculate total space needed
  const nodeBounds = sortedNodes.map(getNodeBounds);
  const totalNodeSize = nodeBounds.reduce((sum, b) => {
    return sum + (direction === 'horizontal' ? b.width : b.height);
  }, 0);

  const totalSpace = direction === 'horizontal' ? bounds.width : bounds.height;
  const gap = (totalSpace - totalNodeSize) / (nodes.length - 1);

  // Distribute nodes
  let currentPosition = direction === 'horizontal' ? bounds.minX : bounds.minY;

  return sortedNodes.map((node, index) => {
    const nodeBound = nodeBounds[index];
    const newPosition = direction === 'horizontal'
      ? { x: currentPosition, y: node.position.y }
      : { x: node.position.x, y: currentPosition };

    currentPosition += (direction === 'horizontal' ? nodeBound.width : nodeBound.height) + gap;

    return {
      ...node,
      position: newPosition,
    };
  });
}

// ============================================
// SNAP TO GRID
// ============================================

export interface SnapConfig {
  enabled: boolean;
  gridSize: number;
  showGuides: boolean;
}

export const defaultSnapConfig: SnapConfig = {
  enabled: false,
  gridSize: 20,
  showGuides: true,
};

export function snapToGrid(
  position: { x: number; y: number },
  gridSize: number
): { x: number; y: number } {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

// ============================================
// ALIGNMENT GUIDES
// ============================================

const SNAP_THRESHOLD = 8;

export function findAlignmentGuides(
  draggingNode: Node,
  otherNodes: Node[],
  threshold: number = SNAP_THRESHOLD
): { guides: AlignmentGuide[]; snappedPosition: { x: number; y: number } } {
  const guides: AlignmentGuide[] = [];
  const dragBounds = getNodeBounds(draggingNode);
  let snappedX = draggingNode.position.x;
  let snappedY = draggingNode.position.y;

  for (const node of otherNodes) {
    if (node.id === draggingNode.id) continue;

    const bounds = getNodeBounds(node);

    // Check horizontal alignments (Y positions)
    // Top alignment
    if (Math.abs(dragBounds.minY - bounds.minY) < threshold) {
      guides.push({
        type: 'horizontal',
        position: bounds.minY,
        start: Math.min(dragBounds.minX, bounds.minX),
        end: Math.max(dragBounds.maxX, bounds.maxX),
      });
      snappedY = bounds.minY;
    }

    // Bottom alignment
    if (Math.abs(dragBounds.maxY - bounds.maxY) < threshold) {
      guides.push({
        type: 'horizontal',
        position: bounds.maxY,
        start: Math.min(dragBounds.minX, bounds.minX),
        end: Math.max(dragBounds.maxX, bounds.maxX),
      });
      snappedY = bounds.maxY - dragBounds.height;
    }

    // Center Y alignment
    if (Math.abs(dragBounds.centerY - bounds.centerY) < threshold) {
      guides.push({
        type: 'horizontal',
        position: bounds.centerY,
        start: Math.min(dragBounds.minX, bounds.minX),
        end: Math.max(dragBounds.maxX, bounds.maxX),
      });
      snappedY = bounds.centerY - dragBounds.height / 2;
    }

    // Check vertical alignments (X positions)
    // Left alignment
    if (Math.abs(dragBounds.minX - bounds.minX) < threshold) {
      guides.push({
        type: 'vertical',
        position: bounds.minX,
        start: Math.min(dragBounds.minY, bounds.minY),
        end: Math.max(dragBounds.maxY, bounds.maxY),
      });
      snappedX = bounds.minX;
    }

    // Right alignment
    if (Math.abs(dragBounds.maxX - bounds.maxX) < threshold) {
      guides.push({
        type: 'vertical',
        position: bounds.maxX,
        start: Math.min(dragBounds.minY, bounds.minY),
        end: Math.max(dragBounds.maxY, bounds.maxY),
      });
      snappedX = bounds.maxX - dragBounds.width;
    }

    // Center X alignment
    if (Math.abs(dragBounds.centerX - bounds.centerX) < threshold) {
      guides.push({
        type: 'vertical',
        position: bounds.centerX,
        start: Math.min(dragBounds.minY, bounds.minY),
        end: Math.max(dragBounds.maxY, bounds.maxY),
      });
      snappedX = bounds.centerX - dragBounds.width / 2;
    }
  }

  return { guides, snappedPosition: { x: snappedX, y: snappedY } };
}

// ============================================
// COPY / PASTE
// ============================================

export interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

const CLIPBOARD_KEY = 'nexorium-flow-clipboard';

export function copyToClipboard(nodes: Node[], edges: Edge[]): void {
  // Filter edges to only include those connecting copied nodes
  const nodeIds = new Set(nodes.map((n) => n.id));
  const relevantEdges = edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  const data: ClipboardData = {
    nodes,
    edges: relevantEdges,
    timestamp: Date.now(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(data));
  }
}

export function getFromClipboard(): ClipboardData | null {
  if (typeof window === 'undefined') return null;

  const saved = localStorage.getItem(CLIPBOARD_KEY);
  if (!saved) return null;

  try {
    const data = JSON.parse(saved) as ClipboardData;
    // Clipboard expires after 30 minutes
    if (Date.now() - data.timestamp > 30 * 60 * 1000) {
      localStorage.removeItem(CLIPBOARD_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function pasteFromClipboard(
  offset: { x: number; y: number } = { x: 20, y: 20 },
  generateId: () => string
): { nodes: Node[]; edges: Edge[] } | null {
  const data = getFromClipboard();
  if (!data) return null;

  // Create ID mapping
  const idMap = new Map<string, string>();
  data.nodes.forEach((node) => {
    idMap.set(node.id, generateId());
  });

  // Clone nodes with new IDs and offset positions
  const newNodes = data.nodes.map((node) => ({
    ...node,
    id: idMap.get(node.id) || generateId(),
    position: {
      x: node.position.x + offset.x,
      y: node.position.y + offset.y,
    },
    selected: true,
  }));

  // Clone edges with new IDs and updated source/target
  const newEdges = data.edges.map((edge) => ({
    ...edge,
    id: generateId(),
    source: idMap.get(edge.source) || edge.source,
    target: idMap.get(edge.target) || edge.target,
    selected: true,
  }));

  return { nodes: newNodes, edges: newEdges };
}

// ============================================
// SELECTION RECTANGLE
// ============================================

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function nodesInSelectionRect(
  nodes: Node[],
  rect: SelectionRect
): Node[] {
  const rectMinX = Math.min(rect.x, rect.x + rect.width);
  const rectMaxX = Math.max(rect.x, rect.x + rect.width);
  const rectMinY = Math.min(rect.y, rect.y + rect.height);
  const rectMaxY = Math.max(rect.y, rect.y + rect.height);

  return nodes.filter((node) => {
    const bounds = getNodeBounds(node);

    // Check if node intersects with selection rectangle
    return !(
      bounds.maxX < rectMinX ||
      bounds.minX > rectMaxX ||
      bounds.maxY < rectMinY ||
      bounds.minY > rectMaxY
    );
  });
}

// ============================================
// GROUP MOVE
// ============================================

export function moveNodesBy(
  nodes: Node[],
  delta: { x: number; y: number }
): Node[] {
  return nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x + delta.x,
      y: node.position.y + delta.y,
    },
  }));
}
