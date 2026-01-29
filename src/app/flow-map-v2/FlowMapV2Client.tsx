'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  GraphComponent,
  GraphEditorInputMode,
  GraphOverviewComponent,
  HierarchicalLayout,
  OrganicLayout,
  EdgeRouter,
  LayoutExecutor,
  License,
  ShapeNodeStyle,
  PolylineEdgeStyle,
  Arrow,
  ArrowType,
  LabelStyle,
  Size,
  Insets,
  LayoutOrientation,
  GraphItemTypes,
  type INode,
  type IEdge,
  Rect,
  Point,
  ExteriorNodeLabelModel,
  FreeEdgeLabelModel,
  OrthogonalEdgeEditingContext,
  GraphSnapContext,
  GridSnapTypes,
} from '@yfiles/yfiles';

import {
  type NodeTag,
  type EdgeTag,
  type IntegrationProtocol,
  type IntegrationDirection,
  type IntegrationPattern,
  type IntegrationTransport,
  type IntegrationAuth,
  type IntegrationFilters,
  type LayoutMode,
  PROTOCOL_STYLES,
  PATTERN_STYLES,
  DIRECTION_LABELS,
  LAYOUT_MODE_CONFIG,
  DEFAULT_FILTERS,
  generateIntegrationId,
  getProtocolStyle,
  getDefaultPattern,
  getDefaultTransport,
} from '@/types/flow-map-v2-integration';

import { domainColors, sampleL1Data, stageColors } from '@/lib/flowmap/flowMapDataV2';

// Health & Status integration
import {
  useHealthStatusStore,
  STATUS_CONFIG,
  SIGNAL_SOURCE_CONFIG,
  getRelativeTime,
  type StatusDecision,
  type Signal,
} from '@/modules/health-status';
import type { FlowMapDomain, FlowMapStageKey } from '@/types/flow-map-v2';

// Load yFiles license
import licenseData from '../../../yFiles-for-HTML-Complete-3.0.0.4-Evaluation/lib/license.json';
License.value = licenseData;

// ============================================
// CONSTANTS
// ============================================

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 900;
const LANE_HEADER_WIDTH = 100;
const EXTERNAL_COLUMN_WIDTH = 180;
const STORAGE_KEY = 'nexorium-flowmap-v2-';

// Domain lanes configuration
const DOMAIN_LANES: { domain: FlowMapDomain; label: string; color: string }[] = [
  { domain: 'CHANNELS', label: 'Channels', color: domainColors.CHANNELS },
  { domain: 'BSS', label: 'BSS', color: domainColors.BSS },
  { domain: 'OSS', label: 'OSS', color: domainColors.OSS },
  { domain: 'NETWORK', label: 'Network', color: domainColors.NETWORK },
];

const MAIN_AREA_WIDTH = CANVAS_WIDTH - LANE_HEADER_WIDTH - EXTERNAL_COLUMN_WIDTH;
const LANE_HEIGHT = CANVAS_HEIGHT / DOMAIN_LANES.length;

// ============================================
// HELPER FUNCTIONS
// ============================================

function getLaneBounds(domain: FlowMapDomain): { x: number; y: number; width: number; height: number } {
  if (domain === 'EXTERNAL') {
    return { x: LANE_HEADER_WIDTH + MAIN_AREA_WIDTH, y: 0, width: EXTERNAL_COLUMN_WIDTH, height: CANVAS_HEIGHT };
  }
  const idx = DOMAIN_LANES.findIndex(l => l.domain === domain);
  if (idx === -1) return { x: LANE_HEADER_WIDTH, y: LANE_HEIGHT, width: MAIN_AREA_WIDTH, height: LANE_HEIGHT };
  return { x: LANE_HEADER_WIDTH, y: idx * LANE_HEIGHT, width: MAIN_AREA_WIDTH, height: LANE_HEIGHT };
}

function getStatusColor(status: NodeTag['status']): string {
  switch (status) {
    case 'healthy': return '#22c55e';
    case 'warning': return '#f59e0b';
    case 'critical': return '#ef4444';
    default: return '#64748b';
  }
}

// ============================================
// DEMO DATA CONVERTER
// ============================================

function convertToV2Data(envId: string): { nodes: NodeTag[]; edges: EdgeTag[] } {
  const data = sampleL1Data[envId];
  if (!data) return { nodes: [], edges: [] };

  const nodes: NodeTag[] = data.nodes.map(n => ({
    id: n.id,
    name: n.name,
    domain: n.domain,
    systemType: n.type,
    environment: data.stageKey,
    hostname: n.hostname,
    ip: n.ip,
    subnet: n.subnet,
    vendor: n.vendor,
    version: n.version,
    notes: n.description,
    status: n.status,
  }));

  const edges: EdgeTag[] = data.edges.map(e => {
    // Determine protocol from old type
    let protocol: IntegrationProtocol = 'OTHER';
    if (e.type === 'API') protocol = 'REST';
    else if (e.type === 'EVENT') protocol = 'EVENTS';
    else if (e.type === 'DB') protocol = 'DB';
    else if (e.type === 'FILE') protocol = 'FILE';

    return {
      id: e.id,
      fromSystemId: e.sourceId,
      toSystemId: e.targetId,
      direction: 'A_TO_B' as IntegrationDirection,
      protocol,
      pattern: getDefaultPattern(protocol),
      transport: getDefaultTransport(protocol),
      auth: 'NONE' as IntegrationAuth,
      contractName: e.label,
    };
  });

  return { nodes, edges };
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function FlowMapV2Client() {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const gcRef = useRef<GraphComponent | null>(null);
  const overviewGcRef = useRef<GraphOverviewComponent | null>(null);
  const nodeMapRef = useRef<Map<string, INode>>(new Map());
  const edgeMapRef = useRef<Map<string, IEdge>>(new Map());
  const edgeRouterRef = useRef<EdgeRouter | null>(null);

  // State
  const [selectedEnvId, setSelectedEnvId] = useState('env-sit');
  const [nodes, setNodes] = useState<NodeTag[]>([]);
  const [edges, setEdges] = useState<EdgeTag[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeTag | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<EdgeTag | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('swimlane');
  const [filters, setFilters] = useState<IntegrationFilters>(DEFAULT_FILTERS);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(true);

  // Phase 2: Edge creation wizard state
  const [edgeWizardOpen, setEdgeWizardOpen] = useState(false);
  const [pendingEdge, setPendingEdge] = useState<{ sourceId: string; targetId: string } | null>(null);
  const [newEdgeProtocol, setNewEdgeProtocol] = useState<IntegrationProtocol>('REST');
  const [newEdgeDirection, setNewEdgeDirection] = useState<IntegrationDirection>('A_TO_B');

  // Phase 3: Highlight state
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<Set<string>>(new Set());
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState<Set<string>>(new Set());

  // Health & Status store integration
  const { decisions, signals: healthSignals, getSignalsForSystem } = useHealthStatusStore();

  // Refs for state access in callbacks
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const filtersRef = useRef(filters);

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  // ============================================
  // STYLE PROVIDERS
  // ============================================

  const createNodeStyle = useCallback((node: NodeTag) => {
    const color = domainColors[node.domain] || '#64748b';
    const statusColor = getStatusColor(node.status);
    return new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: color + '25',
      stroke: `2px ${statusColor}`,
    });
  }, []);

  const createEdgeStyle = useCallback((edge: EdgeTag, dimmed = false) => {
    const style = getProtocolStyle(edge.protocol);
    const opacity = dimmed ? '40' : 'ff';
    const color = style.color + opacity;

    // Direction arrows
    let sourceArrow: Arrow | undefined;
    let targetArrow: Arrow | undefined;

    if (edge.direction === 'A_TO_B' || edge.direction === 'BIDIRECTIONAL') {
      targetArrow = new Arrow({
        type: ArrowType.TRIANGLE,
        fill: color,
        lengthScale: 1.2,
        widthScale: 1.2,
      });
    }
    if (edge.direction === 'B_TO_A' || edge.direction === 'BIDIRECTIONAL') {
      sourceArrow = new Arrow({
        type: ArrowType.TRIANGLE,
        fill: color,
        lengthScale: 1.2,
        widthScale: 1.2,
      });
    }

    // Dash pattern based on protocol
    let dashStyle: number[] | undefined;
    if (style.dashArray) {
      dashStyle = style.dashArray;
    }

    const thickness = dimmed ? 1 : 2;
    // Build stroke string - yFiles 3 accepts CSS-like stroke strings
    const strokeStr = `${thickness}px ${color}`;

    return new PolylineEdgeStyle({
      stroke: strokeStr,
      sourceArrow,
      targetArrow,
    });
  }, []);

  const createEdgeLabelStyle = useCallback((edge: EdgeTag, dimmed = false) => {
    const style = getProtocolStyle(edge.protocol);
    return new LabelStyle({
      backgroundFill: style.color + (dimmed ? '60' : 'cc'),
      textFill: '#ffffff',
      font: 'bold 9px Inter, sans-serif',
      padding: new Insets(3, 6, 3, 6),
      shape: 'round-rectangle',
    });
  }, []);

  // ============================================
  // GRAPH BUILDING
  // ============================================

  const buildGraph = useCallback((gc: GraphComponent, nodeData: NodeTag[], edgeData: EdgeTag[]) => {
    const graph = gc.graph;
    graph.clear();
    nodeMapRef.current.clear();
    edgeMapRef.current.clear();

    graph.nodeDefaults.size = new Size(140, 60);
    graph.nodeDefaults.labels.style = new LabelStyle({
      textFill: '#ffffff',
      font: 'bold 11px Inter, sans-serif',
      horizontalTextAlignment: 'center',
    });

    // Group nodes by domain for positioning
    const nodesByDomain: Record<FlowMapDomain, NodeTag[]> = {
      CHANNELS: [],
      BSS: [],
      OSS: [],
      NETWORK: [],
      EXTERNAL: [],
    };
    nodeData.forEach(n => {
      if (nodesByDomain[n.domain]) nodesByDomain[n.domain].push(n);
    });

    // Create nodes
    for (const n of nodeData) {
      const domainNodes = nodesByDomain[n.domain];
      const idx = domainNodes.indexOf(n);
      const bounds = getLaneBounds(n.domain);

      // Position within lane
      const cols = Math.max(1, Math.floor((bounds.width - 40) / 160));
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = bounds.x + 20 + col * 160;
      const y = bounds.y + 20 + row * 80;

      const node = graph.createNode({
        layout: new Rect(x, y, 140, 60),
        tag: n,
      });
      graph.setStyle(node, createNodeStyle(n));
      graph.addLabel(node, n.name);

      // Domain badge
      const badge = graph.addLabel(node, n.domain);
      graph.setStyle(badge, new LabelStyle({
        backgroundFill: domainColors[n.domain] || '#64748b',
        textFill: '#ffffff',
        font: 'bold 8px Inter',
        padding: new Insets(2, 4, 2, 4),
        shape: 'round-rectangle',
      }));
      graph.setLabelLayoutParameter(badge, ExteriorNodeLabelModel.TOP);

      nodeMapRef.current.set(n.id, node);
    }

    // Create edges
    for (const e of edgeData) {
      // Check filter
      if (!filtersRef.current.protocols.includes(e.protocol)) continue;

      const src = nodeMapRef.current.get(e.fromSystemId);
      const tgt = nodeMapRef.current.get(e.toSystemId);
      if (!src || !tgt) continue;

      const edge = graph.createEdge(src, tgt);
      edge.tag = e;

      // Apply style
      const isDimmed = highlightedEdgeIds.size > 0 && !highlightedEdgeIds.has(e.id);
      graph.setStyle(edge, createEdgeStyle(e, isDimmed));

      // Protocol label
      const style = getProtocolStyle(e.protocol);
      const labelText = e.contractName ? `${style.shortLabel}: ${e.contractName}` : style.shortLabel;
      const label = graph.addLabel(edge, labelText);
      graph.setStyle(label, createEdgeLabelStyle(e, isDimmed));
      graph.setLabelLayoutParameter(label, FreeEdgeLabelModel.INSTANCE.createParameter({ ratio: 0.5 }));

      edgeMapRef.current.set(e.id, edge);
    }

    // Apply routing
    runEdgeRouting(gc);

    // Fit view
    setTimeout(() => {
      gc.fitGraphBounds(new Insets(40));
    }, 100);
  }, [createNodeStyle, createEdgeStyle, createEdgeLabelStyle, highlightedEdgeIds]);

  // ============================================
  // EDGE ROUTING (Phase 1)
  // ============================================

  const runEdgeRouting = useCallback((gc: GraphComponent) => {
    if (!edgeRouterRef.current) {
      edgeRouterRef.current = new EdgeRouter();
    }

    const router = edgeRouterRef.current;

    try {
      const executor = new LayoutExecutor({
        graphComponent: gc,
        layout: router,
        animationDuration: '200ms',
      });
      executor.start();
    } catch (e) {
      console.warn('Edge routing failed:', e);
    }
  }, []);

  // ============================================
  // LAYOUT MODES (Phase 3)
  // ============================================

  const applyLayout = useCallback((gc: GraphComponent, mode: LayoutMode) => {
    let layout;

    if (mode === 'hierarchic') {
      layout = new HierarchicalLayout({
        layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT,
        minimumLayerDistance: 80,
        nodeDistance: 40,
      });
    } else if (mode === 'organic') {
      layout = new OrganicLayout();
    } else {
      // Swimlane - just re-run routing
      runEdgeRouting(gc);
      return;
    }

    try {
      const executor = new LayoutExecutor({
        graphComponent: gc,
        layout: layout,
        animationDuration: '500ms',
      });
      executor.start().then(() => {
        runEdgeRouting(gc);
      });
    } catch (e) {
      console.warn('Layout failed:', e);
    }
  }, [runEdgeRouting]);

  // ============================================
  // HIGHLIGHT / PATH FINDING (Phase 3)
  // ============================================

  const highlightConnected = useCallback((nodeId: string, hops: number) => {
    if (hops === 0) {
      setHighlightedNodeIds(new Set());
      setHighlightedEdgeIds(new Set());
      return;
    }

    const connectedNodes = new Set<string>([nodeId]);
    const connectedEdges = new Set<string>();

    // Find edges connected to the node
    const findConnections = (currentNodes: Set<string>, depth: number) => {
      if (depth === 0) return;

      const newNodes = new Set<string>();
      edgesRef.current.forEach(e => {
        if (currentNodes.has(e.fromSystemId)) {
          connectedEdges.add(e.id);
          if (!connectedNodes.has(e.toSystemId)) {
            newNodes.add(e.toSystemId);
            connectedNodes.add(e.toSystemId);
          }
        }
        if (currentNodes.has(e.toSystemId)) {
          connectedEdges.add(e.id);
          if (!connectedNodes.has(e.fromSystemId)) {
            newNodes.add(e.fromSystemId);
            connectedNodes.add(e.fromSystemId);
          }
        }
      });

      if (newNodes.size > 0) {
        findConnections(newNodes, depth - 1);
      }
    };

    findConnections(connectedNodes, hops);
    setHighlightedNodeIds(connectedNodes);
    setHighlightedEdgeIds(connectedEdges);
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightedNodeIds(new Set());
    setHighlightedEdgeIds(new Set());
  }, []);

  // ============================================
  // EDGE CREATION WIZARD (Phase 2)
  // ============================================

  const handleEdgeCreated = useCallback((sourceId: string, targetId: string) => {
    setPendingEdge({ sourceId, targetId });
    setNewEdgeProtocol('REST');
    setNewEdgeDirection('A_TO_B');
    setEdgeWizardOpen(true);
  }, []);

  const confirmEdgeCreation = useCallback(() => {
    if (!pendingEdge) return;

    const newEdge: EdgeTag = {
      id: generateIntegrationId(),
      fromSystemId: pendingEdge.sourceId,
      toSystemId: pendingEdge.targetId,
      direction: newEdgeDirection,
      protocol: newEdgeProtocol,
      pattern: getDefaultPattern(newEdgeProtocol),
      transport: getDefaultTransport(newEdgeProtocol),
      auth: 'NONE',
    };

    setEdges(prev => [...prev, newEdge]);
    setEdgeWizardOpen(false);
    setPendingEdge(null);
  }, [pendingEdge, newEdgeProtocol, newEdgeDirection]);

  const cancelEdgeCreation = useCallback(() => {
    // Remove the edge from the graph if it was created
    if (pendingEdge && gcRef.current) {
      const src = nodeMapRef.current.get(pendingEdge.sourceId);
      const tgt = nodeMapRef.current.get(pendingEdge.targetId);
      if (src && tgt) {
        const edge = gcRef.current.graph.getEdge(src, tgt);
        if (edge) gcRef.current.graph.remove(edge);
      }
    }
    setEdgeWizardOpen(false);
    setPendingEdge(null);
  }, [pendingEdge]);

  // ============================================
  // EDGE PROPERTY UPDATES (Phase 2)
  // ============================================

  const updateEdge = useCallback((edgeId: string, updates: Partial<EdgeTag>) => {
    setEdges(prev => prev.map(e => e.id === edgeId ? { ...e, ...updates } : e));

    // Update visual
    const edge = edgeMapRef.current.get(edgeId);
    if (edge && gcRef.current) {
      const updatedTag = { ...edge.tag as EdgeTag, ...updates };
      edge.tag = updatedTag;
      gcRef.current.graph.setStyle(edge, createEdgeStyle(updatedTag, false));

      // Update label
      const labels = gcRef.current.graph.edgeLabels.filter(l => l.owner === edge).toArray();
      if (labels.length > 0) {
        const style = getProtocolStyle(updatedTag.protocol);
        const labelText = updatedTag.contractName ? `${style.shortLabel}: ${updatedTag.contractName}` : style.shortLabel;
        gcRef.current.graph.setLabelText(labels[0], labelText);
        gcRef.current.graph.setStyle(labels[0], createEdgeLabelStyle(updatedTag, false));
      }
    }

    // Update selected edge state
    if (selectedEdge?.id === edgeId) {
      setSelectedEdge(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [createEdgeStyle, createEdgeLabelStyle, selectedEdge]);

  const flipEdgeDirection = useCallback((edgeId: string) => {
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return;

    let newDirection: IntegrationDirection;
    if (edge.direction === 'A_TO_B') newDirection = 'B_TO_A';
    else if (edge.direction === 'B_TO_A') newDirection = 'A_TO_B';
    else newDirection = 'BIDIRECTIONAL';

    updateEdge(edgeId, { direction: newDirection });
  }, [edges, updateEdge]);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
    const edge = edgeMapRef.current.get(edgeId);
    if (edge && gcRef.current) {
      gcRef.current.graph.remove(edge);
      edgeMapRef.current.delete(edgeId);
    }
    setSelectedEdge(null);
  }, []);

  // ============================================
  // EXPORT (Phase 3)
  // ============================================

  const exportImage = useCallback(async (format: 'png' | 'svg') => {
    if (!gcRef.current) return;

    try {
      const gc = gcRef.current;
      // Export using canvas rendering
      // Note: yFiles export module needed for full SVG export
      alert(`Export to ${format.toUpperCase()} - Feature requires yFiles export module. Coming soon!`);
    } catch (e) {
      console.error('Export failed:', e);
    }
  }, []);

  // ============================================
  // INITIALIZATION
  // ============================================

  useEffect(() => {
    const container = containerRef.current;
    if (!container || gcRef.current) return;

    console.log('[FlowMapV2] Creating GraphComponent');
    const gc = new GraphComponent(container);
    gcRef.current = gc;

    // Setup editor input mode with Phase 1 features
    const mode = new GraphEditorInputMode({
      allowCreateNode: false,
      allowCreateEdge: true,
      allowEditLabel: false,
    });

    // Enable orthogonal edge editing (Phase 1)
    mode.orthogonalEdgeEditingContext = new OrthogonalEdgeEditingContext();

    // Enable snapping (Phase 1)
    mode.snapContext = new GraphSnapContext({
      enabled: true,
      snapDistance: 15,
      gridSnapType: GridSnapTypes.GRID_POINTS,
    });

    // Edge creation callback (Phase 2)
    mode.createEdgeInputMode.addEventListener('edge-created', (_, evt) => {
      // In yFiles 3, the edge is passed in a different way - check event properties
      const eventObj = evt as unknown as { edge?: IEdge };
      const edge = eventObj.edge;
      if (edge) {
        const srcTag = edge.sourceNode?.tag as NodeTag | undefined;
        const tgtTag = edge.targetNode?.tag as NodeTag | undefined;
        if (srcTag && tgtTag) {
          handleEdgeCreated(srcTag.id, tgtTag.id);
        }
      }
    });

    // Selection tracking - use selection.includes() in yFiles 3.0
    const updateSelection = () => {
      // Check nodes first
      let foundNode = false;
      let foundEdge = false;
      const nodes = gc.graph.nodes.toArray();
      const edges = gc.graph.edges.toArray();

      for (let i = 0; i < nodes.length && !foundNode; i++) {
        const node = nodes[i];
        if (gc.selection.includes(node)) {
          setSelectedNode(node.tag as NodeTag);
          setSelectedEdge(null);
          foundNode = true;
        }
      }
      if (!foundNode) {
        for (let i = 0; i < edges.length && !foundEdge; i++) {
          const edge = edges[i];
          if (gc.selection.includes(edge)) {
            setSelectedEdge(edge.tag as EdgeTag);
            setSelectedNode(null);
            foundEdge = true;
          }
        }
      }
      if (!foundNode && !foundEdge) {
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    };

    // Track clicks on items
    mode.addEventListener('item-clicked', () => {
      setTimeout(updateSelection, 0);
    });
    mode.addEventListener('canvas-clicked', () => {
      setSelectedNode(null);
      setSelectedEdge(null);
    });

    // Re-route after node drag (Phase 1)
    let routeTimer: NodeJS.Timeout | null = null;
    gc.graph.addEventListener('node-layout-changed', () => {
      if (routeTimer) clearTimeout(routeTimer);
      routeTimer = setTimeout(() => {
        runEdgeRouting(gc);
      }, 300);
    });

    gc.inputMode = mode;

    // Overview
    if (overviewRef.current && !overviewGcRef.current) {
      overviewGcRef.current = new GraphOverviewComponent(overviewRef.current, gc);
    }

    return () => {
      overviewGcRef.current?.cleanUp();
      overviewGcRef.current = null;
      gc.cleanUp();
      gcRef.current = null;
    };
  }, [handleEdgeCreated, runEdgeRouting]);

  // Load environment data
  useEffect(() => {
    const data = convertToV2Data(selectedEnvId);
    setNodes(data.nodes);
    setEdges(data.edges);
    clearHighlight();
  }, [selectedEnvId, clearHighlight]);

  // Rebuild graph when data changes
  useEffect(() => {
    if (gcRef.current && nodes.length > 0) {
      buildGraph(gcRef.current, nodes, edges);
    }
  }, [nodes, edges, filters.protocols, buildGraph]);

  // Apply highlight styling
  useEffect(() => {
    if (!gcRef.current) return;
    const gc = gcRef.current;

    // Update node styles
    nodeMapRef.current.forEach((node, id) => {
      const tag = node.tag as NodeTag;
      const isDimmed = highlightedNodeIds.size > 0 && !highlightedNodeIds.has(id);
      const style = createNodeStyle(tag);
      if (isDimmed) {
        // Dim the node
        gc.graph.setStyle(node, new ShapeNodeStyle({
          shape: 'round-rectangle',
          fill: '#1e293b40',
          stroke: '1px #475569',
        }));
      } else {
        gc.graph.setStyle(node, style);
      }
    });

    // Update edge styles
    edgeMapRef.current.forEach((edge, id) => {
      const tag = edge.tag as EdgeTag;
      const isDimmed = highlightedEdgeIds.size > 0 && !highlightedEdgeIds.has(id);
      gc.graph.setStyle(edge, createEdgeStyle(tag, isDimmed));

      // Update label
      const labels = gc.graph.edgeLabels.filter(l => l.owner === edge).toArray();
      if (labels.length > 0) {
        gc.graph.setStyle(labels[0], createEdgeLabelStyle(tag, isDimmed));
      }
    });
  }, [highlightedNodeIds, highlightedEdgeIds, createNodeStyle, createEdgeStyle, createEdgeLabelStyle]);

  // ============================================
  // RENDER
  // ============================================

  const envData = sampleL1Data[selectedEnvId];
  const stageColor = envData ? stageColors[envData.stageKey] : '#64748b';

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-800 z-30 flex items-center px-4">
        <div className="flex items-center gap-3">
          <Link href="/flow-map-yfiles" className="p-2 hover:bg-slate-800 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="px-2 py-1 rounded text-xs font-bold bg-green-600 text-white">V2</span>
          <span className="text-slate-400">Integration Map</span>
          <span className="text-slate-600 mx-1">/</span>
          <select
            value={selectedEnvId}
            onChange={(e) => setSelectedEnvId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm"
          >
            <option value="env-dev">DEV</option>
            <option value="env-sit">SIT</option>
            <option value="env-uat">UAT</option>
            <option value="env-preprod">PREPROD</option>
            <option value="env-prod">PROD</option>
          </select>
          {envData && (
            <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: stageColor + '30', color: stageColor }}>
              {envData.stageKey}
            </span>
          )}
        </div>

        {/* Toolbar (Phase 1, 2, 3) */}
        <div className="ml-auto flex items-center gap-2">
          {/* Layout mode buttons (Phase 3) */}
          <div className="flex items-center gap-1 bg-slate-800 rounded p-1">
            {(Object.keys(LAYOUT_MODE_CONFIG) as LayoutMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => {
                  setLayoutMode(mode);
                  if (gcRef.current) applyLayout(gcRef.current, mode);
                }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  layoutMode === mode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                title={LAYOUT_MODE_CONFIG[mode].description}
              >
                {LAYOUT_MODE_CONFIG[mode].icon} {LAYOUT_MODE_CONFIG[mode].label}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-slate-700" />

          {/* Auto Route button (Phase 1) */}
          <button
            onClick={() => gcRef.current && runEdgeRouting(gcRef.current)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm flex items-center gap-1.5"
            title="Re-route all edges"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Auto Route
          </button>

          {/* Export buttons (Phase 3) */}
          <button
            onClick={() => exportImage('png')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm"
            title="Export as PNG"
          >
            PNG
          </button>
          <button
            onClick={() => exportImage('svg')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm"
            title="Export as SVG"
          >
            SVG
          </button>

          <div className="w-px h-6 bg-slate-700" />

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 rounded text-sm ${showFilters ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            Filters
          </button>
          <button
            onClick={() => setPropertiesPanelOpen(!propertiesPanelOpen)}
            className={`px-3 py-1.5 rounded text-sm ${propertiesPanelOpen ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            Properties
          </button>
          <button
            onClick={() => gcRef.current?.fitGraphBounds(new Insets(40))}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Filter Bar (Phase 2) */}
      {showFilters && (
        <div className="absolute top-14 left-0 right-0 h-12 bg-slate-900/95 border-b border-slate-800 z-20 flex items-center px-4 gap-4">
          <span className="text-xs text-slate-500">Protocols:</span>
          {(['REST', 'SOAP', 'EVENTS', 'MQ', 'DB', 'FILE', 'OTHER'] as IntegrationProtocol[]).map(protocol => {
            const style = PROTOCOL_STYLES[protocol];
            const isActive = filters.protocols.includes(protocol);
            return (
              <button
                key={protocol}
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    protocols: isActive
                      ? prev.protocols.filter(p => p !== protocol)
                      : [...prev.protocols, protocol],
                  }));
                }}
                className={`px-2 py-1 text-xs rounded flex items-center gap-1.5 transition-all ${
                  isActive ? 'ring-1 ring-offset-1 ring-offset-slate-900' : 'opacity-50'
                }`}
                style={{
                  backgroundColor: style.color + (isActive ? '30' : '10'),
                  color: style.color,
                  borderColor: style.color,
                  boxShadow: isActive ? `0 0 0 2px ${style.color}40` : 'none',
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: style.color }} />
                {style.shortLabel}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, protocols: ['REST', 'SOAP', 'EVENTS', 'MQ', 'DB', 'FILE', 'OTHER'] }))}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Show All
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setFilters(prev => ({ ...prev, protocols: [] }))}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Hide All
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className={`flex-1 relative ${showFilters ? 'pt-26' : 'pt-14'}`} style={{ paddingTop: showFilters ? '6.5rem' : '3.5rem' }}>
        {/* Swimlane Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ top: showFilters ? '6.5rem' : '3.5rem' }}>
          <svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ position: 'absolute' }}>
            <rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#0f172a" />
            {DOMAIN_LANES.map((lane, idx) => {
              const y = idx * LANE_HEIGHT;
              return (
                <g key={lane.domain}>
                  <rect x={LANE_HEADER_WIDTH} y={y} width={MAIN_AREA_WIDTH} height={LANE_HEIGHT}
                    fill={lane.color + '08'} stroke={lane.color + '30'} strokeWidth={1} />
                  <rect x={0} y={y} width={LANE_HEADER_WIDTH} height={LANE_HEIGHT} fill={lane.color + '15'} />
                  <text x={LANE_HEADER_WIDTH / 2} y={y + LANE_HEIGHT / 2} textAnchor="middle" dominantBaseline="middle"
                    fill={lane.color} fontSize={12} fontWeight="600">{lane.label}</text>
                </g>
              );
            })}
            <rect x={LANE_HEADER_WIDTH + MAIN_AREA_WIDTH} y={0} width={EXTERNAL_COLUMN_WIDTH} height={CANVAS_HEIGHT}
              fill="#f59e0b08" stroke="#f59e0b30" strokeWidth={1} />
            <rect x={LANE_HEADER_WIDTH + MAIN_AREA_WIDTH} y={0} width={EXTERNAL_COLUMN_WIDTH} height={36} fill="#f59e0b15" />
            <text x={LANE_HEADER_WIDTH + MAIN_AREA_WIDTH + EXTERNAL_COLUMN_WIDTH / 2} y={18} textAnchor="middle" dominantBaseline="middle"
              fill="#f59e0b" fontSize={12} fontWeight="600">External</text>
          </svg>
        </div>

        {/* yFiles Container */}
        <div ref={containerRef} className="w-full h-full" style={{ backgroundColor: 'transparent' }} />

        {/* Minimap */}
        {showMinimap && (
          <div className="absolute bottom-4 left-4 bg-slate-900 border border-slate-700 rounded overflow-hidden">
            <div className="px-2 py-1 bg-slate-800 text-xs text-slate-400 border-b border-slate-700">Minimap</div>
            <div ref={overviewRef} className="w-48 h-32" />
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-700 rounded p-3 text-xs">
          <div className="font-medium mb-2 text-slate-300">Protocol Legend</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {(['REST', 'SOAP', 'EVENTS', 'MQ', 'DB', 'FILE'] as IntegrationProtocol[]).map(p => {
              const s = PROTOCOL_STYLES[p];
              return (
                <div key={p} className="flex items-center gap-2">
                  <div className="w-6 h-0.5" style={{
                    backgroundColor: s.color,
                    backgroundImage: s.dashArray ? `repeating-linear-gradient(90deg, ${s.color} 0, ${s.color} ${s.dashArray[0]}px, transparent ${s.dashArray[0]}px, transparent ${s.dashArray[0] + (s.dashArray[1] || 0)}px)` : undefined,
                  }} />
                  <span className="text-slate-400">{s.shortLabel}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700 text-slate-500">
            <div>→ One-way | ↔ Bidirectional</div>
          </div>
        </div>
      </div>

      {/* Properties Panel (Phase 2) */}
      {propertiesPanelOpen && (
        <div className="w-80 bg-slate-900 border-l border-slate-800 pt-14 flex flex-col" style={{ paddingTop: showFilters ? '6.5rem' : '3.5rem' }}>
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-semibold text-sm">Properties</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedEdge ? (
              /* Edge Properties */
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Integration</div>
                  <div className="font-medium">{selectedEdge.contractName || 'Unnamed Integration'}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {nodes.find(n => n.id === selectedEdge.fromSystemId)?.name} → {nodes.find(n => n.id === selectedEdge.toSystemId)?.name}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Direction</label>
                  <select
                    value={selectedEdge.direction}
                    onChange={(e) => updateEdge(selectedEdge.id, { direction: e.target.value as IntegrationDirection })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                  >
                    <option value="A_TO_B">A → B (One-way)</option>
                    <option value="B_TO_A">B → A (One-way)</option>
                    <option value="BIDIRECTIONAL">A ↔ B (Bidirectional)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Protocol</label>
                  <select
                    value={selectedEdge.protocol}
                    onChange={(e) => updateEdge(selectedEdge.id, { protocol: e.target.value as IntegrationProtocol })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                  >
                    {Object.entries(PROTOCOL_STYLES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Pattern</label>
                  <select
                    value={selectedEdge.pattern}
                    onChange={(e) => updateEdge(selectedEdge.id, { pattern: e.target.value as IntegrationPattern })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                  >
                    {Object.entries(PATTERN_STYLES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Transport</label>
                  <select
                    value={selectedEdge.transport || 'OTHER'}
                    onChange={(e) => updateEdge(selectedEdge.id, { transport: e.target.value as IntegrationTransport })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                  >
                    <option value="HTTP">HTTP</option>
                    <option value="HTTPS">HTTPS</option>
                    <option value="AMQP">AMQP</option>
                    <option value="JMS">JMS</option>
                    <option value="KAFKA">Kafka</option>
                    <option value="RABBITMQ">RabbitMQ</option>
                    <option value="AZURE_SERVICE_BUS">Azure Service Bus</option>
                    <option value="TCP">TCP</option>
                    <option value="SFTP">SFTP</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Authentication</label>
                  <select
                    value={selectedEdge.auth || 'NONE'}
                    onChange={(e) => updateEdge(selectedEdge.id, { auth: e.target.value as IntegrationAuth })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                  >
                    <option value="OAUTH2">OAuth 2.0</option>
                    <option value="MTLS">mTLS</option>
                    <option value="API_KEY">API Key</option>
                    <option value="BASIC">Basic Auth</option>
                    <option value="NONE">None</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Contract Name</label>
                  <input
                    type="text"
                    value={selectedEdge.contractName || ''}
                    onChange={(e) => updateEdge(selectedEdge.id, { contractName: e.target.value })}
                    placeholder="e.g., Order Submit API"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Notes</label>
                  <textarea
                    value={selectedEdge.notes || ''}
                    onChange={(e) => updateEdge(selectedEdge.id, { notes: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => flipEdgeDirection(selectedEdge.id)}
                    className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm"
                  >
                    Flip Direction
                  </button>
                  <button
                    onClick={() => deleteEdge(selectedEdge.id)}
                    className="px-3 py-2 bg-red-900/50 hover:bg-red-900 text-red-400 hover:text-red-300 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : selectedNode ? (
              /* Node Properties */
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">System</div>
                  <div className="font-medium">{selectedNode.name}</div>
                </div>

                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: domainColors[selectedNode.domain] + '30', color: domainColors[selectedNode.domain] }}>
                    {selectedNode.domain}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: getStatusColor(selectedNode.status) + '30', color: getStatusColor(selectedNode.status) }}>
                    {selectedNode.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {selectedNode.systemType && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Type</span>
                      <span>{selectedNode.systemType}</span>
                    </div>
                  )}
                  {selectedNode.vendor && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vendor</span>
                      <span>{selectedNode.vendor}</span>
                    </div>
                  )}
                  {selectedNode.version && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Version</span>
                      <span className="font-mono text-xs">{selectedNode.version}</span>
                    </div>
                  )}
                  {selectedNode.hostname && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hostname</span>
                      <span className="font-mono text-xs">{selectedNode.hostname}</span>
                    </div>
                  )}
                  {selectedNode.ip && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">IP</span>
                      <span className="font-mono text-xs">{selectedNode.ip}</span>
                    </div>
                  )}
                </div>

                {/* Highlight buttons (Phase 3) */}
                <div className="pt-4 border-t border-slate-700">
                  <div className="text-xs text-slate-500 mb-2">Dependency Highlight</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => highlightConnected(selectedNode.id, 1)}
                      className={`flex-1 px-3 py-2 rounded text-sm ${highlightedNodeIds.has(selectedNode.id) ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                      1-Hop
                    </button>
                    <button
                      onClick={() => highlightConnected(selectedNode.id, 2)}
                      className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm"
                    >
                      2-Hop
                    </button>
                    <button
                      onClick={clearHighlight}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Connected edges */}
                <div className="pt-4 border-t border-slate-700">
                  <div className="text-xs text-slate-500 mb-2">Connected Integrations</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {edges.filter(e => e.fromSystemId === selectedNode.id || e.toSystemId === selectedNode.id).map(e => {
                      const style = PROTOCOL_STYLES[e.protocol];
                      const isOutbound = e.fromSystemId === selectedNode.id;
                      const otherNode = nodes.find(n => n.id === (isOutbound ? e.toSystemId : e.fromSystemId));
                      return (
                        <div
                          key={e.id}
                          className="px-2 py-1.5 bg-slate-800/50 rounded text-xs cursor-pointer hover:bg-slate-800"
                          onClick={() => {
                            const edge = edgeMapRef.current.get(e.id);
                            if (edge && gcRef.current) {
                              gcRef.current.selection.clear();
                              gcRef.current.selection.add(edge);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: style.color }} />
                            <span>{isOutbound ? '→' : '←'} {otherNode?.name}</span>
                          </div>
                          {e.contractName && <div className="text-slate-500 mt-0.5">{e.contractName}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Health Signals (from Health & Status module) */}
                {(() => {
                  const decision = decisions.find(d => d.systemId === selectedNode.id);
                  const nodeSignals = getSignalsForSystem(selectedNode.id);
                  const topSignals = nodeSignals
                    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
                    .slice(0, 3);

                  if (!decision && topSignals.length === 0) return null;

                  const statusConfig = decision ? STATUS_CONFIG[decision.status] : null;

                  return (
                    <div className="pt-4 border-t border-slate-700">
                      <div className="text-xs text-slate-500 mb-2">Health Signals</div>

                      {/* Status & Reason */}
                      {decision && statusConfig && (
                        <div className="mb-3">
                          <div
                            className="px-3 py-2 rounded flex items-center gap-2"
                            style={{
                              backgroundColor: statusConfig.bgColor,
                              borderColor: statusConfig.color + '40',
                              borderWidth: 1,
                            }}
                          >
                            <span className="text-lg">{statusConfig.icon}</span>
                            <span className="font-medium text-sm" style={{ color: statusConfig.color }}>
                              {decision.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-2">{decision.reason}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {decision.reasonCodes.map(code => (
                              <span key={code} className="px-1.5 py-0.5 bg-slate-800 text-slate-500 text-[10px] rounded font-mono">
                                {code}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Top 3 Signals */}
                      {topSignals.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Recent Signals</div>
                          {topSignals.map(signal => {
                            const sourceConfig = SIGNAL_SOURCE_CONFIG[signal.source];
                            const isContributing = decision?.contributingSignals.includes(signal.id);
                            return (
                              <div
                                key={signal.id}
                                className={`px-2 py-1.5 rounded text-xs ${
                                  isContributing ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-slate-800/50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span style={{ color: sourceConfig.color }}>{sourceConfig.icon}</span>
                                  <code className="text-blue-400 text-[10px]">{signal.metric}</code>
                                  {isContributing && (
                                    <span className="ml-auto text-blue-400 text-[10px]">USED</span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-slate-300">
                                    {typeof signal.value === 'boolean' ? signal.value.toString() : String(signal.value)}
                                  </span>
                                  <span className="text-slate-500 text-[10px]">{getRelativeTime(signal.ts)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="text-sm text-slate-500 text-center py-8">
                Select a node or edge to view properties
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edge Creation Wizard Modal (Phase 2) */}
      {edgeWizardOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-96 p-6">
            <h3 className="font-semibold mb-4">New Integration</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Protocol</label>
                <select
                  value={newEdgeProtocol}
                  onChange={(e) => setNewEdgeProtocol(e.target.value as IntegrationProtocol)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                >
                  {Object.entries(PROTOCOL_STYLES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Direction</label>
                <select
                  value={newEdgeDirection}
                  onChange={(e) => setNewEdgeDirection(e.target.value as IntegrationDirection)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                >
                  <option value="A_TO_B">A → B (One-way)</option>
                  <option value="B_TO_A">B → A (One-way)</option>
                  <option value="BIDIRECTIONAL">A ↔ B (Bidirectional)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={cancelEdgeCreation}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmEdgeCreation}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
