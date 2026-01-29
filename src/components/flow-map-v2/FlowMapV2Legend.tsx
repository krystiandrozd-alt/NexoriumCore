'use client';

// Nexorium Core - Flow Map V2 Legend
// Draggable, collapsible legend for stages and edge types

import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowMapV2Stage } from '@/types/flow-map-v2';

interface FlowMapV2LegendProps {
  stages: FlowMapV2Stage[];
  className?: string;
}

function FlowMapV2Legend({ stages, className }: FlowMapV2LegendProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return; // Don't drag when clicking buttons
    }
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { ...position };
    e.preventDefault();
  }, [position]);

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      setPosition({
        x: Math.max(0, elementStartPos.current.x + deltaX),
        y: Math.max(0, elementStartPos.current.y + deltaY),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={dragRef}
      className={cn(
        'absolute z-10 transition-all duration-200',
        isDragging && 'cursor-grabbing',
        className
      )}
      style={{
        left: position.x,
        bottom: position.y,
      }}
    >
      <div
        className={cn(
          'rounded-xl bg-slate-900/95 backdrop-blur-xl',
          'border border-white/10 shadow-xl',
          'transition-all duration-200',
          isCollapsed ? 'w-auto' : 'w-48'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 cursor-grab',
            'border-b border-white/5',
            isDragging && 'cursor-grabbing'
          )}
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="h-3 w-3 text-slate-600" />
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium flex-1">
            Legend
          </span>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-0.5 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isCollapsed ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="p-3 space-y-4">
            {/* Stages */}
            {stages.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">Stages</div>
                <div className="space-y-1">
                  {stages.map((stage) => (
                    <div key={stage.key} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-[11px] text-slate-300">{stage.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Edge types */}
            <div className="space-y-1.5">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider">Flow Types</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-violet-500 rounded" />
                  <span className="text-[11px] text-slate-300">Promotion</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-0.5 bg-cyan-500 rounded"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, #06b6d4, #06b6d4 4px, transparent 4px, transparent 8px)',
                    }}
                  />
                  <span className="text-[11px] text-slate-300">Data Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-0.5 bg-slate-400 rounded"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, #94a3b8, #94a3b8 2px, transparent 2px, transparent 5px)',
                    }}
                  />
                  <span className="text-[11px] text-slate-300">Reference</span>
                </div>
              </div>
            </div>

            {/* Direction indicator */}
            <div className="space-y-1.5">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider">Direction</div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-4 h-0.5 bg-violet-500 rounded-l" />
                  <div
                    className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-violet-500"
                  />
                </div>
                <span className="text-[11px] text-slate-300">Flow direction</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(FlowMapV2Legend);
