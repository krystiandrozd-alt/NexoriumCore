// TelEnvIQ - Network Zones API
// GET /api/network-zones - List all network zones
// POST /api/network-zones - Create new network zone

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { listNetworkZones, createNetworkZone } from '@/lib/services/network-zone';

const CreateNetworkZoneSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['PROD', 'NON_PROD', 'DMZ', 'PARTNER', 'INTERNET', 'SECURE_CORE', 'LAB']),
  description: z.string().optional(),
  vlanRange: z.string().optional(),
  cidrBlocks: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'PROD' | 'NON_PROD' | 'DMZ' | 'PARTNER' | 'INTERNET' | 'SECURE_CORE' | 'LAB' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await listNetworkZones({
      type: type || undefined,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to fetch network zones:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch network zones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CreateNetworkZoneSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const zone = await createNetworkZone(validation.data);
    return NextResponse.json({ success: true, data: zone }, { status: 201 });
  } catch (error) {
    console.error('Failed to create network zone:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create network zone' },
      { status: 500 }
    );
  }
}
