'use client';

// Nexorium Core - Data Governance Dashboard
// Governance dashboard with compliance and policy management

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { CircularProgress } from '@/components/ui/progress';
import PolicyViolationList from '@/components/dashboard/PolicyViolationList';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Database,
  RefreshCw,
  FileCheck,
  Lock,
} from 'lucide-react';
import type { PolicyViolation, Environment } from '@/types';

export default function DataGovernancePage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const [violations, setViolations] = useState<PolicyViolation[]>([]);
  const [summary, setSummary] = useState<{
    totalOpen: number;
    critical: number;
    bySeverity: Record<string, number>;
    byPolicy: Record<string, number>;
  } | null>(null);
  const [classificationSummary] = useState<{
    byClassification: Record<string, number>;
    unapprovedProdClones: number;
    sensitiveDatasetsWithoutMasking: number;
  } | null>(null);
  const [, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);

  // Fetch environments
  useEffect(() => {
    fetch('/api/environments')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEnvironments(data.data);
        }
      });
  }, []);

  // Fetch violations and summary
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedEnvironment) params.set('environmentId', selectedEnvironment);

      // Fetch violations
      const violationsRes = await fetch(`/api/governance/violations?${params}&limit=50`);
      const violationsData = await violationsRes.json();
      if (violationsData.success) {
        setViolations(violationsData.data.items);
      }

      // Fetch summary
      params.set('summary', 'true');
      const summaryRes = await fetch(`/api/governance/violations?${params}`);
      const summaryData = await summaryRes.json();
      if (summaryData.success) {
        setSummary(summaryData.data);
      }
    } catch (error) {
      console.error('Failed to fetch governance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEnvironment]);

  const runPolicyCheck = async () => {
    setRunningCheck(true);
    try {
      const params = selectedEnvironment ? `?environmentId=${selectedEnvironment}` : '';
      await fetch(`/api/governance/violations${params}`, { method: 'POST' });
      await fetchData();
    } finally {
      setRunningCheck(false);
    }
  };

  const handleResolve = async (id: string) => {
    await fetch(`/api/governance/violations/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve' }),
    });
    await fetchData();
  };

  const handleAcknowledge = async (id: string) => {
    await fetch(`/api/governance/violations/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'acknowledge' }),
    });
    await fetchData();
  };

  const complianceScore = summary
    ? Math.max(0, 100 - (summary.critical * 15) - ((summary.totalOpen - summary.critical) * 5))
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Governance</h1>
          <p className="text-slate-500 mt-1">
            Monitor compliance, policy violations, and data classification
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: '', label: 'All Environments' },
              ...environments.map((e) => ({ value: e.id, label: e.name })),
            ]}
            value={selectedEnvironment}
            onChange={(e) => setSelectedEnvironment(e.target.value)}
            className="w-48"
          />
          <Button onClick={runPolicyCheck} disabled={runningCheck}>
            <RefreshCw className={`h-4 w-4 mr-2 ${runningCheck ? 'animate-spin' : ''}`} />
            {runningCheck ? 'Checking...' : 'Run Policy Check'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Compliance Score */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Compliance Score</p>
                <p className="text-2xl font-bold text-slate-900">{complianceScore}%</p>
              </div>
              <CircularProgress
                value={complianceScore}
                size={56}
                strokeWidth={5}
                indicatorClassName={
                  complianceScore >= 80 ? 'text-green-500' :
                  complianceScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Open Violations */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Open Violations</p>
                <p className="text-2xl font-bold text-slate-900">{summary?.totalOpen ?? 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Violations */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Critical</p>
                <p className="text-2xl font-bold text-red-600">{summary?.critical ?? 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <ShieldAlert className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unapproved Prod Clones */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Unapproved Clones</p>
                <p className="text-2xl font-bold text-slate-900">
                  {classificationSummary?.unapprovedProdClones ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Database className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Violations List */}
        <div className="lg:col-span-2">
          <PolicyViolationList
            violations={violations}
            onResolve={handleResolve}
            onAcknowledge={handleAcknowledge}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Policy Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-indigo-600" />
                Policy Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary?.byPolicy && Object.keys(summary.byPolicy).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(summary.byPolicy).map(([policy, count]) => (
                    <div key={policy} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 truncate pr-2">{policy}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500 text-sm">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  All policies passing
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Classification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-600" />
                Data Classification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    PII Data
                  </span>
                  <Badge variant="outline" className="text-red-600 border-red-300">
                    {classificationSummary?.byClassification?.PII ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    PCI Data
                  </span>
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    {classificationSummary?.byClassification?.PCI ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Confidential
                  </span>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                    {classificationSummary?.byClassification?.CONFIDENTIAL ?? 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
