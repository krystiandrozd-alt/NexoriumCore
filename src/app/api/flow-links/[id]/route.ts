// Nexorium Core - Flow Link Detail API
// GET /api/flow-links/[id] - Get flow link by ID
// PUT /api/flow-links/[id] - Update flow link
// DELETE /api/flow-links/[id] - Delete flow link

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { EnvironmentLinkType } from '@prisma/client';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const UpdateFlowLinkSchema = z.object({
  linkType: z.nativeEnum(EnvironmentLinkType).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const link = await prisma.environmentLink.findUnique({
      where: { id },
      include: {
        upstreamEnvironment: { select: { id: true, name: true, type: true } },
        downstreamEnvironment: { select: { id: true, name: true, type: true } },
      },
    });

    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Flow link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: link });
  } catch (error) {
    console.error('Failed to fetch flow link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flow link' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = UpdateFlowLinkSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const link = await prisma.environmentLink.update({
      where: { id },
      data: validation.data,
      include: {
        upstreamEnvironment: { select: { id: true, name: true, type: true } },
        downstreamEnvironment: { select: { id: true, name: true, type: true } },
      },
    });

    return NextResponse.json({ success: true, data: link });
  } catch (error) {
    console.error('Failed to update flow link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update flow link' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    await prisma.environmentLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete flow link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete flow link' },
      { status: 500 }
    );
  }
}
