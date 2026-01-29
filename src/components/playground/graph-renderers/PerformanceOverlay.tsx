'use client';

/**
 * Performance Overlay for Graph Renderer Playground
 *
 * Floating panel showing render metrics.
 */

import { Activity, Clock, Box, GitBranch, Cpu } from 'lucide-react';
import type { PerformanceMetrics } from '@/graph/adapters/GraphRenderer';
import { formatMs, formatBytes } from '@/graph/util/perf';

interface PerformanceOverlayProps {
  metrics: PerformanceMetrics | null;
  rendererName: string;
}

export function PerformanceOverlay({ metrics, rendererName }: PerformanceOverlayProps) {
  if (!metrics) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-3 z-10">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
        <Activity className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-medium text-slate-700">{rendererName}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <MetricItem
          icon={Clock}
          label="Render"
          value={formatMs(metrics.renderTimeMs)}
        />
        <MetricItem
          icon={Box}
          label="Nodes"
          value={metrics.nodeCount.toString()}
        />
        <MetricItem
          icon={GitBranch}
          label="Edges"
          value={metrics.edgeCount.toString()}
        />
        {metrics.fps !== undefined && (
          <MetricItem
            icon={Cpu}
            label="FPS"
            value={`${metrics.fps}`}
            highlight={metrics.fps < 30}
          />
        )}
        {metrics.memoryUsage !== undefined && (
          <MetricItem
            icon={Cpu}
            label="Memory"
            value={formatBytes(metrics.memoryUsage)}
            className="col-span-2"
          />
        )}
      </div>
    </div>
  );
}

interface MetricItemProps {
  icon: typeof Activity;
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}

function MetricItem({ icon: Icon, label, value, highlight, className }: MetricItemProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      <span className="text-slate-500">{label}:</span>
      <span className={`font-medium ${highlight ? 'text-amber-600' : 'text-slate-700'}`}>
        {value}
      </span>
    </div>
  );
}
