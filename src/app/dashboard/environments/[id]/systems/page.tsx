'use client';

// TelEnvIQ - Environment Systems Page
// List of systems/components in the environment

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Server,
  Search,
  Loader2,
  Database,
  Cloud,
  Layers,
} from 'lucide-react';

interface ComponentInstance {
  id: string;
  displayName?: string;
  component: {
    id: string;
    name: string;
    category?: string;
    layer: string;
    capabilityType: string;
  };
  host?: {
    hostname: string;
    ip?: string;
  };
  endpoints: Array<{
    kind: string;
    value: string;
    port?: number;
  }>;
  deployedVersions: Array<{
    projectVersion: string;
    vendorVersion?: string;
    capturedAt: string;
  }>;
}

const layerColors: Record<string, string> = {
  BSS: 'bg-blue-100 text-blue-700',
  OSS: 'bg-purple-100 text-purple-700',
  INFRA: 'bg-amber-100 text-amber-700',
  EXTERNAL: 'bg-slate-100 text-slate-700',
  UNKNOWN: 'bg-gray-100 text-gray-700',
};

export default function EnvironmentSystemsPage() {
  const params = useParams();
  const id = params.id as string;
  const [components, setComponents] = useState<ComponentInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!id) return;

    async function fetchComponents() {
      try {
        const response = await fetch(`/api/environments/${id}/components`);
        const result = await response.json();
        if (result.success) {
          setComponents(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch components:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchComponents();
  }, [id]);

  const filteredComponents = components.filter((comp) => {
    const name = comp.displayName || comp.component.name;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search systems..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Systems List */}
      {filteredComponents.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Server className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery ? 'No systems match your search' : 'No systems found'}
            </h3>
            <p className="text-slate-500">
              {searchQuery ? 'Try a different search term' : 'Run a connector to discover systems'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map((comp) => {
            const latestVersion = comp.deployedVersions[0];
            const primaryEndpoint = comp.endpoints[0];

            return (
              <Card key={comp.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        {comp.component.category === 'DATABASE' ? (
                          <Database className="h-5 w-5 text-slate-600" />
                        ) : comp.component.layer === 'INFRA' ? (
                          <Cloud className="h-5 w-5 text-slate-600" />
                        ) : (
                          <Layers className="h-5 w-5 text-slate-600" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {comp.displayName || comp.component.name}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className={layerColors[comp.component.layer] || layerColors.UNKNOWN}
                        >
                          {comp.component.layer}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {comp.host && (
                      <div className="flex justify-between text-slate-600">
                        <span>Host:</span>
                        <span className="font-mono text-xs">{comp.host.hostname}</span>
                      </div>
                    )}
                    {primaryEndpoint && (
                      <div className="flex justify-between text-slate-600">
                        <span>Endpoint:</span>
                        <span className="font-mono text-xs">
                          {primaryEndpoint.value}
                          {primaryEndpoint.port ? `:${primaryEndpoint.port}` : ''}
                        </span>
                      </div>
                    )}
                    {latestVersion && (
                      <div className="flex justify-between text-slate-600">
                        <span>Version:</span>
                        <span className="font-medium">{latestVersion.projectVersion}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Capability:</span>
                      <span>{comp.component.capabilityType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
