// Nexorium Core - Health & Status Module Types
// Defines data models for system health tracking via connector signals

// ============================================
// STATUS ENUM
// ============================================

export type SystemStatus = 'Active' | 'Degraded' | 'Down' | 'Maintenance' | 'Unknown';

export const STATUS_CONFIG: Record<SystemStatus, { color: string; bgColor: string; icon: string; priority: number }> = {
  Active: { color: '#22c55e', bgColor: '#22c55e20', icon: '✓', priority: 0 },
  Degraded: { color: '#f59e0b', bgColor: '#f59e0b20', icon: '⚠', priority: 1 },
  Down: { color: '#ef4444', bgColor: '#ef444420', icon: '✕', priority: 3 },
  Maintenance: { color: '#3b82f6', bgColor: '#3b82f620', icon: '🔧', priority: 2 },
  Unknown: { color: '#64748b', bgColor: '#64748b20', icon: '?', priority: 4 },
};

// ============================================
// SIGNAL SOURCE TYPES
// ============================================

export type SignalSource =
  | 'k8s'
  | 'vcenter'
  | 'cloud'
  | 'prometheus'
  | 'azureMonitor'
  | 'servicenow';

export const SIGNAL_SOURCE_CONFIG: Record<SignalSource, {
  name: string;
  description: string;
  icon: string;
  color: string;
  metrics: string[];
}> = {
  k8s: {
    name: 'Kubernetes',
    description: 'Container orchestration platform signals',
    icon: '☸',
    color: '#326ce5',
    metrics: ['pod_ready_ratio', 'deployment_available', 'replica_count', 'container_restarts'],
  },
  vcenter: {
    name: 'VMware vCenter',
    description: 'Virtual machine infrastructure signals',
    icon: '🖥',
    color: '#607078',
    metrics: ['vm_power_state', 'vm_cpu_usage', 'vm_memory_usage', 'vm_disk_usage'],
  },
  cloud: {
    name: 'Cloud API',
    description: 'AWS/Azure/GCP resource state signals',
    icon: '☁',
    color: '#ff9900',
    metrics: ['instance_state', 'service_health', 'resource_status', 'availability_zone_health'],
  },
  prometheus: {
    name: 'Prometheus',
    description: 'Application metrics and alerting signals',
    icon: '🔥',
    color: '#e6522c',
    metrics: ['prom_up', 'scrape_success', 'alert_firing', 'target_health'],
  },
  azureMonitor: {
    name: 'Azure Monitor',
    description: 'Azure-native monitoring signals',
    icon: '📊',
    color: '#0078d4',
    metrics: ['resource_health', 'metric_alert', 'service_health', 'activity_log'],
  },
  servicenow: {
    name: 'ServiceNow CMDB',
    description: 'IT service management signals',
    icon: '🎫',
    color: '#81b5a1',
    metrics: ['cmdb_lifecycle', 'change_window', 'incident_active', 'maintenance_scheduled'],
  },
};

// ============================================
// SIGNAL
// ============================================

export interface Signal {
  id: string;
  systemId: string;
  source: SignalSource;
  metric: string;
  value: string | number | boolean;
  ts: string; // ISO datetime
  confidence: number; // 0..1
  rawData?: Record<string, unknown>; // Optional raw payload for debugging
}

// ============================================
// STATUS DECISION
// ============================================

export interface StatusDecision {
  systemId: string;
  status: SystemStatus;
  reason: string; // Human readable
  reasonCodes: string[]; // e.g., ['CMDB_MAINTENANCE', 'K8S_READY_LT_1']
  contributingSignals: string[]; // Signal IDs that contributed
  ts: string; // ISO datetime when computed
}

// ============================================
// SYSTEM IDENTITY MAPPING
// ============================================

export interface SystemIdentityMapping {
  systemId: string;
  systemName: string; // Display name from Nexorium
  cmdbCiId?: string;
  k8sNamespace?: string;
  k8sAppLabel?: string;
  vcenterVmNames?: string[];
  cloudResourceIds?: string[];
  endpoints?: string[];
  lastUpdated?: string;
}

// ============================================
// CONNECTOR STATUS
// ============================================

export interface ConnectorStatus {
  source: SignalSource;
  connected: boolean;
  lastSyncTime?: string;
  signalsProduced: number;
  errorMessage?: string;
}

// ============================================
// STATUS ENGINE RULE
// ============================================

export interface StatusRule {
  id: string;
  name: string;
  description: string;
  priority: number; // Lower = higher priority
  condition: string; // Human-readable condition
  resultStatus: SystemStatus;
  reasonCode: string;
  enabled: boolean;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function generateSignalId(): string {
  return `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateDecisionId(): string {
  return `dec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleString('en-AU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getRelativeTime(ts: string): string {
  const now = new Date();
  const then = new Date(ts);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}
