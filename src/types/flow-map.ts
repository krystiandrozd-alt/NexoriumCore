// Nexorium Core - Flow Map Types
// Portfolio Change Intelligence Data Model

// ============================================
// ENUMS AND CONSTANTS
// ============================================

export type FlowNodeType = 'PROJECT' | 'ENVIRONMENT' | 'SYSTEM' | 'EXTERNAL';
export type FlowEdgeType = 'PROMOTION' | 'INTEGRATION' | 'DEPENDENCY' | 'SHARED_RESOURCE';
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type ProjectStatus = 'ACTIVE' | 'PLANNED' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type NodeHealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';

// ============================================
// CORE ENTITIES
// ============================================

export interface Project {
  id: string;
  name: string;
  code: string;
  owner: string;
  team: string;
  status: ProjectStatus;
  riskLevel: RiskLevel;
  startDate: Date;
  endDate: Date;
  description?: string;
  targetEnvironments: string[]; // Environment IDs
  affectedSystems: string[]; // System IDs
  priority: number; // 1-5, 1 being highest
}

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  label: string;
  subLabel?: string;
  status: NodeHealthStatus;
  healthScore: number; // 0-100
  riskLevel: RiskLevel;
  metadata: FlowNodeMetadata;
}

export interface FlowNodeMetadata {
  // Common
  createdAt?: Date;
  updatedAt?: Date;

  // Project-specific
  owner?: string;
  team?: string;
  startDate?: Date;
  endDate?: Date;

  // Environment-specific
  environmentType?: string;
  capacity?: number;
  utilization?: number;

  // System-specific
  vendor?: string;
  version?: string;
  layer?: string;

  // External-specific
  externalType?: string;
  integrationCount?: number;
}

export interface FlowEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  flowType: FlowEdgeType;
  label?: string;
  riskScore: number; // 0-100
  collisionProbability: number; // 0-1
  isActive: boolean;
  isEmergent: boolean; // Dynamically discovered link
  metadata: FlowEdgeMetadata;
}

export interface FlowEdgeMetadata {
  protocol?: string;
  dataFlow?: 'UNIDIRECTIONAL' | 'BIDIRECTIONAL';
  frequency?: 'REALTIME' | 'BATCH' | 'ON_DEMAND';
  lastActivityAt?: Date;
  relatedProjects?: string[];
}

// ============================================
// COLLISION & CONVERGENCE
// ============================================

export interface Collision {
  id: string;
  type: 'ENVIRONMENT_CONFLICT' | 'TIMELINE_OVERLAP' | 'RESOURCE_CONTENTION' | 'INTEGRATION_CONFLICT';
  severity: RiskLevel;
  affectedProjects: string[];
  affectedEnvironments: string[];
  affectedSystems: string[];
  overlapStart: Date;
  overlapEnd: Date;
  probability: number; // 0-1
  description: string;
  suggestedAction: string;
}

export interface Convergence {
  id: string;
  type: 'SHARED_ENVIRONMENT' | 'SHARED_SYSTEM' | 'SHARED_INTEGRATION' | 'TIMELINE_CONVERGENCE';
  projects: string[];
  sharedResourceId: string;
  sharedResourceType: FlowNodeType;
  detectedAt: Date;
  riskLevel: RiskLevel;
  description: string;
  isNew: boolean; // Recently emerged
}

// ============================================
// RISK ANALYSIS
// ============================================

export interface RiskIndicator {
  id: string;
  nodeId: string;
  type: 'COLLISION' | 'DEPENDENCY_DENSITY' | 'HEALTH_DEGRADATION' | 'CAPACITY_STRESS' | 'TIMELINE_RISK';
  score: number; // 0-100
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  description: string;
}

export interface PortfolioRiskSummary {
  overallScore: number; // 0-100
  criticalCollisions: number;
  highRiskProjects: number;
  emergentConvergences: number;
  capacityStressedEnvironments: number;
  riskTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  topRisks: RiskIndicator[];
}

// ============================================
// FILTER STATE
// ============================================

export interface FlowMapFilters {
  // Entity filters
  projects: string[];
  systems: string[];
  environments: string[];

  // Risk filters
  riskLevels: RiskLevel[];
  minRiskScore: number;

  // Time filters
  dateRange: {
    start: Date;
    end: Date;
  };

  // View filters
  showActiveOnly: boolean;
  showCollisionsOnly: boolean;
  showEmergentLinks: boolean;
  nodeTypes: FlowNodeType[];
  edgeTypes: FlowEdgeType[];
}

// ============================================
// SELECTION STATE
// ============================================

export interface FlowMapSelection {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  hoveredNodeId: string | null;
  hoveredEdgeId: string | null;
}

// ============================================
// INTELLIGENCE PANEL
// ============================================

export interface IntelligenceContext {
  type: 'NODE' | 'EDGE' | 'COLLISION' | 'CONVERGENCE' | 'PORTFOLIO';
  entityId: string | null;

  // Node context
  nodeData?: FlowNode;
  relatedProjects?: Project[];
  inboundEdges?: FlowEdge[];
  outboundEdges?: FlowEdge[];
  riskIndicators?: RiskIndicator[];

  // Environment-specific
  upcomingPromotions?: {
    projectId: string;
    projectName: string;
    scheduledDate: Date;
  }[];
  capacityStress?: {
    current: number;
    projected: number;
    threshold: number;
  };

  // Collision context
  collisionData?: Collision;

  // Convergence context
  convergenceData?: Convergence;

  // Suggested actions
  suggestions?: {
    action: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    reasoning: string;
  }[];
}

// ============================================
// WHAT-IF SIMULATION
// ============================================

export interface WhatIfScenario {
  id: string;
  name: string;
  changes: WhatIfChange[];
  resultingCollisions: Collision[];
  resultingRiskDelta: number;
}

export interface WhatIfChange {
  type: 'TIMELINE_SHIFT' | 'ENVIRONMENT_CHANGE' | 'ADD_DEPENDENCY' | 'REMOVE_DEPENDENCY';
  projectId: string;
  oldValue: unknown;
  newValue: unknown;
}

// ============================================
// AI AGENT
// ============================================

export interface PortfolioInsight {
  id: string;
  type: 'COLLISION_EXPLANATION' | 'BOTTLENECK_PREDICTION' | 'RISK_SUMMARY' | 'HIDDEN_DEPENDENCY';
  title: string;
  content: string;
  confidence: number; // 0-1
  relatedEntities: string[];
  generatedAt: Date;
}
