// TelEnvIQ - Single Coupling Link API
// GET /api/governance/coupling/[id] - Get a single coupling link
// PUT /api/governance/coupling/[id] - Update a coupling link
// DELETE /api/governance/coupling/[id] - Delete a coupling link

import { NextRequest, NextResponse } from 'next/server';
import {
  getCoupling,
  updateCoupling,
  deleteCoupling,
  approveCoupling,
  rejectCoupling,
} from '@/lib/services/governance/coupling';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const coupling = await getCoupling(id);

    if (!coupling) {
      return NextResponse.json(
        { success: false, error: 'Coupling link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: coupling });
  } catch (error) {
    console.error('Error getting coupling:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get coupling' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Handle special actions
    if (body.action === 'approve') {
      const coupling = await approveCoupling(id, body.reviewedBy, body.reviewNotes);
      return NextResponse.json({ success: true, data: coupling });
    }

    if (body.action === 'reject') {
      const coupling = await rejectCoupling(
        id,
        body.reviewedBy,
        body.reviewNotes,
        body.mitigationRequired
      );
      return NextResponse.json({ success: true, data: coupling });
    }

    // Regular update
    const coupling = await updateCoupling(id, {
      status: body.status,
      riskLevel: body.riskLevel,
      description: body.description,
      reviewedBy: body.reviewedBy,
      reviewedAt: body.reviewedAt ? new Date(body.reviewedAt) : undefined,
      reviewNotes: body.reviewNotes,
      mitigationRequired: body.mitigationRequired,
      mitigationPlan: body.mitigationPlan,
      resolvedAt: body.resolvedAt ? new Date(body.resolvedAt) : undefined,
    });

    return NextResponse.json({ success: true, data: coupling });
  } catch (error) {
    console.error('Error updating coupling:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update coupling' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteCoupling(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupling:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete coupling' },
      { status: 500 }
    );
  }
}
