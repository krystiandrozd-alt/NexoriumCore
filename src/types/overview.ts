// Nexorium Core - Overview Dashboard Type Definitions

import type { EnvironmentType, StageKey, ViolationSeverity, ActivityActionType } from './index';

// Re-export types needed by components
export type { ActivityActionType, ViolationSeverity };

// ============================================
// KPI TYPES
// ============================================

export interface OverviewKPIs {
  totalEnvironments: number;
  activeSystems: number;
  governanceAlignmentPercent: number;
  openViolations: number;
  avgReadinessScore: number;
  monthlyCost: number;
  currency: string;
  // Trend data (percentage change from previous period)
  trends?: {
    environments?: number;
    systems?: number;
    governance?: number;
    violations?: number;
    readiness?: number;
    cost?: number;
  };
}

// ============================================
// ENVIRONMENT HEALTH TYPES
// ============================================

export interface EnvironmentHealthSummary {
  id: string;
  name: string;
  type: EnvironmentType;
  stageKey?: StageKey;
  stageName?: string;
  stageColor?: string;
  healthScore: number; // 0-100
  componentCount: number;
  violationCount: number;
  driftCount: number;
  lastSnapshotAt?: Date | null;
  isStale: boolean; // True if snapshot is older than threshold
}

// ============================================
// ACTIVITY TYPES
// ============================================

export interface ActivityItem {
  id: string;
  environmentId?: string | null;
  environmentName?: string | null;
  action: ActivityActionType;
  actorName?: string | null;
  targetType?: string | null;
  targetName?: string | null;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  createdAt: Date;
  details?: Record<string, unknown> | null;
}

// ============================================
// DRIFT ALERT TYPES
// ============================================

export type DriftAlertType = 'drift' | 'violation' | 'stale' | 'orphan';

export interface DriftAlert {
  id: string;
  type: DriftAlertType;
  severity: ViolationSeverity;
  title: string;
  description: string;
  environmentId?: string | null;
  environmentName?: string | null;
  affectedCount: number;
  detectedAt: Date;
  actionUrl?: string;
}

// ============================================
// FILTER TYPES
// ============================================

export interface OverviewFilters {
  projectIds?: string[];
  environmentIds?: string[];
  timeWindowDays: 7 | 30 | 90;
  riskThreshold: number; // 0-100
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// ============================================
// QUICK NAVIGATION TYPES
// ============================================

export interface QuickNavItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string; // Icon name for dynamic loading
  color: string; // Tailwind color class
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface OverviewData {
  kpis: OverviewKPIs;
  environmentHealth: EnvironmentHealthSummary[];
  recentActivity: ActivityItem[];
  driftAlerts: DriftAlert[];
  lastUpdatedAt: Date;
}

export interface OverviewApiResponse {
  success: boolean;
  data?: OverviewData;
  error?: string;
}

export interface ActivityApiResponse {
  success: boolean;
  data?: {
    items: ActivityItem[];
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

// ============================================
// FILTER OPTIONS RESPONSE
// ============================================

export interface FilterOptionsResponse {
  success: boolean;
  data?: {
    projects: FilterOption[];
    environments: FilterOption[];
  };
  error?: string;
}
