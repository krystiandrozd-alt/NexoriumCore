'use client';

/**
 * Inspector Drawer for Graph Renderer Playground
 *
 * Right-side drawer showing selected node details.
 */

import {
  X,
  Server,
  Cloud,
  Globe,
  Layers,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import type { CanonicalGraphNode } from '@/graph/model/types';
import {
  NODE_TYPE_COLORS,
  HEALTH_COLORS,
  ZONE_COLORS,
  LAYER_COLORS,
} from '@/graph/model/types';

interface InspectorDrawerProps {
  node: CanonicalGraphNode | null;
  onClose: () => void;
}

export function InspectorDrawer({ node, onClose }: InspectorDrawerProps) {
  const [showMeta, setShowMeta] = useState(false);

  if (!node) return null;

  const typeColors = NODE_TYPE_COLORS[node.type] || NODE_TYPE_COLORS.application;
  const healthColor = HEALTH_COLORS[node.health] || HEALTH_COLORS.unknown;
  const zoneColors = ZONE_COLORS[node.networkZone] || ZONE_COLORS.unknown;
  const layerColors = LAYER_COLORS[node.telcoLayer] || LAYER_COLORS.Unknown;

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: typeColors.borderColor }}
          />
          <h3 className="font-semibold text-slate-800 truncate">{node.label}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Type & Health */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: typeColors.color,
              color: typeColors.borderColor,
            }}
          >
            {node.type}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: healthColor }}
            />
            {node.health}
          </span>
        </div>

        {/* Properties */}
        <div className="space-y-3">
          <PropertyRow
            icon={Cloud}
            label="Hosting"
            value={node.hostingType}
          />
          <PropertyRow
            icon={Globe}
            label="Network Zone"
            value={node.networkZone}
            badgeStyle={{
              backgroundColor: zoneColors.bg,
              borderColor: zoneColors.border,
            }}
          />
          <PropertyRow
            icon={Layers}
            label="Telco Layer"
            value={node.telcoLayer}
            badgeStyle={{
              backgroundColor: layerColors.bg,
              borderColor: layerColors.border,
            }}
          />
          <PropertyRow
            icon={Shield}
            label="Confidence"
            value={`${Math.round(node.confidence * 100)}%`}
          />
          <PropertyRow
            icon={Clock}
            label="Last Seen"
            value={
              node.lastSeenAt
                ? new Date(node.lastSeenAt).toLocaleDateString()
                : 'Unknown'
            }
          />
        </div>

        {/* ID */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500 mb-1">Node ID</div>
          <code className="block text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded font-mono break-all">
            {node.id}
          </code>
        </div>

        {/* Metadata */}
        {Object.keys(node.meta).length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowMeta(!showMeta)}
              className="w-full flex items-center justify-between text-sm text-slate-600 hover:text-slate-800"
            >
              <span className="font-medium">Metadata</span>
              {showMeta ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {showMeta && (
              <pre className="mt-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded overflow-x-auto">
                {JSON.stringify(node.meta, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface PropertyRowProps {
  icon: typeof Server;
  label: string;
  value: string;
  badgeStyle?: {
    backgroundColor: string;
    borderColor: string;
  };
}

function PropertyRow({ icon: Icon, label, value, badgeStyle }: PropertyRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      {badgeStyle ? (
        <span
          className="text-xs font-medium px-2 py-0.5 rounded border"
          style={{
            backgroundColor: badgeStyle.backgroundColor,
            borderColor: badgeStyle.borderColor,
          }}
        >
          {value}
        </span>
      ) : (
        <span className="text-sm text-slate-700 font-medium">{value}</span>
      )}
    </div>
  );
}
