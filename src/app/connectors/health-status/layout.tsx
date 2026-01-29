'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useHealthStatusStore } from '@/modules/health-status';

const NAV_ITEMS = [
  { href: '/connectors/health-status', label: 'Status Engine', icon: '⚙' },
  { href: '/connectors/health-status/sources', label: 'Signal Sources', icon: '📡' },
  { href: '/connectors/health-status/mapping', label: 'System Mapping', icon: '🔗' },
  { href: '/connectors/health-status/signals', label: 'Live Signals', icon: '📊' },
];

export default function HealthStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { mappings, loadDemoData } = useHealthStatusStore();

  // Auto-load demo data if store is empty
  useEffect(() => {
    if (mappings.length === 0) {
      loadDemoData();
    }
  }, [mappings.length, loadDemoData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Top Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-6">
        <Link href="/dashboard" className="text-slate-400 hover:text-white mr-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Connectors</span>
          <span className="text-slate-600">/</span>
          <span className="font-medium">Health & Status</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="px-2 py-1 text-xs bg-green-900/50 text-green-400 rounded">MVP</span>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar / Subnav */}
        <aside className="w-56 min-h-[calc(100vh-3.5rem)] bg-slate-900 border-r border-slate-800 p-4">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Info Box */}
          <div className="mt-8 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <h4 className="text-xs font-medium text-slate-400 mb-2">About Status Engine</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              System status is derived from signals collected by connectors.
              Rules are evaluated in priority order to determine health.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 space-y-2">
            <button
              onClick={() => loadDemoData()}
              className="w-full px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
            >
              Reload Demo Data
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
