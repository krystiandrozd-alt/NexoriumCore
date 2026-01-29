'use client';

import { useEffect, useRef } from 'react';
import {
  GraphComponent,
  GraphViewerInputMode,
  HierarchicalLayout,
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
  TimeSpan,
} from '@yfiles/yfiles';

import licenseData from '../../../yFiles-for-HTML-Complete-3.0.0.4-Evaluation/lib/license.json';

License.value = licenseData;

export default function FlowMapClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphComponentRef = useRef<GraphComponent | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graphComponent = new GraphComponent(containerRef.current);
    graphComponentRef.current = graphComponent;

    // Use viewer mode for clean interaction (pan/zoom only)
    graphComponent.inputMode = new GraphViewerInputMode();

    const graph = graphComponent.graph;

    // ========================================
    // DEFAULT STYLES
    // ========================================

    // Node style - enterprise dark theme
    const nodeStyle = new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: '#0f172a',
      stroke: '1.5px #334155',
    });

    // Node label style
    const nodeLabelStyle = new LabelStyle({
      textFill: '#ffffff',
      font: '13px Inter, system-ui, sans-serif',
      horizontalTextAlignment: 'center',
      verticalTextAlignment: 'center',
    });

    // Edge style with arrow
    const edgeStyle = new PolylineEdgeStyle({
      stroke: '2px #64748b',
      targetArrow: new Arrow({
        type: ArrowType.TRIANGLE,
        fill: '#64748b',
        lengthScale: 1.2,
        widthScale: 1.2,
      }),
      smoothingLength: 10,
    });

    // Group node style
    const groupNodeStyle = new GroupNodeStyle({
      contentAreaFill: '#020617',
      tabFill: '#0f172a',
      tabBackgroundFill: '#0f172a',
      tabPosition: 'top',
      tabHeight: 28,
      stroke: '1.5px #1e293b',
      cornerRadius: 8,
      contentAreaPadding: new Insets(12),
    });

    // Group label style
    const groupLabelStyle = new LabelStyle({
      textFill: '#94a3b8',
      font: 'bold 12px Inter, system-ui, sans-serif',
      horizontalTextAlignment: 'left',
      verticalTextAlignment: 'center',
    });

    // Set defaults
    graph.nodeDefaults.style = nodeStyle;
    graph.nodeDefaults.size = new Size(160, 60);
    graph.nodeDefaults.labels.style = nodeLabelStyle;
    graph.nodeDefaults.labels.layoutParameter = InteriorNodeLabelModel.CENTER;

    graph.groupNodeDefaults.style = groupNodeStyle;
    graph.groupNodeDefaults.labels.style = groupLabelStyle;
    graph.groupNodeDefaults.labels.layoutParameter = new GroupNodeLabelModel().createTabBackgroundParameter();

    graph.edgeDefaults.style = edgeStyle;

    // ========================================
    // CREATE GROUPS
    // ========================================

    const devGroup = graph.createGroupNode();
    graph.addLabel(devGroup, 'DEV');

    const sitGroup = graph.createGroupNode();
    graph.addLabel(sitGroup, 'SIT');

    const uatGroup = graph.createGroupNode();
    graph.addLabel(uatGroup, 'UAT');

    // ========================================
    // CREATE NODES
    // ========================================

    // DEV nodes
    const devOrderApi = graph.createNode();
    graph.addLabel(devOrderApi, 'Order API');

    const devCatalogService = graph.createNode();
    graph.addLabel(devCatalogService, 'Catalog Service');

    // SIT nodes
    const sitOrderApi = graph.createNode();
    graph.addLabel(sitOrderApi, 'Order API');

    const sitProvisioningEngine = graph.createNode();
    graph.addLabel(sitProvisioningEngine, 'Provisioning Engine');

    // UAT nodes
    const uatOrderApi = graph.createNode();
    graph.addLabel(uatOrderApi, 'Order API');

    // ========================================
    // GROUP NODES
    // ========================================

    graph.groupNodes(devGroup, [devOrderApi, devCatalogService]);
    graph.groupNodes(sitGroup, [sitOrderApi, sitProvisioningEngine]);
    graph.groupNodes(uatGroup, [uatOrderApi]);

    // ========================================
    // CREATE EDGES
    // ========================================

    graph.createEdge(devOrderApi, sitOrderApi);
    graph.createEdge(sitOrderApi, uatOrderApi);
    graph.createEdge(devCatalogService, sitProvisioningEngine);

    // ========================================
    // LAYOUT
    // ========================================

    const layout = new HierarchicalLayout({
      layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT,
      minimumLayerDistance: 80,
      nodeDistance: 40,
    });

    new LayoutExecutor({
      graphComponent,
      layout,
      animateViewport: true,
      easedAnimation: true,
      animationDuration: TimeSpan.fromSeconds(0.5),
    }).start().then(() => {
      graphComponent.fitGraphBounds(new Insets(40));
    });

    // Cleanup
    return () => {
      graphComponent.cleanUp();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-slate-950"
      style={{
        width: '100%',
        height: '100vh',
      }}
    />
  );
}
