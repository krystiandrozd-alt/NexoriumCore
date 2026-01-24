// TelEnvIQ - Environment Ownership API
// GET /api/environments/[id]/ownership - Get environment ownership
// PUT /api/environments/[id]/ownership - Upsert environment ownership

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getEnvironmentOwnership, upsertEnvironmentOwnership } from '@/lib/services/ownership';

const UpsertOwnershipSchema = z.object({
  projectName: z.string().min(1).max(255),
  projectCode: z.string().optional(),
  ownerTeam: z.string().min(1).max(255),
  ownerEmail: z.string().email().optional(),
  technicalLead: z.string().optional(),
  technicalLeadEmail: z.string().email().optional(),
  businessUnit: z.string().optional(),
  costCenter: z.string().optional(),
  expiryDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ownership = await getEnvironmentOwnership(id);

    if (!ownership) {
      return NextResponse.json(
        { success: true, data: null },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, data: ownership });
  } catch (error) {
    console.error('Failed to fetch environment ownership:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch environment ownership' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = UpsertOwnershipSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const updatedBy = request.headers.get('x-user-name') || undefined;
    const ownership = await upsertEnvironmentOwnership(id, validation.data, updatedBy);

    return NextResponse.json({ success: true, data: ownership });
  } catch (error) {
    console.error('Failed to upsert environment ownership:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update environment ownership' },
      { status: 500 }
    );
  }
}
