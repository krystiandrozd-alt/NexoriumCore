'use client';

// TelEnvIQ - Environments List Page

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Network,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import type { Environment } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface EnvironmentWithCounts extends Environment {
  _count?: {
    nodes: number;
    edges: number;
  };
}

export default function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<EnvironmentWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchEnvironments();
  }, []);

  async function fetchEnvironments() {
    setLoading(true);
    try {
      const response = await fetch('/api/environments');
      const result = await response.json();
      if (result.success) {
        setEnvironments(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch environments:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEnvironments = environments.filter((env) => {
    const matchesSearch = env.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || env.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeColors: Record<string, string> = {
    DEV: 'bg-slate-100 text-slate-800',
    SIT: 'bg-blue-100 text-blue-800',
    UAT: 'bg-purple-100 text-purple-800',
    NFT: 'bg-amber-100 text-amber-800',
    PREPROD: 'bg-emerald-100 text-emerald-800',
    PROD_RO: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Environments</h1>
          <p className="text-slate-500 mt-1">
            Manage and explore your test environment topologies
          </p>
        </div>
        <Link href="/dashboard/environments/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Environment
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search environments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={[
                { value: '', label: 'All Types' },
                { value: 'DEV', label: 'Development' },
                { value: 'SIT', label: 'SIT' },
                { value: 'UAT', label: 'UAT' },
                { value: 'NFT', label: 'NFT' },
                { value: 'PREPROD', label: 'Pre-Production' },
                { value: 'PROD_RO', label: 'Production (Read-Only)' },
              ]}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-48"
            />
            <Button variant="outline" onClick={fetchEnvironments}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Environments Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : filteredEnvironments.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Network className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchQuery || typeFilter
                  ? 'No environments match your filters'
                  : 'No environments yet'}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchQuery || typeFilter
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first environment to start mapping your topology'}
              </p>
              {!searchQuery && !typeFilter && (
                <Link href="/dashboard/environments/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Environment
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnvironments.map((env) => (
            <Card key={env.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                      <Network className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{env.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className={`mt-1 ${typeColors[env.type]}`}
                      >
                        {env.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative group">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <Link
                        href={`/dashboard/environments/${env.id}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Link>
                      <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full">
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {env.description && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {env.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-4">
                    <span className="text-slate-600">
                      <span className="font-medium">{env._count?.nodes || 0}</span>{' '}
                      nodes
                    </span>
                    <span className="text-slate-600">
                      <span className="font-medium">{env._count?.edges || 0}</span>{' '}
                      edges
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    Updated {formatRelativeTime(env.updatedAt)}
                  </p>
                </div>
                <Link
                  href={`/dashboard/environments/${env.id}`}
                  className="mt-4 block"
                >
                  <Button variant="outline" className="w-full">
                    View Topology
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
