// Nexorium Core - Connector Source Preview
// Runs a file-based connector's fetch() and map(), then checks the canonical payload.
// Never calls upsert() or run(): no ConnectorRun record, no entity writes, no database access.

import { createConnectorV2 } from './index';
import type { CanonicalDiscoveryPayload, IConnector } from './types';
import {
  checkPayloadIntegrity,
  countPayload,
  createFinding,
  sortFindings,
  type IntegrityFinding,
  type PayloadCounts,
} from './payload-integrity';
import { resolvePreviewSource, type PreviewConnectorType } from './preview-source';

/** Placeholder. File-based connectors read environmentId only in upsert() and run(), which preview never calls. */
export const PREVIEW_ENVIRONMENT_ID = '00000000-0000-0000-0000-000000000000';

export interface PreviewResult {
  connectorType: PreviewConnectorType;
  source: string;
  /** Files the connector read. */
  sourceFiles: string[];
  counts: PayloadCounts;
  /** Connector warnings and errors, then integrity findings, sorted by severity, code and location. */
  findings: IntegrityFinding[];
  /** The canonical payload map() produced. Empty when fetch() or map() failed. */
  payload: CanonicalDiscoveryPayload;
}

export function emptyPayload(): CanonicalDiscoveryPayload {
  return {
    networkContexts: [],
    hosts: [],
    components: [],
    componentInstances: [],
    endpoints: [],
    deployedVersions: [],
    connections: [],
  };
}

/**
 * Previews what a connector would ingest from a source, without touching the database.
 * Throws PreviewSourceError when the source is missing, unreadable or the wrong kind of path.
 * Connector failures are returned as E_CONNECTOR_ERROR findings, not thrown.
 */
export async function previewConnectorSource(
  type: PreviewConnectorType,
  source: string,
): Promise<PreviewResult> {
  const resolved = resolvePreviewSource(type, source);
  const connector: IConnector = createConnectorV2({
    type,
    environmentId: PREVIEW_ENVIRONMENT_ID,
    dryRun: true,
    options: resolved.options,
  });

  let payload = emptyPayload();
  let failure: string | null = null;
  try {
    payload = await connector.map(await connector.fetch());
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
  }

  // Warnings recorded during fetch() and map() mean the connector skipped part of the source
  // (an unparseable manifest, an unreadable CSV file) and carried on. A preview treats that as an
  // error: the skipped records would be missing from the environment without a failed run.
  const report = connector.report();
  const findings: IntegrityFinding[] = [
    ...report.errors.map((message) => createFinding('E_CONNECTOR_ERROR', 'connector', message)),
    ...report.warnings.map((message) => createFinding('E_PARTIAL_SOURCE', 'connector', message)),
  ];
  if (failure !== null && report.errors.length === 0) {
    // Some connectors throw from map() without recording the failure in report().
    findings.push(createFinding('E_CONNECTOR_ERROR', 'connector', `The ${type} connector failed: ${failure}`));
  }
  if (failure === null) {
    findings.push(...checkPayloadIntegrity(payload));
  }

  return {
    connectorType: type,
    source,
    sourceFiles: resolved.files,
    counts: countPayload(payload),
    findings: sortFindings(findings),
    payload,
  };
}
