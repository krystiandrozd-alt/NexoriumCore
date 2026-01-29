'use client';

// Nexorium Core - Integration Rules Page
// Field mapping and transformation rules

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PillarHeader } from '@/components/navigation';
import { FileJson, Plus } from 'lucide-react';

export default function IntegrationRulesPage() {
  return (
    <div className="space-y-6">
      <PillarHeader
        title="Integration Rules"
        description="Configure field mapping and transformation rules for connectors"
        icon={FileJson}
        iconColor="text-indigo-600"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        }
      />

      <Card>
        <CardContent className="py-16 text-center">
          <FileJson className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Integration Rules
          </h3>
          <p className="text-slate-500 mb-4">
            Define field mappings, transformations, and filters for data ingestion
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create First Rule
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
