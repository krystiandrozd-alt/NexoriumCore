'use client';

// Nexorium Core - Exception Card Component
// Display a single exception item

import { Clock, CheckCircle, XCircle, Calendar, AlertTriangle } from 'lucide-react';
import type { ExceptionItem, ExceptionStatus } from '@/types';

interface ExceptionCardProps {
  exception: ExceptionItem;
  onClick?: (exception: ExceptionItem) => void;
  onApprove?: (id: string) => void;
  onRevoke?: (id: string) => void;
  compact?: boolean;
}

const statusConfig: Record<
  ExceptionStatus,
  { color: string; icon: React.ReactNode; label: string }
> = {
  REQUESTED: {
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Clock className="h-4 w-4" />,
    label: 'Pending',
  },
  APPROVED: {
    color: 'bg-blue-100 text-blue-700',
    icon: <CheckCircle className="h-4 w-4" />,
    label: 'Approved',
  },
  ACTIVE: {
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="h-4 w-4" />,
    label: 'Active',
  },
  EXPIRED: {
    color: 'bg-slate-100 text-slate-500',
    icon: <Calendar className="h-4 w-4" />,
    label: 'Expired',
  },
  REVOKED: {
    color: 'bg-red-100 text-red-700',
    icon: <XCircle className="h-4 w-4" />,
    label: 'Revoked',
  },
};

export function ExceptionCard({
  exception,
  onClick,
  onApprove,
  onRevoke,
  compact = false,
}: ExceptionCardProps) {
  const status = statusConfig[exception.status];
  const isExpiringSoon =
    exception.status === 'ACTIVE' &&
    exception.expiresAt &&
    new Date(exception.expiresAt) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const daysUntilExpiry = exception.expiresAt
    ? Math.ceil((new Date(exception.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    : null;

  return (
    <div
      className={`card-enterprise p-4 ${
        onClick ? 'cursor-pointer hover:border-indigo-200' : ''
      } ${isExpiringSoon ? 'border-amber-200' : ''} transition-colors`}
      onClick={() => onClick?.(exception)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-slate-900">
              {exception.policyControl?.name || 'Unknown Policy'}
            </h4>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
            >
              {status.icon}
              {status.label}
            </span>
            {isExpiringSoon && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                Expires in {daysUntilExpiry} days
              </span>
            )}
          </div>

          {!compact && <p className="mt-1 text-sm text-slate-600">{exception.reason}</p>}

          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
            {exception.requestedByName && <span>By: {exception.requestedByName}</span>}
            <span>{new Date(exception.requestedAt).toLocaleDateString()}</span>
            {exception.expiresAt && exception.status === 'ACTIVE' && (
              <span className={isExpiringSoon ? 'text-amber-600' : ''}>
                Expires: {new Date(exception.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {exception.status === 'REQUESTED' && onApprove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApprove(exception.id);
              }}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Approve"
            >
              <CheckCircle className="h-5 w-5" />
            </button>
          )}
          {exception.status === 'ACTIVE' && onRevoke && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRevoke(exception.id);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Revoke"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExceptionCard;
