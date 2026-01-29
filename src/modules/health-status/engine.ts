// Nexorium Core - Status Engine
// Computes system status from signals using deterministic rules

import type {
  Signal,
  StatusDecision,
  SystemStatus,
  StatusRule,
} from './types';
import { generateDecisionId } from './types';

// ============================================
// DEFAULT STATUS RULES
// ============================================

export const DEFAULT_STATUS_RULES: StatusRule[] = [
  {
    id: 'rule-1',
    name: 'CMDB Maintenance Window',
    description: 'If ServiceNow CMDB indicates maintenance lifecycle, system is in Maintenance',
    priority: 1,
    condition: 'servicenow.cmdb_lifecycle = "maintenance" OR servicenow.maintenance_scheduled = true',
    resultStatus: 'Maintenance',
    reasonCode: 'CMDB_MAINTENANCE',
    enabled: true,
  },
  {
    id: 'rule-2',
    name: 'CMDB Change Window',
    description: 'If ServiceNow indicates active change window, system is in Maintenance',
    priority: 2,
    condition: 'servicenow.change_window = true',
    resultStatus: 'Maintenance',
    reasonCode: 'CMDB_CHANGE_WINDOW',
    enabled: true,
  },
  {
    id: 'rule-3',
    name: 'vCenter VM Powered Off',
    description: 'If vCenter shows VM powered off or suspended, system is Down',
    priority: 3,
    condition: 'vcenter.vm_power_state IN ("poweredOff", "suspended")',
    resultStatus: 'Down',
    reasonCode: 'VCENTER_VM_OFF',
    enabled: true,
  },
  {
    id: 'rule-4',
    name: 'Cloud Instance Stopped',
    description: 'If cloud API shows instance stopped/terminated, system is Down',
    priority: 4,
    condition: 'cloud.instance_state IN ("stopped", "terminated", "deallocated")',
    resultStatus: 'Down',
    reasonCode: 'CLOUD_INSTANCE_STOPPED',
    enabled: true,
  },
  {
    id: 'rule-5',
    name: 'Prometheus Target Down',
    description: 'If Prometheus up metric is 0 or false, system is Down',
    priority: 5,
    condition: 'prometheus.prom_up = 0 OR prometheus.prom_up = false',
    resultStatus: 'Down',
    reasonCode: 'PROM_TARGET_DOWN',
    enabled: true,
  },
  {
    id: 'rule-6',
    name: 'Azure Monitor Unhealthy',
    description: 'If Azure Monitor shows resource unhealthy, system is Down',
    priority: 6,
    condition: 'azureMonitor.resource_health = "Unhealthy"',
    resultStatus: 'Down',
    reasonCode: 'AZURE_UNHEALTHY',
    enabled: true,
  },
  {
    id: 'rule-7',
    name: 'Kubernetes Pods Partially Ready',
    description: 'If K8s pod ready ratio is less than 1, system is Degraded',
    priority: 7,
    condition: 'k8s.pod_ready_ratio < 1',
    resultStatus: 'Degraded',
    reasonCode: 'K8S_PODS_DEGRADED',
    enabled: true,
  },
  {
    id: 'rule-8',
    name: 'High Container Restarts',
    description: 'If container restarts exceed threshold, system is Degraded',
    priority: 8,
    condition: 'k8s.container_restarts > 5',
    resultStatus: 'Degraded',
    reasonCode: 'K8S_HIGH_RESTARTS',
    enabled: true,
  },
  {
    id: 'rule-9',
    name: 'Prometheus Alert Firing',
    description: 'If Prometheus has active critical alerts, system is Degraded',
    priority: 9,
    condition: 'prometheus.alert_firing = true',
    resultStatus: 'Degraded',
    reasonCode: 'PROM_ALERT_FIRING',
    enabled: true,
  },
  {
    id: 'rule-10',
    name: 'Active Incident',
    description: 'If ServiceNow shows active incident, system is Degraded',
    priority: 10,
    condition: 'servicenow.incident_active = true',
    resultStatus: 'Degraded',
    reasonCode: 'SNOW_INCIDENT_ACTIVE',
    enabled: true,
  },
];

// ============================================
// STATUS COMPUTATION ENGINE
// ============================================

interface SignalMatch {
  signal: Signal;
  ruleId: string;
  reasonCode: string;
}

/**
 * Computes the status for a system based on its signals.
 * Rules are evaluated in priority order (lower = higher priority).
 * First matching rule determines the status.
 */
export function computeStatus(
  systemId: string,
  signals: Signal[],
  rules: StatusRule[] = DEFAULT_STATUS_RULES
): StatusDecision {
  const now = new Date().toISOString();

  // Filter signals for this system
  const systemSignals = signals.filter(s => s.systemId === systemId);

  // No signals = Unknown
  if (systemSignals.length === 0) {
    return {
      systemId,
      status: 'Unknown',
      reason: 'No signals received for this system',
      reasonCodes: ['NO_SIGNALS'],
      contributingSignals: [],
      ts: now,
    };
  }

  // Sort rules by priority
  const sortedRules = [...rules].filter(r => r.enabled).sort((a, b) => a.priority - b.priority);

  // Evaluate rules in priority order
  const matches: SignalMatch[] = [];

  for (const rule of sortedRules) {
    const matchingSignals = evaluateRule(rule, systemSignals);
    if (matchingSignals.length > 0) {
      matches.push(...matchingSignals.map(s => ({
        signal: s,
        ruleId: rule.id,
        reasonCode: rule.reasonCode,
      })));
    }
  }

  // If we have matches, use the highest priority one
  if (matches.length > 0) {
    // Group by reason code to find the highest priority match
    const firstMatch = matches[0];
    const rule = sortedRules.find(r => r.id === firstMatch.ruleId)!;
    const matchingSignals = matches.filter(m => m.ruleId === firstMatch.ruleId);

    return {
      systemId,
      status: rule.resultStatus,
      reason: generateReasonText(rule, matchingSignals.map(m => m.signal)),
      reasonCodes: [rule.reasonCode],
      contributingSignals: matchingSignals.map(m => m.signal.id),
      ts: now,
    };
  }

  // No rule matched = Active
  return {
    systemId,
    status: 'Active',
    reason: 'All health checks passed',
    reasonCodes: ['ALL_CHECKS_PASSED'],
    contributingSignals: systemSignals.map(s => s.id),
    ts: now,
  };
}

/**
 * Evaluates a single rule against signals.
 * Returns matching signals if the rule condition is met.
 */
function evaluateRule(rule: StatusRule, signals: Signal[]): Signal[] {
  const matches: Signal[] = [];

  for (const signal of signals) {
    if (matchesRuleCondition(rule, signal)) {
      matches.push(signal);
    }
  }

  return matches;
}

/**
 * Checks if a signal matches a rule's condition.
 * This is a simplified implementation - in production you'd want a proper expression evaluator.
 */
function matchesRuleCondition(rule: StatusRule, signal: Signal): boolean {
  switch (rule.reasonCode) {
    case 'CMDB_MAINTENANCE':
      return (
        signal.source === 'servicenow' &&
        (
          (signal.metric === 'cmdb_lifecycle' && signal.value === 'maintenance') ||
          (signal.metric === 'maintenance_scheduled' && signal.value === true)
        )
      );

    case 'CMDB_CHANGE_WINDOW':
      return (
        signal.source === 'servicenow' &&
        signal.metric === 'change_window' &&
        signal.value === true
      );

    case 'VCENTER_VM_OFF':
      return (
        signal.source === 'vcenter' &&
        signal.metric === 'vm_power_state' &&
        (signal.value === 'poweredOff' || signal.value === 'suspended')
      );

    case 'CLOUD_INSTANCE_STOPPED':
      return (
        signal.source === 'cloud' &&
        signal.metric === 'instance_state' &&
        (signal.value === 'stopped' || signal.value === 'terminated' || signal.value === 'deallocated')
      );

    case 'PROM_TARGET_DOWN':
      return (
        signal.source === 'prometheus' &&
        signal.metric === 'prom_up' &&
        (signal.value === 0 || signal.value === false)
      );

    case 'AZURE_UNHEALTHY':
      return (
        signal.source === 'azureMonitor' &&
        signal.metric === 'resource_health' &&
        signal.value === 'Unhealthy'
      );

    case 'K8S_PODS_DEGRADED':
      return (
        signal.source === 'k8s' &&
        signal.metric === 'pod_ready_ratio' &&
        typeof signal.value === 'number' &&
        signal.value < 1
      );

    case 'K8S_HIGH_RESTARTS':
      return (
        signal.source === 'k8s' &&
        signal.metric === 'container_restarts' &&
        typeof signal.value === 'number' &&
        signal.value > 5
      );

    case 'PROM_ALERT_FIRING':
      return (
        signal.source === 'prometheus' &&
        signal.metric === 'alert_firing' &&
        signal.value === true
      );

    case 'SNOW_INCIDENT_ACTIVE':
      return (
        signal.source === 'servicenow' &&
        signal.metric === 'incident_active' &&
        signal.value === true
      );

    default:
      return false;
  }
}

/**
 * Generates human-readable reason text for a status decision.
 */
function generateReasonText(rule: StatusRule, signals: Signal[]): string {
  const signalDetails = signals.map(s => `${s.source}:${s.metric}=${s.value}`).join(', ');
  return `${rule.name}: ${signalDetails}`;
}

/**
 * Computes status for all systems.
 */
export function computeAllStatuses(
  systemIds: string[],
  signals: Signal[],
  rules: StatusRule[] = DEFAULT_STATUS_RULES
): StatusDecision[] {
  return systemIds.map(systemId => computeStatus(systemId, signals, rules));
}

/**
 * Gets a summary of status counts.
 */
export function getStatusSummary(decisions: StatusDecision[]): Record<SystemStatus, number> {
  const summary: Record<SystemStatus, number> = {
    Active: 0,
    Degraded: 0,
    Down: 0,
    Maintenance: 0,
    Unknown: 0,
  };

  for (const decision of decisions) {
    summary[decision.status]++;
  }

  return summary;
}
