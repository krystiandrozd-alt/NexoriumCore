// TelEnvIQ - Connector Credential API
// GET /api/connectors/credentials/[id] - Get credential
// PUT /api/connectors/credentials/[id] - Update credential
// DELETE /api/connectors/credentials/[id] - Delete credential

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCredential, updateCredential, deleteCredential } from '@/lib/services/security/credentials';

const UpdateCredentialSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  rotationReminder: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const credential = await getCredential(id);

    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'Credential not found' },
        { status: 404 }
      );
    }

    // Don't return encrypted config - destructure to exclude sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { encryptedConfig, encryptionIv, ...safeCredential } = credential;

    return NextResponse.json({ success: true, data: safeCredential });
  } catch (error) {
    console.error('Failed to fetch credential:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch credential' },
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
    const validation = UpdateCredentialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const credential = await updateCredential(id, validation.data);

    // Don't return encrypted config - destructure to exclude sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { encryptedConfig, encryptionIv, ...safeCredential } = credential;

    return NextResponse.json({ success: true, data: safeCredential });
  } catch (error) {
    console.error('Failed to update credential:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update credential' },
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
    await deleteCredential(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete credential:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete credential' },
      { status: 500 }
    );
  }
}
