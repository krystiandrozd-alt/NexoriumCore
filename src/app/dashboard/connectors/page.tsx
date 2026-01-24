'use client';

// TelEnvIQ - Connectors Dashboard (V2)
// Connector management and ingestion runs

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import {
  Plug,
  Play,
  Cloud,
  FileCode,
  Database,
  GitBranch,
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Server,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface Environment {
  id: string;
  name: string;
  type: string;
}

interface ConnectorRun {
  id: string;
  environmentId: string;
  connectorType: string;
  status: 'RUNNING' | 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  startedAt: string;
  finishedAt: string | null;
  summaryJson: {
    hostsCreated?: number;
    hostsUpdated?: number;
    componentInstancesCreated?: number;
    componentInstancesUpdated?: number;
    connectionsCreated?: number;
    connectionsUpdated?: number;
    warnings?: string[];
    errors?: string[];
  } | null;
  errorMessage: string | null;
  environment: {
    id: string;
    name: string;
    type: string;
  } | null;
}

const connectorTypes = [
  {
    type: 'mock',
    name: 'Mock Connector',
    icon: Database,
    description: 'Generate realistic telco environment data for testing',
    category: 'Test Data',
  },
  {
    type: 'config-repo',
    name: 'Config Repository',
    icon: FileCode,
    description: 'Import from YAML/JSON topology manifests',
    category: 'Manifests',
  },
  {
    type: 'cloud-aws',
    name: 'AWS Control Plane',
    icon: Cloud,
    description: 'Import VPCs, EC2 instances, load balancers',
    category: 'Cloud',
  },
  {
    type: 'cloud-azure',
    name: 'Azure Control Plane',
    icon: Cloud,
    description: 'Import VNets, VMs, load balancers',
    category: 'Cloud',
  },
  {
    type: 'cloud-gcp',
    name: 'GCP Control Plane',
    icon: Cloud,
    description: 'Import VPCs, Compute instances',
    category: 'Cloud',
  },
  {
    type: 'terraform',
    name: 'Terraform State',
    icon: GitBranch,
    description: 'Read infrastructure from Terraform state files',
    category: 'IaC',
  },
  {
    type: 'csv',
    name: 'CSV Import',
    icon: FileText,
    description: 'Import hosts, components from CSV files',
    category: 'Manual',
  },
];

export default function ConnectorsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const [runs, setRuns] = useState<ConnectorRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningConnector, setRunningConnector] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/environments').then((res) => res.json()),
      fetch('/api/connectors/runs').then((res) => res.json()),
    ])
      .then(([envData, runsData]) => {
        if (envData.success) {
          setEnvironments(envData.data);
          if (envData.data.length > 0) {
            setSelectedEnvironment(envData.data[0].id);
          }
        }
        if (runsData.success) {
          setRuns(runsData.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRunConnector = async (connectorType: string) => {
    if (!selectedEnvironment) {
      alert('Please select an environment first');
      return;
    }

    setRunningConnector(connectorType);

    try {
      const response = await fetch('/api/connectors/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environmentId: selectedEnvironment,
          connectorType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh runs list
        const runsResponse = await fetch('/api/connectors/runs');
        const runsData = await runsResponse.json();
        if (runsData.success) {
          setRuns(runsData.data);
        }

        alert(`Connector run completed!\n\nSummary:\n- Hosts: ${result.data.summary.hostsCreated || 0} created, ${result.data.summary.hostsUpdated || 0} updated\n- Instances: ${result.data.summary.componentInstancesCreated || 0} created\n- Connections: ${result.data.summary.connectionsCreated || 0} created\n- Warnings: ${result.data.summary.warnings?.length || 0}`);
      } else {
        alert(`Connector failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Failed to run connector: ${error}`);
    } finally {
      setRunningConnector(null);
    }
  };

  const getStatusBadge = (status: ConnectorRun['status']) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'PARTIAL_SUCCESS':
        return <Badge className="bg-amber-100 text-amber-800"><AlertTriangle className="h-3 w-3 mr-1" />Partial</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'RUNNING':
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getConnectorIcon = (type: string) => {
    const connector = connectorTypes.find(c => c.type === type);
    const IconComponent = connector?.icon || Plug;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Connectors</h1>
          <p className="text-slate-500 mt-1">
            Ingest environment data from various sources
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            options={[
              { value: '', label: 'Select Environment' },
              ...environments.map((env) => ({
                value: env.id,
                label: `${env.name} (${env.type})`,
              })),
            ]}
            value={selectedEnvironment}
            onChange={(e) => setSelectedEnvironment(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Quick Actions */}
      {selectedEnvironment && (
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="font-medium text-slate-900">Quick Start</p>
                  <p className="text-sm text-slate-600">Run the Mock Connector to generate demo data</p>
                </div>
              </div>
              <Button
                onClick={() => handleRunConnector('mock')}
                disabled={!!runningConnector}
              >
                {runningConnector === 'mock' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Mock Ingestion
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connector Types */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Connectors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectorTypes.map((connector) => (
            <Card key={connector.type} className="hover:border-indigo-300 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <connector.icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900">{connector.name}</h3>
                      <Badge variant="secondary" className="text-xs">{connector.category}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{connector.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => handleRunConnector(connector.type)}
                      disabled={!selectedEnvironment || !!runningConnector}
                    >
                      {runningConnector === connector.type ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5 mr-1" />
                      )}
                      Run
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Runs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-indigo-600" />
            Recent Ingestion Runs
          </CardTitle>
          <CardDescription>
            History of connector executions and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto" />
            </div>
          ) : runs.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No ingestion runs yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Run a connector to see results here
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {runs.map((run) => (
                <div key={run.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      {getConnectorIcon(run.connectorType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 capitalize">
                          {run.connectorType.replace(/-/g, ' ')}
                        </span>
                        {getStatusBadge(run.status)}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        {run.environment && (
                          <span>{run.environment.name}</span>
                        )}
                        <span>•</span>
                        <span>{formatRelativeTime(run.startedAt)}</span>
                        {run.summaryJson && (
                          <>
                            <span>•</span>
                            <span>
                              {(run.summaryJson.hostsCreated || 0) + (run.summaryJson.componentInstancesCreated || 0)} entities created
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {run.summaryJson?.warnings && run.summaryJson.warnings.length > 0 && (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                      {run.summaryJson.warnings.length} warnings
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
