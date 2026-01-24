'use client';

// TelEnvIQ - Dashboard Overview Page

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Network,
  Database,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Plus,
  Loader2,
} from 'lucide-react';
import type { Environment } from '@/types';

interface EnvironmentWithCounts extends Environment {
  _count?: {
    nodes: number;
    edges: number;
  };
}

export default function DashboardPage() {
  const [environments, setEnvironments] = useState<EnvironmentWithCounts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnvironments();
  }, []);

  async function fetchEnvironments() {
    try {
      const response = await fetch('/api/environments');
      const result = await response.json();
      if (result.success) {
        setEnvironments(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch environments:', error);
    } finally {
      setLoading(false);
    }
  }

  const typeColors: Record<string, string> = {
    SIT: 'bg-blue-100 text-blue-800',
    UAT: 'bg-purple-100 text-purple-800',
    NFT: 'bg-amber-100 text-amber-800',
    PREPROD: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Monitor your test environments and data lifecycle
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchEnvironments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/dashboard/environments/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Environment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Environments
            </CardTitle>
            <Network className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {loading ? '-' : environments.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Across all environment types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Components
            </CardTitle>
            <Database className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {loading
                ? '-'
                : environments.reduce((acc, env) => acc + (env._count?.nodes || 0), 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Services, databases, and integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Attention Required
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">-</div>
            <p className="text-xs text-slate-500 mt-1">
              Stale data or topology issues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Environments List */}
      <Card>
        <CardHeader>
          <CardTitle>Environments</CardTitle>
          <CardDescription>
            Your test environment topology overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : environments.length === 0 ? (
            <div className="text-center py-12">
              <Network className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No environments yet
              </h3>
              <p className="text-slate-500 mb-6">
                Create your first environment to start discovering and mapping your topology.
              </p>
              <Link href="/dashboard/environments/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Environment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {environments.map((env) => (
                <Link
                  key={env.id}
                  href={`/dashboard/environments/${env.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Network className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {env.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className={typeColors[env.type]}
                          >
                            {env.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          {env._count?.nodes || 0} nodes · {env._count?.edges || 0} edges
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Import Topology</CardTitle>
            <CardDescription>
              Discover and import environment topology from various sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M128 0C57.31 0 0 57.31 0 128c0 70.69 57.31 128 128 128 70.69 0 128-57.31 128-128C256 57.31 198.69 0 128 0zm81.94 173.33c-8.22 18.84-20.27 35.74-35.86 50.14-15.59 14.4-33.84 25.7-54.08 33.46V128L128 0c47.76 1.52 90.24 27.72 113.15 68.85 9.27 16.64 15.53 35.01 18.35 54.28 2.82 19.27 2.09 38.96-2.13 57.61a165.58 165.58 0 0 1-13.43 35.59z" />
                </svg>
                Kubernetes Discovery
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.476 14.902l-3.988 2.39c-.063.037-.133.058-.206.058-.073 0-.143-.021-.206-.058l-3.988-2.39c-.165-.099-.288-.286-.288-.498v-4.808c0-.212.123-.399.288-.498l3.988-2.39c.126-.075.286-.075.412 0l3.988 2.39c.165.099.288.286.288.498v4.808c0 .212-.123.399-.288.498z" />
                </svg>
                GitOps Import
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Database className="h-4 w-4 mr-2" />
                Manual YAML Import
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>
              Latest changes and discoveries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <p>No recent activity</p>
              <p className="text-sm">Activity will appear here once you start using TelEnvIQ</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
