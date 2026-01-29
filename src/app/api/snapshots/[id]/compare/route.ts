// Nexorium Core - Snapshot Comparison API
// POST /api/snapshots/[id]/compare - Compare with another snapshot

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { compareSnapshots } from '@/lib/services/snapshot';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const CompareSchema = z.object({
  compareWith: z.string().uuid(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = CompareSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const driftReport = await compareSnapshots(id, validation.data.compareWith);
    return NextResponse.json({ success: true, data: driftReport });
  } catch (error) {
    console.error('Failed to compare snapshots:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compare snapshots' },
      { status: 500 }
    );
  }
}
