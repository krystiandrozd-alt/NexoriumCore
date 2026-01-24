'use client';

// TelEnvIQ - Executive Dashboard
// High-level metrics and KPIs

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarHeader } from '@/components/navigation';
import {
  LayoutDashboard,
  Loader2,
  Server,
  GitBranch,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

interface DashboardMetrics {
  totalEnvironments: number;
  totalComponents: number;
  totalConnections: number;
  healthyEnvironments: number;
  governanceScore: number;
  activeAlerts: number;
  recentChanges: number;
  stabilityTrend: 'up' | 'down' | 'stable';
}

export default function InsightDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      const response = await fetch('/api/insight/dashboard');
      const result = await response.json();
      if (result.success) {
        setMetrics(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  // Default metrics if API doesn't return data
  const displayMetrics = metrics || {
    totalEnvironments: 5,
    totalComponents: 156,
    totalConnections: 342,
    healthyEnvironments: 4,
    governanceScore: 87,
    activeAlerts: 3,
    recentChanges: 12,
    stabilityTrend: 'up' as const,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PillarHeader
        title="Executive Dashboard"
        description="High-level overview of environment health and governance"
        icon={LayoutDashboard}
        iconColor="text-indigo-600"
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Server className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {displayMetrics.totalEnvironments}
                </p>
                <p className="text-xs text-slate-500">Environments</p>
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
                  {displayMetrics.totalComponents}
                </p>
                <p className="text-xs text-slate-500">Components</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {displayMetrics.healthyEnvironments}/{displayMetrics.totalEnvironments}
                </p>
                <p className="text-xs text-slate-500">Healthy</p>
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
                  {displayMetrics.activeAlerts}
                </p>
                <p className="text-xs text-slate-500">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Governance and Stability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Governance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="#6366f1"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${displayMetrics.governanceScore * 2.64} 264`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {displayMetrics.governanceScore}%
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-2">
                  Overall governance compliance across all environments
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Blueprint Alignment</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Version Compliance</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Policy Adherence</span>
                    <span className="font-medium">84%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Stability Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-12 w-12 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-2">
                  Environment stability trending upward over the last 30 days
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recent Changes</span>
                    <span className="font-medium">{displayMetrics.recentChanges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Drift Events</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Avg. Recovery Time</span>
                    <span className="font-medium">4.2h</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
