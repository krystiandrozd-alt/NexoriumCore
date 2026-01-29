'use client';

/**
 * Control Panel for Graph Renderer Playground
 *
 * Left sidebar with renderer selection, layout options, and visual toggles.
 */

import { Dispatch, SetStateAction } from 'react';
import {
  Settings,
  Database,
  Eye,
  Zap,
  GitBranch,
  Circle,
} from 'lucide-react';
import type { LayoutMode, RendererOptions } from '@/graph/adapters/GraphRenderer';

export type RendererType = 'cytoscape' | 'g6';
export type DatasetType = 'synthetic-20' | 'synthetic-200' | 'synthetic-1000' | 'api';

interface ControlPanelProps {
  renderer: RendererType;
  setRenderer: Dispatch<SetStateAction<RendererType>>;
  layout: LayoutMode;
  setLayout: Dispatch<SetStateAction<LayoutMode>>;
  dataset: DatasetType;
  setDataset: Dispatch<SetStateAction<DatasetType>>;
  options: RendererOptions;
  setOptions: Dispatch<SetStateAction<RendererOptions>>;
  environmentId: string;
  setEnvironmentId: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
}

const LAYOUT_OPTIONS: Array<{ mode: LayoutMode; label: string; icon: typeof Zap }> = [
  { mode: 'force', label: 'Force-Directed', icon: Zap },
  { mode: 'dagre', label: 'Hierarchical', icon: GitBranch },
  { mode: 'concentric', label: 'Concentric', icon: Circle },
];

export function ControlPanel({
  renderer,
  setRenderer,
  layout,
  setLayout,
  dataset,
  setDataset,
  options,
  setOptions,
  environmentId,
  setEnvironmentId,
  isLoading,
}: ControlPanelProps) {
  const toggleOption = (key: keyof RendererOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-800">
          <Settings className="w-5 h-5" />
          <h2 className="font-semibold">Controls</h2>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Renderer Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Renderer
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setRenderer('cytoscape')}
              disabled={isLoading}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                renderer === 'cytoscape'
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
              }`}
            >
              Cytoscape
            </button>
            <button
              onClick={() => setRenderer('g6')}
              disabled={isLoading}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                renderer === 'g6'
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
              }`}
            >
              G6
            </button>
          </div>
        </div>

        {/* Layout Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Layout
          </label>
          <div className="space-y-1">
            {LAYOUT_OPTIONS.map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setLayout(mode)}
                disabled={isLoading}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  layout === mode
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Dataset Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              Dataset
            </div>
          </label>
          <select
            value={dataset}
            onChange={(e) => setDataset(e.target.value as DatasetType)}
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="synthetic-20">Synthetic (20 nodes)</option>
            <option value="synthetic-200">Synthetic (200 nodes)</option>
            <option value="synthetic-1000">Synthetic (1000 nodes)</option>
            <option value="api">From Environment</option>
          </select>

          {dataset === 'api' && (
            <input
              type="text"
              value={environmentId}
              onChange={(e) => setEnvironmentId(e.target.value)}
              placeholder="Environment ID"
              className="mt-2 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Visual Options */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Visual Options
            </div>
          </label>
          <div className="space-y-2">
            <ToggleOption
              label="Health Overlay"
              checked={options.healthOverlay}
              onChange={() => toggleOption('healthOverlay')}
              disabled={isLoading}
            />
            <ToggleOption
              label="Hosting Badge"
              checked={options.showHostingBadge}
              onChange={() => toggleOption('showHostingBadge')}
              disabled={isLoading}
            />
            <ToggleOption
              label="Confidence Styling"
              checked={options.confidenceStyling}
              onChange={() => toggleOption('confidenceStyling')}
              disabled={isLoading}
            />
            <ToggleOption
              label="Show Stale Edges"
              checked={options.showStaleEdges}
              onChange={() => toggleOption('showStaleEdges')}
              disabled={isLoading}
            />
            <ToggleOption
              label="Network Zone Colors"
              checked={options.networkZoneColoring}
              onChange={() => toggleOption('networkZoneColoring')}
              disabled={isLoading}
            />
            <ToggleOption
              label="Telco Layer Grouping"
              checked={options.telcoLayerGrouping}
              onChange={() => toggleOption('telcoLayerGrouping')}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-500 text-center">
          Graph Renderer Playground
        </p>
      </div>
    </div>
  );
}

interface ToggleOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function ToggleOption({ label, checked, onChange, disabled }: ToggleOptionProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-slate-600">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
}
