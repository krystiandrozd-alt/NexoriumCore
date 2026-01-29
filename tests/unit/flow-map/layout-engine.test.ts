// Nexorium Core - Layout Engine Unit Tests

import { describe, it, expect } from 'vitest';
import type { Node, Edge } from '@xyflow/react';
import {
  calculateHierarchicalLayout,
  calculateLaneAwareLayout,
  calculateLayout,
  autoArrangeInLane,
  defaultLayoutConfig,
} from '@/lib/flow-map/layout-engine';

// Helper to create test nodes
function createNode(id: string, x = 0, y = 0, data: Record<string, unknown> = {}): Node {
  return {
    id,
    position: { x, y },
    measured: { width: 160, height: 80 },
    data,
    type: 'default',
  };
}

// Helper to create test edges
function createEdge(source: string, target: string): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
  };
}

describe('layout-engine', () => {
  describe('calculateHierarchicalLayout', () => {
    it('returns empty result for empty nodes', () => {
      const result = calculateHierarchicalLayout([], []);
      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });

    it('assigns different x positions to connected nodes (LR direction)', () => {
      const nodes = [createNode('A'), createNode('B'), createNode('C')];
      const edges = [createEdge('A', 'B'), createEdge('B', 'C')];

      const result = calculateHierarchicalLayout(nodes, edges, {
        ...defaultLayoutConfig,
        direction: 'LR',
      });

      const positions = result.nodes.map((n) => n.position.x);
      // A should be leftmost, C should be rightmost
      const nodeA = result.nodes.find((n) => n.id === 'A');
      const nodeB = result.nodes.find((n) => n.id === 'B');
      const nodeC = result.nodes.find((n) => n.id === 'C');

      expect(nodeA!.position.x).toBeLessThan(nodeB!.position.x);
      expect(nodeB!.position.x).toBeLessThan(nodeC!.position.x);
    });

    it('assigns different y positions to connected nodes (TB direction)', () => {
      const nodes = [createNode('A'), createNode('B'), createNode('C')];
      const edges = [createEdge('A', 'B'), createEdge('B', 'C')];

      const result = calculateHierarchicalLayout(nodes, edges, {
        ...defaultLayoutConfig,
        direction: 'TB',
      });

      const nodeA = result.nodes.find((n) => n.id === 'A');
      const nodeB = result.nodes.find((n) => n.id === 'B');
      const nodeC = result.nodes.find((n) => n.id === 'C');

      expect(nodeA!.position.y).toBeLessThan(nodeB!.position.y);
      expect(nodeB!.position.y).toBeLessThan(nodeC!.position.y);
    });

    it('preserves manually positioned nodes', () => {
      const nodes = [
        createNode('A', 500, 500, { isManuallyPositioned: true }),
        createNode('B'),
      ];
      const edges = [createEdge('A', 'B')];

      const result = calculateHierarchicalLayout(nodes, edges, {
        ...defaultLayoutConfig,
        preserveManualPositions: true,
      });

      const nodeA = result.nodes.find((n) => n.id === 'A');
      expect(nodeA!.position.x).toBe(500);
      expect(nodeA!.position.y).toBe(500);
    });

    it('handles disconnected nodes', () => {
      const nodes = [createNode('A'), createNode('B'), createNode('C')];
      const edges: Edge[] = [];

      const result = calculateHierarchicalLayout(nodes, edges);

      expect(result.nodes).toHaveLength(3);
      // All nodes should have assigned positions
      result.nodes.forEach((node) => {
        expect(node.position.x).toBeGreaterThanOrEqual(0);
        expect(node.position.y).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('calculateLaneAwareLayout', () => {
    it('groups nodes by lane', () => {
      const nodes = [
        createNode('A', 0, 0, { lane: 'DEV' }),
        createNode('B', 0, 0, { lane: 'DEV' }),
        createNode('C', 0, 0, { lane: 'SIT' }),
      ];

      const result = calculateLaneAwareLayout(nodes, [], {
        ...defaultLayoutConfig,
        mode: 'lane-aware',
        laneKeys: ['DEV', 'SIT'],
        laneWidth: 300,
      });

      const devNodes = result.nodes.filter((n) => (n.data as { lane: string }).lane === 'DEV');
      const sitNodes = result.nodes.filter((n) => (n.data as { lane: string }).lane === 'SIT');

      // DEV nodes should be in first lane (x < 300)
      devNodes.forEach((n) => {
        expect(n.position.x).toBeLessThan(300);
      });

      // SIT nodes should be in second lane (x >= 300)
      sitNodes.forEach((n) => {
        expect(n.position.x).toBeGreaterThanOrEqual(300);
      });
    });

    it('returns unchanged if no laneKeys provided', () => {
      const nodes = [createNode('A'), createNode('B')];
      const result = calculateLaneAwareLayout(nodes, [], {
        ...defaultLayoutConfig,
        mode: 'lane-aware',
      });

      expect(result.nodes).toEqual(nodes);
    });
  });

  describe('calculateLayout', () => {
    it('delegates to hierarchical layout', () => {
      const nodes = [createNode('A'), createNode('B')];
      const edges = [createEdge('A', 'B')];

      const result = calculateLayout(nodes, edges, {
        ...defaultLayoutConfig,
        mode: 'hierarchical',
      });

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0].position.x).not.toBe(result.nodes[1].position.x);
    });

    it('delegates to lane-aware layout', () => {
      const nodes = [
        createNode('A', 0, 0, { lane: 'DEV' }),
        createNode('B', 0, 0, { lane: 'SIT' }),
      ];

      const result = calculateLayout(nodes, [], {
        ...defaultLayoutConfig,
        mode: 'lane-aware',
        laneKeys: ['DEV', 'SIT'],
      });

      expect(result.nodes).toHaveLength(2);
    });

    it('returns unchanged for manual mode', () => {
      const nodes = [
        createNode('A', 100, 100),
        createNode('B', 200, 200),
      ];

      const result = calculateLayout(nodes, [], {
        ...defaultLayoutConfig,
        mode: 'manual',
      });

      expect(result.nodes[0].position).toEqual({ x: 100, y: 100 });
      expect(result.nodes[1].position).toEqual({ x: 200, y: 200 });
    });
  });

  describe('autoArrangeInLane', () => {
    it('arranges nodes vertically within lane', () => {
      const nodes = [
        createNode('A', 100, 500, { stageKey: 'DEV' }),
        createNode('B', 150, 100, { stageKey: 'DEV' }),
        createNode('C', 200, 300, { stageKey: 'SIT' }),
      ];

      const result = autoArrangeInLane(nodes, 'DEV', { nodeSpacing: 20 });

      // DEV nodes should be arranged vertically
      const devNodes = result.filter((n) => (n.data as { stageKey: string }).stageKey === 'DEV');
      expect(devNodes[0].position.y).toBeLessThan(devNodes[1].position.y);

      // SIT node should be unchanged
      const sitNode = result.find((n) => n.id === 'C');
      expect(sitNode!.position).toEqual({ x: 200, y: 300 });
    });

    it('returns unchanged if no nodes in lane', () => {
      const nodes = [createNode('A', 100, 100, { stageKey: 'SIT' })];
      const result = autoArrangeInLane(nodes, 'DEV');
      expect(result).toEqual(nodes);
    });
  });
});
