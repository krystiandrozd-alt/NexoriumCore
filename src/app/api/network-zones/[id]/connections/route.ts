// Nexorium Core - Network Zone Connections API
// GET /api/network-zones/[id]/connections - Get zone connections
// POST /api/network-zones/[id]/connections - Create zone connection

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getZoneConnections, createZoneConnection } from '@/lib/services/network-zone';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const CreateConnectionSchema = z.object({
  targetZoneId: z.string().uuid(),
  policy: z.enum(['RESTRICTED', 'ALLOWED_VIA_GATEWAY', 'NO_DIRECT_ACCESS']),
  bridgeMechanism: z.enum(['API_GATEWAY', 'PROXY', 'BASTION', 'FILE_TRANSFER', 'ESB', 'DIRECT']).optional(),
  bridgeNodeName: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const connections = await getZoneConnections(id);
    return NextResponse.json({ success: true, data: connections });
  } catch (error) {
    console.error('Failed to fetch zone connections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch zone connections' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = CreateConnectionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const connection = await createZoneConnection({
      sourceZoneId: id,
      ...validation.data,
    });

    return NextResponse.json({ success: true, data: connection }, { status: 201 });
  } catch (error) {
    console.error('Failed to create zone connection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create zone connection' },
      { status: 500 }
    );
  }
}
