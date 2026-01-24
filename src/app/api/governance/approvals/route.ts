// TelEnvIQ - Approvals API
// GET /api/governance/approvals - List approval items
// POST /api/governance/approvals - Create a new approval request

import { NextRequest, NextResponse } from 'next/server';
import {
  listApprovals,
  createApproval,
} from '@/lib/services/governance/approvals';
import { ApprovalStatus, ApprovalType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ApprovalStatus | null;
    const assigneeId = searchParams.get('assigneeId');
    const environmentId = searchParams.get('environmentId');
    const approvalType = searchParams.get('approvalType') as ApprovalType | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await listApprovals({
      status: status || undefined,
      assigneeId: assigneeId || undefined,
      environmentId: environmentId || undefined,
      approvalType: approvalType || undefined,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing approvals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list approvals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.approvalType || !body.title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: approvalType, title' },
        { status: 400 }
      );
    }

    const approval = await createApproval({
      approvalType: body.approvalType,
      title: body.title,
      description: body.description,
      requesterId: body.requesterId,
      requesterName: body.requesterName,
      requesterEmail: body.requesterEmail,
      assigneeId: body.assigneeId,
      assigneeName: body.assigneeName,
      assigneeEmail: body.assigneeEmail,
      environmentId: body.environmentId,
      componentId: body.componentId,
      releaseId: body.releaseId,
      contextJson: body.contextJson,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      priority: body.priority || 0,
    });

    return NextResponse.json({ success: true, data: approval }, { status: 201 });
  } catch (error) {
    console.error('Error creating approval:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create approval' },
      { status: 500 }
    );
  }
}
