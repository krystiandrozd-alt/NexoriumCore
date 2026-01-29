// Nexorium Core - Coupling Detection API
// POST /api/governance/coupling/detect - Run coupling detection

import { NextRequest, NextResponse } from 'next/server';
import {
  detectCouplings,
  detectAllCouplings,
} from '@/lib/services/governance/coupling';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

export async function POST(request: NextRequest) {
  const auth = await requirePermission(Permission.MANAGE_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { sourceEnvironmentId, targetEnvironmentId, detectedBy } = body;

    if (sourceEnvironmentId && targetEnvironmentId) {
      // Detect between two specific environments
      const couplings = await detectCouplings(
        sourceEnvironmentId,
        targetEnvironmentId,
        detectedBy
      );

      return NextResponse.json({
        success: true,
        data: {
          detected: couplings.length,
          couplings,
        },
      });
    } else {
      // Detect across all environments
      const result = await detectAllCouplings(detectedBy);

      return NextResponse.json({
        success: true,
        data: result,
      });
    }
  } catch (error) {
    console.error('Error detecting couplings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to detect couplings' },
      { status: 500 }
    );
  }
}
