'use client';

// TelEnvIQ - Blueprints Page
// Expected state definitions for environments

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PillarHeader } from '@/components/navigation';
import {
  FileCode,
  Plus,
  Search,
  Loader2,
  CheckCircle,
  Clock,
  Archive,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface Blueprint {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'APPROVED' | 'DEPRECATED';
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: Clock },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  DEPRECATED: { label: 'Deprecated', color: 'bg-amber-100 text-amber-700', icon: Archive },
};

export default function BlueprintsPage() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBlueprints();
  }, []);

  async function fetchBlueprints() {
    try {
      const response = await fetch('/api/governance/blueprints');
      const result = await response.json();
      if (result.success) {
        setBlueprints(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch blueprints:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredBlueprints = blueprints.filter((bp) =>
    bp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        title="Blueprints"
        description="Define expected state configurations for your environments"
        icon={FileCode}
        iconColor="text-indigo-600"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Blueprint
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search blueprints..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Blueprints List */}
      {filteredBlueprints.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileCode className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery ? 'No blueprints match your search' : 'No blueprints yet'}
            </h3>
            <p className="text-slate-500 mb-4">
              {searchQuery ? 'Try a different search term' : 'Create your first blueprint to define expected environment state'}
            </p>
            {!searchQuery && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Blueprint
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBlueprints.map((blueprint) => {
            const status = statusConfig[blueprint.status];
            const StatusIcon = status.icon;

            return (
              <Link key={blueprint.id} href={`/dashboard/governance/blueprints/${blueprint.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <FileCode className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{blueprint.name}</CardTitle>
                          <Badge variant="secondary" className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {blueprint.description && (
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                        {blueprint.description}
                      </p>
                    )}
                    <div className="text-xs text-slate-400">
                      Updated {formatRelativeTime(new Date(blueprint.updatedAt))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
