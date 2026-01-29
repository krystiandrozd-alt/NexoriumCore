// Nexorium Core - Environment Readiness API
// GET /api/governance/readiness/[envId] - Get promotion readiness for environment

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

interface ReadinessResult {
  environmentId: string;
  environmentName: string;
  isReady: boolean;
  score: number;
  evaluations: Array<{
    ruleId: string;
    ruleName: string;
    severity: string;
    passed: boolean;
    message: string;
  }>;
  blockers: number;
  warnings: number;
}

// Deterministic rule evaluation based on rule type and environment state
function evaluateRule(
  rule: { id: string; name: string; ruleType: string; severity: string; description: string | null },
  environment: { id: string; name: string; type: string },
  latestSnapshot: { id: string; createdAt: Date } | null,
  componentCount: number
): { passed: boolean; message: string } {
  // Deterministic rule evaluation based on rule type
  switch (rule.ruleType) {
    case 'SNAPSHOT_EXISTS':
      // Check if a recent snapshot exists (within last 7 days)
      if (!latestSnapshot) {
        return { passed: false, message: 'No snapshot exists for this environment' };
      }
      const daysSinceSnapshot = Math.floor(
        (Date.now() - latestSnapshot.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceSnapshot > 7) {
        return { passed: false, message: `Snapshot is ${daysSinceSnapshot} days old (max 7 days)` };
      }
      return { passed: true, message: 'Recent snapshot exists' };

    case 'MIN_COMPONENTS':
      // Check minimum component count
      if (componentCount < 1) {
        return { passed: false, message: 'Environment has no components defined' };
      }
      return { passed: true, message: `Environment has ${componentCount} components` };

    case 'NO_PROD_TYPE':
      // Non-production environments should not be PROD_RO
      if (environment.type === 'PROD_RO') {
        return { passed: false, message: 'Cannot promote from production read-only environment' };
      }
      return { passed: true, message: 'Environment is not production' };

    default:
      // For rules without specific evaluation logic, pass by default
      // This is deterministic - same input always produces same output
      return { passed: true, message: `${rule.name} evaluation not implemented - defaulting to pass` };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ envId: string }> }
) {
  // Require authentication
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { envId } = await params;

    // Fetch environment with stage and component count
    const environment = await prisma.environment.findUnique({
      where: { id: envId },
      include: {
        stage: true,
        _count: {
          select: { componentInstances: true },
        },
      },
    });

    if (!environment) {
      return NextResponse.json(
        { success: false, error: 'Environment not found' },
        { status: 404 }
      );
    }

    // Fetch applicable rules (those that target this stage or have no target)
    const rules = await prisma.governanceRule.findMany({
      where: {
        isActive: true,
        OR: [
          { targetStages: { isEmpty: true } },
          ...(environment.stage?.key
            ? [{ targetStages: { has: environment.stage.key } }]
            : []),
        ],
      },
    });

    // Get latest snapshot for rule evaluation
    const latestSnapshot = await prisma.environmentSnapshot.findFirst({
      where: { environmentId: envId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true },
    });

    // Evaluate rules deterministically
    const evaluations = rules.map((rule) => {
      const evaluation = evaluateRule(
        rule,
        environment,
        latestSnapshot,
        environment._count.componentInstances
      );
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        passed: evaluation.passed,
        message: evaluation.passed
          ? `${rule.name} passed: ${evaluation.message}`
          : `${rule.name} failed: ${evaluation.message}`,
      };
    });

    const blockers = evaluations.filter(
      (e) => !e.passed && e.severity === 'BLOCKER'
    ).length;
    const warnings = evaluations.filter(
      (e) => !e.passed && e.severity === 'WARNING'
    ).length;

    const score = evaluations.length > 0
      ? Math.round((evaluations.filter((e) => e.passed).length / evaluations.length) * 100)
      : 100;

    const result: ReadinessResult = {
      environmentId: environment.id,
      environmentName: environment.name,
      isReady: blockers === 0,
      score,
      evaluations,
      blockers,
      warnings,
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to evaluate readiness:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to evaluate readiness' },
      { status: 500 }
    );
  }
}
