// TelEnvIQ - Telco Classification Service
// Telco layer and subsystem inference and management

import prisma from '@/lib/db';
import type { TelcoLayer, TelcoSubsystem, TelcoClassificationSuggestion } from '@/types';
import { createEnrichment } from './governance/enrichment';

// Keyword patterns for telco layer inference
const LAYER_PATTERNS: Record<TelcoLayer, RegExp[]> = {
  BSS: [
    /billing/i, /crm/i, /customer/i, /revenue/i, /invoice/i, /payment/i,
    /order/i, /product/i, /catalog/i, /quote/i, /cpq/i, /subscription/i,
    /dunning/i, /collection/i, /rating/i, /charging/i, /selfservice/i,
    /portal/i, /ecommerce/i, /sales/i,
  ],
  OSS: [
    /provisioning/i, /activation/i, /inventory/i, /fault/i, /performance/i,
    /assurance/i, /service.*management/i, /network.*management/i,
    /monitoring/i, /orchestration/i, /nfv/i, /sdn/i, /ems/i, /nms/i,
    /trouble.*ticket/i, /work.*order/i, /resource/i,
  ],
  NETWORK: [
    /core/i, /ran/i, /radio/i, /packet/i, /switch/i, /router/i,
    /firewall/i, /load.*balancer/i, /dns/i, /dhcp/i, /aaa/i,
    /hss/i, /pcrf/i, /mme/i, /sgw/i, /pgw/i, /upf/i, /amf/i,
    /smsc/i, /mmsc/i, /ims/i, /voip/i, /sip/i, /diameter/i,
    /ggsn/i, /sgsn/i, /hlr/i, /vlr/i,
  ],
  SHARED: [
    /api.*gateway/i, /esb/i, /integration/i, /middleware/i,
    /message.*queue/i, /kafka/i, /rabbitmq/i, /redis/i,
    /database/i, /warehouse/i, /analytics/i, /reporting/i,
    /ldap/i, /identity/i, /sso/i, /oauth/i, /keycloak/i,
  ],
  EXTERNAL: [
    /partner/i, /vendor/i, /third.*party/i, /external/i,
    /api/i, /webhook/i, /callback/i, /payment.*gateway/i,
    /sms.*provider/i, /email.*provider/i,
  ],
};

// Keyword patterns for telco subsystem inference
const SUBSYSTEM_PATTERNS: Record<TelcoSubsystem, RegExp[]> = {
  CRM: [/crm/i, /customer.*relationship/i, /salesforce/i, /dynamics/i],
  CPQ: [/cpq/i, /configure.*price.*quote/i, /quote/i],
  BILLING: [/billing/i, /invoice/i, /payment/i, /amdocs/i, /netcracker/i],
  ORDER_MANAGEMENT: [/order/i, /oms/i, /order.*management/i, /commerce/i],
  REVENUE_ASSURANCE: [/revenue.*assurance/i, /fraud/i, /leakage/i],
  DUNNING: [/dunning/i, /collection/i, /debt/i],
  COLLECTIONS: [/collection/i, /debt.*recovery/i],
  PRODUCT_CATALOG: [/catalog/i, /product.*management/i, /pim/i],
  MEDIATION: [/mediation/i, /cdr/i, /call.*detail/i],
  RATING: [/rating/i, /charging/i, /tariff/i],
  PROVISIONING: [/provisioning/i, /activation/i],
  ACTIVATION: [/activation/i, /service.*activation/i],
  INVENTORY: [/inventory/i, /resource.*inventory/i],
  FAULT_MANAGEMENT: [/fault/i, /alarm/i, /trouble.*ticket/i],
  PERFORMANCE_MANAGEMENT: [/performance/i, /kpi/i, /metric/i],
  SERVICE_ASSURANCE: [/assurance/i, /sla/i, /quality/i],
  NETWORK_MONITORING: [/monitoring/i, /observability/i, /grafana/i, /prometheus/i],
  AAA: [/aaa/i, /authentication/i, /authorization/i, /radius/i],
  HSS: [/hss/i, /home.*subscriber/i],
  PCRF: [/pcrf/i, /policy/i, /charging.*rules/i],
  SMSC: [/smsc/i, /sms.*center/i],
  MMSC: [/mmsc/i, /mms.*center/i],
  IMS: [/ims/i, /ip.*multimedia/i, /volte/i],
  VAS: [/vas/i, /value.*added/i, /ringback/i, /voicemail/i],
  CHANNEL: [/channel/i, /portal/i, /mobile.*app/i, /web/i, /ivr/i],
  API_GATEWAY: [/api.*gateway/i, /kong/i, /apigee/i, /mulesoft/i],
  INTEGRATION: [/integration/i, /esb/i, /middleware/i],
  DATA_WAREHOUSE: [/warehouse/i, /dwh/i, /data.*lake/i, /snowflake/i],
  ANALYTICS: [/analytics/i, /bi/i, /reporting/i, /tableau/i, /powerbi/i],
  OTHER: [],
};

// Infer telco layer from node name and metadata
function inferTelcoLayer(name: string, metadata?: Record<string, unknown> | null): TelcoLayer | null {
  const searchText = [
    name,
    metadata?.description as string,
    metadata?.labels ? Object.values(metadata.labels).join(' ') : '',
    metadata?.annotations ? Object.values(metadata.annotations).join(' ') : '',
  ].filter(Boolean).join(' ');

  for (const [layer, patterns] of Object.entries(LAYER_PATTERNS) as [TelcoLayer, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(searchText)) {
        return layer;
      }
    }
  }

  return null;
}

// Infer telco subsystem from node name and metadata
function inferTelcoSubsystem(name: string, metadata?: Record<string, unknown> | null): TelcoSubsystem | null {
  const searchText = [
    name,
    metadata?.description as string,
    metadata?.labels ? Object.values(metadata.labels).join(' ') : '',
    metadata?.annotations ? Object.values(metadata.annotations).join(' ') : '',
  ].filter(Boolean).join(' ');

  for (const [subsystem, patterns] of Object.entries(SUBSYSTEM_PATTERNS) as [TelcoSubsystem, RegExp[]][]) {
    if (patterns.length === 0) continue;
    for (const pattern of patterns) {
      if (pattern.test(searchText)) {
        return subsystem;
      }
    }
  }

  return null;
}

// Get classification suggestion for a node
export function getClassificationSuggestion(
  nodeId: string,
  nodeName: string,
  metadata?: Record<string, unknown> | null
): TelcoClassificationSuggestion | null {
  const suggestedLayer = inferTelcoLayer(nodeName, metadata);
  const suggestedSubsystem = inferTelcoSubsystem(nodeName, metadata);

  if (!suggestedLayer && !suggestedSubsystem) {
    return null;
  }

  return {
    nodeId,
    suggestedLayer: suggestedLayer || 'SHARED',
    suggestedSubsystem: suggestedSubsystem || 'OTHER',
    confidence: suggestedLayer && suggestedSubsystem ? 0.8 : 0.5,
    reason: `Inferred from node name "${nodeName}"${metadata ? ' and metadata' : ''}`,
  };
}

// Update telco classification for a node
export async function updateTelcoClassification(
  nodeId: string,
  data: {
    telcoLayer?: TelcoLayer;
    telcoSubsystem?: TelcoSubsystem;
  },
  updatedBy: string
) {
  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    select: { telcoLayer: true, telcoSubsystem: true },
  });

  if (!node) {
    throw new Error(`Node with id ${nodeId} not found`);
  }

  // Create enrichments for tracking
  if (data.telcoLayer && data.telcoLayer !== node.telcoLayer) {
    await createEnrichment({
      nodeId,
      fieldName: 'telcoLayer',
      newValue: data.telcoLayer,
      reason: 'Telco layer classification update',
      editedBy: updatedBy,
    });
  }

  if (data.telcoSubsystem && data.telcoSubsystem !== node.telcoSubsystem) {
    await createEnrichment({
      nodeId,
      fieldName: 'telcoSubsystem',
      newValue: data.telcoSubsystem,
      reason: 'Telco subsystem classification update',
      editedBy: updatedBy,
    });
  }

  return prisma.node.update({
    where: { id: nodeId },
    data: {
      telcoLayer: data.telcoLayer,
      telcoSubsystem: data.telcoSubsystem,
    },
  });
}

// Get node telco classification
export async function getNodeTelcoClassification(nodeId: string) {
  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    select: {
      id: true,
      name: true,
      telcoLayer: true,
      telcoSubsystem: true,
      metadata: true,
    },
  });

  if (!node) {
    return null;
  }

  const suggestion = getClassificationSuggestion(
    node.id,
    node.name,
    node.metadata as Record<string, unknown> | null
  );

  return {
    current: {
      layer: node.telcoLayer,
      subsystem: node.telcoSubsystem,
    },
    suggestion,
  };
}

// Bulk classify nodes in an environment
export async function bulkClassifyEnvironment(environmentId: string, overwriteExisting: boolean = false) {
  const nodes = await prisma.node.findMany({
    where: {
      environmentId,
      ...(overwriteExisting ? {} : { telcoLayer: null }),
    },
    select: {
      id: true,
      name: true,
      metadata: true,
    },
  });

  const updates: Array<{
    nodeId: string;
    layer: TelcoLayer;
    subsystem: TelcoSubsystem;
  }> = [];

  for (const node of nodes) {
    const suggestion = getClassificationSuggestion(
      node.id,
      node.name,
      node.metadata as Record<string, unknown> | null
    );

    if (suggestion) {
      updates.push({
        nodeId: node.id,
        layer: suggestion.suggestedLayer,
        subsystem: suggestion.suggestedSubsystem,
      });
    }
  }

  // Apply updates
  for (const update of updates) {
    await prisma.node.update({
      where: { id: update.nodeId },
      data: {
        telcoLayer: update.layer,
        telcoSubsystem: update.subsystem,
      },
    });
  }

  return {
    totalNodes: nodes.length,
    classifiedCount: updates.length,
    skippedCount: nodes.length - updates.length,
  };
}

// Get telco classification summary for an environment
export async function getTelcoClassificationSummary(environmentId?: string) {
  const where = environmentId ? { environmentId } : {};

  const [byLayer, bySubsystem, unclassified] = await Promise.all([
    prisma.node.groupBy({
      by: ['telcoLayer'],
      where: { ...where, telcoLayer: { not: null } },
      _count: { telcoLayer: true },
    }),
    prisma.node.groupBy({
      by: ['telcoSubsystem'],
      where: { ...where, telcoSubsystem: { not: null } },
      _count: { telcoSubsystem: true },
    }),
    prisma.node.count({
      where: { ...where, telcoLayer: null },
    }),
  ]);

  return {
    byLayer: Object.fromEntries(
      byLayer.map((l) => [l.telcoLayer!, l._count.telcoLayer])
    ) as Partial<Record<TelcoLayer, number>>,
    bySubsystem: Object.fromEntries(
      bySubsystem.map((s) => [s.telcoSubsystem!, s._count.telcoSubsystem])
    ) as Partial<Record<TelcoSubsystem, number>>,
    unclassifiedCount: unclassified,
  };
}

// Get nodes by telco layer
export async function getNodesByTelcoLayer(layer: TelcoLayer, environmentId?: string) {
  const where: Record<string, unknown> = { telcoLayer: layer };
  if (environmentId) where.environmentId = environmentId;

  return prisma.node.findMany({
    where,
    include: {
      databaseMetadata: true,
      environment: {
        select: { id: true, name: true, type: true },
      },
    },
  });
}

// Get nodes by telco subsystem
export async function getNodesByTelcoSubsystem(subsystem: TelcoSubsystem, environmentId?: string) {
  const where: Record<string, unknown> = { telcoSubsystem: subsystem };
  if (environmentId) where.environmentId = environmentId;

  return prisma.node.findMany({
    where,
    include: {
      databaseMetadata: true,
      environment: {
        select: { id: true, name: true, type: true },
      },
    },
  });
}
