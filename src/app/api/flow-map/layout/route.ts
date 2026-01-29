// Nexorium Core - Flow Map Layout Persistence API
// Save and retrieve flow map node positions

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { FlowMapV2Layout, FlowMapV2LayoutPosition, FlowMapV2Viewport } from '@/types/flow-map-v2';
import type { Prisma } from '@prisma/client';

// GET - Retrieve saved layouts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const layoutId = searchParams.get('id');

    if (layoutId) {
      // Get specific layout
      const layout = await prisma.flowMapLayout.findUnique({
        where: { id: layoutId },
      });

      if (!layout) {
        return NextResponse.json(
          { error: 'Layout not found' },
          { status: 404 }
        );
      }

      // Parse nodesJson which may contain positions and viewport
      const nodesData = layout.nodesJson as unknown as { positions?: Record<string, FlowMapV2LayoutPosition>; viewport?: FlowMapV2Viewport } | Record<string, FlowMapV2LayoutPosition>;
      const hasNestedStructure = nodesData && 'positions' in nodesData;

      const result: FlowMapV2Layout = {
        id: layout.id,
        name: layout.name,
        positions: hasNestedStructure ? (nodesData as { positions: Record<string, FlowMapV2LayoutPosition> }).positions : nodesData as Record<string, FlowMapV2LayoutPosition>,
        viewport: hasNestedStructure ? (nodesData as { viewport?: FlowMapV2Viewport }).viewport : undefined,
        isDefault: layout.isDefault,
        updatedAt: layout.updatedAt,
        updatedBy: layout.updatedBy ?? undefined,
      };

      return NextResponse.json(result);
    }

    // Get all pipeline-level layouts (environmentId is null)
    const layouts = await prisma.flowMapLayout.findMany({
      where: { environmentId: null },
      orderBy: [
        { isDefault: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    const result: FlowMapV2Layout[] = layouts.map((layout) => {
      const nodesData = layout.nodesJson as unknown as { positions?: Record<string, FlowMapV2LayoutPosition>; viewport?: FlowMapV2Viewport } | Record<string, FlowMapV2LayoutPosition>;
      const hasNestedStructure = nodesData && 'positions' in nodesData;

      return {
        id: layout.id,
        name: layout.name,
        positions: hasNestedStructure ? (nodesData as { positions: Record<string, FlowMapV2LayoutPosition> }).positions : nodesData as Record<string, FlowMapV2LayoutPosition>,
        viewport: hasNestedStructure ? (nodesData as { viewport?: FlowMapV2Viewport }).viewport : undefined,
        isDefault: layout.isDefault,
        updatedAt: layout.updatedAt,
        updatedBy: layout.updatedBy ?? undefined,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching layouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch layouts' },
      { status: 500 }
    );
  }
}

// POST - Create new layout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, positions, viewport, isDefault } = body as {
      name: string;
      positions: Record<string, FlowMapV2LayoutPosition>;
      viewport?: FlowMapV2Viewport;
      isDefault?: boolean;
    };

    if (!name || !positions) {
      return NextResponse.json(
        { error: 'Name and positions are required' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults (for pipeline-level layouts only)
    if (isDefault) {
      await prisma.flowMapLayout.updateMany({
        where: { isDefault: true, environmentId: null },
        data: { isDefault: false },
      });
    }

    // Store positions and viewport together in nodesJson
    const nodesJsonData = viewport
      ? { positions, viewport }
      : { positions };

    const layout = await prisma.flowMapLayout.create({
      data: {
        name,
        nodesJson: nodesJsonData as unknown as Prisma.InputJsonValue,
        isDefault: isDefault ?? false,
        environmentId: null, // Pipeline-level layout
      },
    });

    const result: FlowMapV2Layout = {
      id: layout.id,
      name: layout.name,
      positions,
      viewport,
      isDefault: layout.isDefault,
      updatedAt: layout.updatedAt,
      updatedBy: layout.updatedBy ?? undefined,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating layout:', error);
    return NextResponse.json(
      { error: 'Failed to create layout' },
      { status: 500 }
    );
  }
}

// PUT - Update existing layout
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, positions, viewport, isDefault } = body as {
      id: string;
      name?: string;
      positions?: Record<string, FlowMapV2LayoutPosition>;
      viewport?: FlowMapV2Viewport;
      isDefault?: boolean;
    };

    if (!id) {
      return NextResponse.json(
        { error: 'Layout ID is required' },
        { status: 400 }
      );
    }

    // Check if layout exists
    const existing = await prisma.flowMapLayout.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.flowMapLayout.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    // Build update data
    const updateData: Prisma.FlowMapLayoutUpdateInput = {};
    if (name) updateData.name = name;
    if (positions || viewport) {
      // Merge positions and viewport into nodesJson
      const nodesJsonData: { positions?: Record<string, FlowMapV2LayoutPosition>; viewport?: FlowMapV2Viewport } = {};
      if (positions) nodesJsonData.positions = positions;
      if (viewport) nodesJsonData.viewport = viewport;
      updateData.nodesJson = nodesJsonData as unknown as Prisma.InputJsonValue;
    }
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const layout = await prisma.flowMapLayout.update({
      where: { id },
      data: updateData,
    });

    // Parse the stored data
    const nodesData = layout.nodesJson as unknown as { positions?: Record<string, FlowMapV2LayoutPosition>; viewport?: FlowMapV2Viewport } | Record<string, FlowMapV2LayoutPosition>;
    const hasNestedStructure = nodesData && 'positions' in nodesData;

    const result: FlowMapV2Layout = {
      id: layout.id,
      name: layout.name,
      positions: hasNestedStructure ? (nodesData as { positions: Record<string, FlowMapV2LayoutPosition> }).positions : nodesData as Record<string, FlowMapV2LayoutPosition>,
      viewport: hasNestedStructure ? (nodesData as { viewport?: FlowMapV2Viewport }).viewport : undefined,
      isDefault: layout.isDefault,
      updatedAt: layout.updatedAt,
      updatedBy: layout.updatedBy ?? undefined,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating layout:', error);
    return NextResponse.json(
      { error: 'Failed to update layout' },
      { status: 500 }
    );
  }
}

// DELETE - Delete layout
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Layout ID is required' },
        { status: 400 }
      );
    }

    await prisma.flowMapLayout.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting layout:', error);
    return NextResponse.json(
      { error: 'Failed to delete layout' },
      { status: 500 }
    );
  }
}
