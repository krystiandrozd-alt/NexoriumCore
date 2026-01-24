// TelEnvIQ - Data Classification Service
// Data classification and governance management

import prisma from '@/lib/db';
import type { DataClassification, MaskingMethod, ComplianceFlag, TestDataSet } from '@/types';
import { createAuditLog } from './audit';

// Update data classification for a test data set
export async function updateDataClassification(
  testDataSetId: string,
  data: {
    dataClassification?: DataClassification;
    maskingMethod?: MaskingMethod;
    complianceFlags?: ComplianceFlag[];
    derivedFromProdClone?: boolean;
  },
  updatedBy: string
): Promise<TestDataSet> {
  const existingDataset = await prisma.testDataSet.findUnique({
    where: { id: testDataSetId },
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

  if (!existingDataset) {
    throw new Error(`TestDataSet with id ${testDataSetId} not found`);
  }

  const updated = await prisma.testDataSet.update({
    where: { id: testDataSetId },
    data: {
      dataClassification: data.dataClassification,
      maskingMethod: data.maskingMethod,
      complianceFlags: data.complianceFlags,
      derivedFromProdClone: data.derivedFromProdClone,
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

  // Log the change
  await createAuditLog({
    environmentId: updated.database.node.environmentId,
    action: 'MANUAL_EDIT',
    actorName: updatedBy,
    targetType: 'TESTDATA',
    targetId: testDataSetId,
    targetName: updated.database.node.name,
    details: {
      changes: data,
      previousClassification: existingDataset.dataClassification,
      previousMaskingMethod: existingDataset.maskingMethod,
    },
  });

  return updated as TestDataSet;
}

// Request approval for a production clone dataset
export async function requestApproval(
  testDataSetId: string,
  requestedBy: string,
  justification: string
): Promise<void> {
  const dataset = await prisma.testDataSet.findUnique({
    where: { id: testDataSetId },
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

  if (!dataset) {
    throw new Error(`TestDataSet with id ${testDataSetId} not found`);
  }

  // Log the approval request
  await createAuditLog({
    environmentId: dataset.database.node.environmentId,
    action: 'MANUAL_EDIT',
    actorName: requestedBy,
    targetType: 'TESTDATA',
    targetId: testDataSetId,
    targetName: dataset.database.node.name,
    details: {
      action: 'APPROVAL_REQUESTED',
      justification,
    },
  });
}

// Grant approval for a production clone dataset
export async function grantApproval(
  testDataSetId: string,
  approvedBy: string
): Promise<TestDataSet> {
  const dataset = await prisma.testDataSet.findUnique({
    where: { id: testDataSetId },
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

  if (!dataset) {
    throw new Error(`TestDataSet with id ${testDataSetId} not found`);
  }

  const updated = await prisma.testDataSet.update({
    where: { id: testDataSetId },
    data: {
      approvedBy,
      approvalDate: new Date(),
    },
  });

  // Log the approval
  await createAuditLog({
    environmentId: dataset.database.node.environmentId,
    action: 'APPROVAL_GRANTED',
    actorName: approvedBy,
    targetType: 'TESTDATA',
    targetId: testDataSetId,
    targetName: dataset.database.node.name,
    details: {
      action: 'APPROVAL_GRANTED',
    },
  });

  return updated as TestDataSet;
}

// Revoke approval for a production clone dataset
export async function revokeApproval(
  testDataSetId: string,
  revokedBy: string,
  reason: string
): Promise<TestDataSet> {
  const dataset = await prisma.testDataSet.findUnique({
    where: { id: testDataSetId },
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

  if (!dataset) {
    throw new Error(`TestDataSet with id ${testDataSetId} not found`);
  }

  const updated = await prisma.testDataSet.update({
    where: { id: testDataSetId },
    data: {
      approvedBy: null,
      approvalDate: null,
    },
  });

  // Log the revocation
  await createAuditLog({
    environmentId: dataset.database.node.environmentId,
    action: 'APPROVAL_REVOKED',
    actorName: revokedBy,
    targetType: 'TESTDATA',
    targetId: testDataSetId,
    targetName: dataset.database.node.name,
    details: {
      reason,
      previousApprover: dataset.approvedBy,
    },
  });

  return updated as TestDataSet;
}

// Get datasets by classification
export async function getDatasetsByClassification(
  classification: DataClassification,
  environmentId?: string
) {
  const where: Record<string, unknown> = { dataClassification: classification };

  if (environmentId) {
    where.database = {
      node: { environmentId },
    };
  }

  return prisma.testDataSet.findMany({
    where,
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
}

// Get datasets requiring approval
export async function getDatasetsRequiringApproval(environmentId?: string) {
  const where: Record<string, unknown> = {
    derivedFromProdClone: true,
    approvedBy: null,
  };

  if (environmentId) {
    where.database = {
      node: { environmentId },
    };
  }

  return prisma.testDataSet.findMany({
    where,
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
}

// Get classification summary
export async function getClassificationSummary(environmentId?: string) {
  const whereClause = environmentId
    ? { database: { node: { environmentId } } }
    : {};

  const [byClassification, byMaskingMethod, complianceStats] = await Promise.all([
    prisma.testDataSet.groupBy({
      by: ['dataClassification'],
      where: { ...whereClause, dataClassification: { not: null } },
      _count: { dataClassification: true },
    }),
    prisma.testDataSet.groupBy({
      by: ['maskingMethod'],
      where: whereClause,
      _count: { maskingMethod: true },
    }),
    Promise.all([
      prisma.testDataSet.count({
        where: { ...whereClause, derivedFromProdClone: true, approvedBy: null },
      }),
      prisma.testDataSet.count({
        where: {
          ...whereClause,
          dataClassification: { in: ['PII', 'PCI'] },
          OR: [{ maskingMethod: null }, { maskingMethod: 'NONE' }],
        },
      }),
    ]),
  ]);

  return {
    byClassification: Object.fromEntries(
      byClassification.map((c) => [c.dataClassification, c._count.dataClassification])
    ),
    byMaskingMethod: Object.fromEntries(
      byMaskingMethod.map((m) => [m.maskingMethod ?? 'NONE', m._count.maskingMethod])
    ),
    unapprovedProdClones: complianceStats[0],
    sensitiveDatasetsWithoutMasking: complianceStats[1],
  };
}

// Create compliance audit record
export async function createComplianceAudit(data: {
  testDataSetId: string;
  complianceFlag: ComplianceFlag;
  status: string;
  auditorId?: string;
  auditorName?: string;
  findings?: string;
  evidence?: Record<string, unknown>;
  nextAuditDate?: Date;
}) {
  return prisma.complianceAudit.create({
    data: {
      testDataSetId: data.testDataSetId,
      complianceFlag: data.complianceFlag,
      status: data.status,
      auditorId: data.auditorId,
      auditorName: data.auditorName,
      findings: data.findings,
      evidence: data.evidence as object,
      nextAuditDate: data.nextAuditDate,
    },
  });
}

// Get compliance audit history
export async function getComplianceAudits(
  testDataSetId: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 20, offset = 0 } = options;

  const [audits, total] = await Promise.all([
    prisma.complianceAudit.findMany({
      where: { testDataSetId },
      orderBy: { auditDate: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.complianceAudit.count({ where: { testDataSetId } }),
  ]);

  return {
    items: audits,
    total,
    hasMore: offset + audits.length < total,
  };
}
