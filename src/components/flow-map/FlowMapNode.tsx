'use client';

// TelEnvIQ - Flow Map Node Components
// Premium glassmorphism nodes with animations for portfolio visualization

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import {
  Briefcase,
  Server,
  Database,
  Globe,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Activity,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowNodeType, RiskLevel, NodeHealthStatus } from '@/types/flow-map';

// ============================================
// NODE DATA INTERFACE
// ============================================

export interface FlowMapNodeData extends Record<string, unknown> {
  label: string;
  subLabel?: string;
  nodeType: FlowNodeType;
  status: NodeHealthStatus;
  healthScore: number;
  riskLevel: RiskLevel;
  isHighlighted?: boolean;
  isCollisionTarget?: boolean;
  isConvergencePoint?: boolean;
  connectionCount?: number;
  metadata?: {
    owner?: string;
    team?: string;
    utilization?: number;
    vendor?: string;
    version?: string;
  };
}

// ============================================
// STYLING CONFIGS
// ============================================

const nodeTypeConfig: Record<
  FlowNodeType,
  {
    icon: typeof Server;
    gradient: string;
    borderColor: string;
    glowColor: string;
    iconColor: string;
  }
> = {
  PROJECT: {
    icon: Briefcase,
    gradient: 'from-violet-500/20 via-violet-500/10 to-transparent',
    borderColor: 'border-violet-500/40',
    glowColor: 'shadow-violet-500/20',
    iconColor: 'text-violet-400',
  },
  ENVIRONMENT: {
    icon: Server,
    gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
    borderColor: 'border-blue-500/40',
    glowColor: 'shadow-blue-500/20',
    iconColor: 'text-blue-400',
  },
  SYSTEM: {
    icon: Database,
    gradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
    borderColor: 'border-purple-500/40',
    glowColor: 'shadow-purple-500/20',
    iconColor: 'text-purple-400',
  },
  EXTERNAL: {
    icon: Globe,
    gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
    borderColor: 'border-amber-500/40',
    glowColor: 'shadow-amber-500/20',
    iconColor: 'text-amber-400',
  },
};

const statusConfig: Record<NodeHealthStatus, { color: string; bgColor: string }> = {
  HEALTHY: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  WARNING: { color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  CRITICAL: { color: 'text-rose-400', bgColor: 'bg-rose-500/20' },
  UNKNOWN: { color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
};

const riskConfig: Record<RiskLevel, { color: string; bgColor: string }> = {
  CRITICAL: { color: 'text-rose-400', bgColor: 'bg-rose-500/20' },
  HIGH: { color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  MEDIUM: { color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  LOW: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  NONE: { color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
};

// ============================================
// STATUS ICON
// ============================================

function StatusIcon({ status }: { status: NodeHealthStatus }) {
  const config = statusConfig[status];

  switch (status) {
    case 'HEALTHY':
      return <CheckCircle2 className={cn('h-3 w-3', config.color)} />;
    case 'WARNING':
      return <AlertTriangle className={cn('h-3 w-3', config.color)} />;
    case 'CRITICAL':
      return <AlertCircle className={cn('h-3 w-3 animate-pulse', config.color)} />;
    default:
      return <Activity className={cn('h-3 w-3', config.color)} />;
  }
}

// ============================================
// FLOW MAP NODE
// ============================================

function FlowMapNode({ data, selected }: NodeProps & { data: FlowMapNodeData }) {
  const config = nodeTypeConfig[data.nodeType];
  const _statusStyle = statusConfig[data.status];
  const riskStyle = riskConfig[data.riskLevel];
  const Icon = config.icon;

  const isHighRisk = data.riskLevel === 'CRITICAL' || data.riskLevel === 'HIGH';
  const isCollision = data.isCollisionTarget;
  const isConvergence = data.isConvergencePoint;

  return (
    <div
      className={cn(
        // Base styles
        'relative group transition-all duration-200 ease-out',
        // Size based on type
        data.nodeType === 'PROJECT' ? 'min-w-[200px]' : 'min-w-[160px]',
        // Hover scale
        'hover:scale-105',
        // Selection state
        selected && 'scale-105'
      )}
      data-testid={`flowmap-node-${data.label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Glow effect for high risk or collision */}
      {(isHighRisk || isCollision) && (
        <div
          className={cn(
            'absolute -inset-2 rounded-2xl blur-xl opacity-40 animate-pulse',
            isCollision
              ? 'bg-rose-500/30'
              : data.riskLevel === 'CRITICAL'
              ? 'bg-rose-500/25'
              : 'bg-orange-500/25'
          )}
        />
      )}

      {/* Convergence indicator ring */}
      {isConvergence && (
        <div className="absolute -inset-1 rounded-2xl border-2 border-dashed border-violet-500/50 animate-[spin_10s_linear_infinite]" />
      )}

      {/* Main card */}
      <div
        className={cn(
          // Glass morphism base
          'relative px-4 py-3 rounded-xl',
          'backdrop-blur-xl',
          'bg-gradient-to-br',
          config.gradient,
          // Border
          'border',
          config.borderColor,
          // Shadow
          'shadow-xl',
          config.glowColor,
          // Selection glow
          selected && 'ring-2 ring-violet-500/50',
          // Highlight state
          data.isHighlighted && 'ring-2 ring-cyan-500/50'
        )}
      >
        {/* Connection handles */}
        <Handle
          type="target"
          position={Position.Top}
          className={cn(
            '!w-3 !h-1.5 !rounded-full !border-0 transition-colors',
            '!bg-white/20 hover:!bg-white/40'
          )}
        />
        <Handle
          type="target"
          position={Position.Left}
          className={cn(
            '!w-1.5 !h-3 !rounded-full !border-0 transition-colors',
            '!bg-white/20 hover:!bg-white/40'
          )}
        />

        {/* Collision badge */}
        {isCollision && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-500/90 text-white border border-rose-400/50 shadow-lg shadow-rose-500/30 animate-pulse">
              COLLISION
            </div>
          </div>
        )}

        {/* Convergence badge */}
        {isConvergence && !isCollision && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-violet-500/90 text-white border border-violet-400/50">
              CONVERGENCE
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex items-start gap-3">
          {/* Icon container */}
          <div
            className={cn(
              'p-2 rounded-lg',
              'bg-white/5 border border-white/10',
              'transition-transform group-hover:scale-110'
            )}
          >
            <Icon className={cn('h-5 w-5', config.iconColor)} />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            {/* Label */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white truncate">
                {data.label}
              </span>
              <StatusIcon status={data.status} />
            </div>

            {/* Sub-label */}
            {data.subLabel && (
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {data.subLabel}
              </div>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-2 mt-2">
              {/* Risk badge */}
              <div
                className={cn(
                  'px-1.5 py-0.5 rounded text-[9px] font-medium',
                  riskStyle.bgColor,
                  riskStyle.color,
                  'border border-current/20'
                )}
              >
                {data.riskLevel}
              </div>

              {/* Health score */}
              <div className="flex items-center gap-1">
                <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      data.healthScore >= 80
                        ? 'bg-emerald-500'
                        : data.healthScore >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    )}
                    style={{ width: `${data.healthScore}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-500">{data.healthScore}%</span>
              </div>
            </div>

            {/* Metadata row (for projects) */}
            {data.nodeType === 'PROJECT' && data.metadata?.owner && (
              <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                <Users className="h-3 w-3" />
                <span className="truncate">{data.metadata.owner}</span>
              </div>
            )}

            {/* Utilization (for environments) */}
            {data.nodeType === 'ENVIRONMENT' && data.metadata?.utilization !== undefined && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      data.metadata.utilization >= 85
                        ? 'bg-rose-500'
                        : data.metadata.utilization >= 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    )}
                    style={{ width: `${data.metadata.utilization}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-500">
                  {data.metadata.utilization}% used
                </span>
              </div>
            )}

            {/* Version info (for systems) */}
            {data.nodeType === 'SYSTEM' && data.metadata?.version && (
              <div className="mt-2 text-[10px] text-slate-500 font-mono">
                v{data.metadata.version}
              </div>
            )}
          </div>
        </div>

        {/* Source handles */}
        <Handle
          type="source"
          position={Position.Bottom}
          className={cn(
            '!w-3 !h-1.5 !rounded-full !border-0 transition-colors',
            '!bg-white/20 hover:!bg-white/40'
          )}
        />
        <Handle
          type="source"
          position={Position.Right}
          className={cn(
            '!w-1.5 !h-3 !rounded-full !border-0 transition-colors',
            '!bg-white/20 hover:!bg-white/40'
          )}
        />
      </div>

      {/* Connection count indicator */}
      {data.connectionCount && data.connectionCount > 3 && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-slate-800/90 border border-white/10 text-[8px] text-slate-400">
          {data.connectionCount} connections
        </div>
      )}
    </div>
  );
}

export default memo(FlowMapNode);
