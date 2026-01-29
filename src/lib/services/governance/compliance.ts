// Nexorium Core - Compliance Evaluation Service
// Evaluates policy controls and computes compliance scores

import prisma from '@/lib/db';
import {
  ComplianceResultStatus,
  GovernanceRuleSeverity,
  PolicyControlCategory,
} from '@prisma/client';
import type {
  ComplianceResult,
  ComplianceMatrixRow,
  ComplianceMatrixCell,
  PolicyControl,
  ComplianceResultDetails,
  GovernanceOverview,
} from '@/types';

// ============================================
// COMPLIANCE EVALUATION ENGINE
// ============================================

/**
 * Evaluate a single policy control for an environment
 */
export async function evaluateControl(
  controlId: string,
  environmentId: string,
  evaluatedBy?: string
): Promise<ComplianceResult> {
  const control = await prisma.policyControl.findUnique({
    where: { id: controlId },
  });

  if (!control) {
    throw new Error(`Policy control not found: ${controlId}`);
  }

  const environment = await prisma.environment.findUnique({
    where: { id: environmentId },
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
      ownership: true,
      snapshots: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      raciMappings: {
        include: { person: true },
      },
    },
  });

  if (!environment) {
    throw new Error(`Environment not found: ${environmentId}`);
  }

  // Run the appropriate evaluator based on control type
  const result = await runEvaluator(control, environment);

  // Store the result
  const storedResult = await prisma.complianceResult.create({
    data: {
      policyControlId: controlId,
      environmentId,
      snapshotId: environment.snapshots[0]?.id,
      status: result.status,
      score: result.score,
      message: result.message,
      detailsJson: result.detailsJson as object,
      evidenceJson: result.evidenceJson as object,
      evaluatedBy,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
    },
    include: {
      policyControl: true,
    },
  });

  return storedResult as unknown as ComplianceResult;
}

/**
 * Evaluate all active controls for an environment
 */
export async function evaluateAllControls(
  environmentId: string,
  evaluatedBy?: string
): Promise<ComplianceResult[]> {
  const controls = await prisma.policyControl.findMany({
    where: { isActive: true },
  });

  const results: ComplianceResult[] = [];
  for (const control of controls) {
    try {
      const result = await evaluateControl(control.id, environmentId, evaluatedBy);
      results.push(result);
    } catch (error) {
      console.error(`Error evaluating control ${control.name}:`, error);
    }
  }

  return results;
}

/**
 * Get compliance matrix data - environments x controls
 */
export async function getComplianceMatrix(): Promise<ComplianceMatrixRow[]> {
  const environments = await prisma.environment.findMany({
    include: {
      stage: true,
    },
    orderBy: { name: 'asc' },
  });

  const controls = await prisma.policyControl.findMany({
    where: { isActive: true },
    orderBy: { category: 'asc' },
  });

  const rows: ComplianceMatrixRow[] = [];

  for (const env of environments) {
    // Get latest results for each control
    const results = await prisma.complianceResult.findMany({
      where: {
        environmentId: env.id,
        policyControlId: { in: controls.map((c) => c.id) },
      },
      orderBy: { evaluatedAt: 'desc' },
      distinct: ['policyControlId'],
      include: {
        policyControl: true,
      },
    });

    const resultMap = new Map(results.map((r) => [r.policyControlId, r]));

    const cells: ComplianceMatrixCell[] = controls.map((control) => {
      const result = resultMap.get(control.id);
      return {
        controlId: control.id,
        controlName: control.name,
        status: result?.status || 'PENDING',
        score: result?.score,
        message: result?.message,
        evaluatedAt: result?.evaluatedAt,
      };
    });

    // Calculate overall score
    const statusWeights: Record<ComplianceResultStatus, number> = {
      PASS: 100,
      WARN: 60,
      FAIL: 0,
      NOT_APPLICABLE: 100,
      PENDING: 50,
    };

    const applicableCells = cells.filter((c) => c.status !== 'NOT_APPLICABLE');
    const overallScore =
      applicableCells.length > 0
        ? Math.round(
            applicableCells.reduce((sum, c) => sum + statusWeights[c.status], 0) /
              applicableCells.length
          )
        : 100;

    const overallStatus = determineOverallStatus(cells.map((c) => c.status));

    rows.push({
      environmentId: env.id,
      environmentName: env.name,
      environmentType: env.type,
      stage: env.stage?.key,
      overallScore,
      overallStatus,
      results: cells,
    });
  }

  return rows;
}

/**
 * Get compliance score for a specific environment
 */
export async function getComplianceScore(environmentId: string): Promise<number> {
  const results = await prisma.complianceResult.findMany({
    where: {
      environmentId,
      policyControl: { isActive: true },
    },
    orderBy: { evaluatedAt: 'desc' },
    distinct: ['policyControlId'],
  });

  if (results.length === 0) return 0;

  const statusWeights: Record<ComplianceResultStatus, number> = {
    PASS: 100,
    WARN: 60,
    FAIL: 0,
    NOT_APPLICABLE: 100,
    PENDING: 50,
  };

  const applicableResults = results.filter((r) => r.status !== 'NOT_APPLICABLE');
  if (applicableResults.length === 0) return 100;

  return Math.round(
    applicableResults.reduce((sum, r) => sum + statusWeights[r.status], 0) /
      applicableResults.length
  );
}

/**
 * Get compliance trend over time
 */
export async function getComplianceTrend(
  environmentId: string,
  days: number = 30
): Promise<{ date: Date; score: number }[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const results = await prisma.complianceResult.findMany({
    where: {
      environmentId,
      evaluatedAt: { gte: startDate },
    },
    orderBy: { evaluatedAt: 'asc' },
  });

  // Group by day and calculate daily scores
  const dailyScores = new Map<string, { total: number; count: number }>();
  const statusWeights: Record<ComplianceResultStatus, number> = {
    PASS: 100,
    WARN: 60,
    FAIL: 0,
    NOT_APPLICABLE: 100,
    PENDING: 50,
  };

  for (const result of results) {
    const dateKey = result.evaluatedAt.toISOString().split('T')[0];
    const existing = dailyScores.get(dateKey) || { total: 0, count: 0 };
    existing.total += statusWeights[result.status];
    existing.count += 1;
    dailyScores.set(dateKey, existing);
  }

  return Array.from(dailyScores.entries()).map(([dateStr, data]) => ({
    date: new Date(dateStr),
    score: Math.round(data.total / data.count),
  }));
}

/**
 * Get governance overview metrics
 */
export async function getGovernanceOverview(): Promise<GovernanceOverview> {
  const [
    controlsStats,
    latestResults,
    pendingApprovals,
    activeExceptions,
    expiringExceptions,
    unreviewedCouplings,
  ] = await Promise.all([
    prisma.policyControl.aggregate({
      _count: { id: true },
      where: {},
    }),
    prisma.complianceResult.findMany({
      orderBy: { evaluatedAt: 'desc' },
      distinct: ['policyControlId', 'environmentId'],
      take: 1000,
    }),
    prisma.approvalItem.count({
      where: { status: 'PENDING' },
    }),
    prisma.exceptionItem.count({
      where: { status: 'ACTIVE' },
    }),
    prisma.exceptionItem.count({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expiring within 7 days
        },
      },
    }),
    prisma.couplingLink.count({
      where: { status: 'UNREVIEWED' },
    }),
  ]);

  const activeControls = await prisma.policyControl.count({
    where: { isActive: true },
  });

  // Calculate status counts
  const statusCounts = latestResults.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<ComplianceResultStatus, number>
  );

  // Calculate critical risks (FAIL with severity BLOCKER or ERROR)
  const criticalRisks = await prisma.complianceResult.count({
    where: {
      status: 'FAIL',
      policyControl: {
        severity: { in: ['BLOCKER', 'ERROR'] },
      },
    },
  });

  // Calculate overall compliance score
  const totalResults = latestResults.length;
  const passCount = statusCounts.PASS || 0;
  const warnCount = statusCounts.WARN || 0;
  const failCount = statusCounts.FAIL || 0;

  const complianceScore = totalResults > 0
    ? Math.round(((passCount * 100 + warnCount * 60) / (totalResults * 100)) * 100)
    : 0;

  return {
    complianceScore,
    controlsTotal: controlsStats._count.id,
    controlsActive: activeControls,
    passCount,
    warnCount,
    failCount,
    pendingApprovalsCount: pendingApprovals,
    activeExceptionsCount: activeExceptions,
    expiringExceptionsCount: expiringExceptions,
    unreviewedCouplingsCount: unreviewedCouplings,
    criticalRisksCount: criticalRisks,
    lastEvaluatedAt: latestResults[0]?.evaluatedAt,
  };
}

// ============================================
// INTERNAL EVALUATORS
// ============================================

interface EvaluationResult {
  status: ComplianceResultStatus;
  score?: number;
  message?: string;
  detailsJson?: ComplianceResultDetails;
  evidenceJson?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runEvaluator(control: any, environment: any): Promise<EvaluationResult> {
  const config = control.configJson as Record<string, unknown>;

  switch (control.evaluatorType) {
    case 'owner_assigned':
      return evaluateOwnerAssigned(environment, config);
    case 'version_check':
      return evaluateVersionCheck(environment, config);
    case 'freshness':
      return evaluateFreshness(environment, config);
    case 'raci_complete':
      return evaluateRaciComplete(environment, config);
    case 'snapshot_exists':
      return evaluateSnapshotExists(environment, config);
    case 'component_count':
      return evaluateComponentCount(environment, config);
    default:
      return {
        status: 'NOT_APPLICABLE',
        message: `Unknown evaluator type: ${control.evaluatorType}`,
      };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function evaluateOwnerAssigned(environment: any, _config: Record<string, unknown>): EvaluationResult {
  const hasOwnership = !!environment.ownership;
  const hasRaci = environment.raciMappings?.length > 0;

  if (hasOwnership && hasRaci) {
    return {
      status: 'PASS',
      score: 100,
      message: 'Environment has owner and RACI assignments',
    };
  } else if (hasOwnership || hasRaci) {
    return {
      status: 'WARN',
      score: 60,
      message: hasOwnership
        ? 'Environment has owner but no RACI assignments'
        : 'Environment has RACI assignments but no formal owner',
    };
  }

  return {
    status: 'FAIL',
    score: 0,
    message: 'No owner or RACI assignments found',
    detailsJson: {
      findings: [
        {
          type: 'missing_owner',
          description: 'Environment lacks ownership assignment',
        },
      ],
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function evaluateVersionCheck(environment: any, config: Record<string, unknown>): EvaluationResult {
  const minVersion = config.minVersion as string | undefined;
  const instances = environment.componentInstances || [];

  if (instances.length === 0) {
    return {
      status: 'NOT_APPLICABLE',
      message: 'No component instances found',
    };
  }

  const violations: { name: string; version: string }[] = [];
  let compliantCount = 0;

  for (const instance of instances) {
    const latestVersion = instance.deployedVersions?.[0];
    if (!latestVersion) {
      violations.push({
        name: instance.component?.name || instance.displayName || 'Unknown',
        version: 'No version deployed',
      });
    } else if (minVersion && latestVersion.projectVersion < minVersion) {
      violations.push({
        name: instance.component?.name || instance.displayName || 'Unknown',
        version: latestVersion.projectVersion,
      });
    } else {
      compliantCount++;
    }
  }

  const score = Math.round((compliantCount / instances.length) * 100);

  if (violations.length === 0) {
    return {
      status: 'PASS',
      score: 100,
      message: 'All components have valid versions',
    };
  } else if (score >= 80) {
    return {
      status: 'WARN',
      score,
      message: `${violations.length} components have version issues`,
      detailsJson: {
        violations: violations.map((v) => ({
          entityType: 'COMPONENT',
          entityId: '',
          entityName: v.name,
          message: `Version: ${v.version}`,
          severity: 'WARNING' as GovernanceRuleSeverity,
        })),
      },
    };
  }

  return {
    status: 'FAIL',
    score,
    message: `${violations.length} components have version issues`,
    detailsJson: {
      violations: violations.map((v) => ({
        entityType: 'COMPONENT',
        entityId: '',
        entityName: v.name,
        message: `Version: ${v.version}`,
        severity: 'ERROR' as GovernanceRuleSeverity,
      })),
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function evaluateFreshness(environment: any, config: Record<string, unknown>): EvaluationResult {
  const maxAgeDays = (config.maxAge as number) || 30;
  const latestSnapshot = environment.snapshots?.[0];

  if (!latestSnapshot) {
    return {
      status: 'FAIL',
      score: 0,
      message: 'No snapshots found - environment state unknown',
    };
  }

  const snapshotAge = Math.floor(
    (Date.now() - new Date(latestSnapshot.createdAt).getTime()) / (24 * 60 * 60 * 1000)
  );

  if (snapshotAge <= maxAgeDays) {
    return {
      status: 'PASS',
      score: 100,
      message: `Latest snapshot is ${snapshotAge} days old`,
    };
  } else if (snapshotAge <= maxAgeDays * 2) {
    return {
      status: 'WARN',
      score: 60,
      message: `Latest snapshot is ${snapshotAge} days old (threshold: ${maxAgeDays} days)`,
    };
  }

  return {
    status: 'FAIL',
    score: 0,
    message: `Latest snapshot is ${snapshotAge} days old (threshold: ${maxAgeDays} days)`,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function evaluateRaciComplete(environment: any, _config: Record<string, unknown>): EvaluationResult {
  const raciMappings = environment.raciMappings || [];

  // Check for required roles
  const roles = new Set(raciMappings.map((m: { raciRole: string }) => m.raciRole));
  const hasResponsible = roles.has('RESPONSIBLE');
  const hasAccountable = roles.has('ACCOUNTABLE');

  if (hasResponsible && hasAccountable) {
    return {
      status: 'PASS',
      score: 100,
      message: 'RACI has both Responsible and Accountable roles assigned',
    };
  } else if (hasResponsible || hasAccountable) {
    return {
      status: 'WARN',
      score: 60,
      message: `Missing ${hasResponsible ? 'Accountable' : 'Responsible'} role assignment`,
    };
  }

  return {
    status: 'FAIL',
    score: 0,
    message: 'No RACI assignments found',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function evaluateSnapshotExists(environment: any, _config: Record<string, unknown>): EvaluationResult {
  const hasSnapshot = environment.snapshots?.length > 0;

  return {
    status: hasSnapshot ? 'PASS' : 'FAIL',
    score: hasSnapshot ? 100 : 0,
    message: hasSnapshot
      ? `Environment has ${environment.snapshots.length} snapshot(s)`
      : 'No snapshots found',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function evaluateComponentCount(environment: any, config: Record<string, unknown>): EvaluationResult {
  const minCount = (config.minCount as number) || 1;
  const count = environment.componentInstances?.length || 0;

  if (count >= minCount) {
    return {
      status: 'PASS',
      score: 100,
      message: `Environment has ${count} component(s)`,
    };
  }

  return {
    status: 'FAIL',
    score: Math.round((count / minCount) * 100),
    message: `Environment has ${count} component(s), minimum required: ${minCount}`,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function determineOverallStatus(statuses: ComplianceResultStatus[]): ComplianceResultStatus {
  if (statuses.includes('FAIL')) return 'FAIL';
  if (statuses.includes('WARN')) return 'WARN';
  if (statuses.includes('PENDING')) return 'PENDING';
  if (statuses.every((s) => s === 'NOT_APPLICABLE')) return 'NOT_APPLICABLE';
  return 'PASS';
}

// ============================================
// POLICY CONTROL CRUD
// ============================================

export async function listPolicyControls(options?: {
  category?: PolicyControlCategory;
  isActive?: boolean;
}): Promise<PolicyControl[]> {
  const controls = await prisma.policyControl.findMany({
    where: {
      category: options?.category,
      isActive: options?.isActive,
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  return controls as unknown as PolicyControl[];
}

export async function getPolicyControl(id: string): Promise<PolicyControl | null> {
  const control = await prisma.policyControl.findUnique({
    where: { id },
  });

  return control as unknown as PolicyControl | null;
}

export async function createPolicyControl(
  data: Omit<PolicyControl, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PolicyControl> {
  const control = await prisma.policyControl.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      scope: data.scope,
      scopeId: data.scopeId,
      severity: data.severity,
      isActive: data.isActive ?? true,
      configJson: data.configJson as object,
      evaluatorType: data.evaluatorType,
      remediation: data.remediation,
      createdBy: data.createdBy,
    },
  });

  return control as unknown as PolicyControl;
}

export async function updatePolicyControl(
  id: string,
  data: Partial<Omit<PolicyControl, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<PolicyControl> {
  const control = await prisma.policyControl.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      scope: data.scope,
      scopeId: data.scopeId,
      severity: data.severity,
      isActive: data.isActive,
      configJson: data.configJson as object,
      evaluatorType: data.evaluatorType,
      remediation: data.remediation,
    },
  });

  return control as unknown as PolicyControl;
}

export async function deletePolicyControl(id: string): Promise<void> {
  await prisma.policyControl.delete({
    where: { id },
  });
}
