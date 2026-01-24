// TelEnvIQ - Dataset Approval API
// POST /api/datasets/[id]/approval - Request or grant approval
// PUT /api/datasets/[id]/approval - Update approval status

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requestApproval, grantApproval, revokeApproval } from '@/lib/services/governance/classification';

const RequestApprovalSchema = z.object({
  justification: z.string().min(1),
});

const GrantApprovalSchema = z.object({
  action: z.enum(['grant', 'revoke']),
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = RequestApprovalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const requestedBy = request.headers.get('x-user-name') || 'unknown';
    await requestApproval(id, requestedBy, validation.data.justification);

    return NextResponse.json({ success: true, message: 'Approval requested' });
  } catch (error) {
    console.error('Failed to request approval:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to request approval' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = GrantApprovalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const actorName = request.headers.get('x-user-name') || 'system';

    let dataset;
    if (validation.data.action === 'grant') {
      dataset = await grantApproval(id, actorName);
    } else {
      dataset = await revokeApproval(id, actorName, validation.data.reason || 'No reason provided');
    }

    return NextResponse.json({ success: true, data: dataset });
  } catch (error) {
    console.error('Failed to update approval:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update approval' },
      { status: 500 }
    );
  }
}
