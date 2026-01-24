'use client';

// TelEnvIQ - Organisation Pillar Layout
// Accountability Layer - People, RACI, ownership

import { PillarNav, PillarNavItem } from '@/components/navigation';
import { Users, ClipboardList, UserCheck, AlertCircle } from 'lucide-react';

const organisationNavItems: PillarNavItem[] = [
  { name: 'People', href: '/dashboard/organisation/people', icon: Users },
  { name: 'RACI', href: '/dashboard/organisation/raci', icon: ClipboardList },
  { name: 'Ownership', href: '/dashboard/organisation/ownership', icon: UserCheck },
  { name: 'Orphaned Assets', href: '/dashboard/organisation/orphaned-assets', icon: AlertCircle },
];

export default function OrganisationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-4 lg:-m-8">
      <PillarNav items={organisationNavItems} basePath="/dashboard/organisation" />
      <div className="p-4 lg:p-8">{children}</div>
    </div>
  );
}
