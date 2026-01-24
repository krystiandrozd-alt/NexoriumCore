'use client';

// TelEnvIQ - Custom Node Component for React Flow
// Enhanced with telco layer badges, violation indicators, and enrichment markers

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import {
  Server,
  Database,
  Globe,
  Layers,
  Radio,
  LoaderCircle,
  Box,
  Waypoints,
  ShieldAlert,
  Edit3,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { daysSince, getStalenessLevel, getStalenessBadgeColor } from '@/lib/utils';
import type {
  NodeType,
  Criticality,
  DatabaseMetadata,
  TelcoLayer,
  TelcoSubsystem,
  NetworkZone,
  RuntimeLayer,
  NodeHostingDomain,
  DataClassification,
} from '@/types';

interface CustomNodeData {
  label: string;
  nodeType: NodeType;
  owner?: string | null;
  criticality: Criticality;
  lastSeenAt: Date;
  databaseMetadata?: DatabaseMetadata | null;
  isStale?: boolean;
  // New enterprise fields
  telcoLayer?: TelcoLayer | null;
  telcoSubsystem?: TelcoSubsystem | null;
  networkZone?: NetworkZone | null;
  runtimeLayer?: RuntimeLayer | null;
  hostingDomains?: NodeHostingDomain[];
  hasEnrichments?: boolean;
  hasPolicyViolations?: boolean;
  dataClassification?: DataClassification | null;
  derivedFromProdClone?: boolean;
}

const nodeIcons: Record<NodeType, typeof Server> = {
  APPLICATION: Box,
  SERVICE: Server,
  DATABASE: Database,
  GATEWAY: Waypoints,
  EXTERNAL: Globe,
  RUNTIME: Layers,
  MESSAGE_QUEUE: Radio,
  LOAD_BALANCER: LoaderCircle,
};

const nodeColors: Record<NodeType, { bg: string; border: string; icon: string }> = {
  APPLICATION: { bg: 'bg-blue-50', border: 'border-blue-300', icon: 'text-blue-600' },
  SERVICE: { bg: 'bg-indigo-50', border: 'border-indigo-300', icon: 'text-indigo-600' },
  DATABASE: { bg: 'bg-emerald-50', border: 'border-emerald-300', icon: 'text-emerald-600' },
  GATEWAY: { bg: 'bg-purple-50', border: 'border-purple-300', icon: 'text-purple-600' },
  EXTERNAL: { bg: 'bg-slate-50', border: 'border-slate-300', icon: 'text-slate-600' },
  RUNTIME: { bg: 'bg-orange-50', border: 'border-orange-300', icon: 'text-orange-600' },
  MESSAGE_QUEUE: { bg: 'bg-cyan-50', border: 'border-cyan-300', icon: 'text-cyan-600' },
  LOAD_BALANCER: { bg: 'bg-amber-50', border: 'border-amber-300', icon: 'text-amber-600' },
};

const telcoLayerColors: Record<TelcoLayer, string> = {
  BSS: 'bg-blue-100 text-blue-700',
  OSS: 'bg-amber-100 text-amber-700',
  NETWORK: 'bg-indigo-100 text-indigo-700',
  SHARED: 'bg-slate-100 text-slate-700',
  EXTERNAL: 'bg-green-100 text-green-700',
};

const classificationBadgeColors: Record<DataClassification, string> = {
  PII: 'bg-red-100 text-red-700 border-red-300',
  PCI: 'bg-orange-100 text-orange-700 border-orange-300',
  CONFIDENTIAL: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  NON_SENSITIVE: 'bg-green-100 text-green-700 border-green-300',
};

function CustomNode({ data, selected }: NodeProps & { data: CustomNodeData }) {
  const Icon = nodeIcons[data.nodeType] || Server;
  const colors = nodeColors[data.nodeType] || nodeColors.SERVICE;

  // Calculate database staleness if applicable
  let refreshBadge = null;
  if (data.nodeType === 'DATABASE' && data.databaseMetadata?.testDataSet) {
    const days = daysSince(data.databaseMetadata.testDataSet.lastRefreshDate);
    const level = getStalenessLevel(days);
    const badgeColor = getStalenessBadgeColor(level);

    refreshBadge = (
      <div className={cn('absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white', badgeColor)}>
        {days === null ? 'Never' : `${days}d`}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative px-4 py-3 rounded-lg border-2 shadow-sm min-w-[140px] transition-all',
        colors.bg,
        colors.border,
        selected && 'ring-2 ring-indigo-500 ring-offset-2',
        data.isStale && 'opacity-60',
        data.hasPolicyViolations && 'ring-2 ring-red-500 ring-offset-1 animate-pulse'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-slate-400 !w-2 !h-2"
      />

      {refreshBadge}

      {/* Policy Violation Indicator */}
      {data.hasPolicyViolations && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="relative flex h-5 w-5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-5 w-5 rounded-full bg-red-500 items-center justify-center">
              <ShieldAlert className="h-3 w-3 text-white" />
            </span>
          </span>
        </div>
      )}

      {/* Enrichment Indicator */}
      {data.hasEnrichments && !data.hasPolicyViolations && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="flex h-5 w-5 rounded-full bg-indigo-500 items-center justify-center">
            <Edit3 className="h-2.5 w-2.5 text-white" />
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Icon className={cn('h-5 w-5', colors.icon)} />
        <div className="min-w-0">
          <div className="font-medium text-sm text-slate-900 truncate max-w-[120px]">
            {data.label}
          </div>
          {data.owner && (
            <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
              {data.owner}
            </div>
          )}
        </div>
      </div>

      {/* Telco Layer Badge */}
      {data.telcoLayer && (
        <div className="mt-1.5">
          <span className={cn(
            'inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium',
            telcoLayerColors[data.telcoLayer]
          )}>
            {data.telcoLayer}
            {data.telcoSubsystem && ` · ${data.telcoSubsystem}`}
          </span>
        </div>
      )}

      {data.criticality === 'CRITICAL' && (
        <div className="absolute -top-2 -left-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
            !
          </span>
        </div>
      )}

      {data.nodeType === 'DATABASE' && data.databaseMetadata && (
        <div className="mt-2 pt-2 border-t border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-slate-600">
              {data.databaseMetadata.engine}
              {data.databaseMetadata.version && ` v${data.databaseMetadata.version}`}
            </div>
            {/* Data Classification Badge */}
            {data.dataClassification && (
              <span className={cn(
                'px-1 py-0.5 rounded text-[8px] font-medium border',
                classificationBadgeColors[data.dataClassification]
              )}>
                {data.dataClassification}
              </span>
            )}
          </div>
          {/* Derived from PROD indicator */}
          {data.derivedFromProdClone && (
            <div className="flex items-center gap-1 mt-1 text-[9px] text-orange-600">
              <GitBranch className="h-2.5 w-2.5" />
              <span>From PROD</span>
            </div>
          )}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-400 !w-2 !h-2"
      />
    </div>
  );
}

export default memo(CustomNode);
