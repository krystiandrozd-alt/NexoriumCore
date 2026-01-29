/**
 * Abstract Graph Renderer Interface
 *
 * All renderer implementations (Cytoscape, G6, etc.) must implement this interface
 * to ensure consistent behavior and interchangeability in the playground.
 */

import type { CanonicalEnvironmentGraph, CanonicalGraphNode } from '../model/types';

/**
 * Supported layout algorithms
 */
export type LayoutMode = 'force' | 'dagre' | 'concentric';

/**
 * Visual rendering options
 */
export interface RendererOptions {
  /** Show hosting type badge on nodes */
  showHostingBadge: boolean;

  /** Color nodes by network zone */
  networkZoneColoring: boolean;

  /** Group nodes by telco layer */
  telcoLayerGrouping: boolean;

  /** Show health status overlay */
  healthOverlay: boolean;

  /** Style edges by confidence score */
  confidenceStyling: boolean;

  /** Show stale edges with reduced opacity */
  showStaleEdges: boolean;
}

/**
 * Default renderer options
 */
export const DEFAULT_RENDERER_OPTIONS: RendererOptions = {
  showHostingBadge: true,
  networkZoneColoring: false,
  telcoLayerGrouping: false,
  healthOverlay: true,
  confidenceStyling: true,
  showStaleEdges: true,
};

/**
 * Performance metrics for render operations
 */
export interface PerformanceMetrics {
  /** Time to render in milliseconds */
  renderTimeMs: number;

  /** Number of nodes rendered */
  nodeCount: number;

  /** Number of edges rendered */
  edgeCount: number;

  /** Frames per second (if measured) */
  fps?: number;

  /** Memory usage in bytes (if available) */
  memoryUsage?: number;
}

/**
 * Result of a layout operation
 */
export interface RenderResult {
  /** Whether the operation succeeded */
  success: boolean;

  /** Performance metrics */
  metrics: PerformanceMetrics;

  /** Error message if failed */
  error?: string;
}

/**
 * Node click callback type
 */
export type NodeClickCallback = (node: CanonicalGraphNode) => void;

/**
 * Abstract interface for graph renderers
 */
export interface GraphRendererAdapter {
  /**
   * Human-readable renderer name
   */
  readonly name: string;

  /**
   * Initialize the renderer on a DOM container
   */
  init(container: HTMLElement): Promise<void>;

  /**
   * Clean up and destroy the renderer instance
   */
  destroy(): void;

  /**
   * Set the graph data to render
   */
  setData(graph: CanonicalEnvironmentGraph): void;

  /**
   * Apply a layout algorithm and render
   */
  applyLayout(mode: LayoutMode): Promise<RenderResult>;

  /**
   * Update visual options
   */
  setOptions(options: Partial<RendererOptions>): void;

  /**
   * Register a node click handler
   */
  onNodeClick(callback: NodeClickCallback): void;

  /**
   * Focus camera on a specific node
   */
  focusNode(nodeId: string): void;

  /**
   * Search nodes by label and return matches
   */
  searchNodes(query: string): CanonicalGraphNode[];

  /**
   * Export the current view as PNG
   */
  exportPNG(): Promise<Blob>;

  /**
   * Export the current view as SVG
   */
  exportSVG(): Promise<string>;

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics;

  /**
   * Fit the view to show all nodes
   */
  fitView(): void;

  /**
   * Zoom to a specific level
   */
  zoom(level: number): void;

  /**
   * Get current zoom level
   */
  getZoom(): number;
}

/**
 * Base class with common functionality for adapters
 */
export abstract class BaseGraphRenderer implements GraphRendererAdapter {
  abstract readonly name: string;

  protected container: HTMLElement | null = null;
  protected graph: CanonicalEnvironmentGraph | null = null;
  protected options: RendererOptions = { ...DEFAULT_RENDERER_OPTIONS };
  protected nodeClickCallback: NodeClickCallback | null = null;
  protected lastMetrics: PerformanceMetrics = {
    renderTimeMs: 0,
    nodeCount: 0,
    edgeCount: 0,
  };

  abstract init(container: HTMLElement): Promise<void>;
  abstract destroy(): void;
  abstract applyLayout(mode: LayoutMode): Promise<RenderResult>;
  abstract focusNode(nodeId: string): void;
  abstract exportPNG(): Promise<Blob>;
  abstract exportSVG(): Promise<string>;
  abstract fitView(): void;
  abstract zoom(level: number): void;
  abstract getZoom(): number;

  setData(graph: CanonicalEnvironmentGraph): void {
    this.graph = graph;
    this.lastMetrics.nodeCount = graph.nodes.length;
    this.lastMetrics.edgeCount = graph.edges.length;
  }

  setOptions(options: Partial<RendererOptions>): void {
    this.options = { ...this.options, ...options };
  }

  onNodeClick(callback: NodeClickCallback): void {
    this.nodeClickCallback = callback;
  }

  searchNodes(query: string): CanonicalGraphNode[] {
    if (!this.graph || !query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return this.graph.nodes.filter((node) =>
      node.label.toLowerCase().includes(lowerQuery)
    );
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.lastMetrics };
  }

  protected handleNodeClick(nodeId: string): void {
    if (!this.nodeClickCallback || !this.graph) return;

    const node = this.graph.nodes.find((n) => n.id === nodeId);
    if (node) {
      this.nodeClickCallback(node);
    }
  }

  protected updateMetrics(renderTimeMs: number): void {
    this.lastMetrics.renderTimeMs = renderTimeMs;
    if (this.graph) {
      this.lastMetrics.nodeCount = this.graph.nodes.length;
      this.lastMetrics.edgeCount = this.graph.edges.length;
    }
  }
}
