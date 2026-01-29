'use client';

// Nexorium Core - Reduce Motion Toggle
// Accessibility toggle for reducing animations

import { memo } from 'react';
import { Zap, ZapOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReduceMotionToggleProps {
  reduceMotion: boolean;
  onToggle: () => void;
  className?: string;
}

function ReduceMotionToggle({
  reduceMotion,
  onToggle,
  className,
}: ReduceMotionToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all',
        reduceMotion
          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          : 'text-slate-400 hover:text-slate-300 hover:bg-white/5 border border-transparent',
        className
      )}
      title={reduceMotion ? 'Enable animations' : 'Reduce motion (accessibility)'}
    >
      {reduceMotion ? (
        <ZapOff className="h-3.5 w-3.5" />
      ) : (
        <Zap className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">{reduceMotion ? 'Motion Off' : 'Motion'}</span>
    </button>
  );
}

export default memo(ReduceMotionToggle);
