// TelEnvIQ - Cost & Budget Type Definitions

// Enums matching Prisma schema
export type CostPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type CostItemType = 'HOST' | 'COMPONENT_LICENSE' | 'SHARED_PLATFORM' | 'OTHER';
export type CostUnit = 'PER_ENV' | 'PER_HOST' | 'PER_COMPONENT' | 'PER_GB' | 'PER_USER' | 'OTHER';
export type AllocationMethod = 'DIRECT' | 'SHARED_PRORATED';

// Domain Types
export interface CostModel {
  id: string;
  name: string;
  description?: string | null;
  currency: string;
  period: CostPeriod;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  costItems?: CostItem[];
  _count?: {
    costItems: number;
  };
}

export interface CostItem {
  id: string;
  costModelId: string;
  itemType: CostItemType;
  name: string;
  unitCost: number;
  unit: CostUnit;
  defaultQuantity: number;
  allocationMethod: AllocationMethod;
  tagsJson?: Record<string, unknown> | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnvironmentCostOverride {
  id: string;
  environmentId: string;
  currency: string;
  fixedMonthlyCost?: number | null;
  notes?: string | null;
  editedBy?: string | null;
  editedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnvironmentCostAllocation {
  id: string;
  environmentId: string;
  costModelId: string;
  periodStart: Date;
  periodEnd: Date;
  totalCost: number;
  breakdownJson: CostBreakdownItem[];
  currency: string;
  computedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  environment?: {
    id: string;
    name: string;
    type: string;
  };
  costModel?: CostModel;
}

export interface CostSimulation {
  id: string;
  name: string;
  description?: string | null;
  baseCostModelId: string;
  currency: string;
  paramsJson: SimulationParams;
  resultJson: SimulationResult;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  baseCostModel?: CostModel;
}

// Computation Types
export interface CostBreakdownItem {
  itemId?: string;
  itemName: string;
  itemType: CostItemType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  unit?: CostUnit;
  allocationMethod: AllocationMethod;
  notes?: string;
}

export interface EnvironmentCostSummary {
  environmentId: string;
  environmentName: string;
  environmentType: string;
  hostingType: string;
  family: string;
  totalCost: number;
  currency: string;
  breakdown: CostBreakdownItem[];
  isOverride: boolean;
  computedAt: Date;
}

export interface CostRollup {
  totalCost: number;
  currency: string;
  environmentCount: number;
  byFamily: Record<string, { total: number; count: number }>;
  byStage: Record<string, { total: number; count: number }>;
  byHostingType: Record<string, { total: number; count: number }>;
  computedAt: Date;
}

// Simulation Types
export interface SimulationParams {
  baseCostModelId: string;
  addEnvCount?: number;
  envFamily?: string;
  envStage?: string;
  scalingFactor?: number;
}

export interface SimulationResult {
  currentTotal: number;
  currentEnvCount: number;
  projectedTotal: number;
  projectedEnvCount: number;
  delta: number;
  percentageChange: number;
  currency: string;
  breakdown: {
    currentCosts: number;
    additionalEnvCost: number;
    scalingImpact: number;
  };
  assumptions: {
    avgCostPerEnv: number;
    addEnvCount: number;
    scalingFactor: number;
    envFamily: string;
    envStage: string;
  };
  computedAt: Date;
}

// API Response Types
export interface CostOverviewData {
  rollups: CostRollup;
  recentAllocations: EnvironmentCostAllocation[];
  recentSimulations: CostSimulation[];
  costModels: CostModel[];
}

// Form Input Types
export interface CreateCostModelInput {
  name: string;
  description?: string;
  currency?: string;
  period?: CostPeriod;
  notes?: string;
}

export interface CreateCostItemInput {
  costModelId: string;
  itemType: CostItemType;
  name: string;
  unitCost: number;
  unit: CostUnit;
  defaultQuantity?: number;
  allocationMethod?: AllocationMethod;
  tagsJson?: Record<string, unknown>;
  notes?: string;
}

export interface RunSimulationInput {
  baseCostModelId: string;
  addEnvCount?: number;
  envFamily?: string;
  envStage?: string;
  scalingFactor?: number;
}

export interface SaveSimulationInput {
  name: string;
  description?: string;
  baseCostModelId: string;
  currency: string;
  params: SimulationParams;
  result: SimulationResult;
  createdBy?: string;
}
