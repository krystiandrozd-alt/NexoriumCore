'use client';

// TelEnvIQ - Premium Toolbar (Flagship)
// Top toolbar with overlays, snapshot comparison, search, and view controls

import { memo, useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  Layers,
  GitCompare,
  LayoutGrid,
  Maximize2,
  Save,
  Download,
  RefreshCw,
  Loader2,
  Check,
  X,
  ChevronDown,
  Eye,
  EyeOff,
  Users,
  Tag,
  AlertTriangle,
  Network,
  Table2,
  LayoutList,
  Activity,
  Camera,
  Keyboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'graph' | 'table' | 'matrix' | 'lifecycle';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type OverlayType = 'drift' | 'layers' | 'ownership' | 'versions';

interface Snapshot {
  id: string;
  label: string;
  createdAt: string;
}

interface SearchResult {
  id: string;
  label: string;
  type: string;
  hostname?: string;
}

interface PremiumToolbarProps {
  // Environment info
  environmentName: string;
  environmentType: string;
  lastIngestion?: string | null;

  // View mode
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;

  // Save state
  saveStatus: SaveStatus;
  autosaveEnabled: boolean;
  onAutosaveToggle: () => void;
  onManualSave: () => void;

  // Snapshots
  snapshots: Snapshot[];
  currentSnapshotId?: string | null;
  compareSnapshotId?: string | null;
  onSnapshotSelect: (id: string | null) => void;
  onCompareSelect: (id: string | null) => void;
  onCreateSnapshot?: () => void;

  // Overlays
  activeOverlays: Set<OverlayType>;
  onOverlayToggle: (overlay: OverlayType) => void;

  // Actions
  onAutoArrange: () => void;
  onFitView: () => void;
  onExport?: () => void;
  onRefresh?: () => void;

  // Search
  onSearch: (query: string) => SearchResult[];
  onSearchSelect: (id: string) => void;

  // Stats
  nodeCount: number;
  edgeCount: number;

  // Keyboard shortcuts modal
  onShowKeyboardShortcuts?: () => void;

  disabled?: boolean;
}

function PremiumToolbar({
  environmentName,
  environmentType,
  lastIngestion: _lastIngestion,
  viewMode,
  onViewModeChange,
  saveStatus,
  autosaveEnabled,
  onAutosaveToggle,
  onManualSave,
  snapshots,
  currentSnapshotId,
  compareSnapshotId,
  onSnapshotSelect,
  onCompareSelect,
  onCreateSnapshot,
  activeOverlays,
  onOverlayToggle,
  onAutoArrange,
  onFitView,
  onExport,
  onRefresh,
  onSearch,
  onSearchSelect,
  nodeCount,
  edgeCount,
  onShowKeyboardShortcuts,
  disabled = false,
}: PremiumToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSnapshotDropdown, setShowSnapshotDropdown] = useState(false);
  const [showOverlayDropdown, setShowOverlayDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Handle search
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = onSearch(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, onSearch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSelect = useCallback((id: string) => {
    onSearchSelect(id);
    setSearchQuery('');
    setShowSearchResults(false);
  }, [onSearchSelect]);

  const typeColors: Record<string, string> = {
    DEV: 'bg-slate-500/20 text-slate-300',
    SIT: 'bg-blue-500/20 text-blue-300',
    UAT: 'bg-violet-500/20 text-violet-300',
    NFT: 'bg-amber-500/20 text-amber-300',
    PREPROD: 'bg-emerald-500/20 text-emerald-300',
    PROD_RO: 'bg-rose-500/20 text-rose-300',
  };

  return (
    <div className="premium-toolbar flex items-center justify-between px-4 py-2 gap-4" data-testid="env-toolbar">
      {/* Left section: Environment info + Search */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Environment badge */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-white truncate max-w-[200px]">
            {environmentName}
          </span>
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', typeColors[environmentType] || typeColors.DEV)}>
            {environmentType}
          </span>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-white/10" />

        {/* Search */}
        <div className="relative flex-1 max-w-xs" ref={searchResultsRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes... (/)"
              className="w-full pl-9 pr-3 py-1.5 input-premium text-sm"
              data-testid="node-search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 py-1 rounded-lg glass-panel max-h-64 overflow-y-auto z-50">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSearchSelect(result.id)}
                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/10 text-left"
                >
                  <span className="text-sm text-white">{result.label}</span>
                  <span className="text-xs text-slate-500">{result.type}</span>
                  {result.hostname && (
                    <span className="text-xs text-slate-600 ml-auto">{result.hostname}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center section: View modes + Overlays + Actions */}
      <div className="flex items-center gap-2">
        {/* View mode toggle */}
        <div className="flex items-center rounded-lg bg-white/5 p-0.5">
          <button
            onClick={() => onViewModeChange('graph')}
            className={cn('btn-premium px-2.5 py-1', viewMode === 'graph' && 'active')}
            title="Graph view"
          >
            <Network className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={cn('btn-premium px-2.5 py-1', viewMode === 'table' && 'active')}
            title="Table view"
          >
            <Table2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('matrix')}
            className={cn('btn-premium px-2.5 py-1', viewMode === 'matrix' && 'active')}
            title="Matrix view"
            disabled
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('lifecycle')}
            className={cn('btn-premium px-2.5 py-1', viewMode === 'lifecycle' && 'active')}
            title="Lifecycle view"
            disabled
          >
            <Activity className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-white/10" />

        {/* Snapshot selector */}
        <div className="relative">
          <button
            onClick={() => setShowSnapshotDropdown(!showSnapshotDropdown)}
            className="btn-premium flex items-center gap-1.5"
            data-testid="snapshot-selector"
          >
            <Camera className="h-4 w-4" />
            <span className="text-sm">
              {currentSnapshotId
                ? snapshots.find((s) => s.id === currentSnapshotId)?.label || 'Snapshot'
                : 'Live'}
            </span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {showSnapshotDropdown && (
            <div className="absolute top-full right-0 mt-1 w-64 py-1 rounded-lg glass-panel z-50">
              <button
                onClick={() => {
                  onSnapshotSelect(null);
                  setShowSnapshotDropdown(false);
                }}
                className={cn(
                  'w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left',
                  !currentSnapshotId && 'bg-violet-500/10'
                )}
              >
                <span className="text-sm text-white">Live (Current)</span>
                {!currentSnapshotId && <Check className="h-4 w-4 text-violet-400" />}
              </button>
              <div className="h-px bg-white/10 my-1" />
              {snapshots.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500">No snapshots</div>
              ) : (
                snapshots.map((snapshot) => (
                  <button
                    key={snapshot.id}
                    onClick={() => {
                      onSnapshotSelect(snapshot.id);
                      setShowSnapshotDropdown(false);
                    }}
                    className={cn(
                      'w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left',
                      currentSnapshotId === snapshot.id && 'bg-violet-500/10'
                    )}
                  >
                    <div>
                      <div className="text-sm text-white">{snapshot.label}</div>
                      <div className="text-xs text-slate-500">{snapshot.createdAt}</div>
                    </div>
                    {currentSnapshotId === snapshot.id && (
                      <Check className="h-4 w-4 text-violet-400" />
                    )}
                  </button>
                ))
              )}
              {onCreateSnapshot && (
                <>
                  <div className="h-px bg-white/10 my-1" />
                  <button
                    onClick={() => {
                      onCreateSnapshot();
                      setShowSnapshotDropdown(false);
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/10 text-left text-violet-400"
                  >
                    <Camera className="h-4 w-4" />
                    <span className="text-sm">Create Snapshot</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Compare toggle */}
        <button
          onClick={() => onCompareSelect(compareSnapshotId ? null : snapshots[0]?.id || null)}
          className={cn('btn-premium flex items-center gap-1.5', compareSnapshotId && 'active')}
          disabled={snapshots.length < 2}
          title="Compare with snapshot"
        >
          <GitCompare className="h-4 w-4" />
          <span className="text-sm">Compare</span>
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-white/10" />

        {/* Overlay toggles */}
        <div className="relative">
          <button
            onClick={() => setShowOverlayDropdown(!showOverlayDropdown)}
            className={cn(
              'btn-premium flex items-center gap-1.5',
              activeOverlays.size > 0 && 'active'
            )}
          >
            <Layers className="h-4 w-4" />
            <span className="text-sm">Overlays</span>
            {activeOverlays.size > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-violet-500/30 text-violet-300">
                {activeOverlays.size}
              </span>
            )}
            <ChevronDown className="h-3 w-3" />
          </button>

          {showOverlayDropdown && (
            <div className="absolute top-full right-0 mt-1 w-48 py-1 rounded-lg glass-panel z-50">
              <OverlayToggleItem
                label="Drift"
                icon={AlertTriangle}
                active={activeOverlays.has('drift')}
                onClick={() => onOverlayToggle('drift')}
                testId="overlay-toggle-drift"
              />
              <OverlayToggleItem
                label="Layers"
                icon={Layers}
                active={activeOverlays.has('layers')}
                onClick={() => onOverlayToggle('layers')}
                testId="overlay-toggle-layers"
              />
              <OverlayToggleItem
                label="Ownership"
                icon={Users}
                active={activeOverlays.has('ownership')}
                onClick={() => onOverlayToggle('ownership')}
                testId="overlay-toggle-ownership"
              />
              <OverlayToggleItem
                label="Versions"
                icon={Tag}
                active={activeOverlays.has('versions')}
                onClick={() => onOverlayToggle('versions')}
                testId="overlay-toggle-versions"
              />
            </div>
          )}
        </div>

        {/* Graph actions (only in graph mode) */}
        {viewMode === 'graph' && (
          <>
            <div className="h-5 w-px bg-white/10" />

            <button
              onClick={onAutoArrange}
              className="btn-premium flex items-center gap-1.5"
              disabled={disabled}
              title="Auto-arrange nodes"
              data-testid="auto-arrange-btn"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>

            <button
              onClick={onFitView}
              className="btn-premium"
              disabled={disabled}
              title="Fit to view (F)"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Right section: Save status + Actions */}
      <div className="flex items-center gap-3">
        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{nodeCount} nodes</span>
          <span>{edgeCount} connections</span>
        </div>

        <div className="h-5 w-px bg-white/10" />

        {/* Save status */}
        <SaveStatusIndicator status={saveStatus} />

        {/* Autosave toggle */}
        <button
          onClick={onAutosaveToggle}
          className={cn(
            'btn-premium flex items-center gap-1.5 text-xs',
            autosaveEnabled && 'active'
          )}
          title={autosaveEnabled ? 'Autosave enabled' : 'Autosave disabled'}
          data-testid="autosave-toggle"
        >
          {autosaveEnabled ? <Check className="h-3 w-3" /> : null}
          <span>Auto</span>
        </button>

        {/* Manual save */}
        <button
          onClick={onManualSave}
          className="btn-premium"
          disabled={saveStatus === 'saving'}
          title="Save layout"
          data-testid="save-layout-btn"
        >
          <Save className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-white/10" />

        {/* Secondary actions */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn-premium"
            disabled={disabled}
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}

        {onExport && (
          <button
            onClick={onExport}
            className="btn-premium"
            disabled={disabled}
            title="Export"
          >
            <Download className="h-4 w-4" />
          </button>
        )}

        {onShowKeyboardShortcuts && (
          <button
            onClick={onShowKeyboardShortcuts}
            className="btn-premium"
            title="Keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Save status indicator
function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  switch (status) {
    case 'saving':
      return (
        <div className="save-status saving" data-testid="save-status">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </div>
      );
    case 'saved':
      return (
        <div className="save-status saved" data-testid="save-status">
          <Check className="h-3 w-3" />
          <span>Saved</span>
        </div>
      );
    case 'error':
      return (
        <div className="save-status error" data-testid="save-status">
          <AlertTriangle className="h-3 w-3" />
          <span>Error</span>
        </div>
      );
    default:
      return (
        <div className="save-status" data-testid="save-status">
          <span>Unsaved</span>
        </div>
      );
  }
}

// Overlay toggle item
function OverlayToggleItem({
  label,
  icon: Icon,
  active,
  onClick,
  testId,
}: {
  label: string;
  icon: typeof Layers;
  active: boolean;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left',
        active && 'bg-violet-500/10'
      )}
      data-testid={testId}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', active ? 'text-violet-400' : 'text-slate-400')} />
        <span className={cn('text-sm', active ? 'text-white' : 'text-slate-300')}>{label}</span>
      </div>
      {active ? (
        <Eye className="h-4 w-4 text-violet-400" />
      ) : (
        <EyeOff className="h-4 w-4 text-slate-600" />
      )}
    </button>
  );
}

export default memo(PremiumToolbar);
