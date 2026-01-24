// TelEnvIQ - Enrichments API
// GET /api/enrichments - Search enrichments

import { NextRequest, NextResponse } from 'next/server';
import { searchEnrichments } from '@/lib/services/governance/enrichment';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const environmentId = searchParams.get('environmentId');
    const fieldName = searchParams.get('fieldName');
    const editedBy = searchParams.get('editedBy');
    const status = searchParams.get('status') as 'ACTIVE' | 'REVERTED' | 'SUPERSEDED' | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await searchEnrichments({
      environmentId: environmentId || undefined,
      fieldName: fieldName || undefined,
      editedBy: editedBy || undefined,
      status: status || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to search enrichments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search enrichments' },
      { status: 500 }
    );
  }
}
