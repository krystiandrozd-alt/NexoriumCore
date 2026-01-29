// Nexorium Core - Enrichment Revert API
// POST /api/enrichments/[id]/revert - Revert enrichment

import { NextRequest, NextResponse } from 'next/server';
import { revertEnrichment } from '@/lib/services/governance/enrichment';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const revertedBy = request.headers.get('x-user-name') || 'system';

    const enrichment = await revertEnrichment(id, revertedBy);

    return NextResponse.json({ success: true, data: enrichment });
  } catch (error) {
    console.error('Failed to revert enrichment:', error);
    const message = error instanceof Error ? error.message : 'Failed to revert enrichment';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
