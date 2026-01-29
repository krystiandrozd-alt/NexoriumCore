'use client';

// Nexorium Core - Skeleton Loading States
// Loading placeholders for overview components

import { cn } from '@/lib/utils';

// Base skeleton pulse animation
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white/10 rounded animate-pulse',
        className
      )}
    />
  );
}

// KPI Card Skeleton
export function KPICardSkeleton() {
  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-9 w-24 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="w-11 h-11 rounded-xl" />
      </div>
    </div>
  );
}

// KPI Grid Skeleton
export function KPIGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}

// Environment Health Card Skeleton
export function EnvironmentHealthCardSkeleton() {
  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-28 mb-1" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="w-14 h-14 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="mt-3 pt-3 border-t border-white/5">
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

// Environment Health Grid Skeleton
export function EnvironmentHealthGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <EnvironmentHealthCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Activity Item Skeleton
export function ActivityItemSkeleton() {
  return (
    <div className="flex gap-4 py-3">
      <div className="relative">
        <Skeleton className="w-3 h-3 rounded-full" />
      </div>
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

// Activity Timeline Skeleton
export function ActivityTimelineSkeleton() {
  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-1 pl-4 border-l border-white/10">
        {Array.from({ length: 5 }).map((_, i) => (
          <ActivityItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Alert Card Skeleton
export function AlertCardSkeleton() {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-5 h-5 rounded" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

// Alerts Panel Skeleton
export function AlertsPanelSkeleton() {
  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <AlertCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Quick Navigation Card Skeleton
export function QuickNavCardSkeleton() {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
}

// Quick Navigation Grid Skeleton
export function QuickNavigationSkeleton() {
  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <QuickNavCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Full Page Skeleton (combines all sections)
export function OverviewPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* KPI Grid */}
      <KPIGridSkeleton />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Environment Health (2 cols) */}
        <div className="lg:col-span-2">
          <EnvironmentHealthGridSkeleton />
        </div>

        {/* Alerts Panel (1 col) */}
        <AlertsPanelSkeleton />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimelineSkeleton />
        <QuickNavigationSkeleton />
      </div>
    </div>
  );
}
