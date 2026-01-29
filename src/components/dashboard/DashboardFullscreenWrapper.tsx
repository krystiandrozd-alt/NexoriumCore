'use client';

// Nexorium Core - Dashboard Fullscreen Wrapper
// Light-themed fullscreen mode for dashboard pages

import { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DashboardFullscreenWrapperProps {
  isFullscreen: boolean;
  children: React.ReactNode;
  className?: string;
}

function DashboardFullscreenWrapper({
  isFullscreen,
  children,
  className
}: DashboardFullscreenWrapperProps) {
  // Handle body scroll lock when in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  if (!isFullscreen) {
    return <>{children}</>;
  }

  // Render in portal when fullscreen
  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50',
        'bg-slate-50',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Dashboard fullscreen view"
    >
      {/* Light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(6,182,212,0.06)_0%,transparent_50%)]" />

      {/* Content */}
      <div className="relative w-full h-full overflow-auto">
        {children}
      </div>

      {/* ESC hint */}
      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-white/80 border border-slate-200 shadow-sm text-xs text-slate-500">
        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono border border-slate-200">ESC</kbd> to exit fullscreen
      </div>
    </div>,
    document.body
  );
}

export default memo(DashboardFullscreenWrapper);
