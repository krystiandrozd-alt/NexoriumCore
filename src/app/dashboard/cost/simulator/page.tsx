'use client';

// Nexorium Core - What-if Cost Simulator

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Plus,
  Minus,
  Play,
  Save,
  Loader2,
  DollarSign,
  Server,
  RefreshCw,
  Check,
  History,
} from 'lucide-react';
import type { CostModel, SimulationResult, CostSimulation, SimulationParams } from '@/types/cost';
import { formatCurrency, getChangeColor, formatChange } from '@/lib/utils/cost';

export default function CostSimulatorPage() {
  const [costModels, setCostModels] = useState<CostModel[]>([]);
  const [savedSimulations, setSavedSimulations] = useState<CostSimulation[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulation form
  const [selectedModelId, setSelectedModelId] = useState('');
  const [addEnvCount, setAddEnvCount] = useState(0);
  const [envFamily, setEnvFamily] = useState('');
  const [envStage, setEnvStage] = useState('');
  const [scalingFactor, setScalingFactor] = useState(1);

  // Results
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);

  // Save modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modelsRes, simulationsRes] = await Promise.all([
        fetch('/api/cost-models'),
        fetch('/api/cost/simulations'),
      ]);
      const [modelsData, simulationsData] = await Promise.all([
        modelsRes.json(),
        simulationsRes.json(),
      ]);

      if (modelsData.success) {
        setCostModels(modelsData.data);
        if (modelsData.data.length > 0) {
          setSelectedModelId(modelsData.data[0].id);
        }
      }
      if (simulationsData.success) {
        setSavedSimulations(simulationsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    if (!selectedModelId) return;

    setRunning(true);
    try {
      const response = await fetch('/api/cost/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseCostModelId: selectedModelId,
          addEnvCount: addEnvCount > 0 ? addEnvCount : undefined,
          envFamily: envFamily || undefined,
          envStage: envStage || undefined,
          scalingFactor: scalingFactor !== 1 ? scalingFactor : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data.result);
      }
    } catch (error) {
      console.error('Failed to run simulation:', error);
    } finally {
      setRunning(false);
    }
  };

  const saveSimulation = async () => {
    if (!result || !saveName) return;

    setSaving(true);
    try {
      const response = await fetch('/api/cost/simulations?save=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName,
          description: saveDescription,
          baseCostModelId: selectedModelId,
          addEnvCount: addEnvCount > 0 ? addEnvCount : undefined,
          envFamily: envFamily || undefined,
          envStage: envStage || undefined,
          scalingFactor: scalingFactor !== 1 ? scalingFactor : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSavedSimulations([data.data.simulation, ...savedSimulations]);
        setSaveModalOpen(false);
        setSaveName('');
        setSaveDescription('');
      }
    } catch (error) {
      console.error('Failed to save simulation:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadSimulation = (sim: CostSimulation) => {
    const params = sim.paramsJson as SimulationParams;
    setSelectedModelId(params.baseCostModelId);
    setAddEnvCount(params.addEnvCount || 0);
    setEnvFamily(params.envFamily || '');
    setEnvStage(params.envStage || '');
    setScalingFactor(params.scalingFactor || 1);
    setResult(sim.resultJson as unknown as SimulationResult);
  };

  const resetForm = () => {
    setAddEnvCount(0);
    setEnvFamily('');
    setEnvStage('');
    setScalingFactor(1);
    setResult(null);
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
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cost">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">What-if Simulator</h1>
            <p className="text-slate-500 mt-1">
              Simulate cost impact of adding environments or scaling
            </p>
          </div>
        </div>
        {result && (
          <Button onClick={() => setSaveModalOpen(true)}>
            <Save className="h-4 w-4 mr-2" />
            Save Simulation
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Simulation Parameters</CardTitle>
              <CardDescription>Configure your what-if scenario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Cost Model *
                </label>
                <Select
                  options={costModels.map(m => ({ value: m.id, label: m.name }))}
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Environment Family
                </label>
                <Select
                  options={[
                    { value: '', label: 'All Families' },
                    { value: 'CPQ', label: 'CPQ' },
                    { value: 'CRM', label: 'CRM' },
                    { value: 'BILLING', label: 'Billing' },
                    { value: 'ITSM', label: 'ITSM' },
                    { value: 'SOM', label: 'SOM' },
                    { value: 'OSS', label: 'OSS' },
                  ]}
                  value={envFamily}
                  onChange={(e) => setEnvFamily(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Environment Stage
                </label>
                <Select
                  options={[
                    { value: '', label: 'All Stages' },
                    { value: 'DEV', label: 'DEV' },
                    { value: 'SIT', label: 'SIT' },
                    { value: 'UAT', label: 'UAT' },
                    { value: 'NFT', label: 'NFT' },
                    { value: 'PREPROD', label: 'PREPROD' },
                  ]}
                  value={envStage}
                  onChange={(e) => setEnvStage(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-200">
                <label className="text-sm font-medium text-slate-700 block mb-3">
                  Add New Environments
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAddEnvCount(Math.max(0, addEnvCount - 1))}
                    disabled={addEnvCount === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="0"
                    value={addEnvCount}
                    onChange={(e) => setAddEnvCount(parseInt(e.target.value) || 0)}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAddEnvCount(addEnvCount + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Scale Host Costs (factor)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={scalingFactor}
                  onChange={(e) => setScalingFactor(parseFloat(e.target.value) || 1)}
                />
                <p className="text-xs text-slate-500 mt-1">
                  1.0 = no change, 1.5 = 50% increase, 0.8 = 20% decrease
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={runSimulation}
                  disabled={running || !selectedModelId}
                  className="flex-1"
                >
                  {running ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Run Simulation
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Simulations */}
          {savedSimulations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Saved Simulations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {savedSimulations.slice(0, 5).map((sim) => (
                    <button
                      key={sim.id}
                      onClick={() => loadSimulation(sim)}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <div className="font-medium text-slate-900 text-sm">{sim.name}</div>
                      {sim.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{sim.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {formatCurrency((sim.resultJson as SimulationResult).projectedTotal, sim.currency)}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-6">
              {/* Main Result Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-500">Current Cost</p>
                      <p className="text-2xl font-bold text-slate-900 mt-2">
                        {formatCurrency(result.currentTotal, result.currency)}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {result.currentEnvCount} environment{result.currentEnvCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-500 to-blue-600">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-indigo-100">Projected Cost</p>
                      <p className="text-2xl font-bold text-white mt-2">
                        {formatCurrency(result.projectedTotal, result.currency)}
                      </p>
                      <p className="text-sm text-indigo-100 mt-1">
                        {result.projectedEnvCount} environment{result.projectedEnvCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-500">Delta</p>
                      <p className={`text-2xl font-bold mt-2 ${getChangeColor(result.delta)}`}>
                        {result.delta >= 0 ? '+' : ''}{formatCurrency(result.delta, result.currency)}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        {result.delta > 0 ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : result.delta < 0 ? (
                          <TrendingDown className="h-4 w-4 text-emerald-500" />
                        ) : null}
                        <span className={`text-sm ${getChangeColor(result.percentageChange)}`}>
                          {formatChange(result.percentageChange)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Current Costs</p>
                          <p className="text-sm text-slate-500">Existing environment costs</p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(result.breakdown.currentCosts, result.currency)}
                      </span>
                    </div>

                    {result.breakdown.additionalEnvCost > 0 && (
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                            <Server className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Additional Environments</p>
                            <p className="text-sm text-slate-500">
                              +{result.assumptions.addEnvCount} new environment{result.assumptions.addEnvCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-blue-600">
                          +{formatCurrency(result.breakdown.additionalEnvCost, result.currency)}
                        </span>
                      </div>
                    )}

                    {result.breakdown.scalingImpact !== 0 && (
                      <div className={`flex items-center justify-between p-4 rounded-lg ${result.breakdown.scalingImpact > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${result.breakdown.scalingImpact > 0 ? 'bg-red-200' : 'bg-emerald-200'}`}>
                            {result.breakdown.scalingImpact > 0 ? (
                              <TrendingUp className="h-5 w-5 text-red-600" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Scaling Impact</p>
                            <p className="text-sm text-slate-500">
                              Host costs scaled by {result.assumptions.scalingFactor}x
                            </p>
                          </div>
                        </div>
                        <span className={`font-semibold ${result.breakdown.scalingImpact > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {result.breakdown.scalingImpact >= 0 ? '+' : ''}{formatCurrency(result.breakdown.scalingImpact, result.currency)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Assumptions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Simulation Assumptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase">Avg Cost/Env</p>
                      <p className="font-semibold text-slate-900 mt-1">
                        {formatCurrency(result.assumptions.avgCostPerEnv, result.currency)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase">New Envs</p>
                      <p className="font-semibold text-slate-900 mt-1">
                        {result.assumptions.addEnvCount}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase">Scale Factor</p>
                      <p className="font-semibold text-slate-900 mt-1">
                        {result.assumptions.scalingFactor}x
                      </p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase">Family</p>
                      <p className="font-semibold text-slate-900 mt-1">
                        {result.assumptions.envFamily}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase">Stage</p>
                      <p className="font-semibold text-slate-900 mt-1">
                        {result.assumptions.envStage}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-full">
              <CardContent className="py-24">
                <div className="text-center">
                  <Calculator className="h-16 w-16 mx-auto text-slate-300 mb-6" />
                  <h3 className="text-xl font-medium text-slate-900 mb-2">
                    Run a Simulation
                  </h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Configure your parameters on the left and click &quot;Run Simulation&quot; to see the projected cost impact of adding environments or scaling infrastructure.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Save Modal */}
      <Modal open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Save Simulation</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Simulation Name *
            </label>
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g., Q1 CPQ Expansion Plan"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Description
            </label>
            <Input
              value={saveDescription}
              onChange={(e) => setSaveDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSimulation} disabled={saving || !saveName}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
