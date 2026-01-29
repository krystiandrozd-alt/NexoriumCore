'use client';

// Nexorium Core - Ownership Page
// Asset ownership views

import { Card, CardContent } from '@/components/ui/card';
import { PillarHeader } from '@/components/navigation';
import { UserCheck } from 'lucide-react';

export default function OwnershipPage() {
  return (
    <div className="space-y-6">
      <PillarHeader
        title="Ownership"
        description="View and manage asset ownership across environments"
        icon={UserCheck}
        iconColor="text-indigo-600"
      />

      <Card>
        <CardContent className="py-16 text-center">
          <UserCheck className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Ownership Overview
          </h3>
          <p className="text-slate-500">
            View ownership assignments across environments and components
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
