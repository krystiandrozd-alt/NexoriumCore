'use client';

/**
 * Cytoscape.js Graph Renderer Implementation
 */

import cytoscape, { Core, ElementDefinition, NodeSingular } from 'cytoscape';
import fcose from 'cytoscape-fcose';
import dagre from 'cytoscape-dagre';

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
import { buildStylesheet } from './cytoscapeStyles';
import { getLayoutConfig } from './cytoscapeLayouts';
import { measureRenderTime } from '../../util/perf';

// Register extensions
cytoscape.use(fcose);
cytoscape.use(dagre);

/**
 * Convert canonical node to Cytoscape element
 */
function nodeToElement(node: CanonicalGraphNode): ElementDefinition {
  return {
    group: 'nodes',
    data: {
      id: node.id,
      label: node.label,
      type: node.type,
      hostingType: node.hostingType,
      networkZone: node.networkZone,
      telcoLayer: node.telcoLayer,
      health: node.health,
      confidence: node.confidence,
    },
  };
}

/**
 * Convert canonical edge to Cytoscape element
 */
function edgeToElement(edge: CanonicalGraphEdge): ElementDefinition {
  return {
    group: 'edges',
    data: {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      protocol: edge.protocol,
      port: edge.port,
      label: edge.label,
      confidence: edge.confidence,
      stale: edge.stale,
    },
  };
}

/**
 * Cytoscape.js Graph Renderer
 */
export class CytoscapeRenderer extends BaseGraphRenderer {
  readonly name = 'Cytoscape.js';

  private cy: Core | null = null;
  private currentLayout: LayoutMode = 'force';

  async init(container: HTMLElement): Promise<void> {
    this.container = container;

    this.cy = cytoscape({
      container,
      elements: [],
      style: buildStylesheet({
        showHealthOverlay: this.options.healthOverlay,
        showConfidenceStyling: this.options.confidenceStyling,
        showStaleEdges: this.options.showStaleEdges,
        useNetworkZoneColoring: this.options.networkZoneColoring,
        useTelcoLayerGrouping: this.options.telcoLayerGrouping,
      }),
      layout: { name: 'preset' },
      minZoom: 0.1,
      maxZoom: 4,
      wheelSensitivity: 0.3,
      boxSelectionEnabled: true,
      autounselectify: false,
    });

    // Set up event handlers
    this.cy.on('tap', 'node', (evt) => {
      const nodeId = evt.target.id();
      this.handleNodeClick(nodeId);
    });
  }

  destroy(): void {
    if (this.cy) {
      this.cy.destroy();
      this.cy = null;
    }
    this.container = null;
    this.graph = null;
  }

  setData(graph: CanonicalEnvironmentGraph): void {
    super.setData(graph);

    if (!this.cy) return;

    // Clear existing elements
    this.cy.elements().remove();

    // Add nodes and edges
    const elements: ElementDefinition[] = [
      ...graph.nodes.map(nodeToElement),
      ...graph.edges.map(edgeToElement),
    ];

    this.cy.add(elements);
  }

  setOptions(options: Partial<RendererOptions>): void {
    super.setOptions(options);

    if (this.cy) {
      // Update stylesheet
      this.cy.style(
        buildStylesheet({
          showHealthOverlay: this.options.healthOverlay,
          showConfidenceStyling: this.options.confidenceStyling,
          showStaleEdges: this.options.showStaleEdges,
          useNetworkZoneColoring: this.options.networkZoneColoring,
          useTelcoLayerGrouping: this.options.telcoLayerGrouping,
        })
      );
    }
  }

  async applyLayout(mode: LayoutMode): Promise<RenderResult> {
    if (!this.cy || !this.graph) {
      return {
        success: false,
        metrics: this.lastMetrics,
        error: 'Renderer not initialized',
      };
    }

    this.currentLayout = mode;

    try {
      const { timeMs } = await measureRenderTime(async () => {
        const layoutConfig = getLayoutConfig(mode, this.graph!.nodes.length);

        return new Promise<void>((resolve) => {
          const layout = this.cy!.layout(layoutConfig);

          layout.on('layoutstop', () => {
            resolve();
          });

          layout.run();
        });
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
    if (!this.cy) return;

    const node = this.cy.$id(nodeId);
    if (node.length > 0) {
      // Clear previous search highlights
      this.cy.elements().removeClass('search-highlight dimmed');

      // Highlight the node
      node.addClass('search-highlight');

      // Dim other elements
      this.cy.elements().not(node).addClass('dimmed');
      node.connectedEdges().removeClass('dimmed');
      node.neighborhood('node').removeClass('dimmed');

      // Center on node
      this.cy.animate({
        center: { eles: node },
        zoom: 1.5,
        duration: 300,
        easing: 'ease-out',
      });
    }
  }

  searchNodes(query: string): CanonicalGraphNode[] {
    const results = super.searchNodes(query);

    if (this.cy) {
      // Clear previous highlights
      this.cy.elements().removeClass('search-highlight dimmed');

      if (results.length > 0) {
        const ids = results.map((n) => n.id);
        const matchedNodes = this.cy.nodes().filter((n: NodeSingular) =>
          ids.includes(n.id())
        );

        matchedNodes.addClass('search-highlight');
        this.cy.elements().not(matchedNodes).addClass('dimmed');
        matchedNodes.connectedEdges().removeClass('dimmed');
      }
    }

    return results;
  }

  async exportPNG(): Promise<Blob> {
    if (!this.cy) {
      throw new Error('Renderer not initialized');
    }

    const dataUrl = this.cy.png({
      output: 'base64uri',
      bg: '#ffffff',
      full: true,
      scale: 2,
    });

    // Convert base64 to blob
    const response = await fetch(dataUrl);
    return response.blob();
  }

  async exportSVG(): Promise<string> {
    if (!this.cy) {
      throw new Error('Renderer not initialized');
    }

    // Cytoscape doesn't have native SVG export, so we create a basic SVG
    const bounds = this.cy.elements().boundingBox();
    const padding = 20;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg"
      width="${bounds.w + padding * 2}"
      height="${bounds.h + padding * 2}"
      viewBox="${bounds.x1 - padding} ${bounds.y1 - padding} ${bounds.w + padding * 2} ${bounds.h + padding * 2}">`;

    svg += '<style>';
    svg += `
      .node-label { font-family: Inter, system-ui, sans-serif; font-size: 11px; fill: #374151; }
      .node { stroke-width: 2; }
      .edge { fill: none; stroke-width: 2; }
    `;
    svg += '</style>';

    // Add edges
    this.cy.edges().forEach((edge) => {
      const source = edge.source().position();
      const target = edge.target().position();
      const protocol = edge.data('protocol');
      const color = protocol === 'REST' ? '#3b82f6' : protocol === 'MQ' ? '#f59e0b' : '#94a3b8';

      svg += `<line class="edge" x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="${color}" />`;
    });

    // Add nodes
    this.cy.nodes().forEach((node) => {
      const pos = node.position();
      const label = node.data('label');
      const type = node.data('type');
      const colors: Record<string, { fill: string; stroke: string }> = {
        application: { fill: '#e0e7ff', stroke: '#6366f1' },
        service: { fill: '#ede9fe', stroke: '#8b5cf6' },
        database: { fill: '#d1fae5', stroke: '#10b981' },
        gateway: { fill: '#fef3c7', stroke: '#f59e0b' },
        external: { fill: '#f1f5f9', stroke: '#64748b' },
        runtime: { fill: '#cffafe', stroke: '#06b6d4' },
      };
      const { fill, stroke } = colors[type] || colors.application;

      if (type === 'diamond' || type === 'gateway') {
        svg += `<polygon class="node" points="${pos.x},${pos.y - 25} ${pos.x + 25},${pos.y} ${pos.x},${pos.y + 25} ${pos.x - 25},${pos.y}" fill="${fill}" stroke="${stroke}" />`;
      } else {
        svg += `<rect class="node" x="${pos.x - 25}" y="${pos.y - 25}" width="50" height="50" rx="4" fill="${fill}" stroke="${stroke}" />`;
      }
      svg += `<text class="node-label" x="${pos.x}" y="${pos.y + 40}" text-anchor="middle">${label}</text>`;
    });

    svg += '</svg>';
    return svg;
  }

  fitView(): void {
    if (!this.cy) return;

    this.cy.animate({
      fit: {
        eles: this.cy.elements(),
        padding: 30,
      },
      duration: 300,
      easing: 'ease-out',
    });
  }

  zoom(level: number): void {
    if (!this.cy) return;

    this.cy.zoom({
      level,
      renderedPosition: {
        x: this.cy.width() / 2,
        y: this.cy.height() / 2,
      },
    });
  }

  getZoom(): number {
    return this.cy?.zoom() || 1;
  }

  /**
   * Clear search highlights
   */
  clearHighlights(): void {
    if (this.cy) {
      this.cy.elements().removeClass('search-highlight dimmed');
    }
  }
}

/**
 * Create a new Cytoscape renderer instance
 */
export function createCytoscapeRenderer(): CytoscapeRenderer {
  return new CytoscapeRenderer();
}
