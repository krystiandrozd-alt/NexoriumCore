'use client';

// Nexorium Core - Alignment Page
// Environment alignment comparisons

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PillarHeader } from '@/components/navigation';
import {
  GitCompare,
  FileCode,
  Package,
  Layers,
  Server,
  ChevronRight,
} from 'lucide-react';

const alignmentTypes = [
  {
    name: 'Blueprint vs Snapshot',
    description: 'Compare environment state against blueprint expectations',
    href: '/dashboard/governance/alignment/blueprint-vs-snapshot',
    icon: FileCode,
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    name: 'Snapshot vs Release',
    description: 'Verify environment alignment with release targets',
    href: '/dashboard/governance/alignment/snapshot-vs-release',
    icon: Package,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    name: 'Cross-Environment',
    description: 'Compare configurations between different environments',
    href: '/dashboard/governance/alignment/cross-environment',
    icon: Layers,
    color: 'bg-cyan-100 text-cyan-600',
  },
  {
    name: 'Non-Prod vs Production',
    description: 'Detect drift between non-production and production',
    href: '/dashboard/governance/alignment/nonprod-vs-prod',
    icon: Server,
    color: 'bg-amber-100 text-amber-600',
  },
];

export default function AlignmentPage() {
  return (
    <div className="space-y-6">
      <PillarHeader
        title="Alignment"
        description="Compare and validate environment configurations"
        icon={GitCompare}
        iconColor="text-indigo-600"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alignmentTypes.map((type) => (
          <Link key={type.href} href={type.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${type.color}`}>
                      <type.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
