'use client';

// Nexorium Core - Environments Pillar Layout
// Truth Layer - Environment topology and state

import { PillarNav, PillarNavItem } from '@/components/navigation';
import {
  GitBranch,
  List,
} from 'lucide-react';

const environmentsNavItems: PillarNavItem[] = [
  { name: 'Overview', href: '/dashboard/environments/overview', icon: List },
  { name: 'Flow Map', href: '/dashboard/environments/flow-map', icon: GitBranch },
];

export default function EnvironmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-4 lg:-m-8">
      <PillarNav items={environmentsNavItems} basePath="/dashboard/environments" />
      <div className="p-4 lg:p-8">{children}</div>
    </div>
  );
}
