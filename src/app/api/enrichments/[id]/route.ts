// TelEnvIQ - Enrichment API
// GET /api/enrichments/[id] - Get enrichment by ID

import { NextRequest, NextResponse } from 'next/server';
import { getEnrichment } from '@/lib/services/governance/enrichment';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const enrichment = await getEnrichment(id);

    if (!enrichment) {
      return NextResponse.json(
        { success: false, error: 'Enrichment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: enrichment });
  } catch (error) {
    console.error('Failed to fetch enrichment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrichment' },
      { status: 500 }
    );
  }
}
