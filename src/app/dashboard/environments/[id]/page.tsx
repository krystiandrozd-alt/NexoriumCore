'use client';

// TelEnvIQ - Environment Detail Page with Topology Graph

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Camera,
  Upload,
  Settings,
  Loader2,
  Server,
  Database,
  GitBranch,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import type { Environment, GraphNode, GraphEdge, GraphFilters, EnvironmentStats } from '@/types';

// Dynamically import the graph component (client-only)
const TopologyGraph = dynamic(
  () => import('@/components/graph/TopologyGraph'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] flex items-center justify-center bg-slate-50 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    ),
  }
);

export default function EnvironmentPage() {
  // Use useParams hook to get the ID - this properly handles Next.js 14.2+ async params
  const params = useParams();
  const id = params.id as string;
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [stats, setStats] = useState<EnvironmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(false);

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

  const fetchTopology = useCallback(async (filters?: GraphFilters) => {
    setGraphLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.owner) params.append('owner', filters.owner);
      if (filters?.protocol) params.append('protocol', filters.protocol);
      if (filters?.nodeType) params.append('nodeType', filters.nodeType);
      if (filters?.showStale !== undefined) params.append('showStale', String(filters.showStale));
      if (filters?.minConfidence) params.append('minConfidence', String(filters.minConfidence));

      const response = await fetch(`/api/environments/${id}/topology?${params}`);
      const result = await response.json();
      if (result.success) {
        setGraphNodes(result.data.nodes);
        setGraphEdges(result.data.edges);
      }
    } catch (error) {
      console.error('Failed to fetch topology:', error);
    } finally {
      setGraphLoading(false);
    }
  }, [id]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/environments/${id}/stats`);
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [id]);

  useEffect(() => {
    // Guard against undefined id during initial render
    if (!id) return;
    fetchEnvironment();
    fetchTopology();
    fetchStats();
  }, [id, fetchEnvironment, fetchTopology, fetchStats]);

  const handleFilterChange = useCallback((filters: GraphFilters) => {
    fetchTopology(filters);
  }, [fetchTopology]);

  const handleCreateSnapshot = async () => {
    try {
      const response = await fetch('/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environmentId: id }),
      });
      const result = await response.json();
      if (result.success) {
        alert('Snapshot created successfully!');
      }
    } catch (error) {
      console.error('Failed to create snapshot:', error);
    }
  };

  const typeColors: Record<string, string> = {
    DEV: 'bg-slate-100 text-slate-800',
    SIT: 'bg-blue-100 text-blue-800',
    UAT: 'bg-purple-100 text-purple-800',
    NFT: 'bg-amber-100 text-amber-800',
    PREPROD: 'bg-emerald-100 text-emerald-800',
    PROD_RO: 'bg-red-100 text-red-800',
  };

  // Show loading while id is not ready or while fetching
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/environments">
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
            </div>
            {environment.description && (
              <p className="text-slate-500 mt-1">{environment.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/environments/${id}/architecture`}>
            <Button variant="outline">
              <Layers className="h-4 w-4 mr-2" />
              Architecture View
            </Button>
          </Link>
          <Button variant="outline" onClick={handleCreateSnapshot}>
            <Camera className="h-4 w-4 mr-2" />
            Snapshot
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Server className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats?.totalNodes || 0}
                </p>
                <p className="text-xs text-slate-500">Total Nodes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats?.totalEdges || 0}
                </p>
                <p className="text-xs text-slate-500">Integrations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Database className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats?.databaseCount || 0}
                </p>
                <p className="text-xs text-slate-500">Databases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats?.datasetsNeedingRefresh || 0}
                </p>
                <p className="text-xs text-slate-500">Stale Data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topology Graph */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Environment Topology</CardTitle>
          <CardDescription>
            Interactive visualization of services, databases, and their integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] border-t border-slate-200">
            <TopologyGraph
              initialNodes={graphNodes}
              initialEdges={graphEdges}
              environmentId={id}
              onRefresh={() => fetchTopology()}
              onFilterChange={handleFilterChange}
              loading={graphLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Node Type Distribution */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Node Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.nodesByType)
                  .filter(([, count]) => count > 0)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{type}</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 bg-indigo-500 rounded"
                          style={{
                            width: `${(count / stats.totalNodes) * 100}px`,
                          }}
                        />
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Protocol Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.edgesByProtocol)
                  .filter(([, count]) => count > 0)
                  .map(([protocol, count]) => (
                    <div key={protocol} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{protocol}</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 bg-blue-500 rounded"
                          style={{
                            width: `${(count / stats.totalEdges) * 100}px`,
                          }}
                        />
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
