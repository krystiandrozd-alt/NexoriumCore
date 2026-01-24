'use client';

// TelEnvIQ - Environment Graph View (MVP)
// React Flow + Dagre layout with autosave persistence

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Custom5LayerNode from './Custom5LayerNode';
import Custom5LayerEdge from './Custom5LayerEdge';
import { applyLayerAwareDagreLayout } from '@/lib/utils/dagre-layout';
import type {
  Graph5LayerNode,
  Graph5LayerEdge,
  GraphAnalysisResult,
  ArchitectureLayer,
} from '@/types';

interface EnvironmentGraphViewProps {
  initialNodes: Graph5LayerNode[];
  initialEdges: Graph5LayerEdge[];
  savedNodes?: Node[];
  savedEdges?: Edge[];
  analysis: GraphAnalysisResult;
  environmentId: string;
  showInfra?: boolean;
  onNodesChange?: (nodes: Node[]) => void;
  onPositionChange?: () => void;
  fitViewTrigger?: number;
  autoArrangeTrigger?: number;
}

const nodeTypes: NodeTypes = {
  custom5layer: Custom5LayerNode,
};

const edgeTypes: EdgeTypes = {
  custom5layer: Custom5LayerEdge,
};

// Layer colors for swimlane and minimap
const LAYER_COLORS: Record<ArchitectureLayer, string> = {
  BSS: '#dbeafe',
  INFRA: '#f1f5f9',
  OSS: '#fef3c7',
  EXTERNAL: '#dcfce7',
  UNKNOWN: '#f3f4f6',
};

const LAYER_ORDER: ArchitectureLayer[] = ['EXTERNAL', 'BSS', 'INFRA', 'OSS', 'UNKNOWN'];

export default function EnvironmentGraphView({
  initialNodes,
  initialEdges,
  savedNodes,
  savedEdges,
  analysis,
  environmentId,
  showInfra = true,
  onNodesChange: onNodesChangeCallback,
  onPositionChange,
  fitViewTrigger,
  autoArrangeTrigger,
}: EnvironmentGraphViewProps) {
  const { fitView } = useReactFlow();
  const prevFitViewTrigger = useRef(fitViewTrigger);
  const prevAutoArrangeTrigger = useRef(autoArrangeTrigger);
  const [isInitialized, setIsInitialized] = useState(false);

  // Filter nodes based on showInfra
  const filteredNodes = useMemo(() => {
    const base = showInfra ? initialNodes : initialNodes.filter((n) => n.data.layer !== 'INFRA');
    return base;
  }, [initialNodes, showInfra]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return initialEdges.filter(
      (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );
  }, [initialEdges, filteredNodeIds]);

  // Determine initial nodes - use saved positions if available
  const getInitialNodes = useCallback(() => {
    if (savedNodes && savedNodes.length > 0) {
      // Merge saved positions with current node data
      const savedPositions = new Map(savedNodes.map((n) => [n.id, n.position]));
      return filteredNodes.map((node) => {
        const savedPos = savedPositions.get(node.id);
        if (savedPos) {
          return { ...node, position: savedPos };
        }
        return node;
      });
    }
    // Apply auto-layout for new diagrams
    const { nodes: layoutedNodes } = applyLayerAwareDagreLayout(
      filteredNodes as Node[],
      filteredEdges as Edge[],
      { nodeWidth: 200, nodeHeight: 80 }
    );
    return layoutedNodes;
  }, [savedNodes, filteredNodes, filteredEdges]);

  const getInitialEdges = useCallback(() => {
    return savedEdges && savedEdges.length > 0 ? savedEdges : filteredEdges;
  }, [savedEdges, filteredEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes() as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges() as Edge[]);

  // Track position changes for autosave
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);

      // Check if any position changes occurred
      const hasPositionChange = changes.some(
        (change) => change.type === 'position' && change.dragging === false
      );

      if (hasPositionChange) {
        onPositionChange?.();
      }
    },
    [onNodesChange, onPositionChange]
  );

  // Notify parent of node changes for autosave
  useEffect(() => {
    if (isInitialized) {
      onNodesChangeCallback?.(nodes);
    }
  }, [nodes, onNodesChangeCallback, isInitialized]);

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Fit view on trigger
  useEffect(() => {
    if (fitViewTrigger !== prevFitViewTrigger.current) {
      prevFitViewTrigger.current = fitViewTrigger;
      setTimeout(() => {
        fitView({ padding: 0.1, duration: 300 });
      }, 50);
    }
  }, [fitViewTrigger, fitView]);

  // Auto-arrange on trigger
  useEffect(() => {
    if (autoArrangeTrigger !== prevAutoArrangeTrigger.current) {
      prevAutoArrangeTrigger.current = autoArrangeTrigger;
      const { nodes: layoutedNodes } = applyLayerAwareDagreLayout(
        filteredNodes as Node[],
        filteredEdges as Edge[],
        { nodeWidth: 200, nodeHeight: 80 }
      );
      setNodes(layoutedNodes);
      setTimeout(() => {
        fitView({ padding: 0.1, duration: 300 });
      }, 50);
    }
  }, [autoArrangeTrigger, filteredNodes, filteredEdges, setNodes, fitView]);

  // Update when showInfra changes
  useEffect(() => {
    // Re-layout when filter changes
    const { nodes: layoutedNodes } = applyLayerAwareDagreLayout(
      filteredNodes as Node[],
      filteredEdges as Edge[],
      { nodeWidth: 200, nodeHeight: 80 }
    );
    setNodes(layoutedNodes);
    setEdges(filteredEdges as Edge[]);
  }, [showInfra, filteredNodes, filteredEdges, setNodes, setEdges]);

  // Compute swimlane layout
  const swimLaneLayout = useMemo(() => {
    const layerHeights: Record<string, { start: number; end: number }> = {};
    let currentY = 0;
    const rowHeight = 180;

    for (const layer of LAYER_ORDER) {
      if (layer === 'INFRA' && !showInfra) continue;

      const nodesInLayer = filteredNodes.filter((n) => n.data.layer === layer);
      if (nodesInLayer.length === 0) continue;

      layerHeights[layer] = {
        start: currentY,
        end: currentY + rowHeight,
      };
      currentY += rowHeight;
    }

    return layerHeights;
  }, [filteredNodes, showInfra]);

  return (
    <div className="h-full w-full relative">
      {/* Swimlane backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Object.entries(swimLaneLayout).map(([layer, bounds]) => (
          <div
            key={layer}
            className="absolute left-0 right-0 flex items-start"
            style={{
              top: bounds.start,
              height: bounds.end - bounds.start,
              backgroundColor: LAYER_COLORS[layer as ArchitectureLayer] || LAYER_COLORS.UNKNOWN,
              borderBottom: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {layer}
            </div>
          </div>
        ))}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        defaultEdgeOptions={{
          type: 'custom5layer',
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
        minZoom={0.1}
        maxZoom={2}
        snapToGrid
        snapGrid={[10, 10]}
      >
        <Background color="#e2e8f0" gap={20} size={1} />
        <Controls showInteractive={false} className="bg-white border border-slate-200 rounded-lg shadow-sm" />
        <MiniMap
          nodeStrokeColor="#6366f1"
          nodeColor={(node) => {
            const data = node.data as Record<string, unknown>;
            const layer = data?.layer as ArchitectureLayer;
            return LAYER_COLORS[layer] || '#e2e8f0';
          }}
          maskColor="rgba(241, 245, 249, 0.8)"
          className="bg-white border border-slate-200 rounded-lg shadow-sm"
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg border border-slate-200 p-3 shadow-sm z-10">
        <div className="text-xs font-medium text-slate-600 mb-2">Legend</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="px-1 py-0.5 text-[8px] font-semibold bg-emerald-500 text-white rounded">
              ENTRY
            </span>
            <span>Entry point</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1 py-0.5 text-[8px] font-semibold bg-rose-500 text-white rounded">
              EXIT
            </span>
            <span>Exit point</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-indigo-500" />
            <span>High confidence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-500" />
            <span>Medium confidence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px] font-bold bg-slate-100 text-slate-600">
              A
            </span>
            <span>Auto-discovered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px] font-bold bg-indigo-100 text-indigo-600">
              M
            </span>
            <span>Manual</span>
          </div>
        </div>
        {analysis && (
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            <div>Entry candidates: {analysis.entryCandidates.length}</div>
            <div>Exit candidates: {analysis.exitCandidates.length}</div>
          </div>
        )}
      </div>
    </div>
  );
}
