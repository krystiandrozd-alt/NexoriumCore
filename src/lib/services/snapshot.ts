// Nexorium Core - Snapshot Service
// Environment snapshot and drift detection

import prisma from '@/lib/db';
import type { EnvironmentSnapshot, SnapshotData, DriftReport, Node, Edge, TestDataSet, PropertyChange, NodeDiff, EdgeDiff } from '@/types';
import { generateSnapshotHash, daysSince } from '@/lib/utils';

// Create environment snapshot
export async function createSnapshot(environmentId: string): Promise<EnvironmentSnapshot> {
  const environment = await prisma.environment.findUnique({
    where: { id: environmentId },
    include: {
      nodes: {
        include: {
          databaseMetadata: {
            include: {
              testDataSet: true,
            },
          },
        },
      },
      edges: true,
    },
  });

  if (!environment) {
    throw new Error(`Environment not found: ${environmentId}`);
  }

  const snapshotData: SnapshotData = {
    nodes: environment.nodes.map(n => ({
      id: n.id,
      environmentId: n.environmentId,
      type: n.type,
      name: n.name,
      owner: n.owner,
      criticality: n.criticality,
      lastSeenAt: n.lastSeenAt,
      metadata: n.metadata as Record<string, unknown>,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      databaseMetadata: n.databaseMetadata ? {
        id: n.databaseMetadata.id,
        nodeId: n.databaseMetadata.nodeId,
        engine: n.databaseMetadata.engine,
        version: n.databaseMetadata.version,
        sizeGB: n.databaseMetadata.sizeGB,
        host: n.databaseMetadata.host,
        port: n.databaseMetadata.port,
        testDataSet: n.databaseMetadata.testDataSet as TestDataSet | null,
      } : null,
    })) as Node[],
    edges: environment.edges.map(e => ({
      id: e.id,
      environmentId: e.environmentId,
      sourceNodeId: e.sourceNodeId,
      targetNodeId: e.targetNodeId,
      protocol: e.protocol,
      port: e.port,
      pathOrTopic: e.pathOrTopic,
      confidenceScore: e.confidenceScore,
      lastObservedAt: e.lastObservedAt,
      metadata: e.metadata as Record<string, unknown>,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })) as Edge[],
    databases: environment.nodes
      .filter(n => n.databaseMetadata)
      .map(n => n.databaseMetadata!) as unknown as SnapshotData['databases'],
    testDataSets: environment.nodes
      .filter(n => n.databaseMetadata?.testDataSet)
      .map(n => n.databaseMetadata!.testDataSet!) as unknown as SnapshotData['testDataSets'],
  };

  const snapshotHash = generateSnapshotHash(snapshotData);

  const snapshot = await prisma.environmentSnapshot.create({
    data: {
      environmentId,
      snapshotHash,
      snapshotData: snapshotData as object,
    },
  });

  return {
    id: snapshot.id,
    environmentId: snapshot.environmentId,
    snapshotHash: snapshot.snapshotHash,
    snapshotData,
    createdAt: snapshot.createdAt,
  };
}

// Get snapshot by ID
export async function getSnapshot(id: string): Promise<EnvironmentSnapshot | null> {
  const snapshot = await prisma.environmentSnapshot.findUnique({
    where: { id },
  });

  if (!snapshot) return null;

  return {
    id: snapshot.id,
    environmentId: snapshot.environmentId,
    snapshotHash: snapshot.snapshotHash,
    snapshotData: snapshot.snapshotData as unknown as SnapshotData,
    createdAt: snapshot.createdAt,
  };
}

// List snapshots for environment
export async function listSnapshots(environmentId: string): Promise<EnvironmentSnapshot[]> {
  const snapshots = await prisma.environmentSnapshot.findMany({
    where: { environmentId },
    orderBy: { createdAt: 'desc' },
  });

  return snapshots.map(s => ({
    id: s.id,
    environmentId: s.environmentId,
    snapshotHash: s.snapshotHash,
    snapshotData: s.snapshotData as unknown as SnapshotData,
    createdAt: s.createdAt,
  }));
}

// Compare two snapshots and generate drift report
export async function compareSnapshots(
  snapshotAId: string,
  snapshotBId: string
): Promise<DriftReport> {
  const [snapshotA, snapshotB] = await Promise.all([
    getSnapshot(snapshotAId),
    getSnapshot(snapshotBId),
  ]);

  if (!snapshotA || !snapshotB) {
    throw new Error('One or both snapshots not found');
  }

  const dataA = snapshotA.snapshotData;
  const dataB = snapshotB.snapshotData;

  // Compare nodes
  const nodesBById = new Map(dataB.nodes.map(n => [n.id, n]));
  const nodesAByName = new Map(dataA.nodes.map(n => [n.name, n]));
  const nodesBByName = new Map(dataB.nodes.map(n => [n.name, n]));

  const addedNodes: Node[] = [];
  const removedNodes: Node[] = [];
  const modifiedNodes: NodeDiff[] = [];

  // Find added nodes (in B but not in A)
  for (const [name, node] of Array.from(nodesBByName.entries())) {
    if (!nodesAByName.has(name)) {
      addedNodes.push(node);
    }
  }

  // Find removed nodes (in A but not in B)
  for (const [name, node] of Array.from(nodesAByName.entries())) {
    if (!nodesBByName.has(name)) {
      removedNodes.push(node);
    }
  }

  // Find modified nodes
  for (const [name, nodeA] of Array.from(nodesAByName.entries())) {
    const nodeB = nodesBByName.get(name);
    if (nodeB) {
      const changes = compareNodeProperties(nodeA, nodeB);
      if (changes.length > 0) {
        modifiedNodes.push({
          nodeId: nodeB.id,
          nodeName: name,
          changes,
        });
      }
    }
  }

  // Compare edges
  const edgeKeyA = (e: Edge) => `${e.sourceNodeId}->${e.targetNodeId}:${e.protocol}`;
  const edgeKeyB = (e: Edge) => `${e.sourceNodeId}->${e.targetNodeId}:${e.protocol}`;

  const edgesAByKey = new Map(dataA.edges.map(e => [edgeKeyA(e), e]));
  const edgesBByKey = new Map(dataB.edges.map(e => [edgeKeyB(e), e]));

  const addedEdges: Edge[] = [];
  const removedEdges: Edge[] = [];
  const modifiedEdges: EdgeDiff[] = [];

  // Find added edges
  for (const [key, edge] of Array.from(edgesBByKey.entries())) {
    if (!edgesAByKey.has(key)) {
      addedEdges.push(edge);
    }
  }

  // Find removed edges
  for (const [key, edge] of Array.from(edgesAByKey.entries())) {
    if (!edgesBByKey.has(key)) {
      removedEdges.push(edge);
    }
  }

  // Find modified edges
  for (const [key, edgeA] of Array.from(edgesAByKey.entries())) {
    const edgeB = edgesBByKey.get(key);
    if (edgeB) {
      const changes = compareEdgeProperties(edgeA, edgeB);
      if (changes.length > 0) {
        const sourceNode = nodesBById.get(edgeB.sourceNodeId);
        const targetNode = nodesBById.get(edgeB.targetNodeId);
        modifiedEdges.push({
          edgeId: edgeB.id,
          sourceName: sourceNode?.name || edgeB.sourceNodeId,
          targetName: targetNode?.name || edgeB.targetNodeId,
          changes,
        });
      }
    }
  }

  // Find stale datasets in snapshot B
  const staleDatasets: TestDataSet[] = [];
  const thirtyDaysAgo = 30;

  for (const dataset of dataB.testDataSets) {
    const days = daysSince(dataset.lastRefreshDate);
    if (days === null || days > thirtyDaysAgo) {
      staleDatasets.push(dataset);
    }
  }

  return {
    snapshotA: snapshotAId,
    snapshotB: snapshotBId,
    addedNodes,
    removedNodes,
    modifiedNodes,
    addedEdges,
    removedEdges,
    modifiedEdges,
    staleDatasets,
  };
}

// Compare current state with latest snapshot
export async function detectDriftFromLatest(environmentId: string): Promise<DriftReport | null> {
  // Get the latest two snapshots
  const snapshots = await prisma.environmentSnapshot.findMany({
    where: { environmentId },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });

  if (snapshots.length < 2) {
    return null; // Need at least 2 snapshots to compare
  }

  return compareSnapshots(snapshots[1].id, snapshots[0].id);
}

// Helper function to compare node properties
function compareNodeProperties(nodeA: Node, nodeB: Node): PropertyChange[] {
  const changes: PropertyChange[] = [];
  const properties: (keyof Node)[] = ['type', 'owner', 'criticality'];

  for (const prop of properties) {
    if (nodeA[prop] !== nodeB[prop]) {
      changes.push({
        property: prop,
        oldValue: nodeA[prop],
        newValue: nodeB[prop],
      });
    }
  }

  return changes;
}

// Helper function to compare edge properties
function compareEdgeProperties(edgeA: Edge, edgeB: Edge): PropertyChange[] {
  const changes: PropertyChange[] = [];
  const properties: (keyof Edge)[] = ['port', 'pathOrTopic', 'confidenceScore'];

  for (const prop of properties) {
    if (edgeA[prop] !== edgeB[prop]) {
      changes.push({
        property: prop,
        oldValue: edgeA[prop],
        newValue: edgeB[prop],
      });
    }
  }

  // Check if confidence score dropped significantly
  if (edgeA.confidenceScore - edgeB.confidenceScore > 0.2) {
    changes.push({
      property: 'confidenceDropped',
      oldValue: edgeA.confidenceScore,
      newValue: edgeB.confidenceScore,
    });
  }

  return changes;
}

// Delete snapshot
export async function deleteSnapshot(id: string): Promise<void> {
  await prisma.environmentSnapshot.delete({
    where: { id },
  });
}
