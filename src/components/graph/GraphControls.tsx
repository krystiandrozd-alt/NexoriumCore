'use client';

// Nexorium Core - Graph Controls Component
// Filter and display options for topology graph with enterprise features

import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X, ShieldAlert } from 'lucide-react';
import type { GraphFilters, NodeType, Protocol, ViewMode, TelcoLayer, DataClassification } from '@/types';

interface GraphControlsProps {
  filters: GraphFilters;
  onFilterChange: (filters: GraphFilters) => void;
  owners?: string[];
  viewMode?: ViewMode;
}

const nodeTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'APPLICATION', label: 'Application' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'DATABASE', label: 'Database' },
  { value: 'GATEWAY', label: 'Gateway' },
  { value: 'EXTERNAL', label: 'External' },
  { value: 'RUNTIME', label: 'Runtime' },
  { value: 'MESSAGE_QUEUE', label: 'Message Queue' },
  { value: 'LOAD_BALANCER', label: 'Load Balancer' },
];

const protocolOptions = [
  { value: '', label: 'All Protocols' },
  { value: 'REST', label: 'REST API' },
  { value: 'GRPC', label: 'gRPC' },
  { value: 'MQ', label: 'Message Queue' },
  { value: 'JDBC', label: 'JDBC' },
  { value: 'SFTP', label: 'SFTP' },
  { value: 'EVENT', label: 'Event' },
  { value: 'WEBSOCKET', label: 'WebSocket' },
  { value: 'SOAP', label: 'SOAP' },
  { value: 'GRAPHQL', label: 'GraphQL' },
];

const confidenceOptions = [
  { value: '0', label: 'All Confidence' },
  { value: '0.5', label: '50%+' },
  { value: '0.7', label: '70%+' },
  { value: '0.9', label: '90%+' },
];

const telcoLayerOptions = [
  { value: '', label: 'All Layers' },
  { value: 'BSS', label: 'BSS' },
  { value: 'OSS', label: 'OSS' },
  { value: 'NETWORK', label: 'Network' },
  { value: 'SHARED', label: 'Shared' },
  { value: 'EXTERNAL', label: 'External' },
];

const dataClassificationOptions = [
  { value: '', label: 'All Classifications' },
  { value: 'PII', label: 'PII' },
  { value: 'PCI', label: 'PCI' },
  { value: 'CONFIDENTIAL', label: 'Confidential' },
  { value: 'NON_SENSITIVE', label: 'Non-Sensitive' },
];

export default function GraphControls({
  filters,
  onFilterChange,
  owners = [],
  viewMode = 'default',
}: GraphControlsProps) {
  const hasActiveFilters = !!(
    filters.nodeType ||
    filters.protocol ||
    filters.owner ||
    (filters.minConfidence && filters.minConfidence > 0) ||
    !filters.showStale ||
    filters.telcoLayer ||
    filters.dataClassification ||
    filters.showPolicyViolations
  );

  const handleClearFilters = () => {
    onFilterChange({
      showStale: true,
      minConfidence: 0,
      stalenessThreshold: 30,
      showPolicyViolations: undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filters</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          options={nodeTypeOptions}
          value={filters.nodeType || ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              nodeType: (e.target.value as NodeType) || undefined,
            })
          }
          className="w-36 h-8 text-xs"
        />

        <Select
          options={protocolOptions}
          value={filters.protocol || ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              protocol: (e.target.value as Protocol) || undefined,
            })
          }
          className="w-36 h-8 text-xs"
        />

        {owners.length > 0 && (
          <Select
            options={[
              { value: '', label: 'All Owners' },
              ...owners.map((o) => ({ value: o, label: o })),
            ]}
            value={filters.owner || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                owner: e.target.value || undefined,
              })
            }
            className="w-36 h-8 text-xs"
          />
        )}

        <Select
          options={confidenceOptions}
          value={String(filters.minConfidence || 0)}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              minConfidence: parseFloat(e.target.value),
            })
          }
          className="w-32 h-8 text-xs"
        />

        <Button
          variant={filters.showStale ? 'outline' : 'secondary'}
          size="sm"
          onClick={() =>
            onFilterChange({
              ...filters,
              showStale: !filters.showStale,
            })
          }
          className="h-8 text-xs"
        >
          {filters.showStale ? 'Hide Stale' : 'Show Stale'}
        </Button>

        <Button
          variant={filters.showPolicyViolations ? 'destructive' : 'outline'}
          size="sm"
          onClick={() =>
            onFilterChange({
              ...filters,
              showPolicyViolations: !filters.showPolicyViolations,
            })
          }
          className="h-8 text-xs"
        >
          <ShieldAlert className="h-3 w-3 mr-1" />
          {filters.showPolicyViolations ? 'Violations Only' : 'Show Violations'}
        </Button>
      </div>

      {/* Context-specific filters based on view mode */}
      {viewMode === 'telco-layer' && (
        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-100">
          <Select
            options={telcoLayerOptions}
            value={filters.telcoLayer || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                telcoLayer: (e.target.value as TelcoLayer) || undefined,
              })
            }
            className="w-36 h-8 text-xs"
          />
        </div>
      )}

      {/* Data classification filter for governance */}
      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-100">
        <Select
          options={dataClassificationOptions}
          value={filters.dataClassification || ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              dataClassification: (e.target.value as DataClassification) || undefined,
            })
          }
          className="w-40 h-8 text-xs"
        />
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-100">
          {filters.nodeType && (
            <Badge variant="secondary" className="text-[10px]">
              Type: {filters.nodeType}
            </Badge>
          )}
          {filters.protocol && (
            <Badge variant="secondary" className="text-[10px]">
              Protocol: {filters.protocol}
            </Badge>
          )}
          {filters.owner && (
            <Badge variant="secondary" className="text-[10px]">
              Owner: {filters.owner}
            </Badge>
          )}
          {filters.minConfidence && filters.minConfidence > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              Confidence: {filters.minConfidence * 100}%+
            </Badge>
          )}
          {!filters.showStale && (
            <Badge variant="secondary" className="text-[10px]">
              Hiding stale
            </Badge>
          )}
          {filters.showPolicyViolations && (
            <Badge variant="destructive" className="text-[10px]">
              Violations only
            </Badge>
          )}
          {filters.telcoLayer && (
            <Badge variant="secondary" className="text-[10px]">
              Layer: {filters.telcoLayer}
            </Badge>
          )}
          {filters.dataClassification && (
            <Badge variant="secondary" className="text-[10px]">
              Classification: {filters.dataClassification}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
