'use client';

// Nexorium Core - Node Edit Panel
// Edit properties for selected manual node

import { memo, useState, useCallback, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useManualDesign } from '@/contexts/ManualDesignContext';
import type { ManualNodeType, ManualNodeScope } from '@/types/flow-map-manual';
import type { FlowMapDomain } from '@/types/flow-map-v2';
import { paletteItems, nodeTypeStyles } from '@/types/flow-map-manual';

const nodeTypes: { value: ManualNodeType; label: string }[] = paletteItems.map((item) => ({
  value: item.type,
  label: item.label,
}));

const domains: { value: FlowMapDomain | ''; label: string }[] = [
  { value: '', label: 'None' },
  { value: 'BSS', label: 'BSS' },
  { value: 'OSS', label: 'OSS' },
  { value: 'NETWORK', label: 'Network' },
  { value: 'EXTERNAL', label: 'External' },
];

const scopes: { value: ManualNodeScope; label: string }[] = [
  { value: 'GLOBAL', label: 'Global (All Stages)' },
  { value: 'DEV', label: 'DEV Only' },
  { value: 'SIT', label: 'SIT Only' },
  { value: 'UAT', label: 'UAT Only' },
  { value: 'NFT', label: 'NFT Only' },
  { value: 'PREPROD', label: 'PREPROD Only' },
];

function NodeEditPanel() {
  const { state, updateNode, deleteNode, selectNode } = useManualDesign();
  const selectedNode = state.nodes.find((n) => n.id === state.selectedNodeId);

  const [name, setName] = useState('');
  const [nodeType, setNodeType] = useState<ManualNodeType>('SERVER');
  const [domain, setDomain] = useState<FlowMapDomain | ''>('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<ManualNodeScope>('GLOBAL');
  const [isDirty, setIsDirty] = useState(false);

  // Sync local state with selected node
  useEffect(() => {
    if (selectedNode) {
      setName(selectedNode.name);
      setNodeType(selectedNode.nodeType);
      setDomain(selectedNode.domain || '');
      setDescription(selectedNode.description || '');
      setScope(selectedNode.scope);
      setIsDirty(false);
    }
  }, [selectedNode]);

  const handleSave = useCallback(async () => {
    if (!selectedNode) return;
    await updateNode(selectedNode.id, {
      name,
      nodeType,
      domain: domain || undefined,
      description: description || undefined,
      scope,
    });
    setIsDirty(false);
  }, [selectedNode, name, nodeType, domain, description, scope, updateNode]);

  const handleDelete = useCallback(async () => {
    if (!selectedNode) return;
    if (window.confirm(`Delete "${selectedNode.name}"?`)) {
      await deleteNode(selectedNode.id);
    }
  }, [selectedNode, deleteNode]);

  const handleClose = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  if (!selectedNode) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        Select a node to edit its properties
      </div>
    );
  }

  const styles = nodeTypeStyles[selectedNode.nodeType];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: styles.borderColor }}
          />
          <span className="text-sm font-medium text-white">Edit Node</span>
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Form */}
      <div className="space-y-3">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsDirty(true);
            }}
            className={cn(
              'w-full px-3 py-2 rounded-lg',
              'bg-white/5 border border-white/10',
              'text-sm text-white placeholder:text-slate-500',
              'focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50',
              'transition-all'
            )}
            placeholder="Node name..."
          />
        </div>

        {/* Type */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
            Type
          </label>
          <select
            value={nodeType}
            onChange={(e) => {
              setNodeType(e.target.value as ManualNodeType);
              setIsDirty(true);
            }}
            className={cn(
              'w-full px-3 py-2 rounded-lg',
              'bg-white/5 border border-white/10',
              'text-sm text-white',
              'focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50',
              'transition-all'
            )}
          >
            {nodeTypes.map((t) => (
              <option key={t.value} value={t.value} className="bg-slate-800">
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Domain */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
            Domain
          </label>
          <select
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value as FlowMapDomain | '');
              setIsDirty(true);
            }}
            className={cn(
              'w-full px-3 py-2 rounded-lg',
              'bg-white/5 border border-white/10',
              'text-sm text-white',
              'focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50',
              'transition-all'
            )}
          >
            {domains.map((d) => (
              <option key={d.value || 'none'} value={d.value} className="bg-slate-800">
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Scope */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
            Scope
          </label>
          <select
            value={scope}
            onChange={(e) => {
              setScope(e.target.value as ManualNodeScope);
              setIsDirty(true);
            }}
            className={cn(
              'w-full px-3 py-2 rounded-lg',
              'bg-white/5 border border-white/10',
              'text-sm text-white',
              'focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50',
              'transition-all'
            )}
          >
            {scopes.map((s) => (
              <option key={s.value} value={s.value} className="bg-slate-800">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setIsDirty(true);
            }}
            className={cn(
              'w-full px-3 py-2 rounded-lg resize-none',
              'bg-white/5 border border-white/10',
              'text-sm text-white placeholder:text-slate-500',
              'focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50',
              'transition-all'
            )}
            placeholder="Optional description..."
            rows={3}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg text-sm font-medium',
            'transition-all',
            isDirty
              ? 'bg-violet-500 text-white hover:bg-violet-600'
              : 'bg-white/5 text-slate-500 cursor-not-allowed'
          )}
        >
          Save Changes
        </button>
        <button
          onClick={handleDelete}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium',
            'bg-rose-500/10 text-rose-400 border border-rose-500/30',
            'hover:bg-rose-500/20 transition-all'
          )}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default memo(NodeEditPanel);
