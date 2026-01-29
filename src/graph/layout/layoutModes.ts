/**
 * Layout mode definitions and utilities
 */

import type { LayoutMode } from '../adapters/GraphRenderer';

export interface LayoutDefinition {
  mode: LayoutMode;
  label: string;
  description: string;
  icon: string; // Lucide icon name
}

export const LAYOUT_DEFINITIONS: LayoutDefinition[] = [
  {
    mode: 'force',
    label: 'Force-Directed',
    description: 'Physics-based layout that clusters connected nodes together',
    icon: 'Zap',
  },
  {
    mode: 'dagre',
    label: 'Hierarchical',
    description: 'Top-down layered layout showing data flow direction',
    icon: 'GitBranch',
  },
  {
    mode: 'concentric',
    label: 'Concentric',
    description: 'Radial layout with central nodes surrounded by connected nodes',
    icon: 'Circle',
  },
];

/**
 * Get layout definition by mode
 */
export function getLayoutDefinition(mode: LayoutMode): LayoutDefinition {
  return LAYOUT_DEFINITIONS.find((l) => l.mode === mode) || LAYOUT_DEFINITIONS[0];
}

/**
 * Get all available layout modes
 */
export function getAvailableLayouts(): LayoutMode[] {
  return LAYOUT_DEFINITIONS.map((l) => l.mode);
}
