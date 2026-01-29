'use client';

import { useState } from 'react';
import { useHealthStatusStore, SIGNAL_SOURCE_CONFIG, getRelativeTime } from '@/modules/health-status';
import type { SignalSource } from '@/modules/health-status';

export default function SignalSourcesPage() {
  const { connectors, signals } = useHealthStatusStore();
  const [selectedSource, setSelectedSource] = useState<SignalSource | null>(null);

  // Count signals per source
  const signalCounts: Record<SignalSource, number> = {
    k8s: 0,
    vcenter: 0,
    cloud: 0,
    prometheus: 0,
    azureMonitor: 0,
    servicenow: 0,
  };
  signals.forEach((s) => {
    signalCounts[s.source]++;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Signal Sources</h1>
        <p className="text-slate-400 mt-1">
          Connectors that provide health signals to the Status Engine
        </p>
      </div>

      {/* Connector Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.keys(SIGNAL_SOURCE_CONFIG) as SignalSource[]).map((source) => {
          const config = SIGNAL_SOURCE_CONFIG[source];
          const connector = connectors.find((c) => c.source === source);
          const isConnected = connector?.connected ?? false;

          return (
            <div
              key={source}
              className={`p-5 rounded-lg border transition-all cursor-pointer ${
                selectedSource === source
                  ? 'bg-slate-800 border-blue-500'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
              onClick={() => setSelectedSource(selectedSource === source ? null : source)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: config.color + '20' }}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{config.name}</h3>
                    <p className="text-xs text-slate-500">{source}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    isConnected
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-400 mb-4">{config.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-800/50 rounded p-2">
                  <div className="text-slate-500 text-xs">Signals</div>
                  <div className="font-semibold text-lg">{signalCounts[source]}</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2">
                  <div className="text-slate-500 text-xs">Last Sync</div>
                  <div className="font-medium text-sm">
                    {connector?.lastSyncTime ? getRelativeTime(connector.lastSyncTime) : '-'}
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="mt-4">
                <div className="text-xs text-slate-500 mb-2">Available Metrics</div>
                <div className="flex flex-wrap gap-1">
                  {config.metrics.map((metric) => (
                    <span
                      key={metric}
                      className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded font-mono"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>

              {/* Configure Button */}
              <button
                className="w-full mt-4 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm text-slate-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Configure ${config.name} - Coming soon!`);
                }}
              >
                Configure
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Source Details */}
      {selectedSource && (
        <div className="bg-slate-900 rounded-lg border border-slate-800">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-medium">
              {SIGNAL_SOURCE_CONFIG[selectedSource].name} - Recent Signals
            </h2>
            <button
              onClick={() => setSelectedSource(null)}
              className="text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="divide-y divide-slate-800/50 max-h-80 overflow-y-auto">
            {signals
              .filter((s) => s.source === selectedSource)
              .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
              .slice(0, 20)
              .map((signal) => (
                <div key={signal.id} className="px-4 py-3 hover:bg-slate-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <code className="text-sm font-mono text-blue-400">{signal.metric}</code>
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-xs">
                        {typeof signal.value === 'boolean'
                          ? signal.value.toString()
                          : String(signal.value)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">{getRelativeTime(signal.ts)}</div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    System: {signal.systemId} | Confidence: {(signal.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            {signals.filter((s) => s.source === selectedSource).length === 0 && (
              <div className="px-4 py-8 text-center text-slate-500">
                No signals from this source
              </div>
            )}
          </div>
        </div>
      )}

      {/* Integration Guide */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-5">
        <h3 className="font-medium mb-3">Adding a Real Connector</h3>
        <p className="text-sm text-slate-400 mb-4">
          To integrate a real connector, implement the following interface:
        </p>
        <pre className="bg-slate-800 rounded p-4 text-xs font-mono text-slate-300 overflow-x-auto">
{`interface SignalConnector {
  source: SignalSource;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  poll(): Promise<Signal[]>;
  // Optional: subscribe to real-time updates
  subscribe?(callback: (signals: Signal[]) => void): void;
}`}
        </pre>
        <p className="text-sm text-slate-500 mt-4">
          Signals should be pushed to the store via <code className="bg-slate-800 px-1 rounded">useHealthStatusStore().addSignal()</code>
        </p>
      </div>
    </div>
  );
}
