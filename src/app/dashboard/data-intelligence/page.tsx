'use client';

// Nexorium Core - Data Intelligence Page
// Test data lifecycle tracking and monitoring

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { formatDate, daysSince, getStalenessLevel, getStalenessColor, getSourceTypeDisplayName } from '@/lib/utils';
import type { Environment, TestDataSet } from '@/types';

interface DatasetWithMeta extends TestDataSet {
  database?: {
    node?: {
      name: string;
      environmentId: string;
    };
    engine: string;
  };
  daysStale?: number | null;
}

export default function DataIntelligencePage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [datasets, setDatasets] = useState<DatasetWithMeta[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  useEffect(() => {
    fetchEnvironments();
  }, []);

  useEffect(() => {
    if (selectedEnv) {
      fetchDatasets(selectedEnv);
    }
  }, [selectedEnv]);

  async function fetchEnvironments() {
    try {
      const response = await fetch('/api/environments');
      const result = await response.json();
      if (result.success) {
        setEnvironments(result.data);
        if (result.data.length > 0) {
          setSelectedEnv(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch environments:', error);
    }
  }

  async function fetchDatasets(envId: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/datasets?environmentId=${envId}`);
      const result = await response.json();
      if (result.success) {
        setDatasets(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRecordRefresh(datasetId: string) {
    setRefreshing(datasetId);
    try {
      const response = await fetch(`/api/datasets/${datasetId}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'MANUAL',
          refreshedBy: 'User',
          notes: 'Manual refresh recorded via UI',
        }),
      });
      const result = await response.json();
      if (result.success) {
        // Refresh the datasets list
        if (selectedEnv) {
          fetchDatasets(selectedEnv);
        }
      }
    } catch (error) {
      console.error('Failed to record refresh:', error);
    } finally {
      setRefreshing(null);
    }
  }

  // Calculate summary stats
  const summary = {
    total: datasets.length,
    fresh: datasets.filter((d) => getStalenessLevel(daysSince(d.lastRefreshDate)) === 'fresh').length,
    warning: datasets.filter((d) => getStalenessLevel(daysSince(d.lastRefreshDate)) === 'warning').length,
    stale: datasets.filter((d) => {
      const level = getStalenessLevel(daysSince(d.lastRefreshDate));
      return level === 'stale' || level === 'critical';
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Intelligence</h1>
          <p className="text-slate-500 mt-1">
            Monitor test data freshness and lifecycle across environments
          </p>
        </div>
        <Select
          options={environments.map((env) => ({
            value: env.id,
            label: `${env.name} (${env.type})`,
          }))}
          value={selectedEnv}
          onChange={(e) => setSelectedEnv(e.target.value)}
          placeholder="Select Environment"
          className="w-64"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Database className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
                <p className="text-xs text-slate-500">Total Datasets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{summary.fresh}</p>
                <p className="text-xs text-slate-500">Fresh (&lt;14 days)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{summary.warning}</p>
                <p className="text-xs text-slate-500">Warning (14-30 days)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{summary.stale}</p>
                <p className="text-xs text-slate-500">Stale (&gt;30 days)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Datasets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Test Data Sets</CardTitle>
          <CardDescription>
            Track refresh dates, masking policies, and data lineage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : datasets.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No test data sets configured
              </h3>
              <p className="text-slate-500">
                Test data sets will appear here once databases are discovered and configured.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Database
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Source Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Last Refresh
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Days Since
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Masking Policy
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Owner
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((dataset) => {
                    const days = daysSince(dataset.lastRefreshDate);
                    const level = getStalenessLevel(days);
                    const levelColors = getStalenessColor(level);

                    return (
                      <tr
                        key={dataset.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-slate-400" />
                            <span className="font-medium text-slate-900">
                              {dataset.database?.node?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({dataset.database?.engine})
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">
                            {getSourceTypeDisplayName(dataset.sourceType)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {dataset.lastRefreshDate
                            ? formatDate(dataset.lastRefreshDate)
                            : 'Never'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${levelColors}`}
                          >
                            {days === null ? 'Never' : `${days} days`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {dataset.maskingPolicyVersion || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {dataset.owner || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRecordRefresh(dataset.id)}
                            disabled={refreshing === dataset.id}
                          >
                            {refreshing === dataset.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Record Refresh
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Downstream Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Lineage</CardTitle>
          <CardDescription>
            Understand which services depend on each data set
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <p>No downstream dependencies configured</p>
            <p className="text-sm">Configure downstream consumers to see data lineage</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
