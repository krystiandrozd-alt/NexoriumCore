'use client';

// TelEnvIQ - Flow Map Canvas
// Main React Flow canvas for portfolio change intelligence visualization

import { memo, useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  ConnectionMode,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Map,
  AlertTriangle,
  GitMerge,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FlowMapNode, { type FlowMapNodeData } from './FlowMapNode';
import FlowMapEdge, { type FlowMapEdgeData } from './FlowMapEdge';
import type {
  FlowNode,
  FlowEdge,
  FlowMapFilters,
  Collision,
  Convergence,
  Project,
  IntelligenceContext,
} from '@/types/flow-map';

// ============================================
// INTERFACES
// ============================================

interface FlowMapCanvasProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  projects: Project[];
  collisions: Collision[];
  convergences: Convergence[];
  filters: FlowMapFilters;
  onNodeClick: (node: FlowNode) => void;
  onEdgeClick: (edge: FlowEdge) => void;
  onCollisionClick: (collision: Collision) => void;
  onSelectionChange: (context: IntelligenceContext | null) => void;
  onNavigateToNode: (nodeId: string) => void;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
}

// ============================================
// NODE TYPES
// ============================================

const nodeTypes = {
  flowMapNode: FlowMapNode,
};

const edgeTypes = {
  flowMapEdge: FlowMapEdge,
};

// ============================================
// LAYOUT HELPERS
// ============================================

function calculateNodePosition(node: FlowNode, index: number, allNodes: FlowNode[]): { x: number; y: number } {
  // Group nodes by type for layered layout
  const nodesByType = {
    PROJECT: allNodes.filter((n) => n.type === 'PROJECT'),
    ENVIRONMENT: allNodes.filter((n) => n.type === 'ENVIRONMENT'),
    SYSTEM: allNodes.filter((n) => n.type === 'SYSTEM'),
    EXTERNAL: allNodes.filter((n) => n.type === 'EXTERNAL'),
  };

  // Find position within type group
  const typeNodes = nodesByType[node.type];
  const typeIndex = typeNodes.findIndex((n) => n.id === node.id);
  const nodesPerRow = node.type === 'PROJECT' ? 4 : node.type === 'ENVIRONMENT' ? 6 : 8;
  const row = Math.floor(typeIndex / nodesPerRow);
  const col = typeIndex % nodesPerRow;

  // Base positions by type (creating layers)
  const layerY = {
    PROJECT: 0,
    ENVIRONMENT: 400,
    SYSTEM: 800,
    EXTERNAL: 1200,
  };

  const spacing = {
    PROJECT: { x: 280, y: 200 },
    ENVIRONMENT: { x: 220, y: 180 },
    SYSTEM: { x: 200, y: 160 },
    EXTERNAL: { x: 180, y: 140 },
  };

  // Add some randomness for more organic layout
  const jitterX = (Math.sin(index * 2.5) * 20);
  const jitterY = (Math.cos(index * 1.8) * 15);

  return {
    x: 100 + col * spacing[node.type].x + jitterX,
    y: layerY[node.type] + row * spacing[node.type].y + jitterY,
  };
}

// ============================================
// TOOLBAR
// ============================================

function CanvasToolbar({
  isAnimating,
  onToggleAnimation,
  onResetView,
  onZoomIn,
  onZoomOut,
  onFitView,
  showMinimap,
  onToggleMinimap,
  collisionCount,
  convergenceCount,
}: {
  isAnimating: boolean;
  onToggleAnimation: () => void;
  onResetView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  showMinimap: boolean;
  onToggleMinimap: () => void;
  collisionCount: number;
  convergenceCount: number;
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg glass-panel">
      {/* Animation toggle */}
      <button
        onClick={onToggleAnimation}
        className={cn(
          'p-2 rounded-md transition-colors',
          isAnimating
            ? 'bg-violet-500/30 text-violet-300'
            : 'text-slate-400 hover:text-white hover:bg-white/10'
        )}
        title={isAnimating ? 'Pause animations' : 'Play animations'}
      >
        {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

      <div className="w-px h-5 bg-white/10" />

      {/* Zoom controls */}
      <button
        onClick={onZoomIn}
        className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        onClick={onFitView}
        className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Fit to view"
      >
        <Maximize2 className="h-4 w-4" />
      </button>
      <button
        onClick={onResetView}
        className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Reset view"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      <div className="w-px h-5 bg-white/10" />

      {/* Minimap toggle */}
      <button
        onClick={onToggleMinimap}
        className={cn(
          'p-2 rounded-md transition-colors',
          showMinimap
            ? 'bg-violet-500/30 text-violet-300'
            : 'text-slate-400 hover:text-white hover:bg-white/10'
        )}
        title={showMinimap ? 'Hide minimap' : 'Show minimap'}
      >
        <Map className="h-4 w-4" />
      </button>

      <div className="w-px h-5 bg-white/10" />

      {/* Status indicators */}
      {collisionCount > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500/20 text-rose-300">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{collisionCount}</span>
        </div>
      )}
      {convergenceCount > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-500/20 text-cyan-300">
          <GitMerge className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{convergenceCount}</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// LEGEND
// ============================================

function CanvasLegend() {
  return (
    <div className="p-3 rounded-lg glass-panel space-y-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Legend</div>

      {/* Node types */}
      <div className="space-y-1.5">
        <div className="text-[9px] text-slate-400">Nodes</div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-violet-500/50 to-violet-500/20 border border-violet-500/40" />
          <span>Project</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-500/50 to-blue-500/20 border border-blue-500/40" />
          <span>Environment</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-purple-500/50 to-purple-500/20 border border-purple-500/40" />
          <span>System</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-amber-500/50 to-amber-500/20 border border-amber-500/40" />
          <span>External</span>
        </div>
      </div>

      {/* Edge types */}
      <div className="space-y-1.5">
        <div className="text-[9px] text-slate-400">Flows</div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <div className="w-4 h-0.5 bg-violet-500" />
          <span>Promotion</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <div className="w-4 h-0.5 bg-blue-500 border-t border-dashed" />
          <span>Integration</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <div className="w-4 h-0.5 bg-slate-400 border-t border-dotted" />
          <span>Dependency</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <div className="w-4 h-0.5 bg-amber-500" style={{ borderTop: '2px dashed' }} />
          <span>Shared</span>
        </div>
      </div>

      {/* Risk indicators */}
      <div className="space-y-1.5">
        <div className="text-[9px] text-slate-400">Risk Level</div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Low</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

function FlowMapCanvas({
  nodes: flowNodes,
  edges: flowEdges,
  projects: _projects,
  collisions,
  convergences,
  filters,
  onNodeClick,
  onEdgeClick,
  onCollisionClick: _onCollisionClick,
  onSelectionChange,
  onNavigateToNode,
  selectedNodeId,
  selectedEdgeId,
}: FlowMapCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow();
  const [isAnimating, setIsAnimating] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showLegend, _setShowLegend] = useState(true);

  // Filter nodes based on current filters
  const filteredNodes = useMemo(() => {
    return flowNodes.filter((node) => {
      // Node type filter
      if (filters.nodeTypes.length > 0 && !filters.nodeTypes.includes(node.type)) {
        return false;
      }

      // Risk level filter
      if (filters.riskLevels.length > 0 && !filters.riskLevels.includes(node.riskLevel)) {
        return false;
      }

      // Specific entity filters
      if (filters.projects.length > 0 && node.type === 'PROJECT' && !filters.projects.includes(node.id)) {
        return false;
      }
      if (filters.systems.length > 0 && node.type === 'SYSTEM' && !filters.systems.includes(node.id)) {
        return false;
      }
      if (filters.environments.length > 0 && node.type === 'ENVIRONMENT' && !filters.environments.includes(node.id)) {
        return false;
      }

      return true;
    });
  }, [flowNodes, filters]);

  // Filter edges based on filters and visible nodes
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));

    return flowEdges.filter((edge) => {
      // Both nodes must be visible
      if (!visibleNodeIds.has(edge.fromNodeId) || !visibleNodeIds.has(edge.toNodeId)) {
        return false;
      }

      // Edge type filter
      if (filters.edgeTypes.length > 0 && !filters.edgeTypes.includes(edge.flowType)) {
        return false;
      }

      // Active only filter
      if (filters.showActiveOnly && !edge.isActive) {
        return false;
      }

      // Emergent links filter
      if (filters.showEmergentLinks && !edge.isEmergent) {
        return false;
      }

      return true;
    });
  }, [flowEdges, filteredNodes, filters]);

  // Identify collision-affected nodes
  const collisionNodeIds = useMemo(() => {
    if (!filters.showCollisionsOnly) return new Set<string>();
    const ids = new Set<string>();
    collisions.forEach((collision) => {
      collision.affectedProjects.forEach((id) => ids.add(id));
      collision.affectedEnvironments.forEach((id) => ids.add(id));
      collision.affectedSystems.forEach((id) => ids.add(id));
    });
    return ids;
  }, [collisions, filters.showCollisionsOnly]);

  // Identify convergence points
  const convergenceNodeIds = useMemo(() => {
    const ids = new Set<string>();
    convergences.forEach((conv) => {
      ids.add(conv.sharedResourceId);
    });
    return ids;
  }, [convergences]);

  // Convert to React Flow nodes
  const rfNodes = useMemo(() => {
    let displayNodes = filteredNodes;

    // If collisions only, filter to collision-related nodes
    if (filters.showCollisionsOnly && collisionNodeIds.size > 0) {
      displayNodes = filteredNodes.filter((n) => collisionNodeIds.has(n.id));
    }

    return displayNodes.map((node, index): Node<FlowMapNodeData> => {
      const position = calculateNodePosition(node, index, displayNodes);
      const isCollisionTarget = collisionNodeIds.has(node.id);
      const isConvergencePoint = convergenceNodeIds.has(node.id);

      return {
        id: node.id,
        type: 'flowMapNode',
        position,
        data: {
          label: node.label,
          subLabel: node.subLabel,
          nodeType: node.type,
          status: node.status,
          healthScore: node.healthScore,
          riskLevel: node.riskLevel,
          isHighlighted: node.id === selectedNodeId,
          isCollisionTarget,
          isConvergencePoint,
          connectionCount: filteredEdges.filter(
            (e) => e.fromNodeId === node.id || e.toNodeId === node.id
          ).length,
          metadata: {
            owner: node.metadata.owner,
            team: node.metadata.team,
            utilization: node.metadata.utilization,
            vendor: node.metadata.vendor,
            version: node.metadata.version,
          },
        },
        selected: node.id === selectedNodeId,
      };
    });
  }, [filteredNodes, filteredEdges, selectedNodeId, collisionNodeIds, convergenceNodeIds, filters.showCollisionsOnly]);

  // Convert to React Flow edges
  const rfEdges = useMemo(() => {
    return filteredEdges.map((edge): Edge<FlowMapEdgeData> => ({
      id: edge.id,
      source: edge.fromNodeId,
      target: edge.toNodeId,
      type: 'flowMapEdge',
      data: {
        flowType: edge.flowType,
        label: edge.label,
        riskScore: edge.riskScore,
        collisionProbability: edge.collisionProbability,
        isActive: isAnimating && edge.isActive,
        isEmergent: edge.isEmergent,
        isHighlighted: edge.id === selectedEdgeId,
      },
      selected: edge.id === selectedEdgeId,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: edge.flowType === 'PROMOTION' ? '#8b5cf6' : '#64748b',
      },
    }));
  }, [filteredEdges, selectedEdgeId, isAnimating]);

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

  // Handle node click
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const flowNode = flowNodes.find((n) => n.id === node.id);
      if (flowNode) {
        onNodeClick(flowNode);
      }
    },
    [flowNodes, onNodeClick]
  );

  // Handle edge click
  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      const flowEdge = flowEdges.find((e) => e.id === edge.id);
      if (flowEdge) {
        onEdgeClick(flowEdge);
      }
    },
    [flowEdges, onEdgeClick]
  );

  // Handle pane click (deselect)
  const handlePaneClick = useCallback(() => {
    onSelectionChange(null);
  }, [onSelectionChange]);

  // Navigation to specific node (available for external use via onNavigateToNode)
  const _handleNavigateToNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setCenter(node.position.x + 100, node.position.y + 50, { zoom: 1.5, duration: 500 });
        onNavigateToNode(nodeId);
      }
    },
    [nodes, setCenter, onNavigateToNode]
  );

  // Toolbar actions
  const handleToggleAnimation = useCallback(() => {
    setIsAnimating((prev) => !prev);
  }, []);

  const handleResetView = useCallback(() => {
    fitView({ padding: 0.2, duration: 500 });
  }, [fitView]);

  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 200 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 200 });
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.1, duration: 500 });
  }, [fitView]);

  // Initial fit view
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full" data-testid="flowmap-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        className="premium-theme"
        proOptions={{ hideAttribution: true }}
      >
        {/* Dark gradient background */}
        <Background
          color="rgba(139, 92, 246, 0.1)"
          gap={40}
          size={1}
          style={{ backgroundColor: 'transparent' }}
        />

        {/* Top toolbar panel */}
        <Panel position="top-center" className="mt-4">
          <CanvasToolbar
            isAnimating={isAnimating}
            onToggleAnimation={handleToggleAnimation}
            onResetView={handleResetView}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitView={handleFitView}
            showMinimap={showMinimap}
            onToggleMinimap={() => setShowMinimap((prev) => !prev)}
            collisionCount={collisions.length}
            convergenceCount={convergences.filter((c) => c.isNew).length}
          />
        </Panel>

        {/* Legend panel */}
        {showLegend && (
          <Panel position="bottom-left" className="mb-4 ml-4">
            <CanvasLegend />
          </Panel>
        )}

        {/* Minimap */}
        {showMinimap && (
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as unknown as FlowMapNodeData;
              switch (data?.nodeType) {
                case 'PROJECT':
                  return 'rgba(139, 92, 246, 0.8)';
                case 'ENVIRONMENT':
                  return 'rgba(59, 130, 246, 0.8)';
                case 'SYSTEM':
                  return 'rgba(168, 85, 247, 0.8)';
                case 'EXTERNAL':
                  return 'rgba(245, 158, 11, 0.8)';
                default:
                  return 'rgba(148, 163, 184, 0.8)';
              }
            }}
            nodeStrokeWidth={2}
            maskColor="rgba(15, 23, 42, 0.8)"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
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

// Wrap with memo for performance
export default memo(FlowMapCanvas);
