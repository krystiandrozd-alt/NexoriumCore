// Nexorium Core - Approve Approval API
// POST /api/governance/approvals/[id]/approve - Approve an approval item

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { approveItem } from '@/lib/services/governance/approvals';
import { requireAuth } from '@/lib/auth/api-auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const ApproveSchema = z.object({
  reason: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  // Require authentication - user identity comes from session, not request body
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const validation = ApproveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Use authenticated user's name instead of trusting client-provided identity
    const approval = await approveItem(id, auth.user!.name, validation.data.reason);

    return NextResponse.json({ success: true, data: approval });
  } catch (error) {
    console.error('Error approving item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve item' },
      { status: 500 }
    );
  }
}
