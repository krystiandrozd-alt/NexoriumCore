'use client';

// Nexorium Core - Inspector Panel
// Right-side panel showing selected node/edge details

import { memo, useState, useCallback } from 'react';
import {
  X,
  Server,
  Database,
  Globe,
  MessageSquare,
  Scale,
  Cloud,
  HardDrive,
  ExternalLink,
  StickyNote,
  Link2,
  ArrowRight,
  Pencil,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ManualNodeType, ManualEdgeType, DomainLane } from '@/types/flow-map-manual';
import { nodeTypeStyles, edgeTypeStyles, domainLanes } from '@/types/flow-map-manual';

// ============================================
// TYPES
// ============================================

export interface InspectedNode {
  id: string;
  name: string;
  type: 'environment' | 'manual';
  nodeType?: ManualNodeType;
  description?: string;
  hostname?: string;
  version?: string;
  owner?: string;
  team?: string;
  stage?: string;
  domain?: string;
  domainLane?: DomainLane;
  status?: 'healthy' | 'warning' | 'error';
  interfacesIn?: number;
  interfacesOut?: number;
  systemCount?: number;
  connectionCount?: number;
  metadata?: Record<string, unknown>;
}

export interface InspectedEdge {
  id: string;
  source: string;
  sourceName: string;
  target: string;
  targetName: string;
  edgeType: ManualEdgeType | string;
  label?: string;
  protocol?: string;
  metadata?: Record<string, unknown>;
}

interface InspectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: InspectedNode | null;
  selectedEdge: InspectedEdge | null;
  isEditable: boolean;
  onUpdateNode?: (id: string, updates: Partial<InspectedNode>) => void;
  onUpdateEdge?: (id: string, updates: Partial<InspectedEdge>) => void;
}

// ============================================
// ICONS
// ============================================

const nodeTypeIcons: Record<ManualNodeType, LucideIcon> = {
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

function InspectorPanel({
  isOpen,
  onClose,
  selectedNode,
  selectedEdge,
  isEditable,
  onUpdateNode,
  onUpdateEdge,
}: InspectorPanelProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = useCallback((field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingField || !editValue.trim()) {
      setEditingField(null);
      return;
    }

    if (selectedNode && onUpdateNode) {
      onUpdateNode(selectedNode.id, { [editingField]: editValue.trim() });
    } else if (selectedEdge && onUpdateEdge) {
      onUpdateEdge(selectedEdge.id, { [editingField]: editValue.trim() });
    }

    setEditingField(null);
  }, [editingField, editValue, selectedNode, selectedEdge, onUpdateNode, onUpdateEdge]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white">Inspector</h3>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedNode && !selectedEdge && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Server className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No selection</p>
            <p className="text-[11px] mt-1">Click a node or edge to inspect</p>
          </div>
        )}

        {/* Node inspector */}
        {selectedNode && (
          <div className="p-4">
            {/* Node header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: selectedNode.nodeType
                    ? nodeTypeStyles[selectedNode.nodeType].bgColor
                    : 'rgba(139, 92, 246, 0.2)',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: selectedNode.nodeType
                    ? nodeTypeStyles[selectedNode.nodeType].borderColor
                    : '#8b5cf6',
                }}
              >
                {selectedNode.nodeType && nodeTypeIcons[selectedNode.nodeType] ? (
                  (() => {
                    const Icon = nodeTypeIcons[selectedNode.nodeType!];
                    return <Icon className="h-5 w-5" style={{ color: nodeTypeStyles[selectedNode.nodeType!].iconColor }} />;
                  })()
                ) : (
                  <Server className="h-5 w-5 text-violet-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {editingField === 'name' ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') setEditingField(null);
                      }}
                      className="flex-1 px-2 py-1 text-sm font-medium text-white bg-slate-800 border border-white/20 rounded focus:outline-none focus:border-violet-500"
                      autoFocus
                    />
                    <button onClick={handleSaveEdit} className="p-1 text-green-400">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      'text-sm font-medium text-white truncate',
                      isEditable && 'cursor-text hover:text-violet-200'
                    )}
                    onClick={() => isEditable && handleStartEdit('name', selectedNode.name)}
                  >
                    {selectedNode.name}
                    {isEditable && <Pencil className="inline-block ml-1 h-3 w-3 opacity-50" />}
                  </div>
                )}
                <div className="text-[10px] text-slate-400">
                  {selectedNode.nodeType ? nodeTypeLabels[selectedNode.nodeType] : selectedNode.type}
                </div>
              </div>
            </div>

            {/* Status indicator */}
            {selectedNode.status && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      selectedNode.status === 'healthy'
                        ? '#22c55e'
                        : selectedNode.status === 'warning'
                          ? '#fbbf24'
                          : '#ef4444',
                  }}
                />
                <span className="text-xs font-medium text-slate-300 capitalize">
                  {selectedNode.status}
                </span>
              </div>
            )}

            {/* Properties */}
            <div className="space-y-3">
              <PropertyGroup title="Metadata">
                {selectedNode.description && (
                  <Property label="Description" value={selectedNode.description} />
                )}
                {selectedNode.hostname && (
                  <Property label="Hostname" value={selectedNode.hostname} isCode />
                )}
                {selectedNode.version && (
                  <Property label="Version" value={selectedNode.version} isCode />
                )}
                {selectedNode.owner && (
                  <Property label="Owner" value={selectedNode.owner} />
                )}
                {selectedNode.team && (
                  <Property label="Team" value={selectedNode.team} />
                )}
              </PropertyGroup>

              <PropertyGroup title="Classification">
                {selectedNode.stage && (
                  <Property label="Stage" value={selectedNode.stage} />
                )}
                {selectedNode.domain && (
                  <Property label="Domain" value={selectedNode.domain} />
                )}
                {selectedNode.domainLane && (
                  <Property label="Lane" value={selectedNode.domainLane} />
                )}
              </PropertyGroup>

              {(selectedNode.interfacesIn !== undefined || selectedNode.connectionCount !== undefined) && (
                <PropertyGroup title="Connections">
                  {selectedNode.interfacesIn !== undefined && (
                    <Property label="Interfaces In" value={String(selectedNode.interfacesIn)} />
                  )}
                  {selectedNode.interfacesOut !== undefined && (
                    <Property label="Interfaces Out" value={String(selectedNode.interfacesOut)} />
                  )}
                  {selectedNode.systemCount !== undefined && (
                    <Property label="Systems" value={String(selectedNode.systemCount)} />
                  )}
                  {selectedNode.connectionCount !== undefined && (
                    <Property label="Connections" value={String(selectedNode.connectionCount)} />
                  )}
                </PropertyGroup>
              )}

              {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                <PropertyGroup title="Custom Properties">
                  {Object.entries(selectedNode.metadata).map(([key, value]) => (
                    <Property key={key} label={key} value={String(value)} />
                  ))}
                </PropertyGroup>
              )}
            </div>
          </div>
        )}

        {/* Edge inspector */}
        {selectedEdge && (
          <div className="p-4">
            {/* Edge header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                <Link2 className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">Connection</div>
                <div className="text-[10px] text-slate-400">
                  {selectedEdge.edgeType}
                </div>
              </div>
            </div>

            {/* Connection path */}
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/5">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">From</div>
                <div className="text-xs text-white truncate">{selectedEdge.sourceName}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <div className="flex-1 min-w-0 text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">To</div>
                <div className="text-xs text-white truncate">{selectedEdge.targetName}</div>
              </div>
            </div>

            {/* Properties */}
            <div className="space-y-3">
              <PropertyGroup title="Details">
                {selectedEdge.label && (
                  <Property label="Label" value={selectedEdge.label} />
                )}
                {selectedEdge.protocol && (
                  <Property label="Protocol" value={selectedEdge.protocol} />
                )}
                <Property label="Type" value={selectedEdge.edgeType} />
              </PropertyGroup>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function PropertyGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {title}
      </h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Property({
  label,
  value,
  isCode,
}: {
  label: string;
  value: string;
  isCode?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2 px-3 py-2 rounded-md bg-slate-800/50 border border-white/5">
      <span className="text-[11px] text-slate-500 flex-shrink-0">{label}</span>
      <span
        className={cn(
          'text-[11px] text-slate-300 text-right break-all',
          isCode && 'font-mono'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default memo(InspectorPanel);
