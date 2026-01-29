// Nexorium Core - Compliance Results API
// GET /api/governance/compliance - Get compliance results

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

export async function GET(request: NextRequest) {
  const auth = await requirePermission(Permission.VIEW_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const environmentId = searchParams.get('environmentId');
    const policyControlId = searchParams.get('policyControlId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = {
      ...(environmentId ? { environmentId } : {}),
      ...(policyControlId ? { policyControlId } : {}),
    };

    const [results, total] = await Promise.all([
      prisma.complianceResult.findMany({
        where,
        include: {
          policyControl: true,
        },
        orderBy: { evaluatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.complianceResult.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { items: results, total },
    });
  } catch (error) {
    console.error('Error getting compliance results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get compliance results' },
      { status: 500 }
    );
  }
}
