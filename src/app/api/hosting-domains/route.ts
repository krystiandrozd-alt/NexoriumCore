// Nexorium Core - Hosting Domains API
// GET /api/hosting-domains - List all hosting domains
// POST /api/hosting-domains - Create new hosting domain

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { listHostingDomains, createHostingDomain } from '@/lib/services/hosting-domain';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const CreateHostingDomainSchema = z.object({
  name: z.string().min(1).max(255),
  hostingType: z.enum(['CLOUD', 'ON_PREM', 'HYBRID', 'THIRD_PARTY', 'EDGE']),
  cloudProvider: z.enum(['AWS', 'AZURE', 'GCP', 'ORACLE_CLOUD', 'IBM_CLOUD', 'ALIBABA_CLOUD', 'PRIVATE_CLOUD', 'NONE']).optional(),
  region: z.string().optional(),
  accountId: z.string().optional(),
  dataCenter: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const searchParams = request.nextUrl.searchParams;
    const hostingType = searchParams.get('hostingType') as 'CLOUD' | 'ON_PREM' | 'HYBRID' | 'THIRD_PARTY' | 'EDGE' | null;
    const cloudProvider = searchParams.get('cloudProvider') as 'AWS' | 'AZURE' | 'GCP' | 'ORACLE_CLOUD' | 'IBM_CLOUD' | 'ALIBABA_CLOUD' | 'PRIVATE_CLOUD' | 'NONE' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await listHostingDomains({
      hostingType: hostingType || undefined,
      cloudProvider: cloudProvider || undefined,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to fetch hosting domains:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hosting domains' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const validation = CreateHostingDomainSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const domain = await createHostingDomain(validation.data);
    return NextResponse.json({ success: true, data: domain }, { status: 201 });
  } catch (error) {
    console.error('Failed to create hosting domain:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create hosting domain' },
      { status: 500 }
    );
  }
}
