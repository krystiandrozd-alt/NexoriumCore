'use client';

// Nexorium Core - Flow Map V2 Toolbar
// Controls for zoom, layout, and fullscreen

import { memo, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  Map,
  LayoutGrid,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowMapV2Layout } from '@/types/flow-map-v2';

interface FlowMapV2ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onResetLayout: () => void;
  onSaveLayout: () => void;
  onLoadLayout: (layout: FlowMapV2Layout) => void;
  onFullscreenToggle: () => void;
  isFullscreen: boolean;
  showMinimap: boolean;
  onToggleMinimap: () => void;
  savedLayouts: FlowMapV2Layout[];
  isSaving?: boolean;
  autoSave?: boolean;
  onAutoSaveToggle?: () => void;
  level?: 0 | 1;
  levelLabel?: string;
}

function FlowMapV2Toolbar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetLayout,
  onSaveLayout,
  onLoadLayout,
  onFullscreenToggle,
  isFullscreen,
  showMinimap,
  onToggleMinimap,
  savedLayouts,
  isSaving = false,
  autoSave = false,
  onAutoSaveToggle,
  level,
  levelLabel,
}: FlowMapV2ToolbarProps) {
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  const handleLayoutSelect = useCallback(
    (layout: FlowMapV2Layout) => {
      onLoadLayout(layout);
      setShowLayoutMenu(false);
    },
    [onLoadLayout]
  );

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-xl">
      {/* Level indicator */}
      {level !== undefined && (
        <>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-violet-500/15 border border-violet-500/30">
            <span className="text-[10px] font-bold text-violet-400 tracking-wider">L{level}</span>
            {levelLabel && (
              <span className="text-xs text-violet-300/90 font-medium">{levelLabel}</span>
            )}
          </div>
          <div className="w-px h-5 bg-white/10" />
        </>
      )}

      {/* Zoom controls */}
      <button
        onClick={onZoomIn}
        className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        onClick={onFitView}
        className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Fit to view"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>

      <div className="w-px h-5 bg-white/10" />

      {/* Layout controls */}
      <button
        onClick={onResetLayout}
        className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Reset layout"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      {/* Save layout dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowLayoutMenu(!showLayoutMenu)}
          className={cn(
            'flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors',
            showLayoutMenu
              ? 'bg-violet-500/20 text-violet-300'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          )}
          title="Layout options"
        >
          <Save className={cn('h-4 w-4', isSaving && 'animate-pulse')} />
          <ChevronDown className="h-3 w-3" />
        </button>

        {showLayoutMenu && (
          <div className="absolute top-full left-0 mt-1 w-48 rounded-lg bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-xl z-50">
            <div className="p-1">
              {/* Save current layout */}
              <button
                onClick={() => {
                  onSaveLayout();
                  setShowLayoutMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Current Layout
              </button>

              {/* Auto-save toggle */}
              {onAutoSaveToggle && (
                <button
                  onClick={onAutoSaveToggle}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm text-slate-300 hover:bg-white/10 transition-colors"
                >
                  <span>Auto-save</span>
                  <div
                    className={cn(
                      'w-8 h-4 rounded-full transition-colors',
                      autoSave ? 'bg-violet-500' : 'bg-slate-600'
                    )}
                  >
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full bg-white transition-transform mt-0.5',
                        autoSave ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                      )}
                    />
                  </div>
                </button>
              )}

              {/* Divider */}
              {savedLayouts.length > 0 && (
                <div className="h-px bg-white/10 my-1" />
              )}

              {/* Saved layouts */}
              {savedLayouts.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => handleLayoutSelect(layout)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span className="truncate">{layout.name}</span>
                  {layout.isDefault && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
                      Default
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-white/10" />

      {/* Minimap toggle */}
      <button
        onClick={onToggleMinimap}
        className={cn(
          'p-2 rounded-md transition-colors',
          showMinimap
            ? 'bg-violet-500/20 text-violet-300'
            : 'text-slate-400 hover:text-white hover:bg-white/10'
        )}
        title={showMinimap ? 'Hide minimap' : 'Show minimap'}
      >
        <Map className="h-4 w-4" />
      </button>

      <div className="w-px h-5 bg-white/10" />

      {/* Fullscreen toggle */}
      <button
        onClick={onFullscreenToggle}
        className={cn(
          'p-2 rounded-md transition-colors',
          isFullscreen
            ? 'bg-violet-500/20 text-violet-300'
            : 'text-slate-400 hover:text-white hover:bg-white/10'
        )}
        title={isFullscreen ? 'Exit fullscreen (ESC)' : 'Enter fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export default memo(FlowMapV2Toolbar);
