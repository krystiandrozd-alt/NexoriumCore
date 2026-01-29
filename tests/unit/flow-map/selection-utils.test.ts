// Nexorium Core - Selection Utils Unit Tests

import { describe, it, expect } from 'vitest';
import type { Node } from '@xyflow/react';
import {
  getNodeBounds,
  getSelectionBounds,
  alignNodes,
  distributeNodes,
  snapToGrid,
  moveNodesBy,
  nodesInSelectionRect,
} from '@/lib/flow-map/selection-utils';

// Helper to create test nodes
function createNode(id: string, x: number, y: number, width = 160, height = 80): Node {
  return {
    id,
    position: { x, y },
    measured: { width, height },
    data: {},
    type: 'default',
  };
}

describe('selection-utils', () => {
  describe('getNodeBounds', () => {
    it('calculates bounds correctly', () => {
      const node = createNode('1', 100, 200, 160, 80);
      const bounds = getNodeBounds(node);

      expect(bounds.minX).toBe(100);
      expect(bounds.minY).toBe(200);
      expect(bounds.maxX).toBe(260);
      expect(bounds.maxY).toBe(280);
      expect(bounds.width).toBe(160);
      expect(bounds.height).toBe(80);
      expect(bounds.centerX).toBe(180);
      expect(bounds.centerY).toBe(240);
    });

    it('uses default dimensions when measured is undefined', () => {
      const node: Node = {
        id: '1',
        position: { x: 0, y: 0 },
        data: {},
        type: 'default',
      };
      const bounds = getNodeBounds(node);
      expect(bounds.width).toBe(160);
      expect(bounds.height).toBe(80);
    });
  });

  describe('getSelectionBounds', () => {
    it('returns null for empty array', () => {
      expect(getSelectionBounds([])).toBeNull();
    });

    it('calculates combined bounds for multiple nodes', () => {
      const nodes = [
        createNode('1', 0, 0, 100, 50),
        createNode('2', 200, 100, 100, 50),
        createNode('3', 100, 200, 100, 50),
      ];
      const bounds = getSelectionBounds(nodes);

      expect(bounds).not.toBeNull();
      expect(bounds!.minX).toBe(0);
      expect(bounds!.minY).toBe(0);
      expect(bounds!.maxX).toBe(300);
      expect(bounds!.maxY).toBe(250);
    });
  });

  describe('alignNodes', () => {
    const nodes = [
      createNode('1', 50, 100),
      createNode('2', 100, 200),
      createNode('3', 150, 150),
    ];

    it('aligns nodes to left', () => {
      const aligned = alignNodes(nodes, 'left');
      expect(aligned.every((n) => n.position.x === 50)).toBe(true);
    });

    it('aligns nodes to right', () => {
      const aligned = alignNodes(nodes, 'right');
      // Right edge should be at maxX (150 + 160 = 310)
      // So x positions should be 310 - 160 = 150
      expect(aligned.every((n) => n.position.x === 150)).toBe(true);
    });

    it('aligns nodes to top', () => {
      const aligned = alignNodes(nodes, 'top');
      expect(aligned.every((n) => n.position.y === 100)).toBe(true);
    });

    it('aligns nodes to bottom', () => {
      const aligned = alignNodes(nodes, 'bottom');
      // Bottom edge should be at maxY (200 + 80 = 280)
      // So y positions should be 280 - 80 = 200
      expect(aligned.every((n) => n.position.y === 200)).toBe(true);
    });

    it('returns unchanged for single node', () => {
      const singleNode = [createNode('1', 100, 100)];
      const aligned = alignNodes(singleNode, 'left');
      expect(aligned).toEqual(singleNode);
    });
  });

  describe('distributeNodes', () => {
    it('distributes nodes horizontally', () => {
      const nodes = [
        createNode('1', 0, 0, 100, 50),
        createNode('2', 50, 0, 100, 50),
        createNode('3', 400, 0, 100, 50),
      ];
      const distributed = distributeNodes(nodes, 'horizontal');

      // Check nodes are evenly spaced
      const positions = distributed.map((n) => n.position.x).sort((a, b) => a - b);
      const gap1 = positions[1] - positions[0];
      const gap2 = positions[2] - positions[1];
      // Gaps should be roughly equal (accounting for node widths)
      expect(Math.abs(gap1 - gap2)).toBeLessThan(5);
    });

    it('returns unchanged for less than 3 nodes', () => {
      const nodes = [
        createNode('1', 0, 0),
        createNode('2', 100, 0),
      ];
      const distributed = distributeNodes(nodes, 'horizontal');
      expect(distributed).toEqual(nodes);
    });
  });

  describe('snapToGrid', () => {
    it('snaps to nearest grid point', () => {
      expect(snapToGrid({ x: 23, y: 37 }, 20)).toEqual({ x: 20, y: 40 });
      expect(snapToGrid({ x: 10, y: 10 }, 20)).toEqual({ x: 20, y: 20 });
      expect(snapToGrid({ x: 0, y: 0 }, 20)).toEqual({ x: 0, y: 0 });
    });

    it('handles negative values', () => {
      expect(snapToGrid({ x: -23, y: -37 }, 20)).toEqual({ x: -20, y: -40 });
    });
  });

  describe('moveNodesBy', () => {
    it('moves all nodes by delta', () => {
      const nodes = [
        createNode('1', 100, 100),
        createNode('2', 200, 200),
      ];
      const moved = moveNodesBy(nodes, { x: 50, y: -30 });

      expect(moved[0].position).toEqual({ x: 150, y: 70 });
      expect(moved[1].position).toEqual({ x: 250, y: 170 });
    });

    it('handles negative deltas', () => {
      const nodes = [createNode('1', 100, 100)];
      const moved = moveNodesBy(nodes, { x: -150, y: -150 });

      expect(moved[0].position).toEqual({ x: -50, y: -50 });
    });
  });

  describe('nodesInSelectionRect', () => {
    const nodes = [
      createNode('1', 0, 0, 100, 100),
      createNode('2', 200, 200, 100, 100),
      createNode('3', 400, 400, 100, 100),
    ];

    it('returns nodes intersecting with selection rectangle', () => {
      const rect = { x: 50, y: 50, width: 200, height: 200 };
      const selected = nodesInSelectionRect(nodes, rect);

      expect(selected).toHaveLength(2);
      expect(selected.map((n) => n.id)).toContain('1');
      expect(selected.map((n) => n.id)).toContain('2');
    });

    it('returns empty array when no intersection', () => {
      const rect = { x: 600, y: 600, width: 100, height: 100 };
      const selected = nodesInSelectionRect(nodes, rect);

      expect(selected).toHaveLength(0);
    });

    it('handles negative width/height (inverted selection)', () => {
      const rect = { x: 250, y: 250, width: -200, height: -200 };
      const selected = nodesInSelectionRect(nodes, rect);

      expect(selected).toHaveLength(2);
    });
  });
});
