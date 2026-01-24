'use client';

// TelEnvIQ - Environment Diagram Toolbar
// Premium fixed toolbar with view toggle, actions, and save status

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import {
  LayoutGrid,
  Table2,
  Network,
  Maximize2,
  StickyNote,
  Save,
  Loader2,
  Check,
  RefreshCw,
  Download,
  Undo2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type ViewMode = 'graph' | 'table';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface EnvironmentToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  saveStatus: SaveStatus;
  onAutoArrange: () => void;
  onFitView: () => void;
  onAddNote?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  onResetLayout?: () => void;
  showInfra: boolean;
  onShowInfraChange: (show: boolean) => void;
  disabled?: boolean;
  nodeCount?: number;
  edgeCount?: number;
}

function EnvironmentToolbar({
  viewMode,
  onViewModeChange,
  saveStatus,
  onAutoArrange,
  onFitView,
  onAddNote,
  onExport,
  onRefresh,
  onResetLayout,
  showInfra,
  onShowInfraChange,
  disabled = false,
  nodeCount = 0,
  edgeCount = 0,
}: EnvironmentToolbarProps) {
  const SaveStatusIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm">
            <Check className="h-3.5 w-3.5" />
            <span>Saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 text-red-500 text-sm">
            <span>Save failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 gap-4">
        {/* Left side - View toggle and stats */}
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && onViewModeChange(value as ViewMode)}
            className="bg-slate-100 p-0.5 rounded-lg"
          >
            <ToggleGroupItem
              value="graph"
              aria-label="Graph view"
              className="data-[state=on]:bg-white data-[state=on]:shadow-sm px-3 py-1.5 rounded-md"
            >
              <Network className="h-4 w-4 mr-1.5" />
              <span className="text-sm">Graph</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="table"
              aria-label="Table view"
              className="data-[state=on]:bg-white data-[state=on]:shadow-sm px-3 py-1.5 rounded-md"
            >
              <Table2 className="h-4 w-4 mr-1.5" />
              <span className="text-sm">Table</span>
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Stats */}
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>{nodeCount} components</span>
            <span className="text-slate-300">|</span>
            <span>{edgeCount} connections</span>
          </div>

          {/* Show/Hide INFRA (Graph view only) */}
          {viewMode === 'graph' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShowInfraChange(!showInfra)}
                  className={`h-8 ${!showInfra ? 'text-slate-400' : ''}`}
                >
                  {showInfra ? (
                    <Eye className="h-4 w-4 mr-1.5" />
                  ) : (
                    <EyeOff className="h-4 w-4 mr-1.5" />
                  )}
                  <span className="text-sm">INFRA</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showInfra ? 'Hide' : 'Show'} infrastructure layer
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Center - Actions (Graph view only) */}
        {viewMode === 'graph' && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAutoArrange}
                  disabled={disabled}
                  className="h-8"
                >
                  <LayoutGrid className="h-4 w-4 mr-1.5" />
                  <span className="text-sm">Auto-arrange</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Arrange nodes by layer (Dagre layout)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFitView}
                  disabled={disabled}
                  className="h-8"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fit view to content</TooltipContent>
            </Tooltip>

            {onAddNote && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddNote}
                    disabled={disabled}
                    className="h-8"
                  >
                    <StickyNote className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add note</TooltipContent>
              </Tooltip>
            )}

            {onResetLayout && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onResetLayout}
                    disabled={disabled}
                    className="h-8"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset layout</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Right side - Save status and secondary actions */}
        <div className="flex items-center gap-3">
          <SaveStatusIndicator />

          <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
            {onRefresh && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRefresh}
                    disabled={disabled}
                    className="h-8 w-8"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh data</TooltipContent>
              </Tooltip>
            )}

            {onExport && viewMode === 'graph' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onExport}
                    disabled={disabled}
                    className="h-8 w-8"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export as SVG</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default memo(EnvironmentToolbar);
