// Nexorium Core - Node Enrichments API
// GET /api/nodes/[id]/enrichments - Get enrichments for node
// POST /api/nodes/[id]/enrichments - Create enrichment for node

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getNodeEnrichments, createEnrichment } from '@/lib/services/governance/enrichment';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const CreateEnrichmentSchema = z.object({
  fieldName: z.string().min(1),
  newValue: z.unknown(),
  reason: z.string().optional(),
  editedBy: z.string().min(1),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const fieldName = searchParams.get('fieldName');
    const status = searchParams.get('status') as 'ACTIVE' | 'REVERTED' | 'SUPERSEDED' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await getNodeEnrichments(id, {
      fieldName: fieldName || undefined,
      status: status || undefined,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to fetch node enrichments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch node enrichments' },
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
    const validation = CreateEnrichmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const enrichment = await createEnrichment({
      nodeId: id,
      ...validation.data,
    });

    return NextResponse.json({ success: true, data: enrichment }, { status: 201 });
  } catch (error) {
    console.error('Failed to create enrichment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create enrichment' },
      { status: 500 }
    );
  }
}
