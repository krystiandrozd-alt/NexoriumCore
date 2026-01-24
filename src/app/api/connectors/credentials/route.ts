// TelEnvIQ - Connector Credentials API
// GET /api/connectors/credentials - List credentials
// POST /api/connectors/credentials - Create credential

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { listCredentials, createCredential } from '@/lib/services/security/credentials';

const CreateCredentialSchema = z.object({
  name: z.string().min(1).max(255),
  connectorType: z.string().min(1),
  config: z.record(z.string(), z.unknown()),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const connectorType = searchParams.get('connectorType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await listCredentials({
      connectorType: connectorType || undefined,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to fetch credentials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch credentials' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CreateCredentialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const createdBy = request.headers.get('x-user-name');
    const credential = await createCredential({
      ...validation.data,
      createdBy: createdBy || undefined,
    });

    // Don't return encrypted config - destructure to exclude sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { encryptedConfig, encryptionIv, ...safeCredential } = credential;

    return NextResponse.json({ success: true, data: safeCredential }, { status: 201 });
  } catch (error) {
    console.error('Failed to create credential:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create credential' },
      { status: 500 }
    );
  }
}
