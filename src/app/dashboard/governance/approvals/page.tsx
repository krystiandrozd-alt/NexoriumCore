'use client';

// TelEnvIQ - Approvals Inbox Page
// Pending approvals management

import { useEffect, useState } from 'react';
import {
  ClipboardCheck,
  Check,
  X,
  Clock,
  Filter,
} from 'lucide-react';
import type { ApprovalItem, ApprovalStatus, ApprovalType } from '@/types';

const statusColors: Record<ApprovalStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-slate-100 text-slate-500',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

const typeLabels: Record<ApprovalType, string> = {
  PROMOTION: 'Promotion',
  EXCEPTION_REQUEST: 'Exception',
  DATA_ACCESS: 'Data Access',
  CONFIGURATION_CHANGE: 'Config Change',
  COUPLING_REVIEW: 'Coupling Review',
  RELEASE_GATE: 'Release Gate',
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | ''>('PENDING');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, [filterStatus]);

  async function fetchApprovals() {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      const response = await fetch(`/api/governance/approvals?${params}`);
      if (!response.ok) throw new Error('Failed to fetch approvals');
      const result = await response.json();
      setApprovals(result.data?.items || []);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string, reason?: string) {
    setProcessing(true);
    try {
      await fetch(`/api/governance/approvals/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'current-user', reason }),
      });
      await fetchApprovals();
      setSelectedApproval(null);
    } catch (error) {
      console.error('Error approving:', error);
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject(id: string, reason: string) {
    setProcessing(true);
    try {
      await fetch(`/api/governance/approvals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectedBy: 'current-user', reason }),
      });
      await fetchApprovals();
      setSelectedApproval(null);
    } catch (error) {
      console.error('Error rejecting:', error);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Approvals</h1>
          <p className="mt-1 text-sm text-slate-500">
            {pendingCount > 0
              ? `${pendingCount} pending approval${pendingCount !== 1 ? 's' : ''}`
              : 'No pending approvals'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-enterprise p-4">
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4 text-slate-400" />
          <div className="flex gap-2">
            {(['', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
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

      {/* Approvals List */}
      {approvals.length === 0 ? (
        <div className="text-center py-12 card-enterprise">
          <ClipboardCheck className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No approvals found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {filterStatus ? 'Try adjusting your filter' : 'All caught up!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="card-enterprise p-4 hover:border-indigo-200 transition-colors cursor-pointer"
              onClick={() => setSelectedApproval(approval)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-slate-900">{approval.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[approval.status]
                      }`}
                    >
                      {approval.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {typeLabels[approval.approvalType]}
                    </span>
                  </div>
                  {approval.description && (
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                      {approval.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                    {approval.requesterName && (
                      <span>Requested by: {approval.requesterName}</span>
                    )}
                    <span>
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </span>
                    {approval.dueDate && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Clock className="h-3 w-3" />
                        Due: {new Date(approval.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                {approval.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(approval.id);
                      }}
                      disabled={processing}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApproval(approval);
                      }}
                      disabled={processing}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Reject"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Detail Modal */}
      {selectedApproval && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedApproval(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {selectedApproval.title}
                </h3>
                <p className="text-sm text-slate-500">
                  {typeLabels[selectedApproval.approvalType]}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[selectedApproval.status]
                }`}
              >
                {selectedApproval.status}
              </span>
            </div>

            {selectedApproval.description && (
              <p className="text-sm text-slate-600 mb-4">{selectedApproval.description}</p>
            )}

            <div className="space-y-2 text-sm mb-6">
              {selectedApproval.requesterName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested by</span>
                  <span>{selectedApproval.requesterName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Created</span>
                <span>{new Date(selectedApproval.createdAt).toLocaleString()}</span>
              </div>
              {selectedApproval.dueDate && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Due</span>
                  <span>{new Date(selectedApproval.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {selectedApproval.status === 'PENDING' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedApproval.id)}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedApproval.id, 'Rejected by user')}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}

            {selectedApproval.status !== 'PENDING' && (
              <button
                onClick={() => setSelectedApproval(null)}
                className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
