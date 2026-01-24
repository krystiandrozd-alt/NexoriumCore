'use client';

// TelEnvIQ - Flow Templates Page
// Pipeline flow template management

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PillarHeader } from '@/components/navigation';
import {
  GitBranch,
  Plus,
  Loader2,
  CheckCircle,
  Clock,
  Archive,
  ArrowRight,
} from 'lucide-react';

interface FlowTemplate {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'DEPRECATED';
  isDefault: boolean;
  stages: Array<{
    stageId: string;
    sortOrder: number;
    stage: {
      key: string;
      name: string;
      color?: string;
    };
  }>;
}

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: Clock },
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  DEPRECATED: { label: 'Deprecated', color: 'bg-amber-100 text-amber-700', icon: Archive },
};

export default function FlowTemplatesPage() {
  const [templates, setTemplates] = useState<FlowTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const response = await fetch('/api/flow-templates');
      const result = await response.json();
      if (result.success) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
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
        title="Flow Templates"
        description="Define allowed environment promotion patterns"
        icon={GitBranch}
        iconColor="text-indigo-600"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        }
      />

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <GitBranch className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No Flow Templates
            </h3>
            <p className="text-slate-500 mb-4">
              Create templates to define allowed environment promotion paths
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => {
            const status = statusConfig[template.status];
            const StatusIcon = status.icon;
            const sortedStages = [...template.stages].sort((a, b) => a.sortOrder - b.sortOrder);

            return (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.isDefault && (
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {template.description && (
                    <p className="text-sm text-slate-500 mb-4">{template.description}</p>
                  )}
                  {/* Stage Flow Visualization */}
                  <div className="flex items-center gap-2 overflow-x-auto py-2">
                    {sortedStages.map((stage, index) => (
                      <div key={stage.stageId} className="flex items-center gap-2">
                        <div
                          className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap"
                          style={{
                            backgroundColor: stage.stage.color ? `${stage.stage.color}20` : '#e2e8f0',
                            color: stage.stage.color || '#475569',
                          }}
                        >
                          {stage.stage.name}
                        </div>
                        {index < sortedStages.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        )}
                      </div>
                    ))}
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
