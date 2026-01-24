// TelEnvIQ - Coupling Detection Service
// Project/environment coupling detection and risk assessment

import prisma from '@/lib/db';
import { CouplingStatus } from '@prisma/client';
import type { CouplingLink, CouplingAnalysis, CouplingEvidence } from '@/types';

// ============================================
// COUPLING CRUD OPERATIONS
// ============================================

/**
 * List coupling links with filtering
 */
export async function listCouplings(options?: {
  status?: CouplingStatus;
  sourceEnvironmentId?: string;
  targetEnvironmentId?: string;
  minRiskLevel?: number;
  limit?: number;
  offset?: number;
}): Promise<{ items: CouplingLink[]; total: number }> {
  const where = {
    status: options?.status,
    sourceEnvironmentId: options?.sourceEnvironmentId,
    targetEnvironmentId: options?.targetEnvironmentId,
    ...(options?.minRiskLevel !== undefined
      ? { riskLevel: { gte: options.minRiskLevel } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.couplingLink.findMany({
      where,
      orderBy: [{ riskLevel: 'desc' }, { createdAt: 'desc' }],
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.couplingLink.count({ where }),
  ]);

  return {
    items: items as unknown as CouplingLink[],
    total,
  };
}

/**
 * Get a single coupling link by ID
 */
export async function getCoupling(id: string): Promise<CouplingLink | null> {
  const item = await prisma.couplingLink.findUnique({
    where: { id },
  });

  return item as unknown as CouplingLink | null;
}

/**
 * Get couplings for an environment (both as source and target)
 */
export async function getCouplingsByEnvironment(
  environmentId: string
): Promise<CouplingLink[]> {
  const items = await prisma.couplingLink.findMany({
    where: {
      OR: [
        { sourceEnvironmentId: environmentId },
        { targetEnvironmentId: environmentId },
      ],
    },
    orderBy: { riskLevel: 'desc' },
  });

  return items as unknown as CouplingLink[];
}

/**
 * Create a coupling link
 */
export async function createCoupling(
  data: Omit<CouplingLink, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CouplingLink> {
  const item = await prisma.couplingLink.create({
    data: {
      sourceEnvironmentId: data.sourceEnvironmentId,
      targetEnvironmentId: data.targetEnvironmentId,
      sourceProjectName: data.sourceProjectName,
      targetProjectName: data.targetProjectName,
      couplingType: data.couplingType,
      status: data.status || 'UNREVIEWED',
      riskLevel: data.riskLevel || 0,
      description: data.description,
      detectedAt: data.detectedAt || new Date(),
      detectedBy: data.detectedBy,
      evidenceJson: data.evidenceJson as object,
      mitigationRequired: data.mitigationRequired || false,
      mitigationPlan: data.mitigationPlan,
    },
  });

  return item as unknown as CouplingLink;
}

/**
 * Update a coupling link
 */
export async function updateCoupling(
  id: string,
  data: Partial<Omit<CouplingLink, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<CouplingLink> {
  const item = await prisma.couplingLink.update({
    where: { id },
    data: {
      status: data.status,
      riskLevel: data.riskLevel,
      description: data.description,
      evidenceJson: data.evidenceJson as object,
      reviewedBy: data.reviewedBy,
      reviewedAt: data.reviewedAt,
      reviewNotes: data.reviewNotes,
      mitigationRequired: data.mitigationRequired,
      mitigationPlan: data.mitigationPlan,
      resolvedAt: data.resolvedAt,
    },
  });

  return item as unknown as CouplingLink;
}

/**
 * Delete a coupling link
 */
export async function deleteCoupling(id: string): Promise<void> {
  await prisma.couplingLink.delete({
    where: { id },
  });
}

// ============================================
// COUPLING REVIEW ACTIONS
// ============================================

/**
 * Start review of a coupling link
 */
export async function startReview(
  id: string,
  reviewedBy: string
): Promise<CouplingLink> {
  return updateCoupling(id, {
    status: 'UNDER_REVIEW',
    reviewedBy,
    reviewedAt: new Date(),
  });
}

/**
 * Approve a coupling link
 */
export async function approveCoupling(
  id: string,
  reviewedBy: string,
  notes?: string
): Promise<CouplingLink> {
  return updateCoupling(id, {
    status: 'APPROVED',
    reviewedBy,
    reviewedAt: new Date(),
    reviewNotes: notes,
  });
}

/**
 * Reject a coupling link (requires mitigation)
 */
export async function rejectCoupling(
  id: string,
  reviewedBy: string,
  notes: string,
  mitigationRequired: boolean = true
): Promise<CouplingLink> {
  return updateCoupling(id, {
    status: mitigationRequired ? 'MITIGATION_REQUIRED' : 'REJECTED',
    reviewedBy,
    reviewedAt: new Date(),
    reviewNotes: notes,
    mitigationRequired,
  });
}

/**
 * Mark coupling as resolved
 */
export async function resolveCoupling(
  id: string,
  resolvedBy: string,
  notes?: string
): Promise<CouplingLink> {
  return updateCoupling(id, {
    status: 'APPROVED',
    reviewedBy: resolvedBy,
    reviewedAt: new Date(),
    reviewNotes: notes,
    resolvedAt: new Date(),
    mitigationRequired: false,
  });
}

// ============================================
// COUPLING DETECTION
// ============================================

/**
 * Detect coupling between environments
 * Looks for shared components, interfaces, and data dependencies
 */
export async function detectCouplings(
  sourceEnvironmentId: string,
  targetEnvironmentId: string,
  detectedBy?: string
): Promise<CouplingLink[]> {
  const [sourceEnv, targetEnv] = await Promise.all([
    prisma.environment.findUnique({
      where: { id: sourceEnvironmentId },
      include: {
        ownership: true,
        componentInstances: {
          include: {
            component: true,
            outgoingConnections: true,
            incomingConnections: true,
          },
        },
      },
    }),
    prisma.environment.findUnique({
      where: { id: targetEnvironmentId },
      include: {
        ownership: true,
        componentInstances: {
          include: {
            component: true,
            outgoingConnections: true,
            incomingConnections: true,
          },
        },
      },
    }),
  ]);

  if (!sourceEnv || !targetEnv) {
    throw new Error('One or both environments not found');
  }

  const detectedCouplings: CouplingLink[] = [];

  // Detect shared components
  const sourceComponents = new Set(
    sourceEnv.componentInstances.map((ci) => ci.component.name)
  );
  const targetComponents = new Set(
    targetEnv.componentInstances.map((ci) => ci.component.name)
  );

  const sharedComponents = Array.from(sourceComponents).filter((c) =>
    targetComponents.has(c)
  );

  if (sharedComponents.length > 0) {
    const evidence: CouplingEvidence = {
      sharedComponents,
    };

    // Check if coupling already exists
    const existing = await prisma.couplingLink.findUnique({
      where: {
        sourceEnvironmentId_targetEnvironmentId_couplingType: {
          sourceEnvironmentId,
          targetEnvironmentId,
          couplingType: 'shared_component',
        },
      },
    });

    if (!existing) {
      const riskLevel = calculateRiskLevel(sharedComponents.length, 'shared_component');
      const coupling = await createCoupling({
        sourceEnvironmentId,
        targetEnvironmentId,
        sourceProjectName: sourceEnv.ownership?.projectName,
        targetProjectName: targetEnv.ownership?.projectName,
        couplingType: 'shared_component',
        status: 'UNREVIEWED',
        riskLevel,
        description: `${sharedComponents.length} shared component(s) detected`,
        detectedAt: new Date(),
        detectedBy: detectedBy || 'system',
        evidenceJson: evidence,
        mitigationRequired: false,
        mitigationPlan: null,
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
        resolvedAt: null,
      });
      detectedCouplings.push(coupling);
    }
  }

  // Detect interface dependencies (future enhancement)
  // This would look for cross-environment connections

  return detectedCouplings;
}

/**
 * Run coupling detection for all environment pairs
 */
export async function detectAllCouplings(
  detectedBy?: string
): Promise<{ detected: number; errors: string[] }> {
  const environments = await prisma.environment.findMany({
    select: { id: true },
  });

  let detected = 0;
  const errors: string[] = [];

  // Check each pair (avoid duplicates by only checking i < j)
  for (let i = 0; i < environments.length; i++) {
    for (let j = i + 1; j < environments.length; j++) {
      try {
        const couplings = await detectCouplings(
          environments[i].id,
          environments[j].id,
          detectedBy
        );
        detected += couplings.length;
      } catch (error) {
        errors.push(
          `Error detecting coupling between ${environments[i].id} and ${environments[j].id}: ${error}`
        );
      }
    }
  }

  return { detected, errors };
}

// ============================================
// COUPLING ANALYSIS
// ============================================

/**
 * Get coupling analysis statistics
 */
export async function getCouplingAnalysis(
  environmentId?: string
): Promise<CouplingAnalysis> {
  const baseWhere = environmentId
    ? {
        OR: [
          { sourceEnvironmentId: environmentId },
          { targetEnvironmentId: environmentId },
        ],
      }
    : {};

  const [total, unreviewedCount, highRiskCount, byType, byEnv] = await Promise.all([
    prisma.couplingLink.count({ where: baseWhere }),
    prisma.couplingLink.count({
      where: { ...baseWhere, status: 'UNREVIEWED' },
    }),
    prisma.couplingLink.count({
      where: { ...baseWhere, riskLevel: { gte: 70 } },
    }),
    prisma.couplingLink.groupBy({
      by: ['couplingType'],
      where: baseWhere,
      _count: true,
    }),
    prisma.couplingLink.groupBy({
      by: ['sourceEnvironmentId'],
      where: baseWhere,
      _count: true,
    }),
  ]);

  // Calculate risk distribution
  const riskDistribution = await getRiskDistribution(baseWhere);

  return {
    totalLinks: total,
    unreviewedCount,
    highRiskCount,
    byType: byType.reduce(
      (acc, item) => {
        acc[item.couplingType] = item._count;
        return acc;
      },
      {} as Record<string, number>
    ),
    byEnvironment: byEnv.reduce(
      (acc, item) => {
        acc[item.sourceEnvironmentId] = item._count;
        return acc;
      },
      {} as Record<string, number>
    ),
    riskDistribution,
  };
}

/**
 * Get high-risk couplings
 */
export async function getHighRiskCouplings(
  threshold: number = 70
): Promise<CouplingLink[]> {
  const items = await prisma.couplingLink.findMany({
    where: {
      riskLevel: { gte: threshold },
      status: { in: ['UNREVIEWED', 'UNDER_REVIEW', 'MITIGATION_REQUIRED'] },
    },
    orderBy: { riskLevel: 'desc' },
  });

  return items as unknown as CouplingLink[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateRiskLevel(count: number, couplingType: string): number {
  // Base risk by coupling type
  const typeRisk: Record<string, number> = {
    shared_component: 30,
    data_dependency: 50,
    interface_dependency: 40,
    version_dependency: 35,
  };

  const base = typeRisk[couplingType] || 25;

  // Increase risk based on count
  const countMultiplier = Math.min(count * 10, 50);

  return Math.min(base + countMultiplier, 100);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getRiskDistribution(baseWhere: any): Promise<{
  low: number;
  medium: number;
  high: number;
  critical: number;
}> {
  const [low, medium, high, critical] = await Promise.all([
    prisma.couplingLink.count({
      where: { ...baseWhere, riskLevel: { lt: 30 } },
    }),
    prisma.couplingLink.count({
      where: { ...baseWhere, riskLevel: { gte: 30, lt: 60 } },
    }),
    prisma.couplingLink.count({
      where: { ...baseWhere, riskLevel: { gte: 60, lt: 80 } },
    }),
    prisma.couplingLink.count({
      where: { ...baseWhere, riskLevel: { gte: 80 } },
    }),
  ]);

  return { low, medium, high, critical };
}

// ============================================
// GRAPH DATA FOR VISUALIZATION
// ============================================

/**
 * Get coupling graph data for React Flow visualization
 */
export async function getCouplingGraphData(): Promise<{
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
      environmentId: string;
      environmentName: string;
      projectName?: string;
      couplingCount: number;
    };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    data: {
      couplingType: string;
      riskLevel: number;
      status: CouplingStatus;
    };
  }>;
}> {
  const [environments, couplings] = await Promise.all([
    prisma.environment.findMany({
      include: {
        ownership: true,
      },
    }),
    prisma.couplingLink.findMany({
      where: {
        status: { not: 'APPROVED' }, // Only show non-approved couplings
      },
    }),
  ]);

  // Create environment nodes
  const envCouplingCounts = new Map<string, number>();
  for (const coupling of couplings) {
    envCouplingCounts.set(
      coupling.sourceEnvironmentId,
      (envCouplingCounts.get(coupling.sourceEnvironmentId) || 0) + 1
    );
    envCouplingCounts.set(
      coupling.targetEnvironmentId,
      (envCouplingCounts.get(coupling.targetEnvironmentId) || 0) + 1
    );
  }

  // Simple grid layout
  const columns = 4;
  const spacing = 300;

  const nodes = environments.map((env, index) => ({
    id: env.id,
    type: 'coupling',
    position: {
      x: (index % columns) * spacing + 100,
      y: Math.floor(index / columns) * spacing + 100,
    },
    data: {
      environmentId: env.id,
      environmentName: env.name,
      projectName: env.ownership?.projectName,
      couplingCount: envCouplingCounts.get(env.id) || 0,
    },
  }));

  const edges = couplings.map((coupling) => ({
    id: coupling.id,
    source: coupling.sourceEnvironmentId,
    target: coupling.targetEnvironmentId,
    data: {
      couplingType: coupling.couplingType,
      riskLevel: coupling.riskLevel,
      status: coupling.status,
    },
  }));

  return { nodes, edges };
}
