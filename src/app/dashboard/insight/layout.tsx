'use client';

// Nexorium Core - Insight Pillar Layout
// Reporting Layer - Dashboards and reports

import { PillarNav, PillarNavItem } from '@/components/navigation';
import { LayoutDashboard, FileText } from 'lucide-react';

const insightNavItems: PillarNavItem[] = [
  { name: 'Dashboard', href: '/dashboard/insight/dashboard', icon: LayoutDashboard },
  { name: 'Reports', href: '/dashboard/insight/reports', icon: FileText },
];

export default function InsightLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-4 lg:-m-8">
      <PillarNav items={insightNavItems} basePath="/dashboard/insight" />
      <div className="p-4 lg:p-8">{children}</div>
    </div>
  );
}
