// Nexorium Core - Blueprint Detail API
// GET /api/governance/blueprints/[id] - Get blueprint by ID
// PUT /api/governance/blueprints/[id] - Update blueprint
// DELETE /api/governance/blueprints/[id] - Delete blueprint

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { BlueprintStatus, Prisma } from '@prisma/client';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const UpdateBlueprintSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(BlueprintStatus).optional(),
  specJson: z.any().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const blueprint = await prisma.blueprint.findUnique({
      where: { id },
      include: {
        alignmentComparisons: {
          take: 10,
          orderBy: { comparedAt: 'desc' },
        },
      },
    });

    if (!blueprint) {
      return NextResponse.json(
        { success: false, error: 'Blueprint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: blueprint });
  } catch (error) {
    console.error('Failed to fetch blueprint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blueprint' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.MANAGE_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = UpdateBlueprintSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { specJson, status, ...rest } = validation.data;

    // If approving, deprecate other approved blueprints for same stage
    if (status === BlueprintStatus.APPROVED) {
      const blueprint = await prisma.blueprint.findUnique({
        where: { id },
        select: { targetStageId: true },
      });

      if (blueprint?.targetStageId) {
        await prisma.blueprint.updateMany({
          where: {
            targetStageId: blueprint.targetStageId,
            status: BlueprintStatus.APPROVED,
            id: { not: id },
          },
          data: { status: BlueprintStatus.DEPRECATED },
        });
      }
    }

    const updateData: Prisma.BlueprintUpdateInput = {
      ...rest,
      ...(status && { status }),
    };

    if (specJson !== undefined) {
      updateData.specJson = specJson as Prisma.InputJsonValue;
    }

    const updated = await prisma.blueprint.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Failed to update blueprint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blueprint' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.MANAGE_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    // Check if blueprint is approved
    const blueprint = await prisma.blueprint.findUnique({
      where: { id },
      select: { status: true },
    });

    if (blueprint?.status === BlueprintStatus.APPROVED) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete approved blueprint. Deprecate it first.' },
        { status: 400 }
      );
    }

    await prisma.blueprint.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete blueprint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blueprint' },
      { status: 500 }
    );
  }
}
