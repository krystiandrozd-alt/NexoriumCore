'use client';

// Nexorium Core - Quick Navigation Component
// 2x3 grid of navigation shortcuts to pillar sections

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Network,
  GitBranch,
  ShieldCheck,
  DollarSign,
  Users,
  Settings,
} from 'lucide-react';
import { QuickNavigationSkeleton } from './SkeletonStates';

interface QuickNavItem {
  title: string;
  description: string;
  href: string;
  icon: typeof Network;
  color: string;
  bgColor: string;
}

const navItems: QuickNavItem[] = [
  {
    title: 'Flow Map',
    description: 'Visualize environment flow and promotion paths',
    href: '/dashboard/environments/flow-map',
    icon: GitBranch,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
  },
  {
    title: 'Environment Graph',
    description: 'Explore component topology and connections',
    href: '/dashboard/environments',
    icon: Network,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  {
    title: 'Governance',
    description: 'Blueprints, releases, and alignment rules',
    href: '/dashboard/governance',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
  {
    title: 'Cost Analysis',
    description: 'Environment cost models and projections',
    href: '/dashboard/cost',
    icon: DollarSign,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  {
    title: 'Organisation',
    description: 'Ownership and RACI assignments',
    href: '/dashboard/organisation',
    icon: Users,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  {
    title: 'Configuration',
    description: 'Connectors and platform settings',
    href: '/dashboard/configuration',
    icon: Settings,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
  },
];

interface QuickNavigationProps {
  isLoading?: boolean;
}

function NavCard({ item, index }: { item: QuickNavItem; index: number }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'group flex items-start gap-3 p-3 rounded-xl',
        'bg-white/5 border border-white/10',
        'hover:bg-white/[0.07] hover:border-white/20',
        'transition-all duration-300',
        'hover:translate-y-[-2px]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
        'animate-fade-in-up'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
          item.bgColor,
          'transition-transform duration-300',
          'group-hover:scale-110'
        )}
      >
        <Icon className={cn('h-5 w-5', item.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white mb-0.5 group-hover:text-violet-300 transition-colors">
          {item.title}
        </h4>
        <p className="text-xs text-slate-400 line-clamp-2">
          {item.description}
        </p>
      </div>
    </Link>
  );
}

export function QuickNavigation({ isLoading = false }: QuickNavigationProps) {
  if (isLoading) {
    return <QuickNavigationSkeleton />;
  }

  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
      <h3 className="text-sm font-semibold text-white mb-4">
        Quick Navigation
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {navItems.map((item, index) => (
          <NavCard key={item.title} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
