'use client';

// Nexorium Core - Pillar Navigation Component
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
    <nav className="border-b border-slate-200/60 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40 shadow-sm">
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
                'relative flex items-center gap-2 whitespace-nowrap px-4 py-3.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-indigo-600'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              )}
            >
              {item.icon && (
                <item.icon
                  className={cn(
                    'h-4 w-4 transition-colors duration-200',
                    isActive ? 'text-indigo-500' : 'text-slate-400'
                  )}
                />
              )}
              {item.name}
              {item.badge !== undefined && (
                <span
                  className={cn(
                    'ml-1.5 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors duration-200',
                    isActive
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-sm shadow-indigo-500/30" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
