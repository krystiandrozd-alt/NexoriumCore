'use client';

// TelEnvIQ - Environment Versions Page
// Version matrix for the environment

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  Loader2,
  CheckCircle,
} from 'lucide-react';

interface VersionInfo {
  componentId: string;
  componentName: string;
  layer: string;
  projectVersion: string;
  vendorVersion?: string;
  buildRef?: string;
  capturedAt: string;
  instanceCount: number;
}

export default function EnvironmentVersionsPage() {
  const params = useParams();
  const id = params.id as string;
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchVersions() {
      try {
        const response = await fetch(`/api/environments/${id}/versions`);
        const result = await response.json();
        if (result.success) {
          setVersions(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch versions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVersions();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Group versions by layer
  const versionsByLayer = versions.reduce((acc, v) => {
    if (!acc[v.layer]) {
      acc[v.layer] = [];
    }
    acc[v.layer].push(v);
    return acc;
  }, {} as Record<string, VersionInfo[]>);

  const layerOrder = ['BSS', 'OSS', 'INFRA', 'EXTERNAL', 'UNKNOWN'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Version Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No version data available
              </h3>
              <p className="text-slate-500">
                Deploy components to see version information
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Component</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Layer</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Version</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Vendor</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Instances</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Captured</th>
                  </tr>
                </thead>
                <tbody>
                  {layerOrder.map((layer) => {
                    const layerVersions = versionsByLayer[layer] || [];
                    return layerVersions.map((v, idx) => (
                      <tr
                        key={`${v.componentId}-${idx}`}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900">{v.componentName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{v.layer}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                            {v.projectVersion}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {v.vendorVersion || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1">
                            {v.instanceCount > 1 ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>{v.instanceCount}</span>
                              </>
                            ) : (
                              <span>{v.instanceCount}</span>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-sm">
                          {new Date(v.capturedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
