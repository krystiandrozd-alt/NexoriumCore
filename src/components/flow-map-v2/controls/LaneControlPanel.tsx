'use client';

// Nexorium Core - Lane Control Panel
// Quick toggles for lane visibility and states

import { memo, useState } from 'react';
import { Panel } from '@xyflow/react';
import {
  Layers,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Lock,
  Unlock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowMapStageKey } from '@/types/flow-map-v2';
import { stageColors } from '@/types/flow-map-v2';
import type { StageLaneStates } from '@/lib/flow-map/lane-utils';

interface LaneControlPanelProps {
  stages: FlowMapStageKey[];
  laneStates: StageLaneStates;
  onToggleVisibility: (stageKey: FlowMapStageKey) => void;
  onToggleCollapse: (stageKey: FlowMapStageKey) => void;
  onToggleLock: (stageKey: FlowMapStageKey) => void;
  onResetAll: () => void;
  onShowAll: () => void;
  onCollapseAll: () => void;
  onExpandAll: () => void;
}

function LaneControlPanel({
  stages,
  laneStates,
  onToggleVisibility,
  onToggleCollapse,
  onToggleLock,
  onResetAll,
  onShowAll,
  onCollapseAll,
  onExpandAll,
}: LaneControlPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleCount = stages.filter((s) => laneStates[s]?.visible !== false).length;
  const collapsedCount = stages.filter((s) => laneStates[s]?.collapsed).length;
  const lockedCount = stages.filter((s) => laneStates[s]?.locked).length;

  const stageLabels: Record<FlowMapStageKey, string> = {
    DEV: 'Development',
    SIT: 'System Integration',
    UAT: 'User Acceptance',
    NFT: 'Non-Functional',
    PREPROD: 'Pre-Production',
    PROD_RO: 'Production (RO)',
  };

  return (
    <Panel position="bottom-right" className="!m-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-white">Lane Controls</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Status badges */}
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
              {visibleCount}/{stages.length}
            </span>
            {collapsedCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                {collapsedCount} collapsed
              </span>
            )}
            {lockedCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
                {lockedCount} locked
              </span>
            )}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="border-t border-white/10">
            {/* Quick actions */}
            <div className="p-2 flex items-center gap-1 border-b border-white/10">
              <button
                onClick={onShowAll}
                className="flex-1 px-2 py-1.5 rounded text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Show All
              </button>
              <button
                onClick={onCollapseAll}
                className="flex-1 px-2 py-1.5 rounded text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Collapse All
              </button>
              <button
                onClick={onExpandAll}
                className="flex-1 px-2 py-1.5 rounded text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={onResetAll}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Reset to defaults"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Lane list */}
            <div className="max-h-[240px] overflow-y-auto">
              {stages.map((stageKey) => {
                const state = laneStates[stageKey];
                const color = stageColors[stageKey];
                const isVisible = state?.visible !== false;
                const isCollapsed = state?.collapsed ?? false;
                const isLocked = state?.locked ?? false;

                return (
                  <div
                    key={stageKey}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 border-b border-white/5',
                      !isVisible && 'opacity-50'
                    )}
                  >
                    {/* Color indicator */}
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />

                    {/* Stage name */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white truncate">
                        {stageKey}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {stageLabels[stageKey]}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-0.5">
                      {/* Collapse toggle */}
                      <button
                        onClick={() => onToggleCollapse(stageKey)}
                        disabled={!isVisible}
                        className={cn(
                          'p-1 rounded transition-colors',
                          isCollapsed
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/10',
                          !isVisible && 'opacity-50 cursor-not-allowed'
                        )}
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                      >
                        {isCollapsed ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>

                      {/* Lock toggle */}
                      <button
                        onClick={() => onToggleLock(stageKey)}
                        disabled={!isVisible}
                        className={cn(
                          'p-1 rounded transition-colors',
                          isLocked
                            ? 'text-violet-400 bg-violet-500/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/10',
                          !isVisible && 'opacity-50 cursor-not-allowed'
                        )}
                        title={isLocked ? 'Unlock' : 'Lock'}
                      >
                        {isLocked ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <Unlock className="h-3 w-3" />
                        )}
                      </button>

                      {/* Visibility toggle */}
                      <button
                        onClick={() => onToggleVisibility(stageKey)}
                        className={cn(
                          'p-1 rounded transition-colors',
                          isVisible
                            ? 'text-slate-400 hover:text-white hover:bg-white/10'
                            : 'text-rose-400 bg-rose-500/10'
                        )}
                        title={isVisible ? 'Hide' : 'Show'}
                      >
                        {isVisible ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

export default memo(LaneControlPanel);
