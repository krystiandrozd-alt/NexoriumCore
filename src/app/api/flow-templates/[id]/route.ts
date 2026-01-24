// TelEnvIQ - Flow Template Detail API
// GET /api/flow-templates/[id] - Get flow template by ID
// PUT /api/flow-templates/[id] - Update flow template
// DELETE /api/flow-templates/[id] - Delete flow template

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { FlowTemplateStatus } from '@prisma/client';

const UpdateFlowTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(FlowTemplateStatus).optional(),
  isDefault: z.boolean().optional(),
  stageIds: z.array(z.string().uuid()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await prisma.flowTemplate.findUnique({
      where: { id },
      include: {
        stages: {
          include: { stage: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Flow template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    console.error('Failed to fetch flow template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flow template' },
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
    const validation = UpdateFlowTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { stageIds, isDefault, ...updateData } = validation.data;

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.flowTemplate.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    // Update stages if provided
    if (stageIds) {
      await prisma.flowTemplateStage.deleteMany({
        where: { flowTemplateId: id },
      });
      await prisma.flowTemplateStage.createMany({
        data: stageIds.map((stageId, index) => ({
          flowTemplateId: id,
          stageId,
          sortOrder: index,
        })),
      });
    }

    const template = await prisma.flowTemplate.update({
      where: { id },
      data: {
        ...updateData,
        ...(isDefault !== undefined && { isDefault }),
      },
      include: {
        stages: {
          include: { stage: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    console.error('Failed to update flow template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update flow template' },
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

    // Delete stage associations first
    await prisma.flowTemplateStage.deleteMany({
      where: { flowTemplateId: id },
    });

    await prisma.flowTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete flow template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete flow template' },
      { status: 500 }
    );
  }
}
