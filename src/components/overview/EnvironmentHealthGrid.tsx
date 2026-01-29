'use client';

// Nexorium Core - Environment Health Grid Component
// Displays environment health status cards in a responsive grid

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { EnvironmentHealthSummary } from '@/types/overview';
import { EnvironmentHealthCardSkeleton } from './SkeletonStates';

interface EnvironmentHealthGridProps {
  environments: EnvironmentHealthSummary[];
  isLoading?: boolean;
}

// Circular gauge component for health score
function HealthGauge({ score, size = 56 }: { score: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return { stroke: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }; // emerald
    if (score >= 50) return { stroke: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }; // amber
    return { stroke: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }; // rose
  };

  const colors = getColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 4px ${colors.stroke}40)`,
          }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white"
      >
        {score}
      </div>
    </div>
  );
}

// Individual environment card
function EnvironmentHealthCard({
  environment,
  index,
}: {
  environment: EnvironmentHealthSummary;
  index: number;
}) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/environments/${environment.id}/graph`);
  };

  const getStatusIcon = () => {
    if (environment.violationCount > 0 || environment.driftCount > 0) {
      return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
    }
    if (environment.isStale) {
      return <Clock className="h-3.5 w-3.5 text-slate-400" />;
    }
    return <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />;
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left rounded-xl',
        'bg-white/5 backdrop-blur-sm',
        'border border-white/10',
        'hover:border-white/20 hover:bg-white/[0.07]',
        'transition-all duration-300',
        'hover:translate-y-[-2px]',
        'hover:shadow-lg hover:shadow-black/20',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
        'p-4',
        'animate-fade-in-up'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white truncate">
              {environment.name}
            </h3>
            {getStatusIcon()}
          </div>
          {environment.stageName && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: environment.stageColor
                  ? `${environment.stageColor}20`
                  : 'rgba(139, 92, 246, 0.2)',
                color: environment.stageColor || '#c4b5fd',
              }}
            >
              {environment.stageName}
            </span>
          )}
        </div>
        <HealthGauge score={environment.healthScore} />
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
          {environment.componentCount} systems
        </span>
        {environment.violationCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300">
            {environment.violationCount} violations
          </span>
        )}
        {environment.driftCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">
            {environment.driftCount} drifts
          </span>
        )}
      </div>

      {/* Last snapshot */}
      <div className="pt-3 border-t border-white/5">
        <p className="text-xs text-slate-500">
          {environment.lastSnapshotAt ? (
            <>
              Last snapshot{' '}
              <span className={environment.isStale ? 'text-amber-400' : 'text-slate-400'}>
                {formatDistanceToNow(new Date(environment.lastSnapshotAt), {
                  addSuffix: true,
                })}
              </span>
            </>
          ) : (
            <span className="text-slate-500">No snapshots yet</span>
          )}
        </p>
      </div>
    </button>
  );
}

export function EnvironmentHealthGrid({
  environments,
  isLoading = false,
}: EnvironmentHealthGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <EnvironmentHealthCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (environments.length === 0) {
    return (
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-medium text-white">No environments found</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Create your first environment to start tracking health and governance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {environments.map((env, index) => (
        <EnvironmentHealthCard
          key={env.id}
          environment={env}
          index={index}
        />
      ))}
    </div>
  );
}
