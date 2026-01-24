'use client';

// TelEnvIQ - Custom Node for 5-Layer Model
// Displays component instance with layer, version, entry/exit badges

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Server,
  Database,
  Workflow,
  Globe,
  Layers,
  ArrowRightFromLine,
  ArrowLeftToLine,
} from 'lucide-react';
import type { ArchitectureLayer, CapabilityType } from '@/types';

interface Custom5LayerNodeData {
  label: string;
  displayName?: string | null;
  componentName: string;
  layer: ArchitectureLayer;
  capabilityType: CapabilityType;
  hostname?: string | null;
  primaryEndpoint?: { port?: number | null; scheme?: string | null } | null;
  projectVersion?: string | null;
  isEntry: boolean;
  isExit: boolean;
  sourceSystem?: string | null;
  ingestedAt?: Date | null;
}

const LAYER_COLORS: Record<ArchitectureLayer, { bg: string; border: string; text: string }> = {
  BSS: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700' },
  OSS: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700' },
  INFRA: { bg: 'bg-slate-50', border: 'border-slate-400', text: 'text-slate-700' },
  EXTERNAL: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700' },
  UNKNOWN: { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-600' },
};

const CAPABILITY_ICONS: Record<CapabilityType, typeof Server> = {
  CPQ: Workflow,
  CRM: Server,
  BILLING: Server,
  SOM: Workflow,
  INVENTORY: Database,
  ORCHESTRATOR: Workflow,
  DB: Database,
  MQ: Layers,
  API_GW: Globe,
  IDENTITY: Server,
  ITSM: Server,
  OTHER: Server,
  UNKNOWN: Server,
};

function Custom5LayerNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as Custom5LayerNodeData;
  const colors = LAYER_COLORS[nodeData.layer] || LAYER_COLORS.UNKNOWN;
  const Icon = CAPABILITY_ICONS[nodeData.capabilityType] || Server;

  return (
    <>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-slate-400" />

      <div
        className={`
          relative px-3 py-2 rounded-lg border-2 min-w-[160px] max-w-[220px]
          ${colors.bg} ${colors.border}
          ${selected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
          shadow-sm transition-shadow hover:shadow-md
        `}
      >
        {/* Entry/Exit badges */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
          {nodeData.isEntry && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500 text-white rounded-full shadow-sm">
              <ArrowRightFromLine className="w-2.5 h-2.5" />
              ENTRY
            </span>
          )}
          {nodeData.isExit && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-semibold bg-rose-500 text-white rounded-full shadow-sm">
              EXIT
              <ArrowLeftToLine className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className={`p-1 rounded ${colors.bg} ${colors.text}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-800 truncate">
              {nodeData.label}
            </div>
            {nodeData.componentName !== nodeData.label && (
              <div className="text-[10px] text-slate-500 truncate">
                {nodeData.componentName}
              </div>
            )}
          </div>
        </div>

        {/* Version - prominent display */}
        {nodeData.projectVersion && (
          <div className="mb-1 px-1.5 py-0.5 bg-white rounded border border-slate-200">
            <span className="text-[10px] font-mono font-medium text-indigo-600">
              v{nodeData.projectVersion}
            </span>
          </div>
        )}

        {/* Host and endpoint info */}
        <div className="text-[10px] text-slate-500 space-y-0.5">
          {nodeData.hostname && (
            <div className="truncate">
              {nodeData.hostname}
            </div>
          )}
          {nodeData.primaryEndpoint?.port && (
            <div>
              :{nodeData.primaryEndpoint.port}
              {nodeData.primaryEndpoint.scheme && (
                <span className="text-slate-400 ml-1">
                  ({nodeData.primaryEndpoint.scheme})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Layer badge */}
        <div className="mt-1.5 flex items-center justify-between">
          <span className={`text-[9px] font-medium ${colors.text} uppercase`}>
            {nodeData.layer}
          </span>
          {nodeData.sourceSystem && (
            <span className="text-[9px] text-slate-400">
              via {nodeData.sourceSystem}
            </span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-slate-400" />
    </>
  );
}

export default memo(Custom5LayerNode);
