'use client';

// TelEnvIQ - Promotion Readiness Page
// Governance rules and readiness checks

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PillarHeader } from '@/components/navigation';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import {
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface GovernanceRule {
  id: string;
  name: string;
  description?: string;
  ruleType: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'BLOCKER';
  isActive: boolean;
  targetStages: string[];
}

interface RuleEvaluation {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  severity: string;
  message?: string;
}

interface ReadinessResult {
  environmentId: string;
  environmentName: string;
  stage: string;
  passed: boolean;
  score: number;
  evaluations: RuleEvaluation[];
}

const severityConfig = {
  INFO: { color: 'bg-blue-100 text-blue-700', icon: Info },
  WARNING: { color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  ERROR: { color: 'bg-red-100 text-red-700', icon: XCircle },
  BLOCKER: { color: 'bg-red-200 text-red-800', icon: XCircle },
};

export default function PromotionReadinessPage() {
  const { selectedEnvironment } = useEnvironment();
  const [rules, setRules] = useState<GovernanceRule[]>([]);
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    if (selectedEnvironment) {
      evaluateReadiness();
    } else {
      setReadiness(null);
    }
  }, [selectedEnvironment]);

  async function fetchRules() {
    try {
      const response = await fetch('/api/governance/rules');
      const result = await response.json();
      if (result.success) {
        setRules(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    } finally {
      setLoading(false);
    }
  }

  async function evaluateReadiness() {
    if (!selectedEnvironment) return;
    setEvaluating(true);
    try {
      const response = await fetch(`/api/governance/readiness/${selectedEnvironment.id}`);
      const result = await response.json();
      if (result.success) {
        setReadiness(result.data);
      }
    } catch (error) {
      console.error('Failed to evaluate readiness:', error);
    } finally {
      setEvaluating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PillarHeader
        title="Promotion Readiness"
        description="Governance rules and environment readiness validation"
        icon={Shield}
        iconColor="text-indigo-600"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        }
      />

      {/* Environment Readiness */}
      {selectedEnvironment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Readiness Check: {selectedEnvironment.name}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Evaluate governance rules for the selected environment
                </p>
              </div>
              <Button
                variant="outline"
                onClick={evaluateReadiness}
                disabled={evaluating}
              >
                {evaluating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Evaluate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {readiness ? (
              <div className="space-y-4">
                {/* Score */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50">
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center ${
                      readiness.passed ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {readiness.passed ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">
                      {readiness.score}%
                    </p>
                    <p className="text-sm text-slate-500">
                      {readiness.passed ? 'Ready for promotion' : 'Not ready for promotion'}
                    </p>
                  </div>
                </div>

                {/* Rule Evaluations */}
                <div className="space-y-2">
                  {readiness.evaluations.map((evaluation) => {
                    const severity = severityConfig[evaluation.severity as keyof typeof severityConfig];
                    const SeverityIcon = severity?.icon || Info;

                    return (
                      <div
                        key={evaluation.ruleId}
                        className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {evaluation.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <SeverityIcon className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium text-slate-900">
                              {evaluation.ruleName}
                            </p>
                            {evaluation.message && (
                              <p className="text-sm text-slate-500">{evaluation.message}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className={severity?.color}>
                          {evaluation.severity}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                Click &quot;Evaluate&quot; to check readiness
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Governance Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Governance Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No governance rules defined
              </h3>
              <p className="text-slate-500 mb-4">
                Create rules to enforce promotion readiness criteria
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Rule
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => {
                const severity = severityConfig[rule.severity];
                const SeverityIcon = severity?.icon || Info;

                return (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${severity?.color}`}>
                        <SeverityIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{rule.name}</p>
                        {rule.description && (
                          <p className="text-sm text-slate-500">{rule.description}</p>
                        )}
                        <div className="flex gap-1 mt-1">
                          {rule.targetStages.map((stage) => (
                            <Badge key={stage} variant="secondary" className="text-xs">
                              {stage}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={rule.isActive ? 'default' : 'secondary'}
                      className={rule.isActive ? 'bg-green-100 text-green-700' : ''}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
