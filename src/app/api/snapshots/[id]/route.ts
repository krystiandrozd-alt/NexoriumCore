// TelEnvIQ - Single Snapshot API
// GET /api/snapshots/[id] - Get snapshot details
// DELETE /api/snapshots/[id] - Delete snapshot

import { NextRequest, NextResponse } from 'next/server';
import { getSnapshot, deleteSnapshot } from '@/lib/services/snapshot';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const snapshot = await getSnapshot(id);

    if (!snapshot) {
      return NextResponse.json(
        { success: false, error: 'Snapshot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: snapshot });
  } catch (error) {
    console.error('Failed to fetch snapshot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch snapshot' },
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
    await deleteSnapshot(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete snapshot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete snapshot' },
      { status: 500 }
    );
  }
}
