// TelEnvIQ - Policy Service
// Policy validation engine for governance and compliance

import prisma from '@/lib/db';
import type { PolicyViolation, ViolationSeverity, ViolationStatus } from '@/types';
import { createAuditLog } from './audit';

// Common interface for policy violation detection results
interface DetectedViolation {
  nodeId: string;
  environmentId: string;
  description: string;
  remediationHint: string;
  testDataSetId?: string;
  edgeId?: string;
}

// Policy definitions
const POLICY_DEFINITIONS = {
  PII_MASKING_REQUIRED: {
    name: 'PII Data Masking Required',
    rule: 'PII data must have a masking method configured',
    severity: 'HIGH' as ViolationSeverity,
    check: async (): Promise<DetectedViolation[]> => {
      const violations = await prisma.testDataSet.findMany({
        where: {
          dataClassification: 'PII',
          OR: [
            { maskingMethod: null },
            { maskingMethod: 'NONE' },
          ],
        },
        include: {
          database: {
            include: {
              node: {
                select: { id: true, name: true, environmentId: true },
              },
            },
          },
        },
      });
      return violations.map((v) => ({
        testDataSetId: v.id,
        nodeId: v.database.node.id,
        environmentId: v.database.node.environmentId,
        description: `Database "${v.database.node.name}" contains PII data without masking`,
        remediationHint: 'Configure a masking method (TOKENIZATION, STATIC_MASK, DYNAMIC_MASK, or SYNTHETIC)',
      }));
    },
  },
  PCI_MASKING_REQUIRED: {
    name: 'PCI Data Masking Required',
    rule: 'PCI data must have a masking method configured',
    severity: 'CRITICAL' as ViolationSeverity,
    check: async (): Promise<DetectedViolation[]> => {
      const violations = await prisma.testDataSet.findMany({
        where: {
          dataClassification: 'PCI',
          OR: [
            { maskingMethod: null },
            { maskingMethod: 'NONE' },
          ],
        },
        include: {
          database: {
            include: {
              node: {
                select: { id: true, name: true, environmentId: true },
              },
            },
          },
        },
      });
      return violations.map((v) => ({
        testDataSetId: v.id,
        nodeId: v.database.node.id,
        environmentId: v.database.node.environmentId,
        description: `Database "${v.database.node.name}" contains PCI data without masking`,
        remediationHint: 'Configure TOKENIZATION or STATIC_MASK for PCI compliance',
      }));
    },
  },
  PROD_CLONE_APPROVAL: {
    name: 'Production Clone Approval Required',
    rule: 'Production clones must be approved',
    severity: 'HIGH' as ViolationSeverity,
    check: async (): Promise<DetectedViolation[]> => {
      const violations = await prisma.testDataSet.findMany({
        where: {
          derivedFromProdClone: true,
          approvedBy: null,
        },
        include: {
          database: {
            include: {
              node: {
                select: { id: true, name: true, environmentId: true },
              },
            },
          },
        },
      });
      return violations.map((v) => ({
        testDataSetId: v.id,
        nodeId: v.database.node.id,
        environmentId: v.database.node.environmentId,
        description: `Database "${v.database.node.name}" is derived from production but not approved`,
        remediationHint: 'Obtain approval from data governance team',
      }));
    },
  },
  TEST_TO_PROD_CONNECTION: {
    name: 'Test to Production Connection Prohibited',
    rule: 'Test environments should not connect directly to production zones',
    severity: 'CRITICAL' as ViolationSeverity,
    check: async (): Promise<DetectedViolation[]> => {
      const suspiciousEdges = await prisma.edge.findMany({
        where: {
          sourceNode: {
            networkZone: { type: 'NON_PROD' },
          },
          targetNode: {
            networkZone: { type: 'PROD' },
          },
        },
        include: {
          sourceNode: {
            select: { id: true, name: true, environmentId: true },
          },
          targetNode: {
            select: { id: true, name: true },
          },
        },
      });
      return suspiciousEdges.map((e) => ({
        edgeId: e.id,
        nodeId: e.sourceNodeId,
        environmentId: e.sourceNode.environmentId,
        description: `Connection from "${e.sourceNode.name}" (non-prod) to "${e.targetNode.name}" (prod) detected`,
        remediationHint: 'Route through an API gateway or remove direct connection',
      }));
    },
  },
};

// Run all policy checks and create/update violations
export async function runPolicyChecks(environmentId?: string): Promise<{
  newViolations: number;
  resolvedViolations: number;
  totalOpen: number;
}> {
  let newViolations = 0;
  let resolvedViolations = 0;

  for (const [, policy] of Object.entries(POLICY_DEFINITIONS)) {
    const detectedViolations = await policy.check();

    // Filter by environment if specified
    const relevantViolations = environmentId
      ? detectedViolations.filter((v) => v.environmentId === environmentId)
      : detectedViolations;

    // Get existing open violations for this policy
    const existingViolations = await prisma.policyViolation.findMany({
      where: {
        policyName: policy.name,
        status: { in: ['OPEN', 'ACKNOWLEDGED'] },
        ...(environmentId && { environmentId }),
      },
    });

    const existingKeys = new Set(
      existingViolations.map((v) =>
        `${v.nodeId}-${v.edgeId}-${v.testDataSetId}`
      )
    );

    // Create new violations
    for (const violation of relevantViolations) {
      const key = `${violation.nodeId}-${violation.edgeId || ''}-${violation.testDataSetId || ''}`;
      if (!existingKeys.has(key)) {
        await prisma.policyViolation.create({
          data: {
            environmentId: violation.environmentId,
            nodeId: violation.nodeId,
            edgeId: violation.edgeId,
            testDataSetId: violation.testDataSetId,
            policyName: policy.name,
            policyRule: policy.rule,
            severity: policy.severity,
            description: violation.description,
            remediationHint: violation.remediationHint,
          },
        });
        newViolations++;

        // Log the violation
        if (violation.environmentId) {
          await createAuditLog({
            environmentId: violation.environmentId,
            action: 'POLICY_VIOLATION_DETECTED',
            targetType: violation.edgeId ? 'EDGE' : violation.testDataSetId ? 'TESTDATA' : 'NODE',
            targetId: violation.edgeId || violation.testDataSetId || violation.nodeId,
            details: {
              policyName: policy.name,
              severity: policy.severity,
              description: violation.description,
            },
          });
        }
      }
    }

    // Check for resolved violations
    const detectedKeys = new Set(
      relevantViolations.map((v) =>
        `${v.nodeId}-${v.edgeId || ''}-${v.testDataSetId || ''}`
      )
    );

    for (const existing of existingViolations) {
      const key = `${existing.nodeId}-${existing.edgeId || ''}-${existing.testDataSetId || ''}`;
      if (!detectedKeys.has(key)) {
        await prisma.policyViolation.update({
          where: { id: existing.id },
          data: {
            status: 'RESOLVED',
            resolvedAt: new Date(),
            resolutionNotes: 'Automatically resolved - violation no longer detected',
          },
        });
        resolvedViolations++;
      }
    }
  }

  const totalOpen = await prisma.policyViolation.count({
    where: {
      status: { in: ['OPEN', 'ACKNOWLEDGED'] },
      ...(environmentId && { environmentId }),
    },
  });

  return { newViolations, resolvedViolations, totalOpen };
}

// Get policy violations with filtering
export async function getPolicyViolations(options: {
  environmentId?: string;
  status?: ViolationStatus;
  severity?: ViolationSeverity;
  policyName?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { environmentId, status, severity, policyName, limit = 50, offset = 0 } = options;

  const where: Record<string, unknown> = {};
  if (environmentId) where.environmentId = environmentId;
  if (status) where.status = status;
  if (severity) where.severity = severity;
  if (policyName) where.policyName = policyName;

  const [violations, total] = await Promise.all([
    prisma.policyViolation.findMany({
      where,
      orderBy: [{ severity: 'desc' }, { detectedAt: 'desc' }],
      take: limit,
      skip: offset,
    }),
    prisma.policyViolation.count({ where }),
  ]);

  return {
    items: violations as PolicyViolation[],
    total,
    hasMore: offset + violations.length < total,
  };
}

// Resolve a policy violation manually
export async function resolveViolation(
  violationId: string,
  resolvedBy: string,
  resolutionNotes?: string
): Promise<PolicyViolation> {
  const violation = await prisma.policyViolation.update({
    where: { id: violationId },
    data: {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolvedBy,
      resolutionNotes,
    },
  });

  if (violation.environmentId) {
    await createAuditLog({
      environmentId: violation.environmentId,
      action: 'POLICY_VIOLATION_RESOLVED',
      actorName: resolvedBy,
      targetType: 'POLICY_VIOLATION',
      targetId: violationId,
      details: {
        policyName: violation.policyName,
        resolutionNotes,
      },
    });
  }

  return violation as PolicyViolation;
}

// Acknowledge a policy violation (mark as known but not fixed)
export async function acknowledgeViolation(
  violationId: string,
  acknowledgedBy: string
): Promise<PolicyViolation> {
  return prisma.policyViolation.update({
    where: { id: violationId },
    data: {
      status: 'ACKNOWLEDGED',
      metadata: {
        acknowledgedBy,
        acknowledgedAt: new Date().toISOString(),
      },
    },
  }) as Promise<PolicyViolation>;
}

// Get violation summary
export async function getViolationSummary(environmentId?: string) {
  const where = environmentId ? { environmentId } : {};

  const [bySeverity, byStatus, byPolicy] = await Promise.all([
    prisma.policyViolation.groupBy({
      by: ['severity'],
      where,
      _count: { severity: true },
    }),
    prisma.policyViolation.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    }),
    prisma.policyViolation.groupBy({
      by: ['policyName'],
      where: { ...where, status: { in: ['OPEN', 'ACKNOWLEDGED'] } },
      _count: { policyName: true },
    }),
  ]);

  return {
    bySeverity: Object.fromEntries(bySeverity.map((s) => [s.severity, s._count.severity])),
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count.status])),
    byPolicy: Object.fromEntries(byPolicy.map((p) => [p.policyName, p._count.policyName])),
    totalOpen: byStatus.find((s) => s.status === 'OPEN')?._count.status ?? 0,
    critical: bySeverity.find((s) => s.severity === 'CRITICAL')?._count.severity ?? 0,
  };
}
