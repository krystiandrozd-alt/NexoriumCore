'use client';

// Nexorium Core - Abstract Network Visualization for Landing Page
// Animated SVG graph visualization

import { useEffect, useState } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
  type: 'service' | 'database' | 'gateway' | 'queue';
  label: string;
}

interface Edge {
  source: string;
  target: string;
}

const initialNodes: Node[] = [
  { id: '1', x: 100, y: 150, type: 'gateway', label: 'API Gateway' },
  { id: '2', x: 280, y: 80, type: 'service', label: 'Order Service' },
  { id: '3', x: 280, y: 220, type: 'service', label: 'Customer Service' },
  { id: '4', x: 460, y: 80, type: 'database', label: 'Orders DB' },
  { id: '5', x: 460, y: 220, type: 'database', label: 'Customer DB' },
  { id: '6', x: 640, y: 150, type: 'queue', label: 'Event Bus' },
  { id: '7', x: 820, y: 80, type: 'service', label: 'Billing Service' },
  { id: '8', x: 820, y: 220, type: 'service', label: 'Notification' },
  { id: '9', x: 1000, y: 150, type: 'database', label: 'Billing DB' },
];

const edges: Edge[] = [
  { source: '1', target: '2' },
  { source: '1', target: '3' },
  { source: '2', target: '4' },
  { source: '3', target: '5' },
  { source: '2', target: '6' },
  { source: '3', target: '6' },
  { source: '6', target: '7' },
  { source: '6', target: '8' },
  { source: '7', target: '9' },
];

const typeColors = {
  service: { fill: '#EEF2FF', stroke: '#6366F1', icon: '#4F46E5' },
  database: { fill: '#ECFDF5', stroke: '#10B981', icon: '#059669' },
  gateway: { fill: '#F5F3FF', stroke: '#8B5CF6', icon: '#7C3AED' },
  queue: { fill: '#ECFEFF', stroke: '#06B6D4', icon: '#0891B2' },
};

export default function NetworkVisualization() {
  const [activeEdge, setActiveEdge] = useState(0);
  const [nodes] = useState(initialNodes);

  // Animate edges
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEdge((prev) => (prev + 1) % edges.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const getNodeById = (id: string) => nodes.find((n) => n.id === id);

  return (
    <div className="relative w-full h-[300px] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      <svg
        viewBox="0 0 1100 300"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid pattern */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="0.5"
            />
          </pattern>

          {/* Gradient for animated edges */}
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#6366F1" stopOpacity="1" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.1" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Edges */}
        {edges.map((edge, index) => {
          const source = getNodeById(edge.source);
          const target = getNodeById(edge.target);
          if (!source || !target) return null;

          const isActive = index === activeEdge;

          return (
            <g key={`${edge.source}-${edge.target}`}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isActive ? '#6366F1' : '#CBD5E1'}
                strokeWidth={isActive ? 2 : 1.5}
                strokeDasharray={isActive ? '5,5' : undefined}
                className={isActive ? 'animate-dash' : ''}
                filter={isActive ? 'url(#glow)' : undefined}
              />
              {isActive && (
                <circle r="4" fill="#6366F1">
                  <animateMotion
                    dur="1s"
                    repeatCount="1"
                    path={`M${source.x},${source.y} L${target.x},${target.y}`}
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const colors = typeColors[node.type];

          return (
            <g key={node.id} className="cursor-pointer">
              {/* Node background */}
              <rect
                x={node.x - 50}
                y={node.y - 25}
                width="100"
                height="50"
                rx="8"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="1.5"
                className="transition-all hover:filter hover:brightness-95"
              />

              {/* Node icon */}
              {node.type === 'service' && (
                <rect
                  x={node.x - 40}
                  y={node.y - 15}
                  width="16"
                  height="16"
                  rx="2"
                  fill={colors.icon}
                />
              )}
              {node.type === 'database' && (
                <ellipse
                  cx={node.x - 32}
                  cy={node.y - 5}
                  rx="8"
                  ry="5"
                  fill={colors.icon}
                />
              )}
              {node.type === 'gateway' && (
                <polygon
                  points={`${node.x - 40},${node.y - 5} ${node.x - 32},${node.y - 15} ${node.x - 24},${node.y - 5}`}
                  fill={colors.icon}
                />
              )}
              {node.type === 'queue' && (
                <g>
                  <rect
                    x={node.x - 42}
                    y={node.y - 12}
                    width="6"
                    height="10"
                    fill={colors.icon}
                    opacity="0.5"
                  />
                  <rect
                    x={node.x - 34}
                    y={node.y - 12}
                    width="6"
                    height="10"
                    fill={colors.icon}
                    opacity="0.75"
                  />
                  <rect
                    x={node.x - 26}
                    y={node.y - 12}
                    width="6"
                    height="10"
                    fill={colors.icon}
                  />
                </g>
              )}

              {/* Node label */}
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                className="text-[10px] font-medium fill-slate-700"
              >
                {node.label}
              </text>

              {/* Freshness indicator for databases */}
              {node.type === 'database' && (
                <g>
                  <circle
                    cx={node.x + 40}
                    cy={node.y - 15}
                    r="8"
                    fill={node.id === '4' ? '#10B981' : node.id === '5' ? '#F59E0B' : '#EF4444'}
                  />
                  <text
                    x={node.x + 40}
                    y={node.y - 12}
                    textAnchor="middle"
                    className="text-[7px] font-bold fill-white"
                  >
                    {node.id === '4' ? '5d' : node.id === '5' ? '21d' : '45d'}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Overlay labels */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Fresh data</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Warning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Stale data</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
        .animate-dash {
          animation: dash 0.5s linear infinite;
        }
      `}</style>
    </div>
  );
}
