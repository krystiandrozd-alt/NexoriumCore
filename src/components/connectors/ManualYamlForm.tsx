'use client';

// Nexorium Core - Manual YAML Import Form
// Form for importing topology from YAML/JSON

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, AlertCircle, FileCode } from 'lucide-react';

interface ManualYamlFormProps {
  environmentId: string;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

const EXAMPLE_YAML = `# Example topology YAML
nodes:
  - name: api-gateway
    type: GATEWAY
    owner: platform-team
    criticality: HIGH

  - name: order-service
    type: SERVICE
    owner: orders-team

  - name: orders-db
    type: DATABASE
    owner: dba-team
    database:
      engine: PostgreSQL
      version: "14.5"

edges:
  - source: api-gateway
    target: order-service
    protocol: REST
    port: 8080

  - source: order-service
    target: orders-db
    protocol: JDBC
    port: 5432
`;

export default function ManualYamlForm({
  environmentId,
  onSuccess,
  onLoadingChange,
}: ManualYamlFormProps) {
  const [content, setContent] = useState('');
  const [format, setFormat] = useState<'yaml' | 'json'>('yaml');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setResult({ success: false, message: 'Please enter YAML or JSON content' });
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
          connectorType: 'manual',
          config: {
            format,
            content,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: `Imported ${data.data.nodesDiscovered} nodes and ${data.data.edgesDiscovered} edges`,
        });
        onSuccess?.();
      } else {
        setResult({
          success: false,
          message: data.error || 'Import failed',
        });
      }
    } catch {
      setResult({
        success: false,
        message: 'Failed to parse content',
      });
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  const handleLoadExample = () => {
    setContent(EXAMPLE_YAML);
    setFormat('yaml');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);

      // Detect format from file extension
      if (file.name.endsWith('.json')) {
        setFormat('json');
      } else {
        setFormat('yaml');
      }
    };
    reader.readAsText(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Format:</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'yaml' | 'json')}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="yaml">YAML</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleLoadExample}>
            <FileCode className="h-3.5 w-3.5 mr-1" />
            Load Example
          </Button>
          <label className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
            <input
              type="file"
              accept=".yaml,.yml,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="h-3.5 w-3.5 mr-1" />
            Upload File
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Paste your ${format.toUpperCase()} content here...`}
          className="w-full h-64 font-mono text-sm p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          spellCheck={false}
        />
        <p className="text-xs text-slate-500">
          Define nodes (name, type, owner) and edges (source, target, protocol)
        </p>
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

      <Button type="submit" disabled={loading || !content.trim()}>
        <Upload className="h-4 w-4 mr-2" />
        {loading ? 'Importing...' : 'Import Topology'}
      </Button>
    </form>
  );
}
