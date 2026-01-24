'use client';

// TelEnvIQ - Environment Cost Detail Page

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  DollarSign,
  ArrowLeft,
  Loader2,
  Save,
  RefreshCw,
  Server,
  Tag,
  Share2,
  MoreHorizontal,
  Edit,
  History,
} from 'lucide-react';
import type { CostModel, EnvironmentCostSummary, EnvironmentCostOverride, EnvironmentCostAllocation } from '@/types/cost';
import { formatCurrency, formatCurrencyPrecise, getCostItemTypeLabel, getAllocationMethodLabel } from '@/lib/utils/cost';
import { formatRelativeTime } from '@/lib/utils';

interface EnvironmentCostData {
  environment: {
    id: string;
    name: string;
    type: string;
  };
  override: EnvironmentCostOverride | null;
  allocations: EnvironmentCostAllocation[];
  currentCost: EnvironmentCostSummary | null;
}

export default function EnvironmentCostDetailPage() {
  const params = useParams();
  const envId = params.id as string;

  const [data, setData] = useState<EnvironmentCostData | null>(null);
  const [costModels, setCostModels] = useState<CostModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);

  // Override form
  const [editingOverride, setEditingOverride] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    currency: 'USD',
    fixedMonthlyCost: '',
    notes: '',
  });
  const [savingOverride, setSavingOverride] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const modelIdParam = selectedModelId ? `?costModelId=${selectedModelId}` : '';
      const response = await fetch(`/api/environments/${envId}/cost${modelIdParam}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        if (result.data.override) {
          setOverrideForm({
            currency: result.data.override.currency,
            fixedMonthlyCost: result.data.override.fixedMonthlyCost?.toString() || '',
            notes: result.data.override.notes || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch environment cost:', error);
    } finally {
      setLoading(false);
    }
  }, [envId, selectedModelId]);

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
    }
  };

  useEffect(() => {
    fetchCostModels();
  }, []);

  useEffect(() => {
    if (selectedModelId) {
      fetchData();
    }
  }, [selectedModelId, fetchData]);

  const recalculate = async () => {
    setComputing(true);
    await fetchData();
    setComputing(false);
  };

  const saveOverride = async () => {
    setSavingOverride(true);
    try {
      const response = await fetch(`/api/environments/${envId}/cost`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: overrideForm.currency,
          fixedMonthlyCost: overrideForm.fixedMonthlyCost ? parseFloat(overrideForm.fixedMonthlyCost) : null,
          notes: overrideForm.notes || null,
          editedBy: 'user', // TODO: Get from auth context
        }),
      });
      if (response.ok) {
        setEditingOverride(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to save override:', error);
    } finally {
      setSavingOverride(false);
    }
  };

  const clearOverride = async () => {
    try {
      await fetch(`/api/environments/${envId}/cost`, {
        method: 'DELETE',
      });
      setOverrideForm({
        currency: 'USD',
        fixedMonthlyCost: '',
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Failed to clear override:', error);
    }
  };

  const itemTypeIcons: Record<string, React.ReactNode> = {
    HOST: <Server className="h-4 w-4" />,
    COMPONENT_LICENSE: <Tag className="h-4 w-4" />,
    SHARED_PLATFORM: <Share2 className="h-4 w-4" />,
    OTHER: <MoreHorizontal className="h-4 w-4" />,
  };

  const itemTypeColors: Record<string, string> = {
    HOST: 'bg-blue-100 text-blue-700',
    COMPONENT_LICENSE: 'bg-purple-100 text-purple-700',
    SHARED_PLATFORM: 'bg-amber-100 text-amber-700',
    OTHER: 'bg-slate-100 text-slate-700',
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

  if (!data) {
    return (
      <div className="text-center py-24">
        <h2 className="text-xl font-semibold text-slate-900">Environment not found</h2>
        <Link href="/dashboard/cost">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cost Overview
          </Button>
        </Link>
      </div>
    );
  }

  const selectedModel = costModels.find(m => m.id === selectedModelId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cost">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{data.environment.name}</h1>
              <Badge className={stageColors[data.environment.type] || 'bg-slate-100 text-slate-700'}>
                {data.environment.type}
              </Badge>
            </div>
            <p className="text-slate-500 mt-1">Environment Cost Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={costModels.map(m => ({ value: m.id, label: m.name }))}
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="w-48"
          />
          <Button variant="outline" onClick={recalculate} disabled={computing}>
            <RefreshCw className={`h-4 w-4 ${computing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Monthly Cost</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {data.currentCost
                    ? formatCurrency(data.currentCost.totalCost, data.currentCost.currency)
                    : '-'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            {data.currentCost?.isOverride && (
              <Badge className="mt-2 bg-amber-100 text-amber-700">Override Active</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Cost Items</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {data.currentCost?.breakdown.length || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Tag className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {selectedModel?.name || 'No model selected'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Family</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {data.currentCost?.family || '-'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Server className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Hosting: {data.currentCost?.hostingType || '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Override Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Cost Override</CardTitle>
              <CardDescription>
                Set a fixed monthly cost to override the calculated amount
              </CardDescription>
            </div>
            {!editingOverride && (
              <Button variant="outline" onClick={() => setEditingOverride(true)}>
                <Edit className="h-4 w-4 mr-2" />
                {data.override ? 'Edit Override' : 'Add Override'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingOverride ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    Currency
                  </label>
                  <Select
                    options={[
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'EUR', label: 'EUR' },
                      { value: 'GBP', label: 'GBP' },
                      { value: 'NOK', label: 'NOK' },
                    ]}
                    value={overrideForm.currency}
                    onChange={(e) => setOverrideForm({ ...overrideForm, currency: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    Fixed Monthly Cost
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={overrideForm.fixedMonthlyCost}
                    onChange={(e) => setOverrideForm({ ...overrideForm, fixedMonthlyCost: e.target.value })}
                    placeholder="Leave empty to clear"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    Notes
                  </label>
                  <Input
                    value={overrideForm.notes}
                    onChange={(e) => setOverrideForm({ ...overrideForm, notes: e.target.value })}
                    placeholder="Reason for override"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                {data.override && (
                  <Button variant="ghost" className="text-red-600" onClick={clearOverride}>
                    Clear Override
                  </Button>
                )}
                <Button variant="outline" onClick={() => setEditingOverride(false)}>
                  Cancel
                </Button>
                <Button onClick={saveOverride} disabled={savingOverride}>
                  {savingOverride ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Override
                </Button>
              </div>
            </div>
          ) : data.override ? (
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">
                  Fixed: {formatCurrency(Number(data.override.fixedMonthlyCost), data.override.currency)}
                </p>
                {data.override.notes && (
                  <p className="text-sm text-slate-500 mt-1">{data.override.notes}</p>
                )}
                {data.override.editedBy && (
                  <p className="text-xs text-slate-400 mt-2">
                    Set by {data.override.editedBy} {data.override.editedAt && `on ${formatRelativeTime(data.override.editedAt)}`}
                  </p>
                )}
              </div>
              <Badge className="bg-amber-100 text-amber-700">Active</Badge>
            </div>
          ) : (
            <p className="text-slate-500 py-4">
              No override set. Cost is calculated from the selected cost model.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      {data.currentCost && data.currentCost.breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cost Breakdown</CardTitle>
            <CardDescription>
              Detailed line items from {selectedModel?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Item</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Quantity</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Unit Cost</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Allocation</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.currentCost.breakdown.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <Badge className={itemTypeColors[item.itemType] || itemTypeColors.OTHER}>
                          <span className="mr-1">{itemTypeIcons[item.itemType]}</span>
                          {getCostItemTypeLabel(item.itemType)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900">{item.itemName}</span>
                        {item.notes && (
                          <p className="text-xs text-slate-500 mt-1">{item.notes}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {item.quantity.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {formatCurrencyPrecise(item.unitCost, data.currentCost!.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={item.allocationMethod === 'DIRECT' ? 'default' : 'secondary'}>
                          {getAllocationMethodLabel(item.allocationMethod)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        {formatCurrency(item.totalCost, data.currentCost!.currency)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50">
                    <td colSpan={5} className="py-3 px-4 text-right font-semibold text-slate-900">
                      Total Monthly Cost
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-indigo-600 text-lg">
                      {formatCurrency(data.currentCost.totalCost, data.currentCost.currency)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Allocations */}
      {data.allocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5" />
              Allocation History
            </CardTitle>
            <CardDescription>
              Previously computed cost allocations for this environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.allocations.slice(0, 5).map((allocation) => (
                <div key={allocation.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">
                      {allocation.costModel?.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(allocation.periodStart).toLocaleDateString()} - {new Date(allocation.periodEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(Number(allocation.totalCost), allocation.currency)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatRelativeTime(allocation.computedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
