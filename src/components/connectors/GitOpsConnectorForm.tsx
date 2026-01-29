'use client';

// Nexorium Core - GitOps Connector Form
// Configuration form for GitOps repository discovery

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, CheckCircle, AlertCircle } from 'lucide-react';

interface GitOpsConnectorFormProps {
  environmentId: string;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

export default function GitOpsConnectorForm({
  environmentId,
  onSuccess,
  onLoadingChange,
}: GitOpsConnectorFormProps) {
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [manifestPath, setManifestPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repositoryUrl) {
      setResult({ success: false, message: 'Repository URL is required' });
      return;
    }

    setLoading(true);
    onLoadingChange?.(true);
    setResult(null);

    try {
      const response = await fetch('/api/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environmentId,
          connectorType: 'gitops',
          config: {
            repositoryUrl,
            branch,
            manifestPath: manifestPath || undefined,
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
        message: 'Failed to connect to repository',
      });
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Repository URL</label>
        <Input
          type="url"
          placeholder="https://github.com/org/repo.git"
          value={repositoryUrl}
          onChange={(e) => setRepositoryUrl(e.target.value)}
          required
        />
        <p className="text-xs text-slate-500">
          Git repository containing Kubernetes manifests or Helm charts
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Branch</label>
          <Input
            placeholder="main"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Manifest Path</label>
          <Input
            placeholder="k8s/ or charts/"
            value={manifestPath}
            onChange={(e) => setManifestPath(e.target.value)}
          />
        </div>
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

      <Button type="submit" disabled={loading}>
        <Play className="h-4 w-4 mr-2" />
        {loading ? 'Importing...' : 'Import from GitOps'}
      </Button>
    </form>
  );
}
