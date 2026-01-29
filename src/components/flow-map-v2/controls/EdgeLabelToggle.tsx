'use client';

// Nexorium Core - Edge Label Toggle
// Toggle visibility of edge labels

import { memo } from 'react';
import { Tag, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EdgeLabelToggleProps {
  showLabels: boolean;
  onToggle: () => void;
  className?: string;
}

function EdgeLabelToggle({
  showLabels,
  onToggle,
  className,
}: EdgeLabelToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all',
        showLabels
          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
          : 'text-slate-400 hover:text-slate-300 hover:bg-white/5 border border-transparent',
        className
      )}
      title={showLabels ? 'Hide edge labels' : 'Show edge labels'}
    >
      {showLabels ? (
        <Tag className="h-3.5 w-3.5" />
      ) : (
        <EyeOff className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">Labels</span>
    </button>
  );
}

export default memo(EdgeLabelToggle);
