'use client';

// TelEnvIQ - Inspector Panel (Premium)
// Left-side collapsible panel showing selected node/edge details

import { memo, useState, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Box,
  ArrowRight,
  Clock,
  GitBranch,
  Edit3,
  History,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArchitectureLayer, CapabilityType, ConnectionConfidence, ConnectionOrigin } from '@/types';

// Node data from graph
export interface InspectorNodeData {
  id: string;
  label: string;
  displayName?: string | null;
  componentName: string;
  layer: ArchitectureLayer;
  capabilityType: CapabilityType;
  hostname?: string | null;
  primaryEndpoint?: { port?: number | null; scheme?: string | null } | null;
  projectVersion?: string | null;
  vendorVersion?: string | null;
  isEntry: boolean;
  isExit: boolean;
  sourceSystem?: string | null;
  ingestedAt?: Date | string | null;
}

// Edge data from graph
export interface InspectorEdgeData {
  id: string;
  source?: string;
  target?: string;
  sourceNodeName: string;
  targetNodeName: string;
  protocolType: string;
  protocolDetail?: string | null;
  port?: number | null;
  origin?: ConnectionOrigin;
  confidence: ConnectionConfidence;
  sourceSystem?: string | null;
  driftStatus?: 'added' | 'removed' | 'changed' | null;
}

interface InspectorPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedNode?: InspectorNodeData | null;
  selectedEdge?: InspectorEdgeData | null;
  onClearSelection: () => void;
  onEditNode?: (nodeId: string) => void;
  onViewHistory?: (nodeId: string) => void;
}

const layerColors: Record<ArchitectureLayer, { bg: string; text: string; border: string }> = {
  BSS: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  OSS: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
  INFRA: { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/30' },
  EXTERNAL: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  UNKNOWN: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' },
};

const confidenceColors: Record<ConnectionConfidence, string> = {
  HIGH: 'text-emerald-400',
  MED: 'text-amber-400',
  LOW: 'text-rose-400',
};

function InspectorPanel({
  isOpen,
  onToggle,
  selectedNode,
  selectedEdge,
  onClearSelection,
  onEditNode,
  onViewHistory,
}: InspectorPanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = useCallback(async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasSelection = selectedNode || selectedEdge;

  return (
    <>
      {/* Toggle button when collapsed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className={cn(
            'fixed left-0 top-1/2 -translate-y-1/2 z-50',
            'px-1 py-4 rounded-r-lg',
            'glass-panel-interactive',
            'text-slate-400 hover:text-white',
            'transition-all'
          )}
          data-testid="inspector-toggle"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full z-40',
          'premium-inspector premium-scrollbar',
          'transition-all duration-300 ease-out overflow-hidden',
          isOpen ? 'w-80' : 'w-0'
        )}
        data-testid="inspector-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">Inspector</h2>
          <div className="flex items-center gap-1">
            {hasSelection && (
              <button
                onClick={onClearSelection}
                className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Clear selection"
                data-testid="inspector-close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onToggle}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Collapse panel"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-56px)]">
          {!hasSelection ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                <Box className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-sm text-slate-400">Select a node or edge</p>
              <p className="text-xs text-slate-500 mt-1">Click to view details</p>
            </div>
          ) : selectedNode ? (
            <NodeDetails
              node={selectedNode}
              onCopy={handleCopy}
              copiedField={copiedField}
              onEdit={onEditNode}
              onViewHistory={onViewHistory}
              formatDate={formatDate}
            />
          ) : selectedEdge ? (
            <EdgeDetails
              edge={selectedEdge}
              onCopy={handleCopy}
              copiedField={copiedField}
              formatDate={formatDate}
            />
          ) : null}
        </div>

        {/* Keyboard hint footer */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-2 border-t border-white/5 bg-slate-900/50">
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="kbd-hint">ESC</span>
            <span>Clear selection</span>
          </div>
        </div>
      </div>
    </>
  );
}

// Node details component
function NodeDetails({
  node,
  onCopy,
  copiedField,
  onEdit,
  onViewHistory,
  formatDate,
}: {
  node: InspectorNodeData;
  onCopy: (value: string, field: string) => void;
  copiedField: string | null;
  onEdit?: (nodeId: string) => void;
  onViewHistory?: (nodeId: string) => void;
  formatDate: (date: Date | string | null | undefined) => string;
}) {
  const layerStyle = layerColors[node.layer] || layerColors.UNKNOWN;

  return (
    <div className="space-y-4">
      {/* Header with layer badge */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white truncate">
              {node.displayName || node.componentName}
            </h3>
            {node.displayName && (
              <p className="text-xs text-slate-400 truncate">{node.componentName}</p>
            )}
          </div>
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium ml-2',
              layerStyle.bg,
              layerStyle.text,
              'border',
              layerStyle.border
            )}
          >
            {node.layer}
          </span>
        </div>

        {/* Entry/Exit badges */}
        <div className="flex gap-2 mt-2">
          {node.isEntry && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ENTRY
            </span>
          )}
          {node.isExit && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
              EXIT
            </span>
          )}
        </div>
      </div>

      {/* Version - Prominent */}
      {node.projectVersion && (
        <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-violet-400 mb-0.5">
                Project Version
              </div>
              <div className="text-lg font-mono font-semibold text-white">
                {node.projectVersion}
              </div>
              {node.vendorVersion && (
                <div className="text-xs text-slate-400 mt-0.5">
                  Vendor: {node.vendorVersion}
                </div>
              )}
            </div>
            <button
              onClick={() => onCopy(node.projectVersion!, 'version')}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Copy version"
            >
              {copiedField === 'version' ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Details grid */}
      <div className="space-y-3">
        <DetailRow label="Capability" value={node.capabilityType} />

        {node.hostname && (
          <DetailRow
            label="Host"
            value={node.hostname}
            copyable
            onCopy={() => onCopy(node.hostname!, 'host')}
            copied={copiedField === 'host'}
          />
        )}

        {node.primaryEndpoint && (
          <DetailRow
            label="Endpoint"
            value={`${node.primaryEndpoint.scheme || 'TCP'}:${node.primaryEndpoint.port || '?'}`}
          />
        )}
      </div>

      {/* Provenance section */}
      <div className="pt-3 border-t border-white/5">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          Provenance
        </div>
        <div className="space-y-2">
          {node.sourceSystem && (
            <div className="flex items-center gap-2 text-sm">
              <GitBranch className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-300">{node.sourceSystem}</span>
            </div>
          )}
          {node.ingestedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-400">{formatDate(node.ingestedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-white/5 space-y-2">
        {onEdit && (
          <button
            onClick={() => onEdit(node.id)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            Edit Details
          </button>
        )}
        {onViewHistory && (
          <button
            onClick={() => onViewHistory(node.id)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <History className="h-4 w-4" />
            View History
          </button>
        )}
      </div>
    </div>
  );
}

// Edge details component
function EdgeDetails({
  edge,
  onCopy: _onCopy,
  copiedField: _copiedField,
  formatDate: _formatDate,
}: {
  edge: InspectorEdgeData;
  onCopy: (value: string, field: string) => void;
  copiedField: string | null;
  formatDate: (date: Date | string | null | undefined) => string;
}) {
  return (
    <div className="space-y-4">
      {/* Connection header */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          Connection
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white font-medium truncate max-w-[100px]">
            {edge.sourceNodeName}
          </span>
          <ArrowRight className="h-4 w-4 text-violet-400 flex-shrink-0" />
          <span className="text-white font-medium truncate max-w-[100px]">
            {edge.targetNodeName}
          </span>
        </div>
      </div>

      {/* Protocol info */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-mono font-semibold text-white">
            {edge.protocolType}
          </span>
          {edge.port && (
            <span className="text-sm text-slate-400">:{edge.port}</span>
          )}
        </div>
        {edge.protocolDetail && (
          <div className="text-xs text-slate-400">{edge.protocolDetail}</div>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-3">
        <DetailRow
          label="Origin"
          value={
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium',
                edge.origin === 'INGESTED'
                  ? 'bg-slate-500/20 text-slate-300'
                  : 'bg-violet-500/20 text-violet-300'
              )}
            >
              {edge.origin === 'INGESTED' ? 'Auto-discovered' : 'Manual'}
            </span>
          }
        />

        <DetailRow
          label="Confidence"
          value={
            <span className={cn('font-medium', confidenceColors[edge.confidence])}>
              {edge.confidence}
            </span>
          }
        />

        {edge.driftStatus && (
          <DetailRow
            label="Drift"
            value={
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  edge.driftStatus === 'added' && 'badge-drift-added',
                  edge.driftStatus === 'removed' && 'badge-drift-removed',
                  edge.driftStatus === 'changed' && 'badge-drift-changed'
                )}
              >
                {edge.driftStatus.toUpperCase()}
              </span>
            }
          />
        )}
      </div>

      {/* Source system */}
      {edge.sourceSystem && (
        <div className="pt-3 border-t border-white/5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
            Source
          </div>
          <div className="flex items-center gap-2 text-sm">
            <GitBranch className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-300">{edge.sourceSystem}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable detail row
function DetailRow({
  label,
  value,
  copyable,
  onCopy,
  copied,
}: {
  label: string;
  value: React.ReactNode;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        {typeof value === 'string' ? (
          <span className="text-sm text-slate-300">{value}</span>
        ) : (
          value
        )}
        {copyable && onCopy && (
          <button
            onClick={onCopy}
            className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(InspectorPanel);
