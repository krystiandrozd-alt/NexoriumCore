// Nexorium Core - Dataset Audits API
// GET /api/datasets/[id]/audits - Get compliance audits
// POST /api/datasets/[id]/audits - Create compliance audit

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getComplianceAudits, createComplianceAudit } from '@/lib/services/governance/classification';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const CreateAuditSchema = z.object({
  complianceFlag: z.enum(['GDPR', 'PCI_DSS', 'HIPAA', 'SOX', 'INTERNAL_POLICY', 'CCPA']),
  status: z.string().min(1),
  auditorId: z.string().optional(),
  auditorName: z.string().optional(),
  findings: z.string().optional(),
  evidence: z.record(z.string(), z.unknown()).optional(),
  nextAuditDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_DATA);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await getComplianceAudits(id, { limit, offset });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to fetch compliance audits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch compliance audits' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.MANAGE_DATA);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = CreateAuditSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const audit = await createComplianceAudit({
      testDataSetId: id,
      ...validation.data,
    });

    return NextResponse.json({ success: true, data: audit }, { status: 201 });
  } catch (error) {
    console.error('Failed to create compliance audit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create compliance audit' },
      { status: 500 }
    );
  }
}
