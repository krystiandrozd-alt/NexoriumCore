// Nexorium Core - Stages API
// GET /api/stages - List all stages
// POST /api/stages - Create new stage

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

const CreateStageSchema = z.object({
  key: z.enum(['DEV', 'SIT', 'UAT', 'NFT', 'PREPROD', 'PROD_RO']),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0),
  color: z.string().optional(),
});

export async function GET() {
  try {
    const stages = await prisma.stage.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { environments: true },
        },
      },
    });
    return NextResponse.json({ success: true, data: stages });
  } catch (error) {
    console.error('Failed to fetch stages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CreateStageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const stage = await prisma.stage.create({
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: stage }, { status: 201 });
  } catch (error) {
    console.error('Failed to create stage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create stage' },
      { status: 500 }
    );
  }
}
