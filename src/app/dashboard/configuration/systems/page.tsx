'use client';

// Nexorium Core - Systems Management Page
// Manage component definitions in the system catalog

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Layers,
  Server,
  AlertCircle,
  X,
  ChevronDown,
  User,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

interface PersonSummary {
  id: string;
  displayName: string;
  email: string;
}

interface Person {
  id: string;
  displayName: string;
  email: string;
  role?: string;
  department?: string;
  team?: string;
  status: string;
}

interface System {
  id: string;
  name: string;
  category: string | null;
  vendor: string | null;
  description: string | null;
  layer: string;
  capabilityType: string;
  instanceCount: number;
  itOwnerId: string | null;
  productOwnerId: string | null;
  devOpsLeadId: string | null;
  itOwner: PersonSummary | null;
  productOwner: PersonSummary | null;
  devOpsLead: PersonSummary | null;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  category: string;
  vendor: string;
  description: string;
  layer: string;
  capabilityType: string;
  itOwnerId: string;
  productOwnerId: string;
  devOpsLeadId: string;
}

// ============================================
// CONSTANTS
// ============================================

const layers = ['BSS', 'OSS', 'INFRA', 'EXTERNAL', 'UNKNOWN'];
const categories = ['BSS', 'OSS', 'INFRA', 'DATABASE', 'MESSAGING', 'INTEGRATION', 'SECURITY', 'MONITORING', 'OTHER'];
const capabilityTypes = ['CPQ', 'CRM', 'BILLING', 'SOM', 'INVENTORY', 'ORCHESTRATOR', 'DB', 'MQ', 'API_GW', 'IDENTITY', 'ITSM', 'OTHER', 'UNKNOWN'];

const layerColors: Record<string, string> = {
  BSS: '#8b5cf6',
  OSS: '#06b6d4',
  INFRA: '#14b8a6',
  EXTERNAL: '#f59e0b',
  UNKNOWN: '#64748b',
};

const emptyFormData: FormData = {
  name: '',
  category: '',
  vendor: '',
  description: '',
  layer: 'UNKNOWN',
  capabilityType: 'UNKNOWN',
  itOwnerId: '',
  productOwnerId: '',
  devOpsLeadId: '',
};

// ============================================
// FETCHER
// ============================================

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ============================================
// MAIN COMPONENT
// ============================================

export default function SystemsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSystem, setEditingSystem] = useState<System | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch systems
  const { data: systems, mutate, isLoading } = useSWR<System[]>(
    `/api/configuration/systems${searchQuery ? `?search=${searchQuery}` : ''}${selectedLayer ? `${searchQuery ? '&' : '?'}layer=${selectedLayer}` : ''}`,
    fetcher
  );

  // Fetch people for ownership dropdowns
  const { data: peopleResponse } = useSWR<{ success: boolean; data: Person[] }>(
    '/api/organisation/people?status=ACTIVE',
    fetcher
  );
  const people = peopleResponse?.data || [];

  // Open create modal
  const handleCreate = useCallback(() => {
    setEditingSystem(null);
    setFormData(emptyFormData);
    setError(null);
    setShowModal(true);
  }, []);

  // Open edit modal
  const handleEdit = useCallback((system: System) => {
    setEditingSystem(system);
    setFormData({
      name: system.name,
      category: system.category || '',
      vendor: system.vendor || '',
      description: system.description || '',
      layer: system.layer,
      capabilityType: system.capabilityType,
      itOwnerId: system.itOwnerId || '',
      productOwnerId: system.productOwnerId || '',
      devOpsLeadId: system.devOpsLeadId || '',
    });
    setError(null);
    setShowModal(true);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingSystem
        ? `/api/configuration/systems/${editingSystem.id}`
        : '/api/configuration/systems';
      const method = editingSystem ? 'PUT' : 'POST';

      // Convert empty strings to null for ownership fields
      const payload = {
        ...formData,
        itOwnerId: formData.itOwnerId || null,
        productOwnerId: formData.productOwnerId || null,
        devOpsLeadId: formData.devOpsLeadId || null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save system');
      }

      await mutate();
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [editingSystem, formData, mutate]);

  // Handle delete
  const handleDelete = useCallback(async (system: System) => {
    if (!confirm(`Are you sure you want to delete "${system.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/configuration/systems/${system.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete system');
      }

      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [mutate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Systems</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage the component catalog used across environments
          </p>
        </div>
        <button
          onClick={handleCreate}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-violet-600 text-white font-medium',
            'hover:bg-violet-700 transition-colors'
          )}
        >
          <Plus className="h-4 w-4" />
          Add System
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search systems..."
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg',
              'bg-white border border-slate-200',
              'text-sm text-slate-900 placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500'
            )}
          />
        </div>

        <div className="relative">
          <select
            value={selectedLayer || ''}
            onChange={(e) => setSelectedLayer(e.target.value || null)}
            className={cn(
              'appearance-none px-4 py-2 pr-10 rounded-lg',
              'bg-white border border-slate-200',
              'text-sm text-slate-900',
              'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500'
            )}
          >
            <option value="">All Layers</option>
            {layers.map((layer) => (
              <option key={layer} value={layer}>
                {layer}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Systems list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading systems...</div>
        ) : !systems?.length ? (
          <div className="p-8 text-center">
            <Server className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No systems found</p>
            <button
              onClick={handleCreate}
              className="mt-4 text-sm text-violet-600 hover:text-violet-700"
            >
              Add your first system
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  System
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Layer
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Capability
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Owners
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Instances
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {systems.map((system) => {
                const layerColor = layerColors[system.layer] || layerColors.UNKNOWN;

                return (
                  <tr key={system.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${layerColor}15` }}
                        >
                          <Layers className="h-4 w-4" style={{ color: layerColor }} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {system.name}
                          </div>
                          {system.description && (
                            <div className="text-xs text-slate-500 line-clamp-1">
                              {system.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: `${layerColor}10`,
                          borderColor: `${layerColor}30`,
                          color: layerColor,
                        }}
                      >
                        {system.layer}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">
                        {system.capabilityType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {system.itOwner && (
                          <div className="flex items-center gap-1.5" title={`IT Owner: ${system.itOwner.email}`}>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
                              <User className="h-3 w-3" />
                              IT
                            </span>
                            <span className="text-xs text-slate-600 truncate max-w-[100px]">
                              {system.itOwner.displayName}
                            </span>
                          </div>
                        )}
                        {system.productOwner && (
                          <div className="flex items-center gap-1.5" title={`Product Owner: ${system.productOwner.email}`}>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200">
                              <User className="h-3 w-3" />
                              PO
                            </span>
                            <span className="text-xs text-slate-600 truncate max-w-[100px]">
                              {system.productOwner.displayName}
                            </span>
                          </div>
                        )}
                        {system.devOpsLead && (
                          <div className="flex items-center gap-1.5" title={`DevOps Lead: ${system.devOpsLead.email}`}>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-orange-50 text-orange-700 border border-orange-200">
                              <Users className="h-3 w-3" />
                              DevOps
                            </span>
                            <span className="text-xs text-slate-600 truncate max-w-[100px]">
                              {system.devOpsLead.displayName}
                            </span>
                          </div>
                        )}
                        {!system.itOwner && !system.productOwner && !system.devOpsLead && (
                          <span className="text-xs text-slate-400 italic">No owners</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'inline-flex items-center justify-center w-8 h-6 rounded text-xs font-medium',
                        system.instanceCount > 0
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-slate-100 text-slate-500'
                      )}>
                        {system.instanceCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(system)}
                          className="p-1.5 rounded text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(system as System)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete"
                          disabled={system.instanceCount > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingSystem ? 'Edit System' : 'Add System'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-4 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={cn(
                      'w-full px-3 py-2 rounded-lg',
                      'bg-white border border-slate-200',
                      'text-sm text-slate-900',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500'
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Layer
                    </label>
                    <select
                      value={formData.layer}
                      onChange={(e) => setFormData({ ...formData, layer: e.target.value })}
                      className={cn(
                        'w-full px-3 py-2 rounded-lg',
                        'bg-white border border-slate-200',
                        'text-sm text-slate-900',
                        'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500'
                      )}
                    >
                      {layers.map((layer) => (
                        <option key={layer} value={layer}>
                          {layer}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Capability Type
                    </label>
                    <select
                      value={formData.capabilityType}
                      onChange={(e) => setFormData({ ...formData, capabilityType: e.target.value })}
                      className={cn(
                        'w-full px-3 py-2 rounded-lg',
                        'bg-white border border-slate-200',
                        'text-sm text-slate-900',
                        'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500'
                      )}
                    >
                      {capabilityTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={cn(
                        'w-full px-3 py-2 rounded-lg',
                        'bg-white border border-slate-200',
                        'text-sm text-slate-900',
                        'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500'
                      )}
                    >
                      <option value="">Select...</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Vendor
                    </label>
                    <input
                      type="text"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      placeholder="e.g., Oracle, SAP"
                      className={cn(
                        'w-full px-3 py-2 rounded-lg',
                        'bg-white border border-slate-200',
                        'text-sm text-slate-900 placeholder:text-slate-400',
                        'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500'
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Brief description of this system..."
                    className={cn(
                      'w-full px-3 py-2 rounded-lg',
                      'bg-white border border-slate-200',
                      'text-sm text-slate-900 placeholder:text-slate-400',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500',
                      'resize-none'
                    )}
                  />
                </div>

                {/* Ownership Section */}
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    Ownership
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        IT Owner
                      </label>
                      <select
                        value={formData.itOwnerId}
                        onChange={(e) => setFormData({ ...formData, itOwnerId: e.target.value })}
                        className={cn(
                          'w-full px-3 py-2 rounded-lg',
                          'bg-white border border-slate-200',
                          'text-sm text-slate-900',
                          'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500'
                        )}
                      >
                        <option value="">Select IT Owner...</option>
                        {people.map((person) => (
                          <option key={person.id} value={person.id}>
                            {person.displayName} ({person.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Product Owner
                      </label>
                      <select
                        value={formData.productOwnerId}
                        onChange={(e) => setFormData({ ...formData, productOwnerId: e.target.value })}
                        className={cn(
                          'w-full px-3 py-2 rounded-lg',
                          'bg-white border border-slate-200',
                          'text-sm text-slate-900',
                          'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500'
                        )}
                      >
                        <option value="">Select Product Owner...</option>
                        {people.map((person) => (
                          <option key={person.id} value={person.id}>
                            {person.displayName} ({person.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        DevOps Lead
                      </label>
                      <select
                        value={formData.devOpsLeadId}
                        onChange={(e) => setFormData({ ...formData, devOpsLeadId: e.target.value })}
                        className={cn(
                          'w-full px-3 py-2 rounded-lg',
                          'bg-white border border-slate-200',
                          'text-sm text-slate-900',
                          'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500'
                        )}
                      >
                        <option value="">Select DevOps Lead...</option>
                        {people.map((person) => (
                          <option key={person.id} value={person.id}>
                            {person.displayName} ({person.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium',
                    'bg-violet-600 text-white',
                    'hover:bg-violet-700 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isSubmitting ? 'Saving...' : editingSystem ? 'Save Changes' : 'Add System'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
