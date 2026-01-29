'use client';

import { useState } from 'react';
import { useHealthStatusStore, STATUS_CONFIG, formatTimestamp } from '@/modules/health-status';
import type { SystemIdentityMapping } from '@/modules/health-status';

export default function SystemMappingPage() {
  const { mappings, decisions, updateMapping } = useHealthStatusStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<SystemIdentityMapping>>({});

  const startEdit = (mapping: SystemIdentityMapping) => {
    setEditingId(mapping.systemId);
    setEditValues({ ...mapping });
  };

  const saveEdit = () => {
    if (editingId && editValues) {
      updateMapping(editingId, editValues);
      setEditingId(null);
      setEditValues({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">System Identity Mapping</h1>
        <p className="text-slate-400 mt-1">
          Map Nexorium systems to external identifiers (CMDB CI, K8s labels, VM names, etc.)
        </p>
      </div>

      {/* Mapping Table */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="px-4 py-3 text-left font-medium text-slate-400">System</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">CMDB CI ID</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">K8s Namespace</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">K8s App Label</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">vCenter VMs</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Cloud Resources</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((mapping) => {
                const decision = decisions.find((d) => d.systemId === mapping.systemId);
                const statusConfig = decision ? STATUS_CONFIG[decision.status] : STATUS_CONFIG.Unknown;
                const isEditing = editingId === mapping.systemId;

                if (isEditing) {
                  return (
                    <tr key={mapping.systemId} className="border-b border-slate-800/50 bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div className="font-medium">{mapping.systemName}</div>
                        <div className="text-xs text-slate-500">{mapping.systemId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                        >
                          {statusConfig.icon} {decision?.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editValues.cmdbCiId || ''}
                          onChange={(e) => setEditValues({ ...editValues, cmdbCiId: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
                          placeholder="CI00012345"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editValues.k8sNamespace || ''}
                          onChange={(e) => setEditValues({ ...editValues, k8sNamespace: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
                          placeholder="namespace"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editValues.k8sAppLabel || ''}
                          onChange={(e) => setEditValues({ ...editValues, k8sAppLabel: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
                          placeholder="app-label"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editValues.vcenterVmNames?.join(', ') || ''}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              vcenterVmNames: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
                          placeholder="vm-1, vm-2"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editValues.cloudResourceIds?.join(', ') || ''}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              cloudResourceIds: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
                          placeholder="arn:..., /subscriptions/..."
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-1">
                          <button
                            onClick={saveEdit}
                            className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs text-white"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={mapping.systemId} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{mapping.systemName}</div>
                      <div className="text-xs text-slate-500">{mapping.systemId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded text-xs"
                        style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                      >
                        {statusConfig.icon} {decision?.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                        {mapping.cmdbCiId || '-'}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                        {mapping.k8sNamespace || '-'}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                        {mapping.k8sAppLabel || '-'}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      {mapping.vcenterVmNames?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {mapping.vcenterVmNames.slice(0, 2).map((vm) => (
                            <code key={vm} className="text-xs bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                              {vm}
                            </code>
                          ))}
                          {mapping.vcenterVmNames.length > 2 && (
                            <span className="text-xs text-slate-500">+{mapping.vcenterVmNames.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {mapping.cloudResourceIds?.length ? (
                        <span className="text-xs text-slate-400">
                          {mapping.cloudResourceIds.length} resource(s)
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => startEdit(mapping)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <h3 className="font-medium mb-2">Why Map Identities?</h3>
          <p className="text-sm text-slate-400">
            External systems (K8s, vCenter, ServiceNow) use different identifiers.
            Mapping allows the Status Engine to correlate signals from multiple sources
            to the same Nexorium system.
          </p>
        </div>
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <h3 className="font-medium mb-2">Auto-Discovery (Coming Soon)</h3>
          <p className="text-sm text-slate-400">
            In future versions, connectors will auto-discover mappings based on
            naming conventions, tags, and CMDB relationships.
          </p>
        </div>
      </div>
    </div>
  );
}
