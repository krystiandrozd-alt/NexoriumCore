'use client';

// TelEnvIQ - Environment Visualization (MVP)
// Unified view with Graph/Table toggle, Dagre layout, and autosave

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ReactFlowProvider } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Loader2,
  Settings,
} from 'lucide-react';
import EnvironmentToolbar, { type ViewMode, type SaveStatus } from '@/components/graph/EnvironmentToolbar';
import EnvironmentTableView from '@/components/graph/EnvironmentTableView';
import ComponentEditModal from '@/components/dashboard/ComponentEditModal';
import type {
  Environment,
  Graph5LayerNode,
  Graph5LayerEdge,
  GraphAnalysisResult,
  ArchitectureLayer,
  CapabilityType,
} from '@/types';
import type { Node, Edge } from '@xyflow/react';

// Dynamically import Graph View (client-only due to React Flow)
const EnvironmentGraphView = dynamic(
  () => import('@/components/graph/EnvironmentGraphView'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    ),
  }
);

interface TopologyData {
  nodes: Graph5LayerNode[];
  edges: Graph5LayerEdge[];
  analysis: GraphAnalysisResult;
  meta: {
    totalNodes: number;
    filteredNodes: number;
    nodesByLayer: Partial<Record<ArchitectureLayer, number>>;
    entryOverride: string | null;
    exitOverride: string | null;
  };
}

interface SavedDiagram {
  nodes: Node[];
  edges: Edge[];
  updatedAt: string;
}

const AUTOSAVE_DELAY = 1500; // ms

export default function EnvironmentViewPage() {
  const params = useParams();
  const id = params.id as string;

  // State
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [topologyData, setTopologyData] = useState<TopologyData | null>(null);
  const [savedDiagram, setSavedDiagram] = useState<SavedDiagram | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [showInfra, setShowInfra] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [fitViewTrigger, setFitViewTrigger] = useState(0);
  const [autoArrangeTrigger, setAutoArrangeTrigger] = useState(0);

  // Component edit modal
  const [editingComponent, setEditingComponent] = useState<{
    id: string;
    name: string;
    layer: ArchitectureLayer;
    capabilityType: CapabilityType;
  } | null>(null);

  // Refs for autosave
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentNodesRef = useRef<Node[]>([]);

  // Fetch environment details
  const fetchEnvironment = useCallback(async () => {
    try {
      const response = await fetch(`/api/environments/${id}`);
      const result = await response.json();
      if (result.success) {
        setEnvironment(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch environment:', error);
    }
  }, [id]);

  // Fetch topology data
  const fetchTopology = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append('showInfra', String(showInfra));

      const response = await fetch(`/api/environments/${id}/topology5?${params}`);
      const result = await response.json();
      if (result.success) {
        setTopologyData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch topology:', error);
    }
  }, [id, showInfra]);

  // Fetch saved diagram layout
  const fetchSavedDiagram = useCallback(async () => {
    try {
      const response = await fetch(`/api/environments/${id}/diagram`);
      const result = await response.json();
      if (result.success && result.data) {
        setSavedDiagram(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch saved diagram:', error);
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEnvironment(),
        fetchTopology(),
        fetchSavedDiagram(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [id, fetchEnvironment, fetchTopology, fetchSavedDiagram]);

  // Autosave function
  const saveDiagram = useCallback(async (nodes: Node[]) => {
    if (!id || nodes.length === 0) return;

    setSaveStatus('saving');

    try {
      // Only save node positions (id, position)
      const nodePositions = nodes.map((n) => ({
        id: n.id,
        position: n.position,
        type: n.type,
        data: n.data,
      }));

      const response = await fetch(`/api/environments/${id}/diagram`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodePositions,
          edges: topologyData?.edges || [],
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSaveStatus('saved');
        // Reset to idle after delay
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save diagram:', error);
      setSaveStatus('error');
    }
  }, [id, topologyData?.edges]);

  // Handle node changes (for autosave)
  const handleNodesChange = useCallback((nodes: Node[]) => {
    currentNodesRef.current = nodes;
  }, []);

  // Handle position change (trigger autosave)
  const handlePositionChange = useCallback(() => {
    // Clear existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    // Set new timeout for autosave
    autosaveTimeoutRef.current = setTimeout(() => {
      if (currentNodesRef.current.length > 0) {
        saveDiagram(currentNodesRef.current);
      }
    }, AUTOSAVE_DELAY);
  }, [saveDiagram]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  // Toolbar actions
  const handleAutoArrange = useCallback(() => {
    setAutoArrangeTrigger((t) => t + 1);
  }, []);

  const handleFitView = useCallback(() => {
    setFitViewTrigger((t) => t + 1);
  }, []);

  const handleResetLayout = useCallback(async () => {
    try {
      await fetch(`/api/environments/${id}/diagram`, { method: 'DELETE' });
      setSavedDiagram(null);
      setAutoArrangeTrigger((t) => t + 1);
    } catch (error) {
      console.error('Failed to reset layout:', error);
    }
  }, [id]);

  const handleExport = useCallback(() => {
    // SVG export logic
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
    link.download = `environment-${id}-${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [id]);

  const handleRefresh = useCallback(async () => {
    await fetchTopology();
  }, [fetchTopology]);

  const handleNodeClick = useCallback((nodeId: string) => {
    const node = topologyData?.nodes.find((n) => n.id === nodeId);
    if (node) {
      setEditingComponent({
        id: nodeId,
        name: node.data.componentName,
        layer: node.data.layer,
        capabilityType: node.data.capabilityType,
      });
    }
  }, [topologyData]);

  // Environment type colors
  const typeColors: Record<string, string> = {
    DEV: 'bg-slate-100 text-slate-800',
    SIT: 'bg-blue-100 text-blue-800',
    UAT: 'bg-purple-100 text-purple-800',
    NFT: 'bg-amber-100 text-amber-800',
    PREPROD: 'bg-emerald-100 text-emerald-800',
    PROD_RO: 'bg-red-100 text-red-800',
  };

  if (loading || !environment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/environments/${id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900">{environment.name}</h1>
              <Badge variant="secondary" className={typeColors[environment.type]}>
                {environment.type}
              </Badge>
            </div>
            {environment.description && (
              <p className="text-xs text-slate-500 mt-0.5">{environment.description}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Toolbar */}
      <EnvironmentToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        saveStatus={saveStatus}
        onAutoArrange={handleAutoArrange}
        onFitView={handleFitView}
        onExport={handleExport}
        onRefresh={handleRefresh}
        onResetLayout={handleResetLayout}
        showInfra={showInfra}
        onShowInfraChange={setShowInfra}
        nodeCount={topologyData?.nodes.length || 0}
        edgeCount={topologyData?.edges.length || 0}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'graph' && topologyData ? (
          <ReactFlowProvider>
            <EnvironmentGraphView
              initialNodes={topologyData.nodes}
              initialEdges={topologyData.edges}
              savedNodes={savedDiagram?.nodes}
              savedEdges={savedDiagram?.edges}
              analysis={topologyData.analysis}
              environmentId={id}
              showInfra={showInfra}
              onNodesChange={handleNodesChange}
              onPositionChange={handlePositionChange}
              fitViewTrigger={fitViewTrigger}
              autoArrangeTrigger={autoArrangeTrigger}
            />
          </ReactFlowProvider>
        ) : viewMode === 'table' && topologyData ? (
          <div className="h-full overflow-auto p-4">
            <EnvironmentTableView
              nodes={topologyData.nodes}
              edges={topologyData.edges}
              onNodeClick={handleNodeClick}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {/* Component Edit Modal */}
      <ComponentEditModal
        open={!!editingComponent}
        onOpenChange={(open) => !open && setEditingComponent(null)}
        component={editingComponent}
        onSave={fetchTopology}
      />
    </div>
  );
}
