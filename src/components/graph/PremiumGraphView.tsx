'use client';

// TelEnvIQ - Premium Graph View (Flagship)
// React Flow graph with premium dark theme, overlays, and keyboard support

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PremiumNode from './PremiumNode';
import Custom5LayerEdge from './Custom5LayerEdge';
import NoteNode from './NoteNode';
import { applyLayerAwareDagreLayout } from '@/lib/utils/dagre-layout';
import type {
  Graph5LayerNode,
  Graph5LayerEdge,
  GraphAnalysisResult,
  ArchitectureLayer,
} from '@/types';
import type { OverlayType } from './PremiumToolbar';

interface PremiumGraphViewProps {
  initialNodes: Graph5LayerNode[];
  initialEdges: Graph5LayerEdge[];
  savedNodes?: Node[];
  savedEdges?: Edge[];
  analysis: GraphAnalysisResult;
  environmentId: string;
  activeOverlays: Set<OverlayType>;
  highlightedNodeId?: string | null;
  onNodesChange?: (nodes: Node[]) => void;
  onPositionChange?: () => void;
  onNodeSelect?: (nodeId: string | null) => void;
  onEdgeSelect?: (edgeId: string | null) => void;
  fitViewTrigger?: number;
  autoArrangeTrigger?: number;
}

const nodeTypes: NodeTypes = {
  custom5layer: PremiumNode,
  note: NoteNode,
};

const edgeTypes: EdgeTypes = {
  custom5layer: Custom5LayerEdge,
};

// Premium layer colors (darker theme)
const LAYER_COLORS: Record<ArchitectureLayer, string> = {
  BSS: 'rgba(59, 130, 246, 0.15)',
  INFRA: 'rgba(100, 116, 139, 0.1)',
  OSS: 'rgba(245, 158, 11, 0.12)',
  EXTERNAL: 'rgba(16, 185, 129, 0.12)',
  UNKNOWN: 'rgba(100, 116, 139, 0.08)',
};

const LAYER_ORDER: ArchitectureLayer[] = ['EXTERNAL', 'BSS', 'INFRA', 'OSS', 'UNKNOWN'];

export default function PremiumGraphView({
  initialNodes,
  initialEdges,
  savedNodes,
  savedEdges,
  analysis,
  environmentId: _environmentId,
  activeOverlays,
  highlightedNodeId,
  onNodesChange: onNodesChangeCallback,
  onPositionChange,
  onNodeSelect,
  onEdgeSelect,
  fitViewTrigger,
  autoArrangeTrigger,
}: PremiumGraphViewProps) {
  const { fitView, setCenter } = useReactFlow();
  const prevFitViewTrigger = useRef(fitViewTrigger);
  const prevAutoArrangeTrigger = useRef(autoArrangeTrigger);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [_selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Transform nodes with overlay data
  const transformedNodes = useMemo(() => {
    return initialNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        showVersion: activeOverlays.has('versions'),
        showOwnership: activeOverlays.has('ownership'),
        isHighlighted: node.id === highlightedNodeId,
        isSelected: node.id === selectedNodeId,
      },
    }));
  }, [initialNodes, activeOverlays, highlightedNodeId, selectedNodeId]);

  // Get initial nodes with saved positions
  const getInitialNodes = useCallback(() => {
    const savedNotes = savedNodes?.filter((n) => n.type === 'note') || [];

    if (savedNodes && savedNodes.length > 0) {
      const savedPositions = new Map(savedNodes.map((n) => [n.id, n.position]));
      const mergedNodes = transformedNodes.map((node) => {
        const savedPos = savedPositions.get(node.id);
        if (savedPos) {
          return { ...node, position: savedPos };
        }
        return node;
      });
      return [...mergedNodes, ...savedNotes];
    }

    const { nodes: layoutedNodes } = applyLayerAwareDagreLayout(
      transformedNodes as Node[],
      initialEdges as Edge[],
      { nodeWidth: 220, nodeHeight: 90 }
    );
    return layoutedNodes;
  }, [savedNodes, transformedNodes, initialEdges]);

  const getInitialEdges = useCallback(() => {
    return savedEdges && savedEdges.length > 0 ? savedEdges : initialEdges;
  }, [savedEdges, initialEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes() as Node[]);
  const [edges, _setEdges, onEdgesChange] = useEdgesState(getInitialEdges() as Edge[]);

  // Handle node changes with position tracking
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);

      const hasPositionChange = changes.some(
        (change) => change.type === 'position' && change.dragging === false
      );

      if (hasPositionChange) {
        onPositionChange?.();
      }
    },
    [onNodesChange, onPositionChange]
  );

  // Notify parent of node changes
  useEffect(() => {
    if (isInitialized) {
      onNodesChangeCallback?.(nodes);
    }
  }, [nodes, onNodesChangeCallback, isInitialized]);

  // Initialize
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Fit view trigger
  useEffect(() => {
    if (fitViewTrigger !== prevFitViewTrigger.current) {
      prevFitViewTrigger.current = fitViewTrigger;

      // If there's a highlighted node, center on it
      if (highlightedNodeId) {
        const node = nodes.find((n) => n.id === highlightedNodeId);
        if (node) {
          setCenter(node.position.x + 110, node.position.y + 45, { zoom: 1.2, duration: 500 });
          return;
        }
      }

      setTimeout(() => {
        fitView({ padding: 0.15, duration: 400 });
      }, 50);
    }
  }, [fitViewTrigger, fitView, setCenter, highlightedNodeId, nodes]);

  // Auto-arrange trigger
  useEffect(() => {
    if (autoArrangeTrigger !== prevAutoArrangeTrigger.current) {
      prevAutoArrangeTrigger.current = autoArrangeTrigger;

      const existingNotes = nodes.filter((n) => n.type === 'note');
      const { nodes: layoutedNodes } = applyLayerAwareDagreLayout(
        transformedNodes as Node[],
        initialEdges as Edge[],
        { nodeWidth: 220, nodeHeight: 90 }
      );
      setNodes([...layoutedNodes, ...existingNotes]);

      setTimeout(() => {
        fitView({ padding: 0.15, duration: 400 });
      }, 50);
    }
  }, [autoArrangeTrigger, transformedNodes, initialEdges, nodes, setNodes, fitView]);

  // Node click handler
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
      onNodeSelect?.(node.id);
    },
    [onNodeSelect]
  );

  // Edge click handler
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setSelectedEdgeId(edge.id);
      setSelectedNodeId(null);
      onEdgeSelect?.(edge.id);
    },
    [onEdgeSelect]
  );

  // Pane click - clear selection
  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    onNodeSelect?.(null);
    onEdgeSelect?.(null);
  }, [onNodeSelect, onEdgeSelect]);

  // Compute layer swimlanes
  const swimLanes = useMemo(() => {
    if (!activeOverlays.has('layers')) return [];

    const layerBounds: { layer: ArchitectureLayer; minY: number; maxY: number }[] = [];

    for (const layer of LAYER_ORDER) {
      const nodesInLayer = nodes.filter(
        (n) => n.type === 'custom5layer' && (n.data as { layer?: ArchitectureLayer }).layer === layer
      );
      if (nodesInLayer.length === 0) continue;

      const ys = nodesInLayer.map((n) => n.position.y);
      const minY = Math.min(...ys) - 40;
      const maxY = Math.max(...ys) + 100;

      layerBounds.push({ layer, minY, maxY });
    }

    return layerBounds;
  }, [nodes, activeOverlays]);

  return (
    <div className="h-full w-full relative">
      {/* Layer overlay backgrounds */}
      {activeOverlays.has('layers') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {swimLanes.map(({ layer, minY, maxY }) => (
            <div
              key={layer}
              className="absolute left-0 right-0"
              style={{
                top: minY,
                height: maxY - minY,
                backgroundColor: LAYER_COLORS[layer],
                borderTop: `1px solid rgba(255, 255, 255, 0.05)`,
                borderBottom: `1px solid rgba(255, 255, 255, 0.05)`,
              }}
            >
              <div className="px-4 py-2 text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                {layer}
              </div>
            </div>
          ))}
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        defaultEdgeOptions={{
          type: 'custom5layer',
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
        className="premium-theme"
        minZoom={0.1}
        maxZoom={2.5}
        snapToGrid
        snapGrid={[10, 10]}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="rgba(139, 92, 246, 0.15)"
          gap={24}
          size={1}
        />
        <Controls
          showInteractive={false}
          position="bottom-right"
          style={{ marginBottom: 80 }}
        />
        <MiniMap
          nodeStrokeColor="rgba(139, 92, 246, 0.5)"
          nodeColor={(node) => {
            const data = node.data as { layer?: ArchitectureLayer };
            const layer = data?.layer;
            if (layer) {
              return LAYER_COLORS[layer] || 'rgba(100, 116, 139, 0.3)';
            }
            return 'rgba(100, 116, 139, 0.3)';
          }}
          maskColor="rgba(15, 23, 42, 0.85)"
          pannable
          zoomable
          position="bottom-right"
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-panel rounded-lg p-3 z-10 max-w-[200px]">
        <div className="text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-2">
          Legend
        </div>
        <div className="space-y-1.5 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-500/30">
              ENTRY
            </span>
            <span className="text-slate-400">Entry point</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-rose-500/30 text-rose-300 border border-rose-500/30">
              EXIT
            </span>
            <span className="text-slate-400">Exit point</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-violet-500" />
            <span className="text-slate-400">High confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-500" />
            <span className="text-slate-400">Medium confidence</span>
          </div>
        </div>
        {analysis && (
          <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-500">
            <div>Entry: {analysis.entryCandidates.length}</div>
            <div>Exit: {analysis.exitCandidates.length}</div>
          </div>
        )}
      </div>
    </div>
  );
}
