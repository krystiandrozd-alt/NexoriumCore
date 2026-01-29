'use client';

// Nexorium Core - 5-Layer Model Topology Graph
// Architecture-aware visualization with layer-based layout

import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Custom5LayerNode from './Custom5LayerNode';
import Custom5LayerEdge from './Custom5LayerEdge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Download,
  RefreshCw,
  LayoutGrid,
  Eye,
  EyeOff,
} from 'lucide-react';
import type {
  Graph5LayerNode,
  Graph5LayerEdge,
  GraphAnalysisResult,
  ArchitectureLayer,
} from '@/types';
import { computeLayerPositions } from '@/lib/utils/graph-analysis';

// Re-export graph analysis functions
export { analyzeGraphTopology, isEntryNode, isExitNode } from '@/lib/utils/graph-analysis';

interface Topology5LayerGraphProps {
  initialNodes: Graph5LayerNode[];
  initialEdges: Graph5LayerEdge[];
  analysis: GraphAnalysisResult;
  onRefresh?: () => void;
  loading?: boolean;
  environmentId: string;
  showInfra?: boolean;
  onShowInfraChange?: (show: boolean) => void;
}

const nodeTypes: NodeTypes = {
  custom5layer: Custom5LayerNode,
};

const edgeTypes: EdgeTypes = {
  custom5layer: Custom5LayerEdge,
};

// Layer colors for swimlane background
const LAYER_COLORS: Record<ArchitectureLayer, string> = {
  BSS: '#dbeafe',      // blue-100
  INFRA: '#f1f5f9',    // slate-100
  OSS: '#fef3c7',      // amber-100
  EXTERNAL: '#dcfce7', // green-100
  UNKNOWN: '#f3f4f6',  // gray-100
};

const LAYER_ORDER: ArchitectureLayer[] = ['BSS', 'INFRA', 'OSS', 'UNKNOWN'];

export default function Topology5LayerGraph({
  initialNodes,
  initialEdges,
  analysis,
  onRefresh,
  loading = false,
  environmentId,
  showInfra = true,
  onShowInfraChange,
}: Topology5LayerGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as Edge[]);
  const [useAutoLayout, setUseAutoLayout] = useState(true);

  // Filter nodes based on showInfra
  const filteredNodes = useMemo(() => {
    if (showInfra) return initialNodes;
    return initialNodes.filter((n) => n.data.layer !== 'INFRA');
  }, [initialNodes, showInfra]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return initialEdges.filter(
      (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );
  }, [initialEdges, filteredNodeIds]);

  // Compute swimlane positions
  const swimLaneLayout = useMemo(() => {
    const layerHeights: Record<string, { start: number; end: number }> = {};
    let currentY = 50;
    const rowHeight = 200;

    for (const layer of LAYER_ORDER) {
      if (layer === 'INFRA' && !showInfra) continue;

      const nodesInLayer = filteredNodes.filter(n => n.data.layer === layer);
      if (nodesInLayer.length === 0 && layer !== 'UNKNOWN') continue;

      layerHeights[layer] = {
        start: currentY,
        end: currentY + rowHeight,
      };
      currentY += rowHeight;
    }

    return layerHeights;
  }, [filteredNodes, showInfra]);

  // Apply auto-layout
  const applyAutoLayout = useCallback(() => {
    const nodesWithLayer = filteredNodes.map((n) => ({
      id: n.id,
      layer: n.data.layer,
    }));

    const edgesForLayout = filteredEdges.map((e) => ({
      fromId: e.source,
      toId: e.target,
    }));

    const positions = computeLayerPositions(nodesWithLayer, edgesForLayout, {
      width: 1400,
      laneHeight: 180,
      nodeWidth: 180,
      nodeHeight: 100,
      horizontalGap: 60,
      startX: 250,
    });

    const layoutedNodes = filteredNodes.map((node) => {
      const pos = positions.get(node.id);
      if (!pos) return node;

      // Adjust Y position based on swimlane
      const lane = swimLaneLayout[node.data.layer];
      const laneY = lane ? (lane.start + lane.end) / 2 - 40 : pos.y;

      return {
        ...node,
        position: {
          x: pos.x,
          y: laneY,
        },
      };
    });

    setNodes(layoutedNodes as Node[]);
    setEdges(filteredEdges as Edge[]);
  }, [filteredNodes, filteredEdges, swimLaneLayout, setNodes, setEdges]);

  // Update when data or layout changes
  useEffect(() => {
    if (useAutoLayout) {
      applyAutoLayout();
    } else {
      setNodes(filteredNodes as Node[]);
      setEdges(filteredEdges as Edge[]);
    }
  }, [filteredNodes, filteredEdges, useAutoLayout, applyAutoLayout, setNodes, setEdges]);

  // Export to SVG
  const handleExport = useCallback(async () => {
    const viewport = document.querySelector('.react-flow__viewport');
    if (!viewport) return;

    const clone = viewport.cloneNode(true) as SVGElement;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '1920');
    svg.setAttribute('height', '1080');
    svg.setAttribute('viewBox', '0 0 1920 1080');
    svg.innerHTML = clone.innerHTML;

    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `topology5-${environmentId}-${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [environmentId]);

  return (
    <div className="h-full w-full relative">
      {/* Swimlane backgrounds */}
      <div className="absolute inset-0 pointer-events-none">
        {Object.entries(swimLaneLayout).map(([layer, bounds]) => (
          <div
            key={layer}
            className="absolute left-0 right-0 flex items-center"
            style={{
              top: bounds.start,
              height: bounds.end - bounds.start,
              backgroundColor: LAYER_COLORS[layer as ArchitectureLayer] || LAYER_COLORS.UNKNOWN,
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {layer}
            </div>
          </div>
        ))}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: 'custom5layer',
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background color="#e2e8f0" gap={16} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeStrokeColor="#6366f1"
          nodeColor={(node) => {
            const data = node.data as Record<string, unknown>;
            const layer = data?.layer as ArchitectureLayer;
            return LAYER_COLORS[layer] || '#e2e8f0';
          }}
          maskColor="rgba(241, 245, 249, 0.7)"
          className="bg-white border border-slate-200 rounded-lg"
        />

        {/* Top Left - Controls */}
        <Panel position="top-left" className="m-4 space-y-2">
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm space-y-3">
            <div className="text-xs font-medium text-slate-600">View Options</div>

            {/* Show/Hide INFRA toggle */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs text-slate-500 flex items-center gap-1.5">
                {showInfra ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                Show INFRA
              </label>
              <Switch
                checked={showInfra}
                onCheckedChange={onShowInfraChange}
                className="scale-75"
              />
            </div>

            {/* Auto-layout toggle */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs text-slate-500">Auto-layout</label>
              <Switch
                checked={useAutoLayout}
                onCheckedChange={setUseAutoLayout}
                className="scale-75"
              />
            </div>
          </div>
        </Panel>

        {/* Top Right - Actions */}
        <Panel position="top-right" className="m-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={applyAutoLayout}
            title="Auto-arrange by layers"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Auto-arrange
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </Panel>

        {/* Bottom Left - Legend */}
        <Panel position="bottom-left" className="m-4">
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
            <div className="text-xs font-medium text-slate-600 mb-2">Legend</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
              {/* Entry/Exit */}
              <div className="flex items-center gap-1.5">
                <span className="px-1 py-0.5 text-[8px] font-semibold bg-emerald-500 text-white rounded">ENTRY</span>
                <span>Entry point</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1 py-0.5 text-[8px] font-semibold bg-rose-500 text-white rounded">EXIT</span>
                <span>Exit point</span>
              </div>

              {/* Confidence */}
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-indigo-500" />
                <span>High confidence</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-500" />
                <span>Medium confidence</span>
              </div>

              {/* Origin */}
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px] font-bold bg-slate-100 text-slate-600">A</span>
                <span>Auto-discovered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px] font-bold bg-indigo-100 text-indigo-600">M</span>
                <span>Manual</span>
              </div>
            </div>

            {/* Analysis summary */}
            {analysis && (
              <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                <div>Entry candidates: {analysis.entryCandidates.length}</div>
                <div>Exit candidates: {analysis.exitCandidates.length}</div>
                {analysis.overriddenEntry && (
                  <div className="text-indigo-600">Entry override active</div>
                )}
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
