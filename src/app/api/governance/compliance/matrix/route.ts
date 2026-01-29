// Nexorium Core - Compliance Matrix API
// GET /api/governance/compliance/matrix - Get compliance matrix data

import { NextResponse } from 'next/server';
import { getComplianceMatrix } from '@/lib/services/governance/compliance';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

export async function GET() {
  const auth = await requirePermission(Permission.VIEW_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const matrix = await getComplianceMatrix();

    return NextResponse.json({ success: true, data: matrix });
  } catch (error) {
    console.error('Error getting compliance matrix:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get compliance matrix' },
      { status: 500 }
    );
  }
}
