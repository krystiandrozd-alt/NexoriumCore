'use client';

// Nexorium Core - Environment Architecture View (5-Layer Model)
// Architecture-aware visualization with layer/capability editing

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Layers,
  Settings,
  Loader2,
  Edit2,
} from 'lucide-react';
import ComponentEditModal from '@/components/dashboard/ComponentEditModal';
import EntryPointSelector from '@/components/dashboard/EntryPointSelector';
import type {
  Environment,
  Graph5LayerNode,
  Graph5LayerEdge,
  GraphAnalysisResult,
  ArchitectureLayer,
  CapabilityType,
} from '@/types';

// Dynamically import the 5-layer graph component (client-only)
const Topology5LayerGraph = dynamic(
  () => import('@/components/graph/Topology5LayerGraph'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] flex items-center justify-center bg-slate-50 rounded-lg">
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

export default function ArchitecturePage() {
  const params = useParams();
  const id = params.id as string;
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [topologyData, setTopologyData] = useState<TopologyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(false);
  const [showInfra, setShowInfra] = useState(true);

  // Component edit modal state
  const [editingComponent, setEditingComponent] = useState<{
    id: string;
    name: string;
    layer: ArchitectureLayer;
    capabilityType: CapabilityType;
  } | null>(null);

  const fetchEnvironment = useCallback(async () => {
    try {
      const response = await fetch(`/api/environments/${id}`);
      const result = await response.json();
      if (result.success) {
        setEnvironment(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch environment:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTopology = useCallback(async () => {
    setGraphLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('showInfra', String(showInfra));

      const response = await fetch(`/api/environments/${id}/topology5?${params}`);
      const result = await response.json();
      if (result.success) {
        setTopologyData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch 5-layer topology:', error);
    } finally {
      setGraphLoading(false);
    }
  }, [id, showInfra]);

  useEffect(() => {
    if (!id) return;
    fetchEnvironment();
    fetchTopology();
  }, [id, fetchEnvironment, fetchTopology]);

  const handleShowInfraChange = useCallback((show: boolean) => {
    setShowInfra(show);
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    // Find the component from the topology data
    const node = topologyData?.nodes.find((n) => n.id === nodeId);
    if (node) {
      // Fetch full component data
      // For now, use the data from the node
      setEditingComponent({
        id: nodeId, // This is actually componentInstanceId, we'd need to fetch componentId
        name: node.data.componentName,
        layer: node.data.layer,
        capabilityType: node.data.capabilityType,
      });
    }
  }, [topologyData]);

  const typeColors: Record<string, string> = {
    DEV: 'bg-slate-100 text-slate-800',
    SIT: 'bg-blue-100 text-blue-800',
    UAT: 'bg-purple-100 text-purple-800',
    NFT: 'bg-amber-100 text-amber-800',
    PREPROD: 'bg-emerald-100 text-emerald-800',
    PROD_RO: 'bg-red-100 text-red-800',
  };

  if (!id || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!environment) {
    return (
      <div className="text-center py-24">
        <h2 className="text-lg font-medium text-slate-900">Environment not found</h2>
        <Link href="/dashboard/environments" className="text-indigo-600 mt-2 inline-block">
          Back to environments
        </Link>
      </div>
    );
  }

  const componentInstances = topologyData?.nodes.map((n) => ({
    id: n.id,
    displayName: n.data.label,
    componentName: n.data.componentName,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href={`/dashboard/environments/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{environment.name}</h1>
              <Badge variant="secondary" className={typeColors[environment.type]}>
                {environment.type}
              </Badge>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <Layers className="h-3 w-3 mr-1" />
                Architecture View
              </Badge>
            </div>
            {environment.description && (
              <p className="text-slate-500 mt-1">{environment.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/environments/${id}`}>
            <Button variant="outline">
              Standard View
            </Button>
          </Link>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Stats by Layer */}
      {topologyData && (
        <div className="grid grid-cols-5 gap-4">
          {(['BSS', 'OSS', 'INFRA', 'EXTERNAL', 'UNKNOWN'] as ArchitectureLayer[]).map((layer) => {
            const count = topologyData.meta.nodesByLayer[layer] || 0;
            const colors: Record<ArchitectureLayer, string> = {
              BSS: 'bg-blue-50 border-blue-200 text-blue-700',
              OSS: 'bg-amber-50 border-amber-200 text-amber-700',
              INFRA: 'bg-slate-50 border-slate-200 text-slate-700',
              EXTERNAL: 'bg-green-50 border-green-200 text-green-700',
              UNKNOWN: 'bg-gray-50 border-gray-200 text-gray-700',
            };

            return (
              <Card key={layer} className={`border ${colors[layer]}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase">{layer}</span>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Graph */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Architecture Topology</CardTitle>
              <CardDescription>
                5-layer model visualization with entry/exit detection and layer-based layout
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px] border-t border-slate-200">
                {topologyData ? (
                  <Topology5LayerGraph
                    initialNodes={topologyData.nodes}
                    initialEdges={topologyData.edges}
                    analysis={topologyData.analysis}
                    environmentId={id}
                    onRefresh={fetchTopology}
                    loading={graphLoading}
                    showInfra={showInfra}
                    onShowInfraChange={handleShowInfraChange}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Entry/Exit Selector */}
          <EntryPointSelector
            environmentId={id}
            componentInstances={componentInstances}
            analysis={topologyData?.analysis || null}
            currentEntryOverride={topologyData?.meta.entryOverride || null}
            currentExitOverride={topologyData?.meta.exitOverride || null}
            onUpdate={fetchTopology}
          />

          {/* Component List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Components</CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-[300px] overflow-y-auto">
              <div className="space-y-1">
                {topologyData?.nodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node.id)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 flex items-center justify-between group"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">
                        {node.data.label}
                      </div>
                      <div className="text-xs text-slate-500">
                        {node.data.layer} / {node.data.capabilityType}
                      </div>
                    </div>
                    <Edit2 className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
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
