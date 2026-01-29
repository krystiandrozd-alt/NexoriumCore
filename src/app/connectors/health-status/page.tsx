'use client';

import { useHealthStatusStore, STATUS_CONFIG, getStatusSummary } from '@/modules/health-status';

export default function StatusEnginePage() {
  const { decisions, rules, mappings } = useHealthStatusStore();
  const summary = getStatusSummary(decisions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Status Engine</h1>
        <p className="text-slate-400 mt-1">
          Deterministic rules that derive system status from connector signals
        </p>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        {(['Active', 'Degraded', 'Down', 'Maintenance', 'Unknown'] as const).map((status) => {
          const config = STATUS_CONFIG[status];
          return (
            <div
              key={status}
              className="p-4 rounded-lg border"
              style={{ backgroundColor: config.bgColor, borderColor: config.color + '40' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{config.icon}</span>
                <span className="text-3xl font-bold" style={{ color: config.color }}>
                  {summary[status]}
                </span>
              </div>
              <div className="text-sm font-medium" style={{ color: config.color }}>
                {status}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {((summary[status] / Math.max(mappings.length, 1)) * 100).toFixed(0)}% of systems
              </div>
            </div>
          );
        })}
      </div>

      {/* Explainability Note */}
      <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h3 className="font-medium text-blue-400">Explainability</h3>
            <p className="text-sm text-slate-400 mt-1">
              Every status decision includes a human-readable reason and contributing signals.
              This ensures auditability and helps with troubleshooting.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-slate-900 rounded-lg border border-slate-800">
        <div className="px-4 py-3 border-b border-slate-800">
          <h2 className="font-medium">Status Rules</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rules are evaluated in priority order (lower = higher priority)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="px-4 py-3 text-left font-medium">Priority</th>
                <th className="px-4 py-3 text-left font-medium">Rule Name</th>
                <th className="px-4 py-3 text-left font-medium">Condition</th>
                <th className="px-4 py-3 text-left font-medium">Result</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const resultConfig = STATUS_CONFIG[rule.resultStatus];
                return (
                  <tr key={rule.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded text-xs font-mono">
                        {rule.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{rule.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-slate-800 px-2 py-1 rounded font-mono text-slate-400">
                        {rule.condition}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: resultConfig.bgColor, color: resultConfig.color }}
                      >
                        {resultConfig.icon} {rule.resultStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          rule.enabled
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current System Statuses */}
      <div className="bg-slate-900 rounded-lg border border-slate-800">
        <div className="px-4 py-3 border-b border-slate-800">
          <h2 className="font-medium">Current System Statuses</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Computed from the latest signals using the rules above
          </p>
        </div>
        <div className="divide-y divide-slate-800/50">
          {decisions.map((decision) => {
            const config = STATUS_CONFIG[decision.status];
            const mapping = mappings.find((m) => m.systemId === decision.systemId);
            return (
              <div key={decision.systemId} className="px-4 py-3 hover:bg-slate-800/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 flex items-center justify-center rounded"
                      style={{ backgroundColor: config.bgColor }}
                    >
                      <span style={{ color: config.color }}>{config.icon}</span>
                    </span>
                    <div>
                      <div className="font-medium">{mapping?.systemName || decision.systemId}</div>
                      <div className="text-xs text-slate-500">{decision.systemId}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ backgroundColor: config.bgColor, color: config.color }}
                    >
                      {decision.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2 ml-11">
                  <div className="text-sm text-slate-400">{decision.reason}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {decision.reasonCodes.map((code) => (
                      <span key={code} className="px-1.5 py-0.5 bg-slate-800 text-slate-500 text-xs rounded font-mono">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {decisions.length === 0 && (
            <div className="px-4 py-8 text-center text-slate-500">
              No status decisions computed. Load demo data or configure system mappings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
