// TelEnvIQ - Single Policy Control API
// GET /api/governance/controls/[id] - Get a single policy control
// PUT /api/governance/controls/[id] - Update a policy control
// DELETE /api/governance/controls/[id] - Delete a policy control

import { NextRequest, NextResponse } from 'next/server';
import {
  getPolicyControl,
  updatePolicyControl,
  deletePolicyControl,
} from '@/lib/services/governance/compliance';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const control = await getPolicyControl(id);

    if (!control) {
      return NextResponse.json(
        { success: false, error: 'Policy control not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: control });
  } catch (error) {
    console.error('Error getting policy control:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get policy control' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const control = await updatePolicyControl(id, {
      name: body.name,
      description: body.description,
      category: body.category,
      scope: body.scope,
      scopeId: body.scopeId,
      severity: body.severity,
      isActive: body.isActive,
      configJson: body.configJson,
      evaluatorType: body.evaluatorType,
      remediation: body.remediation,
    });

    return NextResponse.json({ success: true, data: control });
  } catch (error) {
    console.error('Error updating policy control:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update policy control' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deletePolicyControl(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting policy control:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete policy control' },
      { status: 500 }
    );
  }
}
