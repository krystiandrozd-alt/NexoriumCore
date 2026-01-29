// Nexorium Core - Exceptions Service
// Policy exception lifecycle management

import prisma from '@/lib/db';
import { ExceptionStatus } from '@prisma/client';
import type { ExceptionItem, ExceptionTimelineItem } from '@/types';

// ============================================
// EXCEPTION CRUD OPERATIONS
// ============================================

/**
 * List exception items with filtering
 */
export async function listExceptions(options?: {
  status?: ExceptionStatus;
  environmentId?: string;
  policyControlId?: string;
  expiringSoon?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ items: ExceptionItem[]; total: number }> {
  const now = new Date();
  const soonThreshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const where = {
    status: options?.status,
    environmentId: options?.environmentId,
    policyControlId: options?.policyControlId,
    ...(options?.expiringSoon
      ? {
          status: 'ACTIVE' as ExceptionStatus,
          expiresAt: { lte: soonThreshold },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.exceptionItem.findMany({
      where,
      include: {
        policyControl: true,
      },
      orderBy: [{ expiresAt: 'asc' }, { createdAt: 'desc' }],
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.exceptionItem.count({ where }),
  ]);

  return {
    items: items as unknown as ExceptionItem[],
    total,
  };
}

/**
 * Get expiring exceptions (within specified days)
 */
export async function getExpiringExceptions(days: number = 7): Promise<ExceptionItem[]> {
  const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const items = await prisma.exceptionItem.findMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { lte: threshold },
    },
    include: {
      policyControl: true,
    },
    orderBy: { expiresAt: 'asc' },
  });

  return items as unknown as ExceptionItem[];
}

/**
 * Get a single exception by ID
 */
export async function getException(id: string): Promise<ExceptionItem | null> {
  const item = await prisma.exceptionItem.findUnique({
    where: { id },
    include: {
      policyControl: true,
    },
  });

  return item as unknown as ExceptionItem | null;
}

/**
 * Create a new exception request
 */
export async function createException(
  data: Omit<ExceptionItem, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'approvedBy' | 'approvedByName' | 'approvedAt' | 'revokedBy' | 'revokedAt' | 'revocationReason'>
): Promise<ExceptionItem> {
  const item = await prisma.exceptionItem.create({
    data: {
      policyControlId: data.policyControlId,
      environmentId: data.environmentId,
      componentId: data.componentId,
      reason: data.reason,
      justification: data.justification,
      riskAssessment: data.riskAssessment,
      mitigationPlan: data.mitigationPlan,
      requestedBy: data.requestedBy,
      requestedByName: data.requestedByName,
      expiresAt: data.expiresAt,
      reviewReminder: data.reviewReminder,
      attachmentsJson: data.attachmentsJson as object[],
    },
    include: {
      policyControl: true,
    },
  });

  return item as unknown as ExceptionItem;
}

/**
 * Update an exception
 */
export async function updateException(
  id: string,
  data: Partial<Omit<ExceptionItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ExceptionItem> {
  const item = await prisma.exceptionItem.update({
    where: { id },
    data: {
      reason: data.reason,
      justification: data.justification,
      riskAssessment: data.riskAssessment,
      mitigationPlan: data.mitigationPlan,
      expiresAt: data.expiresAt,
      reviewReminder: data.reviewReminder,
      attachmentsJson: data.attachmentsJson as object[],
    },
    include: {
      policyControl: true,
    },
  });

  return item as unknown as ExceptionItem;
}

// ============================================
// EXCEPTION LIFECYCLE ACTIONS
// ============================================

/**
 * Approve an exception request
 */
export async function approveException(
  id: string,
  approvedBy: string,
  approvedByName: string,
  expiresAt?: Date
): Promise<ExceptionItem> {
  const item = await prisma.exceptionItem.update({
    where: { id },
    data: {
      status: 'ACTIVE',
      approvedBy,
      approvedByName,
      approvedAt: new Date(),
      expiresAt: expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Default 90 days
    },
    include: {
      policyControl: true,
    },
  });

  return item as unknown as ExceptionItem;
}

/**
 * Reject an exception request
 */
export async function rejectException(
  id: string,
  rejectedBy: string,
  rejectedByName: string,
  reason: string
): Promise<ExceptionItem> {
  // We use revoked fields for rejection as well
  const item = await prisma.exceptionItem.update({
    where: { id },
    data: {
      status: 'REVOKED', // Reusing REVOKED for rejected
      revokedBy: rejectedBy,
      revokedAt: new Date(),
      revocationReason: reason,
    },
    include: {
      policyControl: true,
    },
  });

  return item as unknown as ExceptionItem;
}

/**
 * Revoke an active exception
 */
export async function revokeException(
  id: string,
  revokedBy: string,
  reason: string
): Promise<ExceptionItem> {
  const item = await prisma.exceptionItem.update({
    where: { id },
    data: {
      status: 'REVOKED',
      revokedBy,
      revokedAt: new Date(),
      revocationReason: reason,
    },
    include: {
      policyControl: true,
    },
  });

  return item as unknown as ExceptionItem;
}

/**
 * Expire stale exceptions
 */
export async function expireStaleExceptions(): Promise<number> {
  const result = await prisma.exceptionItem.updateMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { lt: new Date() },
    },
    data: {
      status: 'EXPIRED',
    },
  });

  return result.count;
}

/**
 * Extend an exception's expiry date
 */
export async function extendException(
  id: string,
  newExpiresAt: Date,
  extendedBy: string,
  reason?: string
): Promise<ExceptionItem> {
  const existing = await prisma.exceptionItem.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`Exception not found: ${id}`);
  }

  // Add extension note to justification
  const extensionNote = `\n\n---\nExtended on ${new Date().toISOString()} by ${extendedBy}${reason ? `: ${reason}` : ''}`;

  const item = await prisma.exceptionItem.update({
    where: { id },
    data: {
      expiresAt: newExpiresAt,
      justification: (existing.justification || '') + extensionNote,
    },
    include: {
      policyControl: true,
    },
  });

  return item as unknown as ExceptionItem;
}

// ============================================
// EXCEPTION TIMELINE
// ============================================

/**
 * Get exception timeline for an environment
 */
export async function getExceptionTimeline(
  environmentId: string,
  days: number = 90
): Promise<ExceptionTimelineItem[]> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const exceptions = await prisma.exceptionItem.findMany({
    where: {
      environmentId,
      OR: [
        { requestedAt: { gte: startDate } },
        { approvedAt: { gte: startDate } },
        { expiresAt: { gte: startDate, lte: new Date() } },
        { revokedAt: { gte: startDate } },
      ],
    },
    include: {
      policyControl: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const timelineItems: ExceptionTimelineItem[] = [];

  for (const exception of exceptions) {
    // Add requested event
    if (exception.requestedAt >= startDate) {
      timelineItems.push({
        id: `${exception.id}-requested`,
        type: 'requested',
        date: exception.requestedAt,
        exception: exception as unknown as ExceptionItem,
        actor: exception.requestedByName,
      });
    }

    // Add approved event
    if (exception.approvedAt && exception.approvedAt >= startDate) {
      timelineItems.push({
        id: `${exception.id}-approved`,
        type: 'approved',
        date: exception.approvedAt,
        exception: exception as unknown as ExceptionItem,
        actor: exception.approvedByName,
      });
    }

    // Add expired event
    if (
      exception.status === 'EXPIRED' &&
      exception.expiresAt &&
      exception.expiresAt >= startDate &&
      exception.expiresAt <= new Date()
    ) {
      timelineItems.push({
        id: `${exception.id}-expired`,
        type: 'expired',
        date: exception.expiresAt,
        exception: exception as unknown as ExceptionItem,
      });
    }

    // Add revoked event
    if (exception.revokedAt && exception.revokedAt >= startDate) {
      timelineItems.push({
        id: `${exception.id}-revoked`,
        type: 'revoked',
        date: exception.revokedAt,
        exception: exception as unknown as ExceptionItem,
        actor: exception.revokedBy || undefined,
        notes: exception.revocationReason || undefined,
      });
    }
  }

  // Sort by date descending
  return timelineItems.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// ============================================
// EXCEPTION STATISTICS
// ============================================

/**
 * Get exception statistics
 */
export async function getExceptionStats(environmentId?: string): Promise<{
  total: number;
  requested: number;
  approved: number;
  active: number;
  expired: number;
  revoked: number;
  expiringSoon: number;
  byPolicy: Record<string, number>;
}> {
  const baseWhere = environmentId ? { environmentId } : {};
  const soonThreshold = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [
    total,
    requested,
    approved,
    active,
    expired,
    revoked,
    expiringSoon,
    byPolicy,
  ] = await Promise.all([
    prisma.exceptionItem.count({ where: baseWhere }),
    prisma.exceptionItem.count({ where: { ...baseWhere, status: 'REQUESTED' } }),
    prisma.exceptionItem.count({ where: { ...baseWhere, status: 'APPROVED' } }),
    prisma.exceptionItem.count({ where: { ...baseWhere, status: 'ACTIVE' } }),
    prisma.exceptionItem.count({ where: { ...baseWhere, status: 'EXPIRED' } }),
    prisma.exceptionItem.count({ where: { ...baseWhere, status: 'REVOKED' } }),
    prisma.exceptionItem.count({
      where: {
        ...baseWhere,
        status: 'ACTIVE',
        expiresAt: { lte: soonThreshold },
      },
    }),
    prisma.exceptionItem.groupBy({
      by: ['policyControlId'],
      where: { ...baseWhere, status: { in: ['ACTIVE', 'REQUESTED'] } },
      _count: true,
    }),
  ]);

  return {
    total,
    requested,
    approved,
    active,
    expired,
    revoked,
    expiringSoon,
    byPolicy: byPolicy.reduce(
      (acc, item) => {
        acc[item.policyControlId] = item._count;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}
