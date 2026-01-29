// Nexorium Core - Health & Status Store
// Zustand store with localStorage persistence for health status data

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Signal,
  StatusDecision,
  SystemIdentityMapping,
  ConnectorStatus,
  StatusRule,
  SignalSource,
} from './types';
import { generateSignalId } from './types';
import { computeStatus, computeAllStatuses, DEFAULT_STATUS_RULES } from './engine';

// ============================================
// STORE STATE
// ============================================

interface HealthStatusState {
  // Data
  signals: Signal[];
  decisions: StatusDecision[];
  mappings: SystemIdentityMapping[];
  connectors: ConnectorStatus[];
  rules: StatusRule[];

  // Actions
  addSignal: (signal: Omit<Signal, 'id'>) => void;
  removeSignal: (signalId: string) => void;
  clearSignals: (systemId?: string) => void;

  updateMapping: (systemId: string, updates: Partial<SystemIdentityMapping>) => void;
  addMapping: (mapping: SystemIdentityMapping) => void;
  removeMapping: (systemId: string) => void;

  setConnectorStatus: (source: SignalSource, status: Partial<ConnectorStatus>) => void;

  recomputeAllStatuses: () => void;
  getDecisionForSystem: (systemId: string) => StatusDecision | undefined;
  getSignalsForSystem: (systemId: string) => Signal[];

  // Demo data
  loadDemoData: () => void;
  resetStore: () => void;
}

// ============================================
// DEMO DATA
// ============================================

const DEMO_SYSTEMS: SystemIdentityMapping[] = [
  {
    systemId: 'sys-crm',
    systemName: 'Salesforce CRM',
    cmdbCiId: 'CI00012345',
    k8sNamespace: 'bss-prod',
    k8sAppLabel: 'salesforce-crm',
    vcenterVmNames: ['vm-crm-app-01', 'vm-crm-app-02'],
    cloudResourceIds: [],
    endpoints: ['https://crm.telco.internal:8443'],
  },
  {
    systemId: 'sys-billing',
    systemName: 'Billing Engine',
    cmdbCiId: 'CI00012346',
    k8sNamespace: 'bss-prod',
    k8sAppLabel: 'billing-engine',
    vcenterVmNames: ['vm-billing-01', 'vm-billing-02'],
    cloudResourceIds: [],
    endpoints: ['https://billing.telco.internal:8443'],
  },
  {
    systemId: 'sys-cpq',
    systemName: 'CPQ Engine',
    cmdbCiId: 'CI00012347',
    k8sNamespace: 'bss-prod',
    k8sAppLabel: 'cpq-engine',
    vcenterVmNames: ['vm-cpq-01'],
    cloudResourceIds: [],
    endpoints: ['https://cpq.telco.internal:8080'],
  },
  {
    systemId: 'sys-oms',
    systemName: 'Order Management',
    cmdbCiId: 'CI00012348',
    k8sNamespace: 'oss-prod',
    k8sAppLabel: 'order-mgmt',
    vcenterVmNames: [],
    cloudResourceIds: ['arn:aws:ec2:ap-southeast-2:123456789:instance/i-0abc123'],
    endpoints: ['https://oms.telco.internal:8443'],
  },
  {
    systemId: 'sys-inventory',
    systemName: 'Inventory Service',
    cmdbCiId: 'CI00012349',
    k8sNamespace: 'oss-prod',
    k8sAppLabel: 'inventory-svc',
    vcenterVmNames: [],
    cloudResourceIds: ['arn:aws:ec2:ap-southeast-2:123456789:instance/i-0def456'],
    endpoints: ['https://inventory.telco.internal:8080'],
  },
  {
    systemId: 'sys-provisioning',
    systemName: 'Provisioning Engine',
    cmdbCiId: 'CI00012350',
    k8sNamespace: 'oss-prod',
    k8sAppLabel: 'provisioning',
    vcenterVmNames: ['vm-prov-01', 'vm-prov-02'],
    cloudResourceIds: [],
    endpoints: ['https://prov.telco.internal:8443'],
  },
  {
    systemId: 'sys-kong',
    systemName: 'Kong API Gateway',
    cmdbCiId: 'CI00012351',
    k8sNamespace: 'dmz-prod',
    k8sAppLabel: 'kong-gateway',
    vcenterVmNames: [],
    cloudResourceIds: ['/subscriptions/xxx/resourceGroups/rg-dmz/providers/Microsoft.Compute/virtualMachines/vm-kong'],
    endpoints: ['https://api.telco.com:443'],
  },
  {
    systemId: 'sys-nso',
    systemName: 'Cisco NSO',
    cmdbCiId: 'CI00012352',
    k8sNamespace: '',
    k8sAppLabel: '',
    vcenterVmNames: ['vm-nso-01'],
    cloudResourceIds: [],
    endpoints: ['https://nso.telco.internal:8888'],
  },
  {
    systemId: 'sys-oracle-db',
    systemName: 'Oracle RAC Database',
    cmdbCiId: 'CI00012353',
    k8sNamespace: '',
    k8sAppLabel: '',
    vcenterVmNames: ['vm-ora-rac-01', 'vm-ora-rac-02'],
    cloudResourceIds: [],
    endpoints: ['oracle://ora-scan.telco.internal:1521'],
  },
  {
    systemId: 'sys-kafka',
    systemName: 'Kafka Cluster',
    cmdbCiId: 'CI00012354',
    k8sNamespace: 'infra-prod',
    k8sAppLabel: 'kafka-cluster',
    vcenterVmNames: [],
    cloudResourceIds: ['arn:aws:kafka:ap-southeast-2:123456789:cluster/kafka-prod'],
    endpoints: ['kafka://kafka.telco.internal:9092'],
  },
  {
    systemId: 'sys-payment',
    systemName: 'Payment Gateway',
    cmdbCiId: 'CI00012355',
    k8sNamespace: '',
    k8sAppLabel: '',
    vcenterVmNames: [],
    cloudResourceIds: [],
    endpoints: ['https://payments.stripe.com'],
  },
  {
    systemId: 'sys-sms',
    systemName: 'SMS Gateway',
    cmdbCiId: 'CI00012356',
    k8sNamespace: '',
    k8sAppLabel: '',
    vcenterVmNames: [],
    cloudResourceIds: [],
    endpoints: ['https://api.twilio.com'],
  },
];

function generateDemoSignals(): Signal[] {
  const now = new Date();
  const signals: Signal[] = [];

  // Helper to create timestamps
  const ts = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60000).toISOString();

  // System 1: CRM - Active (all healthy)
  signals.push(
    { id: generateSignalId(), systemId: 'sys-crm', source: 'k8s', metric: 'pod_ready_ratio', value: 1, ts: ts(2), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-crm', source: 'prometheus', metric: 'prom_up', value: 1, ts: ts(1), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-crm', source: 'servicenow', metric: 'cmdb_lifecycle', value: 'operational', ts: ts(30), confidence: 1 }
  );

  // System 2: Billing - Degraded (K8s pods not fully ready)
  signals.push(
    { id: generateSignalId(), systemId: 'sys-billing', source: 'k8s', metric: 'pod_ready_ratio', value: 0.67, ts: ts(1), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-billing', source: 'k8s', metric: 'container_restarts', value: 3, ts: ts(1), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-billing', source: 'prometheus', metric: 'prom_up', value: 1, ts: ts(1), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-billing', source: 'servicenow', metric: 'cmdb_lifecycle', value: 'operational', ts: ts(30), confidence: 1 }
  );

  // System 3: CPQ - Maintenance (CMDB indicates maintenance)
  signals.push(
    { id: generateSignalId(), systemId: 'sys-cpq', source: 'servicenow', metric: 'cmdb_lifecycle', value: 'maintenance', ts: ts(5), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-cpq', source: 'servicenow', metric: 'maintenance_scheduled', value: true, ts: ts(5), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-cpq', source: 'k8s', metric: 'pod_ready_ratio', value: 0, ts: ts(5), confidence: 1 }
  );

  // System 4: OMS - Active
  signals.push(
    { id: generateSignalId(), systemId: 'sys-oms', source: 'cloud', metric: 'instance_state', value: 'running', ts: ts(1), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-oms', source: 'prometheus', metric: 'prom_up', value: 1, ts: ts(1), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-oms', source: 'servicenow', metric: 'cmdb_lifecycle', value: 'operational', ts: ts(30), confidence: 1 }
  );

  // System 5: Inventory - Down (Prometheus target down)
  signals.push(
    { id: generateSignalId(), systemId: 'sys-inventory', source: 'prometheus', metric: 'prom_up', value: 0, ts: ts(3), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-inventory', source: 'cloud', metric: 'instance_state', value: 'running', ts: ts(1), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-inventory', source: 'servicenow', metric: 'incident_active', value: true, ts: ts(3), confidence: 1 }
  );

  // System 6: Provisioning - Active
  signals.push(
    { id: generateSignalId(), systemId: 'sys-provisioning', source: 'vcenter', metric: 'vm_power_state', value: 'poweredOn', ts: ts(1), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-provisioning', source: 'prometheus', metric: 'prom_up', value: 1, ts: ts(1), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-provisioning', source: 'k8s', metric: 'pod_ready_ratio', value: 1, ts: ts(1), confidence: 1 }
  );

  // System 7: Kong - Degraded (high restarts)
  signals.push(
    { id: generateSignalId(), systemId: 'sys-kong', source: 'k8s', metric: 'pod_ready_ratio', value: 1, ts: ts(1), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-kong', source: 'k8s', metric: 'container_restarts', value: 8, ts: ts(1), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-kong', source: 'azureMonitor', metric: 'resource_health', value: 'Available', ts: ts(5), confidence: 1 }
  );

  // System 8: NSO - Down (VM powered off)
  signals.push(
    { id: generateSignalId(), systemId: 'sys-nso', source: 'vcenter', metric: 'vm_power_state', value: 'poweredOff', ts: ts(10), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-nso', source: 'servicenow', metric: 'cmdb_lifecycle', value: 'operational', ts: ts(30), confidence: 1 }
  );

  // System 9: Oracle DB - Active
  signals.push(
    { id: generateSignalId(), systemId: 'sys-oracle-db', source: 'vcenter', metric: 'vm_power_state', value: 'poweredOn', ts: ts(1), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-oracle-db', source: 'prometheus', metric: 'prom_up', value: 1, ts: ts(1), confidence: 1 }
  );

  // System 10: Kafka - Active
  signals.push(
    { id: generateSignalId(), systemId: 'sys-kafka', source: 'k8s', metric: 'pod_ready_ratio', value: 1, ts: ts(1), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-kafka', source: 'prometheus', metric: 'prom_up', value: 1, ts: ts(1), confidence: 1 },
    { id: generateSignalId(), systemId: 'sys-kafka', source: 'cloud', metric: 'service_health', value: 'healthy', ts: ts(5), confidence: 1 }
  );

  // System 11: Payment Gateway - Unknown (external, no signals)
  // No signals for this system

  // System 12: SMS Gateway - Active (external but monitored)
  signals.push(
    { id: generateSignalId(), systemId: 'sys-sms', source: 'prometheus', metric: 'prom_up', value: 1, ts: ts(1), confidence: 0.8 }
  );

  return signals;
}

function generateDemoConnectors(): ConnectorStatus[] {
  const now = new Date();
  const ts = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60000).toISOString();

  return [
    { source: 'k8s', connected: true, lastSyncTime: ts(1), signalsProduced: 12 },
    { source: 'vcenter', connected: true, lastSyncTime: ts(5), signalsProduced: 6 },
    { source: 'cloud', connected: true, lastSyncTime: ts(2), signalsProduced: 4 },
    { source: 'prometheus', connected: true, lastSyncTime: ts(1), signalsProduced: 10 },
    { source: 'azureMonitor', connected: true, lastSyncTime: ts(5), signalsProduced: 1 },
    { source: 'servicenow', connected: true, lastSyncTime: ts(30), signalsProduced: 8 },
  ];
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useHealthStatusStore = create<HealthStatusState>()(
  persist(
    (set, get) => ({
      // Initial state
      signals: [],
      decisions: [],
      mappings: [],
      connectors: [],
      rules: DEFAULT_STATUS_RULES,

      // Actions
      addSignal: (signal) => {
        const newSignal: Signal = {
          ...signal,
          id: generateSignalId(),
        };
        set((state) => ({
          signals: [...state.signals, newSignal],
        }));
        get().recomputeAllStatuses();
      },

      removeSignal: (signalId) => {
        set((state) => ({
          signals: state.signals.filter((s) => s.id !== signalId),
        }));
        get().recomputeAllStatuses();
      },

      clearSignals: (systemId) => {
        set((state) => ({
          signals: systemId
            ? state.signals.filter((s) => s.systemId !== systemId)
            : [],
        }));
        get().recomputeAllStatuses();
      },

      updateMapping: (systemId, updates) => {
        set((state) => ({
          mappings: state.mappings.map((m) =>
            m.systemId === systemId
              ? { ...m, ...updates, lastUpdated: new Date().toISOString() }
              : m
          ),
        }));
      },

      addMapping: (mapping) => {
        set((state) => ({
          mappings: [...state.mappings, { ...mapping, lastUpdated: new Date().toISOString() }],
        }));
      },

      removeMapping: (systemId) => {
        set((state) => ({
          mappings: state.mappings.filter((m) => m.systemId !== systemId),
        }));
      },

      setConnectorStatus: (source, status) => {
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.source === source ? { ...c, ...status } : c
          ),
        }));
      },

      recomputeAllStatuses: () => {
        const { signals, mappings, rules } = get();
        const systemIds = mappings.map((m) => m.systemId);
        const decisions = computeAllStatuses(systemIds, signals, rules);
        set({ decisions });
      },

      getDecisionForSystem: (systemId) => {
        return get().decisions.find((d) => d.systemId === systemId);
      },

      getSignalsForSystem: (systemId) => {
        return get().signals.filter((s) => s.systemId === systemId);
      },

      loadDemoData: () => {
        const signals = generateDemoSignals();
        const connectors = generateDemoConnectors();
        const mappings = DEMO_SYSTEMS;

        set({
          signals,
          connectors,
          mappings,
          rules: DEFAULT_STATUS_RULES,
        });

        // Compute statuses after loading
        const systemIds = mappings.map((m) => m.systemId);
        const decisions = computeAllStatuses(systemIds, signals, DEFAULT_STATUS_RULES);
        set({ decisions });
      },

      resetStore: () => {
        set({
          signals: [],
          decisions: [],
          mappings: [],
          connectors: [],
          rules: DEFAULT_STATUS_RULES,
        });
      },
    }),
    {
      name: 'nexorium-health-status',
      partialize: (state) => ({
        signals: state.signals,
        mappings: state.mappings,
        connectors: state.connectors,
        rules: state.rules,
      }),
    }
  )
);

// ============================================
// INITIALIZATION HOOK
// ============================================

export function useInitializeHealthStatus() {
  const { mappings, loadDemoData } = useHealthStatusStore();

  // Auto-load demo data if store is empty
  if (mappings.length === 0) {
    loadDemoData();
  }
}
