// TelEnvIQ - Policy Violations API
// GET /api/governance/violations - Get policy violations

import { NextRequest, NextResponse } from 'next/server';
import { getPolicyViolations, getViolationSummary, runPolicyChecks } from '@/lib/services/governance/policy';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const environmentId = searchParams.get('environmentId');
    const status = searchParams.get('status') as 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED' | null;
    const severity = searchParams.get('severity') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
    const policyName = searchParams.get('policyName');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const summary = searchParams.get('summary') === 'true';

    if (summary) {
      const summaryData = await getViolationSummary(environmentId || undefined);
      return NextResponse.json({ success: true, data: summaryData });
    }

    const result = await getPolicyViolations({
      environmentId: environmentId || undefined,
      status: status || undefined,
      severity: severity || undefined,
      policyName: policyName || undefined,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to fetch policy violations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch policy violations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const environmentId = searchParams.get('environmentId');

    // Trigger policy check run
    const result = await runPolicyChecks(environmentId || undefined);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to run policy checks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run policy checks' },
      { status: 500 }
    );
  }
}
