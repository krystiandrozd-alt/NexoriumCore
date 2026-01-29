// Nexorium Core - Approve Exception API
// POST /api/governance/exceptions/[id]/approve - Approve an exception request

import { NextRequest, NextResponse } from 'next/server';
import { approveException } from '@/lib/services/governance/exceptions';
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

    if (!body.approvedBy || !body.approvedByName) {
      return NextResponse.json(
        { success: false, error: 'approvedBy and approvedByName are required' },
        { status: 400 }
      );
    }

    const exception = await approveException(
      id,
      body.approvedBy,
      body.approvedByName,
      body.expiresAt ? new Date(body.expiresAt) : undefined
    );

    return NextResponse.json({ success: true, data: exception });
  } catch (error) {
    console.error('Error approving exception:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve exception' },
      { status: 500 }
    );
  }
}
