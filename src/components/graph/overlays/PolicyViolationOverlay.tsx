'use client';

// TelEnvIQ - Policy Violation Overlay Component
// Visual indicators for policy violations on nodes

import { memo } from 'react';
import { AlertTriangle, ShieldAlert, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViolationSeverity } from '@/types';

interface PolicyViolationOverlayProps {
  severity: ViolationSeverity;
  count: number;
  className?: string;
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    icon: ShieldAlert,
    color: 'bg-red-500',
    pulseColor: 'bg-red-400',
    textColor: 'text-red-500',
  },
  HIGH: {
    icon: AlertTriangle,
    color: 'bg-orange-500',
    pulseColor: 'bg-orange-400',
    textColor: 'text-orange-500',
  },
  MEDIUM: {
    icon: AlertCircle,
    color: 'bg-yellow-500',
    pulseColor: 'bg-yellow-400',
    textColor: 'text-yellow-600',
  },
  LOW: {
    icon: AlertCircle,
    color: 'bg-blue-500',
    pulseColor: 'bg-blue-400',
    textColor: 'text-blue-500',
  },
};

function PolicyViolationOverlay({
  severity,
  count,
  className,
}: PolicyViolationOverlayProps) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  return (
    <div className={cn('absolute -top-2 -right-2 z-10', className)}>
      {/* Animated pulse ring for critical/high severity */}
      {(severity === 'CRITICAL' || severity === 'HIGH') && (
        <span className={cn(
          'absolute inset-0 rounded-full animate-ping opacity-75',
          config.pulseColor
        )} />
      )}

      {/* Main badge */}
      <div
        className={cn(
          'relative flex items-center justify-center h-5 w-5 rounded-full text-white shadow-sm',
          config.color
        )}
      >
        <Icon className="h-3 w-3" />
      </div>

      {/* Count badge if more than 1 */}
      {count > 1 && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-slate-900 text-[8px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
  );
}

// Ring variant for node border highlighting
interface ViolationRingProps {
  severity: ViolationSeverity;
  className?: string;
}

export function ViolationRing({ severity, className }: ViolationRingProps) {
  const ringColors = {
    CRITICAL: 'ring-red-500',
    HIGH: 'ring-orange-500',
    MEDIUM: 'ring-yellow-500',
    LOW: 'ring-blue-400',
  };

  return (
    <div
      className={cn(
        'absolute inset-0 rounded-lg ring-2 animate-pulse pointer-events-none',
        ringColors[severity],
        className
      )}
    />
  );
}

export default memo(PolicyViolationOverlay);
