'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  GraphComponent,
  GraphEditorInputMode,
  GraphViewerInputMode,
  GraphOverviewComponent,
  HierarchicalLayout,
  LayoutExecutor,
  License,
  ShapeNodeStyle,
  PolylineEdgeStyle,
  BezierEdgeStyle,
  Arrow,
  ArrowType,
  LabelStyle,
  Size,
  Insets,
  LayoutOrientation,
  GraphItemTypes,
  type INode,
  type IEdge,
  type ILabel,
  ExteriorNodeLabelModel,
  Rect,
  Point,
  Stroke,
  Fill,
  Color,
} from '@yfiles/yfiles';

import {
  sampleL0Data,
  sampleL1Data,
  stageColors,
  domainColors,
  nodeTypeConfig,
  edgeTypeColors,
  getStatusColor,
  generateNodeId,
  generateEdgeId,
  SYSTEMS_CATALOG,
  type L0Environment,
  type L1Node,
  type L1Edge,
  type L1NodeType,
  type L1Data,
  type SystemDefinition,
} from '@/lib/flowmap/flowMapDataV2';
import type { FlowMapDomain } from '@/types/flow-map-v2';
import { useProjectEnvironment, type ProjectData, type EnvironmentData } from '@/contexts/ProjectEnvironmentContext';

// Load yFiles license
import licenseData from '../../../yFiles-for-HTML-Complete-3.0.0.4-Evaluation/lib/license.json';
License.value = licenseData;

// Types
interface L0NodeTag { type: 'environment'; data: L0Environment; }
interface L1NodeTag { type: 'system'; data: L1Node; }
interface AnnotationTag { type: 'annotation'; annotationType: 'text' | 'note'; id: string; content: string; }

type ViewLevel = 'L0' | 'L1';

// Annotation data
interface Annotation {
  id: string;
  type: 'text' | 'note';
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

// Storage keys
const STORAGE_KEY_L1 = 'nexorium-flowmap-l1-';
const STORAGE_KEY_L0 = 'nexorium-flowmap-l0';

// L0 Link with metadata
interface L0Link {
  sourceId: string;
  targetId: string;
  label?: string;
  linkType?: 'PROMOTION' | 'DATA_SYNC' | 'REFERENCE';
  locked?: boolean;
}

// L0 Edge tag for tracking
interface L0EdgeTag {
  type: 'link';
  link: L0Link;
}

// L0 Data structure for persistence
interface L0Data {
  projectId: string;
  environmentsOnCanvas: string[]; // IDs of environments visible on canvas
  positions: Record<string, { x: number; y: number }>; // Position overrides
  links: L0Link[]; // Custom links with metadata
  annotations?: Annotation[]; // Text and sticky notes
}

// L1 Storage
function saveL1Data(envId: string, data: L1Data) {
  try {
    localStorage.setItem(STORAGE_KEY_L1 + envId, JSON.stringify(data));
    console.log('[FlowMap] Saved L1 data for', envId);
  } catch (e) { console.error('Save failed', e); }
}
function loadL1Data(envId: string): L1Data | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY_L1 + envId);
    return s ? JSON.parse(s) : null;
  } catch (e) { return null; }
}

// L0 Storage - per project
function saveL0Data(projectId: string, data: L0Data) {
  try {
    localStorage.setItem(`${STORAGE_KEY_L0}-${projectId}`, JSON.stringify(data));
    console.log('[FlowMap] Saved L0 data for project', projectId);
  } catch (e) { console.error('Save failed', e); }
}
function loadL0Data(projectId: string): L0Data | null {
  try {
    const s = localStorage.getItem(`${STORAGE_KEY_L0}-${projectId}`);
    return s ? JSON.parse(s) : null;
  } catch (e) { return null; }
}

// Default L0 data for each project
function getDefaultL0Data(projectId: string, allEnvs: L0Environment[], projectsData: ProjectData[]): L0Data {
  // If we have real projects from context, use the project's environments
  const realProject = projectsData.find(p => p.id === projectId);
  if (realProject && realProject.environments.length > 0) {
    const projectEnvIds = realProject.environments.map(e => e.id);
    return {
      projectId,
      environmentsOnCanvas: projectEnvIds,
      positions: {},
      links: [], // No default links for real data - user creates them
    };
  }

  // Fallback to demo data for hardcoded project IDs
  if (projectId === 'project-a') {
    return {
      projectId,
      environmentsOnCanvas: ['env-dev', 'env-sit', 'env-uat'],
      positions: {},
      links: [
        { sourceId: 'env-dev', targetId: 'env-sit' },
        { sourceId: 'env-sit', targetId: 'env-uat' },
      ],
    };
  } else if (projectId === 'project-b') {
    return {
      projectId,
      environmentsOnCanvas: ['env-sit', 'env-preprod', 'env-prod'],
      positions: {},
      links: [
        { sourceId: 'env-sit', targetId: 'env-preprod' },
        { sourceId: 'env-preprod', targetId: 'env-prod' },
      ],
    };
  }
  // Default project - show all main environments from sample data
  return {
    projectId,
    environmentsOnCanvas: sampleL0Data.environments.map(e => e.id),
    positions: {},
    links: sampleL0Data.links,
  };
}

// Helper to convert context environment data to L0Environment format
function contextEnvToL0(env: EnvironmentData): L0Environment {
  return {
    id: env.id,
    name: env.name,
    stageKey: (env.stage?.key as L0Environment['stageKey']) || env.type as L0Environment['stageKey'],
    systemCount: (env._count?.nodes || 0),
    status: 'healthy', // Default status since context doesn't track this
    description: env.description || '',
  };
}

// Helper to get projects from context or fallback to sample
function getProjectsFromContext(projects: ProjectData[]): Array<{ id: string; name: string }> {
  if (projects.length === 0) {
    // Fallback to sample data for demo mode
    return [
      { id: 'default', name: 'Default Project (Demo)' },
      { id: 'project-a', name: 'Project Alpha (Demo)' },
      { id: 'project-b', name: 'Project Beta (Demo)' },
    ];
  }
  return projects.map(p => ({ id: p.id, name: p.name }));
}

// Helper to get environments from context or fallback to sample
function getEnvironmentsFromContext(projects: ProjectData[]): L0Environment[] {
  if (projects.length === 0) {
    // Fallback to sample data for demo mode
    return [
      ...sampleL0Data.environments,
      { id: 'env-nss', name: 'NSS', stageKey: 'NFT', systemCount: 8, status: 'healthy', description: 'Network Services Staging' },
      { id: 'env-fifi', name: 'FIFI', stageKey: 'NFT', systemCount: 5, status: 'warning', description: 'FIFI Test Environment' },
      { id: 'env-sit2', name: 'SIT2', stageKey: 'SIT', systemCount: 12, status: 'healthy', description: 'Secondary Integration Test' },
    ];
  }
  return projects.flatMap(p => p.environments.map(contextEnvToL0));
}

// ============================================
// SWIMLANE CONFIGURATION
// ============================================

// Canvas dimensions in world coordinates
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 900;
const LANE_HEADER_WIDTH = 120;
const EXTERNAL_COLUMN_WIDTH = 200;

// Horizontal lanes (top to bottom)
const HORIZONTAL_LANES: { domain: FlowMapDomain; label: string; color: string }[] = [
  { domain: 'CHANNELS', label: 'Channels', color: '#ec4899' },
  { domain: 'BSS', label: 'BSS', color: '#8b5cf6' },
  { domain: 'OSS', label: 'OSS', color: '#06b6d4' },
  { domain: 'NETWORK', label: 'Network', color: '#14b8a6' },
];

// Calculate lane boundaries
const MAIN_AREA_WIDTH = CANVAS_WIDTH - LANE_HEADER_WIDTH - EXTERNAL_COLUMN_WIDTH;
const LANE_HEIGHT = CANVAS_HEIGHT / HORIZONTAL_LANES.length;

interface LaneBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getLaneBounds(domain: FlowMapDomain): LaneBounds {
  if (domain === 'EXTERNAL') {
    return {
      x: LANE_HEADER_WIDTH + MAIN_AREA_WIDTH,
      y: 0,
      width: EXTERNAL_COLUMN_WIDTH,
      height: CANVAS_HEIGHT,
    };
  }

  const idx = HORIZONTAL_LANES.findIndex(l => l.domain === domain);
  if (idx === -1) {
    // Default to BSS if not found
    return {
      x: LANE_HEADER_WIDTH,
      y: LANE_HEIGHT,
      width: MAIN_AREA_WIDTH,
      height: LANE_HEIGHT,
    };
  }

  return {
    x: LANE_HEADER_WIDTH,
    y: idx * LANE_HEIGHT,
    width: MAIN_AREA_WIDTH,
    height: LANE_HEIGHT,
  };
}

// Position nodes in their lanes based on domain
function getDefaultPosition(node: L1Node, nodeIndex: number, nodesInDomain: number): { x: number; y: number } {
  const bounds = getLaneBounds(node.domain);
  const padding = 20;
  const nodeWidth = 160;
  const nodeHeight = 70;

  // Calculate position within lane
  const cols = Math.floor((bounds.width - padding * 2) / (nodeWidth + 20));
  const col = nodeIndex % cols;
  const row = Math.floor(nodeIndex / cols);

  const x = bounds.x + padding + col * (nodeWidth + 20);
  const y = bounds.y + padding + row * (nodeHeight + 20);

  return { x, y };
}

// Toolbox items
const toolboxItems: { type: L1NodeType; label: string }[] = [
  { type: 'API_SERVICE', label: 'API Service' },
  { type: 'SERVER', label: 'Server' },
  { type: 'DATABASE', label: 'Database' },
  { type: 'QUEUE', label: 'Queue' },
  { type: 'EXTERNAL_SYSTEM', label: 'External' },
];

export default function FlowMapYFilesClient() {
  // Use the shared context for projects and environments
  const { projects, loading: contextLoading, refreshData: refreshContext } = useProjectEnvironment();

  // Derive projects and environments from context
  const PROJECTS = getProjectsFromContext(projects);
  const ALL_ENVIRONMENTS = getEnvironmentsFromContext(projects);

  const containerRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const gcRef = useRef<GraphComponent | null>(null);
  const overviewGcRef = useRef<GraphOverviewComponent | null>(null);
  const nodeMapRef = useRef<Map<string, INode>>(new Map());
  const edgeMapRef = useRef<Map<string, IEdge>>(new Map());

  const [viewLevel, setViewLevel] = useState<ViewLevel>('L0');
  const [selectedEnv, setSelectedEnv] = useState<L0Environment | null>(null);
  const [selectedNode, setSelectedNode] = useState<L1Node | null>(null);
  const [l1Data, setL1Data] = useState<L1Data | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<FlowMapDomain>('BSS');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [viewportBounds, setViewportBounds] = useState({ x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  const l1DataRef = useRef<L1Data | null>(null);

  // L0 state - initialize with first project if available
  const defaultProjectId = PROJECTS.length > 0 ? PROJECTS[0].id : 'default';
  const [selectedProject, setSelectedProject] = useState(defaultProjectId);
  const [l0Data, setL0Data] = useState<L0Data>(() => {
    // Try to load from storage first
    const saved = loadL0Data(defaultProjectId);
    if (saved) return saved;
    // Otherwise create empty L0 data - will be populated when context loads
    return {
      projectId: defaultProjectId,
      environmentsOnCanvas: [],
      positions: {},
      links: [],
    };
  });
  const [selectedL0Env, setSelectedL0Env] = useState<L0Environment | null>(null);
  const [showMinimap, setShowMinimap] = useState(true);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Edge context menu state
  const [edgeContextMenu, setEdgeContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    edge: IEdge | null;
    link: L0Link | null;
  }>({ visible: false, x: 0, y: 0, edge: null, link: null });

  // Edit edge modal state
  const [editEdgeModal, setEditEdgeModal] = useState<{
    visible: boolean;
    link: L0Link | null;
  }>({ visible: false, link: null });
  const [legendPosition, setLegendPosition] = useState({ x: -1, y: -1 }); // -1 means use default CSS position
  const [isDraggingLegend, setIsDraggingLegend] = useState(false);
  const legendDragOffset = useRef({ x: 0, y: 0 });
  // Minimap dragging
  const [minimapPosition, setMinimapPosition] = useState({ x: -1, y: -1 });
  const [isDraggingMinimap, setIsDraggingMinimap] = useState(false);
  const minimapDragOffset = useRef({ x: 0, y: 0 });
  // Systems search
  const [systemsSearchQuery, setSystemsSearchQuery] = useState('');
  const l0DataRef = useRef<L0Data>(l0Data);
  const annotationMapRef = useRef<Map<string, INode>>(new Map());
  // Trigger to force L0 rebuild (incremented when project changes)
  const [l0RebuildTrigger, setL0RebuildTrigger] = useState(0);

  // Keep refs in sync with state
  useEffect(() => {
    l1DataRef.current = l1Data;
  }, [l1Data]);

  useEffect(() => {
    l0DataRef.current = l0Data;
  }, [l0Data]);

  // Handle initial data loading when context becomes available
  useEffect(() => {
    if (contextLoading) return;
    if (PROJECTS.length === 0) return;

    // If selected project doesn't exist in available projects, select the first one
    const projectExists = PROJECTS.some(p => p.id === selectedProject);
    if (!projectExists) {
      setSelectedProject(PROJECTS[0].id);
      return; // This will trigger the next effect
    }

    // If L0 data is empty or for wrong project, load the correct data
    if (l0Data.environmentsOnCanvas.length === 0 || l0Data.projectId !== selectedProject) {
      const savedData = loadL0Data(selectedProject);
      const newData = savedData || getDefaultL0Data(selectedProject, ALL_ENVIRONMENTS, projects);
      setL0Data(newData);
      setL0RebuildTrigger(prev => prev + 1);
    }
  }, [contextLoading, PROJECTS, selectedProject, l0Data.environmentsOnCanvas.length, l0Data.projectId, ALL_ENVIRONMENTS, projects]);

  // Handle project selection change - reload L0 data for the selected project
  useEffect(() => {
    // Skip if we're not on L0 view or if this is the initial render
    if (viewLevel !== 'L0') return;

    // Check if the current l0Data matches the selected project
    if (l0Data.projectId === selectedProject) return;

    console.log('[FlowMap] Project changed to:', selectedProject);

    // Load data for the new project
    const savedData = loadL0Data(selectedProject);
    const newData = savedData || getDefaultL0Data(selectedProject, ALL_ENVIRONMENTS, projects);
    setL0Data(newData);

    // Clear selection when switching projects
    setSelectedL0Env(null);

    // Trigger L0 rebuild after data is set
    // The ref will be updated by the sync effect before the setup effect runs
    setL0RebuildTrigger(prev => prev + 1);
  }, [selectedProject, viewLevel, l0Data.projectId, ALL_ENVIRONMENTS, projects]);

  // Create L0 node style
  const createL0Style = useCallback((env: L0Environment) => {
    const color = stageColors[env.stageKey] || '#64748b';
    return new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: color + '30',
      stroke: `3px ${getStatusColor(env.status)}`,
    });
  }, []);

  // Create L1 node style
  const createL1Style = useCallback((node: L1Node) => {
    const color = domainColors[node.domain] || '#64748b';
    return new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: color + '20',
      stroke: `2px ${getStatusColor(node.status)}`,
    });
  }, []);

  // Create text annotation style
  const createTextStyle = useCallback(() => {
    return new ShapeNodeStyle({
      shape: 'rectangle',
      fill: 'transparent',
      stroke: 'none',
    });
  }, []);

  // Create sticky note style (yellow with slight shadow effect)
  const createNoteStyle = useCallback(() => {
    return new ShapeNodeStyle({
      shape: 'rectangle',
      fill: '#fef08a', // yellow-200
      stroke: '1px #eab308', // yellow-500
    });
  }, []);

  // Create L0 edge style - premium look with bezier curves
  const createL0EdgeStyle = useCallback((link: L0Link) => {
    // Different colors based on link type
    const colors = {
      PROMOTION: '#22c55e', // green
      DATA_SYNC: '#3b82f6', // blue
      REFERENCE: '#a855f7', // purple
    };
    const linkType = link.linkType || 'PROMOTION';
    const color = colors[linkType] || colors.PROMOTION;

    // Locked edges have a dashed appearance
    if (link.locked) {
      return new BezierEdgeStyle({
        stroke: `3px dashed ${color}`,
        targetArrow: new Arrow({
          type: ArrowType.TRIANGLE,
          fill: color,
          lengthScale: 1.2,
          widthScale: 1.2,
        }),
      });
    }

    return new BezierEdgeStyle({
      stroke: `2.5px solid ${color}`,
      targetArrow: new Arrow({
        type: ArrowType.TRIANGLE,
        fill: color,
        lengthScale: 1.5,
        widthScale: 1.5,
      }),
    });
  }, []);

  // Create selected/hovered edge style
  const createL0EdgeStyleSelected = useCallback(() => {
    return new BezierEdgeStyle({
      stroke: '4px solid #fbbf24', // amber
      targetArrow: new Arrow({
        type: ArrowType.TRIANGLE,
        fill: '#fbbf24',
        lengthScale: 1.8,
        widthScale: 1.8,
      }),
    });
  }, []);

  // Delete edge/link
  const handleDeleteEdge = useCallback(() => {
    if (!edgeContextMenu.edge || !edgeContextMenu.link) return;

    const gc = gcRef.current;
    if (gc) {
      // Remove from graph
      gc.graph.remove(edgeContextMenu.edge);
    }

    // Remove from data
    setL0Data(prev => ({
      ...prev,
      links: prev.links.filter(
        l => !(l.sourceId === edgeContextMenu.link!.sourceId && l.targetId === edgeContextMenu.link!.targetId)
      ),
    }));

    setEdgeContextMenu(prev => ({ ...prev, visible: false }));
  }, [edgeContextMenu.edge, edgeContextMenu.link]);

  // Toggle edge lock
  const handleToggleLockEdge = useCallback(() => {
    if (!edgeContextMenu.edge || !edgeContextMenu.link) return;

    const gc = gcRef.current;
    const link = edgeContextMenu.link;
    const newLocked = !link.locked;

    // Update data
    setL0Data(prev => ({
      ...prev,
      links: prev.links.map(l =>
        l.sourceId === link.sourceId && l.targetId === link.targetId
          ? { ...l, locked: newLocked }
          : l
      ),
    }));

    // Update edge style
    if (gc && edgeContextMenu.edge) {
      const updatedLink = { ...link, locked: newLocked };
      edgeContextMenu.edge.tag = { type: 'link', link: updatedLink } as L0EdgeTag;
      gc.graph.setStyle(edgeContextMenu.edge, createL0EdgeStyle(updatedLink));
    }

    setEdgeContextMenu(prev => ({ ...prev, visible: false }));
  }, [edgeContextMenu.edge, edgeContextMenu.link, createL0EdgeStyle]);

  // Open edit modal for edge
  const handleEditEdge = useCallback(() => {
    if (!edgeContextMenu.link) return;
    setEditEdgeModal({ visible: true, link: { ...edgeContextMenu.link } });
    setEdgeContextMenu(prev => ({ ...prev, visible: false }));
  }, [edgeContextMenu.link]);

  // Save edited edge
  const handleSaveEditedEdge = useCallback((updatedLink: L0Link) => {
    const gc = gcRef.current;

    // Update data
    setL0Data(prev => ({
      ...prev,
      links: prev.links.map(l =>
        l.sourceId === updatedLink.sourceId && l.targetId === updatedLink.targetId
          ? updatedLink
          : l
      ),
    }));

    // Update edge in graph
    if (gc && editEdgeModal.link) {
      const edgeId = `${editEdgeModal.link.sourceId}-${editEdgeModal.link.targetId}`;
      const edge = edgeMapRef.current.get(edgeId);
      if (edge) {
        edge.tag = { type: 'link', link: updatedLink } as L0EdgeTag;
        gc.graph.setStyle(edge, createL0EdgeStyle(updatedLink));

        // Update or add label - use Array.from to convert IListEnumerable
        const labels: ILabel[] = Array.from(edge.labels);
        if (updatedLink.label) {
          if (labels.length > 0) {
            gc.graph.setLabelText(labels[0], updatedLink.label);
          } else {
            const edgeLabel = gc.graph.addLabel(edge, updatedLink.label);
            gc.graph.setStyle(edgeLabel, new LabelStyle({
              textFill: '#94a3b8',
              font: '10px Inter, sans-serif',
              backgroundFill: '#1e293b',
              backgroundStroke: '1px #334155',
              padding: new Insets(4, 6, 4, 6),
            }));
          }
        } else {
          // Remove label if cleared
          labels.forEach((l: ILabel) => gc.graph.remove(l));
        }
      }
    }

    setEditEdgeModal({ visible: false, link: null });
  }, [createL0EdgeStyle, editEdgeModal.link]);

  // Build L0 graph from persisted data
  const buildL0 = useCallback((gc: GraphComponent, data: L0Data, allEnvs: L0Environment[]) => {
    const graph = gc.graph;
    graph.clear();
    nodeMapRef.current.clear();
    edgeMapRef.current.clear();

    graph.nodeDefaults.size = new Size(180, 80);
    graph.nodeDefaults.labels.style = new LabelStyle({
      textFill: '#ffffff',
      font: 'bold 16px Inter, sans-serif',
      horizontalTextAlignment: 'center',
    });

    // Default edge style - will be overridden per-edge
    graph.edgeDefaults.style = new BezierEdgeStyle({
      stroke: '2.5px solid #22c55e',
      targetArrow: new Arrow({ type: ArrowType.TRIANGLE, fill: '#22c55e', lengthScale: 1.5, widthScale: 1.5 }),
    });

    // Only show environments that are on the canvas
    const envsOnCanvas = allEnvs.filter(e => data.environmentsOnCanvas.includes(e.id));

    for (const env of envsOnCanvas) {
      const savedPos = data.positions[env.id];
      const nodeOptions: { tag: L0NodeTag; layout?: Rect } = {
        tag: { type: 'environment', data: env } as L0NodeTag,
      };

      // Use saved position if available
      if (savedPos) {
        nodeOptions.layout = new Rect(savedPos.x, savedPos.y, 180, 80);
      }

      const node = graph.createNode(nodeOptions);
      graph.setStyle(node, createL0Style(env));
      graph.addLabel(node, env.name);
      const sub = graph.addLabel(node, `${env.systemCount} systems`);
      graph.setStyle(sub, new LabelStyle({ textFill: '#94a3b8', font: '11px Inter' }));
      graph.setLabelLayoutParameter(sub, ExteriorNodeLabelModel.BOTTOM);
      nodeMapRef.current.set(env.id, node);
    }

    // Create edges for links where both nodes exist with premium styling
    for (const link of data.links) {
      const src = nodeMapRef.current.get(link.sourceId);
      const tgt = nodeMapRef.current.get(link.targetId);
      if (src && tgt) {
        const edge = graph.createEdge({
          source: src,
          target: tgt,
          tag: { type: 'link', link } as L0EdgeTag,
        });
        graph.setStyle(edge, createL0EdgeStyle(link));

        // Add label if present
        if (link.label) {
          const edgeLabel = graph.addLabel(edge, link.label);
          graph.setStyle(edgeLabel, new LabelStyle({
            textFill: '#94a3b8',
            font: '10px Inter, sans-serif',
            backgroundFill: '#1e293b',
            backgroundStroke: '1px #334155',
            padding: new Insets(4, 6, 4, 6),
          }));
        }

        // Track edge for context menu
        const edgeId = `${link.sourceId}-${link.targetId}`;
        edgeMapRef.current.set(edgeId, edge);
      }
    }

    // Create annotations (text and sticky notes)
    annotationMapRef.current.clear();
    if (data.annotations) {
      for (const ann of data.annotations) {
        const width = ann.width || (ann.type === 'note' ? 150 : 200);
        const height = ann.height || (ann.type === 'note' ? 100 : 30);

        const node = graph.createNode({
          layout: new Rect(ann.x, ann.y, width, height),
          tag: { type: 'annotation', annotationType: ann.type, id: ann.id, content: ann.content } as AnnotationTag,
        });

        if (ann.type === 'note') {
          graph.setStyle(node, createNoteStyle());
          const label = graph.addLabel(node, ann.content);
          graph.setStyle(label, new LabelStyle({
            textFill: '#713f12', // yellow-900
            font: '12px Inter, sans-serif',
          }));
        } else {
          graph.setStyle(node, createTextStyle());
          const label = graph.addLabel(node, ann.content);
          graph.setStyle(label, new LabelStyle({
            textFill: '#94a3b8',
            font: '14px Inter, sans-serif',
          }));
        }

        annotationMapRef.current.set(ann.id, node);
      }
    }

    // Only apply layout if no saved positions
    const hasPositions = Object.keys(data.positions).length > 0;
    if (!hasPositions && envsOnCanvas.length > 0) {
      const layout = new HierarchicalLayout({
        layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT,
        minimumLayerDistance: 100,
        nodeDistance: 50,
      });

      LayoutExecutor.ensure();
      gc.applyLayoutAnimated(layout, '300ms').then(() => {
        gc.fitGraphBounds(new Insets(50));
      });
    } else {
      gc.fitGraphBounds(new Insets(50));
    }
  }, [createL0Style, createNoteStyle, createTextStyle]);

  // Build L1 graph with swimlane layout
  const buildL1 = useCallback((gc: GraphComponent, data: L1Data) => {
    const graph = gc.graph;
    graph.clear();
    nodeMapRef.current.clear();

    graph.nodeDefaults.size = new Size(160, 70);

    // Group nodes by domain for positioning
    const nodesByDomain: Record<FlowMapDomain, L1Node[]> = {
      CHANNELS: [],
      BSS: [],
      OSS: [],
      NETWORK: [],
      EXTERNAL: [],
    };

    for (const n of data.nodes) {
      if (nodesByDomain[n.domain]) {
        nodesByDomain[n.domain].push(n);
      }
    }

    // Create nodes positioned within their domain lanes
    for (const n of data.nodes) {
      const domainNodes = nodesByDomain[n.domain];
      const nodeIndex = domainNodes.indexOf(n);

      // Use saved position or calculate default position within lane
      let x = n.x;
      let y = n.y;

      if (x === undefined || y === undefined || !Number.isFinite(x) || !Number.isFinite(y)) {
        const defaultPos = getDefaultPosition(n, nodeIndex, domainNodes.length);
        x = defaultPos.x;
        y = defaultPos.y;
      }

      // Ensure valid coordinates (fallback to safe defaults)
      const safeX = Number.isFinite(x) ? x : 150 + nodeIndex * 180;
      const safeY = Number.isFinite(y) ? y : 100 + Math.floor(nodeIndex / 5) * 100;

      const node = graph.createNode({
        layout: new Rect(safeX, safeY, 160, 70),
        tag: { type: 'system', data: n } as L1NodeTag,
      });
      graph.setStyle(node, createL1Style(n));
      graph.addLabel(node, n.name);

      const domLabel = graph.addLabel(node, n.domain);
      graph.setStyle(domLabel, new LabelStyle({
        textFill: '#fff',
        font: 'bold 8px Inter',
        backgroundFill: domainColors[n.domain] || '#64748b',
      }));
      graph.setLabelLayoutParameter(domLabel, ExteriorNodeLabelModel.TOP);

      nodeMapRef.current.set(n.id, node);
    }

    for (const e of data.edges) {
      const src = nodeMapRef.current.get(e.sourceId);
      const tgt = nodeMapRef.current.get(e.targetId);
      if (src && tgt) {
        const edge = graph.createEdge(src, tgt);
        const color = edgeTypeColors[e.type] || '#64748b';
        graph.setStyle(edge, new PolylineEdgeStyle({
          stroke: `1.5px ${color}`,
          targetArrow: new Arrow({ type: ArrowType.TRIANGLE, fill: color }),
        }));
        if (e.label) graph.addLabel(edge, e.label);
      }
    }

    // Set viewport to show the full canvas with swimlanes
    // Use setTimeout to ensure the component has rendered and has valid dimensions
    setTimeout(() => {
      if (gc.size.width > 0 && gc.size.height > 0) {
        const zoom = Math.min(
          gc.size.width / CANVAS_WIDTH,
          gc.size.height / CANVAS_HEIGHT
        ) * 0.9;
        gc.zoom = Math.max(0.1, Math.min(zoom, 2)); // Clamp between 0.1 and 2
        gc.center = new Point(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      } else {
        // Fallback to fitGraphBounds if dimensions aren't ready
        gc.fitGraphBounds(new Insets(40));
      }
    }, 50);
  }, [createL1Style]);

  // Drill down
  const drillDown = useCallback((env: L0Environment) => {
    const saved = loadL1Data(env.id);
    const base = sampleL1Data[env.id];
    if (!base) return;

    const data = saved || JSON.parse(JSON.stringify(base));
    setSelectedEnv(env);
    setL1Data(data);
    setViewLevel('L1');
  }, []);

  // Drill up
  const drillUp = useCallback(() => {
    // Save L1 positions before leaving
    if (l1DataRef.current && gcRef.current) {
      const updated = l1DataRef.current.nodes.map(n => {
        const gn = nodeMapRef.current.get(n.id);
        return gn ? { ...n, x: gn.layout.x, y: gn.layout.y } : n;
      });
      saveL1Data(l1DataRef.current.environmentId, { ...l1DataRef.current, nodes: updated });
    }

    // Reload L0 data from localStorage to get the latest saved positions
    // This fixes the bug where L0 environments pile up when returning from L1
    const currentProjectId = l0DataRef.current.projectId;
    const savedL0 = loadL0Data(currentProjectId);
    if (savedL0) {
      setL0Data(savedL0);
    }

    setViewLevel('L0');
    setSelectedEnv(null);
    setL1Data(null);
    setSelectedNode(null);
    setSelectedL0Env(null);
  }, []);

  // Manual save function for L1
  const handleManualSaveL1 = useCallback(() => {
    if (!l1DataRef.current || !gcRef.current) return;

    setSaveStatus('saving');

    const updated = l1DataRef.current.nodes.map(n => {
      const gn = nodeMapRef.current.get(n.id);
      return gn ? { ...n, x: gn.layout.x, y: gn.layout.y } : n;
    });

    const updatedData = { ...l1DataRef.current, nodes: updated };
    saveL1Data(l1DataRef.current.environmentId, updatedData);
    setL1Data(updatedData);

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, []);

  // Manual save function for L0
  const handleManualSaveL0 = useCallback(() => {
    const gc = gcRef.current;
    const data = l0DataRef.current;
    if (!gc || !data) return;

    setSaveStatus('saving');

    // Capture current environment positions
    const positions: Record<string, { x: number; y: number }> = {};
    Array.from(nodeMapRef.current.entries()).forEach(([id, node]) => {
      positions[id] = { x: node.layout.x, y: node.layout.y };
    });

    // Capture annotation positions
    const updatedAnnotations = (data.annotations || []).map(ann => {
      const node = annotationMapRef.current.get(ann.id);
      if (node) {
        return {
          ...ann,
          x: node.layout.x,
          y: node.layout.y,
          width: node.layout.width,
          height: node.layout.height,
        };
      }
      return ann;
    });

    const updatedData: L0Data = { ...data, positions, annotations: updatedAnnotations };
    saveL0Data(data.projectId, updatedData);
    setL0Data(updatedData);

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, []);

  // Add environment to L0 canvas
  const addEnvToCanvas = useCallback((envId: string, x?: number, y?: number) => {
    const gc = gcRef.current;
    if (!gc) return;

    const env = ALL_ENVIRONMENTS.find(e => e.id === envId);
    if (!env) return;

    // Add to data
    setL0Data(prev => {
      if (prev.environmentsOnCanvas.includes(envId)) return prev;
      return {
        ...prev,
        environmentsOnCanvas: [...prev.environmentsOnCanvas, envId],
        positions: x !== undefined && y !== undefined
          ? { ...prev.positions, [envId]: { x, y } }
          : prev.positions,
      };
    });

    // Add to graph
    const nodeOptions: { tag: L0NodeTag; layout?: Rect } = {
      tag: { type: 'environment', data: env } as L0NodeTag,
    };
    if (x !== undefined && y !== undefined) {
      nodeOptions.layout = new Rect(x, y, 180, 80);
    }

    const node = gc.graph.createNode(nodeOptions);
    gc.graph.setStyle(node, createL0Style(env));
    gc.graph.addLabel(node, env.name);
    const sub = gc.graph.addLabel(node, `${env.systemCount} systems`);
    gc.graph.setStyle(sub, new LabelStyle({ textFill: '#94a3b8', font: '11px Inter' }));
    gc.graph.setLabelLayoutParameter(sub, ExteriorNodeLabelModel.BOTTOM);
    nodeMapRef.current.set(env.id, node);

    gc.selection.clear();
    gc.selection.add(node);
    setSelectedL0Env(env);
  }, [createL0Style, ALL_ENVIRONMENTS]);

  // Remove environment from L0 canvas
  const removeEnvFromCanvas = useCallback((envId: string) => {
    const gc = gcRef.current;
    if (!gc) return;

    const node = nodeMapRef.current.get(envId);
    if (node) {
      gc.graph.remove(node);
      nodeMapRef.current.delete(envId);
    }

    setL0Data(prev => ({
      ...prev,
      environmentsOnCanvas: prev.environmentsOnCanvas.filter(id => id !== envId),
      links: prev.links.filter(l => l.sourceId !== envId && l.targetId !== envId),
    }));

    setSelectedL0Env(null);
  }, []);

  // Add annotation (text or sticky note) to canvas
  const addAnnotation = useCallback((type: 'text' | 'note', x: number, y: number) => {
    const gc = gcRef.current;
    if (!gc) return;

    const content = type === 'note'
      ? prompt('Enter note content:', 'New note...')
      : prompt('Enter text:', 'Label text');

    if (!content) return;

    const id = `ann-${Date.now()}`;
    const width = type === 'note' ? 150 : 200;
    const height = type === 'note' ? 100 : 30;

    const annotation: Annotation = {
      id,
      type,
      content,
      x,
      y,
      width,
      height,
    };

    // Create the node on the graph
    const node = gc.graph.createNode({
      layout: new Rect(x, y, width, height),
      tag: { type: 'annotation', annotationType: type, id, content } as AnnotationTag,
    });

    if (type === 'note') {
      gc.graph.setStyle(node, createNoteStyle());
      const label = gc.graph.addLabel(node, content);
      gc.graph.setStyle(label, new LabelStyle({
        textFill: '#713f12',
        font: '12px Inter, sans-serif',
      }));
    } else {
      gc.graph.setStyle(node, createTextStyle());
      const label = gc.graph.addLabel(node, content);
      gc.graph.setStyle(label, new LabelStyle({
        textFill: '#94a3b8',
        font: '14px Inter, sans-serif',
      }));
    }

    annotationMapRef.current.set(id, node);

    // Update L0 data
    setL0Data(prev => ({
      ...prev,
      annotations: [...(prev.annotations || []), annotation],
    }));

    gc.selection.clear();
    gc.selection.add(node);
    setSelectedAnnotation(annotation);
  }, [createNoteStyle, createTextStyle]);

  // Remove annotation from canvas
  const removeAnnotation = useCallback((annId: string) => {
    const gc = gcRef.current;
    if (!gc) return;

    const node = annotationMapRef.current.get(annId);
    if (node) {
      gc.graph.remove(node);
      annotationMapRef.current.delete(annId);
    }

    setL0Data(prev => ({
      ...prev,
      annotations: (prev.annotations || []).filter(a => a.id !== annId),
    }));

    setSelectedAnnotation(null);
  }, []);

  // Track if component is mounted and ready
  const [isReady, setIsReady] = useState(false);

  // Initialize GraphComponent - wait for container to have dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Skip if already initialized
    if (gcRef.current) {
      console.log('[FlowMap] GraphComponent already exists');
      setIsReady(true);
      return;
    }

    // Wait for container to have proper dimensions
    const checkAndInit = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        console.log('[FlowMap] Creating GraphComponent with dimensions:', rect.width, rect.height);
        const gc = new GraphComponent(container);
        gcRef.current = gc;

        if (overviewRef.current && !overviewGcRef.current) {
          overviewGcRef.current = new GraphOverviewComponent(overviewRef.current, gc);
        }

        setIsReady(true);
        return true;
      }
      return false;
    };

    // Try immediately
    if (checkAndInit()) return;

    // If not ready, poll until container has dimensions
    console.log('[FlowMap] Waiting for container dimensions...');
    const interval = setInterval(() => {
      if (checkAndInit()) {
        clearInterval(interval);
      }
    }, 50);

    // Timeout after 2 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.warn('[FlowMap] Timeout waiting for container dimensions');
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      if (gcRef.current) {
        console.log('[FlowMap] Cleaning up');
        overviewGcRef.current?.cleanUp();
        overviewGcRef.current = null;
        gcRef.current.cleanUp();
        gcRef.current = null;
      }
    };
  }, []);

  // Setup view based on viewLevel
  useEffect(() => {
    // Wait for component to be ready
    if (!isReady) {
      console.log('[FlowMap] Waiting for GraphComponent to be ready');
      return;
    }

    const gc = gcRef.current;
    if (!gc) {
      console.log('[FlowMap] No GraphComponent yet');
      return;
    }

    console.log('[FlowMap] Setting up view:', viewLevel);

    // Disable current input mode before clearing
    if (gc.inputMode) {
      gc.inputMode = null;
    }

    // Clear existing graph
    gc.graph.clear();
    nodeMapRef.current.clear();

    // Delay to ensure GraphComponent is fully mounted and has valid dimensions
    // This prevents "parentInputModeContext is null" errors
    const setupTimer = setTimeout(() => {
      // Double check gc still exists and is properly initialized
      if (!gcRef.current) return;

      // Verify the GraphComponent has valid dimensions
      const gcSize = gcRef.current.size;
      if (gcSize.width === 0 || gcSize.height === 0) {
        console.warn('[FlowMap] GraphComponent not ready (size is 0), retrying...');
        // Retry after another delay
        setTimeout(() => {
          if (gcRef.current) {
            // Force a re-render by toggling isReady
            setIsReady(false);
            requestAnimationFrame(() => setIsReady(true));
          }
        }, 100);
        return;
      }

      if (viewLevel === 'L0') {
        // Use editor mode for L0 so nodes can be moved
        const mode = new GraphEditorInputMode({
          allowCreateNode: false,
          allowCreateEdge: true, // Allow creating promotion links
        });

        // Double-click to drill down
        mode.addEventListener('item-double-clicked', (e) => {
          const tag = e.item?.tag as L0NodeTag | undefined;
          if (tag?.type === 'environment') drillDown(tag.data);
        });

        // Edge creation - add to links with default type
        mode.createEdgeInputMode.addEventListener('edge-created', (e) => {
          const srcTag = e.item?.sourceNode?.tag as L0NodeTag | undefined;
          const tgtTag = e.item?.targetNode?.tag as L0NodeTag | undefined;
          if (srcTag?.type === 'environment' && tgtTag?.type === 'environment') {
            const newLink: L0Link = {
              sourceId: srcTag.data.id,
              targetId: tgtTag.data.id,
              linkType: 'PROMOTION',
              locked: false,
            };
            setL0Data(prev => ({
              ...prev,
              links: [...prev.links, newLink],
            }));
            // Apply premium style to newly created edge
            if (e.item) {
              e.item.tag = { type: 'link', link: newLink } as L0EdgeTag;
              gc.graph.setStyle(e.item, createL0EdgeStyle(newLink));
            }
          }
        });

        // Enable hover for both nodes and edges
        mode.itemHoverInputMode.enabled = true;
        mode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.EDGE;

        // Edge hover effect - highlight on hover
        mode.itemHoverInputMode.addEventListener('hovered-item-changed', (e) => {
          const oldItem = e.oldItem;
          const newItem = e.item;

          // Restore old edge style
          if (oldItem && oldItem instanceof Object && 'sourceNode' in oldItem) {
            const edgeTag = (oldItem as IEdge).tag as L0EdgeTag | null;
            if (edgeTag?.type === 'link') {
              gc.graph.setStyle(oldItem as IEdge, createL0EdgeStyle(edgeTag.link));
            }
          }

          // Highlight new edge
          if (newItem && newItem instanceof Object && 'sourceNode' in newItem) {
            gc.graph.setStyle(newItem as IEdge, createL0EdgeStyleSelected());
          }
        });

        gc.inputMode = mode;

        // Right-click context menu for edges
        gc.htmlElement.addEventListener('contextmenu', (e: MouseEvent) => {
          e.preventDefault();
          // Convert from page coordinates to view coordinates, then to world
          const rect = gc.htmlElement.getBoundingClientRect();
          const viewPoint = new Point(e.clientX - rect.left, e.clientY - rect.top);
          const worldPoint = gc.viewToWorldCoordinates(viewPoint);

          // Check if we clicked on an edge
          const hitResult = gc.graphModelManager.hitElementsAt(worldPoint).toArray();
          for (const item of hitResult) {
            if (item instanceof Object && 'sourceNode' in item) {
              const edge = item as IEdge;
              const edgeTag = edge.tag as L0EdgeTag | null;
              if (edgeTag?.type === 'link') {
                setEdgeContextMenu({
                  visible: true,
                  x: e.clientX,
                  y: e.clientY,
                  edge,
                  link: edgeTag.link,
                });
                return;
              }
            }
          }
          // Close menu if clicked elsewhere
          setEdgeContextMenu(prev => ({ ...prev, visible: false }));
        });

        // Build graph first - use ref to avoid dependency on l0Data state
        // This prevents unnecessary rebuilds when positions auto-save
        buildL0(gc, l0DataRef.current, ALL_ENVIRONMENTS);

        // Auto-save on node move
        let timer: NodeJS.Timeout | null = null;
        gc.graph.addEventListener('node-layout-changed', () => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            const data = l0DataRef.current;
            if (!data) return;
            const positions: Record<string, { x: number; y: number }> = {};
            Array.from(nodeMapRef.current.entries()).forEach(([id, node]) => {
              positions[id] = { x: node.layout.x, y: node.layout.y };
            });
            saveL0Data(data.projectId, { ...data, positions });
          }, 500);
        });

        // Selection tracking - use longer delay to ensure inputMode is fully initialized
        setTimeout(() => {
          if (!gcRef.current) return;
          gc.selection.addEventListener('item-added', (e) => {
            const tag = e.item?.tag as L0NodeTag | undefined;
            if (tag?.type === 'environment') setSelectedL0Env(tag.data);
          });
          gc.selection.addEventListener('item-removed', () => {
            if (!gc.selection.size) setSelectedL0Env(null);
          });
        }, 100);

      } else if (viewLevel === 'L1' && l1Data) {
        const mode = new GraphEditorInputMode({
          allowCreateNode: false,
          allowCreateEdge: true,
        });

        // Edge creation
        mode.createEdgeInputMode.addEventListener('edge-created', (e) => {
          const srcTag = e.item?.sourceNode?.tag as L1NodeTag | undefined;
          const tgtTag = e.item?.targetNode?.tag as L1NodeTag | undefined;
          if (srcTag?.type === 'system' && tgtTag?.type === 'system') {
            const label = prompt('Integration label:');
            if (label && e.item) gc.graph.addLabel(e.item, label);

            const newEdge: L1Edge = {
              id: generateEdgeId(),
              sourceId: srcTag.data.id,
              targetId: tgtTag.data.id,
              label: label || undefined,
              type: 'API',
            };
            setL1Data(prev => prev ? { ...prev, edges: [...prev.edges, newEdge] } : null);
          }
        });

        gc.inputMode = mode;

        // Build graph first
        buildL1(gc, l1Data);

        // Save on node move (auto-save with debounce) - attached to graph, not selection
        let timer: NodeJS.Timeout | null = null;
        gc.graph.addEventListener('node-layout-changed', () => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            const data = l1DataRef.current;
            if (!data) return;
            const updated = data.nodes.map(n => {
              const gn = nodeMapRef.current.get(n.id);
              return gn ? { ...n, x: gn.layout.x, y: gn.layout.y } : n;
            });
            saveL1Data(data.environmentId, { ...data, nodes: updated });
          }, 500);
        });

        // Selection listeners - use longer delay to ensure inputMode is fully initialized
        setTimeout(() => {
          if (!gcRef.current) return;
          gc.selection.addEventListener('item-added', (e) => {
            const tag = e.item?.tag as L1NodeTag | undefined;
            if (tag?.type === 'system') setSelectedNode(tag.data);
          });
          gc.selection.addEventListener('item-removed', () => {
            if (!gc.selection.size) setSelectedNode(null);
          });
        }, 100);
      }
    }, 100); // Delay for GraphComponent to fully initialize

    return () => {
      clearTimeout(setupTimer);
    };
    // Note: l0Data is intentionally NOT in dependencies - we use l0DataRef.current instead
    // This prevents unnecessary graph rebuilds when positions auto-save
    // l0RebuildTrigger is used to force rebuild when project changes
    // ALL_ENVIRONMENTS is included so graph rebuilds when context data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, viewLevel, l1Data, l0RebuildTrigger, buildL0, buildL1, drillDown, ALL_ENVIRONMENTS]);

  // Add new node - constrained to lane bounds
  const addNode = useCallback((type: L1NodeType, x: number, y: number) => {
    const gc = gcRef.current;
    const data = l1DataRef.current;
    if (!gc || !data) return;

    // Determine which domain the drop position is in
    let dropDomain: FlowMapDomain = selectedDomain;

    // Check if dropped in External column
    if (x >= LANE_HEADER_WIDTH + MAIN_AREA_WIDTH) {
      dropDomain = 'EXTERNAL';
    } else if (x >= LANE_HEADER_WIDTH) {
      // Check which horizontal lane
      const laneIndex = Math.floor(y / LANE_HEIGHT);
      if (laneIndex >= 0 && laneIndex < HORIZONTAL_LANES.length) {
        dropDomain = HORIZONTAL_LANES[laneIndex].domain;
      }
    }

    // Get lane bounds and constrain position
    const bounds = getLaneBounds(dropDomain);
    const nodeWidth = 160;
    const nodeHeight = 70;

    const constrainedX = Math.max(bounds.x + 10, Math.min(x, bounds.x + bounds.width - nodeWidth - 10));
    const constrainedY = Math.max(bounds.y + 10, Math.min(y, bounds.y + bounds.height - nodeHeight - 10));

    const newNode: L1Node = {
      id: generateNodeId(),
      name: `New ${nodeTypeConfig[type].label}`,
      type,
      domain: dropDomain,
      status: 'unknown',
      x: constrainedX,
      y: constrainedY,
    };

    const node = gc.graph.createNode({
      layout: new Rect(constrainedX, constrainedY, nodeWidth, nodeHeight),
      tag: { type: 'system', data: newNode } as L1NodeTag,
    });
    gc.graph.setStyle(node, createL1Style(newNode));
    gc.graph.addLabel(node, newNode.name);

    const domLabel = gc.graph.addLabel(node, newNode.domain);
    gc.graph.setStyle(domLabel, new LabelStyle({
      textFill: '#fff',
      font: 'bold 8px Inter',
      backgroundFill: domainColors[newNode.domain] || '#64748b',
    }));
    gc.graph.setLabelLayoutParameter(domLabel, ExteriorNodeLabelModel.TOP);

    nodeMapRef.current.set(newNode.id, node);

    setL1Data(prev => prev ? { ...prev, nodes: [...prev.nodes, newNode] } : null);
    gc.selection.clear();
    gc.selection.add(node);
    setSelectedNode(newNode);
  }, [selectedDomain, createL1Style]);

  // Add system from catalog to canvas
  const addSystemToCanvas = useCallback((sys: SystemDefinition, x: number, y: number) => {
    const gc = gcRef.current;
    const data = l1DataRef.current;
    if (!gc || !data) return;

    // Determine domain from layer
    let domain: FlowMapDomain = 'BSS';
    if (sys.layer === 'OSS') domain = 'OSS';
    else if (sys.layer === 'INFRA') domain = 'NETWORK';
    else if (sys.layer === 'EXTERNAL') domain = 'EXTERNAL';

    // Get lane bounds and constrain position
    const bounds = getLaneBounds(domain);
    const nodeWidth = 160;
    const nodeHeight = 70;

    const constrainedX = Math.max(bounds.x + 10, Math.min(x, bounds.x + bounds.width - nodeWidth - 10));
    const constrainedY = Math.max(bounds.y + 10, Math.min(y, bounds.y + bounds.height - nodeHeight - 10));

    const newNode: L1Node = {
      id: generateNodeId(),
      name: sys.name,
      type: sys.defaultType,
      domain,
      status: 'unknown',
      x: constrainedX,
      y: constrainedY,
      vendor: sys.vendor,
      deployedComponent: sys.vendor ? `${sys.vendor} ${sys.name.replace('-', ' ')}` : sys.name,
      deployedVersion: 'v1.0.0',
    };

    const node = gc.graph.createNode({
      layout: new Rect(constrainedX, constrainedY, nodeWidth, nodeHeight),
      tag: { type: 'system', data: newNode } as L1NodeTag,
    });
    gc.graph.setStyle(node, createL1Style(newNode));
    gc.graph.addLabel(node, newNode.name);

    const domLabel = gc.graph.addLabel(node, newNode.domain);
    gc.graph.setStyle(domLabel, new LabelStyle({
      textFill: '#fff',
      font: 'bold 8px Inter',
      backgroundFill: domainColors[newNode.domain] || '#64748b',
    }));
    gc.graph.setLabelLayoutParameter(domLabel, ExteriorNodeLabelModel.TOP);

    nodeMapRef.current.set(newNode.id, node);
    setL1Data(prev => prev ? { ...prev, nodes: [...prev.nodes, newNode] } : null);
    gc.selection.clear();
    gc.selection.add(node);
    setSelectedNode(newNode);
  }, [createL1Style]);

  // Drag & drop for L1 (systems)
  useEffect(() => {
    const container = containerRef.current;
    const gc = gcRef.current;
    if (!container || !gc || viewLevel !== 'L1') return;

    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('text/plain') || e.dataTransfer?.types.includes('application/x-system')) {
        e.preventDefault();
      }
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const vp = new Point(e.clientX - rect.left, e.clientY - rect.top);
      const wp = gc.viewToWorldCoordinates(vp);

      // Check for system catalog item
      const systemData = e.dataTransfer?.getData('application/x-system');
      if (systemData) {
        try {
          const sys = JSON.parse(systemData) as SystemDefinition;
          addSystemToCanvas(sys, wp.x - 80, wp.y - 35);
          return;
        } catch (err) {
          console.error('Failed to parse system data', err);
        }
      }

      // Fallback to old toolbox items
      const type = e.dataTransfer?.getData('text/plain') as L1NodeType;
      if (type && toolboxItems.some(t => t.type === type)) {
        addNode(type, wp.x - 80, wp.y - 35);
      }
    };

    container.addEventListener('dragover', onDragOver);
    container.addEventListener('drop', onDrop);
    return () => {
      container.removeEventListener('dragover', onDragOver);
      container.removeEventListener('drop', onDrop);
    };
  }, [viewLevel, addNode, addSystemToCanvas]);

  // Drag & drop for L0 (environments and annotations)
  useEffect(() => {
    const container = containerRef.current;
    const gc = gcRef.current;
    if (!container || !gc || viewLevel !== 'L0') return;

    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('application/x-environment') ||
          e.dataTransfer?.types.includes('application/x-annotation')) {
        e.preventDefault();
      }
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const vp = new Point(e.clientX - rect.left, e.clientY - rect.top);
      const wp = gc.viewToWorldCoordinates(vp);

      // Check for environment drop
      const envId = e.dataTransfer?.getData('application/x-environment');
      if (envId) {
        addEnvToCanvas(envId, wp.x - 90, wp.y - 40);
        return;
      }

      // Check for annotation drop
      const annotationType = e.dataTransfer?.getData('application/x-annotation') as 'text' | 'note' | null;
      if (annotationType) {
        addAnnotation(annotationType, wp.x - 75, wp.y - 15);
      }
    };

    container.addEventListener('dragover', onDragOver);
    container.addEventListener('drop', onDrop);
    return () => {
      container.removeEventListener('dragover', onDragOver);
      container.removeEventListener('drop', onDrop);
    };
  }, [viewLevel, addEnvToCanvas, addAnnotation]);

  // Legend and minimap dragging
  useEffect(() => {
    if (!isDraggingLegend && !isDraggingMinimap) return;

    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingLegend) {
        setLegendPosition({
          x: e.clientX - legendDragOffset.current.x,
          y: e.clientY - legendDragOffset.current.y,
        });
      }
      if (isDraggingMinimap) {
        setMinimapPosition({
          x: e.clientX - minimapDragOffset.current.x,
          y: e.clientY - minimapDragOffset.current.y,
        });
      }
    };

    const onMouseUp = () => {
      setIsDraggingLegend(false);
      setIsDraggingMinimap(false);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingLegend, isDraggingMinimap]);

  // Track viewport changes for swimlane positioning
  const [swimlaneTransform, setSwimlaneTransform] = useState({ x: 0, y: 0, scale: 1 });

  useEffect(() => {
    const gc = gcRef.current;
    if (!gc || viewLevel !== 'L1') return;

    const updateTransform = () => {
      const zoom = gc.zoom;
      const viewPoint = gc.viewPoint;
      setSwimlaneTransform({
        x: -viewPoint.x * zoom,
        y: -viewPoint.y * zoom,
        scale: zoom,
      });
    };

    // Initial update
    setTimeout(updateTransform, 100);

    // Listen for viewport changes
    gc.addEventListener('viewport-changed', updateTransform);

    return () => {
      gc.removeEventListener('viewport-changed', updateTransform);
    };
  }, [viewLevel, l1Data]);

  const stageColor = selectedEnv ? stageColors[selectedEnv.stageKey] : '#64748b';

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-800 z-30 flex items-center px-4">
        <div className="flex items-center gap-2">
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          {viewLevel === 'L1' && (
            <button onClick={drillUp} className="p-2 hover:bg-slate-800 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {viewLevel === 'L0' ? (
            <span className="text-slate-400 flex items-center gap-2">
              L0 Environment Overview
              {contextLoading && (
                <svg className="animate-spin h-4 w-4 text-blue-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
            </span>
          ) : (
            <>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-600 text-white mr-2">
                L1 View
              </span>
              <span className="text-slate-400">Environment Detail</span>
            </>
          )}
          {selectedEnv && (
            <>
              <span className="text-slate-600 mx-1">/</span>
              <span className="font-medium">{selectedEnv.name}</span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: stageColor + '30', color: stageColor }}>
                {selectedEnv.stageKey}
              </span>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Save button - shown for both L0 and L1 */}
          <button
            onClick={viewLevel === 'L0' ? handleManualSaveL0 : handleManualSaveL1}
            disabled={saveStatus === 'saving'}
            className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors ${
              saveStatus === 'saved'
                ? 'bg-green-600 text-white'
                : saveStatus === 'saving'
                ? 'bg-slate-700 text-slate-400'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H5.5z" />
                </svg>
                Save
              </>
            )}
          </button>
          <button onClick={() => gcRef.current?.fitGraphBounds(new Insets(40))} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm">
            Fit
          </button>
          {viewLevel === 'L0' && (
            <button
              onClick={refreshContext}
              disabled={contextLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm flex items-center gap-1.5 disabled:opacity-50"
              title="Refresh data from server"
            >
              <svg className={`h-4 w-4 ${contextLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync
            </button>
          )}
        </div>
      </div>

      {/* Sidebar (L0) */}
      {viewLevel === 'L0' && sidebarOpen && (
        <div className="w-56 bg-slate-900 border-r border-slate-800 pt-14 z-20 flex flex-col">
          {/* Project Selector */}
          <div className="p-4 border-b border-slate-800">
            <label className="text-xs text-slate-500 mb-1 block">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PROJECTS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Environment List */}
          <div className="p-4 border-b border-slate-800 flex-1 overflow-auto">
            <h3 className="text-sm font-medium mb-2">List of environments</h3>
            <div className="border border-slate-700 rounded bg-slate-800/50 max-h-64 overflow-auto">
              {ALL_ENVIRONMENTS.map(env => {
                const isOnCanvas = l0Data.environmentsOnCanvas.includes(env.id);
                const color = stageColors[env.stageKey] || '#64748b';
                return (
                  <div
                    key={env.id}
                    draggable={!isOnCanvas}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/x-environment', env.id);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    className={`px-3 py-1.5 text-sm border-b border-slate-700 last:border-b-0 flex items-center justify-between ${
                      isOnCanvas
                        ? 'text-slate-500 bg-slate-800/30'
                        : 'cursor-grab hover:bg-slate-700/50'
                    }`}
                  >
                    <span style={{ color: isOnCanvas ? undefined : color }}>{env.name}</span>
                    {isOnCanvas && (
                      <span className="text-xs text-slate-600">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Drag to add to canvas
            </p>
          </div>

          {/* Annotation Tools */}
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-medium mb-2">Annotations</h3>
            <div className="flex flex-col gap-2">
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/x-annotation', 'text');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm border border-slate-700 cursor-grab flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                Text Label
              </div>
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/x-annotation', 'note');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className="px-3 py-2 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded text-sm border border-yellow-400 cursor-grab flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                Sticky Note
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Drag to add to canvas
            </p>
          </div>

          {/* View Options */}
          <div className="p-4">
            <h3 className="text-sm font-medium mb-2">View</h3>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showMinimap}
                onChange={(e) => setShowMinimap(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
              />
              Show Minimap
            </label>
          </div>
        </div>
      )}

      {/* Sidebar (L1) */}
      {viewLevel === 'L1' && sidebarOpen && (
        <div className="w-56 bg-slate-900 border-r border-slate-800 pt-14 z-20 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-medium mb-2">Target Domain</h3>
            <div className="flex flex-wrap gap-1">
              {(['CHANNELS', 'BSS', 'OSS', 'NETWORK', 'EXTERNAL'] as FlowMapDomain[]).map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDomain(d)}
                  className={`px-2 py-1 text-xs rounded transition-colors`}
                  style={{
                    backgroundColor: selectedDomain === d ? (domainColors[d] || '#64748b') : '#1e293b',
                    color: selectedDomain === d ? '#fff' : '#94a3b8',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Drop location auto-detects domain
            </p>
          </div>
          {/* Add System - scrollable list */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-slate-800">
            <div className="p-4 pb-2">
              <h3 className="text-sm font-medium mb-2">Add System</h3>
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search systems..."
                  value={systemsSearchQuery}
                  onChange={(e) => setSystemsSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {systemsSearchQuery && (
                  <button
                    onClick={() => setSystemsSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {!systemsSearchQuery && (
                  <svg className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Drag to canvas
              </p>
            </div>
            {/* Scrollable systems list */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {SYSTEMS_CATALOG
                .filter(sys =>
                  sys.name.toLowerCase().includes(systemsSearchQuery.toLowerCase()) ||
                  sys.description.toLowerCase().includes(systemsSearchQuery.toLowerCase()) ||
                  sys.layer.toLowerCase().includes(systemsSearchQuery.toLowerCase())
                )
                .map(sys => (
                  <div
                    key={sys.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/x-system', JSON.stringify(sys));
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    className="px-2 py-1.5 mb-1 rounded hover:bg-slate-800 cursor-grab active:cursor-grabbing group transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        sys.layer === 'BSS' ? 'bg-violet-500' :
                        sys.layer === 'OSS' ? 'bg-cyan-500' :
                        sys.layer === 'INFRA' ? 'bg-teal-500' :
                        'bg-amber-500'
                      }`} />
                      <span className="text-sm truncate group-hover:text-white transition-colors">{sys.name}</span>
                    </div>
                  </div>
                ))}
              {SYSTEMS_CATALOG.filter(sys =>
                sys.name.toLowerCase().includes(systemsSearchQuery.toLowerCase()) ||
                sys.description.toLowerCase().includes(systemsSearchQuery.toLowerCase()) ||
                sys.layer.toLowerCase().includes(systemsSearchQuery.toLowerCase())
              ).length === 0 && (
                <div className="px-3 py-4 text-sm text-slate-500 text-center">No systems found</div>
              )}
            </div>
          </div>
          {/* View Options */}
          <div className="p-4">
            <h3 className="text-sm font-medium mb-2">View</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMinimap}
                  onChange={(e) => setShowMinimap(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                Show Minimap
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                Show Legend
              </label>
            </div>
            {(showLegend && legendPosition.x !== -1) || (showMinimap && minimapPosition.x !== -1) ? (
              <div className="mt-2 space-y-1">
                {showLegend && legendPosition.x !== -1 && (
                  <button
                    onClick={() => setLegendPosition({ x: -1, y: -1 })}
                    className="block text-xs text-blue-400 hover:text-blue-300"
                  >
                    Reset Legend Position
                  </button>
                )}
                {showMinimap && minimapPosition.x !== -1 && (
                  <button
                    onClick={() => setMinimapPosition({ x: -1, y: -1 })}
                    className="block text-xs text-blue-400 hover:text-blue-300"
                  >
                    Reset Minimap Position
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Main canvas */}
      <div className="flex-1 relative pt-14 overflow-hidden">
        {/* Swimlane background (L1 only) */}
        {viewLevel === 'L1' && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ marginTop: '56px' }}
          >
            <svg
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                transformOrigin: '0 0',
                transform: `translate(${swimlaneTransform.x}px, ${swimlaneTransform.y}px) scale(${swimlaneTransform.scale})`,
              }}
            >
              {/* Background */}
              <rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#0f172a" />

              {/* Horizontal lanes */}
              {HORIZONTAL_LANES.map((lane, idx) => {
                const y = idx * LANE_HEIGHT;
                return (
                  <g key={lane.domain}>
                    {/* Lane background */}
                    <rect
                      x={LANE_HEADER_WIDTH}
                      y={y}
                      width={MAIN_AREA_WIDTH}
                      height={LANE_HEIGHT}
                      fill={lane.color + '08'}
                      stroke={lane.color + '40'}
                      strokeWidth={1}
                    />
                    {/* Lane header */}
                    <rect
                      x={0}
                      y={y}
                      width={LANE_HEADER_WIDTH}
                      height={LANE_HEIGHT}
                      fill={lane.color + '15'}
                    />
                    {/* Lane label */}
                    <text
                      x={LANE_HEADER_WIDTH / 2}
                      y={y + LANE_HEIGHT / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={lane.color}
                      fontSize={14}
                      fontWeight="600"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {lane.label}
                    </text>
                    {/* Lane separator */}
                    {idx > 0 && (
                      <line
                        x1={0}
                        y1={y}
                        x2={LANE_HEADER_WIDTH + MAIN_AREA_WIDTH}
                        y2={y}
                        stroke={lane.color + '30'}
                        strokeWidth={1}
                        strokeDasharray="4 4"
                      />
                    )}
                  </g>
                );
              })}

              {/* External column on right */}
              <rect
                x={LANE_HEADER_WIDTH + MAIN_AREA_WIDTH}
                y={0}
                width={EXTERNAL_COLUMN_WIDTH}
                height={CANVAS_HEIGHT}
                fill="#f59e0b08"
                stroke="#f59e0b40"
                strokeWidth={1}
              />
              {/* External header */}
              <rect
                x={LANE_HEADER_WIDTH + MAIN_AREA_WIDTH}
                y={0}
                width={EXTERNAL_COLUMN_WIDTH}
                height={40}
                fill="#f59e0b15"
              />
              <text
                x={LANE_HEADER_WIDTH + MAIN_AREA_WIDTH + EXTERNAL_COLUMN_WIDTH / 2}
                y={20}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#f59e0b"
                fontSize={14}
                fontWeight="600"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                External
              </text>

              {/* Vertical separator between main area and external */}
              <line
                x1={LANE_HEADER_WIDTH + MAIN_AREA_WIDTH}
                y1={0}
                x2={LANE_HEADER_WIDTH + MAIN_AREA_WIDTH}
                y2={CANVAS_HEIGHT}
                stroke="#f59e0b30"
                strokeWidth={2}
              />
            </svg>
          </div>
        )}

        {/* yFiles container */}
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ backgroundColor: viewLevel === 'L1' ? 'transparent' : '#0f172a' }}
        />

        {/* Minimap */}
        <div
          className={`absolute select-none transition-opacity ${
            showMinimap ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={
            minimapPosition.x === -1
              ? { bottom: 16, left: 16 }
              : { left: minimapPosition.x, top: minimapPosition.y }
          }
          onMouseDown={(e) => {
            // Only start drag from the header area (first 20px)
            const rect = e.currentTarget.getBoundingClientRect();
            if (e.clientY - rect.top < 20) {
              setIsDraggingMinimap(true);
              minimapDragOffset.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              };
              e.preventDefault();
            }
          }}
        >
          {/* Draggable header */}
          <div className="w-48 h-5 bg-slate-800 border border-slate-700 border-b-0 rounded-t cursor-move flex items-center justify-between px-2">
            <span className="text-xs text-slate-400">Minimap</span>
            <svg className="w-2.5 h-2.5 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 0zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 6z"/>
            </svg>
          </div>
          <div
            ref={overviewRef}
            className="w-48 h-32 bg-slate-900 border border-slate-700 rounded-b"
          />
        </div>

        {/* L0 hint */}
        {viewLevel === 'L0' && !selectedL0Env && (
          <div className="absolute top-20 right-4 bg-slate-900 border border-slate-700 rounded p-3 text-sm max-w-xs">
            <p className="font-medium mb-1">L0 Environment Overview</p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Double-click to drill down</li>
              <li>• Drag environments from sidebar</li>
              <li>• Drag between nodes to create links</li>
            </ul>
          </div>
        )}

        {/* L1 legend */}
        {viewLevel === 'L1' && showLegend && (
          <div
            className="absolute bg-slate-900/90 border border-slate-700 rounded text-xs select-none"
            style={
              legendPosition.x === -1
                ? { bottom: 16, right: 16 }
                : { left: legendPosition.x, top: legendPosition.y }
            }
            onMouseDown={(e) => {
              // Only start drag from the header area
              const rect = e.currentTarget.getBoundingClientRect();
              if (e.clientY - rect.top < 30) {
                setIsDraggingLegend(true);
                legendDragOffset.current = {
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                };
                e.preventDefault();
              }
            }}
          >
            {/* Draggable header */}
            <div className="px-3 py-2 border-b border-slate-700 cursor-move flex items-center justify-between">
              <span className="font-medium text-slate-300">Legend</span>
              <svg className="w-3 h-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
              </svg>
            </div>
            <div className="p-3 space-y-1">
              {HORIZONTAL_LANES.map(lane => (
                <div key={lane.domain} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: lane.color + '40' }} />
                  <span className="text-slate-400">{lane.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b40' }} />
                <span className="text-slate-400">External</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details panel (L1) */}
      {viewLevel === 'L1' && selectedNode && (
        <div className="w-80 bg-slate-900 border-l border-slate-800 pt-14 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h2 className="font-semibold text-lg">{selectedNode.name}</h2>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: domainColors[selectedNode.domain] + '30', color: domainColors[selectedNode.domain] }}>
                {selectedNode.domain}
              </span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: getStatusColor(selectedNode.status) + '30', color: getStatusColor(selectedNode.status) }}>
                {selectedNode.status}
              </span>
              {selectedNode.deploymentType && (
                <span className={`px-2 py-0.5 rounded text-xs ${selectedNode.deploymentType === 'cloud' ? 'bg-blue-900/50 text-blue-300' : 'bg-slate-700 text-slate-300'}`}>
                  {selectedNode.deploymentType === 'cloud' ? '☁️ Cloud' : '🏢 On-Prem'}
                </span>
              )}
            </div>

            {/* Basic Info */}
            <div className="mt-4 space-y-1 text-sm">
              <div className="text-slate-500 text-xs uppercase font-medium mb-2">Basic Info</div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="text-slate-300">{nodeTypeConfig[selectedNode.type].label}</span>
              </div>
              {selectedNode.version && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Version</span>
                  <span className="text-slate-300">{selectedNode.version}</span>
                </div>
              )}
            </div>

            {/* Database-specific details */}
            {selectedNode.type === 'DATABASE' && (
              <div className="mt-4 space-y-1 text-sm border-t border-slate-800 pt-4">
                <div className="text-slate-500 text-xs uppercase font-medium mb-2">Database Details</div>
                {selectedNode.databaseType && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Database Type</span>
                    <span className="text-slate-300 font-medium">{selectedNode.databaseType}</span>
                  </div>
                )}
                {selectedNode.databaseVersion && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">DB Version</span>
                    <span className="text-slate-300 text-xs">{selectedNode.databaseVersion}</span>
                  </div>
                )}
                {selectedNode.hostname && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hostname</span>
                    <span className="text-slate-300 font-mono text-xs">{selectedNode.hostname}</span>
                  </div>
                )}
                {selectedNode.ip && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">IP Address</span>
                    <span className="text-slate-300 font-mono text-xs">{selectedNode.ip}</span>
                  </div>
                )}
                {selectedNode.subnet && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subnet</span>
                    <span className="text-slate-300 font-mono text-xs">{selectedNode.subnet}</span>
                  </div>
                )}
                {selectedNode.hostingPlatform && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Platform</span>
                    <span className="text-slate-300">{selectedNode.hostingPlatform}</span>
                  </div>
                )}
                {selectedNode.deploymentType === 'on-prem' && selectedNode.datacenter && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Datacenter</span>
                    <span className="text-slate-300">{selectedNode.datacenter}</span>
                  </div>
                )}
                {selectedNode.deploymentType === 'cloud' && selectedNode.vnetSegment && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">VNet Segment</span>
                    <span className="text-slate-300 font-mono text-xs break-all">{selectedNode.vnetSegment}</span>
                  </div>
                )}
              </div>
            )}

            {/* Server/Queue infrastructure details (non-database, non-API) */}
            {selectedNode.type !== 'API_SERVICE' && selectedNode.type !== 'EXTERNAL_SYSTEM' && selectedNode.type !== 'DATABASE' && (
              <div className="mt-4 space-y-1 text-sm border-t border-slate-800 pt-4">
                <div className="text-slate-500 text-xs uppercase font-medium mb-2">Infrastructure</div>
                {selectedNode.hostname && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hostname</span>
                    <span className="text-slate-300 font-mono text-xs">{selectedNode.hostname}</span>
                  </div>
                )}
                {selectedNode.ip && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">IP Address</span>
                    <span className="text-slate-300 font-mono text-xs">{selectedNode.ip}</span>
                  </div>
                )}
                {selectedNode.subnet && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subnet</span>
                    <span className="text-slate-300 font-mono text-xs">{selectedNode.subnet}</span>
                  </div>
                )}
                {selectedNode.hostingPlatform && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Platform</span>
                    <span className="text-slate-300">{selectedNode.hostingPlatform}</span>
                  </div>
                )}
                {selectedNode.deploymentType === 'on-prem' && selectedNode.datacenter && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Datacenter</span>
                    <span className="text-slate-300">{selectedNode.datacenter}</span>
                  </div>
                )}
                {selectedNode.deploymentType === 'cloud' && selectedNode.vnetSegment && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">VNet Segment</span>
                    <span className="text-slate-300 font-mono text-xs break-all">{selectedNode.vnetSegment}</span>
                  </div>
                )}
              </div>
            )}

            {/* API Service specific details */}
            {selectedNode.type === 'API_SERVICE' && (
              <>
                {/* Deployed Component Info */}
                {(selectedNode.deployedComponent || selectedNode.vendor) && (
                  <div className="mt-4 space-y-1 text-sm border-t border-slate-800 pt-4">
                    <div className="text-slate-500 text-xs uppercase font-medium mb-2">Deployed Component</div>
                    {selectedNode.deployedComponent && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Component</span>
                        <span className="text-slate-300 font-medium">{selectedNode.deployedComponent}</span>
                      </div>
                    )}
                    {selectedNode.deployedVersion && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Version</span>
                        <span className="text-green-400 font-mono text-xs">{selectedNode.deployedVersion}</span>
                      </div>
                    )}
                    {selectedNode.vendor && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vendor</span>
                        <span className="text-slate-300">{selectedNode.vendor}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* API Endpoint */}
                <div className="mt-4 space-y-1 text-sm border-t border-slate-800 pt-4">
                  <div className="text-slate-500 text-xs uppercase font-medium mb-2">API Endpoint</div>
                  {selectedNode.hostname && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hostname</span>
                      <span className="text-slate-300 font-mono text-xs">{selectedNode.hostname}</span>
                    </div>
                  )}
                  {selectedNode.ip && selectedNode.listenPort && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Endpoint</span>
                      <span className="text-slate-300 font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded">{selectedNode.ip}:{selectedNode.listenPort}</span>
                    </div>
                  )}
                  {selectedNode.ip && !selectedNode.listenPort && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">IP Address</span>
                      <span className="text-slate-300 font-mono text-xs">{selectedNode.ip}</span>
                    </div>
                  )}
                  {selectedNode.subnet && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subnet</span>
                      <span className="text-slate-300 font-mono text-xs">{selectedNode.subnet}</span>
                    </div>
                  )}
                  {selectedNode.hostingPlatform && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Platform</span>
                      <span className="text-slate-300">{selectedNode.hostingPlatform}</span>
                    </div>
                  )}
                  {selectedNode.deploymentType === 'on-prem' && selectedNode.datacenter && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Datacenter</span>
                      <span className="text-slate-300">{selectedNode.datacenter}</span>
                    </div>
                  )}
                  {selectedNode.deploymentType === 'cloud' && selectedNode.vnetSegment && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">VNet Segment</span>
                      <span className="text-slate-300 font-mono text-xs break-all">{selectedNode.vnetSegment}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* External system - minimal info */}
            {selectedNode.type === 'EXTERNAL_SYSTEM' && (
              <div className="mt-4 space-y-1 text-sm border-t border-slate-800 pt-4">
                <div className="text-slate-500 text-xs uppercase font-medium mb-2">External System</div>
                {selectedNode.ip && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">External IP</span>
                    <span className="text-slate-300 font-mono text-xs">{selectedNode.ip}</span>
                  </div>
                )}
                <div className="mt-2 text-xs text-slate-500 italic">
                  Third-party system - limited visibility
                </div>
              </div>
            )}

            {/* Connected Edges / API Interfaces */}
            {l1Data && (
              <div className="mt-4 space-y-2 text-sm border-t border-slate-800 pt-4">
                <div className="text-slate-500 text-xs uppercase font-medium mb-2">Connections</div>
                {l1Data.edges
                  .filter(e => e.sourceId === selectedNode.id || e.targetId === selectedNode.id)
                  .slice(0, 5)
                  .map(edge => {
                    const isSource = edge.sourceId === selectedNode.id;
                    const otherNodeId = isSource ? edge.targetId : edge.sourceId;
                    const otherNode = l1Data.nodes.find(n => n.id === otherNodeId);
                    return (
                      <div key={edge.id} className="bg-slate-800/50 rounded p-2 text-xs">
                        <div className="flex items-center gap-1 text-slate-300">
                          <span>{isSource ? '→' : '←'}</span>
                          <span className="font-medium">{otherNode?.name || otherNodeId}</span>
                        </div>
                        {edge.label && <div className="text-slate-500 mt-1">{edge.label}</div>}
                        {edge.type === 'API' && edge.sourceEndpoint && edge.targetEndpoint && (
                          <div className="mt-1 font-mono text-slate-400">
                            <span className="text-green-400">{edge.sourceEndpoint}</span>
                            <span className="text-slate-500 mx-1">→</span>
                            <span className="text-blue-400">{edge.targetEndpoint}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                {l1Data.edges.filter(e => e.sourceId === selectedNode.id || e.targetId === selectedNode.id).length > 5 && (
                  <div className="text-xs text-slate-500 italic">
                    +{l1Data.edges.filter(e => e.sourceId === selectedNode.id || e.targetId === selectedNode.id).length - 5} more connections
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Details panel (L0) */}
      {viewLevel === 'L0' && selectedL0Env && (
        <div className="w-72 bg-slate-900 border-l border-slate-800 pt-14">
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h2 className="font-semibold">{selectedL0Env.name}</h2>
              <button onClick={() => setSelectedL0Env(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="mt-2 flex gap-2">
              <span
                className="px-2 py-0.5 rounded text-xs"
                style={{
                  backgroundColor: (stageColors[selectedL0Env.stageKey] || '#64748b') + '30',
                  color: stageColors[selectedL0Env.stageKey] || '#64748b',
                }}
              >
                {selectedL0Env.stageKey}
              </span>
              <span
                className="px-2 py-0.5 rounded text-xs"
                style={{
                  backgroundColor: getStatusColor(selectedL0Env.status) + '30',
                  color: getStatusColor(selectedL0Env.status),
                }}
              >
                {selectedL0Env.status}
              </span>
            </div>
            <div className="mt-4 text-sm text-slate-400 space-y-2">
              <div>Systems: {selectedL0Env.systemCount}</div>
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => drillDown(selectedL0Env)}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm"
                >
                  Open Environment →
                </button>
              </div>
              <div>
                <button
                  onClick={() => removeEnvFromCanvas(selectedL0Env.id)}
                  className="w-full px-3 py-2 bg-red-900/50 hover:bg-red-900 rounded text-red-400 hover:text-red-300 text-sm"
                >
                  Remove from Canvas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edge Context Menu */}
      {edgeContextMenu.visible && (
        <div
          className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl py-1 min-w-[160px]"
          style={{ left: edgeContextMenu.x, top: edgeContextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-slate-700">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Integration</div>
            <div className="text-sm text-white font-medium mt-0.5">
              {edgeContextMenu.link?.linkType || 'PROMOTION'}
            </div>
          </div>
          <button
            onClick={handleEditEdge}
            className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={handleToggleLockEdge}
            className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
          >
            {edgeContextMenu.link?.locked ? (
              <>
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Unlock
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Lock
              </>
            )}
          </button>
          <div className="border-t border-slate-700 mt-1 pt-1">
            <button
              onClick={handleDeleteEdge}
              disabled={edgeContextMenu.link?.locked}
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-900/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
              {edgeContextMenu.link?.locked && <span className="text-xs text-slate-500 ml-auto">(Locked)</span>}
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close context menu */}
      {edgeContextMenu.visible && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setEdgeContextMenu(prev => ({ ...prev, visible: false }))}
        />
      )}

      {/* Edit Edge Modal */}
      {editEdgeModal.visible && editEdgeModal.link && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setEditEdgeModal({ visible: false, link: null })}
          />
          <div className="relative bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-6 min-w-[360px]">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Integration</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Type</label>
                <select
                  value={editEdgeModal.link.linkType || 'PROMOTION'}
                  onChange={(e) => setEditEdgeModal(prev => ({
                    ...prev,
                    link: prev.link ? { ...prev.link, linkType: e.target.value as L0Link['linkType'] } : null
                  }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PROMOTION">Promotion</option>
                  <option value="DATA_SYNC">Data Sync</option>
                  <option value="REFERENCE">Reference</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Label (optional)</label>
                <input
                  type="text"
                  value={editEdgeModal.link.label || ''}
                  onChange={(e) => setEditEdgeModal(prev => ({
                    ...prev,
                    link: prev.link ? { ...prev.link, label: e.target.value || undefined } : null
                  }))}
                  placeholder="e.g., Deploy, Sync Data"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="locked"
                  checked={editEdgeModal.link.locked || false}
                  onChange={(e) => setEditEdgeModal(prev => ({
                    ...prev,
                    link: prev.link ? { ...prev.link, locked: e.target.checked } : null
                  }))}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="locked" className="text-sm text-slate-300 cursor-pointer">
                  Lock this integration (prevents deletion)
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditEdgeModal({ visible: false, link: null })}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => editEdgeModal.link && handleSaveEditedEdge(editEdgeModal.link)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
