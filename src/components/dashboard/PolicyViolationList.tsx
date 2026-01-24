'use client';

// TelEnvIQ - Policy Violation List
// List of policy violations with resolution actions

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Eye,
  ChevronRight
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { PolicyViolation, ViolationSeverity, ViolationStatus } from '@/types';

interface PolicyViolationListProps {
  violations: PolicyViolation[];
  onResolve?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
  onViewDetails?: (violation: PolicyViolation) => void;
  className?: string;
}

const SEVERITY_CONFIG: Record<ViolationSeverity, {
  icon: typeof AlertCircle;
  color: string;
  bg: string;
}> = {
  CRITICAL: { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
  HIGH: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
  MEDIUM: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  LOW: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
};

const STATUS_BADGES: Record<ViolationStatus, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
  OPEN: { variant: 'default', label: 'Open' },
  ACKNOWLEDGED: { variant: 'secondary', label: 'Acknowledged' },
  RESOLVED: { variant: 'outline', label: 'Resolved' },
  SUPPRESSED: { variant: 'outline', label: 'Suppressed' },
};

export default function PolicyViolationList({
  violations,
  onResolve,
  onAcknowledge,
  onViewDetails,
  className,
}: PolicyViolationListProps) {
  const [resolving, setResolving] = useState<string | null>(null);

  const handleResolve = async (id: string) => {
    setResolving(id);
    try {
      await onResolve?.(id);
    } finally {
      setResolving(null);
    }
  };

  if (violations.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <div className="text-sm font-medium text-slate-700">No Violations</div>
            <div className="text-xs text-slate-500 mt-1">
              All policies are passing
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            Policy Violations
          </span>
          <Badge variant="secondary">{violations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {violations.map((violation) => {
            const severityConfig = SEVERITY_CONFIG[violation.severity];
            const Icon = severityConfig.icon;
            const statusBadge = STATUS_BADGES[violation.status];

            return (
              <div
                key={violation.id}
                className={cn(
                  'p-4 hover:bg-slate-50 transition-colors',
                  violation.status === 'OPEN' && severityConfig.bg
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className={cn('h-5 w-5 mt-0.5', severityConfig.color)} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-900">
                        {violation.policyName}
                      </span>
                      <Badge variant={statusBadge.variant} className="text-[10px]">
                        {statusBadge.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {violation.description}
                    </p>

                    {violation.remediationHint && (
                      <p className="text-[10px] text-slate-500 mt-1.5 italic">
                        Hint: {violation.remediationHint}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-slate-400">
                        {formatRelativeTime(violation.detectedAt)}
                      </span>

                      {violation.status === 'OPEN' && (
                        <>
                          {onAcknowledge && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => onAcknowledge(violation.id)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Acknowledge
                            </Button>
                          )}
                          {onResolve && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs text-green-600"
                              onClick={() => handleResolve(violation.id)}
                              disabled={resolving === violation.id}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {onViewDetails && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(violation)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
