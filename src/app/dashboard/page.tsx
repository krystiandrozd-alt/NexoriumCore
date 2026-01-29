'use client';

// Nexorium Core - Dashboard Overview Page
// Premium dark theme

import { useState, useEffect, useCallback } from 'react';
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
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { DashboardFullscreenWrapper } from '@/components/dashboard';
import type { Environment } from '@/types';

interface EnvironmentWithCounts extends Environment {
  _count?: {
    nodes: number;
    edges: number;
  };
}

const typeColors: Record<string, string> = {
  DEV: 'bg-[#5B5FEF]/15 text-[#A5B4FC] border-[#5B5FEF]/30',
  SIT: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  UAT: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  NFT: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  PREPROD: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  PROD_RO: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export default function DashboardPage() {
  const [environments, setEnvironments] = useState<EnvironmentWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // ESC to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

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

  return (
    <DashboardFullscreenWrapper isFullscreen={isFullscreen}>
      <div className={isFullscreen ? 'p-6 lg:p-8 space-y-8' : 'space-y-8'}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Monitor your test environments and data lifecycle
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleFullscreenToggle}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-fade">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Environments
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-[#5B5FEF]/15 flex items-center justify-center">
                <Network className="h-5 w-5 text-[#A5B4FC]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {loading ? '-' : environments.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Across all environment types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Components
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Database className="h-5 w-5 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
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
              <CardTitle className="text-sm font-medium text-slate-400">
                Attention Required
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">-</div>
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
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              </div>
            ) : environments.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
                  <Network className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No environments yet
                </h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
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
              <div className="space-y-3">
                {environments.map((env, index) => (
                  <Link
                    key={env.id}
                    href={`/dashboard/environments/${env.id}`}
                    className="block animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-200 group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-[#5B5FEF]/15 flex items-center justify-center group-hover:bg-[#5B5FEF]/25 transition-colors">
                          <Network className="h-5 w-5 text-[#A5B4FC]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
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
                      <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
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
              <div className="text-center py-8">
                <p className="text-slate-400">No recent activity</p>
                <p className="text-sm text-slate-500 mt-1">Activity will appear here once you start using Nexorium Core</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardFullscreenWrapper>
  );
}
