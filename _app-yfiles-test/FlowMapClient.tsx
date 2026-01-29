"use client";

import { useEffect, useRef } from "react";
import {
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  LayoutExecutor
} from "@yfiles/yfiles";

export default function FlowMapClient() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    const graphComponent = new GraphComponent(hostRef.current);

    // Interaction (pan/zoom + simple editing, good for initial testing)
    graphComponent.inputMode = new GraphEditorInputMode();

    const graph = graphComponent.graph;

    // Demo nodes + edge
    const n1 = graph.createNode();
    const n2 = graph.createNode();
    graph.createEdge(n1, n2);

    // Layout
    const layout = new HierarchicLayout();
    void new LayoutExecutor({
      graphComponent,
      layout,
      duration: "0.4s"
    }).start();

    return () => {
      graphComponent.cleanUp();
    };
  }, []);

  return <div ref={hostRef} style={{ width: "100%", height: "100%" }} />;
}

