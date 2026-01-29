// Nexorium Core - Environment Layout Persistence API
// Save and retrieve environment-specific flow map node positions (Level 1)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { Prisma } from '@prisma/client';

interface LayoutPosition {
  x: number;
  y: number;
}

interface EnvironmentLayout {
  id: string;
  name: string;
  environmentId: string;
  positions: Record<string, LayoutPosition>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// GET - Retrieve saved layouts for an environment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: environmentId } = await params;
    const { searchParams } = new URL(request.url);
    const layoutId = searchParams.get('layoutId');

    // Check if environment exists
    const environment = await prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      return NextResponse.json(
        { error: 'Environment not found' },
        { status: 404 }
      );
    }

    if (layoutId) {
      // Get specific layout
      const layout = await prisma.flowMapLayout.findFirst({
        where: { id: layoutId, environmentId },
      });

      if (!layout) {
        return NextResponse.json(
          { error: 'Layout not found' },
          { status: 404 }
        );
      }

      const result: EnvironmentLayout = {
        id: layout.id,
        name: layout.name,
        environmentId: layout.environmentId!,
        positions: layout.nodesJson as unknown as Record<string, LayoutPosition>,
        isDefault: layout.isDefault,
        createdAt: layout.createdAt,
        updatedAt: layout.updatedAt,
      };

      return NextResponse.json(result);
    }

    // Get all layouts for this environment
    const layouts = await prisma.flowMapLayout.findMany({
      where: { environmentId },
      orderBy: [
        { isDefault: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    const result: EnvironmentLayout[] = layouts.map((layout) => ({
      id: layout.id,
      name: layout.name,
      environmentId: layout.environmentId!,
      positions: layout.nodesJson as unknown as Record<string, LayoutPosition>,
      isDefault: layout.isDefault,
      createdAt: layout.createdAt,
      updatedAt: layout.updatedAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching environment layouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch layouts' },
      { status: 500 }
    );
  }
}

// POST - Create new layout for an environment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: environmentId } = await params;
    const body = await request.json();
    const { name, positions, isDefault } = body as {
      name: string;
      positions: Record<string, LayoutPosition>;
      isDefault?: boolean;
    };

    // Check if environment exists
    const environment = await prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      return NextResponse.json(
        { error: 'Environment not found' },
        { status: 404 }
      );
    }

    if (!name || !positions) {
      return NextResponse.json(
        { error: 'Name and positions are required' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults for this environment
    if (isDefault) {
      await prisma.flowMapLayout.updateMany({
        where: { environmentId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const layout = await prisma.flowMapLayout.create({
      data: {
        name,
        nodesJson: positions as unknown as Prisma.InputJsonValue,
        isDefault: isDefault ?? false,
        environmentId,
      },
    });

    const result: EnvironmentLayout = {
      id: layout.id,
      name: layout.name,
      environmentId: layout.environmentId!,
      positions: layout.nodesJson as unknown as Record<string, LayoutPosition>,
      isDefault: layout.isDefault,
      createdAt: layout.createdAt,
      updatedAt: layout.updatedAt,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating environment layout:', error);
    return NextResponse.json(
      { error: 'Failed to create layout' },
      { status: 500 }
    );
  }
}

// PUT - Update existing layout
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: environmentId } = await params;
    const body = await request.json();
    const { layoutId, name, positions, isDefault } = body as {
      layoutId: string;
      name?: string;
      positions?: Record<string, LayoutPosition>;
      isDefault?: boolean;
    };

    if (!layoutId) {
      return NextResponse.json(
        { error: 'Layout ID is required' },
        { status: 400 }
      );
    }

    // Check if layout exists and belongs to this environment
    const existing = await prisma.flowMapLayout.findFirst({
      where: { id: layoutId, environmentId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults for this environment
    if (isDefault) {
      await prisma.flowMapLayout.updateMany({
        where: { environmentId, isDefault: true, id: { not: layoutId } },
        data: { isDefault: false },
      });
    }

    // Build update data
    const updateData: Prisma.FlowMapLayoutUpdateInput = {};
    if (name) updateData.name = name;
    if (positions) updateData.nodesJson = positions as unknown as Prisma.InputJsonValue;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const layout = await prisma.flowMapLayout.update({
      where: { id: layoutId },
      data: updateData,
    });

    const result: EnvironmentLayout = {
      id: layout.id,
      name: layout.name,
      environmentId: layout.environmentId!,
      positions: layout.nodesJson as unknown as Record<string, LayoutPosition>,
      isDefault: layout.isDefault,
      createdAt: layout.createdAt,
      updatedAt: layout.updatedAt,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating environment layout:', error);
    return NextResponse.json(
      { error: 'Failed to update layout' },
      { status: 500 }
    );
  }
}

// DELETE - Delete layout
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: environmentId } = await params;
    const { searchParams } = new URL(request.url);
    const layoutId = searchParams.get('layoutId');

    if (!layoutId) {
      return NextResponse.json(
        { error: 'Layout ID is required' },
        { status: 400 }
      );
    }

    // Check if layout exists and belongs to this environment
    const existing = await prisma.flowMapLayout.findFirst({
      where: { id: layoutId, environmentId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }

    await prisma.flowMapLayout.delete({
      where: { id: layoutId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting environment layout:', error);
    return NextResponse.json(
      { error: 'Failed to delete layout' },
      { status: 500 }
    );
  }
}
