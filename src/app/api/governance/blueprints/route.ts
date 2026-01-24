// TelEnvIQ - Blueprints API
// GET /api/governance/blueprints - List all blueprints
// POST /api/governance/blueprints - Create new blueprint

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { BlueprintStatus, Prisma } from '@prisma/client';

const CreateBlueprintSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  targetStageId: z.string().uuid().optional(),
  specJson: z.any(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetStageId = searchParams.get('targetStageId');
    const status = searchParams.get('status') as BlueprintStatus | null;

    const blueprints = await prisma.blueprint.findMany({
      where: {
        ...(targetStageId && { targetStageId }),
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: blueprints });
  } catch (error) {
    console.error('Failed to fetch blueprints:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blueprints' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CreateBlueprintSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { specJson, ...rest } = validation.data;

    const blueprint = await prisma.blueprint.create({
      data: {
        ...rest,
        specJson: specJson as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ success: true, data: blueprint }, { status: 201 });
  } catch (error) {
    console.error('Failed to create blueprint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blueprint' },
      { status: 500 }
    );
  }
}
