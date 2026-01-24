// TelEnvIQ - Policy Violation Resolve API
// POST /api/governance/violations/[id]/resolve - Resolve a violation

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveViolation, acknowledgeViolation } from '@/lib/services/governance/policy';

const ResolveViolationSchema = z.object({
  action: z.enum(['resolve', 'acknowledge']),
  resolutionNotes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = ResolveViolationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const actorName = request.headers.get('x-user-name') || 'system';

    let violation;
    if (validation.data.action === 'resolve') {
      violation = await resolveViolation(id, actorName, validation.data.resolutionNotes);
    } else {
      violation = await acknowledgeViolation(id, actorName);
    }

    return NextResponse.json({ success: true, data: violation });
  } catch (error) {
    console.error('Failed to resolve violation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resolve violation' },
      { status: 500 }
    );
  }
}
