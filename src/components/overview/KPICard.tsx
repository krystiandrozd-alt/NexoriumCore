'use client';

// Nexorium Core - KPI Card Component
// Premium glass morphism card with animated counter

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  Layers,
  Server,
  ShieldCheck,
  AlertTriangle,
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react';

export interface KPICardProps {
  label: string;
  value: number;
  icon: 'environments' | 'systems' | 'governance' | 'violations' | 'readiness' | 'cost';
  color: 'indigo' | 'blue' | 'emerald' | 'rose' | 'violet' | 'amber';
  format?: 'number' | 'percent' | 'currency';
  currency?: string;
  trend?: number; // percentage change
  isLoading?: boolean;
}

const iconMap: Record<KPICardProps['icon'], LucideIcon> = {
  environments: Layers,
  systems: Server,
  governance: ShieldCheck,
  violations: AlertTriangle,
  readiness: Activity,
  cost: DollarSign,
};

const colorMap = {
  indigo: {
    bg: 'bg-indigo-500/20',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    glow: 'shadow-indigo-500/20',
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
  },
  rose: {
    bg: 'bg-rose-500/20',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/20',
  },
  violet: {
    bg: 'bg-violet-500/20',
    text: 'text-violet-400',
    border: 'border-violet-500/30',
    glow: 'shadow-violet-500/20',
  },
  amber: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
  },
};

function useAnimatedCounter(value: number, duration = 1000): number {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    startTimeRef.current = performance.now();
    startValueRef.current = displayValue;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) return;

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-expo)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const newValue = startValueRef.current + (value - startValueRef.current) * eased;
      setDisplayValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return displayValue;
}

function formatValue(
  value: number,
  format: KPICardProps['format'],
  currency?: string
): string {
  switch (format) {
    case 'percent':
      return `${Math.round(value)}%`;
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    default:
      return Math.round(value).toLocaleString();
  }
}

export function KPICard({
  label,
  value,
  icon,
  color,
  format = 'number',
  currency,
  trend,
  isLoading = false,
}: KPICardProps) {
  const Icon = iconMap[icon];
  const colors = colorMap[color];
  const animatedValue = useAnimatedCounter(isLoading ? 0 : value);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl',
        'bg-white/5 backdrop-blur-sm',
        'border border-white/10',
        'hover:border-white/20 hover:bg-white/[0.07]',
        'transition-all duration-300',
        'hover:translate-y-[-2px]',
        'hover:shadow-lg hover:shadow-black/20'
      )}
    >
      {/* Subtle gradient glow on hover */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100',
          'bg-gradient-to-br from-transparent via-transparent to-white/5',
          'transition-opacity duration-300'
        )}
      />

      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Value */}
            <div className="mb-1">
              {isLoading ? (
                <div className="h-9 w-24 bg-white/10 rounded animate-pulse" />
              ) : (
                <span className="text-3xl font-bold text-white tracking-tight">
                  {formatValue(animatedValue, format, currency)}
                </span>
              )}
            </div>

            {/* Label */}
            <p className="text-sm text-slate-400 font-medium truncate">
              {label}
            </p>

            {/* Trend indicator */}
            {typeof trend === 'number' && !isLoading && (
              <div className="flex items-center gap-1 mt-2">
                {trend >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                )}
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  )}
                >
                  {trend >= 0 ? '+' : ''}
                  {trend.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500">vs last period</span>
              </div>
            )}
          </div>

          {/* Icon */}
          <div
            className={cn(
              'flex items-center justify-center',
              'w-11 h-11 rounded-xl',
              colors.bg,
              colors.border,
              'border',
              'transition-transform duration-300',
              'group-hover:scale-110'
            )}
          >
            <Icon className={cn('h-5 w-5', colors.text)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-9 w-24 bg-white/10 rounded animate-pulse mb-1" />
          <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="w-11 h-11 rounded-xl bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}
