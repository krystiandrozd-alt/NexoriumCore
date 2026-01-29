'use client';

// Nexorium Core - Overview Dashboard Page
// Aggregated view of all 6 pillars with premium styling

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useOverviewData } from '@/hooks/useOverviewData';
import { OverviewHeader } from '@/components/overview/OverviewHeader';
import { OverviewKPIGrid } from '@/components/overview/OverviewKPIGrid';
import { EnvironmentHealthGrid } from '@/components/overview/EnvironmentHealthGrid';
import { RecentActivityTimeline } from '@/components/overview/RecentActivityTimeline';
import { DriftAlertsPanel } from '@/components/overview/DriftAlertsPanel';
import { QuickNavigation } from '@/components/overview/QuickNavigation';
import { OverviewPageSkeleton } from '@/components/overview/SkeletonStates';
import type { OverviewFilters, FilterOption } from '@/types/overview';

// Mock filter options - in production these would come from the API
const mockProjectOptions: FilterOption[] = [
  { value: 'cpq', label: 'CPQ Platform', count: 3 },
  { value: 'billing', label: 'Billing System', count: 4 },
  { value: 'crm', label: 'CRM Migration', count: 2 },
];

const mockEnvironmentOptions: FilterOption[] = [
  { value: 'env1', label: 'SIT1' },
  { value: 'env2', label: 'SIT2' },
  { value: 'env3', label: 'UAT' },
  { value: 'env4', label: 'NFT' },
  { value: 'env5', label: 'PREPROD' },
];

export default function OverviewPage() {
  // Filter state
  const [filters, setFilters] = useState<OverviewFilters>({
    timeWindowDays: 30,
    riskThreshold: 0,
  });

  // Fetch overview data
  const { data, isLoading, error, refetch } = useOverviewData({
    filters,
    refreshInterval: 60000, // Refresh every minute
  });

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: OverviewFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle create snapshot action
  const handleCreateSnapshot = useCallback(() => {
    // TODO: Implement snapshot creation modal/flow
    console.log('Create snapshot clicked');
  }, []);

  // Show skeleton while loading
  if (isLoading && !data) {
    return (
      <div className="min-h-screen premium-canvas-bg p-6">
        <OverviewPageSkeleton />
      </div>
    );
  }

  // Show error state
  if (error && !data) {
    return (
      <div className="min-h-screen premium-canvas-bg p-6">
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-6 text-center">
          <h2 className="text-lg font-semibold text-white mb-2">
            Failed to load overview
          </h2>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'bg-violet-500/20 text-violet-300',
              'hover:bg-violet-500/30 transition-colors'
            )}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen premium-canvas-bg">
      <div className="p-6 space-y-6">
        {/* Header with filters */}
        <OverviewHeader
          filters={filters}
          onFiltersChange={handleFiltersChange}
          projectOptions={mockProjectOptions}
          environmentOptions={mockEnvironmentOptions}
          onCreateSnapshot={handleCreateSnapshot}
        />

        {/* KPI Grid */}
        <OverviewKPIGrid
          kpis={data?.kpis || null}
          isLoading={isLoading}
        />

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Environment Health Grid (2 cols on large screens) */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-4">
                Environment Health
              </h3>
              <EnvironmentHealthGrid
                environments={data?.environmentHealth || []}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Drift Alerts Panel (1 col) */}
          <DriftAlertsPanel
            alerts={data?.driftAlerts || []}
            isLoading={isLoading}
          />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity Timeline */}
          <RecentActivityTimeline
            activities={data?.recentActivity || []}
            isLoading={isLoading}
          />

          {/* Quick Navigation */}
          <QuickNavigation isLoading={isLoading} />
        </div>

        {/* Last updated indicator */}
        {data?.lastUpdatedAt && (
          <div className="text-center">
            <p className="text-xs text-slate-500">
              Last updated: {new Date(data.lastUpdatedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
