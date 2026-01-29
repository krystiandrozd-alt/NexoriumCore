// Nexorium Core - Compliance Evaluation API
// POST /api/governance/compliance/evaluate - Trigger compliance evaluation

import { NextRequest, NextResponse } from 'next/server';
import {
  evaluateControl,
  evaluateAllControls,
} from '@/lib/services/governance/compliance';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

export async function POST(request: NextRequest) {
  const auth = await requirePermission(Permission.MANAGE_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { environmentId, controlId, evaluatedBy } = body;

    if (!environmentId) {
      return NextResponse.json(
        { success: false, error: 'environmentId is required' },
        { status: 400 }
      );
    }

    let results;
    if (controlId) {
      // Evaluate single control
      const result = await evaluateControl(controlId, environmentId, evaluatedBy);
      results = [result];
    } else {
      // Evaluate all controls
      results = await evaluateAllControls(environmentId, evaluatedBy);
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `Evaluated ${results.length} control(s)`,
    });
  } catch (error) {
    console.error('Error evaluating compliance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to evaluate compliance' },
      { status: 500 }
    );
  }
}
