// TelEnvIQ - Single Approval API
// GET /api/governance/approvals/[id] - Get a single approval
// PUT /api/governance/approvals/[id] - Update an approval

import { NextRequest, NextResponse } from 'next/server';
import {
  getApproval,
  updateApproval,
} from '@/lib/services/governance/approvals';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const approval = await getApproval(id);

    if (!approval) {
      return NextResponse.json(
        { success: false, error: 'Approval not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: approval });
  } catch (error) {
    console.error('Error getting approval:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get approval' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const approval = await updateApproval(id, {
      title: body.title,
      description: body.description,
      assigneeId: body.assigneeId,
      assigneeName: body.assigneeName,
      assigneeEmail: body.assigneeEmail,
      contextJson: body.contextJson,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      priority: body.priority,
    });

    return NextResponse.json({ success: true, data: approval });
  } catch (error) {
    console.error('Error updating approval:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update approval' },
      { status: 500 }
    );
  }
}
