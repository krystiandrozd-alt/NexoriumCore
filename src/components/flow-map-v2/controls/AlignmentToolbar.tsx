'use client';

// Nexorium Core - Alignment Toolbar
// Align and distribute selected nodes

import { memo } from 'react';
import {
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  ArrowLeftRight,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AlignmentType, DistributionType } from '@/lib/flow-map/selection-utils';

interface AlignmentToolbarProps {
  selectedCount: number;
  onAlign: (type: AlignmentType) => void;
  onDistribute: (type: DistributionType) => void;
  className?: string;
}

function AlignmentToolbar({
  selectedCount,
  onAlign,
  onDistribute,
  className,
}: AlignmentToolbarProps) {
  const canAlign = selectedCount >= 2;
  const canDistribute = selectedCount >= 3;

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 p-1 rounded-lg bg-slate-900/95 backdrop-blur-xl border border-white/10',
        className
      )}
    >
      {/* Alignment group */}
      <div className="flex items-center gap-0.5 pr-1 border-r border-white/10">
        <button
          onClick={() => onAlign('left')}
          disabled={!canAlign}
          className={cn(
            'p-1.5 rounded transition-colors',
            canAlign
              ? 'text-slate-400 hover:text-white hover:bg-white/10'
              : 'text-slate-600 cursor-not-allowed'
          )}
          title="Align left"
        >
          <AlignStartVertical className="h-4 w-4" />
        </button>
        <button
          onClick={() => onAlign('center-h')}
          disabled={!canAlign}
          className={cn(
            'p-1.5 rounded transition-colors',
            canAlign
              ? 'text-slate-400 hover:text-white hover:bg-white/10'
              : 'text-slate-600 cursor-not-allowed'
          )}
          title="Align center horizontally"
        >
          <AlignCenterVertical className="h-4 w-4" />
        </button>
        <button
          onClick={() => onAlign('right')}
          disabled={!canAlign}
          className={cn(
            'p-1.5 rounded transition-colors',
            canAlign
              ? 'text-slate-400 hover:text-white hover:bg-white/10'
              : 'text-slate-600 cursor-not-allowed'
          )}
          title="Align right"
        >
          <AlignEndVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-0.5 px-1 border-r border-white/10">
        <button
          onClick={() => onAlign('top')}
          disabled={!canAlign}
          className={cn(
            'p-1.5 rounded transition-colors',
            canAlign
              ? 'text-slate-400 hover:text-white hover:bg-white/10'
              : 'text-slate-600 cursor-not-allowed'
          )}
          title="Align top"
        >
          <AlignStartHorizontal className="h-4 w-4" />
        </button>
        <button
          onClick={() => onAlign('center-v')}
          disabled={!canAlign}
          className={cn(
            'p-1.5 rounded transition-colors',
            canAlign
              ? 'text-slate-400 hover:text-white hover:bg-white/10'
              : 'text-slate-600 cursor-not-allowed'
          )}
          title="Align center vertically"
        >
          <AlignCenterHorizontal className="h-4 w-4" />
        </button>
        <button
          onClick={() => onAlign('bottom')}
          disabled={!canAlign}
          className={cn(
            'p-1.5 rounded transition-colors',
            canAlign
              ? 'text-slate-400 hover:text-white hover:bg-white/10'
              : 'text-slate-600 cursor-not-allowed'
          )}
          title="Align bottom"
        >
          <AlignEndHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Distribution group */}
      <div className="flex items-center gap-0.5 pl-1">
        <button
          onClick={() => onDistribute('horizontal')}
          disabled={!canDistribute}
          className={cn(
            'p-1.5 rounded transition-colors',
            canDistribute
              ? 'text-slate-400 hover:text-white hover:bg-white/10'
              : 'text-slate-600 cursor-not-allowed'
          )}
          title="Distribute horizontally (need 3+ nodes)"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDistribute('vertical')}
          disabled={!canDistribute}
          className={cn(
            'p-1.5 rounded transition-colors',
            canDistribute
              ? 'text-slate-400 hover:text-white hover:bg-white/10'
              : 'text-slate-600 cursor-not-allowed'
          )}
          title="Distribute vertically (need 3+ nodes)"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>

      {/* Selection count indicator */}
      {selectedCount > 0 && (
        <div className="ml-2 px-2 py-0.5 text-[10px] font-medium rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
          {selectedCount} selected
        </div>
      )}
    </div>
  );
}

export default memo(AlignmentToolbar);
