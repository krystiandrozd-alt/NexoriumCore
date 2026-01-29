// Nexorium Core - Alignment Service
// Core business logic for environment comparison and drift detection

import prisma from '@/lib/db';
import { ComparisonType, AlignmentStatus, Prisma } from '@prisma/client';

export interface CrossEnvDiffResult {
  sourceEnvId: string;
  sourceEnvName: string;
  targetEnvId: string;
  targetEnvName: string;
  status: AlignmentStatus;
  summary: {
    alignedComponents: number;
    driftedComponents: number;
    missingInTarget: number;
    extraInTarget: number;
    totalConnections: number;
    matchingConnections: number;
  };
  componentDiffs: Array<{
    componentId: string;
    componentName: string;
    status: 'aligned' | 'drifted' | 'missing_in_target' | 'extra_in_target';
    sourceVersion?: string;
    targetVersion?: string;
    message: string;
  }>;
  connectionDiffs: Array<{
    fromComponent: string;
    toComponent: string;
    status: 'aligned' | 'missing_in_target' | 'extra_in_target';
    protocol: string;
  }>;
}

export interface NonProdVsProdResult {
  nonProdEnvId: string;
  nonProdEnvName: string;
  prodEnvId: string;
  prodEnvName: string;
  status: AlignmentStatus;
  warnings: string[];
  componentDiffs: Array<{
    componentId: string;
    componentName: string;
    nonProdVersion?: string;
    prodVersion?: string;
    hasVersionDrift: boolean;
    message: string;
  }>;
}

// Compare two environments
export async function compareEnvironments(
  sourceEnvId: string,
  targetEnvId: string
): Promise<CrossEnvDiffResult> {
  const [sourceEnv, targetEnv] = await Promise.all([
    prisma.environment.findUnique({
      where: { id: sourceEnvId },
      include: {
        componentInstances: {
          include: {
            component: true,
            deployedVersions: {
              orderBy: { capturedAt: 'desc' },
              take: 1,
            },
          },
        },
        connections: {
          include: {
            fromComponentInstance: { include: { component: true } },
            toComponentInstance: { include: { component: true } },
          },
        },
      },
    }),
    prisma.environment.findUnique({
      where: { id: targetEnvId },
      include: {
        componentInstances: {
          include: {
            component: true,
            deployedVersions: {
              orderBy: { capturedAt: 'desc' },
              take: 1,
            },
          },
        },
        connections: {
          include: {
            fromComponentInstance: { include: { component: true } },
            toComponentInstance: { include: { component: true } },
          },
        },
      },
    }),
  ]);

  if (!sourceEnv || !targetEnv) {
    throw new Error('One or both environments not found');
  }

  // Build maps for comparison
  const sourceComponents = new Map(
    sourceEnv.componentInstances.map((ci) => [
      ci.componentId,
      {
        name: ci.component.name,
        version: ci.deployedVersions[0]?.projectVersion,
      },
    ])
  );

  const targetComponents = new Map(
    targetEnv.componentInstances.map((ci) => [
      ci.componentId,
      {
        name: ci.component.name,
        version: ci.deployedVersions[0]?.projectVersion,
      },
    ])
  );

  const componentDiffs: CrossEnvDiffResult['componentDiffs'] = [];
  let alignedComponents = 0;
  let driftedComponents = 0;
  let missingInTarget = 0;
  let extraInTarget = 0;

  // Check source components against target
  for (const [compId, source] of Array.from(sourceComponents.entries())) {
    const target = targetComponents.get(compId);

    if (!target) {
      componentDiffs.push({
        componentId: compId,
        componentName: source.name,
        status: 'missing_in_target',
        sourceVersion: source.version,
        message: `Component ${source.name} exists in source but not in target`,
      });
      missingInTarget++;
    } else if (source.version !== target.version) {
      componentDiffs.push({
        componentId: compId,
        componentName: source.name,
        status: 'drifted',
        sourceVersion: source.version,
        targetVersion: target.version,
        message: `Version drift: source=${source.version}, target=${target.version}`,
      });
      driftedComponents++;
    } else {
      componentDiffs.push({
        componentId: compId,
        componentName: source.name,
        status: 'aligned',
        sourceVersion: source.version,
        targetVersion: target.version,
        message: 'Aligned',
      });
      alignedComponents++;
    }
    targetComponents.delete(compId);
  }

  // Remaining in target are extra
  for (const [compId, target] of Array.from(targetComponents.entries())) {
    componentDiffs.push({
      componentId: compId,
      componentName: target.name,
      status: 'extra_in_target',
      targetVersion: target.version,
      message: `Component ${target.name} exists in target but not in source`,
    });
    extraInTarget++;
  }

  // Compare connections
  const sourceConnections = new Set(
    sourceEnv.connections.map(
      (c) =>
        `${c.fromComponentInstance.component.name}:${c.toComponentInstance.component.name}:${c.protocolType}`
    )
  );

  const targetConnections = new Set(
    targetEnv.connections.map(
      (c) =>
        `${c.fromComponentInstance.component.name}:${c.toComponentInstance.component.name}:${c.protocolType}`
    )
  );

  const connectionDiffs: CrossEnvDiffResult['connectionDiffs'] = [];
  let matchingConnections = 0;

  for (const conn of Array.from(sourceConnections)) {
    const [from, to, protocol] = conn.split(':');
    if (targetConnections.has(conn)) {
      connectionDiffs.push({
        fromComponent: from,
        toComponent: to,
        status: 'aligned',
        protocol,
      });
      matchingConnections++;
      targetConnections.delete(conn);
    } else {
      connectionDiffs.push({
        fromComponent: from,
        toComponent: to,
        status: 'missing_in_target',
        protocol,
      });
    }
  }

  for (const conn of Array.from(targetConnections)) {
    const [from, to, protocol] = conn.split(':');
    connectionDiffs.push({
      fromComponent: from,
      toComponent: to,
      status: 'extra_in_target',
      protocol,
    });
  }

  // Determine overall status
  let status: AlignmentStatus;
  if (driftedComponents === 0 && missingInTarget === 0 && extraInTarget === 0) {
    status = AlignmentStatus.ALIGNED;
  } else if (alignedComponents > 0 && (driftedComponents > 0 || missingInTarget > 0)) {
    status = AlignmentStatus.PARTIAL;
  } else {
    status = AlignmentStatus.DRIFTED;
  }

  const result: CrossEnvDiffResult = {
    sourceEnvId,
    sourceEnvName: sourceEnv.name,
    targetEnvId,
    targetEnvName: targetEnv.name,
    status,
    summary: {
      alignedComponents,
      driftedComponents,
      missingInTarget,
      extraInTarget,
      totalConnections: sourceEnv.connections.length,
      matchingConnections,
    },
    componentDiffs,
    connectionDiffs,
  };

  // Store comparison
  await prisma.alignmentComparison.create({
    data: {
      comparisonType: ComparisonType.CROSS_ENVIRONMENT,
      environmentId: sourceEnvId,
      targetEnvironmentId: targetEnvId,
      status,
      alignedCount: alignedComponents,
      driftedCount: driftedComponents,
      missingCount: missingInTarget,
      extraCount: extraInTarget,
      detailsJson: result as unknown as Prisma.InputJsonValue,
    },
  });

  return result;
}

// Compare non-prod environment against production
export async function compareNonProdVsProd(
  nonProdEnvId: string,
  prodEnvId: string
): Promise<NonProdVsProdResult> {
  const [nonProdEnv, prodEnv] = await Promise.all([
    prisma.environment.findUnique({
      where: { id: nonProdEnvId },
      include: {
        componentInstances: {
          include: {
            component: true,
            deployedVersions: {
              orderBy: { capturedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    }),
    prisma.environment.findUnique({
      where: { id: prodEnvId },
      include: {
        componentInstances: {
          include: {
            component: true,
            deployedVersions: {
              orderBy: { capturedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    }),
  ]);

  if (!nonProdEnv || !prodEnv) {
    throw new Error('One or both environments not found');
  }

  // Verify prod environment is read-only type
  const warnings: string[] = [];
  if (prodEnv.type !== 'PROD_RO') {
    warnings.push(
      `Target environment ${prodEnv.name} is not marked as production read-only`
    );
  }

  const prodComponents = new Map(
    prodEnv.componentInstances.map((ci) => [
      ci.componentId,
      {
        name: ci.component.name,
        version: ci.deployedVersions[0]?.projectVersion,
      },
    ])
  );

  const componentDiffs: NonProdVsProdResult['componentDiffs'] = [];

  for (const ci of nonProdEnv.componentInstances) {
    const prodComp = prodComponents.get(ci.componentId);
    const nonProdVersion = ci.deployedVersions[0]?.projectVersion;

    if (!prodComp) {
      componentDiffs.push({
        componentId: ci.componentId,
        componentName: ci.component.name,
        nonProdVersion,
        hasVersionDrift: true,
        message: `Component ${ci.component.name} not found in production`,
      });
    } else {
      const hasVersionDrift = nonProdVersion !== prodComp.version;
      componentDiffs.push({
        componentId: ci.componentId,
        componentName: ci.component.name,
        nonProdVersion,
        prodVersion: prodComp.version,
        hasVersionDrift,
        message: hasVersionDrift
          ? `Version drift: non-prod=${nonProdVersion}, prod=${prodComp.version}`
          : 'Versions match',
      });
    }
  }

  const driftedCount = componentDiffs.filter((d) => d.hasVersionDrift).length;
  const status =
    driftedCount === 0
      ? AlignmentStatus.ALIGNED
      : driftedCount < componentDiffs.length
      ? AlignmentStatus.PARTIAL
      : AlignmentStatus.DRIFTED;

  const result: NonProdVsProdResult = {
    nonProdEnvId,
    nonProdEnvName: nonProdEnv.name,
    prodEnvId,
    prodEnvName: prodEnv.name,
    status,
    warnings,
    componentDiffs,
  };

  // Store comparison
  await prisma.alignmentComparison.create({
    data: {
      comparisonType: ComparisonType.NONPROD_VS_PROD,
      environmentId: nonProdEnvId,
      targetEnvironmentId: prodEnvId,
      status,
      alignedCount: componentDiffs.filter((d) => !d.hasVersionDrift).length,
      driftedCount,
      missingCount: componentDiffs.filter((d) => !d.prodVersion).length,
      extraCount: 0,
      detailsJson: result as unknown as Prisma.InputJsonValue,
    },
  });

  return result;
}

// Get recent comparisons for an environment
export async function getRecentComparisons(
  environmentId: string,
  limit: number = 10
) {
  return prisma.alignmentComparison.findMany({
    where: { environmentId },
    orderBy: { comparedAt: 'desc' },
    take: limit,
    include: {
      blueprint: { select: { id: true, name: true } },
      release: { select: { id: true, name: true, version: true } },
      snapshot: { select: { id: true, createdAt: true } },
    },
  });
}

// Get comparison history between two environments
export async function getComparisonHistory(
  sourceEnvId: string,
  targetEnvId: string,
  limit: number = 20
) {
  return prisma.alignmentComparison.findMany({
    where: {
      environmentId: sourceEnvId,
      targetEnvironmentId: targetEnvId,
    },
    orderBy: { comparedAt: 'desc' },
    take: limit,
  });
}
