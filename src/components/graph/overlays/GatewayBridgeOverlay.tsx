'use client';

// Nexorium Core - Gateway Bridge Overlay Component
// Visual representation of zone connection bridges

import { memo } from 'react';
import { ArrowRight, Shield, Server, FileSymlink, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BridgeMechanism } from '@/types';

interface GatewayBridgeOverlayProps {
  mechanism: BridgeMechanism;
  sourceZone: string;
  targetZone: string;
  bridgeNodeName?: string | null;
  className?: string;
}

const MECHANISM_CONFIG: Record<BridgeMechanism, {
  icon: typeof Shield;
  label: string;
  color: string;
}> = {
  API_GATEWAY: {
    icon: Shield,
    label: 'API Gateway',
    color: 'bg-indigo-100 border-indigo-300 text-indigo-700',
  },
  PROXY: {
    icon: Server,
    label: 'Proxy',
    color: 'bg-purple-100 border-purple-300 text-purple-700',
  },
  BASTION: {
    icon: Shield,
    label: 'Bastion',
    color: 'bg-red-100 border-red-300 text-red-700',
  },
  FILE_TRANSFER: {
    icon: FileSymlink,
    label: 'File Transfer',
    color: 'bg-amber-100 border-amber-300 text-amber-700',
  },
  ESB: {
    icon: Box,
    label: 'ESB',
    color: 'bg-teal-100 border-teal-300 text-teal-700',
  },
  DIRECT: {
    icon: ArrowRight,
    label: 'Direct',
    color: 'bg-slate-100 border-slate-300 text-slate-700',
  },
};

function GatewayBridgeOverlay({
  mechanism,
  sourceZone,
  targetZone,
  bridgeNodeName,
  className,
}: GatewayBridgeOverlayProps) {
  const config = MECHANISM_CONFIG[mechanism];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1 rounded-md border text-xs',
        config.color,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <div className="flex items-center gap-1">
        <span className="font-medium">{sourceZone}</span>
        <ArrowRight className="h-3 w-3 opacity-50" />
        <span className="font-medium">{targetZone}</span>
      </div>
      {bridgeNodeName && (
        <span className="text-[10px] opacity-75">via {bridgeNodeName}</span>
      )}
    </div>
  );
}

// Inline badge variant for edge labels
interface BridgeBadgeProps {
  mechanism: BridgeMechanism;
  className?: string;
}

export function BridgeBadge({ mechanism, className }: BridgeBadgeProps) {
  const config = MECHANISM_CONFIG[mechanism];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
        config.color,
        className
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
}

export default memo(GatewayBridgeOverlay);
