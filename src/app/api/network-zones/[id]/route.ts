// TelEnvIQ - Network Zone API
// GET /api/network-zones/[id] - Get network zone
// PUT /api/network-zones/[id] - Update network zone
// DELETE /api/network-zones/[id] - Delete network zone

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getNetworkZone, updateNetworkZone, deleteNetworkZone } from '@/lib/services/network-zone';

const UpdateNetworkZoneSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['PROD', 'NON_PROD', 'DMZ', 'PARTNER', 'INTERNET', 'SECURE_CORE', 'LAB']).optional(),
  description: z.string().optional().nullable(),
  vlanRange: z.string().optional().nullable(),
  cidrBlocks: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const zone = await getNetworkZone(id);

    if (!zone) {
      return NextResponse.json(
        { success: false, error: 'Network zone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: zone });
  } catch (error) {
    console.error('Failed to fetch network zone:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch network zone' },
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
    const validation = UpdateNetworkZoneSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const zone = await updateNetworkZone(id, validation.data);
    return NextResponse.json({ success: true, data: zone });
  } catch (error) {
    console.error('Failed to update network zone:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update network zone' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteNetworkZone(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete network zone:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete network zone' },
      { status: 500 }
    );
  }
}
