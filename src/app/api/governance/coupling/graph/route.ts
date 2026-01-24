// TelEnvIQ - Coupling Graph API
// GET /api/governance/coupling/graph - Get coupling graph data for visualization

import { NextResponse } from 'next/server';
import { getCouplingGraphData } from '@/lib/services/governance/coupling';

export async function GET() {
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
