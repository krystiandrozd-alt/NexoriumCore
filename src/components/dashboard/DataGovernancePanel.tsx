'use client';

// Nexorium Core - Data Governance Panel
// Governance dashboard with compliance and violation summaries

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GovernanceSummary } from '@/types';

interface DataGovernancePanelProps {
  environmentId?: string;
  className?: string;
}

export default function DataGovernancePanel({ environmentId, className }: DataGovernancePanelProps) {
  const [summary, setSummary] = useState<GovernanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams({ summary: 'true' });
      if (environmentId) params.set('environmentId', environmentId);

      const response = await fetch(`/api/governance/violations?${params}`);
      const data = await response.json();

      if (data.success) {
        setSummary({
          totalViolations: (Object.values(data.data.byStatus) as number[]).reduce((a, b) => a + b, 0),
          openViolations: data.data.totalOpen,
          criticalViolations: data.data.critical,
          violationsByPolicy: data.data.byPolicy,
          datasetsRequiringApproval: 0, // TODO: Fetch from classification summary
          datasetsWithoutMasking: 0,
          piiDatasets: 0,
          pciDatasets: 0,
          complianceScore: calculateComplianceScore(data.data),
        });
      }
    } catch (error) {
      console.error('Failed to fetch governance summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const runPolicyCheck = async () => {
    setRunningCheck(true);
    try {
      const params = environmentId ? `?environmentId=${environmentId}` : '';
      await fetch(`/api/governance/violations${params}`, { method: 'POST' });
      await fetchSummary();
    } catch (error) {
      console.error('Failed to run policy check:', error);
    } finally {
      setRunningCheck(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentId]);

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Data Governance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-slate-100 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            Data Governance
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={runPolicyCheck}
            disabled={runningCheck}
          >
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', runningCheck && 'animate-spin')} />
            {runningCheck ? 'Checking...' : 'Run Check'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compliance Score */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-600">Compliance Score</div>
            <div className="text-xs text-slate-400 mt-0.5">Based on policy violations</div>
          </div>
          <CircularProgress
            value={summary.complianceScore}
            size={64}
            strokeWidth={6}
            label={`${summary.complianceScore}%`}
            indicatorClassName={
              summary.complianceScore >= 80
                ? 'text-green-500'
                : summary.complianceScore >= 60
                ? 'text-yellow-500'
                : 'text-red-500'
            }
          />
        </div>

        {/* Violation Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <div className="text-lg font-semibold text-slate-900">{summary.openViolations}</div>
            <div className="text-[10px] text-slate-500">Open</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <div className="text-lg font-semibold text-red-600">{summary.criticalViolations}</div>
            <div className="text-[10px] text-red-500">Critical</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-600">
              {summary.totalViolations - summary.openViolations}
            </div>
            <div className="text-[10px] text-green-500">Resolved</div>
          </div>
        </div>

        {/* Policy Violations */}
        {Object.keys(summary.violationsByPolicy).length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-600">Active Violations by Policy</div>
            <div className="space-y-1">
              {Object.entries(summary.violationsByPolicy).map(([policy, count]) => (
                <div key={policy} className="flex items-center justify-between text-xs">
                  <span className="truncate text-slate-600">{policy}</span>
                  <Badge variant="secondary" className="ml-2">{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Status */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {summary.criticalViolations > 0 ? (
            <ShieldAlert className="h-4 w-4 text-red-500" />
          ) : summary.openViolations > 0 ? (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <span className="text-xs text-slate-600">
            {summary.criticalViolations > 0
              ? `${summary.criticalViolations} critical violation${summary.criticalViolations > 1 ? 's' : ''} require attention`
              : summary.openViolations > 0
              ? `${summary.openViolations} open violation${summary.openViolations > 1 ? 's' : ''}`
              : 'All policies passing'}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400 ml-auto" />
        </div>
      </CardContent>
    </Card>
  );
}

function calculateComplianceScore(data: { totalOpen: number; critical: number }): number {
  // Simple scoring: 100% minus penalties for violations
  let score = 100;
  score -= data.critical * 15; // -15 per critical
  score -= (data.totalOpen - data.critical) * 5; // -5 per non-critical open
  return Math.max(0, Math.min(100, Math.round(score)));
}
