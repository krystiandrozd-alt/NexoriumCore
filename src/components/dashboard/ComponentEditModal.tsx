'use client';

// Nexorium Core - Component Edit Modal
// Edit layer and capability type with audit trail

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { ArchitectureLayer, CapabilityType } from '@/types';

interface ComponentData {
  id: string;
  name: string;
  layer: ArchitectureLayer;
  capabilityType: CapabilityType;
  vendor?: string | null;
  description?: string | null;
}

interface ComponentEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  component: ComponentData | null;
  onSave: () => void;
}

const LAYERS: { value: ArchitectureLayer; label: string; description: string }[] = [
  { value: 'BSS', label: 'BSS', description: 'Business Support Systems - customer-facing' },
  { value: 'OSS', label: 'OSS', description: 'Operations Support Systems - network/service mgmt' },
  { value: 'INFRA', label: 'INFRA', description: 'Infrastructure - databases, messaging, etc.' },
  { value: 'EXTERNAL', label: 'EXTERNAL', description: 'External systems and channels' },
  { value: 'UNKNOWN', label: 'UNKNOWN', description: 'Not yet classified' },
];

const CAPABILITIES: { value: CapabilityType; label: string }[] = [
  { value: 'CPQ', label: 'CPQ - Configure Price Quote' },
  { value: 'CRM', label: 'CRM - Customer Relationship Mgmt' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'SOM', label: 'SOM - Service Order Mgmt' },
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'ORCHESTRATOR', label: 'Orchestrator' },
  { value: 'DB', label: 'Database' },
  { value: 'MQ', label: 'Message Queue' },
  { value: 'API_GW', label: 'API Gateway' },
  { value: 'IDENTITY', label: 'Identity/Auth' },
  { value: 'ITSM', label: 'ITSM' },
  { value: 'OTHER', label: 'Other' },
  { value: 'UNKNOWN', label: 'Unknown' },
];

export default function ComponentEditModal({
  open,
  onOpenChange,
  component,
  onSave,
}: ComponentEditModalProps) {
  const [layer, setLayer] = useState<ArchitectureLayer>('UNKNOWN');
  const [capabilityType, setCapabilityType] = useState<CapabilityType>('UNKNOWN');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (component) {
      setLayer(component.layer);
      setCapabilityType(component.capabilityType);
      setError(null);
    }
  }, [component]);

  const handleSave = async () => {
    if (!component) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/components/${component.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layer, capabilityType }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update component');
      }

      onSave();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    component && (layer !== component.layer || capabilityType !== component.capabilityType);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <ModalTitle>Edit Component Classification</ModalTitle>
          <ModalDescription>
            {component?.name} - Set architecture layer and capability type
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4 py-4">
          {/* Layer selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Architecture Layer
            </label>
            <div className="space-y-2">
              {LAYERS.map((l) => (
                <label
                  key={l.value}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                    transition-colors
                    ${layer === l.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:bg-slate-50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="layer"
                    value={l.value}
                    checked={layer === l.value}
                    onChange={() => setLayer(l.value)}
                    className="sr-only"
                  />
                  <div>
                    <div className="font-medium text-slate-800">{l.label}</div>
                    <div className="text-xs text-slate-500">{l.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Capability selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Capability Type
            </label>
            <select
              value={capabilityType}
              onChange={(e) => setCapabilityType(e.target.value as CapabilityType)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {CAPABILITIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
