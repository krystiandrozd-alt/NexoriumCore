'use client';

// TelEnvIQ - Cost Model Detail / Edit Page

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import {
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Loader2,
  ArrowLeft,
  Check,
  Server,
  Tag,
  Share2,
  MoreHorizontal,
  Save,
} from 'lucide-react';
import type { CostModel, CostItem, CostItemType, CostUnit, AllocationMethod } from '@/types/cost';
import { formatCurrencyPrecise, getCostItemTypeLabel, getCostUnitLabel, getAllocationMethodLabel } from '@/lib/utils/cost';

export default function CostModelDetailPage() {
  const params = useParams();
  const modelId = params.id as string;

  const [model, setModel] = useState<CostModel | null>(null);
  const [loading, setLoading] = useState(true);

  // Item form state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CostItem | null>(null);
  const [itemForm, setItemForm] = useState({
    itemType: 'HOST' as CostItemType,
    name: '',
    unitCost: '',
    unit: 'PER_HOST' as CostUnit,
    defaultQuantity: '1',
    allocationMethod: 'DIRECT' as AllocationMethod,
    notes: '',
  });
  const [savingItem, setSavingItem] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const fetchModel = useCallback(async () => {
    try {
      const response = await fetch(`/api/cost-models/${modelId}`);
      const result = await response.json();
      if (result.success) {
        setModel(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch cost model:', error);
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingItem(true);

    try {
      if (editingItem) {
        // Update existing item
        const response = await fetch(`/api/cost-models/${modelId}/items`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: editingItem.id,
            ...itemForm,
            unitCost: parseFloat(itemForm.unitCost),
            defaultQuantity: parseFloat(itemForm.defaultQuantity),
          }),
        });
        if (response.ok) {
          fetchModel();
          closeItemModal();
        }
      } else {
        // Create new item
        const response = await fetch(`/api/cost-models/${modelId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...itemForm,
            unitCost: parseFloat(itemForm.unitCost),
            defaultQuantity: parseFloat(itemForm.defaultQuantity),
          }),
        });
        if (response.ok) {
          fetchModel();
          closeItemModal();
        }
      }
    } catch (error) {
      console.error('Failed to save cost item:', error);
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cost-models/${modelId}/items?itemId=${itemId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchModel();
        setDeleteItemId(null);
      }
    } catch (error) {
      console.error('Failed to delete cost item:', error);
    }
  };

  const openItemModal = (item?: CostItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        itemType: item.itemType,
        name: item.name,
        unitCost: item.unitCost.toString(),
        unit: item.unit,
        defaultQuantity: item.defaultQuantity.toString(),
        allocationMethod: item.allocationMethod,
        notes: item.notes || '',
      });
    } else {
      setEditingItem(null);
      setItemForm({
        itemType: 'HOST',
        name: '',
        unitCost: '',
        unit: 'PER_HOST',
        defaultQuantity: '1',
        allocationMethod: 'DIRECT',
        notes: '',
      });
    }
    setItemModalOpen(true);
  };

  const closeItemModal = () => {
    setItemModalOpen(false);
    setEditingItem(null);
    setItemForm({
      itemType: 'HOST',
      name: '',
      unitCost: '',
      unit: 'PER_HOST',
      defaultQuantity: '1',
      allocationMethod: 'DIRECT',
      notes: '',
    });
  };

  const itemTypeIcons: Record<string, React.ReactNode> = {
    HOST: <Server className="h-4 w-4" />,
    COMPONENT_LICENSE: <Tag className="h-4 w-4" />,
    SHARED_PLATFORM: <Share2 className="h-4 w-4" />,
    OTHER: <MoreHorizontal className="h-4 w-4" />,
  };

  const itemTypeColors: Record<string, string> = {
    HOST: 'bg-blue-100 text-blue-700',
    COMPONENT_LICENSE: 'bg-purple-100 text-purple-700',
    SHARED_PLATFORM: 'bg-amber-100 text-amber-700',
    OTHER: 'bg-slate-100 text-slate-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!model) {
    return (
      <div className="text-center py-24">
        <h2 className="text-xl font-semibold text-slate-900">Cost model not found</h2>
        <Link href="/dashboard/cost/models">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Models
          </Button>
        </Link>
      </div>
    );
  }

  const directItems = model.costItems?.filter(i => i.allocationMethod === 'DIRECT') || [];
  const sharedItems = model.costItems?.filter(i => i.allocationMethod === 'SHARED_PRORATED') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cost/models">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{model.name}</h1>
              <Badge variant="secondary">{model.currency}</Badge>
              <Badge variant="outline">{model.period}</Badge>
            </div>
            {model.description && (
              <p className="text-slate-500 mt-1">{model.description}</p>
            )}
          </div>
        </div>
        <Button onClick={() => openItemModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Cost Item
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Items</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {model.costItems?.length || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Direct Costs</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {directItems.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Shared Costs</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {sharedItems.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Share2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cost Items</CardTitle>
          <CardDescription>
            Line items that make up this cost model. Direct items are applied per-environment, shared items are prorated across environments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {model.costItems?.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No cost items yet</h3>
              <p className="text-slate-500 mb-6">
                Add cost items to define the pricing structure for this model
              </p>
              <Button onClick={() => openItemModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Cost Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Name</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Unit Cost</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Unit</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Default Qty</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Allocation</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {model.costItems?.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <Badge className={itemTypeColors[item.itemType]}>
                          <span className="mr-1">{itemTypeIcons[item.itemType]}</span>
                          {getCostItemTypeLabel(item.itemType)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900">{item.name}</span>
                        {item.notes && (
                          <p className="text-xs text-slate-500 mt-1">{item.notes}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-900">
                        {formatCurrencyPrecise(item.unitCost, model.currency)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm">
                        {getCostUnitLabel(item.unit)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {item.defaultQuantity}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={item.allocationMethod === 'DIRECT' ? 'default' : 'secondary'}>
                          {getAllocationMethodLabel(item.allocationMethod)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openItemModal(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteItemId(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Item Modal */}
      <Modal open={itemModalOpen} onOpenChange={(open) => !open && closeItemModal()}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{editingItem ? 'Edit Cost Item' : 'Add Cost Item'}</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Type *</label>
              <Select
                options={[
                  { value: 'HOST', label: 'Host/VM' },
                  { value: 'COMPONENT_LICENSE', label: 'License' },
                  { value: 'SHARED_PLATFORM', label: 'Shared Platform' },
                  { value: 'OTHER', label: 'Other' },
                ]}
                value={itemForm.itemType}
                onChange={(e) => setItemForm({ ...itemForm, itemType: e.target.value as CostItemType })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Allocation *</label>
              <Select
                options={[
                  { value: 'DIRECT', label: 'Direct' },
                  { value: 'SHARED_PRORATED', label: 'Shared (Prorated)' },
                ]}
                value={itemForm.allocationMethod}
                onChange={(e) => setItemForm({ ...itemForm, allocationMethod: e.target.value as AllocationMethod })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Name *</label>
            <Input
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              placeholder="e.g., AWS m5.xlarge, Oracle DB License"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Unit Cost ({model.currency}) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={itemForm.unitCost}
                onChange={(e) => setItemForm({ ...itemForm, unitCost: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Unit *</label>
              <Select
                options={[
                  { value: 'PER_ENV', label: 'Per Environment' },
                  { value: 'PER_HOST', label: 'Per Host' },
                  { value: 'PER_COMPONENT', label: 'Per Component' },
                  { value: 'PER_GB', label: 'Per GB' },
                  { value: 'PER_USER', label: 'Per User' },
                  { value: 'OTHER', label: 'Other' },
                ]}
                value={itemForm.unit}
                onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value as CostUnit })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Default Qty</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={itemForm.defaultQuantity}
                onChange={(e) => setItemForm({ ...itemForm, defaultQuantity: e.target.value })}
                placeholder="1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Notes</label>
            <Input
              value={itemForm.notes}
              onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
              placeholder="Optional notes about this cost item"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeItemModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={savingItem || !itemForm.name || !itemForm.unitCost}>
              {savingItem ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
        </ModalContent>
      </Modal>

      {/* Delete Item Confirmation */}
      <Modal open={!!deleteItemId} onOpenChange={(open) => !open && setDeleteItemId(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Delete Cost Item</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete this cost item? This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteItemId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteItemId && handleDeleteItem(deleteItemId)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
