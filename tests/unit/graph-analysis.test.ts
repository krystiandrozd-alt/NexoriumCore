// Nexorium Core - Graph Analysis Unit Tests
// Tests for entry/exit node detection and topological sorting

import { describe, it, expect } from 'vitest';
import {
  analyzeGraphTopology,
  isEntryNode,
  isExitNode,
  topologicalSort,
  groupNodesByLayer,
  computeLayerPositions,
} from '@/lib/utils/graph-analysis';
import {
  GRAPH_NODES,
  GRAPH_EDGES,
  EXPECTED_GRAPH_ANALYSIS,
  NODES_BY_LAYER,
  INSTANCE_IDS,
} from '@tests/fixtures';

// ============================================
// TEST DATA HELPERS
// ============================================

function createSimpleGraph(nodeCount: number): {
  nodes: Array<{ id: string }>;
  edges: Array<{ fromId: string; toId: string }>;
} {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `node-${i + 1}`,
  }));

  // Create a chain: node-1 -> node-2 -> ... -> node-n
  const edges = Array.from({ length: nodeCount - 1 }, (_, i) => ({
    fromId: `node-${i + 1}`,
    toId: `node-${i + 2}`,
  }));

  return { nodes, edges };
}

function convertFixtureEdges(edges: typeof GRAPH_EDGES) {
  return edges.map((e) => ({
    fromId: e.source,
    toId: e.target,
  }));
}

// ============================================
// ENTRY/EXIT DETECTION TESTS
// ============================================

describe('analyzeGraphTopology', () => {
  describe('simple chain graph', () => {
    it('should identify single entry and exit in a chain', () => {
      const { nodes, edges } = createSimpleGraph(5);

      const result = analyzeGraphTopology(nodes, edges);

      expect(result.entryCandidates).toEqual(['node-1']);
      expect(result.exitCandidates).toEqual(['node-5']);
      expect(result.overriddenEntry).toBeNull();
      expect(result.overriddenExit).toBeNull();
    });

    it('should return both nodes for a 2-node chain', () => {
      const { nodes, edges } = createSimpleGraph(2);

      const result = analyzeGraphTopology(nodes, edges);

      expect(result.entryCandidates).toEqual(['node-1']);
      expect(result.exitCandidates).toEqual(['node-2']);
    });
  });

  describe('single node graph', () => {
    it('should identify the node as both entry and exit', () => {
      const nodes = [{ id: 'only-node' }];
      const edges: Array<{ fromId: string; toId: string }> = [];

      const result = analyzeGraphTopology(nodes, edges);

      expect(result.entryCandidates).toEqual(['only-node']);
      expect(result.exitCandidates).toEqual(['only-node']);
    });
  });

  describe('disconnected graph', () => {
    it('should identify multiple entry points when no edges exist', () => {
      const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      const edges: Array<{ fromId: string; toId: string }> = [];

      const result = analyzeGraphTopology(nodes, edges);

      expect(result.entryCandidates).toEqual(['a', 'b', 'c']);
      expect(result.exitCandidates).toEqual(['a', 'b', 'c']);
    });
  });

  describe('diamond graph (fan-out, fan-in)', () => {
    it('should identify single entry and exit in a diamond', () => {
      // Structure:
      //       A
      //      / \
      //     B   C
      //      \ /
      //       D
      const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }];
      const edges = [
        { fromId: 'A', toId: 'B' },
        { fromId: 'A', toId: 'C' },
        { fromId: 'B', toId: 'D' },
        { fromId: 'C', toId: 'D' },
      ];

      const result = analyzeGraphTopology(nodes, edges);

      expect(result.entryCandidates).toEqual(['A']);
      expect(result.exitCandidates).toEqual(['D']);
    });
  });

  describe('multiple entry and exit points', () => {
    it('should identify multiple entries when several nodes have no incoming edges', () => {
      // Structure:
      // A -> C
      // B -> C -> D
      const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }];
      const edges = [
        { fromId: 'A', toId: 'C' },
        { fromId: 'B', toId: 'C' },
        { fromId: 'C', toId: 'D' },
      ];

      const result = analyzeGraphTopology(nodes, edges);

      expect(result.entryCandidates).toEqual(['A', 'B']);
      expect(result.exitCandidates).toEqual(['D']);
    });

    it('should identify multiple exits when several nodes have no outgoing edges', () => {
      // Structure:
      // A -> B -> C
      //       \-> D
      const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }];
      const edges = [
        { fromId: 'A', toId: 'B' },
        { fromId: 'B', toId: 'C' },
        { fromId: 'B', toId: 'D' },
      ];

      const result = analyzeGraphTopology(nodes, edges);

      expect(result.entryCandidates).toEqual(['A']);
      expect(result.exitCandidates).toEqual(['C', 'D']);
    });
  });

  describe('with manual overrides', () => {
    it('should include override in result when entry override is set', () => {
      const { nodes, edges } = createSimpleGraph(3);

      const result = analyzeGraphTopology(nodes, edges, 'node-2', null);

      expect(result.overriddenEntry).toBe('node-2');
      expect(result.overriddenExit).toBeNull();
      // entryCandidates still computed from graph
      expect(result.entryCandidates).toEqual(['node-1']);
    });

    it('should include override in result when exit override is set', () => {
      const { nodes, edges } = createSimpleGraph(3);

      const result = analyzeGraphTopology(nodes, edges, null, 'node-2');

      expect(result.overriddenEntry).toBeNull();
      expect(result.overriddenExit).toBe('node-2');
      // exitCandidates still computed from graph
      expect(result.exitCandidates).toEqual(['node-3']);
    });

    it('should handle both overrides', () => {
      const { nodes, edges } = createSimpleGraph(5);

      const result = analyzeGraphTopology(nodes, edges, 'node-2', 'node-4');

      expect(result.overriddenEntry).toBe('node-2');
      expect(result.overriddenExit).toBe('node-4');
    });
  });

  describe('deterministic output', () => {
    it('should return sorted entry and exit candidates', () => {
      const nodes = [{ id: 'z' }, { id: 'a' }, { id: 'm' }];
      const edges: Array<{ fromId: string; toId: string }> = [];

      const result = analyzeGraphTopology(nodes, edges);

      // Should be alphabetically sorted
      expect(result.entryCandidates).toEqual(['a', 'm', 'z']);
      expect(result.exitCandidates).toEqual(['a', 'm', 'z']);
    });

    it('should produce identical results for same input', () => {
      const { nodes, edges } = createSimpleGraph(10);

      const result1 = analyzeGraphTopology(nodes, edges);
      const result2 = analyzeGraphTopology(nodes, edges);

      expect(result1).toEqual(result2);
    });
  });

  describe('with real fixture data', () => {
    it('should correctly analyze the SIT environment topology', () => {
      const nodes = GRAPH_NODES.map((n) => ({ id: n.id }));
      const edges = convertFixtureEdges(GRAPH_EDGES);

      const result = analyzeGraphTopology(nodes, edges);

      expect(result.entryCandidates.sort()).toEqual(EXPECTED_GRAPH_ANALYSIS.entryCandidates.sort());
      expect(result.exitCandidates.sort()).toEqual(EXPECTED_GRAPH_ANALYSIS.exitCandidates.sort());
    });

    it('should identify Kong API Gateway as an entry candidate', () => {
      const nodes = GRAPH_NODES.map((n) => ({ id: n.id }));
      const edges = convertFixtureEdges(GRAPH_EDGES);

      const result = analyzeGraphTopology(nodes, edges);

      expect(result.entryCandidates).toContain(INSTANCE_IDS.KONG_API_GW);
    });

    it('should identify databases as exit candidates', () => {
      const nodes = GRAPH_NODES.map((n) => ({ id: n.id }));
      const edges = convertFixtureEdges(GRAPH_EDGES);

      const result = analyzeGraphTopology(nodes, edges);

      expect(result.exitCandidates).toContain(INSTANCE_IDS.ORACLE_DB);
      expect(result.exitCandidates).toContain(INSTANCE_IDS.KAFKA);
      expect(result.exitCandidates).toContain(INSTANCE_IDS.REDIS);
    });
  });
});

// ============================================
// ENTRY/EXIT HELPER TESTS
// ============================================

describe('isEntryNode', () => {
  it('should return true for node in entry candidates when no override', () => {
    const analysis = {
      entryCandidates: ['node-1', 'node-2'],
      exitCandidates: ['node-5'],
      overriddenEntry: null,
      overriddenExit: null,
    };

    expect(isEntryNode('node-1', analysis)).toBe(true);
    expect(isEntryNode('node-2', analysis)).toBe(true);
    expect(isEntryNode('node-3', analysis)).toBe(false);
  });

  it('should use override when set', () => {
    const analysis = {
      entryCandidates: ['node-1', 'node-2'],
      exitCandidates: ['node-5'],
      overriddenEntry: 'node-3',
      overriddenExit: null,
    };

    expect(isEntryNode('node-1', analysis)).toBe(false);
    expect(isEntryNode('node-3', analysis)).toBe(true);
  });
});

describe('isExitNode', () => {
  it('should return true for node in exit candidates when no override', () => {
    const analysis = {
      entryCandidates: ['node-1'],
      exitCandidates: ['node-4', 'node-5'],
      overriddenEntry: null,
      overriddenExit: null,
    };

    expect(isExitNode('node-4', analysis)).toBe(true);
    expect(isExitNode('node-5', analysis)).toBe(true);
    expect(isExitNode('node-3', analysis)).toBe(false);
  });

  it('should use override when set', () => {
    const analysis = {
      entryCandidates: ['node-1'],
      exitCandidates: ['node-4', 'node-5'],
      overriddenEntry: null,
      overriddenExit: 'node-3',
    };

    expect(isExitNode('node-4', analysis)).toBe(false);
    expect(isExitNode('node-3', analysis)).toBe(true);
  });
});

// ============================================
// TOPOLOGICAL SORT TESTS
// ============================================

describe('topologicalSort', () => {
  it('should return nodes in dependency order for a chain', () => {
    const { nodes, edges } = createSimpleGraph(5);

    const result = topologicalSort(nodes, edges);

    expect(result).toEqual(['node-1', 'node-2', 'node-3', 'node-4', 'node-5']);
  });

  it('should handle disconnected nodes', () => {
    const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const edges: Array<{ fromId: string; toId: string }> = [];

    const result = topologicalSort(nodes, edges);

    // Should be sorted alphabetically when no dependencies
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should handle diamond graph correctly', () => {
    const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }];
    const edges = [
      { fromId: 'A', toId: 'B' },
      { fromId: 'A', toId: 'C' },
      { fromId: 'B', toId: 'D' },
      { fromId: 'C', toId: 'D' },
    ];

    const result = topologicalSort(nodes, edges);

    // A must come first, D must come last
    expect(result[0]).toBe('A');
    expect(result[result.length - 1]).toBe('D');
    // B and C must come after A but before D
    expect(result.indexOf('B')).toBeGreaterThan(0);
    expect(result.indexOf('C')).toBeGreaterThan(0);
    expect(result.indexOf('B')).toBeLessThan(3);
    expect(result.indexOf('C')).toBeLessThan(3);
  });

  it('should handle cycles gracefully by appending remaining nodes', () => {
    // Create a cycle: A -> B -> C -> A
    const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
    const edges = [
      { fromId: 'A', toId: 'B' },
      { fromId: 'B', toId: 'C' },
      { fromId: 'C', toId: 'A' },
    ];

    const result = topologicalSort(nodes, edges);

    // Should return all nodes (cycle detection fallback)
    expect(result).toHaveLength(3);
    expect(result).toContain('A');
    expect(result).toContain('B');
    expect(result).toContain('C');
  });

  it('should produce deterministic results', () => {
    const { nodes, edges } = createSimpleGraph(10);

    const result1 = topologicalSort(nodes, edges);
    const result2 = topologicalSort(nodes, edges);

    expect(result1).toEqual(result2);
  });
});

// ============================================
// LAYER GROUPING TESTS
// ============================================

describe('groupNodesByLayer', () => {
  it('should group nodes by their layer', () => {
    const nodes = [
      { id: '1', layer: 'BSS' },
      { id: '2', layer: 'OSS' },
      { id: '3', layer: 'BSS' },
      { id: '4', layer: 'INFRA' },
    ];

    const result = groupNodesByLayer(nodes);

    expect(result.get('BSS')).toHaveLength(2);
    expect(result.get('OSS')).toHaveLength(1);
    expect(result.get('INFRA')).toHaveLength(1);
  });

  it('should handle empty input', () => {
    const result = groupNodesByLayer([]);

    expect(result.size).toBe(0);
  });

  it('should group correctly with fixture data', () => {
    const nodesWithLayer = GRAPH_NODES.map((n) => ({
      id: n.id,
      layer: n.data.layer,
    }));

    const result = groupNodesByLayer(nodesWithLayer);

    expect(result.get('BSS')?.length).toBe(NODES_BY_LAYER.BSS.length);
    expect(result.get('OSS')?.length).toBe(NODES_BY_LAYER.OSS.length);
    expect(result.get('INFRA')?.length).toBe(NODES_BY_LAYER.INFRA.length);
    expect(result.get('EXTERNAL')?.length).toBe(NODES_BY_LAYER.EXTERNAL.length);
  });
});

// ============================================
// LAYER POSITION TESTS
// ============================================

describe('computeLayerPositions', () => {
  it('should assign positions to all nodes', () => {
    const nodes = [
      { id: '1', layer: 'BSS' },
      { id: '2', layer: 'OSS' },
      { id: '3', layer: 'INFRA' },
    ];
    const edges: Array<{ fromId: string; toId: string }> = [];

    const result = computeLayerPositions(nodes, edges);

    expect(result.size).toBe(3);
    expect(result.has('1')).toBe(true);
    expect(result.has('2')).toBe(true);
    expect(result.has('3')).toBe(true);
  });

  it('should place BSS layer above INFRA layer', () => {
    const nodes = [
      { id: 'bss1', layer: 'BSS' },
      { id: 'infra1', layer: 'INFRA' },
    ];
    const edges: Array<{ fromId: string; toId: string }> = [];

    const result = computeLayerPositions(nodes, edges);

    const bssPos = result.get('bss1')!;
    const infraPos = result.get('infra1')!;

    // BSS should be at a smaller Y (higher on screen)
    expect(bssPos.y).toBeLessThan(infraPos.y);
  });

  it('should place INFRA layer above OSS layer', () => {
    const nodes = [
      { id: 'infra1', layer: 'INFRA' },
      { id: 'oss1', layer: 'OSS' },
    ];
    const edges: Array<{ fromId: string; toId: string }> = [];

    const result = computeLayerPositions(nodes, edges);

    const infraPos = result.get('infra1')!;
    const ossPos = result.get('oss1')!;

    expect(infraPos.y).toBeLessThan(ossPos.y);
  });

  it('should position EXTERNAL nodes on the left', () => {
    const nodes = [
      { id: 'ext1', layer: 'EXTERNAL' },
      { id: 'bss1', layer: 'BSS' },
    ];
    const edges: Array<{ fromId: string; toId: string }> = [];

    const result = computeLayerPositions(nodes, edges);

    const extPos = result.get('ext1')!;
    const bssPos = result.get('bss1')!;

    expect(extPos.x).toBeLessThan(bssPos.x);
  });

  it('should produce deterministic positions', () => {
    const nodes = [
      { id: '1', layer: 'BSS' },
      { id: '2', layer: 'OSS' },
      { id: '3', layer: 'INFRA' },
    ];
    const edges: Array<{ fromId: string; toId: string }> = [];

    const result1 = computeLayerPositions(nodes, edges);
    const result2 = computeLayerPositions(nodes, edges);

    expect(Array.from(result1.entries())).toEqual(Array.from(result2.entries()));
  });
});
