'use client';

// TelEnvIQ - Governance Pillar Layout
// Alignment Layer - Blueprints, releases, governance controls, compliance

import { useEffect, useState } from 'react';
import { PillarNav, PillarNavItem } from '@/components/navigation';
import {
  LayoutDashboard,
  FileCode,
  Package,
  GitCompare,
  Shield,
  CheckSquare,
  ClipboardCheck,
  AlertCircle,
  Link2,
  Rocket,
} from 'lucide-react';

export default function GovernanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pendingCount, setPendingCount] = useState<number | undefined>(undefined);

  // Fetch pending approvals count for badge
  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const response = await fetch('/api/governance/approvals/pending?includeStats=true');
        if (response.ok) {
          const data = await response.json();
          setPendingCount(data.data?.stats?.pending || 0);
        }
      } catch (error) {
        console.error('Error fetching pending approvals count:', error);
      }
    }
    fetchPendingCount();
  }, []);

  const governanceNavItems: PillarNavItem[] = [
    { name: 'Overview', href: '/dashboard/governance', icon: LayoutDashboard },
    { name: 'Blueprints', href: '/dashboard/governance/blueprints', icon: FileCode },
    { name: 'Releases', href: '/dashboard/governance/releases', icon: Package },
    { name: 'Alignment', href: '/dashboard/governance/alignment', icon: GitCompare },
    { name: 'Controls', href: '/dashboard/governance/controls', icon: Shield },
    { name: 'Compliance', href: '/dashboard/governance/compliance', icon: CheckSquare },
    {
      name: 'Approvals',
      href: '/dashboard/governance/approvals',
      icon: ClipboardCheck,
      badge: pendingCount && pendingCount > 0 ? pendingCount : undefined,
    },
    { name: 'Exceptions', href: '/dashboard/governance/exceptions', icon: AlertCircle },
    { name: 'Coupling', href: '/dashboard/governance/coupling', icon: Link2 },
    { name: 'Readiness', href: '/dashboard/governance/readiness', icon: Rocket },
  ];

  return (
    <div className="-m-4 lg:-m-8">
      <PillarNav items={governanceNavItems} basePath="/dashboard/governance" />
      <div className="p-4 lg:p-8">{children}</div>
    </div>
  );
}
