// Nexorium Core - Single Snapshot API
// GET /api/snapshots/[id] - Get snapshot details
// NOTE: DELETE endpoint removed - snapshots are immutable per CLAUDE.md architectural invariant

import { NextRequest, NextResponse } from 'next/server';
import { getSnapshot } from '@/lib/services/snapshot';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication and VIEW_ENVIRONMENT permission
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const snapshot = await getSnapshot(id);

    if (!snapshot) {
      return NextResponse.json(
        { success: false, error: 'Snapshot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: snapshot });
  } catch (error) {
    console.error('Failed to fetch snapshot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch snapshot' },
      { status: 500 }
    );
  }
}

// DELETE endpoint intentionally removed - snapshots are immutable
// Per CLAUDE.md: "Snapshots are immutable once created"
