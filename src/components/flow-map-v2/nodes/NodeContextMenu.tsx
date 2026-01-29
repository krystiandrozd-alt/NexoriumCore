'use client';

// Nexorium Core - Node Context Menu
// Right-click menu for node operations

import { memo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Trash2,
  Copy,
  Pencil,
  Focus,
  Link2,
  ArrowUpRight,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ManualNodeType, DomainLane } from '@/types/flow-map-manual';
import { nodeTypeStyles, domainLanes } from '@/types/flow-map-manual';

interface NodeContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  nodeName: string;
  nodeType: ManualNodeType;
  currentLane?: DomainLane;
  isEditable: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onFocus: () => void;
  onShowConnections: (hops: 1 | 2) => void;
  onChangeType: (type: ManualNodeType) => void;
  onMoveToLane: (lane: DomainLane) => void;
  onOpenDetails?: () => void;
  onClose: () => void;
}

const nodeTypeOptions: ManualNodeType[] = [
  'SERVER',
  'DATABASE',
  'API_SERVICE',
  'QUEUE_EVENT_BUS',
  'LOAD_BALANCER',
  'CLOUD',
  'STORAGE',
  'EXTERNAL_SYSTEM',
  'NOTE',
];

const nodeTypeLabels: Record<ManualNodeType, string> = {
  SERVER: 'Server',
  DATABASE: 'Database',
  API_SERVICE: 'API Service',
  QUEUE_EVENT_BUS: 'Queue/Event Bus',
  LOAD_BALANCER: 'Load Balancer',
  CLOUD: 'Cloud Service',
  STORAGE: 'Storage',
  EXTERNAL_SYSTEM: 'External System',
  NOTE: 'Note',
};

function NodeContextMenu({
  x,
  y,
  nodeId,
  nodeName,
  nodeType,
  currentLane,
  isEditable,
  onEdit,
  onDelete,
  onDuplicate,
  onFocus,
  onShowConnections,
  onChangeType,
  onMoveToLane,
  onOpenDetails,
  onClose,
}: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedPosition = useCallback(() => {
    const menuWidth = 220;
    const menuHeight = 400;
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
      if (adjustedY < padding) {
        adjustedY = padding;
      }
    }

    return { x: adjustedX, y: adjustedY };
  }, [x, y]);

  const position = adjustedPosition();

  const menuContent = (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[200px] rounded-lg bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
      style={{ left: position.x, top: position.y }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="text-xs font-medium text-white truncate">{nodeName}</div>
        <div className="text-[10px] text-slate-400">{nodeTypeLabels[nodeType]}</div>
      </div>

      <div className="p-1 max-h-[350px] overflow-y-auto">
        {/* View actions */}
        <button
          onClick={() => {
            onFocus();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
        >
          <Focus className="h-4 w-4" />
          Focus
        </button>

        <button
          onClick={() => {
            onShowConnections(1);
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
        >
          <Link2 className="h-4 w-4" />
          Show 1-hop Connections
        </button>

        <button
          onClick={() => {
            onShowConnections(2);
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
        >
          <ArrowUpRight className="h-4 w-4" />
          Show 2-hop Connections
        </button>

        {onOpenDetails && (
          <button
            onClick={() => {
              onOpenDetails();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open Details
          </button>
        )}

        {isEditable && (
          <>
            <div className="h-px bg-white/10 my-1" />

            {/* Edit actions */}
            <button
              onClick={() => {
                onEdit();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Edit Name
            </button>

            <button
              onClick={() => {
                onDuplicate();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </button>

            {/* Change type submenu */}
            <div className="group relative">
              <button className="w-full flex items-center justify-between px-3 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Change Type
                </div>
                <ChevronRight className="h-3 w-3" />
              </button>

              {/* Type submenu */}
              <div className="absolute left-full top-0 ml-1 hidden group-hover:block min-w-[160px] rounded-lg bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50">
                <div className="p-1 max-h-[280px] overflow-y-auto">
                  {nodeTypeOptions.map((type) => {
                    const styles = nodeTypeStyles[type];
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          onChangeType(type);
                          onClose();
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-md transition-colors',
                          type === nodeType
                            ? 'bg-violet-500/20 text-violet-300'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        )}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: styles.borderColor }}
                        />
                        {nodeTypeLabels[type]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Move to lane submenu */}
            <div className="group relative">
              <button className="w-full flex items-center justify-between px-3 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Move to Lane
                </div>
                <ChevronRight className="h-3 w-3" />
              </button>

              {/* Lane submenu */}
              <div className="absolute left-full top-0 ml-1 hidden group-hover:block min-w-[180px] rounded-lg bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50">
                <div className="p-1">
                  {domainLanes.map((lane) => (
                    <button
                      key={lane.key}
                      onClick={() => {
                        onMoveToLane(lane.key);
                        onClose();
                      }}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-md transition-colors',
                        lane.key === currentLane
                          ? 'bg-violet-500/20 text-violet-300'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      )}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: lane.color }}
                      />
                      {lane.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-px bg-white/10 my-1" />

            {/* Delete */}
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );

  // Render via portal
  if (typeof document === 'undefined') return null;
  return createPortal(menuContent, document.body);
}

export default memo(NodeContextMenu);
