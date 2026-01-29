'use client';

// Nexorium Core - Coupling Analysis Page
// Environment coupling detection and management

import { useEffect, useState } from 'react';
import {
  Link2,
  AlertTriangle,
  RefreshCw,
  Filter,
  CheckCircle,
} from 'lucide-react';
import type { CouplingLink, CouplingStatus, CouplingAnalysis } from '@/types';

const statusColors: Record<CouplingStatus, string> = {
  UNREVIEWED: 'bg-slate-100 text-slate-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  MITIGATION_REQUIRED: 'bg-amber-100 text-amber-700',
};

const riskColors = (level: number) => {
  if (level >= 80) return 'text-red-600 bg-red-100';
  if (level >= 60) return 'text-orange-600 bg-orange-100';
  if (level >= 30) return 'text-yellow-600 bg-yellow-100';
  return 'text-green-600 bg-green-100';
};

export default function CouplingPage() {
  const [couplings, setCouplings] = useState<CouplingLink[]>([]);
  const [analysis, setAnalysis] = useState<CouplingAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<CouplingStatus | ''>('');
  const [selectedCoupling, setSelectedCoupling] = useState<CouplingLink | null>(null);

  useEffect(() => {
    fetchCouplings();
  }, [filterStatus]);

  async function fetchCouplings() {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);

      const [couplingsRes, overviewRes] = await Promise.all([
        fetch(`/api/governance/coupling?${params}`),
        fetch('/api/governance/overview'),
      ]);

      if (couplingsRes.ok) {
        const result = await couplingsRes.json();
        setCouplings(result.data?.items || []);
      }

      if (overviewRes.ok) {
        const result = await overviewRes.json();
        setAnalysis(result.data?.coupling || null);
      }
    } catch (error) {
      console.error('Error fetching couplings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function runDetection() {
    setDetecting(true);
    try {
      await fetch('/api/governance/coupling/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detectedBy: 'current-user' }),
      });
      await fetchCouplings();
    } catch (error) {
      console.error('Error detecting couplings:', error);
    } finally {
      setDetecting(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await fetch(`/api/governance/coupling/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          reviewedBy: 'current-user',
          reviewNotes: 'Approved after review',
        }),
      });
      await fetchCouplings();
      setSelectedCoupling(null);
    } catch (error) {
      console.error('Error approving coupling:', error);
    }
  }

  async function handleReject(id: string) {
    try {
      await fetch(`/api/governance/coupling/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          reviewedBy: 'current-user',
          reviewNotes: 'Requires mitigation',
          mitigationRequired: true,
        }),
      });
      await fetchCouplings();
      setSelectedCoupling(null);
    } catch (error) {
      console.error('Error rejecting coupling:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Environment Coupling</h1>
          <p className="mt-1 text-sm text-slate-500">
            Detect and manage unintended dependencies between environments
          </p>
        </div>
        <button
          onClick={runDetection}
          disabled={detecting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${detecting ? 'animate-spin' : ''}`} />
          Run Detection
        </button>
      </div>

      {/* Analysis Summary */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-enterprise p-4">
            <div className="text-sm text-slate-500">Total Links</div>
            <div className="text-2xl font-bold text-slate-900">{analysis.totalLinks}</div>
          </div>
          <div className="card-enterprise p-4">
            <div className="text-sm text-slate-500">Unreviewed</div>
            <div className="text-2xl font-bold text-yellow-600">{analysis.unreviewedCount}</div>
          </div>
          <div className="card-enterprise p-4">
            <div className="text-sm text-slate-500">High Risk</div>
            <div className="text-2xl font-bold text-red-600">{analysis.highRiskCount}</div>
          </div>
          <div className="card-enterprise p-4">
            <div className="text-sm text-slate-500">Risk Distribution</div>
            <div className="flex gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                {analysis.riskDistribution?.low || 0} Low
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">
                {analysis.riskDistribution?.medium || 0} Med
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                {analysis.riskDistribution?.high || 0} High
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card-enterprise p-4">
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4 text-slate-400" />
          <div className="flex gap-2 flex-wrap">
            {(['', 'UNREVIEWED', 'UNDER_REVIEW', 'APPROVED', 'MITIGATION_REQUIRED'] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {status === ''
                    ? 'All'
                    : status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Couplings List */}
      {couplings.length === 0 ? (
        <div className="text-center py-12 card-enterprise">
          <Link2 className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No couplings found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Run detection to discover environment couplings
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {couplings.map((coupling) => (
            <div
              key={coupling.id}
              className="card-enterprise p-4 hover:border-indigo-200 transition-colors cursor-pointer"
              onClick={() => setSelectedCoupling(coupling)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {coupling.sourceProjectName || 'Unknown'}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="font-medium text-slate-900">
                        {coupling.targetProjectName || 'Unknown'}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[coupling.status]
                      }`}
                    >
                      {coupling.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {coupling.description || `Coupling type: ${coupling.couplingType}`}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                    <span>Type: {coupling.couplingType.replace(/_/g, ' ')}</span>
                    <span>
                      Detected: {new Date(coupling.detectedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${riskColors(
                      coupling.riskLevel
                    )}`}
                  >
                    Risk: {coupling.riskLevel}%
                  </div>
                  {coupling.status === 'UNREVIEWED' && (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(coupling.id);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(coupling.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Requires Mitigation"
                      >
                        <AlertTriangle className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coupling Detail Modal */}
      {selectedCoupling && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedCoupling(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Coupling Details</h3>
                <p className="text-sm text-slate-500">
                  {selectedCoupling.couplingType.replace(/_/g, ' ')}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-lg text-sm font-semibold ${riskColors(
                  selectedCoupling.riskLevel
                )}`}
              >
                Risk: {selectedCoupling.riskLevel}%
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <div className="font-medium">{selectedCoupling.sourceProjectName}</div>
                  <div className="text-xs text-slate-500">Source</div>
                </div>
                <Link2 className="h-6 w-6 text-slate-400" />
                <div className="text-center">
                  <div className="font-medium">{selectedCoupling.targetProjectName}</div>
                  <div className="text-xs text-slate-500">Target</div>
                </div>
              </div>

              {selectedCoupling.description && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700">Description</h4>
                  <p className="text-sm text-slate-600 mt-1">{selectedCoupling.description}</p>
                </div>
              )}

              {selectedCoupling.mitigationPlan && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700">Mitigation Plan</h4>
                  <p className="text-sm text-slate-600 mt-1">{selectedCoupling.mitigationPlan}</p>
                </div>
              )}

              {selectedCoupling.reviewNotes && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700">Review Notes</h4>
                  <p className="text-sm text-slate-600 mt-1">{selectedCoupling.reviewNotes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {selectedCoupling.status === 'UNREVIEWED' && (
                <>
                  <button
                    onClick={() => handleApprove(selectedCoupling.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedCoupling.id)}
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    Needs Mitigation
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedCoupling(null)}
                className={`${
                  selectedCoupling.status !== 'UNREVIEWED' ? 'w-full' : ''
                } px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
