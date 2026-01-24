// TelEnvIQ - Single Exception API
// GET /api/governance/exceptions/[id] - Get a single exception
// PUT /api/governance/exceptions/[id] - Update an exception

import { NextRequest, NextResponse } from 'next/server';
import {
  getException,
  updateException,
} from '@/lib/services/governance/exceptions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const exception = await getException(id);

    if (!exception) {
      return NextResponse.json(
        { success: false, error: 'Exception not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: exception });
  } catch (error) {
    console.error('Error getting exception:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get exception' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const exception = await updateException(id, {
      reason: body.reason,
      justification: body.justification,
      riskAssessment: body.riskAssessment,
      mitigationPlan: body.mitigationPlan,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      reviewReminder: body.reviewReminder ? new Date(body.reviewReminder) : undefined,
      attachmentsJson: body.attachmentsJson,
    });

    return NextResponse.json({ success: true, data: exception });
  } catch (error) {
    console.error('Error updating exception:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update exception' },
      { status: 500 }
    );
  }
}
