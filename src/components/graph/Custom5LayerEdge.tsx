'use client';

// TelEnvIQ - Custom Edge for 5-Layer Model
// Displays connection with protocol, confidence indicator

import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import type { ConnectionOrigin, ConnectionConfidence } from '@/types';

interface Custom5LayerEdgeData {
  protocolType: string;
  protocolDetail?: string | null;
  port?: number | null;
  origin: ConnectionOrigin;
  confidence: ConnectionConfidence;
  sourceSystem?: string | null;
}

const CONFIDENCE_STYLES: Record<ConnectionConfidence, { stroke: string; opacity: number; dashArray?: string }> = {
  HIGH: { stroke: '#6366f1', opacity: 1 },
  MED: { stroke: '#f59e0b', opacity: 0.8, dashArray: '5,5' },
  LOW: { stroke: '#ef4444', opacity: 0.6, dashArray: '3,3' },
};

const ORIGIN_STYLES: Record<ConnectionOrigin, { badge: string; text: string }> = {
  INGESTED: { badge: 'bg-slate-100 text-slate-600', text: 'A' },
  MANUAL: { badge: 'bg-indigo-100 text-indigo-600', text: 'M' },
};

function Custom5LayerEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as unknown as Custom5LayerEdgeData;
  const confidence = edgeData?.confidence || 'HIGH';
  const origin = edgeData?.origin || 'INGESTED';
  const styles = CONFIDENCE_STYLES[confidence];
  const originStyle = ORIGIN_STYLES[origin];

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: styles.stroke,
          strokeWidth: selected ? 2.5 : 1.5,
          strokeOpacity: styles.opacity,
          strokeDasharray: styles.dashArray,
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className={`
              flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium
              bg-white border border-slate-200 shadow-sm
              ${selected ? 'ring-1 ring-indigo-500' : ''}
            `}
          >
            {/* Protocol label */}
            <span className="text-slate-700">
              {edgeData?.protocolType || 'TCP'}
            </span>

            {/* Port if present */}
            {edgeData?.port && (
              <span className="text-slate-400">
                :{edgeData.port}
              </span>
            )}

            {/* Origin indicator */}
            <span
              className={`w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px] font-bold ${originStyle.badge}`}
              title={origin === 'MANUAL' ? 'Manual connection' : 'Auto-discovered'}
            >
              {originStyle.text}
            </span>

            {/* Confidence indicator */}
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: styles.stroke }}
              title={`Confidence: ${confidence}`}
            />
          </div>

          {/* Protocol detail on hover/select */}
          {edgeData?.protocolDetail && selected && (
            <div className="mt-1 px-1.5 py-0.5 bg-slate-800 text-white text-[9px] rounded shadow">
              {edgeData.protocolDetail}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(Custom5LayerEdge);
