'use client';

// TelEnvIQ - Activity Log Dashboard
// View activity logs across all environments

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Activity,
  Search,
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
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import type { EnvironmentActivityLog, ActivityActionType, Environment } from '@/types';

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

export default function ActivityPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const [logs, setLogs] = useState<EnvironmentActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const limit = 25;

  useEffect(() => {
    fetch('/api/environments')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEnvironments(data.data);
          if (data.data.length > 0) {
            setSelectedEnvironment(data.data[0].id);
          }
        }
      });
  }, []);

  const fetchLogs = async () => {
    if (!selectedEnvironment) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(page * limit),
      });
      if (actionFilter) params.set('action', actionFilter);

      const response = await fetch(
        `/api/environments/${selectedEnvironment}/activity-logs?${params}`
      );
      const data = await response.json();
      if (data.success) {
        setLogs(data.data.items);
        setHasMore(data.data.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEnvironment, page, actionFilter]);

  // Filter logs by search term
  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.targetName?.toLowerCase().includes(searchLower) ||
      log.actorName?.toLowerCase().includes(searchLower) ||
      ACTION_CONFIG[log.action]?.label.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Log</h1>
          <p className="text-slate-500 mt-1">
            View and filter activity across environments
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select
              options={environments.map((e) => ({ value: e.id, label: e.name }))}
              value={selectedEnvironment}
              onChange={(e) => {
                setSelectedEnvironment(e.target.value);
                setPage(0);
              }}
              className="w-48"
            />

            <Select
              options={[
                { value: '', label: 'All Actions' },
                ...Object.entries(ACTION_CONFIG).map(([value, { label }]) => ({
                  value,
                  label,
                })),
              ]}
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(0);
              }}
              className="w-48"
            />

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or actor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button variant="outline" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No activity found</p>
            </div>
          ) : (
            <>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />

                <div className="space-y-4">
                  {filteredLogs.map((log) => {
                    const config = ACTION_CONFIG[log.action];
                    const Icon = config?.icon || Activity;

                    return (
                      <div key={log.id} className="relative flex gap-4 pl-12">
                        {/* Timeline dot */}
                        <div className="absolute left-0 w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                          <Icon className={`h-4 w-4 ${config?.color || 'text-slate-400'}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-slate-50 rounded-lg p-4 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-slate-900">
                                  {config?.label || log.action}
                                </span>
                                {log.targetName && (
                                  <Badge variant="secondary">{log.targetName}</Badge>
                                )}
                                {log.targetType && (
                                  <span className="text-xs text-slate-400">
                                    ({log.targetType})
                                  </span>
                                )}
                              </div>
                              {log.actorName && (
                                <div className="text-sm text-slate-600 mt-1">
                                  by {log.actorName}
                                </div>
                              )}
                              {log.details && Object.keys(log.details).length > 0 && (
                                <div className="text-xs text-slate-500 mt-2 font-mono bg-white rounded p-2">
                                  {JSON.stringify(log.details, null, 2).slice(0, 200)}
                                  {JSON.stringify(log.details).length > 200 && '...'}
                                </div>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm text-slate-500">
                                {formatRelativeTime(log.createdAt)}
                              </div>
                              <div className="text-xs text-slate-400">
                                {formatDateTime(log.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-slate-500">
                  Page {page + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasMore}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
