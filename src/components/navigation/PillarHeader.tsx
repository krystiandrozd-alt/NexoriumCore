'use client';

// Nexorium Core - Pillar Header Component
// Header for pillar pages with title, description, and actions

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PillarHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PillarHeader({
  title,
  description,
  icon: Icon,
  iconColor = 'text-indigo-600',
  actions,
  children,
}: PillarHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100',
                iconColor
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
