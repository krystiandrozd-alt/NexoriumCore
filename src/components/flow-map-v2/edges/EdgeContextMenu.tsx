'use client';

// Nexorium Core - Edge Context Menu
// Right-click menu for edge operations

import { memo, useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeftRight,
  Pencil,
  Trash2,
  Zap,
  RefreshCw,
  Share2,
  Link2Off,
  FileText,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type EnhancedEdgeType, edgeStyleConfigs } from '@/lib/flow-map/edge-utils';

interface EdgeContextMenuProps {
  x: number;
  y: number;
  currentType: EnhancedEdgeType;
  currentLabel: string;
  onChangeType: (type: EnhancedEdgeType) => void;
  onChangeLabel: (label: string) => void;
  onReverse: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const edgeTypeOptions: { type: EnhancedEdgeType; icon: typeof Zap }[] = [
  { type: 'integration', icon: Share2 },
  { type: 'data-sync', icon: RefreshCw },
  { type: 'promotion', icon: Zap },
  { type: 'reference', icon: FileText },
  { type: 'blocked', icon: Link2Off },
];

function EdgeContextMenu({
  x,
  y,
  currentType,
  currentLabel,
  onChangeType,
  onChangeLabel,
  onReverse,
  onDelete,
  onClose,
}: EdgeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(currentLabel);
  const [showTypeSubmenu, setShowTypeSubmenu] = useState(false);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditingLabel) {
          setIsEditingLabel(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, isEditingLabel]);

  // Adjust menu position to stay within viewport
  const adjustedPosition = useCallback(() => {
    const menuWidth = 200;
    const menuHeight = 280;
    const padding = 8;

    let adjustedX = x;
    let adjustedY = y;

    if (typeof window !== 'undefined') {
      if (x + menuWidth > window.innerWidth - padding) {
        adjustedX = window.innerWidth - menuWidth - padding;
      }
      if (y + menuHeight > window.innerHeight - padding) {
        adjustedY = window.innerHeight - menuHeight - padding;
      }
    }

    return { x: adjustedX, y: adjustedY };
  }, [x, y]);

  const position = adjustedPosition();

  const handleLabelSubmit = () => {
    onChangeLabel(labelValue);
    setIsEditingLabel(false);
  };

  const menuContent = (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[200px] rounded-lg bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
      style={{ left: position.x, top: position.y }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Edge Options
        </div>
      </div>

      <div className="p-1">
        {/* Change Type submenu */}
        <div
          className="relative"
          onMouseEnter={() => setShowTypeSubmenu(true)}
          onMouseLeave={() => setShowTypeSubmenu(false)}
        >
          <button
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span>Change Type</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
              {edgeStyleConfigs[currentType].label}
            </span>
          </button>

          {/* Type submenu */}
          {showTypeSubmenu && (
            <div className="absolute left-full top-0 ml-1 min-w-[180px] rounded-lg bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-1">
                {edgeTypeOptions.map(({ type, icon: Icon }) => {
                  const config = edgeStyleConfigs[type];
                  return (
                    <button
                      key={type}
                      onClick={() => onChangeType(type)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-colors',
                        type === currentType
                          ? 'bg-violet-500/20 text-violet-300'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <Icon className="h-4 w-4" style={{ color: config.color }} />
                      <span>{config.label}</span>
                      {type === currentType && <Check className="h-3 w-3 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Edit Label */}
        {isEditingLabel ? (
          <div className="px-3 py-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLabelSubmit();
                  if (e.key === 'Escape') setIsEditingLabel(false);
                }}
                className="flex-1 px-2 py-1 rounded bg-slate-900 border border-white/20 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                placeholder="Enter label..."
                autoFocus
              />
              <button
                onClick={handleLabelSubmit}
                className="p-1 rounded bg-violet-500/20 text-violet-400 hover:bg-violet-500/30"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsEditingLabel(false)}
                className="p-1 rounded bg-slate-700 text-slate-400 hover:bg-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsEditingLabel(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Pencil className="h-4 w-4" />
            <span>{currentLabel ? 'Edit Label' : 'Add Label'}</span>
          </button>
        )}

        {/* Divider */}
        <div className="h-px bg-white/10 my-1" />

        {/* Reverse Direction */}
        <button
          onClick={onReverse}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>Reverse Direction</span>
        </button>

        {/* Divider */}
        <div className="h-px bg-white/10 my-1" />

        {/* Delete */}
        <button
          onClick={onDelete}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Edge</span>
        </button>
      </div>
    </div>
  );

  // Render using portal to ensure proper z-index
  if (typeof document === 'undefined') return null;

  return createPortal(menuContent, document.body);
}

export default memo(EdgeContextMenu);
