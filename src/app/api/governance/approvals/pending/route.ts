// Nexorium Core - Pending Approvals API
// GET /api/governance/approvals/pending - Get pending approvals

import { NextRequest, NextResponse } from 'next/server';
import {
  getPendingApprovals,
  getApprovalStats,
} from '@/lib/services/governance/approvals';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

export async function GET(request: NextRequest) {
  const auth = await requirePermission(Permission.VIEW_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const assigneeId = searchParams.get('assigneeId');
    const includeStats = searchParams.get('includeStats') === 'true';

    const approvals = await getPendingApprovals(assigneeId || undefined);

    let stats;
    if (includeStats) {
      stats = await getApprovalStats(assigneeId || undefined);
    }

    return NextResponse.json({
      success: true,
      data: {
        items: approvals,
        total: approvals.length,
        ...(stats ? { stats } : {}),
      },
    });
  } catch (error) {
    console.error('Error getting pending approvals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get pending approvals' },
      { status: 500 }
    );
  }
}
