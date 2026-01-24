'use client';

// TelEnvIQ - Connectors Page
// Connector definitions and management

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PillarHeader } from '@/components/navigation';
import {
  Plug,
  Plus,
  Loader2,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface Connector {
  id: string;
  name: string;
  connectorType: string;
  description?: string;
  status: 'ACTIVE' | 'DISABLED' | 'ERROR' | 'PENDING_CONFIG';
  lastRunAt?: string;
  lastRunStatus?: string;
  createdAt: string;
}

const statusConfig = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  DISABLED: { label: 'Disabled', color: 'bg-slate-100 text-slate-700', icon: XCircle },
  ERROR: { label: 'Error', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  PENDING_CONFIG: { label: 'Pending Config', color: 'bg-amber-100 text-amber-700', icon: Clock },
};

const typeLabels: Record<string, string> = {
  KUBERNETES: 'Kubernetes',
  GITOPS: 'GitOps',
  CMDB: 'CMDB',
  APM: 'APM',
  MANUAL: 'Manual',
  CUSTOM: 'Custom',
};

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnectors();
  }, []);

  async function fetchConnectors() {
    try {
      const response = await fetch('/api/configuration/connectors');
      const result = await response.json();
      if (result.success) {
        setConnectors(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch connectors:', error);
    } finally {
      setLoading(false);
    }
  }

  async function runConnector(connectorId: string) {
    try {
      await fetch(`/api/configuration/connectors/${connectorId}/run`, {
        method: 'POST',
      });
      fetchConnectors();
    } catch (error) {
      console.error('Failed to run connector:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PillarHeader
        title="Connectors"
        description="Configure data ingestion connectors"
        icon={Plug}
        iconColor="text-indigo-600"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Connector
          </Button>
        }
      />

      {connectors.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Plug className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No Connectors Configured
            </h3>
            <p className="text-slate-500 mb-4">
              Add connectors to ingest data from external sources
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Connector
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectors.map((connector) => {
            const status = statusConfig[connector.status];
            const StatusIcon = status.icon;

            return (
              <Card key={connector.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Plug className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{connector.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {typeLabels[connector.connectorType] || connector.connectorType}
                          </Badge>
                          <Badge variant="secondary" className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runConnector(connector.id)}
                      disabled={connector.status !== 'ACTIVE'}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {connector.description && (
                    <p className="text-sm text-slate-500 mb-3">{connector.description}</p>
                  )}
                  <div className="text-xs text-slate-400 space-y-1">
                    {connector.lastRunAt && (
                      <p>
                        Last run: {formatRelativeTime(new Date(connector.lastRunAt))}
                        {connector.lastRunStatus && ` (${connector.lastRunStatus})`}
                      </p>
                    )}
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
