// Nexorium Core - Overview API
// GET /api/overview - Aggregated overview data for dashboard

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import type {
  OverviewData,
  OverviewKPIs,
  EnvironmentHealthSummary,
  ActivityItem,
  DriftAlert,
} from '@/types/overview';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const QuerySchema = z.object({
  projectIds: z.string().optional(),
  environmentIds: z.string().optional(),
  timeWindowDays: z.enum(['7', '30', '90']).optional().default('30'),
  riskThreshold: z.coerce.number().min(0).max(100).optional().default(0),
});

export async function GET(request: NextRequest) {
  // Require authentication and VIEW_ENVIRONMENT permission
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const validation = QuerySchema.safeParse({
      projectIds: searchParams.get('projectIds') ?? undefined,
      environmentIds: searchParams.get('environmentIds') ?? undefined,
      timeWindowDays: searchParams.get('timeWindowDays') ?? '30',
      riskThreshold: searchParams.get('riskThreshold') ?? '0',
    });

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { projectIds, environmentIds, timeWindowDays, riskThreshold } = validation.data;

    // Parse filter arrays
    const projectIdList = projectIds ? projectIds.split(',').filter(Boolean) : undefined;
    const environmentIdList = environmentIds ? environmentIds.split(',').filter(Boolean) : undefined;

    // Calculate time window
    const windowDays = parseInt(timeWindowDays);
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - windowDays);

    // Build environment filter
    const envWhere: Record<string, unknown> = {};
    if (environmentIdList?.length) {
      envWhere.id = { in: environmentIdList };
    }
    if (projectIdList?.length) {
      envWhere.ownership = {
        projectName: { in: projectIdList },
      };
    }

    // Fetch all data in parallel
    const [
      environments,
      componentInstanceCount,
      alignmentData,
      openViolationsCount,
      costAllocations,
      recentActivity,
      driftAlerts,
      snapshots,
    ] = await Promise.all([
      // Environments with stage and snapshot info
      prisma.environment.findMany({
        where: envWhere,
        include: {
          stage: true,
          ownership: true,
          componentInstances: {
            select: { id: true },
          },
          snapshots: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),

      // Total component instances (active systems)
      prisma.componentInstance.count({
        where: environmentIdList?.length ? { environmentId: { in: environmentIdList } } : undefined,
      }),

      // Alignment comparisons for governance %
      prisma.alignmentComparison.findMany({
        where: {
          comparedAt: { gte: windowStart },
          ...(environmentIdList?.length && { environmentId: { in: environmentIdList } }),
        },
        select: {
          alignedCount: true,
          driftedCount: true,
          missingCount: true,
          extraCount: true,
        },
      }),

      // Open policy violations
      prisma.policyViolation.count({
        where: {
          status: 'OPEN',
          ...(environmentIdList?.length && { environmentId: { in: environmentIdList } }),
        },
      }),

      // Cost allocations (most recent per environment)
      prisma.environmentCostAllocation.findMany({
        where: environmentIdList?.length ? { environmentId: { in: environmentIdList } } : undefined,
        orderBy: { computedAt: 'desc' },
        distinct: ['environmentId'],
        select: { totalCost: true, currency: true },
      }),

      // Recent activity logs
      prisma.environmentActivityLog.findMany({
        where: {
          createdAt: { gte: windowStart },
          ...(environmentIdList?.length && { environmentId: { in: environmentIdList } }),
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          environment: {
            select: { id: true, name: true },
          },
        },
      }),

      // Policy violations as drift alerts
      prisma.policyViolation.findMany({
        where: {
          status: { in: ['OPEN', 'ACKNOWLEDGED'] },
          ...(environmentIdList?.length && { environmentId: { in: environmentIdList } }),
        },
        orderBy: [
          { severity: 'desc' },
          { detectedAt: 'desc' },
        ],
        take: 10,
      }),

      // Snapshots for staleness check
      prisma.environmentSnapshot.findMany({
        where: environmentIdList?.length ? { environmentId: { in: environmentIdList } } : undefined,
        orderBy: { createdAt: 'desc' },
        distinct: ['environmentId'],
        select: {
          environmentId: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate KPIs
    const totalEnv = environments.length;

    // Governance alignment %
    let alignedTotal = 0;
    let totalItems = 0;
    for (const comparison of alignmentData) {
      alignedTotal += comparison.alignedCount;
      totalItems += comparison.alignedCount + comparison.driftedCount + comparison.missingCount + comparison.extraCount;
    }
    const governancePercent = totalItems > 0 ? Math.round((alignedTotal / totalItems) * 100) : 100;

    // Monthly cost
    const monthlyCost = costAllocations.reduce((sum, a) => sum + Number(a.totalCost), 0);
    const currency = costAllocations[0]?.currency || 'USD';

    // Average readiness score (calculated from environment health)
    const snapshotMap = new Map(snapshots.map(s => [s.environmentId, s.createdAt]));
    const staleThreshold = new Date();
    staleThreshold.setDate(staleThreshold.getDate() - 7); // 7 days staleness threshold

    // Calculate environment health summaries
    const environmentHealth: EnvironmentHealthSummary[] = environments.map((env) => {
      const lastSnapshot = snapshotMap.get(env.id);
      const isStale = !lastSnapshot || lastSnapshot < staleThreshold;

      // Calculate health score based on various factors
      let healthScore = 100;
      const componentCount = env.componentInstances.length;

      // Penalize for staleness
      if (isStale) healthScore -= 20;

      // Penalize for no components
      if (componentCount === 0) healthScore -= 30;

      // Health score minimum is 0
      healthScore = Math.max(0, healthScore);

      return {
        id: env.id,
        name: env.name,
        type: env.type,
        stageKey: env.stage?.key,
        stageName: env.stage?.name,
        stageColor: env.stage?.color ?? undefined,
        healthScore,
        componentCount,
        violationCount: 0, // Will be populated later
        driftCount: 0, // Will be populated later
        lastSnapshotAt: lastSnapshot ?? null,
        isStale,
      };
    });

    // Count violations per environment
    const violationCounts = await prisma.policyViolation.groupBy({
      by: ['environmentId'],
      where: {
        status: 'OPEN',
        environmentId: { not: null },
      },
      _count: true,
    });

    for (const vc of violationCounts) {
      if (!vc.environmentId) continue;
      const env = environmentHealth.find(e => e.id === vc.environmentId);
      if (env) {
        env.violationCount = vc._count;
        // Reduce health score based on violations
        env.healthScore = Math.max(0, env.healthScore - (vc._count * 5));
      }
    }

    // Average readiness score
    const avgReadiness = environmentHealth.length > 0
      ? Math.round(environmentHealth.reduce((sum, e) => sum + e.healthScore, 0) / environmentHealth.length)
      : 0;

    const kpis: OverviewKPIs = {
      totalEnvironments: totalEnv,
      activeSystems: componentInstanceCount,
      governanceAlignmentPercent: governancePercent,
      openViolations: openViolationsCount,
      avgReadinessScore: avgReadiness,
      monthlyCost,
      currency,
    };

    // Transform activity logs
    const activityItems: ActivityItem[] = recentActivity.map((log) => ({
      id: log.id,
      environmentId: log.environmentId,
      environmentName: log.environment.name,
      action: log.action,
      actorName: log.actorName,
      targetType: log.targetType,
      targetName: log.targetName,
      description: formatActivityDescription(log.action, log.targetType, log.targetName, log.actorName),
      severity: getActivitySeverity(log.action),
      createdAt: log.createdAt,
      details: log.details as Record<string, unknown> | null,
    }));

    // Transform drift alerts
    const driftAlertItems: DriftAlert[] = driftAlerts.map((v) => ({
      id: v.id,
      type: 'violation' as const,
      severity: v.severity,
      title: v.policyName,
      description: v.description,
      environmentId: v.environmentId,
      environmentName: undefined, // Would need to join to get name
      affectedCount: 1,
      detectedAt: v.detectedAt,
      actionUrl: v.environmentId ? `/dashboard/environments/${v.environmentId}/graph` : undefined,
    }));

    // Add stale environment alerts
    const staleEnvs = environmentHealth.filter(e => e.isStale);
    for (const env of staleEnvs) {
      driftAlertItems.push({
        id: `stale-${env.id}`,
        type: 'stale',
        severity: 'MEDIUM',
        title: 'Stale Environment',
        description: `${env.name} has not been refreshed in over 7 days`,
        environmentId: env.id,
        environmentName: env.name,
        affectedCount: 1,
        detectedAt: env.lastSnapshotAt ?? new Date(),
        actionUrl: `/dashboard/environments/${env.id}/graph`,
      });
    }

    // Sort alerts by severity
    const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    driftAlertItems.sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

    // Apply risk threshold filter
    const filteredAlerts = riskThreshold > 0
      ? driftAlertItems.filter(a => {
          const severityScore = { CRITICAL: 100, HIGH: 75, MEDIUM: 50, LOW: 25 };
          return (severityScore[a.severity] ?? 0) >= riskThreshold;
        })
      : driftAlertItems;

    const overviewData: OverviewData = {
      kpis,
      environmentHealth: environmentHealth.slice(0, 8), // Show top 8 environments
      recentActivity: activityItems,
      driftAlerts: filteredAlerts.slice(0, 10),
      lastUpdatedAt: new Date(),
    };

    return NextResponse.json({ success: true, data: overviewData });
  } catch (error) {
    console.error('Failed to fetch overview data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}

// Helper functions
function formatActivityDescription(
  action: string,
  targetType?: string | null,
  targetName?: string | null,
  actorName?: string | null
): string {
  const actor = actorName || 'System';
  const target = targetName ? ` ${targetType} "${targetName}"` : '';

  switch (action) {
    case 'SNAPSHOT_CREATED':
      return `${actor} created a snapshot${target}`;
    case 'CONNECTOR_RUN':
      return `${actor} ran connector${target}`;
    case 'MANUAL_EDIT':
      return `${actor} edited${target}`;
    case 'ENRICHMENT_ADDED':
      return `${actor} added enrichment to${target}`;
    case 'ENRICHMENT_REVERTED':
      return `${actor} reverted enrichment on${target}`;
    case 'POLICY_VIOLATION_DETECTED':
      return `Policy violation detected${target}`;
    case 'POLICY_VIOLATION_RESOLVED':
      return `${actor} resolved violation${target}`;
    case 'APPROVAL_GRANTED':
      return `${actor} granted approval${target}`;
    case 'APPROVAL_REVOKED':
      return `${actor} revoked approval${target}`;
    case 'DATA_REFRESH':
      return `${actor} refreshed data${target}`;
    case 'OWNERSHIP_CHANGED':
      return `Ownership changed${target}`;
    default:
      return `${actor} performed ${action}${target}`;
  }
}

function getActivitySeverity(action: string): 'info' | 'warning' | 'error' | 'success' {
  switch (action) {
    case 'POLICY_VIOLATION_DETECTED':
      return 'error';
    case 'POLICY_VIOLATION_RESOLVED':
    case 'APPROVAL_GRANTED':
    case 'SNAPSHOT_CREATED':
      return 'success';
    case 'APPROVAL_REVOKED':
    case 'ENRICHMENT_REVERTED':
      return 'warning';
    default:
      return 'info';
  }
}
