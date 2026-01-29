// Nexorium Core - Environment Activity Logs API
// GET /api/environments/[id]/activity-logs - Get activity logs
// POST /api/environments/[id]/activity-logs - Create activity log entry

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getActivityLogs, createAuditLog } from '@/lib/services/governance/audit';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const CreateActivityLogSchema = z.object({
  action: z.enum([
    'CONNECTOR_RUN', 'SNAPSHOT_CREATED', 'MANUAL_EDIT',
    'ENRICHMENT_ADDED', 'ENRICHMENT_REVERTED',
    'POLICY_VIOLATION_DETECTED', 'POLICY_VIOLATION_RESOLVED',
    'APPROVAL_GRANTED', 'APPROVAL_REVOKED',
    'DATA_REFRESH', 'OWNERSHIP_CHANGED'
  ]),
  actorId: z.string().optional(),
  actorName: z.string().optional(),
  targetType: z.string().optional(),
  targetId: z.string().optional(),
  targetName: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const action = searchParams.get('action') as 'CONNECTOR_RUN' | 'SNAPSHOT_CREATED' | 'MANUAL_EDIT' | null;
    const actorId = searchParams.get('actorId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const result = await getActivityLogs(id, {
      limit,
      offset,
      action: action || undefined,
      actorId: actorId || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = CreateActivityLogSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Override actor with authenticated user
    const log = await createAuditLog({
      environmentId: id,
      ...validation.data,
      actorId: auth.user!.id,
      actorName: auth.user!.name,
    });

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    console.error('Failed to create activity log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create activity log' },
      { status: 500 }
    );
  }
}
