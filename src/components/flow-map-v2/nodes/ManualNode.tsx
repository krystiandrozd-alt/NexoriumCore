'use client';

// Nexorium Core - Manual Node Component
// Custom React Flow node for manual design mode

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ManualNodeType, ManualNodeScope } from '@/types/flow-map-manual';
import { nodeTypeStyles } from '@/types/flow-map-manual';
import type { FlowMapDomain } from '@/types/flow-map-v2';

// Node data interface
interface ManualNodeDataProps {
  id: string;
  name: string;
  nodeType: ManualNodeType;
  domain?: FlowMapDomain;
  description?: string;
  scope: ManualNodeScope;
  isSelected?: boolean;
  isHovered?: boolean;
}

// Icon mapping
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

function ManualNode({ data, selected }: NodeProps) {
  // Cast data to our expected type
  const nodeData = data as unknown as ManualNodeDataProps;
  const Icon = iconMap[nodeData.nodeType] || Server;
  const styles = nodeTypeStyles[nodeData.nodeType];

  return (
    <div
      className={cn(
        'relative px-4 py-3 rounded-lg min-w-[140px]',
        'transition-all duration-200',
        'shadow-lg',
        selected && 'ring-2 ring-offset-2 ring-offset-slate-900'
      )}
      style={{
        backgroundColor: styles.bgColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: selected ? '#8b5cf6' : styles.borderColor,
        boxShadow: selected
          ? `0 0 20px ${styles.borderColor}40`
          : `0 4px 12px rgba(0, 0, 0, 0.3)`,
      }}
    >
      {/* Source handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          'w-3 h-3 border-2 transition-all',
          '!bg-slate-800 !border-slate-500',
          'hover:!bg-violet-500 hover:!border-violet-400'
        )}
      />

      {/* Target handle (left) */}
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          'w-3 h-3 border-2 transition-all',
          '!bg-slate-800 !border-slate-500',
          'hover:!bg-violet-500 hover:!border-violet-400'
        )}
      />

      {/* Content */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: `${styles.borderColor}20`,
          }}
        >
          <Icon className="h-4 w-4" color={styles.iconColor} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-white truncate">
            {nodeData.name}
          </div>
          {nodeData.description && (
            <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
              {nodeData.description}
            </div>
          )}
        </div>
      </div>

      {/* Scope badge */}
      {nodeData.scope !== 'GLOBAL' && (
        <div
          className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
          style={{
            backgroundColor: styles.borderColor,
            color: '#0f172a',
          }}
        >
          {nodeData.scope}
        </div>
      )}

      {/* Domain badge */}
      {nodeData.domain && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-medium bg-slate-800 text-slate-400 border border-white/10">
          {nodeData.domain}
        </div>
      )}
    </div>
  );
}

export default memo(ManualNode);
