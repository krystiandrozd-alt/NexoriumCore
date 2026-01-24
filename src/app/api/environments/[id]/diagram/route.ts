// TelEnvIQ - Environment Diagram Layout API
// Save and load graph layout positions per environment

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Load saved diagram layout
export async function GET(request: Request, context: RouteParams) {
  try {
    const { id: environmentId } = await context.params;

    const diagram = await prisma.environmentDiagram.findUnique({
      where: { environmentId },
    });

    if (!diagram) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No saved diagram found',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        nodes: diagram.nodesJson,
        edges: diagram.edgesJson,
        updatedAt: diagram.updatedAt,
        updatedBy: diagram.updatedBy,
      },
    });
  } catch (error) {
    console.error('Error loading diagram:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load diagram',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Save diagram layout (full replace)
export async function PUT(request: Request, context: RouteParams) {
  try {
    const { id: environmentId } = await context.params;
    const body = await request.json();

    const { nodes, edges, updatedBy } = body;

    if (!nodes || !edges) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: nodes and edges',
        },
        { status: 400 }
      );
    }

    // Verify environment exists
    const environment = await prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      return NextResponse.json(
        { success: false, error: 'Environment not found' },
        { status: 404 }
      );
    }

    // Upsert diagram
    const diagram = await prisma.environmentDiagram.upsert({
      where: { environmentId },
      create: {
        environmentId,
        nodesJson: nodes,
        edgesJson: edges,
        updatedBy,
      },
      update: {
        nodesJson: nodes,
        edgesJson: edges,
        updatedBy,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: diagram.id,
        updatedAt: diagram.updatedAt,
      },
      message: 'Diagram saved successfully',
    });
  } catch (error) {
    console.error('Error saving diagram:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save diagram',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (just positions)
export async function PATCH(request: Request, context: RouteParams) {
  try {
    const { id: environmentId } = await context.params;
    const body = await request.json();

    const { nodes, updatedBy } = body;

    if (!nodes) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: nodes' },
        { status: 400 }
      );
    }

    // Get existing diagram
    const existing = await prisma.environmentDiagram.findUnique({
      where: { environmentId },
    });

    if (!existing) {
      // Create new if doesn't exist
      const diagram = await prisma.environmentDiagram.create({
        data: {
          environmentId,
          nodesJson: nodes,
          edgesJson: [],
          updatedBy,
        },
      });

      return NextResponse.json({
        success: true,
        data: { id: diagram.id, updatedAt: diagram.updatedAt },
      });
    }

    // Update only nodes (positions)
    const diagram = await prisma.environmentDiagram.update({
      where: { environmentId },
      data: {
        nodesJson: nodes,
        updatedBy,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: diagram.id,
        updatedAt: diagram.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating diagram:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update diagram',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Reset diagram layout
export async function DELETE(request: Request, context: RouteParams) {
  try {
    const { id: environmentId } = await context.params;

    const existing = await prisma.environmentDiagram.findUnique({
      where: { environmentId },
    });

    if (!existing) {
      return NextResponse.json({
        success: true,
        message: 'No diagram to delete',
      });
    }

    await prisma.environmentDiagram.delete({
      where: { environmentId },
    });

    return NextResponse.json({
      success: true,
      message: 'Diagram layout reset',
    });
  } catch (error) {
    console.error('Error deleting diagram:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete diagram',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
