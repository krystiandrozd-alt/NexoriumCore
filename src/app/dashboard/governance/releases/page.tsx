'use client';

// TelEnvIQ - Releases Page
// Target groupings for deployment

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PillarHeader } from '@/components/navigation';
import {
  Package,
  Plus,
  Search,
  Loader2,
  Clock,
  PlayCircle,
  CheckCircle,
  Rocket,
  XCircle,
} from 'lucide-react';

interface Release {
  id: string;
  name: string;
  version: string;
  description?: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'READY' | 'DEPLOYED' | 'CANCELLED';
  targetDate?: string;
  deployedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
}

const statusConfig = {
  PLANNING: { label: 'Planning', color: 'bg-slate-100 text-slate-700', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: PlayCircle },
  READY: { label: 'Ready', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  DEPLOYED: { label: 'Deployed', color: 'bg-emerald-100 text-emerald-700', icon: Rocket },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReleases();
  }, []);

  async function fetchReleases() {
    try {
      const response = await fetch('/api/governance/releases');
      const result = await response.json();
      if (result.success) {
        setReleases(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch releases:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredReleases = releases.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.version.toLowerCase().includes(searchQuery.toLowerCase())
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
        title="Releases"
        description="Manage release groupings and deployment targets"
        icon={Package}
        iconColor="text-indigo-600"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Release
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search releases..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Releases List */}
      {filteredReleases.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery ? 'No releases match your search' : 'No releases yet'}
            </h3>
            <p className="text-slate-500 mb-4">
              {searchQuery ? 'Try a different search term' : 'Create your first release to group components for deployment'}
            </p>
            {!searchQuery && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Release
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReleases.map((release) => {
            const status = statusConfig[release.status];
            const StatusIcon = status.icon;

            return (
              <Link key={release.id} href={`/dashboard/governance/releases/${release.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{release.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                              v{release.version}
                            </code>
                            <Badge variant="secondary" className={status.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {release.description && (
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                        {release.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{release._count?.items || 0} items</span>
                      {release.targetDate && (
                        <span>Target: {new Date(release.targetDate).toLocaleDateString()}</span>
                      )}
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
