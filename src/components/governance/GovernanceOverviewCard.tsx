'use client';

// TelEnvIQ - Governance Overview Card Component
// Summary card for governance dashboard

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface GovernanceOverviewCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  href?: string;
  className?: string;
}

export function GovernanceOverviewCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBgColor = 'bg-indigo-100',
  trend,
  href,
  className = '',
}: GovernanceOverviewCardProps) {
  const CardContent = () => (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <div
              className={`mt-2 inline-flex items-center text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(trend.value)}%</span>
              <span className="ml-1 text-slate-400">vs last week</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`block card-enterprise p-4 hover:border-indigo-300 transition-colors ${className}`}
      >
        <CardContent />
      </Link>
    );
  }

  return (
    <div className={`card-enterprise p-4 ${className}`}>
      <CardContent />
    </div>
  );
}

export default GovernanceOverviewCard;
