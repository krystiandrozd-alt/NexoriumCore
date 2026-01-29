'use client';

// Nexorium Core - Edge Edit Panel
// Enhanced panel for editing connection properties

import { memo, useState, useCallback, useEffect } from 'react';
import {
  X,
  Trash2,
  ArrowRight,
  ArrowLeftRight,
  Zap,
  Database,
  Link2,
  MessageSquare,
  Settings2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useManualDesign } from '@/contexts/ManualDesignContext';
import type { ManualEdgeType } from '@/types/flow-map-manual';
import { edgeTypeStyles } from '@/types/flow-map-manual';

// Enhanced edge type definitions with icons
const edgeTypeOptions: {
  value: ManualEdgeType;
  label: string;
  description: string;
  icon: typeof Zap;
  color: string;
}[] = [
  {
    value: 'API',
    label: 'API',
    description: 'REST/HTTP API call',
    icon: Zap,
    color: edgeTypeStyles.API.color,
  },
  {
    value: 'EVENT',
    label: 'Event',
    description: 'Async event/message',
    icon: MessageSquare,
    color: edgeTypeStyles.EVENT.color,
  },
  {
    value: 'DB',
    label: 'Database',
    description: 'Database connection',
    icon: Database,
    color: edgeTypeStyles.DB.color,
  },
  {
    value: 'FILE',
    label: 'File',
    description: 'File transfer',
    icon: Settings2,
    color: edgeTypeStyles.FILE.color,
  },
  {
    value: 'MANUAL',
    label: 'Custom',
    description: 'Custom connection',
    icon: Link2,
    color: edgeTypeStyles.MANUAL.color,
  },
];

// Common protocols
const protocolOptions = [
  'REST',
  'GraphQL',
  'gRPC',
  'SOAP',
  'WebSocket',
  'Kafka',
  'RabbitMQ',
  'SFTP',
  'JDBC',
  'Other',
];

function EdgeEditPanel() {
  const { state, updateEdge, deleteEdge, selectEdge } = useManualDesign();
  const selectedEdge = state.edges.find((e) => e.id === state.selectedEdgeId);

  const [edgeType, setEdgeType] = useState<ManualEdgeType>('MANUAL');
  const [label, setLabel] = useState('');
  const [protocol, setProtocol] = useState('');
  const [isBidirectional, setIsBidirectional] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showProtocols, setShowProtocols] = useState(false);

  // Sync local state with selected edge
  useEffect(() => {
    if (selectedEdge) {
      setEdgeType(selectedEdge.edgeType);
      setLabel(selectedEdge.label || '');
      setProtocol(''); // Would need to be stored in edge data
      setIsBidirectional(false); // Would need to be stored in edge data
      setIsDirty(false);
    }
  }, [selectedEdge]);

  const handleSave = useCallback(async () => {
    if (!selectedEdge) return;
    await updateEdge(selectedEdge.id, {
      edgeType,
      label: label || undefined,
    });
    setIsDirty(false);
  }, [selectedEdge, edgeType, label, updateEdge]);

  const handleDelete = useCallback(async () => {
    if (!selectedEdge) return;
    if (window.confirm('Delete this connection?')) {
      await deleteEdge(selectedEdge.id);
    }
  }, [selectedEdge, deleteEdge]);

  const handleClose = useCallback(() => {
    selectEdge(null);
  }, [selectEdge]);

  const handleTypeChange = useCallback((type: ManualEdgeType) => {
    setEdgeType(type);
    setIsDirty(true);
  }, []);

  if (!selectedEdge) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Link2 className="h-10 w-10 text-slate-600 mb-3" />
        <p className="text-sm text-slate-400 mb-1">No connection selected</p>
        <p className="text-xs text-slate-600">
          Click on any connection line to edit it
        </p>
      </div>
    );
  }

  const sourceNode = state.nodes.find((n) => n.id === selectedEdge.sourceNodeId);
  const targetNode = state.nodes.find((n) => n.id === selectedEdge.targetNodeId);
  const currentTypeOption = edgeTypeOptions.find((t) => t.value === edgeType);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${currentTypeOption?.color}20` }}
          >
            {currentTypeOption && (
              <currentTypeOption.icon
                className="h-4 w-4"
                style={{ color: currentTypeOption.color }}
              />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Edit Connection</h3>
            <p className="text-[10px] text-slate-500">{currentTypeOption?.description}</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Connection visualization */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-500 mb-0.5">From</div>
            <div className="text-sm text-white font-medium truncate">
              {sourceNode?.name || 'Unknown'}
            </div>
          </div>
          <div className="flex-shrink-0 px-2">
            {isBidirectional ? (
              <ArrowLeftRight
                className="h-5 w-5"
                style={{ color: currentTypeOption?.color }}
              />
            ) : (
              <ArrowRight
                className="h-5 w-5"
                style={{ color: currentTypeOption?.color }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0 text-right">
            <div className="text-xs text-slate-500 mb-0.5">To</div>
            <div className="text-sm text-white font-medium truncate">
              {targetNode?.name || 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* Connection Type */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          Connection Type
        </label>
        <div className="grid grid-cols-1 gap-1">
          {edgeTypeOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => handleTypeChange(t.value)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-left',
                'transition-all duration-150',
                edgeType === t.value
                  ? 'bg-white/10 border border-white/20'
                  : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
              )}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor:
                    edgeType === t.value ? `${t.color}30` : 'rgba(255,255,255,0.05)',
                }}
              >
                <t.icon
                  className="h-4 w-4"
                  style={{ color: edgeType === t.value ? t.color : '#64748b' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    'text-sm font-medium',
                    edgeType === t.value ? 'text-white' : 'text-slate-400'
                  )}
                >
                  {t.label}
                </div>
                <div className="text-[10px] text-slate-600 truncate">{t.description}</div>
              </div>
              {edgeType === t.value && (
                <Check className="h-4 w-4 text-violet-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Label */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          Label (optional)
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
            setIsDirty(true);
          }}
          className={cn(
            'w-full px-3 py-2.5 rounded-lg',
            'bg-white/5 border border-white/10',
            'text-sm text-white placeholder:text-slate-600',
            'focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50',
            'transition-all'
          )}
          placeholder="e.g., /api/orders, GetCustomer..."
        />
      </div>

      {/* Protocol quick select */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          Protocol
        </label>
        <div className="flex flex-wrap gap-1">
          {protocolOptions.slice(0, showProtocols ? undefined : 5).map((p) => (
            <button
              key={p}
              onClick={() => {
                setProtocol(p);
                setLabel(p);
                setIsDirty(true);
              }}
              className={cn(
                'px-2 py-1 rounded text-xs transition-all',
                protocol === p
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white'
              )}
            >
              {p}
            </button>
          ))}
          {!showProtocols && protocolOptions.length > 5 && (
            <button
              onClick={() => setShowProtocols(true)}
              className="px-2 py-1 rounded text-xs bg-white/5 text-slate-500 hover:text-white transition-colors"
            >
              +{protocolOptions.length - 5} more
            </button>
          )}
        </div>
      </div>

      {/* Direction toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
        <div>
          <div className="text-sm text-white">Bidirectional</div>
          <div className="text-[10px] text-slate-500">Data flows both ways</div>
        </div>
        <button
          onClick={() => {
            setIsBidirectional(!isBidirectional);
            setIsDirty(true);
          }}
          className={cn(
            'w-10 h-6 rounded-full transition-all duration-200',
            isBidirectional ? 'bg-violet-500' : 'bg-slate-700'
          )}
        >
          <div
            className={cn(
              'w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
              isBidirectional ? 'translate-x-5' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-white/5">
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium',
            'transition-all',
            isDirty
              ? 'bg-violet-500 text-white hover:bg-violet-600 shadow-lg shadow-violet-500/20'
              : 'bg-white/5 text-slate-500 cursor-not-allowed'
          )}
        >
          <Check className="h-4 w-4" />
          Save Changes
        </button>
        <button
          onClick={handleDelete}
          className={cn(
            'px-4 py-2.5 rounded-lg text-sm font-medium',
            'bg-rose-500/10 text-rose-400 border border-rose-500/20',
            'hover:bg-rose-500/20 hover:border-rose-500/30 transition-all'
          )}
          title="Delete connection"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default memo(EdgeEditPanel);
