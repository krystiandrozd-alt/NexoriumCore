// TelEnvIQ - Utility Functions

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInDays, format, formatDistanceToNow } from 'date-fns';
import crypto from 'crypto';

// Tailwind class merging utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Never';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'Never';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy HH:mm');
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return 'Never';
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function daysSince(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  return differenceInDays(new Date(), d);
}

// Staleness utilities
export type StalenessLevel = 'fresh' | 'warning' | 'stale' | 'critical';

export function getStalenessLevel(daysSinceRefresh: number | null): StalenessLevel {
  if (daysSinceRefresh === null) return 'critical';
  if (daysSinceRefresh < 14) return 'fresh';
  if (daysSinceRefresh < 30) return 'warning';
  return 'stale';
}

export function getStalenessColor(level: StalenessLevel): string {
  switch (level) {
    case 'fresh':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'warning':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'stale':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'critical':
      return 'text-red-700 bg-red-100 border-red-300';
  }
}

export function getStalenessBadgeColor(level: StalenessLevel): string {
  switch (level) {
    case 'fresh':
      return 'bg-green-500';
    case 'warning':
      return 'bg-amber-500';
    case 'stale':
      return 'bg-red-500';
    case 'critical':
      return 'bg-red-700';
  }
}

// Confidence score utilities
export function getConfidenceColor(score: number): string {
  if (score >= 0.9) return '#22c55e'; // green-500
  if (score >= 0.7) return '#eab308'; // yellow-500
  if (score >= 0.5) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

export function getConfidenceLabel(score: number): string {
  if (score >= 0.9) return 'High';
  if (score >= 0.7) return 'Medium';
  if (score >= 0.5) return 'Low';
  return 'Very Low';
}

// Hash generation for snapshots
export function generateSnapshotHash(data: unknown): string {
  const str = JSON.stringify(data, Object.keys(data as object).sort());
  return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
}

// Protocol display names
export function getProtocolDisplayName(protocol: string): string {
  const names: Record<string, string> = {
    REST: 'REST API',
    GRPC: 'gRPC',
    MQ: 'Message Queue',
    JDBC: 'JDBC',
    SFTP: 'SFTP',
    EVENT: 'Event',
    WEBSOCKET: 'WebSocket',
    SOAP: 'SOAP',
    GRAPHQL: 'GraphQL',
  };
  return names[protocol] || protocol;
}

// Node type display names and icons
export function getNodeTypeDisplayName(type: string): string {
  const names: Record<string, string> = {
    APPLICATION: 'Application',
    SERVICE: 'Service',
    DATABASE: 'Database',
    GATEWAY: 'API Gateway',
    EXTERNAL: 'External System',
    RUNTIME: 'Runtime',
    MESSAGE_QUEUE: 'Message Queue',
    LOAD_BALANCER: 'Load Balancer',
  };
  return names[type] || type;
}

// Criticality display
export function getCriticalityColor(criticality: string): string {
  switch (criticality) {
    case 'CRITICAL':
      return 'text-red-700 bg-red-100 border-red-300';
    case 'HIGH':
      return 'text-orange-700 bg-orange-100 border-orange-300';
    case 'MEDIUM':
      return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    case 'LOW':
      return 'text-gray-700 bg-gray-100 border-gray-300';
    default:
      return 'text-gray-500 bg-gray-50';
  }
}

// Source type display
export function getSourceTypeDisplayName(sourceType: string): string {
  const names: Record<string, string> = {
    PROD_CLONE: 'Production Clone',
    MASKED: 'Masked Data',
    SYNTHETIC: 'Synthetic Data',
    STATIC: 'Static Data',
  };
  return names[sourceType] || sourceType;
}

// Environment type display
export function getEnvironmentTypeDisplayName(type: string): string {
  const names: Record<string, string> = {
    SIT: 'System Integration Test',
    UAT: 'User Acceptance Test',
    NFT: 'Non-Functional Test',
    PREPROD: 'Pre-Production',
  };
  return names[type] || type;
}

// Validation helpers
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Truncate text with ellipsis
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

// Generate unique ID for graph nodes
export function generateNodePosition(index: number, total: number, radius: number = 300): { x: number; y: number } {
  const angle = (2 * Math.PI * index) / total;
  return {
    x: Math.cos(angle) * radius + radius + 100,
    y: Math.sin(angle) * radius + radius + 100,
  };
}
