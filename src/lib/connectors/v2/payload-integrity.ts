// Nexorium Core - Canonical Payload Integrity Check
// Deterministic pre-ingestion checks for a CanonicalDiscoveryPayload.
//
// Reference resolution mirrors BaseConnectorV2.upsert(), so every finding states
// what upsert() would skip, merge or store without a link. The check is pure:
// no database access, no clock, no randomness. Same payload in, same findings out.

import type {
  CanonicalDiscoveryPayload,
  DiscoveredComponentInstance,
  DiscoveredNetworkContext,
} from './types';

export type IntegritySeverity = 'error' | 'warning';

interface IntegrityRule {
  severity: IntegritySeverity;
  /** The data-integrity rule, or the upsert() behaviour, that the finding protects. */
  rule: string;
}

/** Single source of truth for finding codes. Error codes start with E_, warnings with W_. */
export const INTEGRITY_RULES = {
  E_CONNECTOR_ERROR: {
    severity: 'error',
    rule: 'The connector reported an error, or threw, during fetch() or map().',
  },
  E_PARTIAL_SOURCE: {
    severity: 'error',
    rule: 'The connector recorded a warning in fetch() or map() and continued. In the current connectors this means a file could not be read or parsed, so its records are missing from the payload.',
  },
  E_EMPTY_PAYLOAD: {
    severity: 'error',
    rule: 'A source must produce at least one canonical entity.',
  },
  E_UNKNOWN_COMPONENT: {
    severity: 'error',
    rule: 'An instance must reference a component in the same payload; upsert() skips it otherwise, with its endpoints, versions and connections.',
  },
  E_DUPLICATE_INSTANCE: {
    severity: 'error',
    rule: 'Each deployment is declared once; upsert() merges a duplicate into the earlier record.',
  },
  E_AMBIGUOUS_INSTANCE_REF: {
    severity: 'error',
    rule: 'An instance reference (displayName or externalId) must identify exactly one instance.',
  },
  E_DANGLING_ENDPOINT_REF: {
    severity: 'error',
    rule: 'An Endpoint belongs to exactly one Deployment. No dangling references.',
  },
  E_DANGLING_VERSION_REF: {
    severity: 'error',
    rule: 'A deployed version must reference a declared instance. No dangling references.',
  },
  E_DANGLING_CONNECTION_REF: {
    severity: 'error',
    rule: 'An Interface must reference valid source and target Deployments.',
  },
  E_MISSING_PROJECT_VERSION: {
    severity: 'error',
    rule: 'project_version is mandatory for every Deployment.',
  },
  E_INVALID_VERSION_VALUE: {
    severity: 'error',
    rule: 'projectVersion, vendorVersion and buildRef must be strings. YAML reads unquoted values such as 1.10 as numbers (1.1).',
  },
  E_INVALID_PORT: {
    severity: 'error',
    rule: 'Ports are integers from 1 to 65535.',
  },
  E_UNKEYED_NETWORK_CONTEXT: {
    severity: 'error',
    rule: 'A network context needs an externalId or vpcVnet; without both, upsert() matches and overwrites an arbitrary existing record.',
  },
  W_UNRESOLVED_HOST_REF: {
    severity: 'warning',
    rule: 'upsert() links an instance only to a host in the same payload; the instance is stored without a host.',
  },
  W_UNRESOLVED_NETWORK_CONTEXT_REF: {
    severity: 'warning',
    rule: 'upsert() links a host only to a network context in the same payload; the host is stored without one.',
  },
  W_HOST_WITHOUT_NETWORK_CONTEXT: {
    severity: 'warning',
    rule: 'The payload defines network contexts, but this host references none of them.',
  },
  W_MISSING_DISPLAY_NAME: {
    severity: 'warning',
    rule: 'Without a displayName, upsert() generates one from the environment ID, so references by name cannot resolve.',
  },
  W_MULTIPLE_VERSIONS: {
    severity: 'warning',
    rule: 'One run should carry one deployed version per instance; several make the current version order-dependent.',
  },
  W_DUPLICATE_NETWORK_CONTEXT: {
    severity: 'warning',
    rule: 'upsert() merges a duplicate network context into the earlier record.',
  },
  W_DUPLICATE_HOST: {
    severity: 'warning',
    rule: 'Hostnames are unique per environment; upsert() merges a duplicate into the earlier record.',
  },
  W_DUPLICATE_COMPONENT: {
    severity: 'warning',
    rule: 'Component names are unique; upsert() applies only layer and capabilityType from a duplicate.',
  },
  W_DUPLICATE_ENDPOINT: {
    severity: 'warning',
    rule: 'upsert() merges a duplicate endpoint into the earlier record.',
  },
  W_DUPLICATE_CONNECTION: {
    severity: 'warning',
    rule: 'upsert() merges connections with the same source, target and protocol into one record.',
  },
  W_SELF_CONNECTION: {
    severity: 'warning',
    rule: 'A connection should link two different instances.',
  },
  W_PROTOCOL_UNSPECIFIED: {
    severity: 'warning',
    rule: 'A connection with protocol OTHER needs a protocolDetail, or the interface type is lost.',
  },
} as const satisfies Record<string, IntegrityRule>;

export type IntegrityCode = keyof typeof INTEGRITY_RULES;

export interface IntegrityFinding {
  severity: IntegritySeverity;
  code: IntegrityCode;
  /** Location in the canonical payload, e.g. "connections[3]". "payload" or "connector" for global findings. */
  path: string;
  message: string;
}

export type PayloadCounts = Record<keyof CanonicalDiscoveryPayload, number>;

export function countPayload(payload: CanonicalDiscoveryPayload): PayloadCounts {
  return {
    networkContexts: payload.networkContexts.length,
    hosts: payload.hosts.length,
    components: payload.components.length,
    componentInstances: payload.componentInstances.length,
    endpoints: payload.endpoints.length,
    deployedVersions: payload.deployedVersions.length,
    connections: payload.connections.length,
  };
}

export function createFinding(code: IntegrityCode, path: string, message: string): IntegrityFinding {
  return { severity: INTEGRITY_RULES[code].severity, code, path, message };
}

const SEVERITY_ORDER: Record<IntegritySeverity, number> = { error: 0, warning: 1 };

function splitPath(findingPath: string): [string, number] {
  const match = /^([A-Za-z]+)\[(\d+)\]$/.exec(findingPath);
  return match ? [match[1], Number(match[2])] : [findingPath, -1];
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Orders findings by severity, code, payload location, then message. */
export function sortFindings(findings: IntegrityFinding[]): IntegrityFinding[] {
  return [...findings].sort((a, b) => {
    if (a.severity !== b.severity) return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (a.code !== b.code) return compareText(a.code, b.code);
    const [aList, aIndex] = splitPath(a.path);
    const [bList, bIndex] = splitPath(b.path);
    if (aList !== bList) return compareText(aList, bList);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return compareText(a.message, b.message);
  });
}

function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

/** JSON-quotes a value for messages. Payload values can be any type at runtime (e.g. YAML numbers). */
function quote(value: unknown): string {
  // JSON.stringify(NaN) is "null"; a CSV port that is not a number parses to NaN.
  if (typeof value === 'number' && !Number.isFinite(value)) return String(value);
  return JSON.stringify(value ?? '');
}

function instanceLabel(instance: DiscoveredComponentInstance): string {
  return quote(instance.displayName || instance.externalId || instance.componentName);
}

type AddFinding = (code: IntegrityCode, path: string, message: string) => void;

// ============================================
// NETWORK CONTEXTS, HOSTS, COMPONENTS
// ============================================

/** Returns the keys upsert() registers network contexts under for host lookups. */
function checkNetworkContexts(payload: CanonicalDiscoveryPayload, add: AddFinding): Set<string> {
  const refKeys = new Set<string>();
  const created: Array<{ index: number; nc: DiscoveredNetworkContext }> = [];

  payload.networkContexts.forEach((nc, i) => {
    const path = `networkContexts[${i}]`;
    refKeys.add(nc.vpcVnet || nc.externalId || '');

    if (!nc.externalId && nc.vpcVnet === undefined) {
      const scope = nc.region === undefined
        ? 'any network context in the environment'
        : `any network context in region ${quote(nc.region)}`;
      add('E_UNKEYED_NETWORK_CONTEXT', path,
        `Network context has no externalId or vpcVnet. upsert() matches ${scope} and overwrites it. Set externalId or vpcVnet.`);
      return;
    }

    // upsert() looks up by sourceRecordId when externalId is set, otherwise by vpcVnet + region.
    // Prisma ignores a filter field whose value is undefined, so a missing region matches any region.
    const match = nc.externalId
      ? created.find((c) => c.nc.externalId === nc.externalId)
      : created.find((c) =>
          c.nc.vpcVnet === nc.vpcVnet && (nc.region === undefined || c.nc.region === nc.region));

    if (match) {
      add('W_DUPLICATE_NETWORK_CONTEXT', path,
        `Network context duplicates networkContexts[${match.index}]; upsert() merges it into that record. Remove the duplicate or give it a distinct externalId.`);
    } else {
      created.push({ index: i, nc });
    }
  });

  return refKeys;
}

/** Returns the hostnames upsert() can link instances to. */
function checkHosts(payload: CanonicalDiscoveryPayload, networkContextKeys: Set<string>, add: AddFinding): Set<string> {
  const firstIndexByHostname = new Map<string, number>();
  const networkContextCount = payload.networkContexts.length;

  payload.hosts.forEach((host, i) => {
    const path = `hosts[${i}]`;
    const earlier = firstIndexByHostname.get(host.hostname);
    if (earlier !== undefined) {
      add('W_DUPLICATE_HOST', path,
        `Host ${quote(host.hostname)} duplicates hosts[${earlier}]; upsert() merges it into that record.`);
    } else {
      firstIndexByHostname.set(host.hostname, i);
    }

    if (host.networkContextRef) {
      if (!networkContextKeys.has(host.networkContextRef)) {
        add('W_UNRESOLVED_NETWORK_CONTEXT_REF', path,
          `Host ${quote(host.hostname)} references network context ${quote(host.networkContextRef)}, which is not in this payload (matched on vpcVnet, else externalId). The host is stored without a network context.`);
      }
    } else if (networkContextCount > 0) {
      add('W_HOST_WITHOUT_NETWORK_CONTEXT', path,
        `Host ${quote(host.hostname)} has no networkContextRef although the payload defines ${networkContextCount} network context(s). The host is stored without hosting context.`);
    }
  });

  return new Set(firstIndexByHostname.keys());
}

function checkComponents(payload: CanonicalDiscoveryPayload, add: AddFinding): Set<string> {
  const firstIndexByName = new Map<string, number>();
  payload.components.forEach((component, i) => {
    const earlier = firstIndexByName.get(component.name);
    if (earlier !== undefined) {
      add('W_DUPLICATE_COMPONENT', `components[${i}]`,
        `Component ${quote(component.name)} duplicates components[${earlier}]; upsert() applies only its layer and capabilityType.`);
    } else {
      firstIndexByName.set(component.name, i);
    }
  });
  return new Set(firstIndexByName.keys());
}

// ============================================
// COMPONENT INSTANCES
// ============================================

interface InstanceIndex {
  /** Index of the record each instance is stored as: itself, or the earlier record it merges into. */
  identityOf: number[];
  /** Instances upsert() skips because their component is not in the payload. */
  skippedIndices: Set<number>;
  /** Reference key -> identity for stored instances. Last write wins, as in upsert(). */
  stored: Map<string, number>;
  /** Reference key -> index of a skipped instance. */
  skipped: Map<string, number>;
}

function checkInstances(
  payload: CanonicalDiscoveryPayload,
  componentNames: Set<string>,
  hostnames: Set<string>,
  add: AddFinding,
): InstanceIndex {
  const index: InstanceIndex = {
    identityOf: [],
    skippedIndices: new Set(),
    stored: new Map(),
    skipped: new Map(),
  };
  // Records upsert() creates. displayName tracks updates, because a merge renames the stored record.
  const created: Array<{ index: number; componentName: string; externalId?: string; displayName: string }> = [];

  payload.componentInstances.forEach((instance, i) => {
    const path = `componentInstances[${i}]`;
    const keys = Array.from(new Set(
      [instance.displayName, instance.externalId].filter((k): k is string => Boolean(k))));
    index.identityOf[i] = i;

    if (!componentNames.has(instance.componentName)) {
      // Reported by checkSkippedInstances() once dependent records are counted.
      index.skippedIndices.add(i);
      for (const key of keys) index.skipped.set(key, i);
      return;
    }

    if (!instance.displayName) {
      add('W_MISSING_DISPLAY_NAME', path,
        `Instance of ${quote(instance.componentName)} has no displayName; upsert() generates "<component>-<environment id>". Set displayName so endpoints, versions and connections can reference it.`);
    }

    if (instance.hostRef && !hostnames.has(instance.hostRef)) {
      add('W_UNRESOLVED_HOST_REF', path,
        `Instance ${instanceLabel(instance)} references host ${quote(instance.hostRef)}, which is not in this payload. upsert() resolves hosts only from the same run, so the instance is stored without a host.`);
    }

    // upsert() matches by sourceRecordId when externalId is set, otherwise by component + displayName.
    // An empty displayName becomes the same generated name for every instance of a component.
    const displayName = instance.displayName || '';
    const match = instance.externalId
      ? created.find((c) => c.externalId === instance.externalId)
      : created.find((c) => c.componentName === instance.componentName && c.displayName === displayName);

    if (match) {
      index.identityOf[i] = match.index;
      match.displayName = displayName;
      add('E_DUPLICATE_INSTANCE', path,
        `Instance ${instanceLabel(instance)} duplicates componentInstances[${match.index}]; upsert() merges it into that record. Remove the duplicate or give it a distinct externalId.`);
    } else {
      created.push({ index: i, componentName: instance.componentName, externalId: instance.externalId, displayName });
    }

    for (const key of keys) {
      const previous = index.stored.get(key);
      if (previous !== undefined && previous !== index.identityOf[i]) {
        add('E_AMBIGUOUS_INSTANCE_REF', path,
          `Reference ${quote(key)} identifies both componentInstances[${previous}] and this instance; upsert() resolves it to this later record. Make displayName and externalId values unique across instances.`);
      }
      index.stored.set(key, index.identityOf[i]);
    }
  });

  return index;
}

// ============================================
// DEPENDENT RECORDS
// ============================================

type Resolution =
  | { kind: 'stored'; identity: number }
  | { kind: 'skipped'; index: number }
  | { kind: 'dangling' };

function resolveRef(index: InstanceIndex, ref: string): Resolution {
  const identity = index.stored.get(ref);
  if (identity !== undefined) return { kind: 'stored', identity };
  const skippedIndex = index.skipped.get(ref);
  if (skippedIndex !== undefined) return { kind: 'skipped', index: skippedIndex };
  return { kind: 'dangling' };
}

/** Counts records that upsert() drops because they reference a skipped instance. */
type DependentCounter = (skippedIndex: number) => void;

function checkEndpoints(
  payload: CanonicalDiscoveryPayload,
  index: InstanceIndex,
  countDependent: DependentCounter,
  add: AddFinding,
): void {
  const created: Array<{ index: number; identity: number }> = [];

  payload.endpoints.forEach((endpoint, i) => {
    const path = `endpoints[${i}]`;
    const resolution = resolveRef(index, endpoint.componentInstanceRef);

    if (resolution.kind === 'dangling') {
      add('E_DANGLING_ENDPOINT_REF', path,
        `Endpoint ${quote(endpoint.value)} references instance ${quote(endpoint.componentInstanceRef)}, which matches no instance displayName or externalId. upsert() skips the endpoint.`);
      return;
    }
    if (resolution.kind === 'skipped') {
      countDependent(resolution.index);
      return;
    }

    if (endpoint.port !== undefined && !isValidPort(endpoint.port)) {
      add('E_INVALID_PORT', path,
        `Endpoint ${quote(endpoint.value)} has port ${quote(endpoint.port)}; expected an integer from 1 to 65535.`);
      return;
    }

    // upsert() matches on instance + kind + value + port; an undefined port matches any port.
    const match = created.find((c) => {
      const other = payload.endpoints[c.index];
      return c.identity === resolution.identity
        && other.kind === endpoint.kind
        && other.value === endpoint.value
        && (endpoint.port === undefined || other.port === endpoint.port);
    });
    if (match) {
      add('W_DUPLICATE_ENDPOINT', path,
        `Endpoint ${quote(endpoint.value)} duplicates endpoints[${match.index}]; upsert() merges it into that record.`);
    } else {
      created.push({ index: i, identity: resolution.identity });
    }
  });
}

const VERSION_TEXT_FIELDS = ['projectVersion', 'vendorVersion', 'buildRef'] as const;

function checkVersions(
  payload: CanonicalDiscoveryPayload,
  index: InstanceIndex,
  countDependent: DependentCounter,
  add: AddFinding,
): void {
  const versionsByIdentity = new Map<number, number[]>();

  payload.deployedVersions.forEach((version, i) => {
    const path = `deployedVersions[${i}]`;
    const resolution = resolveRef(index, version.componentInstanceRef);

    if (resolution.kind === 'dangling') {
      add('E_DANGLING_VERSION_REF', path,
        `Deployed version ${quote(version.projectVersion)} references instance ${quote(version.componentInstanceRef)}, which matches no instance displayName or externalId. upsert() skips the version.`);
      return;
    }
    if (resolution.kind === 'skipped') {
      countDependent(resolution.index);
      return;
    }

    const records = versionsByIdentity.get(resolution.identity) ?? [];
    records.push(i);
    versionsByIdentity.set(resolution.identity, records);

    for (const field of VERSION_TEXT_FIELDS) {
      const value: unknown = version[field];
      if (value !== undefined && value !== null && typeof value !== 'string') {
        add('E_INVALID_VERSION_VALUE', path,
          `${field} for instance ${quote(version.componentInstanceRef)} is the ${typeof value} ${quote(value)}, not a string. Quote it in the source; YAML reads unquoted versions such as 1.10 as numbers (1.1).`);
      }
    }

    const projectVersion: unknown = version.projectVersion;
    if (projectVersion === undefined || projectVersion === null
      || (typeof projectVersion === 'string' && !projectVersion.trim())) {
      add('E_MISSING_PROJECT_VERSION', path,
        `Deployed version for instance ${quote(version.componentInstanceRef)} has no projectVersion. Set the project version.`);
    }
  });

  payload.componentInstances.forEach((instance, i) => {
    // One finding per stored record: skip skipped instances and merged duplicates.
    if (index.skippedIndices.has(i) || index.identityOf[i] !== i) return;
    const records = versionsByIdentity.get(i) ?? [];
    if (records.length === 0) {
      add('E_MISSING_PROJECT_VERSION', `componentInstances[${i}]`,
        `Instance ${instanceLabel(instance)} has no deployed version. Every deployment must carry a project version.`);
    } else if (records.length > 1) {
      const where = records.map((r) => `deployedVersions[${r}]`).join(', ');
      add('W_MULTIPLE_VERSIONS', `componentInstances[${i}]`,
        `Instance ${instanceLabel(instance)} has ${records.length} deployed versions in one run (${where}); upsert() stores all of them and the current version depends on order.`);
    }
  });
}

function checkConnections(
  payload: CanonicalDiscoveryPayload,
  index: InstanceIndex,
  countDependent: DependentCounter,
  add: AddFinding,
): void {
  const created: Array<{ index: number; from: number; to: number }> = [];

  payload.connections.forEach((connection, i) => {
    const path = `connections[${i}]`;
    const label = `${quote(connection.fromComponentRef)} -> ${quote(connection.toComponentRef)} (${connection.protocolType})`;
    const from = resolveRef(index, connection.fromComponentRef);
    const to = resolveRef(index, connection.toComponentRef);

    const dangling: string[] = [];
    if (from.kind === 'dangling') dangling.push(`source ${quote(connection.fromComponentRef)}`);
    if (to.kind === 'dangling') dangling.push(`target ${quote(connection.toComponentRef)}`);
    if (dangling.length > 0) {
      add('E_DANGLING_CONNECTION_REF', path,
        `Connection ${label}: ${dangling.join(' and ')} ${dangling.length > 1 ? 'match' : 'matches'} no instance displayName or externalId. upsert() skips the connection.`);
      return;
    }
    if (from.kind === 'skipped' || to.kind === 'skipped') {
      if (from.kind === 'skipped') countDependent(from.index);
      if (to.kind === 'skipped' && !(from.kind === 'skipped' && from.index === to.index)) countDependent(to.index);
      return;
    }
    if (from.kind !== 'stored' || to.kind !== 'stored') return;

    if (from.identity === to.identity) {
      add('W_SELF_CONNECTION', path,
        `Connection ${label} starts and ends at the same instance.`);
    }

    if (connection.protocolType === 'OTHER' && !connection.protocolDetail) {
      add('W_PROTOCOL_UNSPECIFIED', path,
        `Connection ${label} has protocol OTHER and no protocolDetail, so the source protocol is not recorded. Map it to a standard protocol or set protocolDetail.`);
    }

    if (connection.port !== undefined && !isValidPort(connection.port)) {
      add('E_INVALID_PORT', path,
        `Connection ${label} has port ${quote(connection.port)}; expected an integer from 1 to 65535.`);
      return;
    }

    // upsert() matches on source + target + protocolType.
    const match = created.find((c) =>
      c.from === from.identity
      && c.to === to.identity
      && payload.connections[c.index].protocolType === connection.protocolType);
    if (match) {
      add('W_DUPLICATE_CONNECTION', path,
        `Connection ${label} duplicates connections[${match.index}]; upsert() merges them and keeps the later protocolDetail and port.`);
    } else {
      created.push({ index: i, from: from.identity, to: to.identity });
    }
  });
}

function reportSkippedInstances(
  payload: CanonicalDiscoveryPayload,
  index: InstanceIndex,
  dependents: Map<number, number>,
  add: AddFinding,
): void {
  for (const i of Array.from(index.skippedIndices)) {
    const instance = payload.componentInstances[i];
    const count = dependents.get(i) ?? 0;
    const alsoSkipped = count > 0
      ? ` and ${count} dependent record(s) (endpoints, deployed versions, connections)`
      : '';
    add('E_UNKNOWN_COMPONENT', `componentInstances[${i}]`,
      `Instance ${instanceLabel(instance)} references component ${quote(instance.componentName)}, which is not in this payload's components. upsert() skips the instance${alsoSkipped}. Add the component or correct componentName.`);
  }
}

// ============================================
// ENTRY POINT
// ============================================

/**
 * Checks a canonical payload against Nexorium Core data-integrity rules.
 * Returns findings sorted by severity, code and payload location.
 */
export function checkPayloadIntegrity(payload: CanonicalDiscoveryPayload): IntegrityFinding[] {
  const findings: IntegrityFinding[] = [];
  const add: AddFinding = (code, path, message) => {
    findings.push(createFinding(code, path, message));
  };

  const total = Object.values(countPayload(payload)).reduce((sum, n) => sum + n, 0);
  if (total === 0) {
    add('E_EMPTY_PAYLOAD', 'payload',
      'The source produced no network contexts, hosts, components, instances, endpoints, versions or connections. Check the source path and its format.');
    return findings;
  }

  const networkContextKeys = checkNetworkContexts(payload, add);
  const hostnames = checkHosts(payload, networkContextKeys, add);
  const componentNames = checkComponents(payload, add);
  const instanceIndex = checkInstances(payload, componentNames, hostnames, add);

  const dependents = new Map<number, number>();
  const countDependent: DependentCounter = (skippedIndex) => {
    dependents.set(skippedIndex, (dependents.get(skippedIndex) ?? 0) + 1);
  };
  checkEndpoints(payload, instanceIndex, countDependent, add);
  checkVersions(payload, instanceIndex, countDependent, add);
  checkConnections(payload, instanceIndex, countDependent, add);
  reportSkippedInstances(payload, instanceIndex, dependents, add);

  return sortFindings(findings);
}
