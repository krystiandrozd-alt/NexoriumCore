'use client';

// TelEnvIQ - Configuration Pillar Layout
// Control Surface - Connectors, settings, templates

import { PillarNav, PillarNavItem } from '@/components/navigation';
import { Plug, FileJson, GitBranch, Settings } from 'lucide-react';

const configurationNavItems: PillarNavItem[] = [
  { name: 'Connectors', href: '/dashboard/configuration/connectors', icon: Plug },
  { name: 'Integration Rules', href: '/dashboard/configuration/integration-rules', icon: FileJson },
  { name: 'Flow Templates', href: '/dashboard/configuration/flow-templates', icon: GitBranch },
  { name: 'Platform Settings', href: '/dashboard/configuration/platform-settings', icon: Settings },
];

export default function ConfigurationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-4 lg:-m-8">
      <PillarNav items={configurationNavItems} basePath="/dashboard/configuration" />
      <div className="p-4 lg:p-8">{children}</div>
    </div>
  );
}
