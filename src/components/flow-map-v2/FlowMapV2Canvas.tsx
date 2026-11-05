'use client';

// Nexorium Core - Flow Map V2 Canvas (Level 0 - Pipeline View)
// Read-only view of environment landscape with navigation to L1 for editing

import { memo, useCallback, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlow,
  Background,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';
import type { Node, Edge, NodeChange, NodePositionChange, NodeTypes, EdgeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useSWR from 'swr';

import { EnvironmentNode, TitleNode, NoteNode } from './nodes';
import { EnhancedEdge, EnhancedEdgeMarkers } from './edges';
import { StageSwimlanesBackground } from './swimlanes';
import FlowMapV2Toolbar from './FlowMapV2Toolbar';
import FlowMapV2Legend from './FlowMapV2Legend';
import EnvironmentHoverCard from './EnvironmentHoverCard';
import { EdgeRoutingToggle, EdgeLabelToggle, ReduceMotionToggle } from './controls';
import type { EdgeRoutingMode } from '@/lib/flow-map/edge-utils';
import './styles/edge-animations.css';

import type {
  FlowMapV2Data,
  FlowMapV2Environment,
  FlowMapV2Integration,
  FlowMapV2Stage,
  FlowMapV2NodeData,
  FlowMapV2Layout,
  FlowMapV2LayoutPosition,
  FlowMapStageKey,
  FlowMapLinkType,
} from '@/types/flow-map-v2';
import { stageColors } from '@/types/flow-map-v2';

// ============================================
// INTERFACES
// ============================================

interface FlowMapV2CanvasProps {
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  projectId?: string; // Optional project filter
}

// Exposed handle for parent component
export interface FlowMapV2CanvasHandle {
  addAnnotation: (type: 'title' | 'note') => void;
}

// Annotation node data type (must extend Record<string, unknown> for ReactFlow)
interface AnnotationNodeData extends Record<string, unknown> {
  type: 'title' | 'note';
  text: string;
}

// ============================================
// NODE TYPES REGISTRATION
// ============================================

const nodeTypes: NodeTypes = {
  environment: EnvironmentNode,
  'annotation-title': TitleNode,
  'annotation-note': NoteNode,
};

const edgeTypes: EdgeTypes = {
  enhanced: EnhancedEdge,
};

// ============================================
// FETCHER
// ============================================

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ============================================
// LAYOUT CALCULATION
// ============================================

function calculateNodePositions(
  environments: FlowMapV2Environment[],
  stages: FlowMapV2Data['stages'],
  savedPositions?: Record<string, FlowMapV2LayoutPosition>
): Record<string, FlowMapV2LayoutPosition> {
  const positions: Record<string, FlowMapV2LayoutPosition> = {};
  const laneWidth = 300;
  const nodeHeight = 120;
  const headerHeight = 80; // Space for stage headers (8 + 48 + padding)
  const padding = 40;

  // Group environments by stage
  const envsByStage: Record<string, FlowMapV2Environment[]> = {};
  stages.forEach((stage) => {
    envsByStage[stage.key] = [];
  });

  environments.forEach((env) => {
    if (env.stageKey && envsByStage[env.stageKey]) {
      envsByStage[env.stageKey].push(env);
    }
  });

  // Calculate positions for each environment
  stages.forEach((stage, stageIndex) => {
    const stageEnvs = envsByStage[stage.key] || [];
    const laneX = stageIndex * laneWidth + laneWidth / 2;

    stageEnvs.forEach((env, envIndex) => {
      // Use saved position if available
      if (savedPositions?.[env.id]) {
        positions[env.id] = savedPositions[env.id];
      } else {
        // Calculate default position
        positions[env.id] = {
          x: laneX - 90, // Center node in lane
          y: headerHeight + padding + envIndex * (nodeHeight + padding),
        };
      }
    });
  });

  // Handle environments without stages
  const unstaged = environments.filter((env) => !env.stageKey);
  unstaged.forEach((env, index) => {
    if (savedPositions?.[env.id]) {
      positions[env.id] = savedPositions[env.id];
    } else {
      positions[env.id] = {
        x: stages.length * laneWidth + padding,
        y: headerHeight + padding + index * (nodeHeight + padding),
      };
    }
  });

  return positions;
}

// ============================================
// MAIN COMPONENT
// ============================================

const FlowMapV2CanvasInner = forwardRef<FlowMapV2CanvasHandle, FlowMapV2CanvasProps>(
  function FlowMapV2CanvasInner(
    { isFullscreen, onFullscreenToggle, projectId },
    ref
  ) {
  const router = useRouter();
  const { fitView, zoomIn, zoomOut, getViewport, setViewport, screenToFlowPosition } = useReactFlow();
  const [showMinimap, setShowMinimap] = useState(true);
  const [savedLayouts, setSavedLayouts] = useState<FlowMapV2Layout[]>([]);
  const [currentLayoutPositions, setCurrentLayoutPositions] = useState<
    Record<string, FlowMapV2LayoutPosition>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredEnv, setHoveredEnv] = useState<{
    env: FlowMapV2Environment;
    position: { x: number; y: number };
  } | null>(null);

  // Annotation nodes state
  const [annotationNodes, setAnnotationNodes] = useState<Node<AnnotationNodeData>[]>([]);

  // Edge controls state
  const [edgeRoutingMode, setEdgeRoutingMode] = useState<EdgeRoutingMode>('smooth');
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Fetch flow map data
  const { data, error, isLoading } = useSWR<FlowMapV2Data>(
    '/api/flow-map',
    fetcher,
    { revalidateOnFocus: false }
  );

  // Fetch saved layouts
  useEffect(() => {
    fetch('/api/flow-map/layout')
      .then((res) => res.json())
      .then((layouts) => {
        if (Array.isArray(layouts)) {
          setSavedLayouts(layouts);
          // Load default layout if exists
          const defaultLayout = layouts.find((l: FlowMapV2Layout) => l.isDefault);
          if (defaultLayout) {
            setCurrentLayoutPositions(defaultLayout.positions);
          }
        }
      })
      .catch(console.error);
  }, []);


  // Get environments filtered by project
  const filteredEnvironments = useMemo((): FlowMapV2Environment[] => {
    if (!data?.environments) return [];
    // Show all environments when no project selected or 'all' selected
    if (!projectId || projectId === 'all') {
      return data.environments;
    }
    // Simulated project filtering - in production would filter by actual project ID
    // This matches the sidebar's filtering logic
    const allEnvs = data.environments;
    if (projectId === 'project-a') return allEnvs.slice(0, 5);
    if (projectId === 'project-b') return allEnvs.filter((_, index) => index >= 2 && index < 5);
    if (projectId === 'project-c') return allEnvs.filter((_, index) => index >= 1 && index < 5);
    return data.environments;
  }, [data?.environments, projectId]);

  // Filter integrations based on visible environments
  const filteredIntegrations = useMemo((): FlowMapV2Integration[] => {
    if (!data?.integrations) return [];
    const visibleIds = new Set(filteredEnvironments.map((e: FlowMapV2Environment) => e.id));

    return data.integrations.filter(
      (int: FlowMapV2Integration) => visibleIds.has(int.sourceId) && visibleIds.has(int.targetId)
    );
  }, [data?.integrations, filteredEnvironments]);

  // Calculate node positions
  const nodePositions = useMemo(() => {
    if (!data?.stages) return {};
    return calculateNodePositions(
      filteredEnvironments,
      data.stages,
      currentLayoutPositions
    );
  }, [filteredEnvironments, data?.stages, currentLayoutPositions]);

  // Convert environments to React Flow nodes
  const autoNodes = useMemo(() => {
    return filteredEnvironments.map((env: FlowMapV2Environment): Node<FlowMapV2NodeData> => {
      const stage = data?.stages.find((s: FlowMapV2Stage) => s.key === env.stageKey);
      const position = nodePositions[env.id] || { x: 0, y: 0 };

      return {
        id: `env-${env.id}`,
        type: 'environment',
        position,
        data: {
          id: env.id,
          name: env.name,
          type: env.type,
          stageKey: env.stageKey,
          stageName: env.stageName,
          stageColor: stage?.color || (env.stageKey ? stageColors[env.stageKey as FlowMapStageKey] : null),
          domain: env.domain,
          systemCount: env.systemCount,
          connectionCount: env.connectionCount,
          description: env.description,
          hostingPlatform: env.hostingPlatform,
          vpc: env.vpc,
          subnet: env.subnet,
          updatedAt: env.updatedAt,
        },
        dragHandle: '.react-flow__node',
      };
    });
  }, [filteredEnvironments, data?.stages, nodePositions]);

  // React Flow nodes (L0 shows auto-discovered environments + annotations)
  const rfNodes = useMemo(() => {
    return [...autoNodes, ...annotationNodes];
  }, [autoNodes, annotationNodes]);

  // Add annotation handler
  const addAnnotation = useCallback((type: 'title' | 'note') => {
    const canvasCenter = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const newNode: Node<AnnotationNodeData> = {
      id: `annotation-${Date.now()}`,
      type: type === 'title' ? 'annotation-title' : 'annotation-note',
      position: {
        x: canvasCenter.x - 100,
        y: canvasCenter.y - 25,
      },
      data: {
        type,
        text: type === 'title' ? 'New Title' : 'New Note',
      },
      draggable: true,
    };

    setAnnotationNodes((prev) => [...prev, newNode]);
  }, [screenToFlowPosition]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    addAnnotation,
  }), [addAnnotation]);

  // Map link types to enhanced edge types
  const mapLinkTypeToEdgeType = (linkType: FlowMapLinkType): 'integration' | 'data-sync' | 'promotion' | 'reference' => {
    switch (linkType) {
      case 'PROMOTION': return 'promotion';
      case 'DATA_SYNC': return 'data-sync';
      case 'REFERENCE': return 'reference';
      default: return 'integration';
    }
  };

  // Convert integrations to React Flow edges (L0 shows only auto-discovered integrations)
  const rfEdges = useMemo(() => {
    return filteredIntegrations.map((int: FlowMapV2Integration): Edge => {
      const enhancedType = mapLinkTypeToEdgeType(int.linkType);
      return {
        id: `int-${int.id}`,
        source: `env-${int.sourceId}`,
        target: `env-${int.targetId}`,
        type: 'enhanced',
        data: {
          edgeType: enhancedType,
          protocol: showEdgeLabels ? int.protocol : undefined,
          label: showEdgeLabels ? int.notes : undefined,
          routingMode: edgeRoutingMode,
          isActive: int.isActive,
          reduceMotion,
        },
        markerEnd: `url(#marker-${enhancedType})`,
      };
    });
  }, [filteredIntegrations, edgeRoutingMode, showEdgeLabels, reduceMotion]);

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

  // Handle node position changes (save positions for environment nodes)
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Cast to satisfy React Flow's generic typing
      onNodesChange(changes as NodeChange<Node<FlowMapV2NodeData>>[]);

      // Track position changes for saving
      const positionChanges = changes.filter(
        (c): c is NodePositionChange => c.type === 'position' && c.dragging === false
      );

      if (positionChanges.length > 0) {
        positionChanges.forEach((change) => {
          if (change.position && change.id.startsWith('env-')) {
            const envId = change.id.replace('env-', '');
            setCurrentLayoutPositions((prev) => ({
              ...prev,
              [envId]: change.position!,
            }));
          }
        });
      }
    },
    [onNodesChange]
  );

  // Handle double-click on environment nodes to navigate to detail map (L1)
  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.id.startsWith('env-')) {
        const envId = node.id.replace('env-', '');
        router.push(`/dashboard/environments/${envId}/map`);
      }
    },
    [router]
  );

  // Handle node hover for popover (only for auto nodes)
  const handleNodeMouseEnter = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.id.startsWith('env-')) {
        const envId = node.id.replace('env-', '');
        const env = filteredEnvironments.find((e: FlowMapV2Environment) => e.id === envId);
        if (env) {
          setHoveredEnv({
            env,
            position: { x: event.clientX, y: event.clientY },
          });
        }
      }
    },
    [filteredEnvironments]
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredEnv(null);
  }, []);

  // Toolbar handlers
  const handleZoomIn = useCallback(() => zoomIn({ duration: 200 }), [zoomIn]);
  const handleZoomOut = useCallback(() => zoomOut({ duration: 200 }), [zoomOut]);
  const handleFitView = useCallback(
    () => fitView({ padding: 0.2, duration: 300 }),
    [fitView]
  );

  const handleResetLayout = useCallback(() => {
    if (!data?.stages) return;
    const defaultPositions = calculateNodePositions(
      filteredEnvironments,
      data.stages
    );
    setCurrentLayoutPositions(defaultPositions);
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id.startsWith('env-')) {
          const envId = n.id.replace('env-', '');
          return {
            ...n,
            position: defaultPositions[envId] || n.position,
          };
        }
        return n;
      })
    );
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  }, [data?.stages, filteredEnvironments, setNodes, fitView]);

  const handleSaveLayout = useCallback(async () => {
    setIsSaving(true);
    try {
      // Capture current viewport (zoom and pan position)
      const currentViewport = getViewport();
      const response = await fetch('/api/flow-map/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Layout ${new Date().toLocaleString()}`,
          positions: currentLayoutPositions,
          viewport: currentViewport,
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
  }, [currentLayoutPositions, getViewport]);

  const handleLoadLayout = useCallback(
    (layout: FlowMapV2Layout) => {
      setCurrentLayoutPositions(layout.positions);
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id.startsWith('env-')) {
            const envId = n.id.replace('env-', '');
            return {
              ...n,
              position: layout.positions[envId] || n.position,
            };
          }
          return n;
        })
      );
      // Restore viewport if saved, otherwise fit to view
      if (layout.viewport) {
        setTimeout(() => setViewport(layout.viewport!, { duration: 300 }), 50);
      } else {
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
      }
    },
    [setNodes, fitView, setViewport]
  );

  // Initial fit view
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView]);

  // Calculate canvas size for swimlanes
  const { zoom: _zoom } = getViewport();
  const canvasWidth = Math.max(
    (data?.stages.length || 6) * 300,
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const canvasHeight = Math.max(
    filteredEnvironments.length * 140 + 200,
    typeof window !== 'undefined' ? window.innerHeight : 800
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-slate-400">Loading flow map...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-rose-400">Failed to load flow map data</div>
      </div>
    );
  }

  // Show all stages
  const visibleStages = data?.stages || [];
  const visibleStageKeys = visibleStages.map((s: FlowMapV2Stage) => s.key as FlowMapStageKey);

  return (
    <div
      className={`w-full h-full relative ${reduceMotion ? 'reduce-motion' : ''}`}
      data-testid="flowmap-v2-canvas"
    >
      {/* Edge markers */}
      <EnhancedEdgeMarkers />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="flow-map-v2-theme"
      >
        {/* Stage swimlanes background */}
        <StageSwimlanesBackground
          stages={visibleStages}
          width={canvasWidth}
          height={canvasHeight}
          visibleStages={visibleStageKeys}
        />

        {/* Subtle grid background - lighter purple */}
        <Background
          color="rgba(167, 139, 250, 0.04)"
          gap={40}
          size={1}
          style={{ backgroundColor: 'transparent' }}
        />

        {/* Toolbar - positioned at top with solid background */}
        <Panel position="top-center" className="mt-1" style={{ zIndex: 20 }}>
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
              level={0}
              levelLabel="Pipeline"
            />

            {/* Edge controls */}
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800/80 border border-white/5">
              <EdgeRoutingToggle
                mode={edgeRoutingMode}
                onModeChange={setEdgeRoutingMode}
              />
              <div className="w-px h-5 bg-white/10" />
              <EdgeLabelToggle
                showLabels={showEdgeLabels}
                onToggle={() => setShowEdgeLabels(!showEdgeLabels)}
              />
              <div className="w-px h-5 bg-white/10" />
              <ReduceMotionToggle
                reduceMotion={reduceMotion}
                onToggle={() => setReduceMotion(!reduceMotion)}
              />
            </div>
          </div>
        </Panel>

        {/* Legend */}
        <FlowMapV2Legend stages={visibleStages} />

        {/* Minimap */}
        {showMinimap && (
          <MiniMap
            nodeColor={(node) => {
              const nodeData = node.data as FlowMapV2NodeData;
              return nodeData?.stageColor || '#64748b';
            }}
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

      {/* Hover card */}
      {hoveredEnv && (
        <EnvironmentHoverCard
          environment={hoveredEnv.env}
          position={hoveredEnv.position}
          isVisible
        />
      )}
    </div>
  );
});

// Memoized wrapper
const FlowMapV2Canvas = memo(FlowMapV2CanvasInner);

export default FlowMapV2Canvas;
