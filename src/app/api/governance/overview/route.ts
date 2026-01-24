// TelEnvIQ - Governance Overview API
// GET /api/governance/overview - Get governance dashboard metrics

import { NextResponse } from 'next/server';
import { getGovernanceOverview } from '@/lib/services/governance/compliance';
import { getCouplingAnalysis } from '@/lib/services/governance/coupling';
import { getExceptionStats } from '@/lib/services/governance/exceptions';
import { getApprovalStats } from '@/lib/services/governance/approvals';

export async function GET() {
  try {
    const [overview, couplingAnalysis, exceptionStats, approvalStats] = await Promise.all([
      getGovernanceOverview(),
      getCouplingAnalysis(),
      getExceptionStats(),
      getApprovalStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...overview,
        coupling: couplingAnalysis,
        exceptions: exceptionStats,
        approvals: approvalStats,
      },
    });
  } catch (error) {
    console.error('Error getting governance overview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get governance overview' },
      { status: 500 }
    );
  }
}
