// TelEnvIQ - Flow Map Analysis Utilities
// Collision detection, convergence detection, and risk scoring

import type {
  Project,
  FlowNode,
  FlowEdge,
  Collision,
  Convergence,
  RiskIndicator,
  PortfolioRiskSummary,
  RiskLevel,
  FlowNodeType,
} from '@/types/flow-map';

// ============================================
// COLLISION DETECTION
// ============================================

export interface CollisionDetectionResult {
  collisions: Collision[];
  highRiskNodes: string[];
  affectedProjects: string[];
}

export function detectCollisions(
  projects: Project[],
  _nodes: FlowNode[],
  _edges: FlowEdge[]
): CollisionDetectionResult {
  const collisions: Collision[] = [];
  const highRiskNodes = new Set<string>();
  const affectedProjects = new Set<string>();

  // Group projects by target environment
  const envProjectMap = new Map<string, Project[]>();
  projects.forEach((project) => {
    if (project.status !== 'ACTIVE' && project.status !== 'PLANNED') return;

    project.targetEnvironments.forEach((envId) => {
      const existing = envProjectMap.get(envId) || [];
      existing.push(project);
      envProjectMap.set(envId, existing);
    });
  });

  // Detect environment conflicts
  envProjectMap.forEach((envProjects, envId) => {
    if (envProjects.length < 2) return;

    // Find overlapping time windows
    const overlaps = findTimelineOverlaps(envProjects);

    overlaps.forEach((overlap) => {
      if (overlap.projects.length < 2) return;

      const severity = calculateCollisionSeverity(overlap.projects);
      const affectedSystems = getAffectedSystems(overlap.projects);

      const collision: Collision = {
        id: `collision-auto-${envId}-${Date.now()}`,
        type: 'ENVIRONMENT_CONFLICT',
        severity,
        affectedProjects: overlap.projects.map((p) => p.id),
        affectedEnvironments: [envId],
        affectedSystems,
        overlapStart: overlap.start,
        overlapEnd: overlap.end,
        probability: calculateCollisionProbability(overlap.projects, envId),
        description: generateCollisionDescription(overlap.projects, envId),
        suggestedAction: generateSuggestedAction(overlap.projects, severity),
      };

      collisions.push(collision);
      highRiskNodes.add(envId);
      overlap.projects.forEach((p) => affectedProjects.add(p.id));
    });
  });

  // Detect system conflicts
  const systemProjectMap = new Map<string, Project[]>();
  projects.forEach((project) => {
    if (project.status !== 'ACTIVE' && project.status !== 'PLANNED') return;

    project.affectedSystems.forEach((sysId) => {
      const existing = systemProjectMap.get(sysId) || [];
      existing.push(project);
      systemProjectMap.set(sysId, existing);
    });
  });

  systemProjectMap.forEach((sysProjects, sysId) => {
    if (sysProjects.length < 3) return; // Higher threshold for system conflicts

    const overlaps = findTimelineOverlaps(sysProjects);

    overlaps.forEach((overlap) => {
      if (overlap.projects.length < 3) return;

      // Check if there's a critical project
      const hasCritical = overlap.projects.some((p) => p.riskLevel === 'CRITICAL');
      if (!hasCritical) return;

      const severity = calculateCollisionSeverity(overlap.projects);
      const affectedEnvs = getAffectedEnvironments(overlap.projects);

      const collision: Collision = {
        id: `collision-auto-sys-${sysId}-${Date.now()}`,
        type: 'RESOURCE_CONTENTION',
        severity,
        affectedProjects: overlap.projects.map((p) => p.id),
        affectedEnvironments: affectedEnvs,
        affectedSystems: [sysId],
        overlapStart: overlap.start,
        overlapEnd: overlap.end,
        probability: calculateCollisionProbability(overlap.projects, sysId) * 0.8,
        description: `${overlap.projects.length} projects competing for ${sysId} resources`,
        suggestedAction: 'Coordinate changes through change advisory board',
      };

      collisions.push(collision);
      highRiskNodes.add(sysId);
      overlap.projects.forEach((p) => affectedProjects.add(p.id));
    });
  });

  return {
    collisions,
    highRiskNodes: Array.from(highRiskNodes),
    affectedProjects: Array.from(affectedProjects),
  };
}

interface TimelineOverlap {
  projects: Project[];
  start: Date;
  end: Date;
}

function findTimelineOverlaps(projects: Project[]): TimelineOverlap[] {
  if (projects.length < 2) return [];

  const overlaps: TimelineOverlap[] = [];

  // Sort by start date
  const sorted = [...projects].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // Find overlapping groups
  let currentGroup: Project[] = [sorted[0]];
  let currentEnd = sorted[0].endDate;

  for (let i = 1; i < sorted.length; i++) {
    const project = sorted[i];

    if (project.startDate <= currentEnd) {
      // Overlaps with current group
      currentGroup.push(project);
      currentEnd = new Date(Math.max(currentEnd.getTime(), project.endDate.getTime()));
    } else {
      // New group
      if (currentGroup.length >= 2) {
        const overlapStart = new Date(
          Math.max(...currentGroup.map((p) => p.startDate.getTime()))
        );
        const overlapEnd = new Date(
          Math.min(...currentGroup.map((p) => p.endDate.getTime()))
        );

        if (overlapStart < overlapEnd) {
          overlaps.push({
            projects: currentGroup,
            start: overlapStart,
            end: overlapEnd,
          });
        }
      }

      currentGroup = [project];
      currentEnd = project.endDate;
    }
  }

  // Don't forget the last group
  if (currentGroup.length >= 2) {
    const overlapStart = new Date(
      Math.max(...currentGroup.map((p) => p.startDate.getTime()))
    );
    const overlapEnd = new Date(
      Math.min(...currentGroup.map((p) => p.endDate.getTime()))
    );

    if (overlapStart < overlapEnd) {
      overlaps.push({
        projects: currentGroup,
        start: overlapStart,
        end: overlapEnd,
      });
    }
  }

  return overlaps;
}

function calculateCollisionSeverity(projects: Project[]): RiskLevel {
  const criticalCount = projects.filter((p) => p.riskLevel === 'CRITICAL').length;
  const highCount = projects.filter((p) => p.riskLevel === 'HIGH').length;

  if (criticalCount >= 2 || (criticalCount >= 1 && highCount >= 2)) return 'CRITICAL';
  if (criticalCount >= 1 || highCount >= 2) return 'HIGH';
  if (highCount >= 1 || projects.length >= 4) return 'MEDIUM';
  return 'LOW';
}

function calculateCollisionProbability(projects: Project[], _resourceId: string): number {
  const criticalCount = projects.filter((p) => p.riskLevel === 'CRITICAL').length;
  const highCount = projects.filter((p) => p.riskLevel === 'HIGH').length;

  let baseProbability = 0.3 + projects.length * 0.1;
  baseProbability += criticalCount * 0.15;
  baseProbability += highCount * 0.08;

  return Math.min(0.95, baseProbability);
}

function getAffectedSystems(projects: Project[]): string[] {
  const systems = new Set<string>();
  projects.forEach((p) => p.affectedSystems.forEach((s) => systems.add(s)));
  return Array.from(systems);
}

function getAffectedEnvironments(projects: Project[]): string[] {
  const envs = new Set<string>();
  projects.forEach((p) => p.targetEnvironments.forEach((e) => envs.add(e)));
  return Array.from(envs);
}

function generateCollisionDescription(projects: Project[], envId: string): string {
  const criticalProjects = projects.filter((p) => p.riskLevel === 'CRITICAL');
  const highProjects = projects.filter((p) => p.riskLevel === 'HIGH');

  if (criticalProjects.length > 0) {
    return `Critical collision: ${criticalProjects.map((p) => p.name).join(', ')} competing for ${envId}`;
  }

  if (highProjects.length >= 2) {
    return `High-risk collision: ${projects.length} projects competing for ${envId} resources`;
  }

  return `${projects.length} projects overlapping in ${envId}`;
}

function generateSuggestedAction(projects: Project[], severity: RiskLevel): string {
  switch (severity) {
    case 'CRITICAL':
      return 'Escalate to steering committee. Consider project re-sequencing or additional environment allocation.';
    case 'HIGH':
      return 'Coordinate deployment windows. Establish clear rollback procedures.';
    case 'MEDIUM':
      return 'Align testing schedules between project teams.';
    default:
      return 'Monitor and communicate between teams.';
  }
}

// ============================================
// CONVERGENCE DETECTION
// ============================================

export interface ConvergenceDetectionResult {
  convergences: Convergence[];
  emergentLinks: string[];
}

export function detectConvergences(
  projects: Project[],
  nodes: FlowNode[],
  existingConvergences: Convergence[] = []
): ConvergenceDetectionResult {
  const convergences: Convergence[] = [];
  const emergentLinks: string[] = [];
  const existingIds = new Set(existingConvergences.map((c) => c.id));

  const now = new Date();

  // Detect environment convergences
  const envMap = new Map<string, Project[]>();
  projects.forEach((project) => {
    if (project.status !== 'ACTIVE') return;

    project.targetEnvironments.forEach((envId) => {
      const existing = envMap.get(envId) || [];
      existing.push(project);
      envMap.set(envId, existing);
    });
  });

  envMap.forEach((envProjects, envId) => {
    if (envProjects.length < 4) return; // Threshold for convergence

    const convId = `conv-env-${envId}`;
    const isNew = !existingIds.has(convId);

    convergences.push({
      id: convId,
      type: 'SHARED_ENVIRONMENT',
      projects: envProjects.map((p) => p.id),
      sharedResourceId: envId,
      sharedResourceType: 'ENVIRONMENT',
      detectedAt: isNew ? now : existingConvergences.find((c) => c.id === convId)?.detectedAt || now,
      riskLevel: envProjects.length >= 8 ? 'CRITICAL' : envProjects.length >= 6 ? 'HIGH' : 'MEDIUM',
      description: `${envProjects.length} projects converging on ${envId}`,
      isNew,
    });

    if (isNew) emergentLinks.push(envId);
  });

  // Detect system convergences
  const sysMap = new Map<string, Project[]>();
  projects.forEach((project) => {
    if (project.status !== 'ACTIVE') return;

    project.affectedSystems.forEach((sysId) => {
      const existing = sysMap.get(sysId) || [];
      existing.push(project);
      sysMap.set(sysId, existing);
    });
  });

  sysMap.forEach((sysProjects, sysId) => {
    if (sysProjects.length < 3) return;

    // Check if projects are from different teams (true convergence)
    const teams = new Set(sysProjects.map((p) => p.team));
    if (teams.size < 2) return;

    const convId = `conv-sys-${sysId}`;
    const isNew = !existingIds.has(convId);

    convergences.push({
      id: convId,
      type: 'SHARED_SYSTEM',
      projects: sysProjects.map((p) => p.id),
      sharedResourceId: sysId,
      sharedResourceType: 'SYSTEM',
      detectedAt: isNew ? now : existingConvergences.find((c) => c.id === convId)?.detectedAt || now,
      riskLevel: sysProjects.length >= 5 ? 'HIGH' : 'MEDIUM',
      description: `${sysProjects.length} projects from ${teams.size} teams affecting ${sysId}`,
      isNew,
    });

    if (isNew) emergentLinks.push(sysId);
  });

  return { convergences, emergentLinks };
}

// ============================================
// RISK SCORING
// ============================================

export interface RiskScoreComponents {
  collisionRisk: number;
  dependencyDensity: number;
  healthDegradation: number;
  capacityStress: number;
  timelineRisk: number;
}

export function calculateNodeRiskScore(
  nodeId: string,
  nodes: FlowNode[],
  edges: FlowEdge[],
  collisions: Collision[]
): { score: number; components: RiskScoreComponents; indicators: RiskIndicator[] } {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) {
    return {
      score: 0,
      components: {
        collisionRisk: 0,
        dependencyDensity: 0,
        healthDegradation: 0,
        capacityStress: 0,
        timelineRisk: 0,
      },
      indicators: [],
    };
  }

  const indicators: RiskIndicator[] = [];

  // 1. Collision Risk (0-100)
  const nodeCollisions = collisions.filter(
    (c) =>
      c.affectedEnvironments.includes(nodeId) ||
      c.affectedSystems.includes(nodeId) ||
      c.affectedProjects.includes(nodeId)
  );

  const collisionRisk = Math.min(100, nodeCollisions.length * 25 +
    nodeCollisions.filter((c) => c.severity === 'CRITICAL').length * 30 +
    nodeCollisions.filter((c) => c.severity === 'HIGH').length * 15);

  if (collisionRisk > 50) {
    indicators.push({
      id: `risk-collision-${nodeId}`,
      nodeId,
      type: 'COLLISION',
      score: collisionRisk,
      trend: 'INCREASING',
      description: `${nodeCollisions.length} active collisions affecting this node`,
    });
  }

  // 2. Dependency Density (0-100)
  const inboundEdges = edges.filter((e) => e.toNodeId === nodeId);
  const outboundEdges = edges.filter((e) => e.fromNodeId === nodeId);
  const totalConnections = inboundEdges.length + outboundEdges.length;

  const dependencyDensity = Math.min(100, totalConnections * 5);

  if (dependencyDensity > 60) {
    indicators.push({
      id: `risk-deps-${nodeId}`,
      nodeId,
      type: 'DEPENDENCY_DENSITY',
      score: dependencyDensity,
      trend: 'STABLE',
      description: `${totalConnections} connections make this a critical path node`,
    });
  }

  // 3. Health Degradation (0-100)
  const healthDegradation = 100 - node.healthScore;

  if (healthDegradation > 30) {
    indicators.push({
      id: `risk-health-${nodeId}`,
      nodeId,
      type: 'HEALTH_DEGRADATION',
      score: healthDegradation,
      trend: node.status === 'CRITICAL' ? 'INCREASING' : 'STABLE',
      description: `Health score at ${node.healthScore}% - ${node.status.toLowerCase()} status`,
    });
  }

  // 4. Capacity Stress (0-100) - only for environments
  let capacityStress = 0;
  if (node.type === 'ENVIRONMENT' && node.metadata.utilization) {
    capacityStress = node.metadata.utilization;

    if (capacityStress > 70) {
      indicators.push({
        id: `risk-capacity-${nodeId}`,
        nodeId,
        type: 'CAPACITY_STRESS',
        score: capacityStress,
        trend: capacityStress > 85 ? 'INCREASING' : 'STABLE',
        description: `${capacityStress}% capacity utilization`,
      });
    }
  }

  // 5. Timeline Risk (0-100)
  const activeEdges = edges.filter(
    (e) => e.isActive && (e.fromNodeId === nodeId || e.toNodeId === nodeId)
  );
  const highRiskEdges = activeEdges.filter((e) => e.collisionProbability > 0.5);
  const timelineRisk = Math.min(100, highRiskEdges.length * 20);

  if (timelineRisk > 40) {
    indicators.push({
      id: `risk-timeline-${nodeId}`,
      nodeId,
      type: 'TIMELINE_RISK',
      score: timelineRisk,
      trend: 'STABLE',
      description: `${highRiskEdges.length} high-probability collision paths`,
    });
  }

  // Calculate weighted overall score
  const weights = {
    collisionRisk: 0.35,
    dependencyDensity: 0.15,
    healthDegradation: 0.25,
    capacityStress: 0.15,
    timelineRisk: 0.10,
  };

  const score = Math.round(
    collisionRisk * weights.collisionRisk +
    dependencyDensity * weights.dependencyDensity +
    healthDegradation * weights.healthDegradation +
    capacityStress * weights.capacityStress +
    timelineRisk * weights.timelineRisk
  );

  return {
    score,
    components: {
      collisionRisk,
      dependencyDensity,
      healthDegradation,
      capacityStress,
      timelineRisk,
    },
    indicators,
  };
}

export function calculatePortfolioRiskSummary(
  projects: Project[],
  nodes: FlowNode[],
  edges: FlowEdge[],
  collisions: Collision[],
  convergences: Convergence[]
): PortfolioRiskSummary {
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE');
  const highRiskProjects = activeProjects.filter(
    (p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH'
  ).length;

  const criticalCollisions = collisions.filter((c) => c.severity === 'CRITICAL').length;
  const emergentConvergences = convergences.filter((c) => c.isNew).length;

  const environments = nodes.filter((n) => n.type === 'ENVIRONMENT');
  const capacityStressedEnvironments = environments.filter(
    (e) => e.metadata.utilization && e.metadata.utilization > 80
  ).length;

  // Calculate overall portfolio risk
  const nodeRisks = nodes.map((n) =>
    calculateNodeRiskScore(n.id, nodes, edges, collisions).score
  );
  const avgRisk = nodeRisks.reduce((a, b) => a + b, 0) / nodeRisks.length;

  // Collect top risks
  const allIndicators: RiskIndicator[] = [];
  nodes.forEach((n) => {
    const { indicators } = calculateNodeRiskScore(n.id, nodes, edges, collisions);
    allIndicators.push(...indicators);
  });

  const topRisks = allIndicators
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Determine trend
  const criticalNodes = nodes.filter((n) => n.status === 'CRITICAL').length;
  const warningNodes = nodes.filter((n) => n.status === 'WARNING').length;
  const riskTrend: 'INCREASING' | 'STABLE' | 'DECREASING' =
    criticalNodes > 2 || emergentConvergences > 2
      ? 'INCREASING'
      : criticalCollisions === 0 && warningNodes < 3
      ? 'DECREASING'
      : 'STABLE';

  return {
    overallScore: Math.round(avgRisk),
    criticalCollisions,
    highRiskProjects,
    emergentConvergences,
    capacityStressedEnvironments,
    riskTrend,
    topRisks,
  };
}

// ============================================
// FILTERING
// ============================================

export function filterNodes(
  nodes: FlowNode[],
  edges: FlowEdge[],
  filters: {
    projects?: string[];
    systems?: string[];
    environments?: string[];
    riskLevels?: RiskLevel[];
    nodeTypes?: FlowNodeType[];
    showActiveOnly?: boolean;
  }
): { filteredNodes: FlowNode[]; filteredEdges: FlowEdge[] } {
  let filteredNodes = [...nodes];

  // Filter by node type
  if (filters.nodeTypes && filters.nodeTypes.length > 0) {
    filteredNodes = filteredNodes.filter((n) => filters.nodeTypes!.includes(n.type));
  }

  // Filter by risk level
  if (filters.riskLevels && filters.riskLevels.length > 0) {
    filteredNodes = filteredNodes.filter((n) => filters.riskLevels!.includes(n.riskLevel));
  }

  // Filter by specific IDs
  if (filters.projects && filters.projects.length > 0) {
    filteredNodes = filteredNodes.filter(
      (n) => n.type !== 'PROJECT' || filters.projects!.includes(n.id)
    );
  }

  if (filters.systems && filters.systems.length > 0) {
    filteredNodes = filteredNodes.filter(
      (n) => n.type !== 'SYSTEM' || filters.systems!.includes(n.id)
    );
  }

  if (filters.environments && filters.environments.length > 0) {
    filteredNodes = filteredNodes.filter(
      (n) => n.type !== 'ENVIRONMENT' || filters.environments!.includes(n.id)
    );
  }

  // Get IDs of filtered nodes
  const nodeIds = new Set(filteredNodes.map((n) => n.id));

  // Filter edges to only include those connecting filtered nodes
  let filteredEdges = edges.filter(
    (e) => nodeIds.has(e.fromNodeId) && nodeIds.has(e.toNodeId)
  );

  // Filter by active only
  if (filters.showActiveOnly) {
    filteredEdges = filteredEdges.filter((e) => e.isActive);
  }

  return { filteredNodes, filteredEdges };
}

// ============================================
// WHAT-IF SIMULATION
// ============================================

export function simulateTimelineShift(
  project: Project,
  daysDelta: number,
  allProjects: Project[],
  nodes: FlowNode[],
  edges: FlowEdge[]
): { newCollisions: Collision[]; riskDelta: number } {
  // Create modified project
  const modifiedProject: Project = {
    ...project,
    startDate: new Date(project.startDate.getTime() + daysDelta * 24 * 60 * 60 * 1000),
    endDate: new Date(project.endDate.getTime() + daysDelta * 24 * 60 * 60 * 1000),
  };

  // Create modified project list
  const modifiedProjects = allProjects.map((p) =>
    p.id === project.id ? modifiedProject : p
  );

  // Detect collisions with modified timeline
  const { collisions: newCollisions } = detectCollisions(modifiedProjects, nodes, edges);

  // Calculate original risk
  const { collisions: originalCollisions } = detectCollisions(allProjects, nodes, edges);
  const originalRiskSummary = calculatePortfolioRiskSummary(
    allProjects,
    nodes,
    edges,
    originalCollisions,
    []
  );

  // Calculate new risk
  const newRiskSummary = calculatePortfolioRiskSummary(
    modifiedProjects,
    nodes,
    edges,
    newCollisions,
    []
  );

  const riskDelta = newRiskSummary.overallScore - originalRiskSummary.overallScore;

  return { newCollisions, riskDelta };
}
