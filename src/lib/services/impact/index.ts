// Nexorium Core - Impact Analysis Service
// Core business logic for dependency paths, blast radius, and stability analysis

import prisma from '@/lib/db';

export interface DependencyNode {
  id: string;
  name: string;
  componentName: string;
  depth: number;
  connectionType: string;
}

export interface DependencyPath {
  nodes: DependencyNode[];
  totalDepth: number;
}

export interface BlastRadiusResult {
  componentId: string;
  componentName: string;
  environmentId: string;
  environmentName: string;
  directDependents: Array<{
    id: string;
    name: string;
    connectionType: string;
  }>;
  indirectDependents: Array<{
    id: string;
    name: string;
    depth: number;
    path: string[];
  }>;
  totalImpactedCount: number;
  criticalPath: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface StabilityScore {
  environmentId: string;
  environmentName: string;
  overallScore: number; // 0-100
  factors: {
    componentStability: number;
    versionConsistency: number;
    connectionHealth: number;
    changeFrequency: number;
  };
  warnings: string[];
  recommendations: string[];
}

export interface EntryExitAnalysis {
  environmentId: string;
  environmentName: string;
  entryPoints: Array<{
    id: string;
    name: string;
    componentName: string;
    incomingConnections: number;
    protocols: string[];
  }>;
  exitPoints: Array<{
    id: string;
    name: string;
    componentName: string;
    outgoingConnections: number;
    protocols: string[];
  }>;
}

// Get entry and exit points for an environment
export async function getEntryExitPoints(
  environmentId: string
): Promise<EntryExitAnalysis> {
  const environment = await prisma.environment.findUnique({
    where: { id: environmentId },
    include: {
      componentInstances: {
        include: {
          component: true,
          incomingConnections: true,
          outgoingConnections: true,
        },
      },
      connections: true,
    },
  });

  if (!environment) {
    throw new Error('Environment not found');
  }

  // Entry points: components with incoming connections from outside or marked as entry
  const entryPoints = environment.componentInstances
    .filter((ci) => {
      // Check if this is the designated entry point
      if (environment.entryComponentInstanceId === ci.id) return true;
      // Or if it has incoming connections and no/few outgoing (gateway pattern)
      const inCount = ci.incomingConnections.length;
      const outCount = ci.outgoingConnections.length;
      return inCount > 0 && (outCount === 0 || inCount > outCount * 2);
    })
    .map((ci) => {
      const protocols = new Set(ci.incomingConnections.map((c) => c.protocolType));
      return {
        id: ci.id,
        name: ci.displayName ?? ci.component.name,
        componentName: ci.component.name,
        incomingConnections: ci.incomingConnections.length,
        protocols: Array.from(protocols),
      };
    });

  // Exit points: components with outgoing connections to outside or marked as exit
  const exitPoints = environment.componentInstances
    .filter((ci) => {
      if (environment.exitComponentInstanceId === ci.id) return true;
      const inCount = ci.incomingConnections.length;
      const outCount = ci.outgoingConnections.length;
      return outCount > 0 && (inCount === 0 || outCount > inCount * 2);
    })
    .map((ci) => {
      const protocols = new Set(ci.outgoingConnections.map((c) => c.protocolType));
      return {
        id: ci.id,
        name: ci.displayName ?? ci.component.name,
        componentName: ci.component.name,
        outgoingConnections: ci.outgoingConnections.length,
        protocols: Array.from(protocols),
      };
    });

  return {
    environmentId,
    environmentName: environment.name,
    entryPoints,
    exitPoints,
  };
}

// Calculate blast radius for a component
export async function calculateBlastRadius(
  componentInstanceId: string,
  maxDepth: number = 5
): Promise<BlastRadiusResult> {
  const componentInstance = await prisma.componentInstance.findUnique({
    where: { id: componentInstanceId },
    include: {
      component: true,
      environment: true,
      outgoingConnections: {
        include: {
          toComponentInstance: {
            include: { component: true },
          },
        },
      },
    },
  });

  if (!componentInstance) {
    throw new Error('Component instance not found');
  }

  const visited = new Set<string>();
  const directDependents: BlastRadiusResult['directDependents'] = [];
  const indirectDependents: BlastRadiusResult['indirectDependents'] = [];
  const queue: Array<{ id: string; depth: number; path: string[] }> = [];

  // Get direct dependents
  for (const conn of componentInstance.outgoingConnections) {
    const dep = conn.toComponentInstance;
    if (!visited.has(dep.id)) {
      visited.add(dep.id);
      directDependents.push({
        id: dep.id,
        name: dep.displayName ?? dep.component.name,
        connectionType: conn.protocolType,
      });
      queue.push({
        id: dep.id,
        depth: 1,
        path: [componentInstance.component.name, dep.component.name],
      });
    }
  }

  // BFS for indirect dependents
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth >= maxDepth) continue;

    const currentInstance = await prisma.componentInstance.findUnique({
      where: { id: current.id },
      include: {
        outgoingConnections: {
          include: {
            toComponentInstance: {
              include: { component: true },
            },
          },
        },
      },
    });

    if (!currentInstance) continue;

    for (const conn of currentInstance.outgoingConnections) {
      const dep = conn.toComponentInstance;
      if (!visited.has(dep.id)) {
        visited.add(dep.id);
        const newPath = [...current.path, dep.component.name];
        indirectDependents.push({
          id: dep.id,
          name: dep.displayName ?? dep.component.name,
          depth: current.depth + 1,
          path: newPath,
        });
        queue.push({
          id: dep.id,
          depth: current.depth + 1,
          path: newPath,
        });
      }
    }
  }

  const totalImpactedCount = directDependents.length + indirectDependents.length;

  // Determine risk level
  let riskLevel: BlastRadiusResult['riskLevel'];
  if (totalImpactedCount === 0) {
    riskLevel = 'low';
  } else if (totalImpactedCount <= 3) {
    riskLevel = 'medium';
  } else if (totalImpactedCount <= 10) {
    riskLevel = 'high';
  } else {
    riskLevel = 'critical';
  }

  // Find critical path (longest chain)
  const criticalPath =
    indirectDependents.length > 0
      ? indirectDependents.reduce((max, curr) =>
          curr.path.length > max.path.length ? curr : max
        ).path
      : directDependents.length > 0
      ? [componentInstance.component.name, directDependents[0].name]
      : [componentInstance.component.name];

  return {
    componentId: componentInstance.componentId,
    componentName: componentInstance.component.name,
    environmentId: componentInstance.environmentId,
    environmentName: componentInstance.environment.name,
    directDependents,
    indirectDependents,
    totalImpactedCount,
    criticalPath,
    riskLevel,
  };
}

// Calculate stability score for an environment
export async function calculateStabilityScore(
  environmentId: string
): Promise<StabilityScore> {
  const environment = await prisma.environment.findUnique({
    where: { id: environmentId },
    include: {
      componentInstances: {
        include: {
          component: true,
          deployedVersions: {
            orderBy: { capturedAt: 'desc' },
            take: 10,
          },
        },
      },
      connections: true,
      snapshots: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!environment) {
    throw new Error('Environment not found');
  }

  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Component stability (based on version changes)
  let versionChangeCount = 0;
  let totalVersions = 0;

  for (const ci of environment.componentInstances) {
    const versions = ci.deployedVersions;
    if (versions.length > 1) {
      const uniqueVersions = new Set(versions.map((v) => v.projectVersion));
      versionChangeCount += uniqueVersions.size - 1;
    }
    totalVersions += versions.length;
  }

  const componentStability = Math.max(
    0,
    100 - (versionChangeCount / Math.max(totalVersions, 1)) * 100
  );

  if (versionChangeCount > 5) {
    warnings.push('High number of version changes detected');
    recommendations.push('Consider stabilizing component versions');
  }

  // Version consistency (are all instances of same component at same version?)
  const componentVersions = new Map<string, Set<string>>();
  for (const ci of environment.componentInstances) {
    const version = ci.deployedVersions[0]?.projectVersion ?? 'unknown';
    const versions = componentVersions.get(ci.componentId) ?? new Set();
    versions.add(version);
    componentVersions.set(ci.componentId, versions);
  }

  let inconsistentComponents = 0;
  for (const [, versions] of Array.from(componentVersions.entries())) {
    if (versions.size > 1) {
      inconsistentComponents++;
    }
  }

  const versionConsistency = Math.max(
    0,
    100 - (inconsistentComponents / Math.max(environment.componentInstances.length, 1)) * 100
  );

  if (inconsistentComponents > 0) {
    warnings.push(`${inconsistentComponents} components have version inconsistencies`);
  }

  // Connection health (based on connection count and patterns)
  const avgConnections =
    environment.connections.length / Math.max(environment.componentInstances.length, 1);
  const connectionHealth = Math.min(100, avgConnections * 20);

  if (avgConnections < 1) {
    warnings.push('Low connectivity between components');
    recommendations.push('Verify all required integrations are mapped');
  }

  // Change frequency (based on snapshots)
  const snapshotCount = environment.snapshots.length;
  const changeFrequency = Math.max(0, 100 - snapshotCount * 5);

  if (snapshotCount > 10) {
    warnings.push('High number of recent changes');
    recommendations.push('Consider a change freeze period');
  }

  // Calculate overall score
  const overallScore = Math.round(
    componentStability * 0.3 +
      versionConsistency * 0.3 +
      connectionHealth * 0.2 +
      changeFrequency * 0.2
  );

  return {
    environmentId,
    environmentName: environment.name,
    overallScore,
    factors: {
      componentStability: Math.round(componentStability),
      versionConsistency: Math.round(versionConsistency),
      connectionHealth: Math.round(connectionHealth),
      changeFrequency: Math.round(changeFrequency),
    },
    warnings,
    recommendations,
  };
}

// Get dependency paths between two components
export async function getDependencyPaths(
  fromComponentInstanceId: string,
  toComponentInstanceId: string,
  maxDepth: number = 6
): Promise<DependencyPath[]> {
  const paths: DependencyPath[] = [];
  const visited = new Set<string>();

  async function dfs(
    currentId: string,
    targetId: string,
    currentPath: DependencyNode[],
    depth: number
  ): Promise<void> {
    if (depth > maxDepth) return;
    if (currentId === targetId) {
      paths.push({
        nodes: [...currentPath],
        totalDepth: depth,
      });
      return;
    }

    if (visited.has(currentId)) return;
    visited.add(currentId);

    const instance = await prisma.componentInstance.findUnique({
      where: { id: currentId },
      include: {
        outgoingConnections: {
          include: {
            toComponentInstance: {
              include: { component: true },
            },
          },
        },
      },
    });

    if (!instance) return;

    for (const conn of instance.outgoingConnections) {
      const next = conn.toComponentInstance;
      const nextNode: DependencyNode = {
        id: next.id,
        name: next.displayName ?? next.component.name,
        componentName: next.component.name,
        depth: depth + 1,
        connectionType: conn.protocolType,
      };

      await dfs(next.id, targetId, [...currentPath, nextNode], depth + 1);
    }

    visited.delete(currentId);
  }

  const startInstance = await prisma.componentInstance.findUnique({
    where: { id: fromComponentInstanceId },
    include: { component: true },
  });

  if (!startInstance) {
    throw new Error('Source component instance not found');
  }

  const startNode: DependencyNode = {
    id: startInstance.id,
    name: startInstance.displayName ?? startInstance.component.name,
    componentName: startInstance.component.name,
    depth: 0,
    connectionType: 'start',
  };

  await dfs(fromComponentInstanceId, toComponentInstanceId, [startNode], 0);

  return paths.sort((a, b) => a.totalDepth - b.totalDepth);
}

// Detect changes between snapshots
export async function detectChanges(
  snapshotId1: string,
  snapshotId2: string
): Promise<{
  added: string[];
  removed: string[];
  modified: Array<{ name: string; field: string; oldValue: string; newValue: string }>;
}> {
  const [snapshot1, snapshot2] = await Promise.all([
    prisma.environmentSnapshot.findUnique({ where: { id: snapshotId1 } }),
    prisma.environmentSnapshot.findUnique({ where: { id: snapshotId2 } }),
  ]);

  if (!snapshot1 || !snapshot2) {
    throw new Error('One or both snapshots not found');
  }

  const data1 = snapshot1.snapshotData as {
    components?: Array<{ id: string; name: string; version?: string }>;
  };
  const data2 = snapshot2.snapshotData as {
    components?: Array<{ id: string; name: string; version?: string }>;
  };

  const map1 = new Map((data1.components ?? []).map((c) => [c.id, c]));
  const map2 = new Map((data2.components ?? []).map((c) => [c.id, c]));

  const added: string[] = [];
  const removed: string[] = [];
  const modified: Array<{ name: string; field: string; oldValue: string; newValue: string }> = [];

  // Find added and modified
  for (const [id, comp2] of Array.from(map2.entries())) {
    const comp1 = map1.get(id);
    if (!comp1) {
      added.push(comp2.name);
    } else if (comp1.version !== comp2.version) {
      modified.push({
        name: comp2.name,
        field: 'version',
        oldValue: comp1.version ?? 'unknown',
        newValue: comp2.version ?? 'unknown',
      });
    }
  }

  // Find removed
  for (const [id, comp1] of Array.from(map1.entries())) {
    if (!map2.has(id)) {
      removed.push(comp1.name);
    }
  }

  return { added, removed, modified };
}
