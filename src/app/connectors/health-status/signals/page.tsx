'use client';

import { useState, useMemo } from 'react';
import {
  useHealthStatusStore,
  STATUS_CONFIG,
  SIGNAL_SOURCE_CONFIG,
  getRelativeTime,
  formatTimestamp,
} from '@/modules/health-status';
import type { SignalSource } from '@/modules/health-status';

export default function LiveSignalsPage() {
  const { signals, mappings, decisions, getSignalsForSystem } = useHealthStatusStore();

  // Filters
  const [filterSystem, setFilterSystem] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('');
  const [filterMetric, setFilterMetric] = useState<string>('');
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

  // Get unique values for filters
  const uniqueSources = useMemo(() => {
    const sources = new Set(signals.map((s) => s.source));
    return Array.from(sources);
  }, [signals]);

  const uniqueMetrics = useMemo(() => {
    const metrics = new Set(signals.map((s) => s.metric));
    return Array.from(metrics).sort();
  }, [signals]);

  // Filter signals
  const filteredSignals = useMemo(() => {
    return signals
      .filter((s) => {
        if (filterSystem && !s.systemId.includes(filterSystem)) return false;
        if (filterSource && s.source !== filterSource) return false;
        if (filterMetric && s.metric !== filterMetric) return false;
        return true;
      })
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }, [signals, filterSystem, filterSource, filterMetric]);

  // Get decision for selected system
  const selectedDecision = selectedSystemId
    ? decisions.find((d) => d.systemId === selectedSystemId)
    : null;
  const selectedMapping = selectedSystemId
    ? mappings.find((m) => m.systemId === selectedSystemId)
    : null;
  const selectedSignals = selectedSystemId ? getSignalsForSystem(selectedSystemId) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Live Signals</h1>
        <p className="text-slate-400 mt-1">
          Real-time view of all health signals for debugging and monitoring
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <div className="text-2xl font-bold">{signals.length}</div>
          <div className="text-sm text-slate-400">Total Signals</div>
        </div>
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <div className="text-2xl font-bold">{uniqueSources.length}</div>
          <div className="text-sm text-slate-400">Active Sources</div>
        </div>
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <div className="text-2xl font-bold">{uniqueMetrics.length}</div>
          <div className="text-sm text-slate-400">Metric Types</div>
        </div>
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <div className="text-2xl font-bold">{mappings.length}</div>
          <div className="text-sm text-slate-400">Mapped Systems</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">System:</span>
            <input
              type="text"
              value={filterSystem}
              onChange={(e) => setFilterSystem(e.target.value)}
              placeholder="Filter by system ID..."
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm w-48"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Source:</span>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm"
            >
              <option value="">All Sources</option>
              {(Object.keys(SIGNAL_SOURCE_CONFIG) as SignalSource[]).map((source) => (
                <option key={source} value={source}>
                  {SIGNAL_SOURCE_CONFIG[source].name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Metric:</span>
            <select
              value={filterMetric}
              onChange={(e) => setFilterMetric(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm"
            >
              <option value="">All Metrics</option>
              {uniqueMetrics.map((metric) => (
                <option key={metric} value={metric}>
                  {metric}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setFilterSystem('');
              setFilterSource('');
              setFilterMetric('');
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm text-slate-400"
          >
            Clear Filters
          </button>
          <div className="ml-auto text-sm text-slate-500">
            Showing {filteredSignals.length} of {signals.length} signals
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Signals Table */}
        <div className="flex-1 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-900">
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">System</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Source</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Metric</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Value</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {filteredSignals.map((signal) => {
                  const sourceConfig = SIGNAL_SOURCE_CONFIG[signal.source];
                  const mapping = mappings.find((m) => m.systemId === signal.systemId);
                  const isSelected = selectedSystemId === signal.systemId;

                  return (
                    <tr
                      key={signal.id}
                      className={`border-b border-slate-800/50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-900/20' : 'hover:bg-slate-800/30'
                      }`}
                      onClick={() => setSelectedSystemId(signal.systemId)}
                    >
                      <td className="px-4 py-2">
                        <div className="text-xs">{getRelativeTime(signal.ts)}</div>
                        <div className="text-xs text-slate-500">{formatTimestamp(signal.ts)}</div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="font-medium">{mapping?.systemName || signal.systemId}</div>
                        <div className="text-xs text-slate-500">{signal.systemId}</div>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: sourceConfig.color + '20', color: sourceConfig.color }}
                        >
                          {sourceConfig.icon} {sourceConfig.name}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded font-mono text-blue-400">
                          {signal.metric}
                        </code>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-mono ${
                            signal.value === true || signal.value === 1 || signal.value === 'running' || signal.value === 'poweredOn'
                              ? 'bg-green-900/30 text-green-400'
                              : signal.value === false || signal.value === 0 || signal.value === 'stopped' || signal.value === 'poweredOff'
                              ? 'bg-red-900/30 text-red-400'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {typeof signal.value === 'boolean' ? signal.value.toString() : String(signal.value)}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${signal.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {(signal.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredSignals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No signals match the current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Detail Panel */}
        {selectedSystemId && selectedDecision && (
          <div className="w-80 bg-slate-900 rounded-lg border border-slate-800 p-4 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">System Status</h3>
              <button
                onClick={() => setSelectedSystemId(null)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* System Info */}
            <div className="mb-4">
              <div className="font-medium">{selectedMapping?.systemName || selectedSystemId}</div>
              <div className="text-xs text-slate-500">{selectedSystemId}</div>
            </div>

            {/* Status */}
            <div className="mb-4">
              <div className="text-xs text-slate-500 mb-1">Computed Status</div>
              <div
                className="px-3 py-2 rounded flex items-center gap-2"
                style={{
                  backgroundColor: STATUS_CONFIG[selectedDecision.status].bgColor,
                  borderColor: STATUS_CONFIG[selectedDecision.status].color + '40',
                  borderWidth: 1,
                }}
              >
                <span className="text-xl">{STATUS_CONFIG[selectedDecision.status].icon}</span>
                <span className="font-medium" style={{ color: STATUS_CONFIG[selectedDecision.status].color }}>
                  {selectedDecision.status}
                </span>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <div className="text-xs text-slate-500 mb-1">Reason</div>
              <div className="text-sm text-slate-300">{selectedDecision.reason}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedDecision.reasonCodes.map((code) => (
                  <span key={code} className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-xs rounded font-mono">
                    {code}
                  </span>
                ))}
              </div>
            </div>

            {/* Contributing Signals */}
            <div>
              <div className="text-xs text-slate-500 mb-2">
                Contributing Signals ({selectedSignals.length})
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedSignals
                  .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
                  .map((signal) => {
                    const sourceConfig = SIGNAL_SOURCE_CONFIG[signal.source];
                    const isContributing = selectedDecision.contributingSignals.includes(signal.id);
                    return (
                      <div
                        key={signal.id}
                        className={`p-2 rounded text-xs ${
                          isContributing ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span style={{ color: sourceConfig.color }}>{sourceConfig.icon}</span>
                          <code className="text-blue-400">{signal.metric}</code>
                          {isContributing && (
                            <span className="ml-auto text-blue-400 text-[10px]">USED</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">
                            {typeof signal.value === 'boolean' ? signal.value.toString() : String(signal.value)}
                          </span>
                          <span className="text-slate-500">{getRelativeTime(signal.ts)}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
