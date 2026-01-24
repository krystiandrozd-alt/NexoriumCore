'use client';

// TelEnvIQ - Exceptions Page
// Policy exceptions timeline and management

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
} from 'lucide-react';
import type { ExceptionItem, ExceptionStatus } from '@/types';

const statusColors: Record<ExceptionStatus, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-slate-100 text-slate-500',
  REVOKED: 'bg-red-100 text-red-700',
};

const statusIcons: Record<ExceptionStatus, React.ReactNode> = {
  REQUESTED: <Clock className="h-4 w-4" />,
  APPROVED: <CheckCircle className="h-4 w-4" />,
  ACTIVE: <CheckCircle className="h-4 w-4" />,
  EXPIRED: <Calendar className="h-4 w-4" />,
  REVOKED: <XCircle className="h-4 w-4" />,
};

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [expiring, setExpiring] = useState<ExceptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<ExceptionStatus | ''>('');
  const [selectedException, setSelectedException] = useState<ExceptionItem | null>(null);

  useEffect(() => {
    fetchExceptions();
    fetchExpiring();
  }, [filterStatus]);

  async function fetchExceptions() {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      const response = await fetch(`/api/governance/exceptions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch exceptions');
      const result = await response.json();
      setExceptions(result.data?.items || []);
    } catch (error) {
      console.error('Error fetching exceptions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchExpiring() {
    try {
      const response = await fetch('/api/governance/exceptions/expiring?days=14');
      if (!response.ok) throw new Error('Failed to fetch expiring exceptions');
      const result = await response.json();
      setExpiring(result.data?.items || []);
    } catch (error) {
      console.error('Error fetching expiring:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const activeCount = exceptions.filter((e) => e.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Policy Exceptions</h1>
          <p className="mt-1 text-sm text-slate-500">
            {activeCount} active exception{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" />
          Request Exception
        </button>
      </div>

      {/* Expiring Soon Alert */}
      {expiring.length > 0 && (
        <div className="card-enterprise p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Exceptions Expiring Soon</h3>
              <p className="text-sm text-amber-700 mt-1">
                {expiring.length} exception{expiring.length !== 1 ? 's' : ''} will expire within 14 days
              </p>
              <div className="mt-2 space-y-1">
                {expiring.slice(0, 3).map((ex) => (
                  <div key={ex.id} className="text-sm text-amber-600">
                    {ex.policyControl?.name || 'Unknown control'} - expires{' '}
                    {ex.expiresAt
                      ? new Date(ex.expiresAt).toLocaleDateString()
                      : 'soon'}
                  </div>
                ))}
                {expiring.length > 3 && (
                  <div className="text-sm text-amber-600">
                    +{expiring.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card-enterprise p-4">
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4 text-slate-400" />
          <div className="flex gap-2 flex-wrap">
            {(['', 'ACTIVE', 'REQUESTED', 'EXPIRED', 'REVOKED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status === '' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exceptions List */}
      {exceptions.length === 0 ? (
        <div className="text-center py-12 card-enterprise">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No exceptions found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {filterStatus ? 'Try adjusting your filter' : 'No policy exceptions have been created'}
          </p>
        </div>
      ) : (
        <div className="card-enterprise overflow-hidden">
          <div className="activity-timeline p-6 space-y-6">
            {exceptions.map((exception) => (
              <div
                key={exception.id}
                className={`activity-item cursor-pointer ${
                  exception.status === 'ACTIVE'
                    ? 'success'
                    : exception.status === 'EXPIRED' || exception.status === 'REVOKED'
                    ? 'critical'
                    : ''
                }`}
                onClick={() => setSelectedException(exception)}
              >
                <div className="flex-1 bg-white rounded-lg border border-slate-200 p-4 hover:border-indigo-200 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900">
                          {exception.policyControl?.name || 'Unknown Policy'}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[exception.status]
                          }`}
                        >
                          {statusIcons[exception.status]}
                          {exception.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{exception.reason}</p>
                    </div>
                    {exception.expiresAt && exception.status === 'ACTIVE' && (
                      <div className="text-right text-xs">
                        <div className="text-slate-500">Expires</div>
                        <div className="font-medium text-slate-700">
                          {new Date(exception.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    {exception.requestedByName && (
                      <span>Requested by {exception.requestedByName}</span>
                    )}
                    <span>
                      {new Date(exception.requestedAt).toLocaleDateString()}
                    </span>
                    {exception.approvedByName && (
                      <span>Approved by {exception.approvedByName}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exception Detail Modal */}
      {selectedException && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedException(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Exception Details
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedException.policyControl?.name || 'Unknown Policy'}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[selectedException.status]
                }`}
              >
                {statusIcons[selectedException.status]}
                {selectedException.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-700">Reason</h4>
                <p className="text-sm text-slate-600 mt-1">{selectedException.reason}</p>
              </div>

              {selectedException.justification && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700">Justification</h4>
                  <p className="text-sm text-slate-600 mt-1">{selectedException.justification}</p>
                </div>
              )}

              {selectedException.riskAssessment && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700">Risk Assessment</h4>
                  <p className="text-sm text-slate-600 mt-1">{selectedException.riskAssessment}</p>
                </div>
              )}

              {selectedException.mitigationPlan && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700">Mitigation Plan</h4>
                  <p className="text-sm text-slate-600 mt-1">{selectedException.mitigationPlan}</p>
                </div>
              )}

              <hr className="border-slate-200" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Requested by</span>
                  <p>{selectedException.requestedByName || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Requested at</span>
                  <p>{new Date(selectedException.requestedAt).toLocaleString()}</p>
                </div>
                {selectedException.approvedByName && (
                  <>
                    <div>
                      <span className="text-slate-500">Approved by</span>
                      <p>{selectedException.approvedByName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Approved at</span>
                      <p>
                        {selectedException.approvedAt
                          ? new Date(selectedException.approvedAt).toLocaleString()
                          : '-'}
                      </p>
                    </div>
                  </>
                )}
                {selectedException.expiresAt && (
                  <div className="col-span-2">
                    <span className="text-slate-500">Expires</span>
                    <p>{new Date(selectedException.expiresAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedException(null)}
              className="w-full mt-6 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
