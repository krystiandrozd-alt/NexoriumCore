// Nexorium Core - Coupling Links API
// GET /api/governance/coupling - List coupling links

import { NextRequest, NextResponse } from 'next/server';
import { listCouplings } from '@/lib/services/governance/coupling';
import { CouplingStatus } from '@prisma/client';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

export async function GET(request: NextRequest) {
  const auth = await requirePermission(Permission.VIEW_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as CouplingStatus | null;
    const sourceEnvironmentId = searchParams.get('sourceEnvironmentId');
    const targetEnvironmentId = searchParams.get('targetEnvironmentId');
    const minRiskLevel = searchParams.get('minRiskLevel');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await listCouplings({
      status: status || undefined,
      sourceEnvironmentId: sourceEnvironmentId || undefined,
      targetEnvironmentId: targetEnvironmentId || undefined,
      minRiskLevel: minRiskLevel ? parseInt(minRiskLevel) : undefined,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing couplings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list couplings' },
      { status: 500 }
    );
  }
}
