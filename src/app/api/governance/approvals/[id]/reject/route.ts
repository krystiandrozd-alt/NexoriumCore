// TelEnvIQ - Reject Approval API
// POST /api/governance/approvals/[id]/reject - Reject an approval item

import { NextRequest, NextResponse } from 'next/server';
import { rejectItem } from '@/lib/services/governance/approvals';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.rejectedBy || !body.reason) {
      return NextResponse.json(
        { success: false, error: 'rejectedBy and reason are required' },
        { status: 400 }
      );
    }

    const approval = await rejectItem(id, body.rejectedBy, body.reason);

    return NextResponse.json({ success: true, data: approval });
  } catch (error) {
    console.error('Error rejecting item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject item' },
      { status: 500 }
    );
  }
}
