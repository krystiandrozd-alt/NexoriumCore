// Nexorium Core - Cost Engine Service
// Business logic for cost calculation, rollups, and simulation

import prisma from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type { EnvironmentType } from '@prisma/client';
import type {
  CostPeriod,
  CostItemType,
  CostUnit,
  AllocationMethod,
  CostBreakdownItem,
  CostRollup,
  SimulationParams,
  SimulationResult,
  EnvironmentCostSummary,
} from '@/types/cost';

// ============================================
// COST MODEL CRUD
// ============================================

export async function getCostModels() {
  return prisma.costModel.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { costItems: true },
      },
    },
  });
}

export async function getCostModel(id: string) {
  return prisma.costModel.findUnique({
    where: { id },
    include: {
      costItems: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

export async function createCostModel(data: {
  name: string;
  description?: string;
  currency?: string;
  period?: CostPeriod;
  notes?: string;
}) {
  return prisma.costModel.create({
    data: {
      name: data.name,
      description: data.description,
      currency: data.currency || 'USD',
      period: data.period || 'MONTHLY',
      notes: data.notes,
    },
  });
}

export async function updateCostModel(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    currency: string;
    period: CostPeriod;
    notes: string;
    isActive: boolean;
  }>
) {
  return prisma.costModel.update({
    where: { id },
    data,
  });
}

export async function deleteCostModel(id: string) {
  return prisma.costModel.delete({
    where: { id },
  });
}

// ============================================
// COST ITEM CRUD
// ============================================

export async function getCostItems(costModelId: string) {
  return prisma.costItem.findMany({
    where: { costModelId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createCostItem(data: {
  costModelId: string;
  itemType: CostItemType;
  name: string;
  unitCost: number;
  unit: CostUnit;
  defaultQuantity?: number;
  allocationMethod?: AllocationMethod;
  tagsJson?: Record<string, unknown>;
  notes?: string;
}) {
  return prisma.costItem.create({
    data: {
      costModelId: data.costModelId,
      itemType: data.itemType,
      name: data.name,
      unitCost: data.unitCost,
      unit: data.unit,
      defaultQuantity: data.defaultQuantity ?? 1,
      allocationMethod: data.allocationMethod || 'DIRECT',
      tagsJson: data.tagsJson as Prisma.InputJsonValue | undefined,
      notes: data.notes,
    },
  });
}

export async function updateCostItem(
  id: string,
  data: Partial<{
    itemType: CostItemType;
    name: string;
    unitCost: number;
    unit: CostUnit;
    defaultQuantity: number;
    allocationMethod: AllocationMethod;
    tagsJson: Record<string, unknown>;
    notes: string;
  }>
) {
  const { tagsJson, ...rest } = data;
  return prisma.costItem.update({
    where: { id },
    data: {
      ...rest,
      ...(tagsJson !== undefined && { tagsJson: tagsJson as Prisma.InputJsonValue }),
    },
  });
}

export async function deleteCostItem(id: string) {
  return prisma.costItem.delete({
    where: { id },
  });
}

// ============================================
// ENVIRONMENT COST OVERRIDE CRUD
// ============================================

export async function getEnvironmentCostOverride(environmentId: string) {
  return prisma.environmentCostOverride.findUnique({
    where: { environmentId },
  });
}

export async function upsertEnvironmentCostOverride(
  environmentId: string,
  data: {
    currency?: string;
    fixedMonthlyCost?: number | null;
    notes?: string;
    editedBy?: string;
  }
) {
  // Create audit event for changes
  const existing = await prisma.environmentCostOverride.findUnique({
    where: { environmentId },
  });

  const result = await prisma.environmentCostOverride.upsert({
    where: { environmentId },
    create: {
      environmentId,
      currency: data.currency || 'USD',
      fixedMonthlyCost: data.fixedMonthlyCost,
      notes: data.notes,
      editedBy: data.editedBy,
      editedAt: new Date(),
    },
    update: {
      currency: data.currency,
      fixedMonthlyCost: data.fixedMonthlyCost,
      notes: data.notes,
      editedBy: data.editedBy,
      editedAt: new Date(),
    },
  });

  // Log audit event
  await prisma.auditEvent.create({
    data: {
      entityType: 'EnvironmentCostOverride',
      entityId: result.id,
      field: 'fixedMonthlyCost',
      oldValue: existing?.fixedMonthlyCost?.toString() || null,
      newValue: data.fixedMonthlyCost?.toString() || null,
      action: existing ? 'UPDATE' : 'CREATE',
      editedBy: data.editedBy,
      reason: 'Manual cost override update',
    },
  });

  return result;
}

export async function deleteEnvironmentCostOverride(environmentId: string, editedBy?: string) {
  const existing = await prisma.environmentCostOverride.findUnique({
    where: { environmentId },
  });

  if (existing) {
    await prisma.auditEvent.create({
      data: {
        entityType: 'EnvironmentCostOverride',
        entityId: existing.id,
        action: 'DELETE',
        editedBy,
        reason: 'Manual cost override deleted',
      },
    });

    return prisma.environmentCostOverride.delete({
      where: { environmentId },
    });
  }
  return null;
}

// ============================================
// COST ALLOCATION COMPUTATION
// ============================================

export interface ComputeCostOptions {
  costModelId: string;
  environmentIds?: string[];
  familyFilter?: string; // Filter by capability type (CPQ, ITSM, etc.)
  stageFilter?: string; // Filter by environment type (DEV, SIT, UAT, PREPROD)
  hostingTypeFilter?: string; // Filter by hosting type (CLOUD, ON_PREM)
  periodStart?: Date;
  periodEnd?: Date;
  quantityOverrides?: Record<string, number>; // costItemId -> quantity override
}

export async function computeEnvironmentCosts(
  options: ComputeCostOptions
): Promise<EnvironmentCostSummary[]> {
  const costModel = await prisma.costModel.findUnique({
    where: { id: options.costModelId },
    include: { costItems: true },
  });

  if (!costModel) {
    throw new Error(`Cost model not found: ${options.costModelId}`);
  }

  // Build environment query with filters
  const whereClause: Prisma.EnvironmentWhereInput = {};

  if (options.environmentIds && options.environmentIds.length > 0) {
    whereClause.id = { in: options.environmentIds };
  }

  if (options.stageFilter) {
    whereClause.type = options.stageFilter as EnvironmentType;
  }

  // Get environments with related data for costing
  const environments = await prisma.environment.findMany({
    where: whereClause,
    include: {
      hosts: true,
      componentInstances: {
        include: {
          component: true,
        },
      },
      networkContexts: true,
      costOverride: true,
    },
  });

  // Apply family filter (capability type) if specified
  let filteredEnvironments = environments;
  if (options.familyFilter) {
    filteredEnvironments = environments.filter(env => {
      // Check if any component in this env matches the family
      return env.componentInstances.some(
        ci => ci.component.capabilityType === options.familyFilter
      );
    });
  }

  // Apply hosting type filter if specified
  if (options.hostingTypeFilter) {
    filteredEnvironments = filteredEnvironments.filter(env => {
      return env.networkContexts.some(
        nc => nc.hostingType === options.hostingTypeFilter
      );
    });
  }

  // Separate DIRECT and SHARED items
  const directItems = costModel.costItems.filter(item => item.allocationMethod === 'DIRECT');
  const sharedItems = costModel.costItems.filter(item => item.allocationMethod === 'SHARED_PRORATED');

  // Calculate shared costs (prorated across all selected environments)
  const envCount = filteredEnvironments.length || 1;
  const sharedCostPerEnv = sharedItems.reduce((sum, item) => {
    const qty = options.quantityOverrides?.[item.id] ?? Number(item.defaultQuantity);
    return sum + (Number(item.unitCost) * qty / envCount);
  }, 0);

  // Calculate costs for each environment
  const results: EnvironmentCostSummary[] = [];

  for (const env of filteredEnvironments) {
    // Check for fixed override
    if (env.costOverride?.fixedMonthlyCost) {
      results.push({
        environmentId: env.id,
        environmentName: env.name,
        environmentType: env.type,
        hostingType: env.networkContexts[0]?.hostingType || 'ON_PREM',
        family: inferEnvironmentFamily(env),
        totalCost: Number(env.costOverride.fixedMonthlyCost),
        currency: env.costOverride.currency,
        breakdown: [{
          itemName: 'Fixed Monthly Cost (Override)',
          itemType: 'OTHER' as CostItemType,
          quantity: 1,
          unitCost: Number(env.costOverride.fixedMonthlyCost),
          totalCost: Number(env.costOverride.fixedMonthlyCost),
          allocationMethod: 'DIRECT' as AllocationMethod,
          notes: env.costOverride.notes || undefined,
        }],
        isOverride: true,
        computedAt: new Date(),
      });
      continue;
    }

    // Calculate direct costs based on environment data
    const breakdown: CostBreakdownItem[] = [];
    let totalCost = 0;

    for (const item of directItems) {
      let quantity = options.quantityOverrides?.[item.id] ?? Number(item.defaultQuantity);

      // Auto-calculate quantity based on unit type and environment data
      if (item.unit === 'PER_HOST') {
        quantity = env.hosts.length || 1;
      } else if (item.unit === 'PER_COMPONENT') {
        quantity = env.componentInstances.length || 1;
      } else if (item.unit === 'PER_ENV') {
        quantity = 1;
      }

      const itemCost = Number(item.unitCost) * quantity;
      totalCost += itemCost;

      breakdown.push({
        itemId: item.id,
        itemName: item.name,
        itemType: item.itemType as CostItemType,
        quantity,
        unitCost: Number(item.unitCost),
        totalCost: itemCost,
        unit: item.unit as CostUnit,
        allocationMethod: item.allocationMethod as AllocationMethod,
      });
    }

    // Add prorated shared costs
    if (sharedCostPerEnv > 0) {
      for (const item of sharedItems) {
        const qty = options.quantityOverrides?.[item.id] ?? Number(item.defaultQuantity);
        const itemSharedCost = (Number(item.unitCost) * qty) / envCount;

        breakdown.push({
          itemId: item.id,
          itemName: item.name,
          itemType: item.itemType as CostItemType,
          quantity: qty / envCount,
          unitCost: Number(item.unitCost),
          totalCost: itemSharedCost,
          unit: item.unit as CostUnit,
          allocationMethod: 'SHARED_PRORATED' as AllocationMethod,
          notes: `Shared across ${envCount} environments`,
        });
      }
      totalCost += sharedCostPerEnv;
    }

    results.push({
      environmentId: env.id,
      environmentName: env.name,
      environmentType: env.type,
      hostingType: env.networkContexts[0]?.hostingType || 'ON_PREM',
      family: inferEnvironmentFamily(env),
      totalCost,
      currency: costModel.currency,
      breakdown,
      isOverride: false,
      computedAt: new Date(),
    });
  }

  return results;
}

// Infer environment family based on components
function inferEnvironmentFamily(env: {
  componentInstances: Array<{ component: { capabilityType: string } }>;
}): string {
  const capabilityTypes = env.componentInstances.map(ci => ci.component.capabilityType);

  // Priority order for family assignment
  if (capabilityTypes.includes('CPQ')) return 'CPQ';
  if (capabilityTypes.includes('CRM')) return 'CRM';
  if (capabilityTypes.includes('BILLING')) return 'BILLING';
  if (capabilityTypes.includes('SOM')) return 'SOM';
  if (capabilityTypes.includes('ITSM')) return 'ITSM';
  if (capabilityTypes.includes('INVENTORY')) return 'INVENTORY';
  if (capabilityTypes.includes('ORCHESTRATOR')) return 'OSS';

  return 'OTHER';
}

// ============================================
// COST ROLLUPS
// ============================================

export async function getCostRollups(options: ComputeCostOptions): Promise<CostRollup> {
  const envCosts = await computeEnvironmentCosts(options);

  // Initialize rollup structure
  const rollup: CostRollup = {
    totalCost: 0,
    currency: 'USD',
    environmentCount: envCosts.length,
    byFamily: {},
    byStage: {},
    byHostingType: {},
    computedAt: new Date(),
  };

  // Get currency from cost model
  const costModel = await prisma.costModel.findUnique({
    where: { id: options.costModelId },
    select: { currency: true },
  });
  rollup.currency = costModel?.currency || 'USD';

  // Aggregate costs
  for (const envCost of envCosts) {
    rollup.totalCost += envCost.totalCost;

    // By family
    if (!rollup.byFamily[envCost.family]) {
      rollup.byFamily[envCost.family] = { total: 0, count: 0 };
    }
    rollup.byFamily[envCost.family].total += envCost.totalCost;
    rollup.byFamily[envCost.family].count += 1;

    // By stage
    if (!rollup.byStage[envCost.environmentType]) {
      rollup.byStage[envCost.environmentType] = { total: 0, count: 0 };
    }
    rollup.byStage[envCost.environmentType].total += envCost.totalCost;
    rollup.byStage[envCost.environmentType].count += 1;

    // By hosting type
    if (!rollup.byHostingType[envCost.hostingType]) {
      rollup.byHostingType[envCost.hostingType] = { total: 0, count: 0 };
    }
    rollup.byHostingType[envCost.hostingType].total += envCost.totalCost;
    rollup.byHostingType[envCost.hostingType].count += 1;
  }

  return rollup;
}

// ============================================
// COST ALLOCATION PERSISTENCE
// ============================================

export async function saveEnvironmentCostAllocation(
  summary: EnvironmentCostSummary,
  costModelId: string,
  periodStart: Date,
  periodEnd: Date
) {
  return prisma.environmentCostAllocation.upsert({
    where: {
      environmentId_costModelId_periodStart_periodEnd: {
        environmentId: summary.environmentId,
        costModelId,
        periodStart,
        periodEnd,
      },
    },
    create: {
      environmentId: summary.environmentId,
      costModelId,
      periodStart,
      periodEnd,
      totalCost: summary.totalCost,
      breakdownJson: summary.breakdown as unknown as Prisma.InputJsonValue,
      currency: summary.currency,
    },
    update: {
      totalCost: summary.totalCost,
      breakdownJson: summary.breakdown as unknown as Prisma.InputJsonValue,
      currency: summary.currency,
      computedAt: new Date(),
    },
  });
}

export async function getEnvironmentCostAllocations(environmentId: string) {
  return prisma.environmentCostAllocation.findMany({
    where: { environmentId },
    include: { costModel: true },
    orderBy: { periodStart: 'desc' },
  });
}

// ============================================
// COST SIMULATION
// ============================================

export async function runSimulation(params: SimulationParams): Promise<SimulationResult> {
  const { baseCostModelId, addEnvCount, envFamily, envStage, scalingFactor } = params;

  // Get current costs
  const currentCosts = await computeEnvironmentCosts({
    costModelId: baseCostModelId,
    familyFilter: envFamily,
    stageFilter: envStage,
  });

  const currentTotal = currentCosts.reduce((sum, c) => sum + c.totalCost, 0);
  const currentEnvCount = currentCosts.length;

  // Calculate average cost per environment for the family
  const avgCostPerEnv = currentEnvCount > 0 ? currentTotal / currentEnvCount : 0;

  // Get cost model for default costs if no existing environments
  const costModel = await prisma.costModel.findUnique({
    where: { id: baseCostModelId },
    include: { costItems: true },
  });

  if (!costModel) {
    throw new Error(`Cost model not found: ${baseCostModelId}`);
  }

  // Calculate default new env cost from cost model items
  let defaultNewEnvCost = 0;
  for (const item of costModel.costItems) {
    if (item.allocationMethod === 'DIRECT') {
      defaultNewEnvCost += Number(item.unitCost) * Number(item.defaultQuantity);
    }
  }

  // Cost per new environment (use average if exists, otherwise default)
  const costPerNewEnv = avgCostPerEnv > 0 ? avgCostPerEnv : defaultNewEnvCost;

  // Apply scaling factor to HOST costs
  let scaledCurrentTotal = currentTotal;
  if (scalingFactor && scalingFactor !== 1) {
    for (const envCost of currentCosts) {
      const hostCosts = envCost.breakdown
        .filter(b => b.itemType === 'HOST')
        .reduce((sum, b) => sum + b.totalCost, 0);
      const nonHostCosts = envCost.totalCost - hostCosts;
      const scaledHostCosts = hostCosts * scalingFactor;
      scaledCurrentTotal = scaledCurrentTotal - envCost.totalCost + nonHostCosts + scaledHostCosts;
    }
  }

  // Calculate projected costs
  const additionalEnvCost = (addEnvCount || 0) * costPerNewEnv;
  const projectedTotal = scaledCurrentTotal + additionalEnvCost;
  const delta = projectedTotal - currentTotal;
  const percentageChange = currentTotal > 0 ? (delta / currentTotal) * 100 : 0;

  return {
    currentTotal,
    currentEnvCount,
    projectedTotal,
    projectedEnvCount: currentEnvCount + (addEnvCount || 0),
    delta,
    percentageChange,
    currency: costModel.currency,
    breakdown: {
      currentCosts: scaledCurrentTotal,
      additionalEnvCost,
      scalingImpact: scalingFactor ? (scaledCurrentTotal - currentTotal) : 0,
    },
    assumptions: {
      avgCostPerEnv: costPerNewEnv,
      addEnvCount: addEnvCount || 0,
      scalingFactor: scalingFactor || 1,
      envFamily: envFamily || 'ALL',
      envStage: envStage || 'ALL',
    },
    computedAt: new Date(),
  };
}

export async function saveSimulation(data: {
  name: string;
  description?: string;
  baseCostModelId: string;
  currency: string;
  params: SimulationParams;
  result: SimulationResult;
  createdBy?: string;
}) {
  return prisma.costSimulation.create({
    data: {
      name: data.name,
      description: data.description,
      baseCostModelId: data.baseCostModelId,
      currency: data.currency,
      paramsJson: data.params as unknown as Prisma.InputJsonValue,
      resultJson: data.result as unknown as Prisma.InputJsonValue,
      createdBy: data.createdBy,
    },
  });
}

export async function getSimulations(costModelId?: string) {
  const whereClause = costModelId ? { baseCostModelId: costModelId } : {};
  return prisma.costSimulation.findMany({
    where: whereClause,
    include: { baseCostModel: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getSimulation(id: string) {
  return prisma.costSimulation.findUnique({
    where: { id },
    include: { baseCostModel: true },
  });
}

export async function deleteSimulation(id: string) {
  return prisma.costSimulation.delete({
    where: { id },
  });
}

// ============================================
// DASHBOARD DATA
// ============================================

export async function getCostDashboardData(costModelId: string) {
  const [rollups, recentAllocations, recentSimulations] = await Promise.all([
    getCostRollups({ costModelId }),
    prisma.environmentCostAllocation.findMany({
      where: { costModelId },
      include: { environment: true },
      orderBy: { computedAt: 'desc' },
      take: 10,
    }),
    prisma.costSimulation.findMany({
      where: { baseCostModelId: costModelId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    rollups,
    recentAllocations,
    recentSimulations,
  };
}
