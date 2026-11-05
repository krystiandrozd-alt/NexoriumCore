'use client';

// Nexorium Core - Environment Ownership Panel
// Display and edit environment ownership information

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Building2,
  Mail,
  Edit2,
  User,
  Clock
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { EnvironmentOwnership } from '@/types';

interface EnvironmentOwnershipPanelProps {
  environmentId: string;
  className?: string;
  onEdit?: () => void;
}

export default function EnvironmentOwnershipPanel({
  environmentId,
  className,
  onEdit,
}: EnvironmentOwnershipPanelProps) {
  const [ownership, setOwnership] = useState<EnvironmentOwnership | null>(null);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const fetchOwnership = async () => {
      try {
        const response = await fetch(`/api/environments/${environmentId}/ownership`);
        const data = await response.json();
        if (data.success) {
          setOwnership(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch ownership:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnership();
  }, [environmentId]);

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ownership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-slate-100 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!ownership) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-slate-400" />
              Ownership
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              Assign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-500 text-sm">
            No ownership assigned
          </div>
        </CardContent>
      </Card>
    );
  }

  const isExpiring = ownership.expiryDate &&
    new Date(ownership.expiryDate) < new Date(now + 30 * 24 * 60 * 60 * 1000);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-indigo-600" />
            Ownership
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Project */}
        <div className="flex items-start gap-3">
          <Building2 className="h-4 w-4 text-slate-400 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900">{ownership.projectName}</div>
            {ownership.projectCode && (
              <div className="text-xs text-slate-500">{ownership.projectCode}</div>
            )}
          </div>
        </div>

        {/* Owner Team */}
        <div className="flex items-start gap-3">
          <Users className="h-4 w-4 text-slate-400 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-700">{ownership.ownerTeam}</div>
            {ownership.ownerEmail && (
              <a
                href={`mailto:${ownership.ownerEmail}`}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                <Mail className="h-3 w-3" />
                {ownership.ownerEmail}
              </a>
            )}
          </div>
        </div>

        {/* Technical Lead */}
        {ownership.technicalLead && (
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-slate-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500">Technical Lead</div>
              <div className="text-sm text-slate-700">{ownership.technicalLead}</div>
            </div>
          </div>
        )}

        {/* Business Unit */}
        {ownership.businessUnit && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Badge variant="secondary">{ownership.businessUnit}</Badge>
            {ownership.costCenter && (
              <span className="text-slate-400">• {ownership.costCenter}</span>
            )}
          </div>
        )}

        {/* Expiry */}
        {ownership.expiryDate && (
          <div className={cn(
            'flex items-center gap-2 pt-2 border-t text-xs',
            isExpiring ? 'text-amber-600' : 'text-slate-500'
          )}>
            <Clock className="h-3.5 w-3.5" />
            {isExpiring ? 'Expiring' : 'Expires'} {formatDate(ownership.expiryDate)}
            {isExpiring && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                Soon
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
