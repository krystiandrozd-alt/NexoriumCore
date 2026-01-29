'use client';

/**
 * AntV G6 v5 Graph Renderer Implementation
 *
 * G6 v5 has a completely different API from v4.
 * This implementation uses the new Graph, Node, Edge types.
 */

import { Graph } from '@antv/g6';

import {
  BaseGraphRenderer,
  type LayoutMode,
  type RenderResult,
  type RendererOptions,
} from '../GraphRenderer';
import type {
  CanonicalEnvironmentGraph,
  CanonicalGraphNode,
  CanonicalGraphEdge,
} from '../../model/types';
import {
  getNodeStyleForType,
  getProtocolEdgeColor,
  getConfidenceLineDash,
  getEdgeOpacity,
} from './g6Styles';
import { type G6LayoutConfig } from './g6Layouts';
import { measureRenderTime } from '../../util/perf';

/**
 * Convert canonical node to G6 v5 node data
 */
function nodeToG6Node(node: CanonicalGraphNode, _options: RendererOptions) {
  const nodeStyle = getNodeStyleForType(node.type);

  return {
    id: node.id,
    data: {
      label: node.label,
      nodeType: node.type,
      hostingType: node.hostingType,
      networkZone: node.networkZone,
      telcoLayer: node.telcoLayer,
      health: node.health,
      confidence: node.confidence,
    },
    style: {
      fill: nodeStyle.fill,
      stroke: nodeStyle.stroke,
      lineWidth: nodeStyle.lineWidth,
      lineDash: nodeStyle.lineDash,
      labelText: node.label,
      labelPlacement: 'bottom' as const,
      labelOffsetY: 8,
      labelFontSize: 11,
      labelFill: '#374151',
    },
  };
}

/**
 * Convert canonical edge to G6 v5 edge data
 */
function edgeToG6Edge(edge: CanonicalGraphEdge, options: RendererOptions) {
  const color = getProtocolEdgeColor(edge.protocol);
  const lineDash = options.confidenceStyling
    ? getConfidenceLineDash(edge.confidence)
    : undefined;
  const opacity = options.showStaleEdges ? getEdgeOpacity(edge.stale) : 1;

  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    data: {
      protocol: edge.protocol,
      port: edge.port,
      confidence: edge.confidence,
      stale: edge.stale,
    },
    style: {
      stroke: color,
      lineWidth: 2,
      opacity,
      lineDash,
      endArrow: true,
      endArrowType: 'triangle' as const,
    },
  };
}

/**
 * Convert canonical graph to G6 v5 data format
 */
function graphToG6Data(
  graph: CanonicalEnvironmentGraph,
  options: RendererOptions
) {
  return {
    nodes: graph.nodes.map((node) => nodeToG6Node(node, options)),
    edges: graph.edges.map((edge) => edgeToG6Edge(edge, options)),
  };
}

/**
 * Map layout mode to G6 v5 layout type
 */
function mapLayoutToG6(mode: LayoutMode, nodeCount: number): G6LayoutConfig {
  switch (mode) {
    case 'force':
      return {
        type: 'force',
        preventOverlap: true,
        nodeSize: 60,
        linkDistance: Math.max(100, 200 - nodeCount / 4),
      };
    case 'dagre':
      return {
        type: 'dagre',
        rankdir: 'TB',
        nodesep: 60,
        ranksep: 100,
      };
    case 'concentric':
      return {
        type: 'concentric',
        minNodeSpacing: 60,
        preventOverlap: true,
      };
    default:
      return { type: 'force' };
  }
}

/**
 * AntV G6 v5 Graph Renderer
 */
export class G6Renderer extends BaseGraphRenderer {
  readonly name = 'AntV G6';

  private g6Graph: Graph | null = null;
  private currentLayout: LayoutMode = 'force';
  private highlightedNodes: Set<string> = new Set();

  async init(container: HTMLElement): Promise<void> {
    this.container = container;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    this.g6Graph = new Graph({
      container,
      width,
      height,
      autoFit: 'view',
      padding: 30,
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element', 'click-select'],
      node: {
        style: {
          size: 50,
        },
      },
      edge: {
        style: {
          stroke: '#94a3b8',
          lineWidth: 2,
        },
      },
    });

    // Set up event handlers
    this.g6Graph.on('node:click', (event: unknown) => {
      const evt = event as { target?: { id?: string } };
      if (evt.target?.id) {
        this.handleNodeClick(evt.target.id);
      }
    });

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (this.g6Graph) {
          const { width, height } = entry.contentRect;
          this.g6Graph.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);
  }

  destroy(): void {
    if (this.g6Graph) {
      this.g6Graph.destroy();
      this.g6Graph = null;
    }
    this.container = null;
    this.graph = null;
    this.highlightedNodes.clear();
  }

  setData(graph: CanonicalEnvironmentGraph): void {
    super.setData(graph);

    if (!this.g6Graph) return;

    const data = graphToG6Data(graph, this.options);
    this.g6Graph.setData(data);
    this.g6Graph.render();
  }

  setOptions(options: Partial<RendererOptions>): void {
    super.setOptions(options);

    // Re-render with updated options
    if (this.graph && this.g6Graph) {
      const data = graphToG6Data(this.graph, this.options);
      this.g6Graph.setData(data);
      this.g6Graph.render();
    }
  }

  async applyLayout(mode: LayoutMode): Promise<RenderResult> {
    if (!this.g6Graph || !this.graph) {
      return {
        success: false,
        metrics: this.lastMetrics,
        error: 'Renderer not initialized',
      };
    }

    this.currentLayout = mode;

    try {
      const { timeMs } = await measureRenderTime(async () => {
        const layoutConfig = mapLayoutToG6(mode, this.graph!.nodes.length);

        this.g6Graph!.setLayout(layoutConfig);
        await this.g6Graph!.layout();
        this.g6Graph!.fitView();
      });

      this.updateMetrics(timeMs);

      return {
        success: true,
        metrics: this.lastMetrics,
      };
    } catch (error) {
      return {
        success: false,
        metrics: this.lastMetrics,
        error: error instanceof Error ? error.message : 'Layout failed',
      };
    }
  }

  focusNode(nodeId: string): void {
    if (!this.g6Graph) return;

    // Focus on the node
    this.g6Graph.focusElement(nodeId, true);
    this.highlightedNodes.add(nodeId);
  }

  searchNodes(query: string): CanonicalGraphNode[] {
    const results = super.searchNodes(query);

    if (this.g6Graph && results.length > 0) {
      // Focus on first result
      this.focusNode(results[0].id);
    }

    return results;
  }

  async exportPNG(): Promise<Blob> {
    if (!this.g6Graph) {
      throw new Error('Renderer not initialized');
    }

    const dataUrl = await this.g6Graph.toDataURL({ mode: 'overall', type: 'image/png' });

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    return response.blob();
  }

  async exportSVG(): Promise<string> {
    if (!this.g6Graph) {
      throw new Error('Renderer not initialized');
    }

    // G6 v5 doesn't support SVG export directly, so we create a basic SVG representation
    const size = this.g6Graph.getSize();
    const width = size[0] || 800;
    const height = size[1] || 600;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svg += '<style>.node-label { font-family: Inter, system-ui, sans-serif; font-size: 11px; fill: #374151; }</style>';

    // Create a simple SVG representation
    if (this.graph) {
      // Add edges
      this.graph.edges.forEach((edge) => {
        const color = getProtocolEdgeColor(edge.protocol);
        svg += `<line x1="0" y1="0" x2="100" y2="100" stroke="${color}" stroke-width="2" />`;
      });

      // Add nodes
      this.graph.nodes.forEach((node, index) => {
        const style = getNodeStyleForType(node.type);
        const x = (index % 10) * 80 + 50;
        const y = Math.floor(index / 10) * 80 + 50;
        svg += `<rect x="${x - 25}" y="${y - 25}" width="50" height="50" rx="4" fill="${style.fill}" stroke="${style.stroke}" stroke-width="2" />`;
        svg += `<text class="node-label" x="${x}" y="${y + 40}" text-anchor="middle">${node.label}</text>`;
      });
    }

    svg += '</svg>';
    return svg;
  }

  fitView(): void {
    if (!this.g6Graph) return;
    this.g6Graph.fitView();
  }

  zoom(level: number): void {
    if (!this.g6Graph) return;
    this.g6Graph.zoomTo(level);
  }

  getZoom(): number {
    return this.g6Graph?.getZoom() || 1;
  }

  /**
   * Clear search highlights
   */
  clearHighlights(): void {
    this.highlightedNodes.clear();
  }
}

/**
 * Create a new G6 renderer instance
 */
export function createG6Renderer(): G6Renderer {
  return new G6Renderer();
}
