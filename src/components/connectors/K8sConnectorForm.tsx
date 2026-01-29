'use client';

// Nexorium Core - Kubernetes Connector Form
// Configuration form for Kubernetes cluster discovery

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, CheckCircle, AlertCircle } from 'lucide-react';
import ConnectorTestButton from './ConnectorTestButton';

interface K8sConnectorFormProps {
  environmentId: string;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

export default function K8sConnectorForm({
  environmentId,
  onSuccess,
  onLoadingChange,
}: K8sConnectorFormProps) {
  const [namespace, setNamespace] = useState('');
  const [labelSelector, setLabelSelector] = useState('');
  const [includeServices, setIncludeServices] = useState(true);
  const [includeIngress, setIncludeIngress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onLoadingChange?.(true);
    setResult(null);

    try {
      const response = await fetch('/api/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environmentId,
          connectorType: 'kubernetes',
          config: {
            namespace: namespace || undefined,
            labelSelector: labelSelector || undefined,
            includeServices,
            includeIngress,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: `Discovered ${data.data.nodesDiscovered} nodes and ${data.data.edgesDiscovered} edges`,
        });
        onSuccess?.();
      } else {
        setResult({
          success: false,
          message: data.error || 'Discovery failed',
        });
      }
    } catch {
      setResult({
        success: false,
        message: 'Failed to connect to Kubernetes cluster',
      });
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Namespace</label>
        <Input
          placeholder="default (leave empty for all namespaces)"
          value={namespace}
          onChange={(e) => setNamespace(e.target.value)}
        />
        <p className="text-xs text-slate-500">
          Filter discovery to a specific namespace
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Label Selector</label>
        <Input
          placeholder="app=myapp,env=test"
          value={labelSelector}
          onChange={(e) => setLabelSelector(e.target.value)}
        />
        <p className="text-xs text-slate-500">
          Kubernetes label selector to filter resources
        </p>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeServices}
            onChange={(e) => setIncludeServices(e.target.checked)}
            className="rounded border-slate-300"
          />
          <span className="text-sm">Include Services</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeIngress}
            onChange={(e) => setIncludeIngress(e.target.checked)}
            className="rounded border-slate-300"
          />
          <span className="text-sm">Include Ingress</span>
        </label>
      </div>

      {result && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {result.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm">{result.message}</span>
        </div>
      )}

      <div className="flex gap-2">
        <ConnectorTestButton connectorType="kubernetes" />
        <Button type="submit" disabled={loading}>
          <Play className="h-4 w-4 mr-2" />
          {loading ? 'Discovering...' : 'Run Discovery'}
        </Button>
      </div>
    </form>
  );
}
