// Nexorium Core - Expiring Exceptions API
// GET /api/governance/exceptions/expiring - Get expiring exceptions

import { NextRequest, NextResponse } from 'next/server';
import { getExpiringExceptions } from '@/lib/services/governance/exceptions';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

export async function GET(request: NextRequest) {
  const auth = await requirePermission(Permission.VIEW_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const exceptions = await getExpiringExceptions(days);

    return NextResponse.json({
      success: true,
      data: {
        items: exceptions,
        total: exceptions.length,
      },
    });
  } catch (error) {
    console.error('Error getting expiring exceptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get expiring exceptions' },
      { status: 500 }
    );
  }
}
