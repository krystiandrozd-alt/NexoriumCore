'use client';

// TelEnvIQ - Dashboard Layout
// 6-Pillar Enterprise Structure

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Network,
  ShieldCheck,
  Zap,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  ChevronRight,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnvironmentSwitcher } from '@/components/navigation/EnvironmentSwitcher';
import { EnvironmentProvider } from '@/contexts/EnvironmentContext';

// Overview + 6-Pillar Navigation Structure
const navigation = [
  {
    name: 'Overview',
    href: '/dashboard/overview',
    icon: LayoutDashboard,
    description: 'Dashboard Home',
  },
  {
    name: 'Environments',
    href: '/dashboard/environments',
    icon: Network,
    description: 'Truth Layer',
  },
  {
    name: 'Governance',
    href: '/dashboard/governance',
    icon: ShieldCheck,
    description: 'Alignment Layer',
  },
  {
    name: 'Impact',
    href: '/dashboard/impact',
    icon: Zap,
    description: 'Risk Layer',
  },
  {
    name: 'Insight',
    href: '/dashboard/insight',
    icon: BarChart3,
    description: 'Reporting Layer',
  },
  {
    name: 'Organisation',
    href: '/dashboard/organisation',
    icon: Users,
    description: 'Accountability Layer',
  },
  {
    name: 'Configuration',
    href: '/dashboard/configuration',
    icon: Settings,
    description: 'Control Surface',
  },
];

// Get breadcrumb label from pathname
function getBreadcrumbLabel(pathname: string): string {
  if (pathname.includes('/overview')) return 'Overview';
  if (pathname.includes('/environments')) return 'Environments';
  if (pathname.includes('/governance')) return 'Governance';
  if (pathname.includes('/impact')) return 'Impact';
  if (pathname.includes('/insight')) return 'Insight';
  if (pathname.includes('/organisation')) return 'Organisation';
  if (pathname.includes('/configuration')) return 'Configuration';
  return '';
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">TE</span>
            </div>
            <span className="text-lg font-semibold text-slate-900">
              Tel<span className="text-indigo-600">EnvIQ</span>
            </span>
          </Link>
          <button
            className="lg:hidden p-2 rounded-md hover:bg-slate-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-8">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5 text-slate-500" />
          </button>

          {/* Breadcrumb placeholder */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/dashboard" className="hover:text-slate-700">
              Dashboard
            </Link>
            {pathname !== '/dashboard' && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-700">
                  {pathname.includes('/environments')
                    ? 'Environments'
                    : pathname.includes('/data-intelligence')
                    ? 'Data Intelligence'
                    : pathname.includes('/data-governance')
                    ? 'Data Governance'
                    : pathname.includes('/cost')
                    ? 'Cost & Budget'
                    : pathname.includes('/connectors')
                    ? 'Connectors'
                    : pathname.includes('/activity')
                    ? 'Activity'
                    : ''}
                </span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Create Snapshot
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
