'use client';

// Nexorium Core - Environment Detail Map (Level 1)
// Domain swimlane view with manual design mode support

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ReactFlowProvider } from '@xyflow/react';
import {
  ArrowLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Loader2,
} from 'lucide-react';
import useSWR from 'swr';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FullscreenWrapper,
} from '@/components/flow-map-v2';
import { ManualDesignProvider } from '@/contexts/ManualDesignContext';
import EnvironmentDetailCanvas from '@/components/flow-map-v2/EnvironmentDetailCanvas';
import EnvironmentDetailSidebar from '@/components/flow-map-v2/EnvironmentDetailSidebar';

// ============================================
// TYPES
// ============================================

interface Environment {
  id: string;
  name: string;
  type: string;
  description?: string;
  stageId?: string;
  stage?: {
    name: string;
    key: string;
    color: string;
  };
}

// ============================================
// FETCHER
// ============================================

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function EnvironmentDetailMapPage() {
  const params = useParams();
  const envId = params.id as string;

  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch environment data
  const { data: envResponse, isLoading } = useSWR<{ success: boolean; data: Environment }>(
    envId ? `/api/environments/${envId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const environment = envResponse?.data;

  // ESC to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Stage type color mapping
  const typeColors: Record<string, string> = {
    DEV: 'bg-green-500/20 text-green-400 border-green-500/30',
    SIT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    UAT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    NFT: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    PREPROD: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    PROD_RO: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  // Loading state
  if (isLoading || !envId) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading environment...</span>
        </div>
      </div>
    );
  }

  // Not found state
  if (!environment) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900">
        <h2 className="text-lg font-medium text-white mb-2">Environment not found</h2>
        <Link href="/dashboard/environments/flow-map" className="text-violet-400 hover:text-violet-300">
          Back to Pipeline Map
        </Link>
      </div>
    );
  }

  return (
    <ManualDesignProvider environmentId={envId}>
      <FullscreenWrapper isFullscreen={isFullscreen}>
        <div
          className={cn(
            'relative h-[calc(100vh-8rem)]',
            !isFullscreen && '-mx-4 lg:-mx-8 -mb-4 lg:-mb-8',
            isFullscreen && 'h-full',
            'overflow-hidden'
          )}
        >
          {/* Background gradient mesh - lighter purple tone */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-950/15 to-slate-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(167,139,250,0.08)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(196,181,253,0.05)_0%,transparent_50%)]" />

          {/* Header with breadcrumbs */}
          <div className="absolute top-0 left-0 right-0 z-30 px-4 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center justify-between">
              {/* Left side: Back + Breadcrumbs */}
              <div className="flex items-center gap-3">
                <Link href="/dashboard/environments/flow-map">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm">
                  <Link
                    href="/dashboard/environments/flow-map"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Pipeline Map
                  </Link>
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                  <span className="text-white font-medium">{environment.name}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'ml-2 text-[10px] border',
                      typeColors[environment.type] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    )}
                  >
                    {environment.type}
                  </Badge>
                </nav>
              </div>

              {/* Right side: Fullscreen toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreenToggle}
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Main content - below header */}
          <div className="absolute top-14 left-0 right-0 bottom-0">
            <ReactFlowProvider>
              {/* Sidebar panel */}
              <div
                className={cn(
                  'absolute left-0 top-0 bottom-0 z-20',
                  'bg-slate-900/95 backdrop-blur-xl border-r border-white/5',
                  'transition-all duration-300 ease-out overflow-hidden',
                  sidebarOpen ? 'w-72' : 'w-0'
                )}
              >
                <EnvironmentDetailSidebar
                  environmentId={envId}
                  environment={environment}
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen((prev) => !prev)}
                />
              </div>

              {/* Sidebar toggle button when collapsed */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 z-30',
                    'px-1 py-4 rounded-r-lg',
                    'bg-slate-800/90 border border-white/10 border-l-0',
                    'text-slate-400 hover:text-white hover:bg-slate-700/90',
                    'transition-all'
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {/* Canvas area */}
              <div
                className={cn(
                  'absolute top-0 right-0 bottom-0 transition-all duration-300',
                  sidebarOpen ? 'left-72' : 'left-0'
                )}
              >
                <EnvironmentDetailCanvas
                  environmentId={envId}
                  isFullscreen={isFullscreen}
                  onFullscreenToggle={handleFullscreenToggle}
                />
              </div>
            </ReactFlowProvider>
          </div>
        </div>
      </FullscreenWrapper>
    </ManualDesignProvider>
  );
}
