// TelEnvIQ - Cost Items API
// GET /api/cost-models/[id]/items - List cost items for a model
// POST /api/cost-models/[id]/items - Create new cost item

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCostItems, createCostItem, updateCostItem, deleteCostItem } from '@/lib/services/cost-engine';

const CreateCostItemSchema = z.object({
  itemType: z.enum(['HOST', 'COMPONENT_LICENSE', 'SHARED_PLATFORM', 'OTHER']),
  name: z.string().min(1).max(255),
  unitCost: z.number().min(0),
  unit: z.enum(['PER_ENV', 'PER_HOST', 'PER_COMPONENT', 'PER_GB', 'PER_USER', 'OTHER']),
  defaultQuantity: z.number().min(0).default(1),
  allocationMethod: z.enum(['DIRECT', 'SHARED_PRORATED']).default('DIRECT'),
  tagsJson: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const costItems = await getCostItems(id);
    return NextResponse.json({ success: true, data: costItems });
  } catch (error) {
    console.error('Failed to fetch cost items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cost items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validation = CreateCostItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const costItem = await createCostItem({
      costModelId: id,
      ...validation.data,
    });
    return NextResponse.json({ success: true, data: costItem }, { status: 201 });
  } catch (error) {
    console.error('Failed to create cost item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create cost item' },
      { status: 500 }
    );
  }
}

// PUT and DELETE for individual items
const UpdateCostItemSchema = z.object({
  itemId: z.string().uuid(),
  itemType: z.enum(['HOST', 'COMPONENT_LICENSE', 'SHARED_PLATFORM', 'OTHER']).optional(),
  name: z.string().min(1).max(255).optional(),
  unitCost: z.number().min(0).optional(),
  unit: z.enum(['PER_ENV', 'PER_HOST', 'PER_COMPONENT', 'PER_GB', 'PER_USER', 'OTHER']).optional(),
  defaultQuantity: z.number().min(0).optional(),
  allocationMethod: z.enum(['DIRECT', 'SHARED_PRORATED']).optional(),
  tagsJson: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = UpdateCostItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { itemId, ...data } = validation.data;
    const costItem = await updateCostItem(itemId, data);
    return NextResponse.json({ success: true, data: costItem });
  } catch (error) {
    console.error('Failed to update cost item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cost item' },
      { status: 500 }
    );
  }
}

const DeleteCostItemSchema = z.object({
  itemId: z.string().uuid(),
});

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'itemId is required' },
        { status: 400 }
      );
    }

    await deleteCostItem(itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete cost item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete cost item' },
      { status: 500 }
    );
  }
}
