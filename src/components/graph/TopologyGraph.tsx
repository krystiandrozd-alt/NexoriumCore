'use client';

// Nexorium Core - Topology Graph Component
// Main graph visualization using React Flow with swimlane support

import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Panel,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Deterministic hash function for consistent node positioning
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import GraphControls from './GraphControls';
import ViewModeToggle from './controls/ViewModeToggle';
import { SwimLaneContainer } from './swimlanes';
import {
  generateNetworkZoneLanes,
  generateTelcoLayerLanes,
  generateRuntimeLayerLanes,
  generateHostingDomainLanes,
  getNetworkZoneLaneY,
  getTelcoLayerLaneY,
  getRuntimeLayerLaneY,
  getHostingDomainLaneY,
} from './swimlanes';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import type {
  GraphNode,
  GraphEdge,
  GraphFilters,
  ViewMode,
  SwimLane,
  NetworkZone,
  HostingDomain,
} from '@/types';

interface TopologyGraphProps {
  initialNodes: GraphNode[];
  initialEdges: GraphEdge[];
  onRefresh?: () => void;
  onFilterChange?: (filters: GraphFilters) => void;
  loading?: boolean;
  environmentId: string;
  networkZones?: NetworkZone[];
  hostingDomains?: HostingDomain[];
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

export default function TopologyGraph({
  initialNodes,
  initialEdges,
  onRefresh,
  onFilterChange,
  loading = false,
  environmentId,
  networkZones = [],
  hostingDomains = [],
}: TopologyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as Edge[]);
  const [filters, setFilters] = useState<GraphFilters>({
    showStale: true,
    minConfidence: 0,
    stalenessThreshold: 30,
  });
  const [viewMode, setViewMode] = useState<ViewMode>('default');
  const [containerSize] = useState({ width: 1200, height: 800 });

  // Generate swimlanes based on view mode
  const swimLanes = useMemo((): SwimLane[] => {
    const { height } = containerSize;
    switch (viewMode) {
      case 'network-zone':
        return generateNetworkZoneLanes(networkZones, height);
      case 'telco-layer':
        return generateTelcoLayerLanes(height);
      case 'runtime-layer':
        return generateRuntimeLayerLanes(height);
      case 'hosting-domain':
        return generateHostingDomainLanes(hostingDomains, height);
      default:
        return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, networkZones, hostingDomains]);

  // Reposition nodes based on view mode
  const repositionedNodes = useMemo(() => {
    if (viewMode === 'default' || swimLanes.length === 0) {
      return initialNodes as Node[];
    }

    return initialNodes.map((node, index) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = node.data as any;
      let newY: number;

      switch (viewMode) {
        case 'network-zone':
          newY = getNetworkZoneLaneY(data.networkZone?.id || data.networkZoneId, swimLanes);
          break;
        case 'telco-layer':
          newY = getTelcoLayerLaneY(data.telcoLayer, swimLanes);
          break;
        case 'runtime-layer':
          newY = getRuntimeLayerLaneY(data.runtimeLayer?.virtualizationType, swimLanes);
          break;
        case 'hosting-domain':
          newY = getHostingDomainLaneY(data.hostingDomains?.[0]?.hostingDomainId, swimLanes);
          break;
        default:
          newY = node.position.y;
      }

      // Distribute nodes horizontally within lane
      const xOffset = (index % 6) * 180 + 100;

      // Deterministic vertical jitter based on node ID
      const jitter = (hashString(node.id) % 40) - 20;

      return {
        ...node,
        position: {
          x: xOffset,
          y: newY + jitter,
        },
      };
    }) as Node[];
  }, [initialNodes, viewMode, swimLanes]);

  // Update graph when initial data or view mode changes
  useEffect(() => {
    setNodes(repositionedNodes);
    setEdges(initialEdges as Edge[]);
  }, [repositionedNodes, initialEdges, setNodes, setEdges]);

  const handleFilterChange = useCallback((newFilters: GraphFilters) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [onFilterChange]);

  // Export to SVG
  const handleExport = useCallback(async () => {
    // Find the React Flow viewport element
    const viewport = document.querySelector('.react-flow__viewport');
    if (!viewport) return;

    // Clone the viewport for export
    const clone = viewport.cloneNode(true) as SVGElement;

    // Create SVG wrapper
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '1920');
    svg.setAttribute('height', '1080');
    svg.setAttribute('viewBox', '0 0 1920 1080');
    svg.innerHTML = clone.innerHTML;

    // Create download link
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `topology-${environmentId}-${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [environmentId]);

  return (
    <div className="h-full w-full relative">
      <SwimLaneContainer
        viewMode={viewMode}
        lanes={swimLanes}
        width={containerSize.width}
        height={containerSize.height}
      >
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
            type: 'custom',
            animated: false,
          }}
          proOptions={{ hideAttribution: true }}
          className={viewMode === 'default' ? 'bg-slate-50' : 'bg-transparent'}
        >
          {viewMode === 'default' && <Background color="#e2e8f0" gap={16} size={1} />}
          <Controls showInteractive={false} />
          <MiniMap
            nodeStrokeColor="#6366f1"
            nodeColor={(node) => {
              const data = node.data as Record<string, unknown>;
              const isStale = data?.isStale;
              const hasViolation = data?.hasPolicyViolations;
              if (hasViolation) return '#ef4444';
              return isStale ? '#9ca3af' : '#6366f1';
            }}
            maskColor="rgba(241, 245, 249, 0.7)"
            className="bg-white border border-slate-200 rounded-lg"
          />

          {/* View Mode Toggle - Top Center */}
          <Panel position="top-center" className="m-4">
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </Panel>

          {/* Top Panel - Filters */}
          <Panel position="top-left" className="m-4">
            <GraphControls
              filters={filters}
              onFilterChange={handleFilterChange}
              viewMode={viewMode}
            />
          </Panel>

          {/* Top Right Panel - Actions */}
          <Panel position="top-right" className="m-4 flex gap-2">
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

          {/* Legend */}
          <Panel position="bottom-left" className="m-4">
            <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
              <div className="text-xs font-medium text-slate-600 mb-2">Legend</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>High confidence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>Medium confidence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Low confidence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400" />
                  <span>Uncertain link</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Policy violation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded border border-indigo-400 bg-indigo-50" />
                  <span>Enriched</span>
                </div>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </SwimLaneContainer>
    </div>
  );
}
