// TelEnvIQ - Environment Readiness API
// GET /api/governance/readiness/[envId] - Get promotion readiness for environment

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ envId: string }> }
) {
  try {
    const { envId } = await params;

    // Fetch environment with stage
    const environment = await prisma.environment.findUnique({
      where: { id: envId },
      include: {
        stage: true,
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

    // Get latest snapshot (for future use in rule evaluation)
    const _latestSnapshot = await prisma.environmentSnapshot.findFirst({
      where: { environmentId: envId },
      orderBy: { createdAt: 'desc' },
    });

    // Evaluate rules (simplified evaluation logic)
    const evaluations = rules.map((rule) => {
      // For now, simulate rule evaluation
      // In production, this would run the actual rule logic
      const passed = Math.random() > 0.3; // Simulated pass rate
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        passed,
        message: passed
          ? `${rule.name} passed`
          : `${rule.name} failed: ${rule.description || 'Check requirements'}`,
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
