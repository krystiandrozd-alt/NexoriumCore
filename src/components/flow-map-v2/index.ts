// DEPRECATED - 2026-01-28
// These components have been replaced by the yFiles Flow Map implementation.
// The canonical Flow Map is now at /dashboard/environments/flow-map
// These components remain for reference but are no longer used in the main UI.
//
// Nexorium Core - Flow Map V2 Components (React Flow based)
// Clean, clarity-first enterprise environment visualization

// Level 0 (Pipeline Map) components
export { default as FlowMapV2Canvas } from './FlowMapV2Canvas';
export type { FlowMapV2CanvasHandle } from './FlowMapV2Canvas';
export { default as FlowMapV2Filters } from './FlowMapV2Filters';
export { default as FlowMapV2Sidebar } from './FlowMapV2Sidebar';
export { default as FlowMapV2Toolbar } from './FlowMapV2Toolbar';
export { default as FlowMapV2Legend } from './FlowMapV2Legend';
export { default as FullscreenWrapper } from './FullscreenWrapper';
export { default as EnvironmentHoverCard } from './EnvironmentHoverCard';

// Level 1 (Environment Detail Map) components
export { default as EnvironmentDetailCanvas } from './EnvironmentDetailCanvas';
export { default as EnvironmentDetailSidebar } from './EnvironmentDetailSidebar';

// Re-export nodes and edges
export { EnvironmentNode, ManualNode, TitleNode, NoteNode } from './nodes';
export { IntegrationEdge, ManualEdge, ManualEdgeMarkers } from './edges';
export { StageSwimlanesBackground, DomainSwimlanesBackground, getDomainLaneY, getDomainLaneForY } from './swimlanes';

// Re-export controls
export { ModeToggle, SnapToGridToggle, UndoRedoButtons } from './controls';

// Re-export build components
export { BuildPalette, PaletteItem, NodeEditPanel, EdgeEditPanel } from './build';
