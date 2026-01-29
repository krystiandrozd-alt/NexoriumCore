'use client';

// Nexorium Core - Layout Dropdown
// Auto-layout mode selection and configuration

import { memo, useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  ChevronDown,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Layers,
  Zap,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LayoutMode, LayoutDirection } from '@/lib/flow-map/layout-engine';

interface LayoutDropdownProps {
  currentMode: LayoutMode;
  currentDirection: LayoutDirection;
  hasSelection: boolean;
  onApplyLayout: (mode: LayoutMode, direction: LayoutDirection) => void;
  onApplyLayoutToSelection: (mode: LayoutMode, direction: LayoutDirection) => void;
  className?: string;
}

const layoutModes: { mode: LayoutMode; label: string; description: string; icon: typeof Layers }[] = [
  { mode: 'hierarchical', label: 'Hierarchical', description: 'Layered graph layout', icon: LayoutGrid },
  { mode: 'lane-aware', label: 'Lane Aware', description: 'Respects lane boundaries', icon: Layers },
  { mode: 'manual', label: 'Manual', description: 'Free positioning', icon: Zap },
];

const layoutDirections: { direction: LayoutDirection; label: string; icon: typeof ArrowRight }[] = [
  { direction: 'LR', label: 'Left to Right', icon: ArrowRight },
  { direction: 'TB', label: 'Top to Bottom', icon: ArrowDown },
  { direction: 'RL', label: 'Right to Left', icon: ArrowLeft },
  { direction: 'BT', label: 'Bottom to Top', icon: ArrowUp },
];

function LayoutDropdown({
  currentMode,
  currentDirection,
  hasSelection,
  onApplyLayout,
  onApplyLayoutToSelection,
  className,
}: LayoutDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentModeConfig = layoutModes.find((m) => m.mode === currentMode);
  const currentDirConfig = layoutDirections.find((d) => d.direction === currentDirection);

  const handleApply = (mode: LayoutMode, direction: LayoutDirection, selectionOnly: boolean) => {
    if (selectionOnly && hasSelection) {
      onApplyLayoutToSelection(mode, direction);
    } else {
      onApplyLayout(mode, direction);
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all',
          isOpen
            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
            : 'text-slate-400 hover:text-white hover:bg-white/10'
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Auto Arrange</span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 rounded-lg bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
          {/* Mode selection */}
          <div className="p-1 border-b border-white/10">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Layout Mode
            </div>
            {layoutModes.map(({ mode, label, description, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => handleApply(mode, currentDirection, false)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors',
                  mode === currentMode
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{description}</div>
                </div>
                {mode === currentMode && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>

          {/* Direction selection (only for hierarchical) */}
          {currentMode === 'hierarchical' && (
            <div className="p-1 border-b border-white/10">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Direction
              </div>
              <div className="grid grid-cols-4 gap-1 px-2 py-1">
                {layoutDirections.map(({ direction, label, icon: Icon }) => (
                  <button
                    key={direction}
                    onClick={() => handleApply(currentMode, direction, false)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-md transition-colors',
                      direction === currentDirection
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    )}
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[9px]">{direction}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={() => handleApply(currentMode, currentDirection, false)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-colors"
            >
              <LayoutGrid className="h-4 w-4" />
              Apply to All Nodes
            </button>

            {hasSelection && (
              <button
                onClick={() => handleApply(currentMode, currentDirection, true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-1 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Layers className="h-4 w-4" />
                Apply to Selection Only
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(LayoutDropdown);
