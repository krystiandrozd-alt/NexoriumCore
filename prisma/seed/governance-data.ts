// Nexorium Core - Governance Seed Data
// Sample data for governance alignment module

import { PrismaClient } from '@prisma/client';

export async function seedGovernanceData(prisma: PrismaClient) {
  console.log('Seeding governance data...');

  // Get existing environments and people for references
  const environments = await prisma.environment.findMany({ take: 10 });
  const people = await prisma.person.findMany({ take: 5 });

  if (environments.length === 0) {
    console.log('No environments found, skipping governance seed data');
    return;
  }

  // ============================================
  // POLICY CONTROLS
  // ============================================
  console.log('Creating policy controls...');

  const policyControls = await Promise.all([
    prisma.policyControl.upsert({
      where: { name: 'Owner Assigned' },
      update: {},
      create: {
        name: 'Owner Assigned',
        description: 'Every environment must have an assigned owner and RACI mappings',
        category: 'OWNERSHIP',
        scope: 'GLOBAL',
        severity: 'ERROR',
        isActive: true,
        configJson: {},
        evaluatorType: 'owner_assigned',
        remediation: 'Assign an owner through the Organisation pillar',
        createdBy: 'system',
      },
    }),
    prisma.policyControl.upsert({
      where: { name: 'Version Check' },
      update: {},
      create: {
        name: 'Version Check',
        description: 'All components must have valid deployed versions',
        category: 'VERSION_COMPLIANCE',
        scope: 'GLOBAL',
        severity: 'WARNING',
        isActive: true,
        configJson: { minVersion: '1.0.0' },
        evaluatorType: 'version_check',
        remediation: 'Ensure all components have version information captured',
        createdBy: 'system',
      },
    }),
    prisma.policyControl.upsert({
      where: { name: 'Data Freshness' },
      update: {},
      create: {
        name: 'Data Freshness',
        description: 'Environment snapshots must be less than 30 days old',
        category: 'FRESHNESS',
        scope: 'GLOBAL',
        severity: 'WARNING',
        isActive: true,
        configJson: { maxAge: 30 },
        evaluatorType: 'freshness',
        remediation: 'Run a connector or manual ingestion to update environment data',
        createdBy: 'system',
      },
    }),
    prisma.policyControl.upsert({
      where: { name: 'RACI Complete' },
      update: {},
      create: {
        name: 'RACI Complete',
        description: 'Environment must have Responsible and Accountable roles assigned',
        category: 'OWNERSHIP',
        scope: 'GLOBAL',
        severity: 'ERROR',
        isActive: true,
        configJson: {},
        evaluatorType: 'raci_complete',
        remediation: 'Add RACI assignments through the Organisation pillar',
        createdBy: 'system',
      },
    }),
    prisma.policyControl.upsert({
      where: { name: 'Snapshot Exists' },
      update: {},
      create: {
        name: 'Snapshot Exists',
        description: 'Environment must have at least one snapshot for state tracking',
        category: 'DATA_GOVERNANCE',
        scope: 'GLOBAL',
        severity: 'BLOCKER',
        isActive: true,
        configJson: {},
        evaluatorType: 'snapshot_exists',
        remediation: 'Create a snapshot to establish baseline state',
        createdBy: 'system',
      },
    }),
    prisma.policyControl.upsert({
      where: { name: 'Minimum Components' },
      update: {},
      create: {
        name: 'Minimum Components',
        description: 'Environment must have at least one component instance',
        category: 'TOPOLOGY_RULES',
        scope: 'GLOBAL',
        severity: 'WARNING',
        isActive: true,
        configJson: { minCount: 1 },
        evaluatorType: 'component_count',
        remediation: 'Add component instances to the environment',
        createdBy: 'system',
      },
    }),
    prisma.policyControl.upsert({
      where: { name: 'Security Classification' },
      update: {},
      create: {
        name: 'Security Classification',
        description: 'All test data sets must have a security classification',
        category: 'SECURITY',
        scope: 'GLOBAL',
        severity: 'ERROR',
        isActive: true,
        configJson: {},
        evaluatorType: 'data_classification',
        remediation: 'Classify all test data sets through the Data Governance settings',
        createdBy: 'system',
      },
    }),
    prisma.policyControl.upsert({
      where: { name: 'Change Approval Required' },
      update: {},
      create: {
        name: 'Change Approval Required',
        description: 'Configuration changes must go through approval workflow',
        category: 'CHANGE_MANAGEMENT',
        scope: 'STAGE',
        scopeId: null, // Apply to UAT and higher
        severity: 'BLOCKER',
        isActive: false, // Disabled for now
        configJson: { stages: ['UAT', 'NFT', 'PREPROD'] },
        evaluatorType: 'custom',
        remediation: 'Submit a change request through the Approvals workflow',
        createdBy: 'system',
      },
    }),
  ]);

  console.log(`Created ${policyControls.length} policy controls`);

  // ============================================
  // COMPLIANCE RESULTS
  // ============================================
  console.log('Creating compliance results...');

  let complianceCount = 0;
  for (const env of environments.slice(0, 5)) {
    for (const control of policyControls.filter((c) => c.isActive)) {
      // Randomize status for demo
      const statuses = ['PASS', 'PASS', 'PASS', 'WARN', 'FAIL'] as const;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const score = status === 'PASS' ? 100 : status === 'WARN' ? 60 : 0;

      await prisma.complianceResult.create({
        data: {
          policyControlId: control.id,
          environmentId: env.id,
          status,
          score,
          message: status === 'PASS' ? 'Control passed' : `Control ${status.toLowerCase()} - needs attention`,
          detailsJson: {},
          evaluatedBy: 'seed-script',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      complianceCount++;
    }
  }

  console.log(`Created ${complianceCount} compliance results`);

  // ============================================
  // APPROVAL ITEMS
  // ============================================
  console.log('Creating approval items...');

  const approvals = await Promise.all([
    prisma.approvalItem.create({
      data: {
        approvalType: 'PROMOTION',
        status: 'PENDING',
        title: 'Promote CPQ SIT1 to UAT',
        description: 'Request to promote CPQ environment from SIT1 to UAT for release 2.4.0',
        requesterId: people[0]?.id,
        requesterName: people[0]?.displayName || 'John Smith',
        requesterEmail: people[0]?.email || 'john.smith@example.com',
        assigneeId: people[1]?.id,
        assigneeName: people[1]?.displayName || 'Jane Doe',
        assigneeEmail: people[1]?.email || 'jane.doe@example.com',
        environmentId: environments[0]?.id,
        contextJson: {
          sourceEnvironment: 'CPQ SIT1',
          targetEnvironment: 'CPQ UAT',
          components: ['CPQ Core', 'CPQ API', 'CPQ DB'],
        },
        priority: 2,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.approvalItem.create({
      data: {
        approvalType: 'EXCEPTION_REQUEST',
        status: 'PENDING',
        title: 'Exception for stale snapshot in DEV',
        description: 'Request exception for Data Freshness control in DEV environment',
        requesterId: people[2]?.id,
        requesterName: people[2]?.displayName || 'Bob Wilson',
        assigneeId: people[0]?.id,
        assigneeName: people[0]?.displayName || 'John Smith',
        environmentId: environments[1]?.id,
        contextJson: {
          policyName: 'Data Freshness',
          reason: 'DEV environment is being rebuilt, snapshot will be refreshed next sprint',
        },
        priority: 1,
      },
    }),
    prisma.approvalItem.create({
      data: {
        approvalType: 'COUPLING_REVIEW',
        status: 'PENDING',
        title: 'Review shared component coupling',
        description: 'Review detected coupling between Billing and Order Management environments',
        requesterName: 'System',
        assigneeId: people[1]?.id,
        assigneeName: people[1]?.displayName || 'Jane Doe',
        contextJson: {
          couplingType: 'shared_component',
          sharedComponents: ['Integration Bus', 'Message Queue'],
        },
        priority: 0,
      },
    }),
    prisma.approvalItem.create({
      data: {
        approvalType: 'PROMOTION',
        status: 'APPROVED',
        title: 'Promote Billing UAT to PREPROD',
        description: 'Approved promotion of Billing environment to pre-production',
        requesterName: 'Alice Brown',
        assigneeName: 'John Smith',
        environmentId: environments[2]?.id,
        contextJson: {},
        priority: 2,
        decisionBy: 'John Smith',
        decisionReason: 'All readiness checks passed',
        decisionAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.approvalItem.create({
      data: {
        approvalType: 'DATA_ACCESS',
        status: 'REJECTED',
        title: 'Access to production clone data',
        description: 'Request for access to production clone test data in SIT',
        requesterName: 'Charlie Davis',
        assigneeName: 'Jane Doe',
        decisionBy: 'Jane Doe',
        decisionReason: 'Data classification not completed, please classify first',
        decisionAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        priority: 1,
      },
    }),
  ]);

  console.log(`Created ${approvals.length} approval items`);

  // ============================================
  // EXCEPTION ITEMS
  // ============================================
  console.log('Creating exception items...');

  const exceptions = await Promise.all([
    prisma.exceptionItem.create({
      data: {
        policyControlId: policyControls[2].id, // Data Freshness
        environmentId: environments[0]?.id,
        status: 'ACTIVE',
        reason: 'Environment undergoing major upgrade',
        justification: 'The DEV environment is being rebuilt with new architecture. Snapshots will be outdated until migration completes.',
        riskAssessment: 'Low risk - development environment only',
        mitigationPlan: 'Weekly manual verification of environment state',
        requestedBy: people[0]?.id,
        requestedByName: people[0]?.displayName || 'John Smith',
        approvedBy: people[1]?.id,
        approvedByName: people[1]?.displayName || 'Jane Doe',
        approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        reviewReminder: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.exceptionItem.create({
      data: {
        policyControlId: policyControls[0].id, // Owner Assigned
        environmentId: environments[1]?.id,
        status: 'ACTIVE',
        reason: 'Team reorganization in progress',
        justification: 'The owning team is being restructured. Temporary exception until new assignments are made.',
        requestedByName: 'HR System',
        approvedByName: 'Management',
        approvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Expiring soon
      },
    }),
    prisma.exceptionItem.create({
      data: {
        policyControlId: policyControls[3].id, // RACI Complete
        status: 'REQUESTED',
        reason: 'New environment without RACI mapping',
        justification: 'Environment was just created, RACI will be assigned after project kickoff meeting.',
        requestedBy: people[2]?.id,
        requestedByName: people[2]?.displayName || 'Bob Wilson',
      },
    }),
    prisma.exceptionItem.create({
      data: {
        policyControlId: policyControls[1].id, // Version Check
        environmentId: environments[2]?.id,
        status: 'EXPIRED',
        reason: 'Legacy component without version tracking',
        requestedByName: 'Alice Brown',
        approvedByName: 'John Smith',
        approvedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.exceptionItem.create({
      data: {
        policyControlId: policyControls[4].id, // Snapshot Exists
        environmentId: environments[3]?.id,
        status: 'REVOKED',
        reason: 'Environment being decommissioned',
        requestedByName: 'Charlie Davis',
        approvedByName: 'Jane Doe',
        approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        revokedBy: 'Management',
        revokedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        revocationReason: 'Environment decommissioning cancelled, normal controls apply',
      },
    }),
  ]);

  console.log(`Created ${exceptions.length} exception items`);

  // ============================================
  // COUPLING LINKS
  // ============================================
  console.log('Creating coupling links...');

  if (environments.length >= 4) {
    const couplings = await Promise.all([
      prisma.couplingLink.create({
        data: {
          sourceEnvironmentId: environments[0].id,
          targetEnvironmentId: environments[1].id,
          sourceProjectName: 'CPQ',
          targetProjectName: 'Billing',
          couplingType: 'shared_component',
          status: 'UNREVIEWED',
          riskLevel: 45,
          description: 'Both environments share the Integration Bus component',
          detectedBy: 'system',
          evidenceJson: {
            sharedComponents: ['Integration Bus'],
          },
        },
      }),
      prisma.couplingLink.create({
        data: {
          sourceEnvironmentId: environments[1].id,
          targetEnvironmentId: environments[2].id,
          sourceProjectName: 'Billing',
          targetProjectName: 'Order Management',
          couplingType: 'interface_dependency',
          status: 'APPROVED',
          riskLevel: 30,
          description: 'Billing consumes Order Management APIs',
          detectedBy: 'system',
          reviewedBy: 'Jane Doe',
          reviewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          reviewNotes: 'Approved - expected integration pattern',
          evidenceJson: {
            sharedInterfaces: ['OrderAPI', 'QuoteAPI'],
          },
        },
      }),
      prisma.couplingLink.create({
        data: {
          sourceEnvironmentId: environments[0].id,
          targetEnvironmentId: environments[3].id,
          sourceProjectName: 'CPQ',
          targetProjectName: 'CRM',
          couplingType: 'data_dependency',
          status: 'MITIGATION_REQUIRED',
          riskLevel: 75,
          description: 'CPQ test data depends on CRM customer records',
          detectedBy: 'system',
          reviewedBy: 'John Smith',
          reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          reviewNotes: 'High risk - need to decouple test data',
          mitigationRequired: true,
          mitigationPlan: 'Create synthetic customer data for CPQ environment',
          evidenceJson: {
            dataFlows: [
              { source: 'CRM.customers', target: 'CPQ.quotes', type: 'lookup' },
            ],
          },
        },
      }),
      prisma.couplingLink.create({
        data: {
          sourceEnvironmentId: environments[2].id,
          targetEnvironmentId: environments[3].id,
          sourceProjectName: 'Order Management',
          targetProjectName: 'CRM',
          couplingType: 'shared_component',
          status: 'UNDER_REVIEW',
          riskLevel: 55,
          description: 'Both share Oracle DB instance',
          detectedBy: 'system',
          reviewedBy: 'Bob Wilson',
          reviewedAt: new Date(),
          evidenceJson: {
            sharedComponents: ['Oracle DB Instance'],
          },
        },
      }),
    ]);

    console.log(`Created ${couplings.length} coupling links`);
  } else {
    console.log('Not enough environments for coupling links');
  }

  console.log('Governance seed data complete!');
}
