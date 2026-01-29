'use client';

// Nexorium Core - Environment Detail Sidebar (Level 1)
// Sidebar with tabs: Overview, Systems, Integrations, Build

import { memo, useState } from 'react';
import { X, Info, Server, Link2, Wrench, ChevronLeft } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import { useManualDesign } from '@/contexts/ManualDesignContext';
import { BuildPalette, NodeEditPanel, EdgeEditPanel } from './build';

// ============================================
// TYPES
// ============================================

interface Environment {
  id: string;
  name: string;
  type: string;
  description?: string;
  stage?: {
    name: string;
    key: string;
    color: string;
  };
}

interface EnvironmentDetailSidebarProps {
  environmentId: string;
  environment: Environment;
  isOpen: boolean;
  onToggle: () => void;
}

// ============================================
// TAB COMPONENTS
// ============================================

function OverviewTab({ environment }: { environment: Environment }) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-white mb-2">Environment Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Name</span>
            <span className="text-white">{environment.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Type</span>
            <span className="text-white">{environment.type}</span>
          </div>
          {environment.stage && (
            <div className="flex justify-between">
              <span className="text-slate-400">Stage</span>
              <span className="text-white">{environment.stage.name}</span>
            </div>
          )}
        </div>
      </div>

      {environment.description && (
        <div>
          <h3 className="text-sm font-medium text-white mb-2">Description</h3>
          <p className="text-sm text-slate-400">{environment.description}</p>
        </div>
      )}

      <div className="pt-4 border-t border-white/10">
        <h3 className="text-sm font-medium text-white mb-2">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-lg font-bold text-white">-</div>
            <div className="text-xs text-slate-400">Systems</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-lg font-bold text-white">-</div>
            <div className="text-xs text-slate-400">Integrations</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemsTab() {
  return (
    <div className="p-4">
      <div className="text-center py-8">
        <Server className="h-8 w-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-400">
          Systems in this environment will appear here
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Drag systems from the Build palette to the canvas
        </p>
      </div>
    </div>
  );
}

function IntegrationsTab() {
  return (
    <div className="p-4">
      <div className="text-center py-8">
        <Link2 className="h-8 w-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-400">
          Integrations will appear here
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Connect systems by dragging between handles
        </p>
      </div>
    </div>
  );
}

function BuildTab() {
  const { state: manualState } = useManualDesign();

  // Show edit panel if something is selected
  if (manualState.selectedNodeId) {
    return (
      <div className="h-full p-4">
        <NodeEditPanel />
      </div>
    );
  }

  if (manualState.selectedEdgeId) {
    return (
      <div className="h-full p-4">
        <EdgeEditPanel />
      </div>
    );
  }

  // Default: show palette
  return (
    <div className="h-full">
      <BuildPalette />
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

function EnvironmentDetailSidebar({
  environmentId,
  environment,
  isOpen,
  onToggle,
}: EnvironmentDetailSidebarProps) {
  const [activeTab, setActiveTab] = useState('build');

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-slate-900/95">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h2 className="text-sm font-semibold text-white truncate">
          {environment.name}
        </h2>
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <Tabs.Root
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <Tabs.List className="flex border-b border-white/5 shrink-0">
          <Tabs.Trigger
            value="overview"
            className={cn(
              'flex-1 px-2 py-2 text-xs font-medium transition-colors',
              'border-b-2 border-transparent',
              activeTab === 'overview'
                ? 'text-white border-violet-500'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <div className="flex items-center justify-center gap-1">
              <Info className="h-3 w-3" />
              <span>Overview</span>
            </div>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="systems"
            className={cn(
              'flex-1 px-2 py-2 text-xs font-medium transition-colors',
              'border-b-2 border-transparent',
              activeTab === 'systems'
                ? 'text-white border-violet-500'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <div className="flex items-center justify-center gap-1">
              <Server className="h-3 w-3" />
              <span>Systems</span>
            </div>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="integrations"
            className={cn(
              'flex-1 px-2 py-2 text-xs font-medium transition-colors',
              'border-b-2 border-transparent',
              activeTab === 'integrations'
                ? 'text-white border-violet-500'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <div className="flex items-center justify-center gap-1">
              <Link2 className="h-3 w-3" />
              <span>Links</span>
            </div>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="build"
            className={cn(
              'flex-1 px-2 py-2 text-xs font-medium transition-colors',
              'border-b-2 border-transparent',
              activeTab === 'build'
                ? 'text-white border-violet-500'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <div className="flex items-center justify-center gap-1">
              <Wrench className="h-3 w-3" />
              <span>Build</span>
            </div>
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <Tabs.Content value="overview" className="h-full">
            <OverviewTab environment={environment} />
          </Tabs.Content>
          <Tabs.Content value="systems" className="h-full">
            <SystemsTab />
          </Tabs.Content>
          <Tabs.Content value="integrations" className="h-full">
            <IntegrationsTab />
          </Tabs.Content>
          <Tabs.Content value="build" className="h-full">
            <BuildTab />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}

export default memo(EnvironmentDetailSidebar);
