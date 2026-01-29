'use client';

// Nexorium Core - Snap to Grid Toggle
// Toggle snap-to-grid functionality

import { memo } from 'react';
import { Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SnapToGridToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

function SnapToGridToggle({ enabled, onToggle }: SnapToGridToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'p-2 rounded-md transition-colors',
        enabled
          ? 'bg-violet-500/20 text-violet-300'
          : 'text-slate-400 hover:text-white hover:bg-white/10'
      )}
      title={enabled ? 'Disable snap to grid' : 'Enable snap to grid'}
    >
      <Grid3X3 className="h-4 w-4" />
    </button>
  );
}

export default memo(SnapToGridToggle);
