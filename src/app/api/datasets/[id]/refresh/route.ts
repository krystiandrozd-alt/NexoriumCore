// TelEnvIQ - Test Data Refresh API
// GET /api/datasets/[id]/refresh - Get refresh history
// POST /api/datasets/[id]/refresh - Record new refresh

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { recordRefresh, getRefreshHistory } from '@/lib/services/testdata';

const RecordRefreshSchema = z.object({
  refreshDate: z.string().datetime().optional(),
  refreshedBy: z.string().optional(),
  method: z.enum(['MANUAL', 'PIPELINE', 'SCRIPT', 'AUTOMATED']),
  notes: z.string().optional(),
  changeReference: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const history = await getRefreshHistory(id);
    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error('Failed to fetch refresh history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch refresh history' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = RecordRefreshSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const refreshRecord = await recordRefresh({
      testDataSetId: id,
      refreshDate: validation.data.refreshDate
        ? new Date(validation.data.refreshDate)
        : new Date(),
      refreshedBy: validation.data.refreshedBy,
      method: validation.data.method,
      notes: validation.data.notes,
      changeReference: validation.data.changeReference,
    });

    return NextResponse.json({ success: true, data: refreshRecord }, { status: 201 });
  } catch (error) {
    console.error('Failed to record refresh:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record refresh' },
      { status: 500 }
    );
  }
}
