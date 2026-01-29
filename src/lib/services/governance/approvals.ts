// Nexorium Core - Approvals Service
// Lightweight approval workflow management

import prisma from '@/lib/db';
import { ApprovalStatus, ApprovalType, RACIRole } from '@prisma/client';
import type { ApprovalItem, ApprovalInboxStats, ApprovalContext } from '@/types';

// ============================================
// APPROVAL CRUD OPERATIONS
// ============================================

/**
 * List approval items with filtering
 */
export async function listApprovals(options?: {
  status?: ApprovalStatus;
  assigneeId?: string;
  environmentId?: string;
  approvalType?: ApprovalType;
  limit?: number;
  offset?: number;
}): Promise<{ items: ApprovalItem[]; total: number }> {
  const where = {
    status: options?.status,
    assigneeId: options?.assigneeId,
    environmentId: options?.environmentId,
    approvalType: options?.approvalType,
  };

  const [items, total] = await Promise.all([
    prisma.approvalItem.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.approvalItem.count({ where }),
  ]);

  return {
    items: items as unknown as ApprovalItem[],
    total,
  };
}

/**
 * Get pending approvals for a user
 */
export async function getPendingApprovals(assigneeId?: string): Promise<ApprovalItem[]> {
  const items = await prisma.approvalItem.findMany({
    where: {
      status: 'PENDING',
      ...(assigneeId ? { assigneeId } : {}),
    },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'asc' }],
  });

  return items as unknown as ApprovalItem[];
}

/**
 * Get a single approval item by ID
 */
export async function getApproval(id: string): Promise<ApprovalItem | null> {
  const item = await prisma.approvalItem.findUnique({
    where: { id },
  });

  return item as unknown as ApprovalItem | null;
}

/**
 * Create a new approval request
 */
export async function createApproval(
  data: Omit<ApprovalItem, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'decisionReason' | 'decisionBy' | 'decisionAt'>
): Promise<ApprovalItem> {
  const item = await prisma.approvalItem.create({
    data: {
      approvalType: data.approvalType,
      title: data.title,
      description: data.description,
      requesterId: data.requesterId,
      requesterName: data.requesterName,
      requesterEmail: data.requesterEmail,
      assigneeId: data.assigneeId,
      assigneeName: data.assigneeName,
      assigneeEmail: data.assigneeEmail,
      environmentId: data.environmentId,
      componentId: data.componentId,
      releaseId: data.releaseId,
      contextJson: data.contextJson as object,
      expiresAt: data.expiresAt,
      dueDate: data.dueDate,
      priority: data.priority || 0,
    },
  });

  return item as unknown as ApprovalItem;
}

/**
 * Update an approval item
 */
export async function updateApproval(
  id: string,
  data: Partial<Omit<ApprovalItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ApprovalItem> {
  const item = await prisma.approvalItem.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      assigneeId: data.assigneeId,
      assigneeName: data.assigneeName,
      assigneeEmail: data.assigneeEmail,
      contextJson: data.contextJson as object,
      expiresAt: data.expiresAt,
      dueDate: data.dueDate,
      priority: data.priority,
    },
  });

  return item as unknown as ApprovalItem;
}

// ============================================
// APPROVAL WORKFLOW ACTIONS
// ============================================

/**
 * Approve an approval item
 */
export async function approveItem(
  id: string,
  approvedBy: string,
  reason?: string
): Promise<ApprovalItem> {
  const item = await prisma.approvalItem.update({
    where: { id },
    data: {
      status: 'APPROVED',
      decisionBy: approvedBy,
      decisionReason: reason,
      decisionAt: new Date(),
    },
  });

  return item as unknown as ApprovalItem;
}

/**
 * Reject an approval item
 */
export async function rejectItem(
  id: string,
  rejectedBy: string,
  reason: string
): Promise<ApprovalItem> {
  const item = await prisma.approvalItem.update({
    where: { id },
    data: {
      status: 'REJECTED',
      decisionBy: rejectedBy,
      decisionReason: reason,
      decisionAt: new Date(),
    },
  });

  return item as unknown as ApprovalItem;
}

/**
 * Cancel an approval item (by requester)
 */
export async function cancelItem(id: string): Promise<ApprovalItem> {
  const item = await prisma.approvalItem.update({
    where: { id },
    data: {
      status: 'CANCELLED',
    },
  });

  return item as unknown as ApprovalItem;
}

/**
 * Expire stale approval items
 */
export async function expireStaleApprovals(): Promise<number> {
  const result = await prisma.approvalItem.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: new Date() },
    },
    data: {
      status: 'EXPIRED',
    },
  });

  return result.count;
}

// ============================================
// APPROVAL STATISTICS
// ============================================

/**
 * Get inbox statistics
 */
export async function getApprovalStats(assigneeId?: string): Promise<ApprovalInboxStats> {
  const now = new Date();
  const soonThreshold = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

  const baseWhere = assigneeId ? { assigneeId } : {};

  const [pending, overdue, dueSoon, byType] = await Promise.all([
    prisma.approvalItem.count({
      where: { ...baseWhere, status: 'PENDING' },
    }),
    prisma.approvalItem.count({
      where: {
        ...baseWhere,
        status: 'PENDING',
        dueDate: { lt: now },
      },
    }),
    prisma.approvalItem.count({
      where: {
        ...baseWhere,
        status: 'PENDING',
        dueDate: { gte: now, lte: soonThreshold },
      },
    }),
    prisma.approvalItem.groupBy({
      by: ['approvalType'],
      where: { ...baseWhere, status: 'PENDING' },
      _count: true,
    }),
  ]);

  return {
    pending,
    overdue,
    dueSoon,
    byType: byType.reduce(
      (acc, item) => {
        acc[item.approvalType] = item._count;
        return acc;
      },
      {} as Partial<Record<ApprovalType, number>>
    ),
  };
}

// ============================================
// RACI INTEGRATION
// ============================================

/**
 * Find potential approvers based on RACI mapping
 */
export async function findApprovers(
  environmentId: string,
  approvalType: ApprovalType
): Promise<{ id: string; name: string; email: string; role: string }[]> {
  // For promotion approvals, look for ACCOUNTABLE role
  // For other types, look for RESPONSIBLE or ACCOUNTABLE
  const roles: RACIRole[] = approvalType === 'PROMOTION'
    ? [RACIRole.ACCOUNTABLE]
    : [RACIRole.RESPONSIBLE, RACIRole.ACCOUNTABLE];

  const mappings = await prisma.rACIMapping.findMany({
    where: {
      entityType: 'ENVIRONMENT',
      entityId: environmentId,
      raciRole: { in: roles },
    },
    include: {
      person: true,
    },
  });

  return mappings.map((m) => ({
    id: m.person.id,
    name: m.person.displayName,
    email: m.person.email,
    role: m.raciRole,
  }));
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a promotion approval request
 */
export async function createPromotionApproval(
  sourceEnvId: string,
  targetEnvId: string,
  requesterId: string,
  requesterName: string,
  components?: string[]
): Promise<ApprovalItem> {
  const [sourceEnv, targetEnv, approvers] = await Promise.all([
    prisma.environment.findUnique({ where: { id: sourceEnvId } }),
    prisma.environment.findUnique({ where: { id: targetEnvId } }),
    findApprovers(targetEnvId, 'PROMOTION'),
  ]);

  const assignee = approvers[0]; // Get first ACCOUNTABLE person

  const context: ApprovalContext = {
    sourceEnvironment: sourceEnv?.name,
    targetEnvironment: targetEnv?.name,
    components,
  };

  return createApproval({
    approvalType: 'PROMOTION',
    title: `Promotion: ${sourceEnv?.name} → ${targetEnv?.name}`,
    description: `Request to promote from ${sourceEnv?.name} to ${targetEnv?.name}`,
    requesterId,
    requesterName,
    assigneeId: assignee?.id,
    assigneeName: assignee?.name,
    assigneeEmail: assignee?.email,
    environmentId: targetEnvId,
    contextJson: context,
    priority: 1,
    expiresAt: null,
    dueDate: null,
    requesterEmail: null,
    componentId: null,
    releaseId: null,
  });
}

/**
 * Create an exception approval request
 */
export async function createExceptionApproval(
  exceptionId: string,
  policyName: string,
  environmentId: string,
  requesterId: string,
  requesterName: string
): Promise<ApprovalItem> {
  const approvers = await findApprovers(environmentId, 'EXCEPTION_REQUEST');
  const assignee = approvers[0];

  return createApproval({
    approvalType: 'EXCEPTION_REQUEST',
    title: `Exception Request: ${policyName}`,
    description: `Request for exception to policy: ${policyName}`,
    requesterId,
    requesterName,
    assigneeId: assignee?.id,
    assigneeName: assignee?.name,
    assigneeEmail: assignee?.email,
    environmentId,
    contextJson: { exceptionId, policyName } as ApprovalContext,
    priority: 0,
    expiresAt: null,
    dueDate: null,
    requesterEmail: null,
    componentId: null,
    releaseId: null,
  });
}
