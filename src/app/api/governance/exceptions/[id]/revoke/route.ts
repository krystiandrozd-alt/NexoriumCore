// Nexorium Core - Revoke Exception API
// POST /api/governance/exceptions/[id]/revoke - Revoke an active exception

import { NextRequest, NextResponse } from 'next/server';
import { revokeException } from '@/lib/services/governance/exceptions';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await requirePermission(Permission.MANAGE_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.revokedBy || !body.reason) {
      return NextResponse.json(
        { success: false, error: 'revokedBy and reason are required' },
        { status: 400 }
      );
    }

    const exception = await revokeException(id, body.revokedBy, body.reason);

    return NextResponse.json({ success: true, data: exception });
  } catch (error) {
    console.error('Error revoking exception:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to revoke exception' },
      { status: 500 }
    );
  }
}
