// Nexorium Core - Hosting Domain API
// GET /api/hosting-domains/[id] - Get hosting domain
// PUT /api/hosting-domains/[id] - Update hosting domain
// DELETE /api/hosting-domains/[id] - Delete hosting domain

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getHostingDomain, updateHostingDomain, deleteHostingDomain } from '@/lib/services/hosting-domain';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const UpdateHostingDomainSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  hostingType: z.enum(['CLOUD', 'ON_PREM', 'HYBRID', 'THIRD_PARTY', 'EDGE']).optional(),
  cloudProvider: z.enum(['AWS', 'AZURE', 'GCP', 'ORACLE_CLOUD', 'IBM_CLOUD', 'ALIBABA_CLOUD', 'PRIVATE_CLOUD', 'NONE']).optional().nullable(),
  region: z.string().optional().nullable(),
  accountId: z.string().optional().nullable(),
  dataCenter: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const domain = await getHostingDomain(id);

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Hosting domain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: domain });
  } catch (error) {
    console.error('Failed to fetch hosting domain:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hosting domain' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = UpdateHostingDomainSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const domain = await updateHostingDomain(id, validation.data);
    return NextResponse.json({ success: true, data: domain });
  } catch (error) {
    console.error('Failed to update hosting domain:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update hosting domain' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    await deleteHostingDomain(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete hosting domain:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete hosting domain' },
      { status: 500 }
    );
  }
}
