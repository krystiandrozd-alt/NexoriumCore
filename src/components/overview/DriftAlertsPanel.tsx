'use client';

// Nexorium Core - Drift Alerts Panel Component
// Displays drift and policy violation alerts sorted by severity

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  Shield,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { DriftAlert, DriftAlertType, ViolationSeverity } from '@/types/overview';
import { AlertsPanelSkeleton } from './SkeletonStates';

interface DriftAlertsPanelProps {
  alerts: DriftAlert[];
  isLoading?: boolean;
  maxItems?: number;
}

const alertTypeConfig: Record<
  DriftAlertType,
  { icon: typeof AlertTriangle; label: string }
> = {
  drift: { icon: AlertCircle, label: 'Drift' },
  violation: { icon: Shield, label: 'Violation' },
  stale: { icon: Clock, label: 'Stale' },
  orphan: { icon: AlertTriangle, label: 'Orphan' },
};

const severityConfig: Record<
  ViolationSeverity,
  { bg: string; border: string; text: string; badgeBg: string }
> = {
  CRITICAL: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    badgeBg: 'bg-rose-500/20',
  },
  HIGH: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    badgeBg: 'bg-orange-500/20',
  },
  MEDIUM: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    badgeBg: 'bg-amber-500/20',
  },
  LOW: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    badgeBg: 'bg-blue-500/20',
  },
};

function AlertCard({
  alert,
  index,
}: {
  alert: DriftAlert;
  index: number;
}) {
  const typeConfig = alertTypeConfig[alert.type];
  const sevConfig = severityConfig[alert.severity];
  const Icon = typeConfig.icon;
  const isCritical = alert.severity === 'CRITICAL';

  return (
    <div
      className={cn(
        'relative rounded-lg border p-3',
        'transition-all duration-300',
        'hover:bg-white/5',
        sevConfig.bg,
        sevConfig.border,
        isCritical && 'animate-pulse-subtle',
        'animate-fade-in-up'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Critical pulse ring */}
      {isCritical && (
        <div
          className={cn(
            'absolute inset-0 rounded-lg border-2',
            'border-rose-500/50',
            'animate-ping-slow pointer-events-none'
          )}
        />
      )}

      <div className="flex items-start gap-3 relative">
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
            sevConfig.badgeBg
          )}
        >
          <Icon className={cn('h-4 w-4', sevConfig.text)} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={cn(
                'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide',
                sevConfig.badgeBg,
                sevConfig.text
              )}
            >
              {alert.severity}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-slate-300">
              {typeConfig.label}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium text-white mb-1 leading-snug">
            {alert.title}
          </h4>

          {/* Description */}
          <p className="text-xs text-slate-400 line-clamp-2 mb-2">
            {alert.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500">
              {formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true })}
            </span>
            {alert.actionUrl && (
              <Link
                href={alert.actionUrl}
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-medium',
                  'text-violet-400 hover:text-violet-300',
                  'transition-colors'
                )}
              >
                View
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DriftAlertsPanel({
  alerts,
  isLoading = false,
  maxItems = 10,
}: DriftAlertsPanelProps) {
  if (isLoading) {
    return <AlertsPanelSkeleton />;
  }

  const displayAlerts = alerts.slice(0, maxItems);
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;

  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">
            Drift & Risk Alerts
          </h3>
          {criticalCount > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 animate-pulse">
              {criticalCount} critical
            </span>
          )}
        </div>
        <Bell className="h-4 w-4 text-slate-400" />
      </div>

      {/* Alerts list */}
      {displayAlerts.length > 0 ? (
        <div className="space-y-3 flex-1 overflow-y-auto premium-scrollbar">
          {displayAlerts.map((alert, index) => (
            <AlertCard key={alert.id} alert={alert} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-sm text-white font-medium">All clear</p>
            <p className="text-xs text-slate-400 mt-1">No active alerts</p>
          </div>
        </div>
      )}
    </div>
  );
}
