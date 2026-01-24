// TelEnvIQ - Governance Rule Detail API
// GET /api/governance/rules/[id] - Get rule by ID
// PUT /api/governance/rules/[id] - Update rule
// DELETE /api/governance/rules/[id] - Delete rule

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { GovernanceRuleSeverity, Prisma } from '@prisma/client';

const UpdateRuleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  severity: z.nativeEnum(GovernanceRuleSeverity).optional(),
  isActive: z.boolean().optional(),
  configJson: z.any().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rule = await prisma.governanceRule.findUnique({
      where: { id },
      include: {
        evaluations: {
          take: 20,
          orderBy: { evaluatedAt: 'desc' },
          include: {
            snapshot: {
              select: {
                id: true,
                environment: { select: { id: true, name: true, type: true } },
              },
            },
          },
        },
      },
    });

    if (!rule) {
      return NextResponse.json(
        { success: false, error: 'Governance rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    console.error('Failed to fetch governance rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch governance rule' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = UpdateRuleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { configJson, ...rest } = validation.data;

    const updateData: Prisma.GovernanceRuleUpdateInput = {
      ...rest,
    };

    if (configJson !== undefined) {
      updateData.configJson = configJson as Prisma.InputJsonValue;
    }

    const rule = await prisma.governanceRule.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    console.error('Failed to update governance rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update governance rule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete evaluations first
    await prisma.ruleEvaluation.deleteMany({ where: { ruleId: id } });
    await prisma.governanceRule.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete governance rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete governance rule' },
      { status: 500 }
    );
  }
}
