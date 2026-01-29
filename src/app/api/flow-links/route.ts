// Nexorium Core - Flow Links API
// GET /api/flow-links - List all environment links
// POST /api/flow-links - Create new environment link

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { EnvironmentLinkType } from '@prisma/client';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const CreateFlowLinkSchema = z.object({
  upstreamEnvironmentId: z.string().uuid(),
  downstreamEnvironmentId: z.string().uuid(),
  linkType: z.nativeEnum(EnvironmentLinkType).default(EnvironmentLinkType.PROMOTION),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

export async function GET() {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const links = await prisma.environmentLink.findMany({
      include: {
        upstreamEnvironment: {
          select: { id: true, name: true, type: true },
        },
        downstreamEnvironment: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: links });
  } catch (error) {
    console.error('Failed to fetch flow links:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flow links' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const validation = CreateFlowLinkSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Prevent self-links
    if (validation.data.upstreamEnvironmentId === validation.data.downstreamEnvironmentId) {
      return NextResponse.json(
        { success: false, error: 'Cannot create link from environment to itself' },
        { status: 400 }
      );
    }

    const link = await prisma.environmentLink.create({
      data: validation.data,
      include: {
        upstreamEnvironment: { select: { id: true, name: true, type: true } },
        downstreamEnvironment: { select: { id: true, name: true, type: true } },
      },
    });

    return NextResponse.json({ success: true, data: link }, { status: 201 });
  } catch (error) {
    console.error('Failed to create flow link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create flow link' },
      { status: 500 }
    );
  }
}
