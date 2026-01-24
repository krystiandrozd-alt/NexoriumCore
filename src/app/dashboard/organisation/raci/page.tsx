'use client';

// TelEnvIQ - RACI Page
// RACI matrix management

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PillarHeader } from '@/components/navigation';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import {
  ClipboardList,
  Plus,
  Loader2,
  UserCircle,
} from 'lucide-react';

interface RACIMapping {
  id: string;
  personId: string;
  entityType: string;
  entityId: string;
  raciRole: 'RESPONSIBLE' | 'ACCOUNTABLE' | 'CONSULTED' | 'INFORMED';
  person: {
    displayName: string;
    email: string;
  };
}

const roleColors = {
  RESPONSIBLE: 'bg-blue-100 text-blue-700',
  ACCOUNTABLE: 'bg-red-100 text-red-700',
  CONSULTED: 'bg-amber-100 text-amber-700',
  INFORMED: 'bg-green-100 text-green-700',
};

const roleDescriptions = {
  RESPONSIBLE: 'Does the work',
  ACCOUNTABLE: 'Ultimately answerable',
  CONSULTED: 'Provides input',
  INFORMED: 'Kept updated',
};

export default function RACIPage() {
  const { selectedEnvironment } = useEnvironment();
  const [mappings, setMappings] = useState<RACIMapping[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMappings();
  }, [selectedEnvironment]);

  async function fetchMappings() {
    try {
      const params = selectedEnvironment ? `?environmentId=${selectedEnvironment.id}` : '';
      const response = await fetch(`/api/organisation/raci${params}`);
      const result = await response.json();
      if (result.success) {
        setMappings(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch RACI mappings:', error);
    } finally {
      setLoading(false);
    }
  }

  // Group by role
  const mappingsByRole = mappings.reduce((acc, m) => {
    if (!acc[m.raciRole]) {
      acc[m.raciRole] = [];
    }
    acc[m.raciRole].push(m);
    return acc;
  }, {} as Record<string, RACIMapping[]>);

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
        title="RACI Matrix"
        description="Responsible, Accountable, Consulted, Informed assignments"
        icon={ClipboardList}
        iconColor="text-indigo-600"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Assignment
          </Button>
        }
      />

      {selectedEnvironment && (
        <Card>
          <CardHeader>
            <CardTitle>
              RACI for {selectedEnvironment.name}
            </CardTitle>
            <CardDescription>
              Team assignments for the selected environment
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* RACI Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['RESPONSIBLE', 'ACCOUNTABLE', 'CONSULTED', 'INFORMED'] as const).map((role) => (
          <Card key={role}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Badge variant="secondary" className={roleColors[role]}>
                  {role[0]}
                </Badge>
                {role}
              </CardTitle>
              <CardDescription className="text-xs">
                {roleDescriptions[role]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(mappingsByRole[role] || []).length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">
                  No assignments
                </p>
              ) : (
                <div className="space-y-2">
                  {mappingsByRole[role]?.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
                    >
                      <UserCircle className="h-5 w-5 text-slate-400" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {mapping.person.displayName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {mapping.person.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
