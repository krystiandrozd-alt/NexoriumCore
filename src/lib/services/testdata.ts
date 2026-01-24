// TelEnvIQ - Test Data Service
// Test data lifecycle intelligence and tracking

import prisma from '@/lib/db';
import type { TestDataSet, RefreshRecord, SourceType, RefreshMethod } from '@/types';
import { daysSince, getStalenessLevel } from '@/lib/utils';

// Get all test data sets for an environment
export async function getTestDataSets(environmentId: string): Promise<TestDataSet[]> {
  const datasets = await prisma.testDataSet.findMany({
    where: {
      database: {
        node: { environmentId },
      },
    },
    include: {
      database: {
        include: {
          node: true,
        },
      },
      refreshHistory: {
        orderBy: { refreshDate: 'desc' },
        take: 10,
      },
    },
  });

  return datasets as unknown as TestDataSet[];
}

// Get single test data set
export async function getTestDataSet(id: string): Promise<TestDataSet | null> {
  const dataset = await prisma.testDataSet.findUnique({
    where: { id },
    include: {
      database: {
        include: {
          node: true,
        },
      },
      refreshHistory: {
        orderBy: { refreshDate: 'desc' },
      },
    },
  });

  return dataset as unknown as TestDataSet | null;
}

// Get test data set by database node ID
export async function getTestDataSetByNodeId(nodeId: string): Promise<TestDataSet | null> {
  const dbMeta = await prisma.databaseMetadata.findUnique({
    where: { nodeId },
    include: {
      testDataSet: {
        include: {
          refreshHistory: {
            orderBy: { refreshDate: 'desc' },
            take: 10,
          },
        },
      },
    },
  });

  if (!dbMeta?.testDataSet) return null;
  return dbMeta.testDataSet as unknown as TestDataSet;
}

// Create test data set for a database
export async function createTestDataSet(data: {
  databaseId: string;
  sourceType: SourceType;
  refreshMethod?: RefreshMethod;
  maskingPolicyVersion?: string;
  owner?: string;
  downstreamConsumers?: string[];
}): Promise<TestDataSet> {
  const dataset = await prisma.testDataSet.create({
    data: {
      databaseId: data.databaseId,
      sourceType: data.sourceType,
      refreshMethod: data.refreshMethod || 'MANUAL',
      maskingPolicyVersion: data.maskingPolicyVersion,
      owner: data.owner,
      downstreamConsumers: data.downstreamConsumers || [],
    },
    include: {
      refreshHistory: true,
    },
  });

  return dataset as unknown as TestDataSet;
}

// Update test data set
export async function updateTestDataSet(
  id: string,
  data: Partial<{
    sourceType: SourceType;
    refreshMethod: RefreshMethod;
    maskingPolicyVersion: string;
    owner: string;
    downstreamConsumers: string[];
  }>
): Promise<TestDataSet> {
  const dataset = await prisma.testDataSet.update({
    where: { id },
    data,
    include: {
      refreshHistory: {
        orderBy: { refreshDate: 'desc' },
        take: 10,
      },
    },
  });

  return dataset as unknown as TestDataSet;
}

// Record a data refresh
export async function recordRefresh(data: {
  testDataSetId: string;
  refreshDate: Date;
  refreshedBy?: string;
  method: RefreshMethod;
  notes?: string;
  changeReference?: string;
}): Promise<RefreshRecord> {
  // Create refresh record and update last refresh date
  const [refreshRecord] = await prisma.$transaction([
    prisma.refreshRecord.create({
      data: {
        testDataSetId: data.testDataSetId,
        refreshDate: data.refreshDate,
        refreshedBy: data.refreshedBy,
        method: data.method,
        notes: data.notes,
        changeReference: data.changeReference,
      },
    }),
    prisma.testDataSet.update({
      where: { id: data.testDataSetId },
      data: {
        lastRefreshDate: data.refreshDate,
        refreshMethod: data.method,
        changeReference: data.changeReference,
      },
    }),
  ]);

  return refreshRecord as unknown as RefreshRecord;
}

// Get refresh history for a test data set
export async function getRefreshHistory(testDataSetId: string): Promise<RefreshRecord[]> {
  const records = await prisma.refreshRecord.findMany({
    where: { testDataSetId },
    orderBy: { refreshDate: 'desc' },
  });

  return records as unknown as RefreshRecord[];
}

// Get datasets that need refresh
export async function getDatasetsNeedingRefresh(
  environmentId: string,
  thresholdDays: number = 30
): Promise<Array<TestDataSet & { daysStale: number | null }>> {
  const datasets = await prisma.testDataSet.findMany({
    where: {
      database: {
        node: { environmentId },
      },
    },
    include: {
      database: {
        include: {
          node: true,
        },
      },
      refreshHistory: {
        orderBy: { refreshDate: 'desc' },
        take: 1,
      },
    },
  });

  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

  return datasets
    .filter(ds => !ds.lastRefreshDate || ds.lastRefreshDate < thresholdDate)
    .map(ds => ({
      ...(ds as unknown as TestDataSet),
      daysStale: daysSince(ds.lastRefreshDate),
    }))
    .sort((a, b) => {
      // Sort by staleness (most stale first)
      if (a.daysStale === null) return -1;
      if (b.daysStale === null) return 1;
      return b.daysStale - a.daysStale;
    });
}

// Get data freshness summary for environment
export async function getDataFreshnessSummary(environmentId: string): Promise<{
  total: number;
  fresh: number;
  warning: number;
  stale: number;
  never: number;
}> {
  const datasets = await prisma.testDataSet.findMany({
    where: {
      database: {
        node: { environmentId },
      },
    },
    select: {
      lastRefreshDate: true,
    },
  });

  const summary = {
    total: datasets.length,
    fresh: 0,
    warning: 0,
    stale: 0,
    never: 0,
  };

  for (const ds of datasets) {
    const days = daysSince(ds.lastRefreshDate);
    const level = getStalenessLevel(days);

    if (days === null) {
      summary.never++;
    } else if (level === 'fresh') {
      summary.fresh++;
    } else if (level === 'warning') {
      summary.warning++;
    } else {
      summary.stale++;
    }
  }

  return summary;
}

// Get downstream consumers for a dataset
export async function getDownstreamConsumers(testDataSetId: string): Promise<string[]> {
  const dataset = await prisma.testDataSet.findUnique({
    where: { id: testDataSetId },
    select: { downstreamConsumers: true },
  });

  return dataset?.downstreamConsumers || [];
}

// Add downstream consumer
export async function addDownstreamConsumer(testDataSetId: string, consumer: string): Promise<void> {
  await prisma.testDataSet.update({
    where: { id: testDataSetId },
    data: {
      downstreamConsumers: {
        push: consumer,
      },
    },
  });
}

// Remove downstream consumer
export async function removeDownstreamConsumer(testDataSetId: string, consumer: string): Promise<void> {
  const dataset = await prisma.testDataSet.findUnique({
    where: { id: testDataSetId },
    select: { downstreamConsumers: true },
  });

  if (!dataset) return;

  await prisma.testDataSet.update({
    where: { id: testDataSetId },
    data: {
      downstreamConsumers: dataset.downstreamConsumers.filter(c => c !== consumer),
    },
  });
}

// Delete test data set
export async function deleteTestDataSet(id: string): Promise<void> {
  await prisma.testDataSet.delete({
    where: { id },
  });
}
