'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  GraphComponent,
  GraphEditorInputMode,
  GraphOverviewComponent,
  HierarchicalLayout,
  OrganicLayout,
  OrthogonalLayout,
  CircularLayout,
  LayoutExecutor,
  License,
  ShapeNodeStyle,
  PolylineEdgeStyle,
  Arrow,
  ArrowType,
  GroupNodeStyle,
  GroupNodeLabelModel,
  InteriorNodeLabelModel,
  LabelStyle,
  Size,
  Insets,
  LayoutOrientation,
  FoldingManager,
  type INode,
  type IEdge,
  SvgExport,
  Graph,
  GraphItemTypes,
  NodeStyleIndicatorRenderer,
  EdgeStyleIndicatorRenderer,
  type HoveredItemChangedEventArgs,
} from '@yfiles/yfiles';

import licenseData from '../../../yFiles-for-HTML-Complete-3.0.0.4-Evaluation/lib/license.json';

License.value = licenseData;

// ============================================================================
// TYPES
// ============================================================================

type NodeMetadata = {
  id: string;
  env: string;
  type: 'API' | 'Service' | 'DB' | 'Queue' | 'UI' | 'Worker';
  domain: 'BSS' | 'OSS' | 'Core' | 'Data';
  label: string;
};

type LayoutType = 'hierarchic-lr' | 'hierarchic-tb' | 'organic' | 'orthogonal' | 'circular';

type GraphStats = {
  nodeCount: number;
  edgeCount: number;
  lastLayoutTime: number;
};

// ============================================================================
// GRAPH DATA GENERATOR
// ============================================================================

const NODE_TYPES: NodeMetadata['type'][] = ['API', 'Service', 'DB', 'Queue', 'UI', 'Worker'];
const DOMAINS: NodeMetadata['domain'][] = ['BSS', 'OSS', 'Core', 'Data'];

function generateGraphData(size: 'small' | 'medium' | 'large'): {
  nodes: NodeMetadata[];
  edges: { source: string; target: string }[];
  groups: { id: string; label: string; nodeIds: string[] }[];
} {
  const nodes: NodeMetadata[] = [];
  const edges: { source: string; target: string }[] = [];
  const groups: { id: string; label: string; nodeIds: string[] }[] = [];

  let nodeCount: number;
  let groupCount: number;
  let edgeDensity: number;

  switch (size) {
    case 'small':
      nodeCount = 12;
      groupCount = 3;
      edgeDensity = 1.2;
      break;
    case 'medium':
      nodeCount = 500;
      groupCount = 15;
      edgeDensity = 1.5;
      break;
    case 'large':
      nodeCount = 2000;
      groupCount = 40;
      edgeDensity = 1.3;
      break;
  }

  // Create groups
  const envs = size === 'small'
    ? ['DEV', 'SIT', 'UAT']
    : Array.from({ length: groupCount }, (_, i) => `Env-${i + 1}`);

  envs.forEach((env, i) => {
    groups.push({
      id: `group-${i}`,
      label: env,
      nodeIds: [],
    });
  });

  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    const groupIndex = i % groups.length;
    const nodeType = NODE_TYPES[i % NODE_TYPES.length];
    const domain = DOMAINS[Math.floor(i / NODE_TYPES.length) % DOMAINS.length];
    const nodeId = `node-${i}`;

    nodes.push({
      id: nodeId,
      env: groups[groupIndex].label,
      type: nodeType,
      domain,
      label: `${nodeType}-${i}`,
    });

    groups[groupIndex].nodeIds.push(nodeId);
  }

  // Create edges (sparse connections)
  const targetEdgeCount = Math.floor(nodeCount * edgeDensity);
  const usedEdges = new Set<string>();

  for (let i = 0; i < targetEdgeCount; i++) {
    let attempts = 0;
    while (attempts < 10) {
      const sourceIdx = Math.floor(Math.random() * nodeCount);
      const targetIdx = Math.floor(Math.random() * nodeCount);

      if (sourceIdx !== targetIdx) {
        const edgeKey = `${sourceIdx}-${targetIdx}`;
        if (!usedEdges.has(edgeKey)) {
          usedEdges.add(edgeKey);
          edges.push({
            source: nodes[sourceIdx].id,
            target: nodes[targetIdx].id,
          });
          break;
        }
      }
      attempts++;
    }
  }

  // Add some structured edges (sequential within groups)
  groups.forEach((group) => {
    for (let i = 0; i < group.nodeIds.length - 1; i++) {
      const edgeKey = `${group.nodeIds[i]}-${group.nodeIds[i + 1]}`;
      if (!usedEdges.has(edgeKey) && Math.random() > 0.5) {
        usedEdges.add(edgeKey);
        edges.push({
          source: group.nodeIds[i],
          target: group.nodeIds[i + 1],
        });
      }
    }
  });

  return { nodes, edges, groups };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function YFilesLabClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const graphComponentRef = useRef<GraphComponent | null>(null);
  const overviewComponentRef = useRef<GraphOverviewComponent | null>(null);
  const foldingManagerRef = useRef<FoldingManager | null>(null);
  const nodeMapRef = useRef<Map<string, INode>>(new Map());
  const groupMapRef = useRef<Map<string, INode>>(new Map());

  const [layoutType, setLayoutType] = useState<LayoutType>('hierarchic-lr');
  const [enableHoverHighlight, setEnableHoverHighlight] = useState(true);
  const [showOverview, setShowOverview] = useState(true);
  const [stats, setStats] = useState<GraphStats>({ nodeCount: 0, edgeCount: 0, lastLayoutTime: 0 });
  const [isLayouting, setIsLayouting] = useState(false);
  const [tooltipContent, setTooltipContent] = useState<NodeMetadata | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // ============================================================================
  // LAYOUT FUNCTIONS
  // ============================================================================

  const getLayoutAlgorithm = useCallback((type: LayoutType) => {
    switch (type) {
      case 'hierarchic-lr':
        return new HierarchicalLayout({
          layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT,
          minimumLayerDistance: 60,
          nodeDistance: 30,
        });
      case 'hierarchic-tb':
        return new HierarchicalLayout({
          layoutOrientation: LayoutOrientation.TOP_TO_BOTTOM,
          minimumLayerDistance: 60,
          nodeDistance: 30,
        });
      case 'organic':
        return new OrganicLayout({
          defaultPreferredEdgeLength: 80,
          defaultMinimumNodeDistance: 40,
          compactnessFactor: 0.4,
        });
      case 'orthogonal':
        return new OrthogonalLayout({
          gridSpacing: 20,
        });
      case 'circular':
        return new CircularLayout();
      default:
        return new HierarchicalLayout();
    }
  }, []);

  const runLayout = useCallback(async (type: LayoutType, animate = true) => {
    const graphComponent = graphComponentRef.current;
    if (!graphComponent) return;

    setIsLayouting(true);
    const startTime = performance.now();

    try {
      const layout = getLayoutAlgorithm(type);

      // Ensure LayoutExecutor is available
      LayoutExecutor.ensure();

      if (animate) {
        await graphComponent.applyLayoutAnimated(layout, '500ms');
      } else {
        graphComponent.graph.applyLayout(layout);
        await graphComponent.fitGraphBounds(new Insets(40));
      }

      const endTime = performance.now();
      setStats((prev) => ({
        ...prev,
        lastLayoutTime: Math.round(endTime - startTime),
      }));
    } catch (error) {
      console.error('Layout error:', error);
    } finally {
      setIsLayouting(false);
    }
  }, [getLayoutAlgorithm]);

  // ============================================================================
  // GRAPH BUILDING
  // ============================================================================

  const buildGraph = useCallback((size: 'small' | 'medium' | 'large') => {
    const graphComponent = graphComponentRef.current;
    const foldingManager = foldingManagerRef.current;
    if (!graphComponent || !foldingManager) return;

    setIsLayouting(true);

    // Get the master graph (for folding)
    const masterGraph = foldingManager.masterGraph;

    // Clear existing graph
    masterGraph.clear();
    nodeMapRef.current.clear();
    groupMapRef.current.clear();

    // Generate data
    const { nodes, edges, groups } = generateGraphData(size);

    // Create groups first
    groups.forEach((group) => {
      const groupNode = masterGraph.createGroupNode();
      masterGraph.addLabel(groupNode, group.label);
      groupMapRef.current.set(group.id, groupNode);
    });

    // Create nodes
    nodes.forEach((nodeData) => {
      const node = masterGraph.createNode({ tag: nodeData });
      masterGraph.addLabel(node, nodeData.label);
      nodeMapRef.current.set(nodeData.id, node);

      // Find parent group
      const groupEntry = groups.find((g) => g.nodeIds.includes(nodeData.id));
      if (groupEntry) {
        const groupNode = groupMapRef.current.get(groupEntry.id);
        if (groupNode) {
          masterGraph.setParent(node, groupNode);
        }
      }
    });

    // Create edges
    edges.forEach((edgeData) => {
      const sourceNode = nodeMapRef.current.get(edgeData.source);
      const targetNode = nodeMapRef.current.get(edgeData.target);
      if (sourceNode && targetNode) {
        masterGraph.createEdge(sourceNode, targetNode);
      }
    });

    // Update stats
    setStats({
      nodeCount: nodes.length,
      edgeCount: edges.length,
      lastLayoutTime: 0,
    });

    // Run layout
    runLayout(layoutType, false).then(() => {
      graphComponent.fitGraphBounds(new Insets(40));
    });
  }, [layoutType, runLayout]);

  // ============================================================================
  // FOLDING OPERATIONS
  // ============================================================================

  const collapseAllGroups = useCallback(() => {
    const graphComponent = graphComponentRef.current;
    const foldingManager = foldingManagerRef.current;
    if (!graphComponent || !foldingManager) return;

    const foldingView = graphComponent.graph.foldingView;
    if (!foldingView) return;

    groupMapRef.current.forEach((masterGroupNode) => {
      const viewGroupNode = foldingView.getViewItem(masterGroupNode);
      if (viewGroupNode && graphComponent.graph.isGroupNode(viewGroupNode)) {
        foldingView.collapse(viewGroupNode);
      }
    });

    runLayout(layoutType);
  }, [layoutType, runLayout]);

  const expandAllGroups = useCallback(() => {
    const graphComponent = graphComponentRef.current;
    const foldingManager = foldingManagerRef.current;
    if (!graphComponent || !foldingManager) return;

    const foldingView = graphComponent.graph.foldingView;
    if (!foldingView) return;

    groupMapRef.current.forEach((masterGroupNode) => {
      const viewGroupNode = foldingView.getViewItem(masterGroupNode);
      if (viewGroupNode) {
        foldingView.expand(viewGroupNode);
      }
    });

    runLayout(layoutType);
  }, [layoutType, runLayout]);

  // ============================================================================
  // UNDO/REDO
  // ============================================================================

  const handleUndo = useCallback(() => {
    const foldingManager = foldingManagerRef.current;
    if (foldingManager && foldingManager.masterGraph.undoEngine?.canUndo) {
      foldingManager.masterGraph.undoEngine.undo();
    }
  }, []);

  const handleRedo = useCallback(() => {
    const foldingManager = foldingManagerRef.current;
    if (foldingManager && foldingManager.masterGraph.undoEngine?.canRedo) {
      foldingManager.masterGraph.undoEngine.redo();
    }
  }, []);

  // ============================================================================
  // EXPORT
  // ============================================================================

  const handleExportPNG = useCallback(async () => {
    const graphComponent = graphComponentRef.current;
    if (!graphComponent) return;

    try {
      const exportComponent = new GraphComponent();
      exportComponent.graph = graphComponent.graph;
      exportComponent.updateContentBounds();

      const exporter = new SvgExport({
        worldBounds: exportComponent.contentBounds,
        scale: 1,
        margins: new Insets(10),
        encodeImagesBase64: true,
        inlineSvgImages: true,
      });

      exporter.cssStyleSheet = null;
      const svgElement = await exporter.exportSvgAsync(exportComponent);

      // Convert SVG to PNG
      const svgString = SvgExport.exportSvgString(svgElement as SVGElement);
      const svgUrl = SvgExport.encodeSvgDataUrl(svgString);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = exporter.viewWidth + 20;
        canvas.height = exporter.viewHeight + 20;
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 10, 10);

        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'yfiles-graph-export.png';
        link.href = pngUrl;
        link.click();
      };
      img.src = svgUrl;

      exportComponent.graph = new Graph();
      exportComponent.cleanUp();
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. See console for details.');
    }
  }, []);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    if (!containerRef.current) return;

    // Create GraphComponent
    const graphComponent = new GraphComponent(containerRef.current);
    graphComponentRef.current = graphComponent;

    // Configure input mode
    const inputMode = new GraphEditorInputMode({
      allowGroupingOperations: true,
      allowClipboardOperations: true,
    });
    graphComponent.inputMode = inputMode;

    // Get the graph and set up styles
    const graph = graphComponent.graph;

    // Node style - enterprise dark theme
    const nodeStyle = new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: '#1e293b',
      stroke: '1.5px #475569',
    });

    // Node label style
    const nodeLabelStyle = new LabelStyle({
      textFill: '#e2e8f0',
      font: '12px Inter, system-ui, sans-serif',
      horizontalTextAlignment: 'center',
      verticalTextAlignment: 'center',
    });

    // Edge style with orthogonal routing appearance
    const edgeStyle = new PolylineEdgeStyle({
      stroke: '1.5px #64748b',
      targetArrow: new Arrow({
        type: ArrowType.TRIANGLE,
        fill: '#64748b',
        lengthScale: 1,
        widthScale: 1,
      }),
      smoothingLength: 0, // Sharp corners for orthogonal look
    });

    // Group node style
    const groupNodeStyle = new GroupNodeStyle({
      contentAreaFill: '#0f172a',
      tabFill: '#1e293b',
      tabBackgroundFill: '#1e293b',
      tabPosition: 'top',
      tabHeight: 26,
      stroke: '1.5px #334155',
      cornerRadius: 6,
      contentAreaPadding: new Insets(10),
      groupIcon: 'chevron-down',
      folderIcon: 'chevron-up',
      iconBackgroundShape: 'circle',
    });

    // Group label style
    const groupLabelStyle = new LabelStyle({
      textFill: '#94a3b8',
      font: 'bold 11px Inter, system-ui, sans-serif',
      horizontalTextAlignment: 'left',
      verticalTextAlignment: 'center',
    });

    // Set defaults
    graph.nodeDefaults.style = nodeStyle;
    graph.nodeDefaults.size = new Size(120, 40);
    graph.nodeDefaults.labels.style = nodeLabelStyle;
    graph.nodeDefaults.labels.layoutParameter = InteriorNodeLabelModel.CENTER;

    graph.groupNodeDefaults.style = groupNodeStyle;
    graph.groupNodeDefaults.labels.style = groupLabelStyle;
    graph.groupNodeDefaults.labels.layoutParameter = new GroupNodeLabelModel().createTabBackgroundParameter();

    graph.edgeDefaults.style = edgeStyle;

    // Enable folding
    const foldingManager = new FoldingManager(graph);
    foldingManagerRef.current = foldingManager;
    graphComponent.graph = foldingManager.createFoldingView().graph;

    // Enable undo
    foldingManager.masterGraph.undoEngineEnabled = true;

    // Set up highlight styles using decorator pattern
    const highlightNodeStyle = new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: 'transparent',
      stroke: '3px #3b82f6',
    });

    const highlightEdgeStyle = new PolylineEdgeStyle({
      stroke: '2.5px #3b82f6',
      targetArrow: new Arrow({
        type: ArrowType.TRIANGLE,
        fill: '#3b82f6',
      }),
    });

    graphComponent.graph.decorator.nodes.highlightRenderer.addConstant(
      new NodeStyleIndicatorRenderer({
        nodeStyle: highlightNodeStyle,
        margins: 3,
      })
    );

    graphComponent.graph.decorator.edges.highlightRenderer.addConstant(
      new EdgeStyleIndicatorRenderer({
        edgeStyle: highlightEdgeStyle,
      })
    );

    // Hover event handling
    inputMode.itemHoverInputMode.enabled = true;
    inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.EDGE;

    inputMode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt: HoveredItemChangedEventArgs) => {
      graphComponent.highlights.clear();

      const item = evt.item;
      if (item && 'tag' in item && item.tag) {
        // Show tooltip for nodes with metadata
        const nodeData = item.tag as NodeMetadata;
        if (nodeData.id) {
          setTooltipContent(nodeData);
          const nodeItem = item as INode;
          const viewPoint = graphComponent.worldToViewCoordinates(nodeItem.layout.center);
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (containerRect) {
            setTooltipPosition({
              x: viewPoint.x + containerRect.left + 300,
              y: viewPoint.y + containerRect.top,
            });
          }
        }
      } else {
        setTooltipContent(null);
      }

      if (item) {
        graphComponent.highlights.add(item);

        // Highlight incident edges for nodes
        if ('layout' in item) {
          const node = item as INode;
          graphComponent.graph.edgesAt(node).forEach((edge: IEdge) => {
            graphComponent.highlights.add(edge);
          });
        }
      }
    });

    // Create overview component
    if (overviewRef.current) {
      const overviewComponent = new GraphOverviewComponent(overviewRef.current, graphComponent);
      overviewComponentRef.current = overviewComponent;
    }

    // Build initial small graph
    setTimeout(() => {
      buildGraph('small');
    }, 100);

    // Cleanup
    return () => {
      overviewComponentRef.current?.cleanUp();
      graphComponent.cleanUp();
    };
  }, []);

  // Re-run layout when layout type changes
  useEffect(() => {
    if (graphComponentRef.current && stats.nodeCount > 0) {
      runLayout(layoutType);
    }
  }, [layoutType]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200">
      {/* Control Panel */}
      <div className="w-72 flex-shrink-0 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto">
        <h1 className="text-lg font-semibold text-white mb-1">yFiles Lab</h1>
        <p className="text-xs text-slate-400 mb-6">Enterprise Graph Showcase</p>

        {/* Layout Selection */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-400 mb-2">Layout Algorithm</label>
          <select
            value={layoutType}
            onChange={(e) => setLayoutType(e.target.value as LayoutType)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="hierarchic-lr">Hierarchic (L-R)</option>
            <option value="hierarchic-tb">Hierarchic (T-B)</option>
            <option value="organic">Organic</option>
            <option value="orthogonal">Orthogonal</option>
            <option value="circular">Circular</option>
          </select>
        </div>

        {/* Toggles */}
        <div className="mb-6 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableHoverHighlight}
              onChange={(e) => setEnableHoverHighlight(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm">Enable Hover Highlight</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showOverview}
              onChange={(e) => setShowOverview(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm">Show Overview (Minimap)</span>
          </label>
        </div>

        {/* Graph Generation */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-400 mb-2">Generate Graph</label>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => buildGraph('small')}
              disabled={isLayouting}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-3 py-2 text-sm transition-colors disabled:opacity-50"
            >
              Small (12 nodes)
            </button>
            <button
              onClick={() => buildGraph('medium')}
              disabled={isLayouting}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-3 py-2 text-sm transition-colors disabled:opacity-50"
            >
              Medium (500 nodes)
            </button>
            <button
              onClick={() => buildGraph('large')}
              disabled={isLayouting}
              className="w-full bg-amber-900/50 hover:bg-amber-800/50 border border-amber-700/50 rounded px-3 py-2 text-sm transition-colors disabled:opacity-50"
            >
              Large (2000 nodes)
            </button>
          </div>
        </div>

        {/* Group Operations */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-400 mb-2">Group Operations</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={collapseAllGroups}
              disabled={isLayouting}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-3 py-2 text-xs transition-colors disabled:opacity-50"
            >
              Collapse All
            </button>
            <button
              onClick={expandAllGroups}
              disabled={isLayouting}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-3 py-2 text-xs transition-colors disabled:opacity-50"
            >
              Expand All
            </button>
          </div>
        </div>

        {/* Undo/Redo */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-400 mb-2">History</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleUndo}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-3 py-2 text-xs transition-colors"
            >
              Undo
            </button>
            <button
              onClick={handleRedo}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-3 py-2 text-xs transition-colors"
            >
              Redo
            </button>
          </div>
        </div>

        {/* Export */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-400 mb-2">Export</label>
          <button
            onClick={handleExportPNG}
            disabled={isLayouting}
            className="w-full bg-blue-600 hover:bg-blue-500 rounded px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Export PNG
          </button>
        </div>

        {/* Stats */}
        <div className="mt-auto pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Nodes:</span>
              <span className="text-slate-300">{stats.nodeCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Edges:</span>
              <span className="text-slate-300">{stats.edgeCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Layout time:</span>
              <span className="text-slate-300">{stats.lastLayoutTime}ms</span>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLayouting && (
          <div className="mt-4 flex items-center justify-center gap-2 text-blue-400">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs">Processing...</span>
          </div>
        )}
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className="absolute inset-0 bg-slate-950"
        />

        {/* Overview / Minimap */}
        {showOverview && (
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
            <div className="px-2 py-1 bg-slate-800 text-xs text-slate-400 border-b border-slate-700">
              Overview
            </div>
            <div
              ref={overviewRef}
              className="w-full h-[calc(100%-24px)]"
            />
          </div>
        )}

        {/* Tooltip */}
        {tooltipContent && enableHoverHighlight && (
          <div
            className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl px-3 py-2 text-xs pointer-events-none"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 40,
            }}
          >
            <div className="font-medium text-white mb-1">{tooltipContent.label}</div>
            <div className="text-slate-400 space-y-0.5">
              <div>ID: {tooltipContent.id}</div>
              <div>Env: {tooltipContent.env}</div>
              <div>Type: {tooltipContent.type}</div>
              <div>Domain: {tooltipContent.domain}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
