'use client';

// TelEnvIQ - Governance Overview Page
// Dashboard with scores, risks, and pending actions

import { useEffect, useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Link2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import type { GovernanceOverview, ApprovalInboxStats, CouplingAnalysis } from '@/types';

interface OverviewData extends GovernanceOverview {
  coupling?: CouplingAnalysis;
  exceptions?: {
    total: number;
    active: number;
    expiringSoon: number;
  };
  approvals?: ApprovalInboxStats;
}

export default function GovernanceOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const response = await fetch('/api/governance/overview');
        if (!response.ok) throw new Error('Failed to fetch overview');
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-semibold text-slate-900">Error loading overview</h3>
        <p className="mt-1 text-sm text-slate-500">{error || 'Unknown error'}</p>
      </div>
    );
  }

  const scoreColor =
    data.complianceScore >= 80 ? 'text-green-600' :
    data.complianceScore >= 60 ? 'text-yellow-600' : 'text-red-600';

  const scoreBgColor =
    data.complianceScore >= 80 ? 'bg-green-100' :
    data.complianceScore >= 60 ? 'bg-yellow-100' : 'bg-red-100';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Governance Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Environment governance health, compliance status, and pending actions
        </p>
      </div>

      {/* Compliance Score Card */}
      <div className="card-enterprise p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Overall Compliance Score</h2>
            <p className="text-sm text-slate-500">Based on {data.controlsActive} active controls</p>
          </div>
          <div className={`flex items-center justify-center w-24 h-24 rounded-full ${scoreBgColor}`}>
            <span className={`text-3xl font-bold ${scoreColor}`}>
              {data.complianceScore}%
            </span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="mx-auto h-6 w-6 text-green-600" />
            <div className="mt-2 text-2xl font-bold text-green-600">{data.passCount}</div>
            <div className="text-xs text-green-700">Passing</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="mx-auto h-6 w-6 text-yellow-600" />
            <div className="mt-2 text-2xl font-bold text-yellow-600">{data.warnCount}</div>
            <div className="text-xs text-yellow-700">Warnings</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <AlertCircle className="mx-auto h-6 w-6 text-red-600" />
            <div className="mt-2 text-2xl font-bold text-red-600">{data.failCount}</div>
            <div className="text-xs text-red-700">Failing</div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Approvals */}
        <Link href="/dashboard/governance/approvals" className="card-enterprise p-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Approvals</p>
              <p className="text-2xl font-bold text-slate-900">{data.pendingApprovalsCount}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Clock className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          {data.approvals?.overdue && data.approvals.overdue > 0 && (
            <p className="mt-2 text-xs text-red-600">
              {data.approvals.overdue} overdue
            </p>
          )}
        </Link>

        {/* Active Exceptions */}
        <Link href="/dashboard/governance/exceptions" className="card-enterprise p-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Exceptions</p>
              <p className="text-2xl font-bold text-slate-900">{data.activeExceptionsCount}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          {data.expiringExceptionsCount > 0 && (
            <p className="mt-2 text-xs text-amber-600">
              {data.expiringExceptionsCount} expiring soon
            </p>
          )}
        </Link>

        {/* Unreviewed Couplings */}
        <Link href="/dashboard/governance/coupling" className="card-enterprise p-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Unreviewed Couplings</p>
              <p className="text-2xl font-bold text-slate-900">{data.unreviewedCouplingsCount}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Link2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          {data.coupling?.highRiskCount && data.coupling.highRiskCount > 0 && (
            <p className="mt-2 text-xs text-purple-600">
              {data.coupling.highRiskCount} high risk
            </p>
          )}
        </Link>

        {/* Critical Risks */}
        <Link href="/dashboard/governance/compliance" className="card-enterprise p-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Critical Risks</p>
              <p className="text-2xl font-bold text-slate-900">{data.criticalRisksCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Requires immediate attention
          </p>
        </Link>
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card-enterprise p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/governance/compliance"
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">View Compliance Matrix</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/dashboard/governance/controls"
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">Manage Policy Controls</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/dashboard/governance/coupling"
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Link2 className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">Review Environment Coupling</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/dashboard/governance/readiness"
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">Check Promotion Readiness</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Controls Summary */}
        <div className="card-enterprise p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Controls Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Controls</span>
              <span className="text-sm font-semibold">{data.controlsTotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Active Controls</span>
              <span className="text-sm font-semibold text-green-600">{data.controlsActive}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Inactive Controls</span>
              <span className="text-sm font-semibold text-slate-400">
                {data.controlsTotal - data.controlsActive}
              </span>
            </div>
            <hr className="border-slate-200" />
            {data.lastEvaluatedAt && (
              <div className="text-xs text-slate-500">
                Last evaluated: {new Date(data.lastEvaluatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
