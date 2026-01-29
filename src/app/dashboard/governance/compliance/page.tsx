'use client';

// Nexorium Core - Compliance Matrix Page
// Environment x Controls compliance view

import { useEffect, useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  MinusCircle,
  RefreshCw,
} from 'lucide-react';
import type { ComplianceMatrixRow, ComplianceResultStatus } from '@/types';

const statusIcons: Record<ComplianceResultStatus, React.ReactNode> = {
  PASS: <CheckCircle className="h-4 w-4 text-green-500" />,
  WARN: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  FAIL: <XCircle className="h-4 w-4 text-red-500" />,
  NOT_APPLICABLE: <MinusCircle className="h-4 w-4 text-slate-300" />,
  PENDING: <Clock className="h-4 w-4 text-slate-400" />,
};

const statusBgColors: Record<ComplianceResultStatus, string> = {
  PASS: 'bg-green-50 hover:bg-green-100',
  WARN: 'bg-yellow-50 hover:bg-yellow-100',
  FAIL: 'bg-red-50 hover:bg-red-100',
  NOT_APPLICABLE: 'bg-slate-50 hover:bg-slate-100',
  PENDING: 'bg-slate-50 hover:bg-slate-100',
};

export default function CompliancePage() {
  const [matrix, setMatrix] = useState<ComplianceMatrixRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    envId: string;
    controlId: string;
    controlName: string;
  } | null>(null);

  useEffect(() => {
    fetchMatrix();
  }, []);

  async function fetchMatrix() {
    try {
      const response = await fetch('/api/governance/compliance/matrix');
      if (!response.ok) throw new Error('Failed to fetch matrix');
      const result = await response.json();
      setMatrix(result.data || []);
    } catch (error) {
      console.error('Error fetching matrix:', error);
    } finally {
      setLoading(false);
    }
  }

  async function evaluateEnvironment(environmentId: string) {
    setEvaluating(true);
    try {
      await fetch('/api/governance/compliance/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environmentId }),
      });
      await fetchMatrix();
    } catch (error) {
      console.error('Error evaluating environment:', error);
    } finally {
      setEvaluating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Get unique controls from matrix
  const controls = matrix[0]?.results.map((r) => ({
    id: r.controlId,
    name: r.controlName,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance Matrix</h1>
          <p className="mt-1 text-sm text-slate-500">
            Environment compliance status across all policy controls
          </p>
        </div>
        <button
          onClick={() => matrix.forEach((row) => evaluateEnvironment(row.environmentId))}
          disabled={evaluating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${evaluating ? 'animate-spin' : ''}`} />
          Evaluate All
        </button>
      </div>

      {/* Legend */}
      <div className="card-enterprise p-4">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="font-medium text-slate-600">Legend:</span>
          <div className="flex items-center gap-2">
            {statusIcons.PASS}
            <span>Pass</span>
          </div>
          <div className="flex items-center gap-2">
            {statusIcons.WARN}
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-2">
            {statusIcons.FAIL}
            <span>Fail</span>
          </div>
          <div className="flex items-center gap-2">
            {statusIcons.PENDING}
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            {statusIcons.NOT_APPLICABLE}
            <span>N/A</span>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      {matrix.length === 0 ? (
        <div className="text-center py-12 card-enterprise">
          <CheckCircle className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No compliance data</h3>
          <p className="mt-1 text-sm text-slate-500">
            Run compliance evaluation to populate the matrix
          </p>
        </div>
      ) : (
        <div className="card-enterprise overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="sticky left-0 bg-slate-50 px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider z-10">
                    Environment
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Score
                  </th>
                  {controls.map((control) => (
                    <th
                      key={control.id}
                      className="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap"
                      title={control.name}
                    >
                      {control.name.length > 15
                        ? `${control.name.slice(0, 15)}...`
                        : control.name}
                    </th>
                  ))}
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrix.map((row) => (
                  <tr key={row.environmentId} className="hover:bg-slate-25">
                    <td className="sticky left-0 bg-white px-4 py-3 z-10">
                      <div>
                        <span className="font-medium text-slate-900">{row.environmentName}</span>
                        <span className="ml-2 text-xs text-slate-500">{row.environmentType}</span>
                      </div>
                      {row.stage && (
                        <span className="text-xs text-slate-400">{row.stage}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-8 rounded-lg font-semibold text-sm ${
                          row.overallScore >= 80
                            ? 'bg-green-100 text-green-700'
                            : row.overallScore >= 60
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {row.overallScore}%
                      </div>
                    </td>
                    {row.results.map((cell) => (
                      <td
                        key={cell.controlId}
                        className={`px-3 py-3 text-center cursor-pointer transition-colors ${
                          statusBgColors[cell.status]
                        }`}
                        onClick={() =>
                          setSelectedCell({
                            envId: row.environmentId,
                            controlId: cell.controlId,
                            controlName: cell.controlName,
                          })
                        }
                        title={cell.message || cell.controlName}
                      >
                        {statusIcons[cell.status]}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => evaluateEnvironment(row.environmentId)}
                        disabled={evaluating}
                        className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-50"
                        title="Re-evaluate"
                      >
                        <RefreshCw className={`h-4 w-4 ${evaluating ? 'animate-spin' : ''}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cell Details Modal */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {selectedCell.controlName}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Click outside to close
            </p>
            <button
              onClick={() => setSelectedCell(null)}
              className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
