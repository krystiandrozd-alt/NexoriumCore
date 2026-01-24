// TelEnvIQ - Single Test Data Set API
// GET /api/datasets/[id] - Get dataset details
// PUT /api/datasets/[id] - Update dataset
// DELETE /api/datasets/[id] - Delete dataset

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTestDataSet, updateTestDataSet, deleteTestDataSet } from '@/lib/services/testdata';

const UpdateDataSetSchema = z.object({
  sourceType: z.enum(['PROD_CLONE', 'MASKED', 'SYNTHETIC', 'STATIC']).optional(),
  refreshMethod: z.enum(['MANUAL', 'PIPELINE', 'SCRIPT', 'AUTOMATED']).optional(),
  maskingPolicyVersion: z.string().optional(),
  owner: z.string().optional(),
  downstreamConsumers: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataset = await getTestDataSet(id);

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: dataset });
  } catch (error) {
    console.error('Failed to fetch dataset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dataset' },
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
    const validation = UpdateDataSetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const dataset = await updateTestDataSet(id, validation.data);
    return NextResponse.json({ success: true, data: dataset });
  } catch (error) {
    console.error('Failed to update dataset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update dataset' },
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
    await deleteTestDataSet(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete dataset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete dataset' },
      { status: 500 }
    );
  }
}
