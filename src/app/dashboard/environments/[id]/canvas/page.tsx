'use client';

// TelEnvIQ - Premium Environment Canvas (Flagship Screen)
// Immersive graph visualization with inspector, overlays, and keyboard shortcuts

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ReactFlowProvider } from '@xyflow/react';
import { Loader2 } from 'lucide-react';
import PremiumToolbar, {
  type ViewMode,
  type SaveStatus,
  type OverlayType,
} from '@/components/graph/PremiumToolbar';
import InspectorPanel, {
  type InspectorNodeData,
  type InspectorEdgeData,
} from '@/components/graph/InspectorPanel';
import EnvironmentTableView from '@/components/graph/EnvironmentTableView';
import type {
  Environment,
  Graph5LayerNode,
  Graph5LayerEdge,
  GraphAnalysisResult,
} from '@/types';
import type { Node, Edge } from '@xyflow/react';

// Dynamically import Premium Graph View (client-only)
const PremiumGraphView = dynamic(
  () => import('@/components/graph/PremiumGraphView'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
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
    entryOverride: string | null;
    exitOverride: string | null;
  };
}

interface Snapshot {
  id: string;
  label: string;
  createdAt: string;
}

interface SavedDiagram {
  nodes: Node[];
  edges: Edge[];
  updatedAt: string;
}

interface SearchResult {
  id: string;
  label: string;
  type: string;
  hostname?: string;
}

const AUTOSAVE_DELAY = 800;

export default function EnvironmentCanvasPage() {
  const params = useParams();
  const _router = useRouter();
  const id = params.id as string;

  // Core state
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [topologyData, setTopologyData] = useState<TopologyData | null>(null);
  const [savedDiagram, setSavedDiagram] = useState<SavedDiagram | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [currentSnapshotId, setCurrentSnapshotId] = useState<string | null>(null);
  const [compareSnapshotId, setCompareSnapshotId] = useState<string | null>(null);
  const [activeOverlays, setActiveOverlays] = useState<Set<OverlayType>>(new Set());

  // Inspector state
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<InspectorNodeData | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<InspectorEdgeData | null>(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  // Graph control triggers
  const [fitViewTrigger, setFitViewTrigger] = useState(0);
  const [autoArrangeTrigger, setAutoArrangeTrigger] = useState(0);

  // Refs
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentNodesRef = useRef<Node[]>([]);

  // Fetch environment
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

  // Fetch topology
  const fetchTopology = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (currentSnapshotId) {
        params.append('snapshotId', currentSnapshotId);
      }
      if (compareSnapshotId) {
        params.append('compareToSnapshotId', compareSnapshotId);
      }

      const response = await fetch(`/api/environments/${id}/topology5?${params}`);
      const result = await response.json();
      if (result.success) {
        setTopologyData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch topology:', error);
    }
  }, [id, currentSnapshotId, compareSnapshotId]);

  // Fetch saved diagram
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

  // Fetch snapshots
  const fetchSnapshots = useCallback(async () => {
    try {
      const response = await fetch(`/api/environments/${id}/snapshots`);
      const result = await response.json();
      if (result.success) {
        setSnapshots(
          result.data.map((s: { id: string; createdAt: string }) => ({
            id: s.id,
            label: `Snapshot ${new Date(s.createdAt).toLocaleDateString()}`,
            createdAt: new Date(s.createdAt).toLocaleString(),
          }))
        );
      }
    } catch (error) {
      // Snapshots endpoint might not exist yet
      console.error('Failed to fetch snapshots:', error);
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
        fetchSnapshots(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [id, fetchEnvironment, fetchTopology, fetchSavedDiagram, fetchSnapshots]);

  // Reload topology when snapshot changes
  useEffect(() => {
    if (!loading) {
      fetchTopology();
    }
  }, [currentSnapshotId, compareSnapshotId, fetchTopology, loading]);

  // Save diagram
  const saveDiagram = useCallback(
    async (nodes: Node[]) => {
      if (!id || nodes.length === 0) return;

      setSaveStatus('saving');

      try {
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
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          setSaveStatus('error');
        }
      } catch (error) {
        console.error('Failed to save diagram:', error);
        setSaveStatus('error');
      }
    },
    [id, topologyData?.edges]
  );

  // Handle nodes change
  const handleNodesChange = useCallback((nodes: Node[]) => {
    currentNodesRef.current = nodes;
  }, []);

  // Handle position change (trigger autosave)
  const handlePositionChange = useCallback(() => {
    if (!autosaveEnabled) return;

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      if (currentNodesRef.current.length > 0) {
        saveDiagram(currentNodesRef.current);
      }
    }, AUTOSAVE_DELAY);
  }, [autosaveEnabled, saveDiagram]);

  // Manual save
  const handleManualSave = useCallback(() => {
    if (currentNodesRef.current.length > 0) {
      saveDiagram(currentNodesRef.current);
    }
  }, [saveDiagram]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  // Node selection
  const handleNodeSelect = useCallback(
    (nodeId: string | null) => {
      if (!nodeId) {
        setSelectedNode(null);
        return;
      }

      const node = topologyData?.nodes.find((n) => n.id === nodeId);
      if (node) {
        setSelectedNode({
          id: node.id,
          label: node.data.label,
          displayName: node.data.displayName,
          componentName: node.data.componentName,
          layer: node.data.layer,
          capabilityType: node.data.capabilityType,
          hostname: node.data.hostname,
          primaryEndpoint: node.data.primaryEndpoint,
          projectVersion: node.data.projectVersion,
          isEntry: node.data.isEntry,
          isExit: node.data.isExit,
          sourceSystem: node.data.sourceSystem,
          ingestedAt: node.data.ingestedAt,
        });
        setSelectedEdge(null);
        setInspectorOpen(true);
      }
    },
    [topologyData]
  );

  // Edge selection
  const handleEdgeSelect = useCallback(
    (edgeId: string | null) => {
      if (!edgeId) {
        setSelectedEdge(null);
        return;
      }

      const edge = topologyData?.edges.find((e) => e.id === edgeId);
      if (edge) {
        const sourceNode = topologyData?.nodes.find((n) => n.id === edge.source);
        const targetNode = topologyData?.nodes.find((n) => n.id === edge.target);

        setSelectedEdge({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceNodeName: sourceNode?.data.componentName || 'Unknown',
          targetNodeName: targetNode?.data.componentName || 'Unknown',
          protocolType: edge.data.protocolType,
          protocolDetail: edge.data.protocolDetail,
          port: edge.data.port,
          origin: edge.data.origin,
          confidence: edge.data.confidence,
          sourceSystem: edge.data.sourceSystem,
        });
        setSelectedNode(null);
        setInspectorOpen(true);
      }
    },
    [topologyData]
  );

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setHighlightedNodeId(null);
  }, []);

  // Search handler
  const handleSearch = useCallback(
    (query: string): SearchResult[] => {
      if (!topologyData || query.length < 2) return [];

      const lowerQuery = query.toLowerCase();
      return topologyData.nodes
        .filter(
          (n) =>
            n.data.componentName.toLowerCase().includes(lowerQuery) ||
            n.data.label.toLowerCase().includes(lowerQuery) ||
            n.data.hostname?.toLowerCase().includes(lowerQuery) ||
            n.data.projectVersion?.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 10)
        .map((n) => ({
          id: n.id,
          label: n.data.displayName || n.data.componentName,
          type: n.data.layer,
          hostname: n.data.hostname || undefined,
        }));
    },
    [topologyData]
  );

  // Search select - focus node
  const handleSearchSelect = useCallback(
    (nodeId: string) => {
      setHighlightedNodeId(nodeId);
      handleNodeSelect(nodeId);
      // Trigger fit to highlighted node
      setFitViewTrigger((t) => t + 1);
    },
    [handleNodeSelect]
  );

  // Overlay toggle
  const handleOverlayToggle = useCallback((overlay: OverlayType) => {
    setActiveOverlays((prev) => {
      const next = new Set(prev);
      if (next.has(overlay)) {
        next.delete(overlay);
      } else {
        next.add(overlay);
      }
      return next;
    });
  }, []);

  // View mode change
  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      if (mode === 'table') {
        setViewMode('table');
      } else if (mode === 'graph') {
        setViewMode('graph');
      }
      // matrix and lifecycle are stubs
    },
    []
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          setFitViewTrigger((t) => t + 1);
          break;
        case 'escape':
          e.preventDefault();
          handleClearSelection();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClearSelection]);

  // Toolbar actions
  const handleAutoArrange = useCallback(() => {
    setAutoArrangeTrigger((t) => t + 1);
  }, []);

  const handleFitView = useCallback(() => {
    setFitViewTrigger((t) => t + 1);
  }, []);

  const handleRefresh = useCallback(async () => {
    await fetchTopology();
  }, [fetchTopology]);

  const handleExport = useCallback(() => {
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
    link.download = `${environment?.name || 'environment'}-${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [environment?.name]);

  // Loading state
  if (loading || !environment) {
    return (
      <div className="h-screen premium-canvas-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col premium-canvas-bg" data-testid="env-canvas">
      {/* Premium Toolbar */}
      <PremiumToolbar
        environmentName={environment.name}
        environmentType={environment.type}
        lastIngestion={null}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        saveStatus={saveStatus}
        autosaveEnabled={autosaveEnabled}
        onAutosaveToggle={() => setAutosaveEnabled(!autosaveEnabled)}
        onManualSave={handleManualSave}
        snapshots={snapshots}
        currentSnapshotId={currentSnapshotId}
        compareSnapshotId={compareSnapshotId}
        onSnapshotSelect={setCurrentSnapshotId}
        onCompareSelect={setCompareSnapshotId}
        activeOverlays={activeOverlays}
        onOverlayToggle={handleOverlayToggle}
        onAutoArrange={handleAutoArrange}
        onFitView={handleFitView}
        onExport={handleExport}
        onRefresh={handleRefresh}
        onSearch={handleSearch}
        onSearchSelect={handleSearchSelect}
        nodeCount={topologyData?.nodes.length || 0}
        edgeCount={topologyData?.edges.length || 0}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Inspector Panel */}
        <InspectorPanel
          isOpen={inspectorOpen}
          onToggle={() => setInspectorOpen(!inspectorOpen)}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onClearSelection={handleClearSelection}
        />

        {/* Canvas / Content */}
        <div
          className={`flex-1 transition-all duration-300 ${inspectorOpen ? 'ml-80' : 'ml-0'}`}
        >
          {viewMode === 'graph' && topologyData ? (
            <ReactFlowProvider>
              <PremiumGraphView
                initialNodes={topologyData.nodes}
                initialEdges={topologyData.edges}
                savedNodes={savedDiagram?.nodes}
                savedEdges={savedDiagram?.edges}
                analysis={topologyData.analysis}
                environmentId={id}
                activeOverlays={activeOverlays}
                highlightedNodeId={highlightedNodeId}
                onNodesChange={handleNodesChange}
                onPositionChange={handlePositionChange}
                onNodeSelect={handleNodeSelect}
                onEdgeSelect={handleEdgeSelect}
                fitViewTrigger={fitViewTrigger}
                autoArrangeTrigger={autoArrangeTrigger}
              />
            </ReactFlowProvider>
          ) : viewMode === 'table' && topologyData ? (
            <div className="h-full overflow-auto p-4">
              <EnvironmentTableView
                nodes={topologyData.nodes}
                edges={topologyData.edges}
                onNodeClick={(nodeId) => handleNodeSelect(nodeId)}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            </div>
          )}
        </div>
      </div>

      {/* Footer status bar */}
      <div className="px-4 py-1.5 border-t border-white/5 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {compareSnapshotId && (
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Compare mode active
            </span>
          )}
          {activeOverlays.size > 0 && (
            <span>
              Overlays: {Array.from(activeOverlays).join(', ')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="kbd-hint">F</span>
          <span>Fit view</span>
          <span className="kbd-hint">/</span>
          <span>Search</span>
          <span className="kbd-hint">ESC</span>
          <span>Clear</span>
        </div>
      </div>
    </div>
  );
}
