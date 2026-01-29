/**
 * Synthetic graph data generator for testing and playground
 */

import type {
  CanonicalEnvironmentGraph,
  CanonicalGraphNode,
  CanonicalGraphEdge,
  PlaygroundNodeType,
  PlaygroundHostingType,
  PlaygroundNetworkZone,
  PlaygroundTelcoLayer,
  PlaygroundHealthStatus,
  PlaygroundProtocol,
} from './types';

// Distribution weights for realistic data generation
const NODE_TYPE_WEIGHTS: Array<{ type: PlaygroundNodeType; weight: number }> = [
  { type: 'application', weight: 0.30 },
  { type: 'service', weight: 0.25 },
  { type: 'database', weight: 0.15 },
  { type: 'gateway', weight: 0.10 },
  { type: 'external', weight: 0.10 },
  { type: 'runtime', weight: 0.10 },
];

const HOSTING_TYPE_WEIGHTS: Array<{ type: PlaygroundHostingType; weight: number }> = [
  { type: 'cloud', weight: 0.40 },
  { type: 'onprem', weight: 0.35 },
  { type: 'hybrid', weight: 0.15 },
  { type: 'thirdparty', weight: 0.08 },
  { type: 'unknown', weight: 0.02 },
];

const NETWORK_ZONE_WEIGHTS: Array<{ type: PlaygroundNetworkZone; weight: number }> = [
  { type: 'nonprod', weight: 0.40 },
  { type: 'prod', weight: 0.20 },
  { type: 'dmz', weight: 0.15 },
  { type: 'securecore', weight: 0.10 },
  { type: 'partner', weight: 0.08 },
  { type: 'lab', weight: 0.05 },
  { type: 'internet', weight: 0.02 },
];

const TELCO_LAYER_WEIGHTS: Array<{ type: PlaygroundTelcoLayer; weight: number }> = [
  { type: 'BSS', weight: 0.35 },
  { type: 'OSS', weight: 0.25 },
  { type: 'Network', weight: 0.15 },
  { type: 'Shared', weight: 0.15 },
  { type: 'External', weight: 0.10 },
];

const HEALTH_STATUS_WEIGHTS: Array<{ type: PlaygroundHealthStatus; weight: number }> = [
  { type: 'up', weight: 0.75 },
  { type: 'degraded', weight: 0.15 },
  { type: 'unknown', weight: 0.08 },
  { type: 'down', weight: 0.02 },
];

const PROTOCOL_WEIGHTS: Array<{ type: PlaygroundProtocol; weight: number }> = [
  { type: 'REST', weight: 0.45 },
  { type: 'MQ', weight: 0.20 },
  { type: 'JDBC', weight: 0.15 },
  { type: 'SFTP', weight: 0.08 },
  { type: 'EVENT', weight: 0.07 },
  { type: 'OTHER', weight: 0.05 },
];

// Realistic node name prefixes by type
const NODE_NAME_PREFIXES: Record<PlaygroundNodeType, string[]> = {
  application: ['CRM', 'Portal', 'Billing', 'OrderMgmt', 'Campaign', 'Loyalty', 'Analytics', 'Dashboard', 'Mobile', 'Web'],
  service: ['Auth', 'Payment', 'Notification', 'Customer', 'Product', 'Pricing', 'Quote', 'Inventory', 'Search', 'Report'],
  database: ['CustomerDB', 'ProductDB', 'OrderDB', 'BillingDB', 'AnalyticsDB', 'ConfigDB', 'AuditDB', 'SessionDB'],
  gateway: ['APIGateway', 'ESB', 'MessageBroker', 'LoadBalancer', 'Proxy', 'Firewall', 'Router'],
  external: ['Partner', 'Vendor', 'ThirdParty', 'ExternalAPI', 'CloudService', 'CDN', 'PaymentGateway'],
  runtime: ['K8sCluster', 'DockerHost', 'VMWare', 'Container', 'Serverless', 'Function'],
};

// Telco-specific names
const TELCO_NAMES: Record<PlaygroundTelcoLayer, string[]> = {
  BSS: ['Siebel', 'BRIM', 'Salesforce', 'Amdocs', 'NetCracker', 'CSG', 'Cerillion', 'Comverse'],
  OSS: ['ServiceNow', 'BMC', 'Netcool', 'Tivoli', 'CA', 'HP-NNMi', 'SolarWinds'],
  Network: ['Nokia', 'Ericsson', 'Huawei', 'Cisco', 'Juniper', 'ZTE', 'NEC'],
  Shared: ['Kafka', 'RabbitMQ', 'Redis', 'Elasticsearch', 'MongoDB', 'Postgres', 'Oracle'],
  External: ['AWS', 'Azure', 'GCP', 'Twilio', 'Stripe', 'SendGrid', 'Cloudflare'],
  Unknown: ['Legacy', 'Custom', 'Internal', 'Unknown'],
};

/**
 * Weighted random selection
 */
function weightedRandom<T>(items: Array<{ type: T; weight: number }>): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.type;
    }
  }

  return items[items.length - 1].type;
}

/**
 * Generate a random node name
 */
function generateNodeName(type: PlaygroundNodeType, layer: PlaygroundTelcoLayer, index: number): string {
  const prefixes = NODE_NAME_PREFIXES[type];
  const telcoNames = TELCO_NAMES[layer];

  const useTelcoName = Math.random() > 0.5 && telcoNames.length > 0;

  if (useTelcoName) {
    const baseName = telcoNames[Math.floor(Math.random() * telcoNames.length)];
    return `${baseName}-${index.toString().padStart(2, '0')}`;
  }

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix}-${String.fromCharCode(65 + (index % 26))}${Math.floor(index / 26) || ''}`;
}

/**
 * Generate random confidence score with realistic distribution
 */
function generateConfidence(): number {
  // Most nodes have high confidence, fewer have low
  const base = Math.random();
  if (base < 0.7) return 0.85 + Math.random() * 0.15; // 70% have 85-100%
  if (base < 0.9) return 0.6 + Math.random() * 0.25;  // 20% have 60-85%
  return 0.3 + Math.random() * 0.3;                    // 10% have 30-60%
}

/**
 * Generate a random date within the past N days
 */
function generateRecentDate(maxDaysAgo: number): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
}

/**
 * Generate a single random node
 */
function generateNode(index: number): CanonicalGraphNode {
  const type = weightedRandom(NODE_TYPE_WEIGHTS);
  const telcoLayer = weightedRandom(TELCO_LAYER_WEIGHTS);

  return {
    id: `node-${index.toString().padStart(4, '0')}`,
    label: generateNodeName(type, telcoLayer, index),
    type,
    hostingType: weightedRandom(HOSTING_TYPE_WEIGHTS),
    networkZone: weightedRandom(NETWORK_ZONE_WEIGHTS),
    telcoLayer,
    health: weightedRandom(HEALTH_STATUS_WEIGHTS),
    confidence: generateConfidence(),
    lastSeenAt: Math.random() > 0.1 ? generateRecentDate(30) : null,
    meta: {
      synthetic: true,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Generate edges with realistic topology
 * Creates approximately 2.5 edges per node on average
 */
function generateEdges(nodes: CanonicalGraphNode[]): CanonicalGraphEdge[] {
  const edges: CanonicalGraphEdge[] = [];
  const edgeCount = Math.floor(nodes.length * 2.5);

  // Group nodes by layer for realistic connections
  const nodesByLayer = new Map<PlaygroundTelcoLayer, CanonicalGraphNode[]>();
  for (const node of nodes) {
    const layer = node.telcoLayer;
    if (!nodesByLayer.has(layer)) {
      nodesByLayer.set(layer, []);
    }
    nodesByLayer.get(layer)!.push(node);
  }

  // Define allowed layer connections (telco flow direction)
  const layerFlow: [PlaygroundTelcoLayer, PlaygroundTelcoLayer][] = [
    ['External', 'BSS'],
    ['BSS', 'OSS'],
    ['OSS', 'Network'],
    ['BSS', 'Shared'],
    ['OSS', 'Shared'],
    ['Network', 'Shared'],
    ['Shared', 'External'],
    // Some same-layer connections
    ['BSS', 'BSS'],
    ['OSS', 'OSS'],
    ['Shared', 'Shared'],
  ];

  const usedEdges = new Set<string>();

  for (let i = 0; i < edgeCount; i++) {
    // Pick a layer connection pattern
    const [sourceLayer, targetLayer] = layerFlow[Math.floor(Math.random() * layerFlow.length)];

    const sourceNodes = nodesByLayer.get(sourceLayer) || [];
    const targetNodes = nodesByLayer.get(targetLayer) || [];

    if (sourceNodes.length === 0 || targetNodes.length === 0) continue;

    const source = sourceNodes[Math.floor(Math.random() * sourceNodes.length)];
    const target = targetNodes[Math.floor(Math.random() * targetNodes.length)];

    // Avoid self-loops and duplicates
    if (source.id === target.id) continue;
    const edgeKey = `${source.id}->${target.id}`;
    if (usedEdges.has(edgeKey)) continue;
    usedEdges.add(edgeKey);

    // Protocol based on node types
    let protocol = weightedRandom(PROTOCOL_WEIGHTS);
    if (target.type === 'database') protocol = 'JDBC';
    if (source.type === 'gateway' || target.type === 'gateway') protocol = 'REST';

    const confidence = generateConfidence();
    const isStale = Math.random() < 0.1; // 10% stale edges

    edges.push({
      id: `edge-${edges.length.toString().padStart(4, '0')}`,
      source: source.id,
      target: target.id,
      protocol,
      port: Math.random() > 0.5 ? Math.floor(Math.random() * 40000) + 1024 : undefined,
      confidence,
      lastObservedAt: generateRecentDate(14),
      stale: isStale,
    });
  }

  return edges;
}

/**
 * Generate a complete synthetic graph
 */
export function generateSyntheticGraph(nodeCount: number): CanonicalEnvironmentGraph {
  const nodes: CanonicalGraphNode[] = [];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push(generateNode(i));
  }

  const edges = generateEdges(nodes);

  return {
    environmentName: `Synthetic Environment (${nodeCount} nodes)`,
    environmentType: 'SYNTHETIC',
    nodes,
    edges,
  };
}

/**
 * Generate a small sample graph for quick testing
 */
export function generateSmallSampleGraph(): CanonicalEnvironmentGraph {
  return generateSyntheticGraph(20);
}

/**
 * Generate a medium sample graph
 */
export function generateMediumSampleGraph(): CanonicalEnvironmentGraph {
  return generateSyntheticGraph(200);
}

/**
 * Generate a large sample graph for performance testing
 */
export function generateLargeSampleGraph(): CanonicalEnvironmentGraph {
  return generateSyntheticGraph(1000);
}
