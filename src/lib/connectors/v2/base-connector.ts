// Nexorium Core - Base Connector V2
// Abstract base class for 5-layer model connectors

import prisma from '@/lib/db';
import type {
  ConnectorConfig,
  ConnectorResult,
  ConnectorRunSummary,
  CanonicalDiscoveryPayload,
  IConnector,
} from './types';

export abstract class BaseConnectorV2 implements IConnector {
  protected config: ConnectorConfig;
  protected summary: ConnectorRunSummary;
  protected runId: string | null = null;

  abstract readonly connectorType: string;

  constructor(config: ConnectorConfig) {
    this.config = config;
    this.summary = this.initSummary();
  }

  private initSummary(): ConnectorRunSummary {
    return {
      networkContextsCreated: 0,
      networkContextsUpdated: 0,
      hostsCreated: 0,
      hostsUpdated: 0,
      componentsCreated: 0,
      componentInstancesCreated: 0,
      componentInstancesUpdated: 0,
      endpointsCreated: 0,
      endpointsUpdated: 0,
      deployedVersionsCreated: 0,
      connectionsCreated: 0,
      connectionsUpdated: 0,
      conflictsDetected: 0,
      warnings: [],
      errors: [],
    };
  }

  protected addWarning(message: string): void {
    this.summary.warnings.push(message);
  }

  protected addError(message: string): void {
    this.summary.errors.push(message);
  }

  abstract fetch(): Promise<unknown>;
  abstract map(rawData: unknown): Promise<CanonicalDiscoveryPayload>;

  async upsert(payload: CanonicalDiscoveryPayload): Promise<ConnectorRunSummary> {
    const { environmentId, connectorType } = this.config;
    const ingestedAt = new Date();

    // Track created entity IDs for reference resolution
    const networkContextIdMap = new Map<string, string>();
    const hostIdMap = new Map<string, string>();
    const componentIdMap = new Map<string, string>();
    const instanceIdMap = new Map<string, string>();

    // 1. Upsert Network Contexts
    for (const nc of payload.networkContexts) {
      try {
        const existing = nc.externalId
          ? await prisma.networkContext.findFirst({
              where: {
                environmentId,
                sourceRecordId: nc.externalId,
              },
            })
          : await prisma.networkContext.findFirst({
              where: {
                environmentId,
                vpcVnet: nc.vpcVnet,
                region: nc.region,
              },
            });

        if (existing) {
          await prisma.networkContext.update({
            where: { id: existing.id },
            data: {
              hostingType: nc.hostingType,
              cloudProvider: nc.cloudProvider,
              region: nc.region,
              vpcVnet: nc.vpcVnet,
              subnetCidr: nc.subnetCidr,
              zoneLabel: nc.zoneLabel,
              hasLoadBalancer: nc.hasLoadBalancer ?? false,
              loadBalancerRef: nc.loadBalancerRef,
              hasPrivateEndpoint: nc.hasPrivateEndpoint ?? false,
              privateEndpointRef: nc.privateEndpointRef,
              notes: nc.notes,
              ingestedAt,
            },
          });
          this.summary.networkContextsUpdated++;
          networkContextIdMap.set(nc.vpcVnet || nc.externalId || '', existing.id);
        } else {
          const created = await prisma.networkContext.create({
            data: {
              environmentId,
              hostingType: nc.hostingType,
              cloudProvider: nc.cloudProvider,
              region: nc.region,
              vpcVnet: nc.vpcVnet,
              subnetCidr: nc.subnetCidr,
              zoneLabel: nc.zoneLabel,
              hasLoadBalancer: nc.hasLoadBalancer ?? false,
              loadBalancerRef: nc.loadBalancerRef,
              hasPrivateEndpoint: nc.hasPrivateEndpoint ?? false,
              privateEndpointRef: nc.privateEndpointRef,
              notes: nc.notes,
              sourceSystem: connectorType,
              sourceRecordId: nc.externalId,
              ingestedAt,
            },
          });
          this.summary.networkContextsCreated++;
          networkContextIdMap.set(nc.vpcVnet || nc.externalId || '', created.id);
        }
      } catch (error) {
        this.addError(`Failed to upsert network context: ${error}`);
      }
    }

    // 2. Upsert Hosts
    for (const host of payload.hosts) {
      try {
        const networkContextId = host.networkContextRef
          ? networkContextIdMap.get(host.networkContextRef)
          : undefined;

        const existing = await prisma.host.findUnique({
          where: {
            environmentId_hostname: {
              environmentId,
              hostname: host.hostname,
            },
          },
        });

        if (existing) {
          await prisma.host.update({
            where: { id: existing.id },
            data: {
              ip: host.ip,
              natIp: host.natIp,
              os: host.os,
              networkContextId,
              notes: host.notes,
              ingestedAt,
            },
          });
          this.summary.hostsUpdated++;
          hostIdMap.set(host.hostname, existing.id);
        } else {
          const created = await prisma.host.create({
            data: {
              environmentId,
              hostname: host.hostname,
              ip: host.ip,
              natIp: host.natIp,
              os: host.os,
              networkContextId,
              notes: host.notes,
              sourceSystem: connectorType,
              sourceRecordId: host.externalId,
              ingestedAt,
            },
          });
          this.summary.hostsCreated++;
          hostIdMap.set(host.hostname, created.id);
        }
      } catch (error) {
        this.addError(`Failed to upsert host ${host.hostname}: ${error}`);
      }
    }

    // 3. Upsert Components (catalog)
    for (const comp of payload.components) {
      try {
        const existing = await prisma.component.findUnique({
          where: { name: comp.name },
        });

        if (existing) {
          componentIdMap.set(comp.name, existing.id);
          // Update layer/capability if provided
          if (comp.layer || comp.capabilityType) {
            await prisma.component.update({
              where: { id: existing.id },
              data: {
                ...(comp.layer && { layer: comp.layer }),
                ...(comp.capabilityType && { capabilityType: comp.capabilityType }),
              },
            });
          }
        } else {
          const created = await prisma.component.create({
            data: {
              name: comp.name,
              category: comp.category,
              vendor: comp.vendor,
              description: comp.description,
              layer: comp.layer || 'UNKNOWN',
              capabilityType: comp.capabilityType || 'UNKNOWN',
            },
          });
          this.summary.componentsCreated++;
          componentIdMap.set(comp.name, created.id);
        }
      } catch (error) {
        this.addError(`Failed to upsert component ${comp.name}: ${error}`);
      }
    }

    // 4. Upsert Component Instances
    for (const instance of payload.componentInstances) {
      try {
        const componentId = componentIdMap.get(instance.componentName);
        if (!componentId) {
          this.addWarning(`Component ${instance.componentName} not found for instance ${instance.displayName}`);
          continue;
        }

        const hostId = instance.hostRef ? hostIdMap.get(instance.hostRef) : undefined;
        const displayName = instance.displayName || `${instance.componentName}-${environmentId.slice(0, 8)}`;

        const existing = instance.externalId
          ? await prisma.componentInstance.findFirst({
              where: {
                environmentId,
                sourceRecordId: instance.externalId,
              },
            })
          : await prisma.componentInstance.findFirst({
              where: {
                environmentId,
                componentId,
                displayName,
              },
            });

        if (existing) {
          await prisma.componentInstance.update({
            where: { id: existing.id },
            data: {
              hostId,
              displayName,
              notes: instance.notes,
              ingestedAt,
            },
          });
          this.summary.componentInstancesUpdated++;
          instanceIdMap.set(displayName, existing.id);
          if (instance.externalId) {
            instanceIdMap.set(instance.externalId, existing.id);
          }
        } else {
          const created = await prisma.componentInstance.create({
            data: {
              environmentId,
              componentId,
              hostId,
              displayName,
              notes: instance.notes,
              sourceSystem: connectorType,
              sourceRecordId: instance.externalId,
              ingestedAt,
            },
          });
          this.summary.componentInstancesCreated++;
          instanceIdMap.set(displayName, created.id);
          if (instance.externalId) {
            instanceIdMap.set(instance.externalId, created.id);
          }
        }
      } catch (error) {
        this.addError(`Failed to upsert component instance ${instance.displayName}: ${error}`);
      }
    }

    // 5. Upsert Endpoints
    for (const ep of payload.endpoints) {
      try {
        const instanceId = instanceIdMap.get(ep.componentInstanceRef);
        if (!instanceId) {
          this.addWarning(`Component instance ${ep.componentInstanceRef} not found for endpoint ${ep.value}`);
          continue;
        }

        const existing = await prisma.endpoint.findFirst({
          where: {
            componentInstanceId: instanceId,
            kind: ep.kind,
            value: ep.value,
            port: ep.port,
          },
        });

        if (existing) {
          await prisma.endpoint.update({
            where: { id: existing.id },
            data: {
              scheme: ep.scheme,
              basePath: ep.basePath,
              notes: ep.notes,
              ingestedAt,
            },
          });
          this.summary.endpointsUpdated++;
        } else {
          await prisma.endpoint.create({
            data: {
              componentInstanceId: instanceId,
              kind: ep.kind,
              value: ep.value,
              port: ep.port,
              scheme: ep.scheme,
              basePath: ep.basePath,
              notes: ep.notes,
              sourceSystem: connectorType,
              ingestedAt,
            },
          });
          this.summary.endpointsCreated++;
        }
      } catch (error) {
        this.addError(`Failed to upsert endpoint ${ep.value}: ${error}`);
      }
    }

    // 6. Upsert Deployed Versions
    for (const dv of payload.deployedVersions) {
      try {
        const instanceId = instanceIdMap.get(dv.componentInstanceRef);
        if (!instanceId) {
          this.addWarning(`Component instance ${dv.componentInstanceRef} not found for version ${dv.projectVersion}`);
          continue;
        }

        // Always create a new deployed version entry (versions are historical)
        await prisma.deployedVersion.create({
          data: {
            componentInstanceId: instanceId,
            projectVersion: dv.projectVersion,
            vendorVersion: dv.vendorVersion,
            buildRef: dv.buildRef,
            capturedAt: new Date(),
            sourceSystem: connectorType,
            ingestedAt,
          },
        });
        this.summary.deployedVersionsCreated++;
      } catch (error) {
        this.addError(`Failed to upsert deployed version ${dv.projectVersion}: ${error}`);
      }
    }

    // 7. Upsert Connections
    for (const conn of payload.connections) {
      try {
        const fromId = instanceIdMap.get(conn.fromComponentRef);
        const toId = instanceIdMap.get(conn.toComponentRef);

        if (!fromId || !toId) {
          this.addWarning(`Missing component for connection ${conn.fromComponentRef} -> ${conn.toComponentRef}`);
          continue;
        }

        const existing = await prisma.connection.findFirst({
          where: {
            environmentId,
            fromComponentInstanceId: fromId,
            toComponentInstanceId: toId,
            protocolType: conn.protocolType,
          },
        });

        if (existing) {
          await prisma.connection.update({
            where: { id: existing.id },
            data: {
              protocolDetail: conn.protocolDetail,
              port: conn.port,
              notes: conn.notes,
              ingestedAt,
            },
          });
          this.summary.connectionsUpdated++;
        } else {
          await prisma.connection.create({
            data: {
              environmentId,
              fromComponentInstanceId: fromId,
              toComponentInstanceId: toId,
              protocolType: conn.protocolType,
              protocolDetail: conn.protocolDetail,
              port: conn.port,
              notes: conn.notes,
              sourceSystem: connectorType,
              ingestedAt,
            },
          });
          this.summary.connectionsCreated++;
        }
      } catch (error) {
        this.addError(`Failed to upsert connection: ${error}`);
      }
    }

    return this.summary;
  }

  report(): ConnectorRunSummary {
    return this.summary;
  }

  async run(): Promise<ConnectorResult> {
    const startedAt = new Date();

    // Create connector run record
    const connectorRun = await prisma.connectorRun.create({
      data: {
        environmentId: this.config.environmentId,
        connectorType: this.connectorType,
        status: 'RUNNING',
        startedAt,
      },
    });
    this.runId = connectorRun.id;

    try {
      // Execute pipeline: fetch -> map -> upsert
      const rawData = await this.fetch();
      const payload = await this.map(rawData);

      if (!this.config.dryRun) {
        await this.upsert(payload);
      }

      // Update connector run with success status
      const finishedAt = new Date();
      const status = this.summary.errors.length > 0 ? 'PARTIAL_SUCCESS' : 'SUCCESS';

      await prisma.connectorRun.update({
        where: { id: this.runId },
        data: {
          status,
          finishedAt,
          summaryJson: this.summary as unknown as object,
        },
      });

      return {
        success: status === 'SUCCESS',
        runId: this.runId,
        summary: this.summary,
        payload: this.config.dryRun ? payload : undefined,
      };
    } catch (error) {
      // Update connector run with failure status
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.addError(errorMessage);

      await prisma.connectorRun.update({
        where: { id: this.runId },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          summaryJson: this.summary as unknown as object,
          errorMessage,
        },
      });

      return {
        success: false,
        runId: this.runId,
        summary: this.summary,
      };
    }
  }
}
