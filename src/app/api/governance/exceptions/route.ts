// Nexorium Core - Exceptions API
// GET /api/governance/exceptions - List exception items
// POST /api/governance/exceptions - Create a new exception request

import { NextRequest, NextResponse } from 'next/server';
import {
  listExceptions,
  createException,
} from '@/lib/services/governance/exceptions';
import { ExceptionStatus } from '@prisma/client';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

export async function GET(request: NextRequest) {
  const auth = await requirePermission(Permission.VIEW_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ExceptionStatus | null;
    const environmentId = searchParams.get('environmentId');
    const policyControlId = searchParams.get('policyControlId');
    const expiringSoon = searchParams.get('expiringSoon') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await listExceptions({
      status: status || undefined,
      environmentId: environmentId || undefined,
      policyControlId: policyControlId || undefined,
      expiringSoon,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing exceptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list exceptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(Permission.MANAGE_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.policyControlId || !body.reason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: policyControlId, reason' },
        { status: 400 }
      );
    }

    const exception = await createException({
      policyControlId: body.policyControlId,
      environmentId: body.environmentId,
      componentId: body.componentId,
      reason: body.reason,
      justification: body.justification,
      riskAssessment: body.riskAssessment,
      mitigationPlan: body.mitigationPlan,
      requestedBy: body.requestedBy,
      requestedByName: body.requestedByName,
      requestedAt: new Date(),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      reviewReminder: body.reviewReminder ? new Date(body.reviewReminder) : null,
      attachmentsJson: body.attachmentsJson,
    });

    return NextResponse.json({ success: true, data: exception }, { status: 201 });
  } catch (error) {
    console.error('Error creating exception:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create exception' },
      { status: 500 }
    );
  }
}
