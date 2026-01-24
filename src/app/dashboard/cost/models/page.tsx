'use client';

// TelEnvIQ - Cost Model Manager

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import {
  DollarSign,
  Plus,
  Settings,
  Trash2,
  Loader2,
  ArrowLeft,
  Check,
} from 'lucide-react';
import type { CostModel } from '@/types/cost';

export default function CostModelsPage() {
  const [models, setModels] = useState<CostModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState<{
    name: string;
    description: string;
    currency: string;
    period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    notes: string;
  }>({
    name: '',
    description: '',
    currency: 'USD',
    period: 'MONTHLY',
    notes: '',
  });
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/cost-models');
      const result = await response.json();
      if (result.success) {
        setModels(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch cost models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await fetch('/api/cost-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const result = await response.json();
      if (result.success) {
        setModels([result.data, ...models]);
        setCreateModalOpen(false);
        setCreateForm({
          name: '',
          description: '',
          currency: 'USD',
          period: 'MONTHLY',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Failed to create cost model:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/cost-models/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setModels(models.filter(m => m.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (error) {
      console.error('Failed to delete cost model:', error);
    } finally {
      setDeleting(false);
    }
  };

  const periodLabels: Record<string, string> = {
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    YEARLY: 'Yearly',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cost">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Cost Models</h1>
            <p className="text-slate-500 mt-1">
              Define cost structures for environment pricing
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Cost Model
        </Button>
      </div>

      {/* Models List */}
      {models.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No cost models yet</h3>
              <p className="text-slate-500 mb-6">
                Create your first cost model to start tracking environment costs
              </p>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Cost Model
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <Card key={model.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{model.name}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {model.currency}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {periodLabels[model.period]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {model.description && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {model.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-slate-600">
                    <span className="font-medium">{model._count?.costItems || 0}</span>{' '}
                    cost items
                  </span>
                  <Badge variant={model.isActive ? 'default' : 'secondary'}>
                    {model.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/cost/models/${model.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteConfirmId(model.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Create Cost Model</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Model Name *
            </label>
            <Input
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="e.g., CPQ Non-Prod Model"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Description
            </label>
            <Input
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Brief description of this cost model"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Currency
              </label>
              <Select
                options={[
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR' },
                  { value: 'GBP', label: 'GBP' },
                  { value: 'NOK', label: 'NOK' },
                ]}
                value={createForm.currency}
                onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Period
              </label>
              <Select
                options={[
                  { value: 'MONTHLY', label: 'Monthly' },
                  { value: 'QUARTERLY', label: 'Quarterly' },
                  { value: 'YEARLY', label: 'Yearly' },
                ]}
                value={createForm.period}
                onChange={(e) => setCreateForm({ ...createForm, period: e.target.value as 'MONTHLY' | 'QUARTERLY' | 'YEARLY' })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Notes
            </label>
            <Input
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              placeholder="Additional notes or assumptions"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || !createForm.name}>
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Create Model
            </Button>
          </div>
        </form>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Delete Cost Model</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete this cost model? This will also delete all associated cost items and cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </div>
        </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
