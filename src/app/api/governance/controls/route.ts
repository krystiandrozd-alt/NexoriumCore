// Nexorium Core - Policy Controls API
// GET /api/governance/controls - List all policy controls
// POST /api/governance/controls - Create a new policy control

import { NextRequest, NextResponse } from 'next/server';
import {
  listPolicyControls,
  createPolicyControl,
} from '@/lib/services/governance/compliance';
import { PolicyControlCategory } from '@prisma/client';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

export async function GET(request: NextRequest) {
  const auth = await requirePermission(Permission.VIEW_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as PolicyControlCategory | null;
    const isActive = searchParams.get('isActive');

    const controls = await listPolicyControls({
      category: category || undefined,
      isActive: isActive === null ? undefined : isActive === 'true',
    });

    return NextResponse.json({ success: true, data: controls });
  } catch (error) {
    console.error('Error listing policy controls:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list policy controls' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(Permission.MANAGE_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.category || !body.evaluatorType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, category, evaluatorType' },
        { status: 400 }
      );
    }

    const control = await createPolicyControl({
      name: body.name,
      description: body.description,
      category: body.category,
      scope: body.scope || 'GLOBAL',
      scopeId: body.scopeId,
      severity: body.severity || 'WARNING',
      isActive: body.isActive ?? true,
      configJson: body.configJson || {},
      evaluatorType: body.evaluatorType,
      remediation: body.remediation,
      createdBy: body.createdBy,
    });

    return NextResponse.json({ success: true, data: control }, { status: 201 });
  } catch (error) {
    console.error('Error creating policy control:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create policy control' },
      { status: 500 }
    );
  }
}
