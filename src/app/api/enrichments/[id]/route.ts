// Nexorium Core - Enrichment API
// GET /api/enrichments/[id] - Get enrichment by ID

import { NextRequest, NextResponse } from 'next/server';
import { getEnrichment } from '@/lib/services/governance/enrichment';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

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
