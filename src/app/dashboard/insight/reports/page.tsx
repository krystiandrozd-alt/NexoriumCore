'use client';

// TelEnvIQ - Reports Page
// Available reports and report generation

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PillarHeader } from '@/components/navigation';
import {
  FileText,
  Activity,
  GitCompare,
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  Database,
  ChevronRight,
} from 'lucide-react';

const reports = [
  {
    name: 'Environment Health',
    description: 'Comprehensive health status for all environments',
    icon: Activity,
    color: 'bg-green-100 text-green-600',
    href: '/dashboard/insight/reports/environment-health',
  },
  {
    name: 'Drift Analysis',
    description: 'Detect and analyze configuration drift across environments',
    icon: GitCompare,
    color: 'bg-amber-100 text-amber-600',
    href: '/dashboard/insight/reports/drift',
  },
  {
    name: 'Cost Analysis',
    description: 'Environment cost breakdown and trends',
    icon: DollarSign,
    color: 'bg-emerald-100 text-emerald-600',
    href: '/dashboard/insight/reports/cost-analysis',
  },
  {
    name: 'Release Compliance',
    description: 'Track release alignment across environments',
    icon: Package,
    color: 'bg-purple-100 text-purple-600',
    href: '/dashboard/insight/reports/release-compliance',
  },
  {
    name: 'Flow Health',
    description: 'Pipeline flow health and bottleneck analysis',
    icon: TrendingUp,
    color: 'bg-blue-100 text-blue-600',
    href: '/dashboard/insight/reports/flow-health',
  },
  {
    name: 'Stability Risk',
    description: 'Identify stability risks and vulnerable components',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-600',
    href: '/dashboard/insight/reports/stability-risk',
  },
  {
    name: 'Dependency Criticality',
    description: 'Rank components by dependency criticality',
    icon: GitCompare,
    color: 'bg-indigo-100 text-indigo-600',
    href: '/dashboard/insight/reports/dependency-criticality',
  },
  {
    name: 'Test Data Integrity',
    description: 'Validate test data freshness and compliance',
    icon: Database,
    color: 'bg-cyan-100 text-cyan-600',
    href: '/dashboard/insight/reports/test-data-integrity',
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PillarHeader
        title="Reports"
        description="Generate and view detailed analysis reports"
        icon={FileText}
        iconColor="text-indigo-600"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${report.color}`}>
                      <report.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{report.name}</CardTitle>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{report.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
