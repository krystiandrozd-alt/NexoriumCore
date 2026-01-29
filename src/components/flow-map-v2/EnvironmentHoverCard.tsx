'use client';

// Nexorium Core - Environment Hover Card
// Popover with environment metadata on hover

import { memo } from 'react';
import {
  Server,
  Layers,
  Link2,
  Cloud,
  Network,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowMapV2Environment, FlowMapStageKey } from '@/types/flow-map-v2';
import { stageColors, domainColors } from '@/types/flow-map-v2';

interface EnvironmentHoverCardProps {
  environment: FlowMapV2Environment;
  position: { x: number; y: number };
  isVisible: boolean;
}

function EnvironmentHoverCard({
  environment,
  position,
  isVisible,
}: EnvironmentHoverCardProps) {
  if (!isVisible) {
    return null;
  }

  const stageColor = environment.stageKey
    ? stageColors[environment.stageKey as FlowMapStageKey]
    : '#64748b';
  const domainColor = environment.domain
    ? domainColors[environment.domain]
    : undefined;

  // Format date
  const formattedDate = environment.updatedAt
    ? new Date(environment.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div
      className={cn(
        'fixed z-50 pointer-events-none',
        'w-64 p-4 rounded-xl',
        'bg-slate-900/95 backdrop-blur-xl',
        'border border-white/10 shadow-2xl',
        'animate-in fade-in slide-in-from-bottom-2 duration-200'
      )}
      style={{
        left: position.x + 20,
        top: position.y - 20,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="p-2 rounded-lg border border-white/10"
          style={{ backgroundColor: `${stageColor}20` }}
        >
          <Server className="h-5 w-5" style={{ color: stageColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">
            {environment.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            {environment.stageName && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                style={{
                  backgroundColor: `${stageColor}15`,
                  borderColor: `${stageColor}40`,
                  color: stageColor,
                }}
              >
                {environment.stageName}
              </span>
            )}
            {environment.domain && domainColor && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                style={{
                  backgroundColor: `${domainColor}15`,
                  borderColor: `${domainColor}40`,
                  color: domainColor,
                }}
              >
                {environment.domain}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {environment.description && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">
          {environment.description}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Layers className="h-3.5 w-3.5 text-slate-500" />
          <span>{environment.systemCount} systems</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link2 className="h-3.5 w-3.5 text-slate-500" />
          <span>{environment.connectionCount} connections</span>
        </div>
      </div>

      {/* Hosting metadata */}
      {(environment.hostingPlatform || environment.vpc || environment.subnet) && (
        <div className="pt-3 border-t border-white/5 space-y-2">
          {environment.hostingPlatform && (
            <div className="flex items-center gap-2 text-xs">
              <Cloud className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-400">Platform:</span>
              <span className="text-slate-300">{environment.hostingPlatform}</span>
            </div>
          )}
          {environment.vpc && (
            <div className="flex items-center gap-2 text-xs">
              <Network className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-400">VPC:</span>
              <span className="text-slate-300 font-mono text-[11px]">{environment.vpc}</span>
            </div>
          )}
          {environment.subnet && (
            <div className="flex items-center gap-2 text-xs">
              <Network className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-400">Subnet:</span>
              <span className="text-slate-300 font-mono text-[11px]">{environment.subnet}</span>
            </div>
          )}
        </div>
      )}

      {/* Last updated */}
      {formattedDate && (
        <div className="pt-3 border-t border-white/5 mt-3">
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>Updated {formattedDate}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(EnvironmentHoverCard);
