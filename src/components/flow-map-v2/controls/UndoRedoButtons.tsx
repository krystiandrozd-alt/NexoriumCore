'use client';

// Nexorium Core - Undo/Redo Buttons
// History navigation buttons for manual design mode

import { memo } from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UndoRedoButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

function UndoRedoButtons({ canUndo, canRedo, onUndo, onRedo }: UndoRedoButtonsProps) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={cn(
          'p-2 rounded-md transition-colors',
          canUndo
            ? 'text-slate-400 hover:text-white hover:bg-white/10'
            : 'text-slate-600 cursor-not-allowed'
        )}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={cn(
          'p-2 rounded-md transition-colors',
          canRedo
            ? 'text-slate-400 hover:text-white hover:bg-white/10'
            : 'text-slate-600 cursor-not-allowed'
        )}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default memo(UndoRedoButtons);
