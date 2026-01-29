'use client';

/**
 * Graph Renderer Playground Page
 *
 * Interactive comparison of Cytoscape.js and AntV G6 graph renderers.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import {
  ControlPanel,
  CanvasPanel,
  InspectorDrawer,
  PerformanceOverlay,
  type RendererType,
  type DatasetType,
} from '@/components/playground/graph-renderers';
import type { LayoutMode, RendererOptions, PerformanceMetrics } from '@/graph/adapters/GraphRenderer';
import { DEFAULT_RENDERER_OPTIONS } from '@/graph/adapters/GraphRenderer';
import type { CanonicalEnvironmentGraph, CanonicalGraphNode } from '@/graph/model/types';
import { deserializeGraph } from '@/graph/model/mapping';

export default function GraphRenderersPlayground() {
  // State
  const [renderer, setRenderer] = useState<RendererType>('cytoscape');
  const [layout, setLayout] = useState<LayoutMode>('force');
  const [dataset, setDataset] = useState<DatasetType>('synthetic-200');
  const [environmentId, setEnvironmentId] = useState('');
  const [options, setOptions] = useState<RendererOptions>(DEFAULT_RENDERER_OPTIONS);

  const [graph, setGraph] = useState<CanonicalEnvironmentGraph | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedNode, setSelectedNode] = useState<CanonicalGraphNode | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  // Fetch graph data
  const fetchGraph = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let url = '/api/playground/graph';
      const params = new URLSearchParams();

      if (dataset === 'api' && environmentId) {
        params.set('environmentId', environmentId);
      } else if (dataset.startsWith('synthetic-')) {
        const nodeCount = dataset.replace('synthetic-', '');
        params.set('synthetic', nodeCount);
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch graph');
      }

      const graphData = deserializeGraph(result.data);
      setGraph(graphData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load graph');
      setGraph(null);
    } finally {
      setIsLoading(false);
    }
  }, [dataset, environmentId]);

  // Fetch graph on dataset change
  useEffect(() => {
    if (dataset === 'api' && !environmentId) {
      // Don't fetch if API mode but no environment ID
      return;
    }
    fetchGraph();
  }, [dataset, fetchGraph]);

  // Fetch when environment ID changes (debounced)
  useEffect(() => {
    if (dataset !== 'api' || !environmentId) return;

    const timer = setTimeout(() => {
      fetchGraph();
    }, 500);

    return () => clearTimeout(timer);
  }, [environmentId, dataset, fetchGraph]);

  // Handle node selection
  const handleNodeSelect = useCallback((node: CanonicalGraphNode | null) => {
    setSelectedNode(node);
  }, []);

  // Handle metrics update
  const handleMetricsUpdate = useCallback((newMetrics: PerformanceMetrics | null) => {
    setMetrics(newMetrics);
  }, []);

  // Close inspector
  const handleCloseInspector = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="w-px h-6 bg-slate-200" />
          <h1 className="text-lg font-semibold text-slate-800">
            Graph Renderer Playground
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>Compare: Cytoscape.js vs AntV G6</span>
          <a
            href="https://js.cytoscape.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
          >
            Cytoscape Docs
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://g6.antv.antgroup.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
          >
            G6 Docs
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        <ControlPanel
          renderer={renderer}
          setRenderer={setRenderer}
          layout={layout}
          setLayout={setLayout}
          dataset={dataset}
          setDataset={setDataset}
          options={options}
          setOptions={setOptions}
          environmentId={environmentId}
          setEnvironmentId={setEnvironmentId}
          isLoading={isLoading}
        />

        {/* Center - Canvas */}
        <div className="flex-1 relative">
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <CanvasPanel
            rendererType={renderer}
            layout={layout}
            graph={graph}
            options={options}
            isLoading={isLoading}
            onNodeSelect={handleNodeSelect}
            onMetricsUpdate={handleMetricsUpdate}
          />

          {/* Performance Overlay */}
          <PerformanceOverlay
            metrics={metrics}
            rendererName={renderer === 'cytoscape' ? 'Cytoscape.js' : 'AntV G6'}
          />
        </div>

        {/* Right Panel - Inspector */}
        {selectedNode && (
          <InspectorDrawer
            node={selectedNode}
            onClose={handleCloseInspector}
          />
        )}
      </div>
    </div>
  );
}
