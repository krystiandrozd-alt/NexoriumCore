'use client';

// Nexorium Core - Dashboard Layout
// Premium Dark Theme with 6-Pillar Enterprise Structure
// Desktop sidebar is collapsible for more canvas space

import Link from 'next/link';
import { useState } from 'react';
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
  Hexagon,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { EnvironmentSwitcher } from '@/components/navigation/EnvironmentSwitcher';
import { EnvironmentProvider } from '@/contexts/EnvironmentContext';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { ProjectEnvironmentProvider } from '@/contexts/ProjectEnvironmentContext';

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EnvironmentProvider>
      <SidebarProvider>
        <ProjectEnvironmentProvider>
          <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </ProjectEnvironmentProvider>
      </SidebarProvider>
    </EnvironmentProvider>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isCollapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();

  return (
        <div className="min-h-screen bg-[#0B1220] relative">
          {/* Background gradient mesh */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#5B5FEF]/[0.06] rounded-full blur-[150px]" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#7C3AED]/[0.04] rounded-full blur-[150px]" />
          </div>

          {/* Mobile sidebar backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

        {/* Sidebar - collapsible on desktop */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-out',
            'bg-[#0F1729]/95 backdrop-blur-xl border-r border-white/[0.06]',
            // Desktop: collapsed = narrow, expanded = full
            isCollapsed ? 'lg:w-16' : 'lg:w-64',
            // Desktop always visible, mobile toggleable
            'lg:translate-x-0',
            sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
          )}
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-white/[0.06]">
            <Link href="/dashboard/overview" className="flex items-center gap-3 group">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-[#5B5FEF] rounded-lg blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-[#5B5FEF] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#5B5FEF]/20">
                  <Hexagon className="h-4.5 w-4.5 text-white" />
                </div>
              </div>
              {!isCollapsed && (
                <span className="text-lg font-semibold text-white tracking-tight whitespace-nowrap">
                  Nexorium<span className="text-[#5B5FEF]"> Core</span>
                </span>
              )}
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Environment Switcher - hide when collapsed */}
          {!isCollapsed && (
            <div className="border-b border-white/[0.06]">
              <EnvironmentSwitcher />
            </div>
          )}

          {/* 6-Pillar Navigation */}
          <nav className={cn('flex flex-col gap-1', isCollapsed ? 'p-2' : 'p-4')}>
            {!isCollapsed && (
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Pillars
              </p>
            )}
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    'group relative flex items-center rounded-lg text-sm font-medium transition-all duration-200',
                    isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-[#5B5FEF]/[0.15] text-[#C7D2FE]'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                  )}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-gradient-to-b from-[#5B5FEF] to-[#7C3AED] rounded-r-full" />
                  )}
                  <item.icon
                    className={cn(
                      'h-5 w-5 transition-transform duration-200 group-hover:scale-105 flex-shrink-0',
                      isActive ? 'text-[#A5B4FC]' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                  {!isCollapsed && (
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      <span
                        className={cn(
                          'text-[10px] tracking-wide',
                          isActive ? 'text-[#818CF8]/70' : 'text-slate-600'
                        )}
                      >
                        {item.description}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Collapse toggle button - desktop only */}
          <div className="absolute bottom-4 left-0 right-0 hidden lg:flex justify-center px-2">
            <button
              onClick={() => setCollapsed(!isCollapsed)}
              className={cn(
                'p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all',
                isCollapsed ? 'w-full flex justify-center' : ''
              )}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
          </div>
        </aside>

          {/* Main content - adjusts based on sidebar collapse state */}
          <div className={cn(
            'relative transition-all duration-300',
            isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
          )}>
            {/* Mobile menu button */}
            <button
              className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-[#0F1729]/95 hover:bg-white/[0.06] transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-slate-400" />
            </button>

            {/* Page content */}
            <main className="p-4 lg:p-8 animate-fade-in-up">{children}</main>
          </div>
        </div>
  );
}
