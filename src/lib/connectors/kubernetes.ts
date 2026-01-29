// Nexorium Core - Kubernetes Connector
// Read-only discovery of Kubernetes resources

import { BaseConnector, type ConnectorConfig, type DiscoveryPayload, type DiscoveredNode, type DiscoveredEdge } from './base';
import type { KubernetesConfig, NodeType, Protocol } from '@/types';

interface KubernetesResource {
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

interface KubernetesDeployment extends KubernetesResource {
  kind: 'Deployment';
  spec: {
    replicas?: number;
    selector?: {
      matchLabels?: Record<string, string>;
    };
    template?: {
      metadata?: {
        labels?: Record<string, string>;
      };
      spec?: {
        containers?: Array<{
          name: string;
          image: string;
          ports?: Array<{ containerPort: number; name?: string; protocol?: string }>;
          env?: Array<{ name: string; value?: string; valueFrom?: unknown }>;
        }>;
      };
    };
  };
}

interface KubernetesService extends KubernetesResource {
  kind: 'Service';
  spec: {
    type?: string;
    selector?: Record<string, string>;
    ports?: Array<{
      port: number;
      targetPort?: number | string;
      protocol?: string;
      name?: string;
    }>;
  };
}

interface KubernetesIngress extends KubernetesResource {
  kind: 'Ingress';
  spec: {
    rules?: Array<{
      host?: string;
      http?: {
        paths?: Array<{
          path?: string;
          pathType?: string;
          backend?: {
            service?: {
              name: string;
              port?: { number?: number; name?: string };
            };
          };
        }>;
      };
    }>;
  };
}

export interface KubernetesConnectorConfig extends ConnectorConfig {
  kubernetes: KubernetesConfig;
  // In a real implementation, this would connect to a cluster
  // For MVP, we accept pre-fetched resources
  resources?: KubernetesResource[];
}

export class KubernetesConnector extends BaseConnector {
  private kubeConfig: KubernetesConfig;
  private resources: KubernetesResource[];

  constructor(config: KubernetesConnectorConfig) {
    super({
      environmentId: config.environmentId,
      source: `kubernetes:${config.kubernetes.namespace || 'default'}`,
      dryRun: config.dryRun,
    });
    this.kubeConfig = config.kubernetes;
    this.resources = config.resources || [];
  }

  async discover(): Promise<DiscoveryPayload> {
    const nodes: DiscoveredNode[] = [];
    const edges: DiscoveredEdge[] = [];
    const nodeNames = new Set<string>();

    // Process Deployments
    const deployments = this.resources.filter(
      (r): r is KubernetesDeployment => r.kind === 'Deployment'
    );
    for (const deployment of deployments) {
      const node = this.processDeployment(deployment);
      if (node && this.validateNode(node)) {
        nodes.push(node);
        nodeNames.add(node.name);

        // Create evidence
        this.evidence.push(
          this.createEvidence('NODE', node.name, {
            kind: 'Deployment',
            resource: deployment,
          })
        );
      }
    }

    // Process Services
    const services = this.resources.filter(
      (r): r is KubernetesService => r.kind === 'Service'
    );
    for (const service of services) {
      // Create edges from services to deployments
      const serviceEdges = this.processService(service, nodeNames);
      for (const edge of serviceEdges) {
        if (this.validateEdge(edge)) {
          edges.push(edge);
        }
      }
    }

    // Process Ingress
    if (this.kubeConfig.includeIngress) {
      const ingresses = this.resources.filter(
        (r): r is KubernetesIngress => r.kind === 'Ingress'
      );
      for (const ingress of ingresses) {
        const ingressEdges = this.processIngress(ingress, nodeNames);

        // Add gateway node if ingress exists
        if (ingressEdges.length > 0 && !nodeNames.has('ingress-gateway')) {
          nodes.push({
            name: 'ingress-gateway',
            type: 'GATEWAY',
            metadata: { source: 'kubernetes-ingress' },
          });
          nodeNames.add('ingress-gateway');
        }

        edges.push(...ingressEdges);
      }
    }

    // Discover inter-service connections from environment variables
    for (const deployment of deployments) {
      const envEdges = this.discoverEnvConnections(deployment, nodeNames);
      edges.push(...envEdges);
    }

    return { nodes, edges };
  }

  private processDeployment(deployment: KubernetesDeployment): DiscoveredNode | null {
    const name = deployment.metadata.name;
    const labels = deployment.metadata.labels || {};
    const containers = deployment.spec?.template?.spec?.containers || [];

    // Determine node type from labels or image
    let nodeType: NodeType = 'SERVICE';
    const firstContainer = containers[0];

    if (firstContainer?.image) {
      const image = firstContainer.image.toLowerCase();
      if (image.includes('postgres') || image.includes('mysql') || image.includes('mongo') || image.includes('redis')) {
        nodeType = 'DATABASE';
      } else if (image.includes('rabbitmq') || image.includes('kafka') || image.includes('activemq')) {
        nodeType = 'MESSAGE_QUEUE';
      } else if (image.includes('nginx') || image.includes('envoy') || image.includes('haproxy')) {
        nodeType = 'LOAD_BALANCER';
      } else if (image.includes('gateway') || image.includes('kong') || image.includes('ambassador')) {
        nodeType = 'GATEWAY';
      }
    }

    // Check labels for type hints
    if (labels['app.kubernetes.io/component']) {
      const component = labels['app.kubernetes.io/component'].toLowerCase();
      if (component === 'database') nodeType = 'DATABASE';
      if (component === 'api' || component === 'gateway') nodeType = 'GATEWAY';
      if (component === 'queue' || component === 'messaging') nodeType = 'MESSAGE_QUEUE';
    }

    // Determine criticality from labels
    let criticality: DiscoveredNode['criticality'] = 'MEDIUM';
    if (labels['nexorium.io/criticality']) {
      const crit = labels['nexorium.io/criticality'].toUpperCase();
      if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(crit)) {
        criticality = crit as DiscoveredNode['criticality'];
      }
    }

    // Get owner from labels
    const owner = labels['nexorium.io/owner'] || labels['app.kubernetes.io/managed-by'];

    return {
      name,
      type: nodeType,
      owner,
      criticality,
      metadata: {
        namespace: deployment.metadata.namespace,
        labels,
        replicas: deployment.spec?.replicas,
        image: firstContainer?.image,
        ports: firstContainer?.ports?.map(p => p.containerPort),
      },
    };
  }

  private processService(service: KubernetesService, nodeNames: Set<string>): DiscoveredEdge[] {
    const edges: DiscoveredEdge[] = [];
    const selector = service.spec?.selector;
    const ports = service.spec?.ports || [];

    if (!selector) return edges;

    // Find matching deployments based on selector
    for (const nodeName of Array.from(nodeNames)) {
      // In a real implementation, we'd match against actual labels
      // For MVP, we use naming convention matching
      const selectorApp = selector['app'] || selector['app.kubernetes.io/name'];

      if (selectorApp && nodeName.includes(selectorApp)) {
        for (const port of ports) {
          const protocol = this.inferProtocol(port.name, port.port);
          edges.push({
            sourceNodeName: service.metadata.name,
            targetNodeName: nodeName,
            protocol,
            port: port.port,
            metadata: {
              serviceType: service.spec?.type,
              targetPort: port.targetPort,
            },
          });
        }
      }
    }

    return edges;
  }

  private processIngress(ingress: KubernetesIngress, nodeNames: Set<string>): DiscoveredEdge[] {
    const edges: DiscoveredEdge[] = [];
    const rules = ingress.spec?.rules || [];

    for (const rule of rules) {
      const paths = rule.http?.paths || [];
      for (const path of paths) {
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

  private discoverEnvConnections(
    deployment: KubernetesDeployment,
    nodeNames: Set<string>
  ): DiscoveredEdge[] {
    const edges: DiscoveredEdge[] = [];
    const containers = deployment.spec?.template?.spec?.containers || [];
    const sourceName = deployment.metadata.name;

    for (const container of containers) {
      const envVars = container.env || [];
      for (const env of envVars) {
        if (!env.value) continue;

        // Look for connection strings in environment variables
        const value = env.value.toLowerCase();

        // Database connections
        if (env.name.includes('DATABASE') || env.name.includes('DB_HOST') || env.name.includes('_DSN')) {
          const dbNode = this.findMatchingNode(value, nodeNames);
          if (dbNode) {
            edges.push({
              sourceNodeName: sourceName,
              targetNodeName: dbNode,
              protocol: 'JDBC',
              metadata: { envVar: env.name },
            });
          }
        }

        // Message queue connections
        if (env.name.includes('AMQP') || env.name.includes('KAFKA') || env.name.includes('RABBIT')) {
          const mqNode = this.findMatchingNode(value, nodeNames);
          if (mqNode) {
            edges.push({
              sourceNodeName: sourceName,
              targetNodeName: mqNode,
              protocol: 'MQ',
              metadata: { envVar: env.name },
            });
          }
        }

        // Service URLs
        if (env.name.includes('_URL') || env.name.includes('_HOST') || env.name.includes('_ENDPOINT')) {
          const serviceNode = this.findMatchingNode(value, nodeNames);
          if (serviceNode && serviceNode !== sourceName) {
            edges.push({
              sourceNodeName: sourceName,
              targetNodeName: serviceNode,
              protocol: 'REST',
              metadata: { envVar: env.name },
            });
          }
        }
      }
    }

    return edges;
  }

  private findMatchingNode(value: string, nodeNames: Set<string>): string | null {
    for (const nodeName of Array.from(nodeNames)) {
      if (value.includes(nodeName.toLowerCase())) {
        return nodeName;
      }
    }
    return null;
  }

  private inferProtocol(portName: string | undefined, port: number): Protocol {
    if (portName) {
      const name = portName.toLowerCase();
      if (name.includes('grpc')) return 'GRPC';
      if (name.includes('http') || name.includes('rest')) return 'REST';
      if (name.includes('amqp') || name.includes('mq')) return 'MQ';
      if (name.includes('graphql')) return 'GRAPHQL';
      if (name.includes('ws') || name.includes('websocket')) return 'WEBSOCKET';
    }

    // Infer from common ports
    switch (port) {
      case 80:
      case 443:
      case 8080:
      case 8443:
        return 'REST';
      case 5432:
      case 3306:
      case 27017:
      case 6379:
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
