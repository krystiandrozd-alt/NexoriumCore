'use client';

// Nexorium Core - Recent Activity Timeline Component
// Vertical timeline displaying recent activity feed

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Camera,
  Edit3,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  UserCheck,
  UserX,
  Zap,
  Users,
  Database,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ActivityItem, ActivityActionType } from '@/types/overview';
import { ActivityTimelineSkeleton } from './SkeletonStates';

interface RecentActivityTimelineProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  maxItems?: number;
}

const iconMap: Record<ActivityActionType, typeof Camera> = {
  SNAPSHOT_CREATED: Camera,
  CONNECTOR_RUN: RefreshCw,
  MANUAL_EDIT: Edit3,
  ENRICHMENT_ADDED: Edit3,
  ENRICHMENT_REVERTED: Edit3,
  POLICY_VIOLATION_DETECTED: AlertTriangle,
  POLICY_VIOLATION_RESOLVED: CheckCircle,
  APPROVAL_GRANTED: UserCheck,
  APPROVAL_REVOKED: UserX,
  DATA_REFRESH: Database,
  OWNERSHIP_CHANGED: Users,
};

const severityColors = {
  info: {
    dot: 'bg-blue-400',
    icon: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  warning: {
    dot: 'bg-amber-400',
    icon: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  error: {
    dot: 'bg-rose-400',
    icon: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  success: {
    dot: 'bg-emerald-400',
    icon: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
};

function ActivityTimelineItem({
  activity,
  index,
  isLast,
}: {
  activity: ActivityItem;
  index: number;
  isLast: boolean;
}) {
  const Icon = iconMap[activity.action] || Zap;
  const colors = severityColors[activity.severity];

  return (
    <div
      className={cn(
        'relative flex gap-4 pb-4',
        'animate-fade-in-up'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Timeline line */}
      {!isLast && (
        <div
          className="absolute left-[13px] top-8 bottom-0 w-px bg-white/10"
        />
      )}

      {/* Icon/dot */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center',
            colors.bg,
            colors.border,
            'border'
          )}
        >
          <Icon className={cn('h-3.5 w-3.5', colors.icon)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm text-white/90 leading-snug">
          {activity.description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {activity.environmentName && (
            <Link
              href={`/dashboard/environments/${activity.environmentId}/graph`}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              {activity.environmentName}
            </Link>
          )}
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}

export function RecentActivityTimeline({
  activities,
  isLoading = false,
  maxItems = 10,
}: RecentActivityTimelineProps) {
  if (isLoading) {
    return <ActivityTimelineSkeleton />;
  }

  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">
          Recent Activity
        </h3>
        {activities.length > maxItems && (
          <Link
            href="/dashboard/insight"
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            View all
          </Link>
        )}
      </div>

      {/* Timeline */}
      {displayActivities.length > 0 ? (
        <div className="pl-1">
          {displayActivities.map((activity, index) => (
            <ActivityTimelineItem
              key={activity.id}
              activity={activity}
              index={index}
              isLast={index === displayActivities.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-400">No recent activity</p>
        </div>
      )}
    </div>
  );
}
