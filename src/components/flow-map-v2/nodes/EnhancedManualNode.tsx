'use client';

// Nexorium Core - Enhanced Manual Node
// Expandable node with inline editing and quick actions

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import {
  Server,
  Database,
  Globe,
  MessageSquare,
  Scale,
  Cloud,
  HardDrive,
  ExternalLink,
  StickyNote,
  type LucideIcon,
  ChevronDown,
  ChevronUp,
  Focus,
  Link2,
  Trash2,
  Copy,
  Pencil,
  Check,
  X,
  MoreHorizontal,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ManualNodeType, ManualNodeScope, DomainLane } from '@/types/flow-map-manual';
import { nodeTypeStyles, domainLanes } from '@/types/flow-map-manual';
import type { FlowMapDomain } from '@/types/flow-map-v2';

// ============================================
// TYPES
// ============================================

interface EnhancedManualNodeData {
  id: string;
  name: string;
  nodeType: ManualNodeType;
  domain?: FlowMapDomain;
  domainLane?: DomainLane;
  description?: string;
  scope: ManualNodeScope;
  hostname?: string;
  version?: string;
  owner?: string;
  team?: string;
  interfacesIn?: number;
  interfacesOut?: number;
  status?: 'healthy' | 'warning' | 'error';
  isSelected?: boolean;
  isExpanded?: boolean;
  isEditable?: boolean; // True in manual mode
  onEdit?: (id: string, updates: Partial<EnhancedManualNodeData>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onFocus?: (id: string) => void;
  onShowConnections?: (id: string, hops: 1 | 2) => void;
}

// ============================================
// ICON MAPPING
// ============================================

const iconMap: Record<ManualNodeType, LucideIcon> = {
  SERVER: Server,
  DATABASE: Database,
  API_SERVICE: Globe,
  QUEUE_EVENT_BUS: MessageSquare,
  LOAD_BALANCER: Scale,
  CLOUD: Cloud,
  STORAGE: HardDrive,
  EXTERNAL_SYSTEM: ExternalLink,
  NOTE: StickyNote,
};

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

// ============================================
// COMPONENT
// ============================================

function EnhancedManualNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as EnhancedManualNodeData;
  const { setCenter, getZoom } = useReactFlow();

  const [isExpanded, setIsExpanded] = useState(nodeData.isExpanded ?? false);
  const [isEditing, setIsEditing] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [editName, setEditName] = useState(nodeData.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const Icon = iconMap[nodeData.nodeType] || Server;
  const styles = nodeTypeStyles[nodeData.nodeType];
  const isEditable = nodeData.isEditable ?? false;

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle save name
  const handleSaveName = useCallback(() => {
    if (editName.trim() && editName !== nodeData.name) {
      nodeData.onEdit?.(nodeData.id, { name: editName.trim() });
    }
    setIsEditing(false);
  }, [editName, nodeData]);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditName(nodeData.name);
    setIsEditing(false);
  }, [nodeData.name]);

  // Handle focus on node
  const handleFocus = useCallback(() => {
    nodeData.onFocus?.(nodeData.id);
    setShowQuickActions(false);
  }, [nodeData]);

  // Handle show connections
  const handleShowConnections = useCallback((hops: 1 | 2) => {
    nodeData.onShowConnections?.(nodeData.id, hops);
    setShowQuickActions(false);
  }, [nodeData]);

  // Handle delete
  const handleDelete = useCallback(() => {
    nodeData.onDelete?.(nodeData.id);
  }, [nodeData]);

  // Handle duplicate
  const handleDuplicate = useCallback(() => {
    nodeData.onDuplicate?.(nodeData.id);
    setShowQuickActions(false);
  }, [nodeData]);

  // Status indicator color
  const statusColor = {
    healthy: '#22c55e',
    warning: '#fbbf24',
    error: '#ef4444',
  }[nodeData.status || 'healthy'];

  return (
    <div
      className={cn(
        'relative rounded-lg transition-all duration-200',
        'shadow-lg cursor-pointer',
        isExpanded ? 'min-w-[220px]' : 'min-w-[160px]',
        selected && 'ring-2 ring-violet-500 ring-offset-2 ring-offset-slate-900',
        nodeData.status === 'warning' && 'shadow-amber-500/20',
        nodeData.status === 'error' && 'shadow-rose-500/20'
      )}
      style={{
        backgroundColor: styles.bgColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: selected ? '#8b5cf6' : styles.borderColor,
        boxShadow: selected
          ? `0 0 24px ${styles.borderColor}50`
          : nodeData.status === 'warning'
            ? '0 0 12px rgba(251, 191, 36, 0.3)'
            : nodeData.status === 'error'
              ? '0 0 12px rgba(239, 68, 68, 0.3)'
              : '0 4px 16px rgba(0, 0, 0, 0.4)',
      }}
      onDoubleClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          'w-3 h-3 border-2 transition-all',
          '!bg-slate-800 !border-slate-500',
          'hover:!bg-violet-500 hover:!border-violet-400'
        )}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          'w-3 h-3 border-2 transition-all',
          '!bg-slate-800 !border-slate-500',
          'hover:!bg-violet-500 hover:!border-violet-400'
        )}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className={cn(
          'w-3 h-3 border-2 transition-all',
          '!bg-slate-800 !border-slate-500',
          'hover:!bg-violet-500 hover:!border-violet-400'
        )}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className={cn(
          'w-3 h-3 border-2 transition-all',
          '!bg-slate-800 !border-slate-500',
          'hover:!bg-violet-500 hover:!border-violet-400'
        )}
      />

      {/* Header with icon and name */}
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          {/* Icon */}
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${styles.borderColor}20` }}
          >
            <Icon className="h-4 w-4" style={{ color: styles.iconColor }} />
          </div>

          {/* Name and type */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  onBlur={handleSaveName}
                  className="w-full px-1.5 py-0.5 text-sm font-medium text-white bg-slate-800 border border-white/20 rounded focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={handleSaveName}
                  className="p-0.5 text-green-400 hover:text-green-300"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-0.5 text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  'text-sm font-medium text-white truncate',
                  isEditable && 'cursor-text hover:text-violet-200'
                )}
                onClick={(e) => {
                  if (isEditable) {
                    e.stopPropagation();
                    setIsEditing(true);
                  }
                }}
                title={isEditable ? 'Click to edit' : nodeData.name}
              >
                {nodeData.name}
              </div>
            )}
            <div className="text-[10px] text-slate-400 truncate">
              {nodeTypeLabels[nodeData.nodeType]}
            </div>
          </div>

          {/* Expand/collapse toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-white/10">
          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
            {nodeData.hostname && (
              <>
                <span className="text-slate-500">Host:</span>
                <span className="text-slate-300 truncate" title={nodeData.hostname}>
                  {nodeData.hostname}
                </span>
              </>
            )}
            {nodeData.version && (
              <>
                <span className="text-slate-500">Version:</span>
                <span className="text-slate-300 font-mono">{nodeData.version}</span>
              </>
            )}
            {nodeData.owner && (
              <>
                <span className="text-slate-500">Owner:</span>
                <span className="text-slate-300 truncate">{nodeData.owner}</span>
              </>
            )}
            {nodeData.team && (
              <>
                <span className="text-slate-500">Team:</span>
                <span className="text-slate-300 truncate">{nodeData.team}</span>
              </>
            )}
            {(nodeData.interfacesIn !== undefined || nodeData.interfacesOut !== undefined) && (
              <>
                <span className="text-slate-500">Interfaces:</span>
                <span className="text-slate-300">
                  {nodeData.interfacesIn ?? 0} in / {nodeData.interfacesOut ?? 0} out
                </span>
              </>
            )}
          </div>

          {/* Quick actions bar */}
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/10">
            <button
              onClick={handleFocus}
              className="flex items-center gap-1 px-1.5 py-1 text-[9px] text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Focus on node"
            >
              <Focus className="h-3 w-3" />
              Focus
            </button>
            <button
              onClick={() => handleShowConnections(1)}
              className="flex items-center gap-1 px-1.5 py-1 text-[9px] text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Show 1-hop connections"
            >
              <Link2 className="h-3 w-3" />
              1-hop
            </button>
            <button
              onClick={() => handleShowConnections(2)}
              className="flex items-center gap-1 px-1.5 py-1 text-[9px] text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Show 2-hop connections"
            >
              <ArrowUpRight className="h-3 w-3" />
              2-hop
            </button>

            {/* More actions dropdown */}
            <div className="relative ml-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickActions(!showQuickActions);
                }}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>

              {showQuickActions && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-1">
                    {isEditable && (
                      <>
                        <button
                          onClick={handleDuplicate}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <div className="h-px bg-white/10 my-1" />
                        <button
                          onClick={handleDelete}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status indicator */}
      {nodeData.status && (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900"
          style={{ backgroundColor: statusColor }}
        />
      )}

      {/* Scope badge */}
      {nodeData.scope !== 'GLOBAL' && (
        <div
          className="absolute -top-2 left-3 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
          style={{
            backgroundColor: styles.borderColor,
            color: '#0f172a',
          }}
        >
          {nodeData.scope}
        </div>
      )}

      {/* Domain badge */}
      {nodeData.domainLane && !isExpanded && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-medium bg-slate-800 text-slate-400 border border-white/10">
          {nodeData.domainLane}
        </div>
      )}
    </div>
  );
}

export default memo(EnhancedManualNode);
