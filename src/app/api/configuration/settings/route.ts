// TelEnvIQ - Platform Settings API
// GET /api/configuration/settings - List all platform settings
// PUT /api/configuration/settings - Update multiple settings

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { SettingScope } from '@prisma/client';

const UpdateSettingsSchema = z.object({
  settings: z.array(
    z.object({
      id: z.string().uuid(),
      value: z.string(),
    })
  ),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') as SettingScope | null;

    const settings = await prisma.platformSetting.findMany({
      where: {
        ...(scope && { scope }),
      },
      orderBy: [{ scope: 'asc' }, { key: 'asc' }],
    });
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = UpdateSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Update each setting
    const results = await Promise.all(
      validation.data.settings.map(async ({ id, value }) => {
        return prisma.platformSetting.update({
          where: { id },
          data: { value, updatedAt: new Date() },
        });
      })
    );

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const CreateSettingSchema = z.object({
      key: z.string().min(1).max(255),
      value: z.string(),
      valueType: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
      scope: z.nativeEnum(SettingScope).default(SettingScope.GLOBAL),
      description: z.string().optional(),
    });

    const validation = CreateSettingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check for duplicate key in same scope
    const existing = await prisma.platformSetting.findFirst({
      where: {
        key: validation.data.key,
        scope: validation.data.scope,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Setting with this key already exists in this scope' },
        { status: 400 }
      );
    }

    const setting = await prisma.platformSetting.create({
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: setting }, { status: 201 });
  } catch (error) {
    console.error('Failed to create setting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create setting' },
      { status: 500 }
    );
  }
}
