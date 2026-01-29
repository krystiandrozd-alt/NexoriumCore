// Nexorium Core - Snapshots API
// GET /api/snapshots?environmentId=xxx - List snapshots for environment
// POST /api/snapshots - Create new snapshot

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSnapshot, listSnapshots } from '@/lib/services/snapshot';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const CreateSnapshotSchema = z.object({
  environmentId: z.string().uuid(),
});

export async function GET(request: NextRequest) {
  // Require authentication and VIEW_ENVIRONMENT permission
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const searchParams = request.nextUrl.searchParams;
    const environmentId = searchParams.get('environmentId');

    if (!environmentId) {
      return NextResponse.json(
        { success: false, error: 'environmentId is required' },
        { status: 400 }
      );
    }

    const snapshots = await listSnapshots(environmentId);
    return NextResponse.json({ success: true, data: snapshots });
  } catch (error) {
    console.error('Failed to fetch snapshots:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch snapshots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Require authentication and EDIT_ENVIRONMENT permission to create snapshots
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const validation = CreateSnapshotSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const snapshot = await createSnapshot(validation.data.environmentId);
    return NextResponse.json({ success: true, data: snapshot }, { status: 201 });
  } catch (error) {
    console.error('Failed to create snapshot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create snapshot' },
      { status: 500 }
    );
  }
}
