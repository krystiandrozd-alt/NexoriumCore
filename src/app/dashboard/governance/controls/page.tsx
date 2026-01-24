'use client';

// TelEnvIQ - Policy Controls Page
// Manage policy controls library

import { useEffect, useState } from 'react';
import {
  Shield,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Settings,
} from 'lucide-react';
import type { PolicyControl, PolicyControlCategory } from '@/types';

const categoryLabels: Record<PolicyControlCategory, string> = {
  DATA_GOVERNANCE: 'Data Governance',
  VERSION_COMPLIANCE: 'Version Compliance',
  TOPOLOGY_RULES: 'Topology Rules',
  SECURITY: 'Security',
  CHANGE_MANAGEMENT: 'Change Management',
  OWNERSHIP: 'Ownership',
  FRESHNESS: 'Freshness',
  CUSTOM: 'Custom',
};

const severityColors = {
  INFO: 'bg-blue-100 text-blue-700',
  WARNING: 'bg-yellow-100 text-yellow-700',
  ERROR: 'bg-orange-100 text-orange-700',
  BLOCKER: 'bg-red-100 text-red-700',
};

export default function ControlsPage() {
  const [controls, setControls] = useState<PolicyControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<PolicyControlCategory | ''>('');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchControls();
  }, [showInactive]);

  async function fetchControls() {
    try {
      const params = new URLSearchParams();
      if (!showInactive) {
        params.set('isActive', 'true');
      }
      const response = await fetch(`/api/governance/controls?${params}`);
      if (!response.ok) throw new Error('Failed to fetch controls');
      const result = await response.json();
      setControls(result.data || []);
    } catch (error) {
      console.error('Error fetching controls:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredControls = controls.filter((control) => {
    const matchesSearch =
      control.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || control.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Group controls by category
  const groupedControls = filteredControls.reduce(
    (acc, control) => {
      const category = control.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(control);
      return acc;
    },
    {} as Record<PolicyControlCategory, PolicyControl[]>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Policy Controls</h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure governance rules and compliance checks
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Control
        </button>
      </div>

      {/* Filters */}
      <div className="card-enterprise p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search controls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as PolicyControlCategory | '')}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Show Inactive Toggle */}
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            {showInactive ? (
              <ToggleRight className="h-5 w-5 text-indigo-600" />
            ) : (
              <ToggleLeft className="h-5 w-5" />
            )}
            Show Inactive
          </button>
        </div>
      </div>

      {/* Controls List */}
      {Object.keys(groupedControls).length === 0 ? (
        <div className="text-center py-12 card-enterprise">
          <Shield className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No controls found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchQuery || filterCategory
              ? 'Try adjusting your filters'
              : 'Get started by adding your first policy control'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedControls).map(([category, categoryControls]) => (
            <div key={category} className="card-enterprise overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">
                  {categoryLabels[category as PolicyControlCategory]}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {categoryControls.length} control{categoryControls.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {categoryControls.map((control) => (
                  <div
                    key={control.id}
                    className={`px-6 py-4 hover:bg-slate-50 transition-colors ${
                      !control.isActive ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-slate-900">{control.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              severityColors[control.severity]
                            }`}
                          >
                            {control.severity}
                          </span>
                          {!control.isActive && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                              Inactive
                            </span>
                          )}
                        </div>
                        {control.description && (
                          <p className="mt-1 text-sm text-slate-600">{control.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                          <span>Evaluator: {control.evaluatorType}</span>
                          <span>Scope: {control.scope}</span>
                        </div>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-slate-600">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
