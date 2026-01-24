'use client';

// TelEnvIQ - Pillar Navigation Component
// Horizontal sub-navigation within each pillar

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface PillarNavItem {
  name: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
}

interface PillarNavProps {
  items: PillarNavItem[];
  basePath: string;
}

export function PillarNav({ items, basePath }: PillarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="flex gap-1 overflow-x-auto px-4 lg:px-8">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== basePath && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.name}
              {item.badge !== undefined && (
                <span
                  className={cn(
                    'ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium',
                    isActive
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
