// TelEnvIQ - Audit Service
// Immutable audit logging with append-only operations and checksum verification

import prisma from '@/lib/db';
import { createHash } from 'crypto';
import type { ActivityActionType, EnvironmentActivityLog } from '@/types';

// Generate checksum for audit entry integrity
function generateChecksum(data: {
  environmentId: string;
  action: ActivityActionType;
  actorId?: string | null;
  actorName?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  targetName?: string | null;
  details?: Record<string, unknown> | null;
  previousLogId?: string | null;
  createdAt: Date;
}): string {
  const payload = JSON.stringify({
    environmentId: data.environmentId,
    action: data.action,
    actorId: data.actorId,
    actorName: data.actorName,
    targetType: data.targetType,
    targetId: data.targetId,
    targetName: data.targetName,
    details: data.details,
    previousLogId: data.previousLogId,
    createdAt: data.createdAt.toISOString(),
  });
  return createHash('sha256').update(payload).digest('hex');
}

// Get the latest log entry for an environment (for chaining)
async function getLatestLogEntry(environmentId: string) {
  return prisma.environmentActivityLog.findFirst({
    where: { environmentId },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });
}

// Create an immutable audit log entry
export async function createAuditLog(data: {
  environmentId: string;
  action: ActivityActionType;
  actorId?: string;
  actorName?: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  details?: Record<string, unknown>;
}): Promise<EnvironmentActivityLog> {
  const latestLog = await getLatestLogEntry(data.environmentId);
  const createdAt = new Date();

  const checksum = generateChecksum({
    environmentId: data.environmentId,
    action: data.action,
    actorId: data.actorId,
    actorName: data.actorName,
    targetType: data.targetType,
    targetId: data.targetId,
    targetName: data.targetName,
    details: data.details,
    previousLogId: latestLog?.id,
    createdAt,
  });

  const log = await prisma.environmentActivityLog.create({
    data: {
      environmentId: data.environmentId,
      action: data.action,
      actorId: data.actorId,
      actorName: data.actorName,
      targetType: data.targetType,
      targetId: data.targetId,
      targetName: data.targetName,
      details: data.details as object,
      checksum,
      previousLogId: latestLog?.id,
      createdAt,
    },
  });

  return {
    ...log,
    details: log.details as Record<string, unknown> | null,
  } as EnvironmentActivityLog;
}

// Get activity logs for an environment with pagination
export async function getActivityLogs(
  environmentId: string,
  options: {
    limit?: number;
    offset?: number;
    action?: ActivityActionType;
    actorId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
) {
  const { limit = 50, offset = 0, action, actorId, startDate, endDate } = options;

  const where: Record<string, unknown> = { environmentId };

  if (action) where.action = action;
  if (actorId) where.actorId = actorId;
  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };
  }

  const [logs, total] = await Promise.all([
    prisma.environmentActivityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.environmentActivityLog.count({ where }),
  ]);

  return {
    items: logs,
    total,
    hasMore: offset + logs.length < total,
  };
}

// Verify checksum integrity of a log entry
export async function verifyLogIntegrity(logId: string): Promise<{
  valid: boolean;
  log: EnvironmentActivityLog | null;
  expectedChecksum?: string;
}> {
  const log = await prisma.environmentActivityLog.findUnique({
    where: { id: logId },
  });

  if (!log) {
    return { valid: false, log: null };
  }

  const expectedChecksum = generateChecksum({
    environmentId: log.environmentId,
    action: log.action as ActivityActionType,
    actorId: log.actorId,
    actorName: log.actorName,
    targetType: log.targetType,
    targetId: log.targetId,
    targetName: log.targetName,
    details: log.details as Record<string, unknown> | null,
    previousLogId: log.previousLogId,
    createdAt: log.createdAt,
  });

  return {
    valid: log.checksum === expectedChecksum,
    log: log as EnvironmentActivityLog,
    expectedChecksum,
  };
}

// Verify entire chain of audit logs for an environment
export async function verifyAuditChain(environmentId: string): Promise<{
  valid: boolean;
  totalLogs: number;
  invalidLogs: string[];
  brokenChains: Array<{ logId: string; expectedPrevious: string | null; actualPrevious: string | null }>;
}> {
  const logs = await prisma.environmentActivityLog.findMany({
    where: { environmentId },
    orderBy: { createdAt: 'asc' },
  });

  const invalidLogs: string[] = [];
  const brokenChains: Array<{ logId: string; expectedPrevious: string | null; actualPrevious: string | null }> = [];
  let previousLogId: string | null = null;

  for (const log of logs) {
    // Verify checksum
    const { valid } = await verifyLogIntegrity(log.id);
    if (!valid) {
      invalidLogs.push(log.id);
    }

    // Verify chain
    if (log.previousLogId !== previousLogId) {
      brokenChains.push({
        logId: log.id,
        expectedPrevious: previousLogId,
        actualPrevious: log.previousLogId,
      });
    }

    previousLogId = log.id;
  }

  return {
    valid: invalidLogs.length === 0 && brokenChains.length === 0,
    totalLogs: logs.length,
    invalidLogs,
    brokenChains,
  };
}

// Get audit log summary statistics
export async function getAuditSummary(environmentId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await prisma.environmentActivityLog.groupBy({
    by: ['action'],
    where: {
      environmentId,
      createdAt: { gte: startDate },
    },
    _count: { action: true },
  });

  const actionCounts: Record<string, number> = {};
  for (const log of logs) {
    actionCounts[log.action] = log._count.action;
  }

  const recentActors = await prisma.environmentActivityLog.findMany({
    where: {
      environmentId,
      createdAt: { gte: startDate },
      actorId: { not: null },
    },
    distinct: ['actorId'],
    select: { actorId: true, actorName: true },
  });

  return {
    actionCounts,
    totalActions: Object.values(actionCounts).reduce((a, b) => a + b, 0),
    uniqueActors: recentActors.length,
    actors: recentActors,
  };
}
