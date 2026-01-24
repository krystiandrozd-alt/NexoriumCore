'use client';

// TelEnvIQ - Entry Point Selector
// Select or override entry/exit points for an environment

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRightFromLine, ArrowLeftToLine, Sparkles } from 'lucide-react';
import type { GraphAnalysisResult } from '@/types';

interface ComponentInstanceOption {
  id: string;
  displayName: string;
  componentName: string;
}

interface EntryPointSelectorProps {
  environmentId: string;
  componentInstances: ComponentInstanceOption[];
  analysis: GraphAnalysisResult | null;
  currentEntryOverride: string | null;
  currentExitOverride: string | null;
  onUpdate: () => void;
}

export default function EntryPointSelector({
  environmentId,
  componentInstances,
  analysis,
  currentEntryOverride,
  currentExitOverride,
  onUpdate,
}: EntryPointSelectorProps) {
  const [entryId, setEntryId] = useState<string | null>(currentEntryOverride);
  const [exitId, setExitId] = useState<string | null>(currentExitOverride);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEntryId(currentEntryOverride);
    setExitId(currentExitOverride);
  }, [currentEntryOverride, currentExitOverride]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/environments/${environmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryComponentInstanceId: entryId,
          exitComponentInstanceId: exitId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update entry points');
      }

      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    entryId !== currentEntryOverride || exitId !== currentExitOverride;

  const getInstanceLabel = (id: string) => {
    const instance = componentInstances.find((ci) => ci.id === id);
    return instance
      ? `${instance.displayName || instance.componentName}`
      : 'Unknown';
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-slate-800">Entry & Exit Points</h3>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
          Save
        </Button>
      </div>

      {/* Entry point selector */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1.5">
          <ArrowRightFromLine className="h-4 w-4 text-emerald-600" />
          Entry Point
        </label>
        <select
          value={entryId || ''}
          onChange={(e) => setEntryId(e.target.value || null)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">
            Auto-detect ({analysis?.entryCandidates.length || 0} candidates)
          </option>
          {componentInstances.map((ci) => (
            <option key={ci.id} value={ci.id}>
              {ci.displayName || ci.componentName}
              {analysis?.entryCandidates.includes(ci.id) && ' (candidate)'}
            </option>
          ))}
        </select>
        {!entryId && analysis && analysis.entryCandidates.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="text-xs text-slate-500">Auto-detected:</span>
            {analysis.entryCandidates.slice(0, 3).map((id) => (
              <span
                key={id}
                className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded"
              >
                {getInstanceLabel(id)}
              </span>
            ))}
            {analysis.entryCandidates.length > 3 && (
              <span className="text-xs text-slate-400">
                +{analysis.entryCandidates.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Exit point selector */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1.5">
          <ArrowLeftToLine className="h-4 w-4 text-rose-600" />
          Exit Point
        </label>
        <select
          value={exitId || ''}
          onChange={(e) => setExitId(e.target.value || null)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">
            Auto-detect ({analysis?.exitCandidates.length || 0} candidates)
          </option>
          {componentInstances.map((ci) => (
            <option key={ci.id} value={ci.id}>
              {ci.displayName || ci.componentName}
              {analysis?.exitCandidates.includes(ci.id) && ' (candidate)'}
            </option>
          ))}
        </select>
        {!exitId && analysis && analysis.exitCandidates.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="text-xs text-slate-500">Auto-detected:</span>
            {analysis.exitCandidates.slice(0, 3).map((id) => (
              <span
                key={id}
                className="text-xs px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded"
              >
                {getInstanceLabel(id)}
              </span>
            ))}
            {analysis.exitCandidates.length > 3 && (
              <span className="text-xs text-slate-400">
                +{analysis.exitCandidates.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info about auto-detection */}
      <div className="flex items-start gap-2 p-2 rounded bg-slate-50 text-xs text-slate-600">
        <Sparkles className="h-3.5 w-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
        <span>
          Entry points are nodes with no incoming connections.
          Exit points have no outgoing connections.
          Override to specify a specific node.
        </span>
      </div>

      {error && (
        <div className="p-2 rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
