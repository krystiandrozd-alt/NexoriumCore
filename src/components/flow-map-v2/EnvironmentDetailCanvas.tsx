'use client';

// Nexorium Core - Environment Detail Canvas (Level 1)
// Domain swimlane view with manual design mode and auto mode (topology5)

import { memo, useCallback, useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ConnectionMode,
  MarkerType,
} from '@xyflow/react';
import type { Node, Edge, NodeChange, NodePositionChange, Connection, OnConnect, NodeTypes, EdgeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useSWR from 'swr';

import { ManualNode, System5LayerNode } from './nodes';
import { ManualEdge, ManualEdgeMarkers } from './edges';
import { DomainSwimlanesBackground, getDomainLaneForY } from './swimlanes';
import FlowMapV2Toolbar from './FlowMapV2Toolbar';
import { SnapToGridToggle, UndoRedoButtons } from './controls';
import { useManualDesign } from '@/contexts/ManualDesignContext';

import type { ManualNodeType } from '@/types/flow-map-manual';
import type { Graph5LayerNode, Graph5LayerEdge, ArchitectureLayer } from '@/types';
import type { FlowMapV2Layout, FlowMapV2LayoutPosition } from '@/types/flow-map-v2';

// ============================================
// INTERFACES
// ============================================

interface EnvironmentDetailCanvasProps {
  environmentId: string;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
}

// ============================================
// NODE TYPES REGISTRATION
// ============================================

const nodeTypes: NodeTypes = {
  manual: ManualNode,
  system5layer: System5LayerNode,
};

const edgeTypes: EdgeTypes = {
  manual: ManualEdge,
};

// ============================================
// FETCHER
// ============================================

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ============================================
// TOPOLOGY RESPONSE TYPE
// ============================================

interface Topology5Response {
  success: boolean;
  data: {
    nodes: Graph5LayerNode[];
    edges: Graph5LayerEdge[];
    meta: {
      totalNodes: number;
      filteredNodes: number;
      nodesByLayer: Partial<Record<ArchitectureLayer, number>>;
    };
  };
}

// ============================================
// MAIN COMPONENT
// ============================================

function EnvironmentDetailCanvas({
  environmentId,
  isFullscreen,
  onFullscreenToggle,
}: EnvironmentDetailCanvasProps) {
  const { fitView, zoomIn, zoomOut, screenToFlowPosition, setViewport: setViewportFn } = useReactFlow();
  const [showMinimap, setShowMinimap] = useState(true);
  const [savedLayouts, setSavedLayouts] = useState<FlowMapV2Layout[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const laneHeight = 180;

  // Manual design context - L1 always allows editing
  const {
    state: manualState,
    fetchNodes,
    fetchEdges,
    createNode,
    updateNode,
    deleteNode,
    createEdge,
    deleteEdge,
    selectNode,
    selectEdge,
    toggleSnapToGrid,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useManualDesign();

  // Fetch topology5 data (auto-discovered systems)
  const { data: topology5Data, isLoading: isTopologyLoading } = useSWR<Topology5Response>(
    `/api/environments/${environmentId}/topology5`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Fetch manual nodes/edges on mount - L1 always allows manual design
  useEffect(() => {
    fetchNodes();
    fetchEdges();
  }, [fetchNodes, fetchEdges]);

  // Fetch saved layouts for this environment
  useEffect(() => {
    fetch(`/api/environments/${environmentId}/layout`)
      .then((res) => res.json())
      .then((layouts) => {
        if (Array.isArray(layouts)) {
          setSavedLayouts(layouts);
        }
      })
      .catch(console.error);
  }, [environmentId]);

  // Save current layout
  const handleSaveLayout = useCallback(async () => {
    setIsSaving(true);
    try {
      // Collect positions of all manual nodes
      const positions: Record<string, FlowMapV2LayoutPosition> = {};
      manualState.nodes.forEach((node) => {
        positions[node.id] = { x: node.positionX, y: node.positionY };
      });

      const response = await fetch(`/api/environments/${environmentId}/layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Layout ${new Date().toLocaleString()}`,
          positions,
        }),
      });
      if (response.ok) {
        const newLayout = await response.json();
        setSavedLayouts((prev) => [newLayout, ...prev]);
      }
    } catch (err) {
      console.error('Failed to save layout:', err);
    }
    setIsSaving(false);
  }, [environmentId, manualState.nodes]);

  // Load a saved layout
  const handleLoadLayout = useCallback(
    (layout: FlowMapV2Layout) => {
      // Update manual node positions from the layout
      Object.entries(layout.positions).forEach(([nodeId, position]) => {
        updateNode(nodeId, {
          positionX: position.x,
          positionY: position.y,
        });
      });
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    },
    [updateNode, fitView]
  );

  // Keyboard shortcuts for delete and undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected node/edge
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (manualState.selectedNodeId) {
          deleteNode(manualState.selectedNodeId);
        } else if (manualState.selectedEdgeId) {
          deleteEdge(manualState.selectedEdgeId);
        }
      }

      // Undo: Ctrl+Z
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        (e.key === 'y' && (e.ctrlKey || e.metaKey)) ||
        (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manualState, deleteNode, deleteEdge, undo, redo]);

  // Convert auto (topology5) nodes to React Flow nodes - ingested systems
  const autoNodes = useMemo((): Node[] => {
    if (!topology5Data?.data?.nodes) return [];

    return topology5Data.data.nodes.map((node: Graph5LayerNode) => ({
      id: node.id,
      type: 'system5layer',
      position: node.position,
      data: node.data,
    }));
  }, [topology5Data?.data?.nodes]);

  // Convert auto (topology5) edges to React Flow edges - ingested connections
  const autoEdges = useMemo((): Edge[] => {
    if (!topology5Data?.data?.edges) return [];

    return topology5Data.data.edges.map((edge: Graph5LayerEdge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'default',
      animated: edge.animated,
      style: {
        stroke: edge.data?.confidence === 'LOW' ? '#f59e0b' : '#64748b',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 10,
        height: 10,
        color: edge.data?.confidence === 'LOW' ? '#f59e0b' : '#64748b',
      },
    }));
  }, [topology5Data?.data?.edges]);

  // Convert manual nodes to React Flow nodes - user-created systems
  const manualNodes = useMemo((): Node[] => {
    return manualState.nodes.map((node): Node => ({
      id: `manual-${node.id}`,
      type: 'manual',
      position: { x: node.positionX, y: node.positionY },
      data: {
        id: node.id,
        name: node.name,
        nodeType: node.nodeType,
        domain: node.domain,
        domainLane: node.domainLane,
        description: node.description,
        scope: node.scope,
        isSelected: manualState.selectedNodeId === node.id,
      },
      selected: manualState.selectedNodeId === node.id,
    }));
  }, [manualState.nodes, manualState.selectedNodeId]);

  // Convert manual edges to React Flow edges - user-created connections
  const manualEdges = useMemo((): Edge[] => {
    return manualState.edges.map((edge): Edge => ({
      id: `manual-edge-${edge.id}`,
      source: `manual-${edge.sourceNodeId}`,
      target: `manual-${edge.targetNodeId}`,
      type: 'manual',
      data: {
        edgeType: edge.edgeType,
        label: edge.label,
        isSelected: manualState.selectedEdgeId === edge.id,
      },
      selected: manualState.selectedEdgeId === edge.id,
    }));
  }, [manualState.edges, manualState.selectedEdgeId]);

  // Combine all nodes and edges
  const rfNodes = useMemo(() => [...autoNodes, ...manualNodes], [autoNodes, manualNodes]);
  const rfEdges = useMemo(() => [...autoEdges, ...manualEdges], [autoEdges, manualEdges]);

  // Node/edge state
  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Sync state when data changes
  useEffect(() => {
    setNodes(rfNodes);
  }, [rfNodes, setNodes]);

  useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  // Handle node position changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      // Track position changes for saving
      const positionChanges = changes.filter(
        (c): c is NodePositionChange => c.type === 'position' && c.dragging === false
      );

      if (positionChanges.length > 0) {
        positionChanges.forEach((change) => {
          if (change.position && change.id.startsWith('manual-')) {
            const nodeId = change.id.replace('manual-', '');

            // Determine which domain lane the node was dropped in
            const domainLane = getDomainLaneForY(change.position.y, laneHeight);

            updateNode(nodeId, {
              positionX: change.position.x,
              positionY: change.position.y,
              domainLane,
            });
          }
        });
      }
    },
    [onNodesChange, updateNode, laneHeight]
  );

  // Handle node click for selection
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.id.startsWith('manual-')) {
        const nodeId = node.id.replace('manual-', '');
        selectNode(nodeId);
      }
    },
    [selectNode]
  );

  // Handle edge click for selection
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (edge.id.startsWith('manual-edge-')) {
        const edgeId = edge.id.replace('manual-edge-', '');
        selectEdge(edgeId);
      }
    },
    [selectEdge]
  );

  // Handle pane click for deselection
  const handlePaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  // Handle edge creation via React Flow onConnect
  const handleConnect: OnConnect = useCallback(
    async (connection: Connection) => {
      // Only allow connections between manual nodes
      if (
        connection.source?.startsWith('manual-') &&
        connection.target?.startsWith('manual-')
      ) {
        const sourceId = connection.source.replace('manual-', '');
        const targetId = connection.target.replace('manual-', '');

        await createEdge({
          sourceNodeId: sourceId,
          targetNodeId: targetId,
          edgeType: 'MANUAL',
        });
      }
    },
    [createEdge]
  );

  // Handle drag over for palette items
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Handle drop for palette items
  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/manual-node-type') as ManualNodeType;
      if (!type) return;

      // Get drop position in flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Snap to grid if enabled
      const finalPosition = manualState.snapToGrid
        ? {
            x: Math.round(position.x / manualState.gridSize) * manualState.gridSize,
            y: Math.round(position.y / manualState.gridSize) * manualState.gridSize,
          }
        : position;

      // Determine domain lane based on Y position
      const domainLane = getDomainLaneForY(finalPosition.y, laneHeight);

      await createNode({
        name: `New ${type.replace(/_/g, ' ').toLowerCase()}`,
        nodeType: type,
        positionX: finalPosition.x,
        positionY: finalPosition.y,
        domainLane,
        scope: 'GLOBAL',
      });
    },
    [manualState.snapToGrid, manualState.gridSize, screenToFlowPosition, createNode, laneHeight]
  );

  // Toolbar handlers
  const handleZoomIn = useCallback(() => zoomIn({ duration: 200 }), [zoomIn]);
  const handleZoomOut = useCallback(() => zoomOut({ duration: 200 }), [zoomOut]);
  const handleFitView = useCallback(
    () => fitView({ padding: 0.2, duration: 300 }),
    [fitView]
  );

  const handleResetLayout = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  // Calculate canvas dimensions
  const canvasWidth = typeof window !== 'undefined' ? Math.max(window.innerWidth, 1800) : 1800;
  const canvasHeight = Math.max(5 * laneHeight + 100, 1000); // 5 domain lanes

  // Set initial viewport to show all 5 swimlanes
  // 5 lanes * 180px = 900px total height, starting from y=0
  useEffect(() => {
    const timer = setTimeout(() => {
      // Set viewport to show all swimlanes from y=0
      // Calculate viewport to fit all 5 lanes (900px height) with some padding
      const totalLaneHeight = 5 * laneHeight; // 900px
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight - 150 : 800;
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1400;

      // Calculate zoom to fit all lanes, but not too zoomed out
      const zoomToFit = Math.min(0.8, (viewportHeight - 100) / totalLaneHeight);
      const finalZoom = Math.max(0.4, Math.min(zoomToFit, 0.7));

      // Center horizontally, start from top (y=0) with small offset
      const xOffset = (viewportWidth - canvasWidth * finalZoom) / 2;

      setViewportFn({
        x: Math.max(50, xOffset),
        y: 20, // Small offset from top to show CSS lane header
        zoom: finalZoom,
      }, { duration: 200 });
    }, 200);
    return () => clearTimeout(timer);
  }, [setViewportFn, laneHeight, canvasWidth]);

  // Loading state
  const isLoading = isTopologyLoading || manualState.isLoading;
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-slate-400">Loading environment map...</div>
      </div>
    );
  }

  // Error state
  if (manualState.error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-rose-400">Failed to load environment map: {manualState.error}</div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full relative"
      data-testid="environment-detail-canvas"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Manual edge markers */}
      <ManualEdgeMarkers />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultViewport={{ x: 50, y: 20, zoom: 0.6 }}
        minZoom={0.2}
        maxZoom={2}
        panOnScroll
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        nodesDraggable
        nodesConnectable
        proOptions={{ hideAttribution: true }}
        snapToGrid={manualState.snapToGrid}
        snapGrid={[manualState.gridSize, manualState.gridSize]}
        className="flow-map-v2-theme"
      >
        {/* Domain swimlanes background */}
        <DomainSwimlanesBackground
          width={canvasWidth}
          height={canvasHeight}
          laneHeight={laneHeight}
        />

        {/* Grid background - lighter purple */}
        <Background
          color="rgba(167, 139, 250, 0.04)"
          gap={manualState.snapToGrid ? manualState.gridSize : 40}
          size={1}
          style={{ backgroundColor: 'transparent' }}
        />

        {/* Toolbar - L1 always has Build capability */}
        <Panel position="top-center" className="mt-2">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/98 backdrop-blur-xl border border-white/10 shadow-2xl">
            {/* Main Toolbar */}
            <FlowMapV2Toolbar
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onFitView={handleFitView}
              onResetLayout={handleResetLayout}
              onSaveLayout={handleSaveLayout}
              onLoadLayout={handleLoadLayout}
              onFullscreenToggle={onFullscreenToggle}
              isFullscreen={isFullscreen}
              showMinimap={showMinimap}
              onToggleMinimap={() => setShowMinimap((prev) => !prev)}
              savedLayouts={savedLayouts}
              isSaving={isSaving}
              level={1}
              levelLabel="Environment"
            />

            {/* Build controls - always available at L1 */}
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800/80 border border-white/5">
              <SnapToGridToggle
                enabled={manualState.snapToGrid}
                onToggle={toggleSnapToGrid}
              />
              <div className="w-px h-5 bg-white/10" />
              <UndoRedoButtons
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
              />
            </div>
          </div>
        </Panel>

        {/* Minimap */}
        {showMinimap && (
          <MiniMap
            nodeColor={() => '#8b5cf6'}
            nodeStrokeWidth={2}
            maskColor="rgba(15, 23, 42, 0.8)"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
            }}
            pannable
            zoomable
          />
        )}
      </ReactFlow>
    </div>
  );
}

export default memo(EnvironmentDetailCanvas);
