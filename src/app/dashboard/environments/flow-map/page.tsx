'use client';

// TelEnvIQ - Flow Map Page (Premium Portfolio Change Intelligence View)
// Strategic visualization showing how projects flow through environments

import { useState, useCallback, useMemo } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { cn } from '@/lib/utils';
import {
  FlowMapCanvas,
  FlowMapFiltersPanel,
  FlowMapIntelligencePanel,
} from '@/components/flow-map';
import type {
  FlowNode,
  FlowEdge,
  FlowMapFilters,
  Collision,
  IntelligenceContext,
} from '@/types/flow-map';
import {
  FLOW_MAP_PROJECTS,
  FLOW_MAP_NODES,
  FLOW_MAP_EDGES,
  FLOW_MAP_COLLISIONS,
  FLOW_MAP_CONVERGENCES,
  PORTFOLIO_RISK_SUMMARY,
} from '@/lib/data/flow-map-fixtures';

// ============================================
// DEFAULT FILTERS
// ============================================

const defaultFilters: FlowMapFilters = {
  projects: [],
  systems: [],
  environments: [],
  riskLevels: [],
  minRiskScore: 0,
  dateRange: {
    start: new Date(),
    end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days forward
  },
  showActiveOnly: false,
  showCollisionsOnly: false,
  showEmergentLinks: false,
  nodeTypes: ['PROJECT', 'ENVIRONMENT', 'SYSTEM', 'EXTERNAL'],
  edgeTypes: ['PROMOTION', 'INTEGRATION', 'DEPENDENCY', 'SHARED_RESOURCE'],
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function FlowMapPage() {
  // State
  const [filters, setFilters] = useState<FlowMapFilters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [intelligenceOpen, setIntelligenceOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [intelligenceContext, setIntelligenceContext] = useState<IntelligenceContext | null>(null);

  // Derive options for filters
  const systemOptions = useMemo(() => {
    return FLOW_MAP_NODES
      .filter((n) => n.type === 'SYSTEM')
      .map((n) => ({ id: n.id, label: n.label }));
  }, []);

  const environmentOptions = useMemo(() => {
    return FLOW_MAP_NODES
      .filter((n) => n.type === 'ENVIRONMENT')
      .map((n) => ({ id: n.id, label: n.label }));
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((node: FlowNode) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);

    // Find related projects for this node
    const relatedProjects = FLOW_MAP_PROJECTS.filter((p) => {
      if (node.type === 'ENVIRONMENT') {
        return p.targetEnvironments.includes(node.id);
      }
      if (node.type === 'SYSTEM') {
        return p.affectedSystems.includes(node.id);
      }
      if (node.type === 'PROJECT') {
        return p.id === node.id;
      }
      return false;
    });

    // Find edges connected to this node
    const inboundEdges = FLOW_MAP_EDGES.filter((e) => e.toNodeId === node.id);
    const outboundEdges = FLOW_MAP_EDGES.filter((e) => e.fromNodeId === node.id);

    // Calculate risk indicators
    const riskIndicators = [];
    if (node.healthScore < 60) {
      riskIndicators.push({
        id: `risk-health-${node.id}`,
        nodeId: node.id,
        type: 'HEALTH_DEGRADATION' as const,
        score: 100 - node.healthScore,
        trend: 'INCREASING' as const,
        description: `Health score degraded to ${node.healthScore}%`,
      });
    }
    if (inboundEdges.length + outboundEdges.length > 8) {
      riskIndicators.push({
        id: `risk-density-${node.id}`,
        nodeId: node.id,
        type: 'DEPENDENCY_DENSITY' as const,
        score: Math.min(100, (inboundEdges.length + outboundEdges.length) * 8),
        trend: 'STABLE' as const,
        description: `High connectivity: ${inboundEdges.length + outboundEdges.length} connections`,
      });
    }

    // Find collisions affecting this node
    const affectingCollisions = FLOW_MAP_COLLISIONS.filter(
      (c) =>
        c.affectedProjects.includes(node.id) ||
        c.affectedEnvironments.includes(node.id) ||
        c.affectedSystems.includes(node.id)
    );

    if (affectingCollisions.length > 0) {
      riskIndicators.push({
        id: `risk-collision-${node.id}`,
        nodeId: node.id,
        type: 'COLLISION' as const,
        score: Math.max(...affectingCollisions.map((c) => c.probability * 100)),
        trend: 'STABLE' as const,
        description: `${affectingCollisions.length} active collision(s) detected`,
      });
    }

    // Upcoming promotions (for environments)
    const upcomingPromotions =
      node.type === 'ENVIRONMENT'
        ? FLOW_MAP_PROJECTS
            .filter(
              (p) =>
                p.status === 'ACTIVE' &&
                p.targetEnvironments.includes(node.id) &&
                p.endDate > new Date()
            )
            .slice(0, 3)
            .map((p) => ({
              projectId: p.id,
              projectName: p.name,
              scheduledDate: p.endDate,
            }))
        : undefined;

    // Capacity stress (for environments)
    const capacityStress =
      node.type === 'ENVIRONMENT' && node.metadata.utilization !== undefined
        ? {
            current: node.metadata.utilization,
            projected: Math.min(100, node.metadata.utilization + relatedProjects.length * 5),
            threshold: 85,
          }
        : undefined;

    setIntelligenceContext({
      type: 'NODE',
      entityId: node.id,
      nodeData: node,
      relatedProjects,
      inboundEdges,
      outboundEdges,
      riskIndicators,
      upcomingPromotions,
      capacityStress,
    });
  }, []);

  // Handle edge click
  const handleEdgeClick = useCallback((edge: FlowEdge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);

    // Find related projects
    const relatedProjects = edge.metadata.relatedProjects
      ? FLOW_MAP_PROJECTS.filter((p) => edge.metadata.relatedProjects?.includes(p.id))
      : [];

    setIntelligenceContext({
      type: 'EDGE',
      entityId: edge.id,
      relatedProjects,
    });
  }, []);

  // Handle collision click
  const handleCollisionClick = useCallback((collision: Collision) => {
    setIntelligenceContext({
      type: 'COLLISION',
      entityId: collision.id,
      collisionData: collision,
    });
  }, []);

  // Handle selection change
  const handleSelectionChange = useCallback((context: IntelligenceContext | null) => {
    if (!context) {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setIntelligenceContext({
        type: 'PORTFOLIO',
        entityId: null,
      });
    }
  }, []);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setIntelligenceContext({
      type: 'PORTFOLIO',
      entityId: null,
    });
  }, []);

  // Navigate to node
  const handleNavigateToNode = useCallback((nodeId: string) => {
    const node = FLOW_MAP_NODES.find((n) => n.id === nodeId);
    if (node) {
      handleNodeClick(node);
    }
  }, [handleNodeClick]);

  return (
    <div className="fixed inset-0 overflow-hidden premium-canvas-bg">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(139,92,246,0.08)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(6,182,212,0.06)_0%,transparent_50%)]" />

      {/* Main content */}
      <div className="relative w-full h-full">
        <ReactFlowProvider>
          {/* Filter panel */}
          <FlowMapFiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            projects={FLOW_MAP_PROJECTS}
            systemOptions={systemOptions}
            environmentOptions={environmentOptions}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen((prev) => !prev)}
          />

          {/* Canvas area */}
          <div
            className={cn(
              'absolute inset-0 transition-all duration-300',
              filtersOpen ? 'left-72' : 'left-0',
              intelligenceOpen ? 'right-80' : 'right-0'
            )}
          >
            <FlowMapCanvas
              nodes={FLOW_MAP_NODES}
              edges={FLOW_MAP_EDGES}
              projects={FLOW_MAP_PROJECTS}
              collisions={FLOW_MAP_COLLISIONS}
              convergences={FLOW_MAP_CONVERGENCES}
              filters={filters}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              onCollisionClick={handleCollisionClick}
              onSelectionChange={handleSelectionChange}
              onNavigateToNode={handleNavigateToNode}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
            />
          </div>

          {/* Intelligence panel */}
          <FlowMapIntelligencePanel
            isOpen={intelligenceOpen}
            onToggle={() => setIntelligenceOpen((prev) => !prev)}
            context={intelligenceContext}
            portfolioSummary={PORTFOLIO_RISK_SUMMARY}
            projects={FLOW_MAP_PROJECTS}
            onClearSelection={handleClearSelection}
            onNavigateToNode={handleNavigateToNode}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
