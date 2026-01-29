// Nexorium Core - Environment Statistics API
// GET /api/environments/[id]/stats - Get environment statistics

import { NextRequest, NextResponse } from 'next/server';
import { getEnvironmentStats, getEnvironmentOwners } from '@/lib/services/environment';
import { getDataFreshnessSummary } from '@/lib/services/testdata';
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

    const [stats, owners, dataFreshness] = await Promise.all([
      getEnvironmentStats(id),
      getEnvironmentOwners(id),
      getDataFreshnessSummary(id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        owners,
        dataFreshness,
      },
    });
  } catch (error) {
    console.error('Failed to fetch environment stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch environment statistics' },
      { status: 500 }
    );
  }
}
