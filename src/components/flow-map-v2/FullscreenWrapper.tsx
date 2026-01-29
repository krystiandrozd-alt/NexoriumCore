'use client';

// Nexorium Core - Fullscreen Wrapper
// Wraps Flow Map content for fullscreen mode

import { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface FullscreenWrapperProps {
  isFullscreen: boolean;
  children: React.ReactNode;
}

function FullscreenWrapper({ isFullscreen, children }: FullscreenWrapperProps) {
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
        'bg-slate-900'
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Flow Map fullscreen view"
    >
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(139,92,246,0.06)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(6,182,212,0.04)_0%,transparent_50%)]" />

      {/* Content */}
      <div className="relative w-full h-full">
        {children}
      </div>

      {/* ESC hint */}
      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-white/10 text-xs text-slate-400">
        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">ESC</kbd> to exit fullscreen
      </div>
    </div>,
    document.body
  );
}

export default memo(FullscreenWrapper);
