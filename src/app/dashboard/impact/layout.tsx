'use client';

// Nexorium Core - Impact Pillar Layout
// Risk Layer - Dependency and impact analysis

import { PillarNav, PillarNavItem } from '@/components/navigation';
import {
  GitBranch,
  Target,
  FileSearch,
  Activity,
} from 'lucide-react';

const impactNavItems: PillarNavItem[] = [
  { name: 'Dependency Paths', href: '/dashboard/impact/dependency-paths', icon: GitBranch },
  { name: 'Blast Radius', href: '/dashboard/impact/blast-radius', icon: Target },
  { name: 'Change Detection', href: '/dashboard/impact/change-detection', icon: FileSearch },
  { name: 'Stability', href: '/dashboard/impact/stability', icon: Activity },
];

export default function ImpactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-4 lg:-m-8">
      <PillarNav items={impactNavItems} basePath="/dashboard/impact" />
      <div className="p-4 lg:p-8">{children}</div>
    </div>
  );
}
