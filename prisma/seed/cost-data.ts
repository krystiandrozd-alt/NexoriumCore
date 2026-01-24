// TelEnvIQ - Cost & Budget Seed Data
// Run with: npx prisma db seed

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCostData() {
  console.log('\n💰 Seeding Cost & Budget data...\n');

  // Clear existing cost data
  await prisma.costSimulation.deleteMany({});
  await prisma.environmentCostAllocation.deleteMany({});
  await prisma.environmentCostOverride.deleteMany({});
  await prisma.costItem.deleteMany({});
  await prisma.costModel.deleteMany({});

  // ============================================
  // Cost Model 1: CPQ Non-Prod Model
  // ============================================
  const cpqModel = await prisma.costModel.create({
    data: {
      id: 'cost-model-cpq-001',
      name: 'CPQ Non-Prod Model',
      description: 'Standard cost model for CPQ (Configure-Price-Quote) non-production environments',
      currency: 'USD',
      period: 'MONTHLY',
      notes: 'Includes AWS hosting, Oracle licenses, and shared platform costs',
      isActive: true,
    },
  });
  console.log(`✓ Created cost model: ${cpqModel.name}`);

  // CPQ Cost Items
  const cpqCostItems = [
    {
      itemType: 'HOST' as const,
      name: 'AWS m5.xlarge (App Server)',
      unitCost: 180,
      unit: 'PER_HOST' as const,
      defaultQuantity: 3,
      allocationMethod: 'DIRECT' as const,
      notes: 'Application tier VMs',
    },
    {
      itemType: 'HOST' as const,
      name: 'AWS r5.2xlarge (DB Server)',
      unitCost: 420,
      unit: 'PER_HOST' as const,
      defaultQuantity: 2,
      allocationMethod: 'DIRECT' as const,
      notes: 'Database tier VMs with high memory',
    },
    {
      itemType: 'COMPONENT_LICENSE' as const,
      name: 'Oracle DB Standard Edition',
      unitCost: 2500,
      unit: 'PER_ENV' as const,
      defaultQuantity: 1,
      allocationMethod: 'DIRECT' as const,
      notes: 'Oracle SE2 license for non-prod',
    },
    {
      itemType: 'COMPONENT_LICENSE' as const,
      name: 'CPQ Cloud License (Non-Prod)',
      unitCost: 1800,
      unit: 'PER_ENV' as const,
      defaultQuantity: 1,
      allocationMethod: 'DIRECT' as const,
      notes: 'Oracle CPQ Cloud non-production subscription',
    },
    {
      itemType: 'SHARED_PLATFORM' as const,
      name: 'Shared Kafka Cluster',
      unitCost: 800,
      unit: 'OTHER' as const,
      defaultQuantity: 1,
      allocationMethod: 'SHARED_PRORATED' as const,
      notes: 'Prorated Kafka cluster costs across all CPQ environments',
    },
    {
      itemType: 'SHARED_PLATFORM' as const,
      name: 'Shared API Gateway',
      unitCost: 400,
      unit: 'OTHER' as const,
      defaultQuantity: 1,
      allocationMethod: 'SHARED_PRORATED' as const,
      notes: 'Prorated Kong API Gateway costs',
    },
    {
      itemType: 'OTHER' as const,
      name: 'Data Transfer (Egress)',
      unitCost: 0.09,
      unit: 'PER_GB' as const,
      defaultQuantity: 500,
      allocationMethod: 'DIRECT' as const,
      notes: 'AWS data transfer out',
    },
  ];

  for (const item of cpqCostItems) {
    await prisma.costItem.create({
      data: {
        costModelId: cpqModel.id,
        ...item,
      },
    });
  }
  console.log(`✓ Created ${cpqCostItems.length} cost items for CPQ model`);

  // ============================================
  // Cost Model 2: ITSM Non-Prod Model
  // ============================================
  const itsmModel = await prisma.costModel.create({
    data: {
      id: 'cost-model-itsm-001',
      name: 'ITSM Non-Prod Model',
      description: 'Standard cost model for ITSM (ServiceNow) non-production environments',
      currency: 'USD',
      period: 'MONTHLY',
      notes: 'ServiceNow sub-production instances with Azure hosting',
      isActive: true,
    },
  });
  console.log(`✓ Created cost model: ${itsmModel.name}`);

  // ITSM Cost Items
  const itsmCostItems = [
    {
      itemType: 'HOST' as const,
      name: 'Azure D4s_v3 (App Tier)',
      unitCost: 150,
      unit: 'PER_HOST' as const,
      defaultQuantity: 2,
      allocationMethod: 'DIRECT' as const,
      notes: 'Azure VMs for ServiceNow integration layer',
    },
    {
      itemType: 'COMPONENT_LICENSE' as const,
      name: 'ServiceNow Sub-Production',
      unitCost: 4500,
      unit: 'PER_ENV' as const,
      defaultQuantity: 1,
      allocationMethod: 'DIRECT' as const,
      notes: 'ServiceNow sub-production instance license',
    },
    {
      itemType: 'COMPONENT_LICENSE' as const,
      name: 'ServiceNow IntegrationHub',
      unitCost: 800,
      unit: 'PER_ENV' as const,
      defaultQuantity: 1,
      allocationMethod: 'DIRECT' as const,
      notes: 'Integration Hub add-on',
    },
    {
      itemType: 'SHARED_PLATFORM' as const,
      name: 'Shared Azure SQL',
      unitCost: 600,
      unit: 'OTHER' as const,
      defaultQuantity: 1,
      allocationMethod: 'SHARED_PRORATED' as const,
      notes: 'Azure SQL managed instance shared across ITSM envs',
    },
    {
      itemType: 'OTHER' as const,
      name: 'Azure Storage',
      unitCost: 0.02,
      unit: 'PER_GB' as const,
      defaultQuantity: 200,
      allocationMethod: 'DIRECT' as const,
      notes: 'Azure Blob Storage',
    },
  ];

  for (const item of itsmCostItems) {
    await prisma.costItem.create({
      data: {
        costModelId: itsmModel.id,
        ...item,
      },
    });
  }
  console.log(`✓ Created ${itsmCostItems.length} cost items for ITSM model`);

  // ============================================
  // Cost Model 3: OSS/BSS Standard Model
  // ============================================
  const ossModel = await prisma.costModel.create({
    data: {
      id: 'cost-model-oss-001',
      name: 'OSS/BSS Standard Non-Prod',
      description: 'Comprehensive cost model for full telco OSS/BSS stack environments',
      currency: 'USD',
      period: 'MONTHLY',
      notes: 'Full stack including Cisco NSO, Nokia NetAct, Oracle OMS',
      isActive: true,
    },
  });
  console.log(`✓ Created cost model: ${ossModel.name}`);

  // OSS/BSS Cost Items
  const ossCostItems = [
    {
      itemType: 'HOST' as const,
      name: 'On-Prem ESXi Host (Enterprise)',
      unitCost: 850,
      unit: 'PER_HOST' as const,
      defaultQuantity: 4,
      allocationMethod: 'DIRECT' as const,
      notes: 'VMware ESXi hosts for OSS applications',
    },
    {
      itemType: 'HOST' as const,
      name: 'On-Prem Oracle RAC Node',
      unitCost: 1200,
      unit: 'PER_HOST' as const,
      defaultQuantity: 2,
      allocationMethod: 'DIRECT' as const,
      notes: 'Oracle RAC cluster nodes',
    },
    {
      itemType: 'COMPONENT_LICENSE' as const,
      name: 'Cisco NSO (Non-Prod)',
      unitCost: 5500,
      unit: 'PER_ENV' as const,
      defaultQuantity: 1,
      allocationMethod: 'DIRECT' as const,
      notes: 'Cisco Network Services Orchestrator',
    },
    {
      itemType: 'COMPONENT_LICENSE' as const,
      name: 'Oracle OMS License',
      unitCost: 8000,
      unit: 'PER_ENV' as const,
      defaultQuantity: 1,
      allocationMethod: 'DIRECT' as const,
      notes: 'Oracle Order Management System',
    },
    {
      itemType: 'COMPONENT_LICENSE' as const,
      name: 'Nokia NetAct (Non-Prod)',
      unitCost: 3500,
      unit: 'PER_ENV' as const,
      defaultQuantity: 1,
      allocationMethod: 'DIRECT' as const,
      notes: 'Nokia Service Assurance Platform',
    },
    {
      itemType: 'COMPONENT_LICENSE' as const,
      name: 'Oracle DB Enterprise Edition',
      unitCost: 4500,
      unit: 'PER_ENV' as const,
      defaultQuantity: 1,
      allocationMethod: 'DIRECT' as const,
      notes: 'Oracle EE for production-like testing',
    },
    {
      itemType: 'SHARED_PLATFORM' as const,
      name: 'Shared SAN Storage',
      unitCost: 2000,
      unit: 'OTHER' as const,
      defaultQuantity: 1,
      allocationMethod: 'SHARED_PRORATED' as const,
      notes: 'NetApp SAN shared across OSS environments',
    },
    {
      itemType: 'SHARED_PLATFORM' as const,
      name: 'Shared Network Lab',
      unitCost: 1500,
      unit: 'OTHER' as const,
      defaultQuantity: 1,
      allocationMethod: 'SHARED_PRORATED' as const,
      notes: 'Network element simulator infrastructure',
    },
    {
      itemType: 'OTHER' as const,
      name: 'Support & Maintenance',
      unitCost: 1200,
      unit: 'PER_ENV' as const,
      defaultQuantity: 1,
      allocationMethod: 'DIRECT' as const,
      notes: 'Vendor support and maintenance fees',
    },
  ];

  for (const item of ossCostItems) {
    await prisma.costItem.create({
      data: {
        costModelId: ossModel.id,
        ...item,
      },
    });
  }
  console.log(`✓ Created ${ossCostItems.length} cost items for OSS/BSS model`);

  // ============================================
  // Environment Cost Overrides (Example)
  // ============================================
  // Get existing environments
  const environments = await prisma.environment.findMany({
    take: 3,
  });

  if (environments.length > 0) {
    // Add an override for the NFT environment (negotiated fixed rate)
    const nftEnv = environments.find(e => e.type === 'NFT');
    if (nftEnv) {
      await prisma.environmentCostOverride.create({
        data: {
          environmentId: nftEnv.id,
          currency: 'USD',
          fixedMonthlyCost: 15000,
          notes: 'Negotiated fixed rate for performance testing infrastructure',
          editedBy: 'cost-admin',
          editedAt: new Date(),
        },
      });
      console.log(`✓ Created cost override for NFT environment`);
    }

    // Create some sample allocations
    const sitEnv = environments.find(e => e.type === 'SIT');
    if (sitEnv) {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await prisma.environmentCostAllocation.create({
        data: {
          environmentId: sitEnv.id,
          costModelId: ossModel.id,
          periodStart,
          periodEnd,
          totalCost: 28500,
          currency: 'USD',
          breakdownJson: [
            { itemName: 'On-Prem ESXi Host (Enterprise)', itemType: 'HOST', quantity: 4, unitCost: 850, totalCost: 3400, allocationMethod: 'DIRECT' },
            { itemName: 'On-Prem Oracle RAC Node', itemType: 'HOST', quantity: 2, unitCost: 1200, totalCost: 2400, allocationMethod: 'DIRECT' },
            { itemName: 'Cisco NSO (Non-Prod)', itemType: 'COMPONENT_LICENSE', quantity: 1, unitCost: 5500, totalCost: 5500, allocationMethod: 'DIRECT' },
            { itemName: 'Oracle OMS License', itemType: 'COMPONENT_LICENSE', quantity: 1, unitCost: 8000, totalCost: 8000, allocationMethod: 'DIRECT' },
            { itemName: 'Nokia NetAct (Non-Prod)', itemType: 'COMPONENT_LICENSE', quantity: 1, unitCost: 3500, totalCost: 3500, allocationMethod: 'DIRECT' },
            { itemName: 'Oracle DB Enterprise Edition', itemType: 'COMPONENT_LICENSE', quantity: 1, unitCost: 4500, totalCost: 4500, allocationMethod: 'DIRECT' },
            { itemName: 'Support & Maintenance', itemType: 'OTHER', quantity: 1, unitCost: 1200, totalCost: 1200, allocationMethod: 'DIRECT' },
          ],
        },
      });
      console.log(`✓ Created cost allocation for SIT environment`);
    }

    const uatEnv = environments.find(e => e.type === 'UAT');
    if (uatEnv) {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await prisma.environmentCostAllocation.create({
        data: {
          environmentId: uatEnv.id,
          costModelId: cpqModel.id,
          periodStart,
          periodEnd,
          totalCost: 8045,
          currency: 'USD',
          breakdownJson: [
            { itemName: 'AWS m5.xlarge (App Server)', itemType: 'HOST', quantity: 3, unitCost: 180, totalCost: 540, allocationMethod: 'DIRECT' },
            { itemName: 'AWS r5.2xlarge (DB Server)', itemType: 'HOST', quantity: 2, unitCost: 420, totalCost: 840, allocationMethod: 'DIRECT' },
            { itemName: 'Oracle DB Standard Edition', itemType: 'COMPONENT_LICENSE', quantity: 1, unitCost: 2500, totalCost: 2500, allocationMethod: 'DIRECT' },
            { itemName: 'CPQ Cloud License (Non-Prod)', itemType: 'COMPONENT_LICENSE', quantity: 1, unitCost: 1800, totalCost: 1800, allocationMethod: 'DIRECT' },
            { itemName: 'Shared Kafka Cluster', itemType: 'SHARED_PLATFORM', quantity: 0.5, unitCost: 800, totalCost: 400, allocationMethod: 'SHARED_PRORATED', notes: 'Shared across 2 environments' },
            { itemName: 'Shared API Gateway', itemType: 'SHARED_PLATFORM', quantity: 0.5, unitCost: 400, totalCost: 200, allocationMethod: 'SHARED_PRORATED', notes: 'Shared across 2 environments' },
            { itemName: 'Data Transfer (Egress)', itemType: 'OTHER', quantity: 850, unitCost: 0.09, totalCost: 76.5, allocationMethod: 'DIRECT' },
          ],
        },
      });
      console.log(`✓ Created cost allocation for UAT environment`);
    }
  }

  // ============================================
  // Sample Simulations
  // ============================================
  await prisma.costSimulation.create({
    data: {
      name: 'Q1 CPQ Expansion Plan',
      description: 'Adding 2 new CPQ environments for upcoming release testing',
      baseCostModelId: cpqModel.id,
      currency: 'USD',
      paramsJson: {
        baseCostModelId: cpqModel.id,
        addEnvCount: 2,
        envFamily: 'CPQ',
        envStage: 'SIT',
        scalingFactor: 1,
      },
      resultJson: {
        currentTotal: 8045,
        currentEnvCount: 1,
        projectedTotal: 24135,
        projectedEnvCount: 3,
        delta: 16090,
        percentageChange: 200,
        currency: 'USD',
        breakdown: {
          currentCosts: 8045,
          additionalEnvCost: 16090,
          scalingImpact: 0,
        },
        assumptions: {
          avgCostPerEnv: 8045,
          addEnvCount: 2,
          scalingFactor: 1,
          envFamily: 'CPQ',
          envStage: 'SIT',
        },
        computedAt: new Date().toISOString(),
      },
      createdBy: 'cost-admin',
    },
  });
  console.log(`✓ Created sample simulation: Q1 CPQ Expansion Plan`);

  await prisma.costSimulation.create({
    data: {
      name: 'Infrastructure Scale-Down',
      description: 'Exploring 20% reduction in host costs through right-sizing',
      baseCostModelId: ossModel.id,
      currency: 'USD',
      paramsJson: {
        baseCostModelId: ossModel.id,
        addEnvCount: 0,
        envFamily: 'OSS',
        scalingFactor: 0.8,
      },
      resultJson: {
        currentTotal: 28500,
        currentEnvCount: 1,
        projectedTotal: 27340,
        projectedEnvCount: 1,
        delta: -1160,
        percentageChange: -4.07,
        currency: 'USD',
        breakdown: {
          currentCosts: 27340,
          additionalEnvCost: 0,
          scalingImpact: -1160,
        },
        assumptions: {
          avgCostPerEnv: 28500,
          addEnvCount: 0,
          scalingFactor: 0.8,
          envFamily: 'OSS',
          envStage: 'ALL',
        },
        computedAt: new Date().toISOString(),
      },
      createdBy: 'cost-admin',
    },
  });
  console.log(`✓ Created sample simulation: Infrastructure Scale-Down`);

  console.log('\n✅ Cost & Budget seed completed!');
  console.log('\n📊 Summary:');
  console.log(`   Cost Models: 3`);
  console.log(`   - CPQ Non-Prod Model (${cpqCostItems.length} items)`);
  console.log(`   - ITSM Non-Prod Model (${itsmCostItems.length} items)`);
  console.log(`   - OSS/BSS Standard Non-Prod (${ossCostItems.length} items)`);
  console.log(`   Simulations: 2`);
  console.log(`   Environment Overrides: 1`);
  console.log(`   Cost Allocations: 2`);
}

// If run directly
if (require.main === module) {
  seedCostData()
    .catch((e) => {
      console.error('❌ Cost seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
