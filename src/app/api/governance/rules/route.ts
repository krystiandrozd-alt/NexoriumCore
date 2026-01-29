// Nexorium Core - Governance Rules API
// GET /api/governance/rules - List all governance rules
// POST /api/governance/rules - Create new governance rule

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { GovernanceRuleType, GovernanceRuleSeverity, StageKey, Prisma } from '@prisma/client';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const CreateRuleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  ruleType: z.nativeEnum(GovernanceRuleType),
  severity: z.nativeEnum(GovernanceRuleSeverity).default(GovernanceRuleSeverity.WARNING),
  isActive: z.boolean().default(true),
  configJson: z.any(),
  targetStages: z.array(z.nativeEnum(StageKey)).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requirePermission(Permission.VIEW_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const ruleType = searchParams.get('ruleType') as GovernanceRuleType | null;

    const rules = await prisma.governanceRule.findMany({
      where: {
        ...(isActive !== null && { isActive: isActive === 'true' }),
        ...(ruleType && { ruleType }),
      },
      include: {
        _count: {
          select: { evaluations: true },
        },
      },
      orderBy: [{ severity: 'desc' }, { name: 'asc' }],
    });
    return NextResponse.json({ success: true, data: rules });
  } catch (error) {
    console.error('Failed to fetch governance rules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch governance rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(Permission.MANAGE_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const validation = CreateRuleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { configJson, ...rest } = validation.data;

    const rule = await prisma.governanceRule.create({
      data: {
        ...rest,
        configJson: configJson as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ success: true, data: rule }, { status: 201 });
  } catch (error) {
    console.error('Failed to create governance rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create governance rule' },
      { status: 500 }
    );
  }
}
