// Nexorium Core - Coupling Graph API
// GET /api/governance/coupling/graph - Get coupling graph data for visualization

import { NextResponse } from 'next/server';
import { getCouplingGraphData } from '@/lib/services/governance/coupling';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

export async function GET() {
  const auth = await requirePermission(Permission.VIEW_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const graphData = await getCouplingGraphData();

    return NextResponse.json({ success: true, data: graphData });
  } catch (error) {
    console.error('Error getting coupling graph:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get coupling graph' },
      { status: 500 }
    );
  }
}
