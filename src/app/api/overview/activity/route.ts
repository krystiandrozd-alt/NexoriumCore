// TelEnvIQ - Overview Activity API
// GET /api/overview/activity - Paginated activity feed

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import type { ActivityItem } from '@/types/overview';

const QuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
  environmentIds: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validation = QuerySchema.safeParse({
      limit: searchParams.get('limit') ?? '20',
      offset: searchParams.get('offset') ?? '0',
      environmentIds: searchParams.get('environmentIds') ?? undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { limit, offset, environmentIds } = validation.data;

    // Parse environment IDs
    const environmentIdList = environmentIds ? environmentIds.split(',').filter(Boolean) : undefined;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (environmentIdList?.length) {
      where.environmentId = { in: environmentIdList };
    }

    // Fetch activity logs with pagination
    const [activityLogs, total] = await Promise.all([
      prisma.environmentActivityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          environment: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.environmentActivityLog.count({ where }),
    ]);

    // Transform to activity items
    const items: ActivityItem[] = activityLogs.map((log) => ({
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

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        hasMore: offset + items.length < total,
      },
    });
  } catch (error) {
    console.error('Failed to fetch activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

// Helper functions (duplicated for module isolation)
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
