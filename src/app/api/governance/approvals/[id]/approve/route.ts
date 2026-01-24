// TelEnvIQ - Approve Approval API
// POST /api/governance/approvals/[id]/approve - Approve an approval item

import { NextRequest, NextResponse } from 'next/server';
import { approveItem } from '@/lib/services/governance/approvals';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.approvedBy) {
      return NextResponse.json(
        { success: false, error: 'approvedBy is required' },
        { status: 400 }
      );
    }

    const approval = await approveItem(id, body.approvedBy, body.reason);

    return NextResponse.json({ success: true, data: approval });
  } catch (error) {
    console.error('Error approving item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve item' },
      { status: 500 }
    );
  }
}
