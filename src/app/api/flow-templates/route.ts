// TelEnvIQ - Flow Templates API
// GET /api/flow-templates - List all flow templates
// POST /api/flow-templates - Create new flow template

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

const CreateFlowTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  stageIds: z.array(z.string().uuid()).min(1),
});

export async function GET() {
  try {
    const templates = await prisma.flowTemplate.findMany({
      include: {
        stages: {
          include: {
            stage: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    console.error('Failed to fetch flow templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flow templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CreateFlowTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { stageIds, ...templateData } = validation.data;

    // If setting as default, unset other defaults
    if (templateData.isDefault) {
      await prisma.flowTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.flowTemplate.create({
      data: {
        ...templateData,
        stages: {
          create: stageIds.map((stageId, index) => ({
            stageId,
            sortOrder: index,
          })),
        },
      },
      include: {
        stages: {
          include: { stage: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error) {
    console.error('Failed to create flow template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create flow template' },
      { status: 500 }
    );
  }
}
