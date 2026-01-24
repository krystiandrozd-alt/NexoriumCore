'use client';

// TelEnvIQ - Cost & Budget Overview Dashboard

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  DollarSign,
  Building2,
  Server,
  Cloud,
  Plus,
  RefreshCw,
  Loader2,
  Calculator,
  Settings,
  ArrowRight,
  PieChart,
} from 'lucide-react';
import type { CostModel, CostRollup, EnvironmentCostSummary } from '@/types/cost';
import { formatCurrency, formatNumber } from '@/lib/utils/cost';

export default function CostOverviewPage() {
  const [costModels, setCostModels] = useState<CostModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [rollups, setRollups] = useState<CostRollup | null>(null);
  const [environments, setEnvironments] = useState<EnvironmentCostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [computeLoading, setComputeLoading] = useState(false);

  // Fetch cost models on mount
  useEffect(() => {
    fetchCostModels();
  }, []);

  const fetchCostModels = async () => {
    try {
      const response = await fetch('/api/cost-models');
      const result = await response.json();
      if (result.success) {
        setCostModels(result.data);
        if (result.data.length > 0) {
          setSelectedModelId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch cost models:', error);
    } finally {
      setLoading(false);
    }
  };

  const computeCosts = useCallback(async () => {
    if (!selectedModelId) return;

    setComputeLoading(true);
    try {
      // Fetch rollups
      const rollupsResponse = await fetch('/api/cost/rollups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ costModelId: selectedModelId }),
      });
      const rollupsResult = await rollupsResponse.json();
      if (rollupsResult.success) {
        setRollups(rollupsResult.data);
      }

      // Fetch environment costs
      const computeResponse = await fetch('/api/cost/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ costModelId: selectedModelId }),
      });
      const computeResult = await computeResponse.json();
      if (computeResult.success) {
        setEnvironments(computeResult.data.environments);
      }
    } catch (error) {
      console.error('Failed to compute costs:', error);
    } finally {
      setComputeLoading(false);
    }
  }, [selectedModelId]);

  // Compute costs when model changes
  useEffect(() => {
    if (selectedModelId) {
      computeCosts();
    }
  }, [selectedModelId, computeCosts]);

  const selectedModel = costModels.find(m => m.id === selectedModelId);

  // Calculate family distribution for chart
  const familyData = rollups ? Object.entries(rollups.byFamily).map(([family, data]) => ({
    family,
    total: data.total,
    count: data.count,
    percentage: rollups.totalCost > 0 ? (data.total / rollups.totalCost) * 100 : 0,
  })).sort((a, b) => b.total - a.total) : [];

  const stageData = rollups ? Object.entries(rollups.byStage).map(([stage, data]) => ({
    stage,
    total: data.total,
    count: data.count,
  })).sort((a, b) => b.total - a.total) : [];

  const familyColors: Record<string, string> = {
    CPQ: 'bg-indigo-500',
    CRM: 'bg-blue-500',
    BILLING: 'bg-emerald-500',
    ITSM: 'bg-purple-500',
    SOM: 'bg-amber-500',
    INVENTORY: 'bg-cyan-500',
    OSS: 'bg-orange-500',
    OTHER: 'bg-slate-400',
  };

  const stageColors: Record<string, string> = {
    DEV: 'bg-slate-100 text-slate-700',
    SIT: 'bg-blue-100 text-blue-700',
    UAT: 'bg-purple-100 text-purple-700',
    NFT: 'bg-amber-100 text-amber-700',
    PREPROD: 'bg-emerald-100 text-emerald-700',
    PROD_RO: 'bg-red-100 text-red-700',
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cost & Budget</h1>
          <p className="text-slate-500 mt-1">
            Monitor and simulate non-production environment costs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/cost/simulator">
            <Button variant="outline">
              <Calculator className="h-4 w-4 mr-2" />
              What-if Simulator
            </Button>
          </Link>
          <Link href="/dashboard/cost/models">
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Cost Models
            </Button>
          </Link>
        </div>
      </div>

      {/* Cost Model Selector */}
      {costModels.length > 0 ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Active Cost Model
                </label>
                <Select
                  options={costModels.map(m => ({ value: m.id, label: m.name }))}
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full sm:w-64"
                />
              </div>
              {selectedModel && (
                <div className="text-sm text-slate-500">
                  <span className="font-medium">{selectedModel.currency}</span> | {selectedModel.period}
                </div>
              )}
              <Button
                variant="outline"
                onClick={computeCosts}
                disabled={computeLoading}
              >
                <RefreshCw className={`h-4 w-4 ${computeLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No cost models yet</h3>
              <p className="text-slate-500 mb-6">
                Create a cost model to start tracking environment costs
              </p>
              <Link href="/dashboard/cost/models">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Cost Model
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      {rollups && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Monthly Cost</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {formatCurrency(rollups.totalCost, rollups.currency)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-3">
                Across {rollups.environmentCount} environment{rollups.environmentCount !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Avg. per Environment</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {formatCurrency(
                      rollups.environmentCount > 0
                        ? rollups.totalCost / rollups.environmentCount
                        : 0,
                      rollups.currency
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-3">
                Per environment/month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Top Family</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {familyData[0]?.family || '-'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-3">
                {familyData[0] ? `${formatNumber(familyData[0].percentage)}% of total` : 'No data'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Hosting Split</p>
                  <div className="flex gap-2 mt-1">
                    {Object.entries(rollups.byHostingType).slice(0, 2).map(([type, data]) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}: {formatNumber((data.total / rollups.totalCost) * 100)}%
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Cloud className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-3">
                Cloud vs On-Prem distribution
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cost Distribution */}
      {rollups && familyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Family */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cost by Environment Family</CardTitle>
              <CardDescription>Distribution across system families (CPQ, ITSM, etc.)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {familyData.map(({ family, total, count, percentage }) => (
                  <div key={family}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded ${familyColors[family] || familyColors.OTHER}`} />
                        <span className="font-medium text-slate-700">{family}</span>
                        <span className="text-slate-400 text-sm">({count} env{count !== 1 ? 's' : ''})</span>
                      </div>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(total, rollups.currency)}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${familyColors[family] || familyColors.OTHER}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By Stage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cost by Environment Stage</CardTitle>
              <CardDescription>Distribution across DEV, SIT, UAT, etc.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stageData.map(({ stage, total, count }) => (
                  <div key={stage} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={stageColors[stage] || 'bg-slate-100 text-slate-700'}>
                        {stage}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        {count} environment{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(total, rollups.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Environments Table */}
      {environments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Environment Costs</CardTitle>
                <CardDescription>Detailed breakdown per environment</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Environment</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Family</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Stage</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Hosting</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Monthly Cost</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {environments.map((env) => (
                    <tr key={env.environmentId} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-900">{env.environmentName}</span>
                          {env.isOverride && (
                            <Badge variant="outline" className="text-xs">Override</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${familyColors[env.family] || familyColors.OTHER} text-white text-xs`}>
                          {env.family}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={stageColors[env.environmentType] || 'bg-slate-100 text-slate-700'}>
                          {env.environmentType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{env.hostingType}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        {formatCurrency(env.totalCost, env.currency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/dashboard/cost/environments/${env.environmentId}`}>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
