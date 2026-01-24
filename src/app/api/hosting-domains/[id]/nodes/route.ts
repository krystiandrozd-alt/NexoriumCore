// TelEnvIQ - Hosting Domain Nodes API
// GET /api/hosting-domains/[id]/nodes - Get nodes in hosting domain

import { NextRequest, NextResponse } from 'next/server';
import { getHostingDomainNodes } from '@/lib/services/hosting-domain';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const nodes = await getHostingDomainNodes(id);
    return NextResponse.json({ success: true, data: nodes });
  } catch (error) {
    console.error('Failed to fetch hosting domain nodes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hosting domain nodes' },
      { status: 500 }
    );
  }
}
