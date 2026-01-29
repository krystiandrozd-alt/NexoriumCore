/**
 * Zod validation schemas for canonical graph types
 */

import { z } from 'zod';

export const PlaygroundNodeTypeSchema = z.enum([
  'application',
  'service',
  'database',
  'gateway',
  'external',
  'runtime',
]);

export const PlaygroundHostingTypeSchema = z.enum([
  'cloud',
  'onprem',
  'hybrid',
  'thirdparty',
  'unknown',
]);

export const PlaygroundNetworkZoneSchema = z.enum([
  'prod',
  'nonprod',
  'dmz',
  'partner',
  'internet',
  'securecore',
  'lab',
  'unknown',
]);

export const PlaygroundTelcoLayerSchema = z.enum([
  'BSS',
  'OSS',
  'Network',
  'Shared',
  'External',
  'Unknown',
]);

export const PlaygroundHealthStatusSchema = z.enum([
  'up',
  'down',
  'degraded',
  'unknown',
]);

export const PlaygroundProtocolSchema = z.enum([
  'REST',
  'MQ',
  'JDBC',
  'SFTP',
  'EVENT',
  'OTHER',
]);

export const CanonicalGraphNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: PlaygroundNodeTypeSchema,
  hostingType: PlaygroundHostingTypeSchema,
  networkZone: PlaygroundNetworkZoneSchema,
  telcoLayer: PlaygroundTelcoLayerSchema,
  health: PlaygroundHealthStatusSchema,
  confidence: z.number().min(0).max(1),
  lastSeenAt: z.date().nullable(),
  meta: z.record(z.string(), z.unknown()),
});

export const CanonicalGraphEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  protocol: PlaygroundProtocolSchema,
  port: z.number().int().positive().optional(),
  label: z.string().optional(),
  confidence: z.number().min(0).max(1),
  lastObservedAt: z.date().optional(),
  stale: z.boolean(),
});

export const CanonicalEnvironmentGraphSchema = z.object({
  environmentId: z.string().optional(),
  environmentName: z.string().optional(),
  environmentType: z.string().optional(),
  nodes: z.array(CanonicalGraphNodeSchema),
  edges: z.array(CanonicalGraphEdgeSchema),
});

export type CanonicalGraphNodeInput = z.input<typeof CanonicalGraphNodeSchema>;
export type CanonicalGraphEdgeInput = z.input<typeof CanonicalGraphEdgeSchema>;
export type CanonicalEnvironmentGraphInput = z.input<typeof CanonicalEnvironmentGraphSchema>;

/**
 * Validate a graph and return typed result
 */
export function validateGraph(data: unknown) {
  return CanonicalEnvironmentGraphSchema.safeParse(data);
}

/**
 * Validate a single node
 */
export function validateNode(data: unknown) {
  return CanonicalGraphNodeSchema.safeParse(data);
}

/**
 * Validate a single edge
 */
export function validateEdge(data: unknown) {
  return CanonicalGraphEdgeSchema.safeParse(data);
}
