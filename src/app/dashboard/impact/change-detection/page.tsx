'use client';

// Nexorium Core - Change Detection Page
// Track changes across snapshots

import { Card, CardContent } from '@/components/ui/card';
import { PillarHeader } from '@/components/navigation';
import { FileSearch } from 'lucide-react';

export default function ChangeDetectionPage() {
  return (
    <div className="space-y-6">
      <PillarHeader
        title="Change Detection"
        description="Track and analyze changes between environment snapshots"
        icon={FileSearch}
        iconColor="text-indigo-600"
      />

      <Card>
        <CardContent className="py-16 text-center">
          <FileSearch className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Change Detection
          </h3>
          <p className="text-slate-500">
            Select two snapshots to compare and detect changes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
