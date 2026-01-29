'use client';

// Nexorium Core - Approval Card Component
// Display a single approval item

import { Clock, Check, X, AlertCircle } from 'lucide-react';
import type { ApprovalItem, ApprovalStatus, ApprovalType } from '@/types';

interface ApprovalCardProps {
  approval: ApprovalItem;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onClick?: (approval: ApprovalItem) => void;
  compact?: boolean;
}

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

export function ApprovalCard({
  approval,
  onApprove,
  onReject,
  onClick,
  compact = false,
}: ApprovalCardProps) {
  const isOverdue =
    approval.dueDate && new Date(approval.dueDate) < new Date() && approval.status === 'PENDING';

  return (
    <div
      className={`card-enterprise p-4 ${
        onClick ? 'cursor-pointer hover:border-indigo-200' : ''
      } ${isOverdue ? 'border-red-200' : ''} transition-colors`}
      onClick={() => onClick?.(approval)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-slate-900 truncate">{approval.title}</h4>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                statusColors[approval.status]
              }`}
            >
              {approval.status}
            </span>
            {!compact && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {typeLabels[approval.approvalType]}
              </span>
            )}
          </div>

          {!compact && approval.description && (
            <p className="mt-1 text-sm text-slate-600 line-clamp-2">{approval.description}</p>
          )}

          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
            {approval.requesterName && <span>From: {approval.requesterName}</span>}
            <span>{new Date(approval.createdAt).toLocaleDateString()}</span>
            {approval.dueDate && (
              <span
                className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}
              >
                <Clock className="h-3 w-3" />
                {isOverdue ? 'Overdue' : `Due ${new Date(approval.dueDate).toLocaleDateString()}`}
              </span>
            )}
          </div>
        </div>

        {approval.status === 'PENDING' && (onApprove || onReject) && (
          <div className="flex items-center gap-2 ml-4">
            {onApprove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove(approval.id);
                }}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Approve"
              >
                <Check className="h-5 w-5" />
              </button>
            )}
            {onReject && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(approval.id);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Reject"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {isOverdue && (
          <div className="ml-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ApprovalCard;
