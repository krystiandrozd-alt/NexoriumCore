'use client';

/**
 * Canvas Panel for Graph Renderer Playground
 *
 * Main visualization area with toolbar and graph container.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Search,
  Image,
  FileCode,
  Activity,
  ZoomIn,
  ZoomOut,
  Maximize,
  Loader2,
  X,
} from 'lucide-react';
import type { GraphRendererAdapter, LayoutMode, RendererOptions, PerformanceMetrics } from '@/graph/adapters/GraphRenderer';
import type { CanonicalEnvironmentGraph, CanonicalGraphNode } from '@/graph/model/types';
import { CytoscapeRenderer } from '@/graph/adapters/cytoscape/CytoscapeRenderer';
import { G6Renderer } from '@/graph/adapters/g6/G6Renderer';
import type { RendererType } from './ControlPanel';
import { downloadBlob, downloadSVG, generateExportFilename } from '@/graph/export/exportService';
import { estimateFPS } from '@/graph/util/perf';

interface CanvasPanelProps {
  rendererType: RendererType;
  layout: LayoutMode;
  graph: CanonicalEnvironmentGraph | null;
  options: RendererOptions;
  isLoading: boolean;
  onNodeSelect: (node: CanonicalGraphNode | null) => void;
  onMetricsUpdate: (metrics: PerformanceMetrics | null) => void;
}

export function CanvasPanel({
  rendererType,
  layout,
  graph,
  options,
  isLoading,
  onNodeSelect,
  onMetricsUpdate,
}: CanvasPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<GraphRendererAdapter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CanonicalGraphNode[]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Initialize renderer
  useEffect(() => {
    const initRenderer = async () => {
      if (!containerRef.current) return;

      // Destroy existing renderer
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }

      // Create new renderer
      const renderer = rendererType === 'cytoscape'
        ? new CytoscapeRenderer()
        : new G6Renderer();

      await renderer.init(containerRef.current);
      rendererRef.current = renderer;

      // Set up node click handler
      renderer.onNodeClick((node) => {
        onNodeSelect(node);
      });

      // If we have graph data, render it
      if (graph) {
        renderer.setData(graph);
        renderer.setOptions(options);
        const result = await renderer.applyLayout(layout);
        onMetricsUpdate(result.metrics);
      }
    };

    initRenderer();

    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, [rendererType]);

  // Update graph data
  useEffect(() => {
    const updateData = async () => {
      if (!rendererRef.current || !graph) return;

      rendererRef.current.setData(graph);
      rendererRef.current.setOptions(options);
      const result = await rendererRef.current.applyLayout(layout);
      onMetricsUpdate(result.metrics);
    };

    updateData();
  }, [graph]);

  // Update layout
  useEffect(() => {
    const updateLayout = async () => {
      if (!rendererRef.current || !graph) return;

      const result = await rendererRef.current.applyLayout(layout);
      onMetricsUpdate(result.metrics);
    };

    updateLayout();
  }, [layout]);

  // Update options
  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.setOptions(options);
  }, [options]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!rendererRef.current) return;

    if (query.trim()) {
      const results = rendererRef.current.searchNodes(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
      // Clear highlights if renderer has that method
      if ('clearHighlights' in rendererRef.current) {
        (rendererRef.current as unknown as { clearHighlights: () => void }).clearHighlights();
      }
    }
  }, []);

  // Focus on search result
  const handleFocusNode = useCallback((nodeId: string) => {
    if (!rendererRef.current) return;
    rendererRef.current.focusNode(nodeId);
  }, []);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    if (rendererRef.current && 'clearHighlights' in rendererRef.current) {
      (rendererRef.current as unknown as { clearHighlights: () => void }).clearHighlights();
    }
  }, []);

  // Export PNG
  const handleExportPNG = async () => {
    if (!rendererRef.current) return;
    setIsExporting(true);
    try {
      const blob = await rendererRef.current.exportPNG();
      const filename = generateExportFilename(`graph-${rendererType}`, 'png');
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('Failed to export PNG:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Export SVG
  const handleExportSVG = async () => {
    if (!rendererRef.current) return;
    setIsExporting(true);
    try {
      const svgString = await rendererRef.current.exportSVG();
      const filename = generateExportFilename(`graph-${rendererType}`, 'svg');
      downloadSVG(svgString, filename);
    } catch (error) {
      console.error('Failed to export SVG:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Measure performance
  const handleMeasurePerformance = async () => {
    if (!rendererRef.current) return;
    setIsMeasuring(true);
    try {
      const fps = await estimateFPS(1000);
      const metrics = rendererRef.current.getPerformanceMetrics();
      onMetricsUpdate({ ...metrics, fps });
    } finally {
      setIsMeasuring(false);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (!rendererRef.current) return;
    const currentZoom = rendererRef.current.getZoom();
    rendererRef.current.zoom(Math.min(currentZoom * 1.2, 4));
  };

  const handleZoomOut = () => {
    if (!rendererRef.current) return;
    const currentZoom = rendererRef.current.getZoom();
    rendererRef.current.zoom(Math.max(currentZoom / 1.2, 0.1));
  };

  const handleFitView = () => {
    if (!rendererRef.current) return;
    rendererRef.current.fitView();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Toolbar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search nodes..."
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {searchResults.slice(0, 10).map((node) => (
                <button
                  key={node.id}
                  onClick={() => handleFocusNode(node.id)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="font-medium text-slate-700">{node.label}</span>
                  <span className="text-xs text-slate-400">{node.type}</span>
                </button>
              ))}
              {searchResults.length > 10 && (
                <div className="px-4 py-2 text-xs text-slate-500 bg-slate-50">
                  +{searchResults.length - 10} more results
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Zoom Controls */}
          <div className="flex items-center border border-slate-200 rounded-lg">
            <button
              onClick={handleZoomOut}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-l-lg"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleFitView}
              className="p-2 text-slate-600 hover:bg-slate-50 border-x border-slate-200"
              title="Fit to View"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-r-lg"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200" />

          {/* Export */}
          <button
            onClick={handleExportPNG}
            disabled={isExporting || isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            title="Export as PNG"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Image className="w-4 h-4" />
            )}
            PNG
          </button>
          <button
            onClick={handleExportSVG}
            disabled={isExporting || isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            title="Export as SVG"
          >
            <FileCode className="w-4 h-4" />
            SVG
          </button>

          <div className="w-px h-6 bg-slate-200" />

          {/* Performance */}
          <button
            onClick={handleMeasurePerformance}
            disabled={isMeasuring || isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            title="Measure Performance"
          >
            {isMeasuring ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Activity className="w-4 h-4" />
            )}
            Measure
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-sm text-slate-600">Loading graph...</span>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="w-full h-full bg-white"
          style={{ minHeight: 400 }}
        />
      </div>
    </div>
  );
}
