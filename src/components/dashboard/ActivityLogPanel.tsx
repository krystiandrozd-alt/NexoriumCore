'use client';

// TelEnvIQ - Activity Log Panel
// Display activity timeline for an environment

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Play,
  Camera,
  Edit3,
  Plus,
  Undo2,
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Users
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { EnvironmentActivityLog, ActivityActionType } from '@/types';

interface ActivityLogPanelProps {
  environmentId: string;
  limit?: number;
  className?: string;
}

const ACTION_CONFIG: Record<ActivityActionType, {
  icon: typeof Activity;
  label: string;
  color: string;
}> = {
  CONNECTOR_RUN: { icon: Play, label: 'Discovery Run', color: 'text-blue-500' },
  SNAPSHOT_CREATED: { icon: Camera, label: 'Snapshot', color: 'text-purple-500' },
  MANUAL_EDIT: { icon: Edit3, label: 'Manual Edit', color: 'text-slate-500' },
  ENRICHMENT_ADDED: { icon: Plus, label: 'Enrichment', color: 'text-green-500' },
  ENRICHMENT_REVERTED: { icon: Undo2, label: 'Revert', color: 'text-orange-500' },
  POLICY_VIOLATION_DETECTED: { icon: AlertTriangle, label: 'Violation', color: 'text-red-500' },
  POLICY_VIOLATION_RESOLVED: { icon: CheckCircle, label: 'Resolved', color: 'text-green-500' },
  APPROVAL_GRANTED: { icon: ThumbsUp, label: 'Approved', color: 'text-green-500' },
  APPROVAL_REVOKED: { icon: ThumbsDown, label: 'Revoked', color: 'text-red-500' },
  DATA_REFRESH: { icon: RefreshCw, label: 'Refresh', color: 'text-blue-500' },
  OWNERSHIP_CHANGED: { icon: Users, label: 'Ownership', color: 'text-indigo-500' },
};

export default function ActivityLogPanel({
  environmentId,
  limit = 10,
  className,
}: ActivityLogPanelProps) {
  const [logs, setLogs] = useState<EnvironmentActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(
          `/api/environments/${environmentId}/activity-logs?limit=${limit}`
        );
        const data = await response.json();
        if (data.success) {
          setLogs(data.data.items);
        }
      } catch (error) {
        console.error('Failed to fetch activity logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [environmentId, limit]);

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5 text-indigo-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            No activity recorded
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200" />

            <div className="space-y-4">
              {logs.map((log) => {
                const config = ACTION_CONFIG[log.action];
                const Icon = config?.icon || Activity;

                return (
                  <div key={log.id} className="relative flex gap-3 pl-6">
                    {/* Timeline dot */}
                    <div className={cn(
                      'absolute left-0 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center',
                      'border-slate-200'
                    )}>
                      <Icon className={cn('h-3 w-3', config?.color || 'text-slate-400')} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">
                          {config?.label || log.action}
                        </span>
                        {log.targetName && (
                          <Badge variant="secondary" className="text-[10px]">
                            {log.targetName}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{formatRelativeTime(log.createdAt)}</span>
                        {log.actorName && (
                          <>
                            <span>•</span>
                            <span>{log.actorName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
