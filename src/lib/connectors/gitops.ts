// TelEnvIQ - GitOps Connector
// Discovery from GitOps manifests (Kubernetes YAML files)

import { BaseConnector, type ConnectorConfig, type DiscoveryPayload, type DiscoveredNode, type DiscoveredEdge } from './base';
import yaml from 'js-yaml';
import type { GitOpsConfig, NodeType, Protocol } from '@/types';

interface ManifestDocument {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
  spec?: Record<string, unknown>;
}

export interface GitOpsConnectorConfig extends ConnectorConfig {
  gitops: GitOpsConfig;
  // Raw manifest content (in real implementation, would be fetched from repo)
  manifestContent?: string;
}

export class GitOpsConnector extends BaseConnector {
  private gitopsConfig: GitOpsConfig;
  private manifestContent: string;

  constructor(config: GitOpsConnectorConfig) {
    super({
      environmentId: config.environmentId,
      source: `gitops:${config.gitops.repositoryUrl}`,
      dryRun: config.dryRun,
    });
    this.gitopsConfig = config.gitops;
    this.manifestContent = config.manifestContent || '';
  }

  async discover(): Promise<DiscoveryPayload> {
    const nodes: DiscoveredNode[] = [];
    const edges: DiscoveredEdge[] = [];
    const databases: DiscoveryPayload['databases'] = [];
    const nodeNames = new Set<string>();
    const serviceSelectors = new Map<string, { selector: Record<string, string>; ports: Array<{ port: number; name?: string }> }>();

    // Parse YAML documents
    const documents = this.parseManifests();

    // First pass: collect all deployments, statefulsets, and services
    for (const doc of documents) {
      if (doc.kind === 'Deployment' || doc.kind === 'StatefulSet' || doc.kind === 'DaemonSet') {
        const node = this.processWorkload(doc);
        if (node && this.validateNode(node)) {
          nodes.push(node);
          nodeNames.add(node.name);

          // Check for database
          if (node.type === 'DATABASE') {
            const dbInfo = this.extractDatabaseInfo(doc);
            if (dbInfo) {
              databases.push({
                nodeName: node.name,
                ...dbInfo,
              });
            }
          }

          this.evidence.push(
            this.createEvidence('NODE', node.name, {
              kind: doc.kind,
              source: this.config.source,
              branch: this.gitopsConfig.branch,
            })
          );
        }
      }

      if (doc.kind === 'Service') {
        const selector = (doc.spec as Record<string, unknown>)?.selector as Record<string, string>;
        const ports = ((doc.spec as Record<string, unknown>)?.ports || []) as Array<{ port: number; name?: string; targetPort?: number }>;
        if (selector) {
          serviceSelectors.set(doc.metadata.name, { selector, ports });
        }
      }
    }

    // Second pass: process services and create edges
    for (const doc of documents) {
      if (doc.kind === 'Service') {
        const node = this.processService(doc);
        if (node && !nodeNames.has(node.name)) {
          nodes.push(node);
          nodeNames.add(node.name);
        }

        // Create edges to matching workloads
        const selectorInfo = serviceSelectors.get(doc.metadata.name);
        if (selectorInfo) {
          const matchingEdges = this.createServiceEdges(doc, selectorInfo, documents);
          edges.push(...matchingEdges);
        }
      }

      if (doc.kind === 'Ingress') {
        const ingressEdges = this.processIngress(doc, nodeNames);
        if (ingressEdges.length > 0 && !nodeNames.has('ingress-gateway')) {
          nodes.push({
            name: 'ingress-gateway',
            type: 'GATEWAY',
            metadata: { source: 'gitops-ingress' },
          });
          nodeNames.add('ingress-gateway');
        }
        edges.push(...ingressEdges);
      }
    }

    // Third pass: discover connections from ConfigMaps and Secrets references
    for (const doc of documents) {
      if (doc.kind === 'ConfigMap') {
        const configEdges = this.discoverConfigConnections(doc, nodeNames);
        edges.push(...configEdges);
      }
    }

    return { nodes, edges, databases };
  }

  private parseManifests(): ManifestDocument[] {
    const documents: ManifestDocument[] = [];

    try {
      // Split on document separators and parse each
      const yamlDocs = this.manifestContent.split(/^---$/m);
      for (const yamlDoc of yamlDocs) {
        const trimmed = yamlDoc.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        try {
          const parsed = yaml.load(trimmed) as ManifestDocument;
          if (parsed && parsed.kind && parsed.metadata?.name) {
            documents.push(parsed);
          }
        } catch (parseError) {
          this.addError(`Failed to parse YAML document: ${parseError}`);
        }
      }
    } catch (error) {
      this.addError(`Failed to parse manifests: ${error}`);
    }

    return documents;
  }

  private processWorkload(doc: ManifestDocument): DiscoveredNode | null {
    const name = doc.metadata.name;
    const labels = doc.metadata.labels || {};
    const annotations = doc.metadata.annotations || {};
    const spec = doc.spec as Record<string, unknown>;
    const template = spec?.template as Record<string, unknown>;
    const templateSpec = template?.spec as Record<string, unknown>;
    const containers = (templateSpec?.containers || []) as Array<{
      name: string;
      image?: string;
      ports?: Array<{ containerPort: number }>;
    }>;

    // Determine node type
    let nodeType: NodeType = 'SERVICE';
    const firstContainer = containers[0];
    const image = firstContainer?.image?.toLowerCase() || '';

    // Check labels first
    if (labels['app.kubernetes.io/component']) {
      const component = labels['app.kubernetes.io/component'].toLowerCase();
      nodeType = this.mapComponentToNodeType(component);
    } else if (annotations['telenviq.io/type']) {
      nodeType = annotations['telenviq.io/type'] as NodeType;
    } else {
      // Infer from image
      nodeType = this.inferNodeTypeFromImage(image);
    }

    // Determine criticality
    let criticality: DiscoveredNode['criticality'] = 'MEDIUM';
    if (annotations['telenviq.io/criticality']) {
      const crit = annotations['telenviq.io/criticality'].toUpperCase();
      if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(crit)) {
        criticality = crit as DiscoveredNode['criticality'];
      }
    }

    // Get owner
    const owner = annotations['telenviq.io/owner'] ||
      labels['app.kubernetes.io/managed-by'] ||
      labels['app.kubernetes.io/part-of'];

    return {
      name,
      type: nodeType,
      owner,
      criticality,
      metadata: {
        kind: doc.kind,
        namespace: doc.metadata.namespace,
        labels,
        annotations,
        image: firstContainer?.image,
        ports: containers.flatMap(c => c.ports?.map(p => p.containerPort) || []),
      },
    };
  }

  private processService(doc: ManifestDocument): DiscoveredNode {
    const spec = doc.spec as Record<string, unknown>;
    const serviceType = spec?.type as string;

    let nodeType: NodeType = 'SERVICE';
    if (serviceType === 'LoadBalancer') {
      nodeType = 'LOAD_BALANCER';
    } else if (serviceType === 'ExternalName') {
      nodeType = 'EXTERNAL';
    }

    return {
      name: doc.metadata.name,
      type: nodeType,
      metadata: {
        kind: 'Service',
        serviceType,
        namespace: doc.metadata.namespace,
      },
    };
  }

  private createServiceEdges(
    serviceDoc: ManifestDocument,
    selectorInfo: { selector: Record<string, string>; ports: Array<{ port: number; name?: string }> },
    allDocs: ManifestDocument[]
  ): DiscoveredEdge[] {
    const edges: DiscoveredEdge[] = [];

    // Find workloads matching the selector
    for (const doc of allDocs) {
      if (doc.kind === 'Deployment' || doc.kind === 'StatefulSet' || doc.kind === 'DaemonSet') {
        const spec = doc.spec as Record<string, unknown>;
        const template = spec?.template as Record<string, unknown>;
        const templateMeta = template?.metadata as Record<string, unknown>;
        const podLabels = (templateMeta?.labels || {}) as Record<string, string>;

        // Check if labels match selector
        const matches = Object.entries(selectorInfo.selector).every(
          ([key, value]) => podLabels[key] === value
        );

        if (matches) {
          for (const portInfo of selectorInfo.ports) {
            edges.push({
              sourceNodeName: serviceDoc.metadata.name,
              targetNodeName: doc.metadata.name,
              protocol: this.inferProtocolFromPort(portInfo.port, portInfo.name),
              port: portInfo.port,
              metadata: {
                portName: portInfo.name,
                selector: selectorInfo.selector,
              },
            });
          }
        }
      }
    }

    return edges;
  }

  private processIngress(doc: ManifestDocument, nodeNames: Set<string>): DiscoveredEdge[] {
    const edges: DiscoveredEdge[] = [];
    const spec = doc.spec as Record<string, unknown>;
    const rules = (spec?.rules || []) as Array<{
      host?: string;
      http?: {
        paths: Array<{
          path?: string;
          pathType?: string;
          backend?: {
            service?: { name: string; port?: { number?: number } };
          };
        }>;
      };
    }>;

    for (const rule of rules) {
      for (const path of rule.http?.paths || []) {
        const serviceName = path.backend?.service?.name;
        if (serviceName && nodeNames.has(serviceName)) {
          edges.push({
            sourceNodeName: 'ingress-gateway',
            targetNodeName: serviceName,
            protocol: 'REST',
            port: path.backend?.service?.port?.number,
            pathOrTopic: path.path,
            metadata: {
              host: rule.host,
              pathType: path.pathType,
            },
          });
        }
      }
    }

    return edges;
  }

  private discoverConfigConnections(
    configMap: ManifestDocument,
    nodeNames: Set<string>
  ): DiscoveredEdge[] {
    const edges: DiscoveredEdge[] = [];
    const data = (configMap as unknown as Record<string, unknown>).data as Record<string, string>;

    if (!data) return edges;

    for (const [key, value] of Object.entries(data)) {
      if (!value) continue;

      // Look for service references in config values
      for (const nodeName of Array.from(nodeNames)) {
        if (value.toLowerCase().includes(nodeName.toLowerCase())) {
          // Try to infer the protocol from the config key
          let protocol: Protocol = 'REST';
          const keyLower = key.toLowerCase();

          if (keyLower.includes('database') || keyLower.includes('jdbc') || keyLower.includes('db')) {
            protocol = 'JDBC';
          } else if (keyLower.includes('amqp') || keyLower.includes('kafka') || keyLower.includes('rabbit')) {
            protocol = 'MQ';
          } else if (keyLower.includes('grpc')) {
            protocol = 'GRPC';
          }

          // We don't know the source node here, so this edge is informational
          this.evidence.push(
            this.createEvidence('EDGE', `configmap:${configMap.metadata.name}`, {
              configKey: key,
              referencedNode: nodeName,
              protocol,
            }, 0.7)
          );
        }
      }
    }

    return edges;
  }

  private extractDatabaseInfo(doc: ManifestDocument): { engine: string; version?: string; host?: string; port?: number } | null {
    const spec = doc.spec as Record<string, unknown>;
    const template = spec?.template as Record<string, unknown>;
    const templateSpec = template?.spec as Record<string, unknown>;
    const containers = (templateSpec?.containers || []) as Array<{ image?: string; ports?: Array<{ containerPort: number }> }>;
    const firstContainer = containers[0];

    if (!firstContainer?.image) return null;

    const image = firstContainer.image.toLowerCase();
    let engine: string | null = null;
    let version: string | undefined;
    let port: number | undefined;

    if (image.includes('postgres')) {
      engine = 'PostgreSQL';
      port = 5432;
    } else if (image.includes('mysql')) {
      engine = 'MySQL';
      port = 3306;
    } else if (image.includes('mariadb')) {
      engine = 'MariaDB';
      port = 3306;
    } else if (image.includes('mongo')) {
      engine = 'MongoDB';
      port = 27017;
    } else if (image.includes('redis')) {
      engine = 'Redis';
      port = 6379;
    } else if (image.includes('elasticsearch')) {
      engine = 'Elasticsearch';
      port = 9200;
    } else if (image.includes('cassandra')) {
      engine = 'Cassandra';
      port = 9042;
    }

    if (!engine) return null;

    // Try to extract version from image tag
    const versionMatch = firstContainer.image.match(/:(\d+\.?\d*\.?\d*)/);
    if (versionMatch) {
      version = versionMatch[1];
    }

    // Use container port if specified
    if (firstContainer.ports?.[0]?.containerPort) {
      port = firstContainer.ports[0].containerPort;
    }

    return { engine, version, port };
  }

  private mapComponentToNodeType(component: string): NodeType {
    switch (component) {
      case 'database':
      case 'db':
        return 'DATABASE';
      case 'api':
      case 'gateway':
      case 'ingress':
        return 'GATEWAY';
      case 'queue':
      case 'messaging':
      case 'broker':
        return 'MESSAGE_QUEUE';
      case 'loadbalancer':
      case 'proxy':
        return 'LOAD_BALANCER';
      case 'runtime':
        return 'RUNTIME';
      default:
        return 'SERVICE';
    }
  }

  private inferNodeTypeFromImage(image: string): NodeType {
    if (image.includes('postgres') || image.includes('mysql') || image.includes('mongo') || image.includes('redis') || image.includes('mariadb')) {
      return 'DATABASE';
    }
    if (image.includes('rabbitmq') || image.includes('kafka') || image.includes('activemq') || image.includes('nats')) {
      return 'MESSAGE_QUEUE';
    }
    if (image.includes('nginx') || image.includes('envoy') || image.includes('haproxy') || image.includes('traefik')) {
      return 'LOAD_BALANCER';
    }
    if (image.includes('kong') || image.includes('ambassador') || image.includes('gateway')) {
      return 'GATEWAY';
    }
    return 'SERVICE';
  }

  private inferProtocolFromPort(port: number, name?: string): Protocol {
    if (name) {
      const nameLower = name.toLowerCase();
      if (nameLower.includes('grpc')) return 'GRPC';
      if (nameLower.includes('http') || nameLower.includes('rest')) return 'REST';
      if (nameLower.includes('amqp') || nameLower.includes('mq')) return 'MQ';
      if (nameLower.includes('graphql')) return 'GRAPHQL';
    }

    switch (port) {
      case 80:
      case 443:
      case 8080:
      case 8443:
        return 'REST';
      case 5432:
      case 3306:
      case 27017:
        return 'JDBC';
      case 5672:
      case 9092:
        return 'MQ';
      case 9090:
        return 'GRPC';
      default:
        return 'REST';
    }
  }
}
