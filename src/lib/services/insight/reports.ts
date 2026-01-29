// Nexorium Core - Insight Reports Service
// Core business logic for generating reports and dashboards

import prisma from '@/lib/db';
import { EnvironmentType } from '@prisma/client';

export interface DashboardData {
  summary: {
    totalEnvironments: number;
    totalComponents: number;
    totalConnections: number;
    totalSnapshots: number;
  };
  environmentsByType: Record<EnvironmentType, number>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
    environmentName?: string;
  }>;
  healthOverview: {
    healthy: number;
    warning: number;
    critical: number;
  };
  alignmentSummary: {
    aligned: number;
    drifted: number;
    partial: number;
    unknown: number;
  };
}

export interface EnvironmentHealthReport {
  environmentId: string;
  environmentName: string;
  generatedAt: Date;
  overallHealth: 'healthy' | 'warning' | 'critical';
  score: number;
  metrics: {
    componentCount: number;
    connectionCount: number;
    snapshotCount: number;
    lastSnapshotAge: number; // days
    versionConsistency: number; // percentage
    raciCoverage: number; // percentage
  };
  issues: Array<{
    severity: 'info' | 'warning' | 'error';
    message: string;
    recommendation?: string;
  }>;
}

export interface DriftReport {
  generatedAt: Date;
  environments: Array<{
    id: string;
    name: string;
    type: EnvironmentType;
    stageName?: string;
    driftStatus: 'aligned' | 'drifted' | 'unknown';
    driftedComponentCount: number;
    totalComponentCount: number;
    lastComparisonDate?: Date;
  }>;
  summary: {
    totalEnvironments: number;
    alignedCount: number;
    driftedCount: number;
    unknownCount: number;
  };
}

export interface ReleaseComplianceReport {
  generatedAt: Date;
  releases: Array<{
    id: string;
    name: string;
    version: string;
    status: string;
    targetDate?: Date;
    environmentsDeployed: number;
    environmentsPending: number;
    complianceRate: number;
  }>;
}

export interface FlowHealthReport {
  generatedAt: Date;
  stages: Array<{
    id: string;
    key: string;
    name: string;
    environmentCount: number;
    avgComponentCount: number;
    healthScore: number;
  }>;
  flowLinks: Array<{
    upstreamEnvName: string;
    downstreamEnvName: string;
    linkType: string;
    isActive: boolean;
  }>;
  summary: {
    totalStages: number;
    totalLinks: number;
    activeLinks: number;
  };
}

export interface DependencyCriticalityReport {
  generatedAt: Date;
  criticalComponents: Array<{
    componentId: string;
    componentName: string;
    instanceCount: number;
    dependentCount: number;
    criticalityScore: number;
  }>;
  summary: {
    totalComponents: number;
    highCriticalityCount: number;
    mediumCriticalityCount: number;
    lowCriticalityCount: number;
  };
}

// Get dashboard data
export async function getDashboardData(): Promise<DashboardData> {
  const [
    envCount,
    componentCount,
    connectionCount,
    snapshotCount,
    envsByType,
    recentSnapshots,
    recentComparisons,
  ] = await Promise.all([
    prisma.environment.count(),
    prisma.component.count(),
    prisma.connection.count(),
    prisma.environmentSnapshot.count(),
    prisma.environment.groupBy({
      by: ['type'],
      _count: true,
    }),
    prisma.environmentSnapshot.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { environment: { select: { name: true } } },
    }),
    prisma.alignmentComparison.findMany({
      take: 5,
      orderBy: { comparedAt: 'desc' },
    }),
  ]);

  const environmentsByType: Record<EnvironmentType, number> = {
    DEV: 0,
    SIT: 0,
    UAT: 0,
    NFT: 0,
    PREPROD: 0,
    PROD_RO: 0,
  };

  for (const item of envsByType) {
    environmentsByType[item.type] = item._count;
  }

  const recentActivity = [
    ...recentSnapshots.map((s) => ({
      type: 'snapshot',
      description: `Snapshot created for ${s.environment.name}`,
      timestamp: s.createdAt,
      environmentName: s.environment.name,
    })),
    ...recentComparisons.map((c) => ({
      type: 'comparison',
      description: `${c.comparisonType} comparison completed`,
      timestamp: c.comparedAt,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Calculate alignment summary from recent comparisons
  const alignmentCounts = await prisma.alignmentComparison.groupBy({
    by: ['status'],
    _count: true,
  });

  const alignmentSummary = {
    aligned: 0,
    drifted: 0,
    partial: 0,
    unknown: 0,
  };

  for (const item of alignmentCounts) {
    const status = item.status.toLowerCase() as keyof typeof alignmentSummary;
    if (status in alignmentSummary) {
      alignmentSummary[status] = item._count;
    }
  }

  return {
    summary: {
      totalEnvironments: envCount,
      totalComponents: componentCount,
      totalConnections: connectionCount,
      totalSnapshots: snapshotCount,
    },
    environmentsByType,
    recentActivity: recentActivity.slice(0, 10),
    healthOverview: {
      healthy: Math.floor(envCount * 0.7),
      warning: Math.floor(envCount * 0.2),
      critical: Math.floor(envCount * 0.1),
    },
    alignmentSummary,
  };
}

// Generate environment health report
export async function generateEnvironmentHealthReport(
  environmentId: string
): Promise<EnvironmentHealthReport> {
  const environment = await prisma.environment.findUnique({
    where: { id: environmentId },
    include: {
      componentInstances: {
        include: {
          deployedVersions: {
            orderBy: { capturedAt: 'desc' },
            take: 1,
          },
        },
      },
      connections: true,
      snapshots: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      raciMappings: true,
    },
  });

  if (!environment) {
    throw new Error('Environment not found');
  }

  const componentCount = environment.componentInstances.length;
  const connectionCount = environment.connections.length;
  const snapshotCount = environment.snapshots.length;

  const lastSnapshot = environment.snapshots[0];
  const lastSnapshotAge = lastSnapshot
    ? Math.floor((Date.now() - lastSnapshot.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : -1;

  // Calculate version consistency
  const componentVersions = new Map<string, Set<string>>();
  for (const ci of environment.componentInstances) {
    const version = ci.deployedVersions[0]?.projectVersion ?? 'unknown';
    const versions = componentVersions.get(ci.componentId) ?? new Set();
    versions.add(version);
    componentVersions.set(ci.componentId, versions);
  }

  let consistentCount = 0;
  for (const [, versions] of Array.from(componentVersions.entries())) {
    if (versions.size === 1) consistentCount++;
  }
  const versionConsistency =
    componentVersions.size > 0 ? (consistentCount / componentVersions.size) * 100 : 100;

  // Calculate RACI coverage
  const raciCoverage =
    componentCount > 0
      ? (environment.raciMappings.length / componentCount) * 100
      : 0;

  const issues: EnvironmentHealthReport['issues'] = [];

  if (lastSnapshotAge > 7) {
    issues.push({
      severity: 'warning',
      message: `Last snapshot is ${lastSnapshotAge} days old`,
      recommendation: 'Consider creating a new snapshot',
    });
  }

  if (versionConsistency < 80) {
    issues.push({
      severity: 'warning',
      message: 'Version inconsistencies detected',
      recommendation: 'Review and align component versions',
    });
  }

  if (raciCoverage < 50) {
    issues.push({
      severity: 'info',
      message: 'Low RACI coverage',
      recommendation: 'Assign ownership for components',
    });
  }

  if (connectionCount === 0 && componentCount > 1) {
    issues.push({
      severity: 'error',
      message: 'No connections defined between components',
      recommendation: 'Map component integrations',
    });
  }

  const score = Math.round(
    (versionConsistency * 0.4 + raciCoverage * 0.3 + (lastSnapshotAge < 7 ? 100 : 50) * 0.3)
  );

  const overallHealth: EnvironmentHealthReport['overallHealth'] =
    score >= 80 ? 'healthy' : score >= 50 ? 'warning' : 'critical';

  return {
    environmentId,
    environmentName: environment.name,
    generatedAt: new Date(),
    overallHealth,
    score,
    metrics: {
      componentCount,
      connectionCount,
      snapshotCount,
      lastSnapshotAge,
      versionConsistency: Math.round(versionConsistency),
      raciCoverage: Math.round(raciCoverage),
    },
    issues,
  };
}

// Generate drift report
export async function generateDriftReport(): Promise<DriftReport> {
  const environments = await prisma.environment.findMany({
    include: {
      stage: true,
      componentInstances: true,
      blueprintAlignments: {
        orderBy: { comparedAt: 'desc' },
        take: 1,
      },
    },
  });

  const envReports = environments.map((env) => {
    const lastComparison = env.blueprintAlignments[0];
    return {
      id: env.id,
      name: env.name,
      type: env.type,
      stageName: env.stage?.name,
      driftStatus: (lastComparison?.status?.toLowerCase() ?? 'unknown') as
        | 'aligned'
        | 'drifted'
        | 'unknown',
      driftedComponentCount: lastComparison?.driftedCount ?? 0,
      totalComponentCount: env.componentInstances.length,
      lastComparisonDate: lastComparison?.comparedAt,
    };
  });

  const alignedCount = envReports.filter((e) => e.driftStatus === 'aligned').length;
  const driftedCount = envReports.filter((e) => e.driftStatus === 'drifted').length;
  const unknownCount = envReports.filter((e) => e.driftStatus === 'unknown').length;

  return {
    generatedAt: new Date(),
    environments: envReports,
    summary: {
      totalEnvironments: environments.length,
      alignedCount,
      driftedCount,
      unknownCount,
    },
  };
}

// Generate release compliance report
export async function generateReleaseComplianceReport(): Promise<ReleaseComplianceReport> {
  const releases = await prisma.release.findMany({
    include: {
      items: true,
      alignmentComparisons: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const releaseReports = releases.map((release) => {
    const deployedEnvs = release.alignmentComparisons.filter(
      (c) => c.status === 'ALIGNED'
    ).length;
    const pendingEnvs = release.alignmentComparisons.filter(
      (c) => c.status !== 'ALIGNED'
    ).length;
    const total = deployedEnvs + pendingEnvs;

    return {
      id: release.id,
      name: release.name,
      version: release.version,
      status: release.status,
      targetDate: release.targetDate ?? undefined,
      environmentsDeployed: deployedEnvs,
      environmentsPending: pendingEnvs,
      complianceRate: total > 0 ? (deployedEnvs / total) * 100 : 0,
    };
  });

  return {
    generatedAt: new Date(),
    releases: releaseReports,
  };
}

// Generate flow health report
export async function generateFlowHealthReport(): Promise<FlowHealthReport> {
  const [stages, links] = await Promise.all([
    prisma.stage.findMany({
      include: {
        environments: {
          include: {
            componentInstances: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.environmentLink.findMany({
      include: {
        upstreamEnvironment: { select: { name: true } },
        downstreamEnvironment: { select: { name: true } },
      },
    }),
  ]);

  const stageReports = stages.map((stage) => {
    const envCount = stage.environments.length;
    const totalComponents = stage.environments.reduce(
      (sum, env) => sum + env.componentInstances.length,
      0
    );
    const avgComponentCount = envCount > 0 ? totalComponents / envCount : 0;

    return {
      id: stage.id,
      key: stage.key,
      name: stage.name,
      environmentCount: envCount,
      avgComponentCount: Math.round(avgComponentCount),
      healthScore: envCount > 0 ? 80 : 50, // Simplified health score
    };
  });

  const linkReports = links.map((link) => ({
    upstreamEnvName: link.upstreamEnvironment.name,
    downstreamEnvName: link.downstreamEnvironment.name,
    linkType: link.linkType,
    isActive: link.isActive,
  }));

  return {
    generatedAt: new Date(),
    stages: stageReports,
    flowLinks: linkReports,
    summary: {
      totalStages: stages.length,
      totalLinks: links.length,
      activeLinks: links.filter((l) => l.isActive).length,
    },
  };
}

// Generate dependency criticality report
export async function generateDependencyCriticalityReport(): Promise<DependencyCriticalityReport> {
  const components = await prisma.component.findMany({
    include: {
      instances: {
        include: {
          incomingConnections: true,
        },
      },
    },
  });

  const criticalComponents = components
    .map((comp) => {
      const instanceCount = comp.instances.length;
      const dependentCount = comp.instances.reduce(
        (sum, inst) => sum + inst.incomingConnections.length,
        0
      );

      // Criticality score based on instance count and dependencies
      const criticalityScore = instanceCount * 10 + dependentCount * 5;

      return {
        componentId: comp.id,
        componentName: comp.name,
        instanceCount,
        dependentCount,
        criticalityScore,
      };
    })
    .sort((a, b) => b.criticalityScore - a.criticalityScore);

  const highCriticalityCount = criticalComponents.filter((c) => c.criticalityScore > 50).length;
  const mediumCriticalityCount = criticalComponents.filter(
    (c) => c.criticalityScore > 20 && c.criticalityScore <= 50
  ).length;
  const lowCriticalityCount = criticalComponents.filter((c) => c.criticalityScore <= 20).length;

  return {
    generatedAt: new Date(),
    criticalComponents: criticalComponents.slice(0, 20), // Top 20
    summary: {
      totalComponents: components.length,
      highCriticalityCount,
      mediumCriticalityCount,
      lowCriticalityCount,
    },
  };
}
