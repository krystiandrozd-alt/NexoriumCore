// Nexorium Core - Orphaned Assets API
// GET /api/organisation/orphans - List all orphaned assets

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { AssetEntityType, RACIRole } from '@prisma/client';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

interface OrphanedAsset {
  entityType: AssetEntityType;
  entityId: string;
  entityName: string;
  reason: string;
  detectedAt: Date;
}

export async function GET(request: NextRequest) {
  const auth = await requirePermission(Permission.VIEW_ORGANISATION);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') as AssetEntityType | null;

    const orphans: OrphanedAsset[] = [];

    // Find environments without RACI mappings
    if (!entityType || entityType === AssetEntityType.ENVIRONMENT) {
      const environments = await prisma.environment.findMany({
        select: {
          id: true,
          name: true,
        },
      });

      for (const env of environments) {
        const mappings = await prisma.rACIMapping.findMany({
          where: {
            entityType: AssetEntityType.ENVIRONMENT,
            entityId: env.id,
          },
        });

        if (mappings.length === 0) {
          orphans.push({
            entityType: AssetEntityType.ENVIRONMENT,
            entityId: env.id,
            entityName: env.name,
            reason: 'No RACI assignments',
            detectedAt: new Date(),
          });
        } else if (!mappings.some((m) => m.raciRole === RACIRole.ACCOUNTABLE)) {
          orphans.push({
            entityType: AssetEntityType.ENVIRONMENT,
            entityId: env.id,
            entityName: env.name,
            reason: 'No Accountable person assigned',
            detectedAt: new Date(),
          });
        }
      }
    }

    // Find components without RACI mappings
    if (!entityType || entityType === AssetEntityType.COMPONENT) {
      const components = await prisma.component.findMany({
        select: {
          id: true,
          name: true,
        },
      });

      for (const comp of components) {
        const mappings = await prisma.rACIMapping.findMany({
          where: {
            entityType: AssetEntityType.COMPONENT,
            entityId: comp.id,
          },
        });

        if (mappings.length === 0) {
          orphans.push({
            entityType: AssetEntityType.COMPONENT,
            entityId: comp.id,
            entityName: comp.name,
            reason: 'No RACI assignments',
            detectedAt: new Date(),
          });
        }
      }
    }

    // Sort by entity type and name
    orphans.sort((a, b) => {
      if (a.entityType !== b.entityType) {
        return a.entityType.localeCompare(b.entityType);
      }
      return a.entityName.localeCompare(b.entityName);
    });

    return NextResponse.json({
      success: true,
      data: orphans,
      summary: {
        total: orphans.length,
        byType: {
          ENVIRONMENT: orphans.filter((o) => o.entityType === AssetEntityType.ENVIRONMENT).length,
          COMPONENT: orphans.filter((o) => o.entityType === AssetEntityType.COMPONENT).length,
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch orphaned assets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orphaned assets' },
      { status: 500 }
    );
  }
}
