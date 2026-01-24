'use client';

// TelEnvIQ - Promotion Readiness Page
// Environment readiness assessment

import { useEffect, useState } from 'react';
import {
  Rocket,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface ReadinessData {
  environmentId: string;
  environmentName: string;
  environmentType: string;
  stage?: string;
  overallScore: number;
  structuralCompleteness: ScoreData;
  versionValidity: ScoreData;
  snapshotIntegrity: ScoreData;
  topologyHealth: ScoreData;
  governanceAlignment: ScoreData;
  evaluations: RuleEvaluationData[];
}

interface ScoreData {
  score: number;
  status: 'pass' | 'warn' | 'fail';
  message?: string;
}

interface RuleEvaluationData {
  id: string;
  ruleName: string;
  passed: boolean;
  severity: string;
  message?: string;
}

const statusIcons = {
  pass: <CheckCircle className="h-5 w-5 text-green-500" />,
  warn: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  fail: <XCircle className="h-5 w-5 text-red-500" />,
};

const statusColors = {
  pass: 'bg-green-100 text-green-700 border-green-200',
  warn: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  fail: 'bg-red-100 text-red-700 border-red-200',
};

export default function ReadinessPage() {
  const [environments, setEnvironments] = useState<ReadinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnv, setSelectedEnv] = useState<ReadinessData | null>(null);

  useEffect(() => {
    fetchReadiness();
  }, []);

  async function fetchReadiness() {
    try {
      // Fetch environments first
      const envResponse = await fetch('/api/environments');
      if (!envResponse.ok) throw new Error('Failed to fetch environments');
      const envResult = await envResponse.json();
      const envs = envResult.data || [];

      // For each environment, fetch readiness data
      const readinessPromises = envs.map(async (env: { id: string; name: string; type: string }) => {
        try {
          const response = await fetch(`/api/governance/readiness/${env.id}`);
          if (response.ok) {
            const result = await response.json();
            return result.data;
          }
        } catch {
          // Return a placeholder if readiness endpoint doesn't exist
          return {
            environmentId: env.id,
            environmentName: env.name,
            environmentType: env.type,
            overallScore: 0,
            structuralCompleteness: { score: 0, status: 'fail' },
            versionValidity: { score: 0, status: 'fail' },
            snapshotIntegrity: { score: 0, status: 'fail' },
            topologyHealth: { score: 0, status: 'fail' },
            governanceAlignment: { score: 0, status: 'fail' },
            evaluations: [],
          };
        }
        return null;
      });

      const readinessResults = await Promise.all(readinessPromises);
      setEnvironments(readinessResults.filter(Boolean));
    } catch (error) {
      console.error('Error fetching readiness:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promotion Readiness</h1>
          <p className="mt-1 text-sm text-slate-500">
            Environment readiness assessment for promotion decisions
          </p>
        </div>
        <button
          onClick={fetchReadiness}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Readiness Cards */}
      {environments.length === 0 ? (
        <div className="text-center py-12 card-enterprise">
          <Rocket className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No environments found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Create environments to assess their readiness
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {environments.map((env) => (
            <div
              key={env.environmentId}
              className="card-enterprise p-4 cursor-pointer hover:border-indigo-200 transition-colors"
              onClick={() => setSelectedEnv(env)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">{env.environmentName}</h3>
                  <p className="text-sm text-slate-500">{env.environmentType}</p>
                  {env.stage && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                      {env.stage}
                    </span>
                  )}
                </div>
                <div
                  className={`flex items-center justify-center w-14 h-14 rounded-full ${
                    env.overallScore >= 80
                      ? 'bg-green-100'
                      : env.overallScore >= 60
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                  }`}
                >
                  <span
                    className={`text-lg font-bold ${
                      env.overallScore >= 80
                        ? 'text-green-600'
                        : env.overallScore >= 60
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {env.overallScore}%
                  </span>
                </div>
              </div>

              {/* Mini Progress Bars */}
              <div className="mt-4 space-y-2">
                {[
                  { label: 'Structure', data: env.structuralCompleteness },
                  { label: 'Versions', data: env.versionValidity },
                  { label: 'Governance', data: env.governanceAlignment },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-20">{item.label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.data.status === 'pass'
                            ? 'bg-green-500'
                            : item.data.status === 'warn'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${item.data.score}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 w-8 text-right">
                      {item.data.score}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-end text-sm text-indigo-600">
                <span>View Details</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Readiness Detail Modal */}
      {selectedEnv && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedEnv(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {selectedEnv.environmentName}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedEnv.environmentType}
                  {selectedEnv.stage && ` • ${selectedEnv.stage}`}
                </p>
              </div>
              <div
                className={`flex items-center justify-center w-16 h-16 rounded-full ${
                  selectedEnv.overallScore >= 80
                    ? 'bg-green-100'
                    : selectedEnv.overallScore >= 60
                    ? 'bg-yellow-100'
                    : 'bg-red-100'
                }`}
              >
                <span
                  className={`text-2xl font-bold ${
                    selectedEnv.overallScore >= 80
                      ? 'text-green-600'
                      : selectedEnv.overallScore >= 60
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {selectedEnv.overallScore}%
                </span>
              </div>
            </div>

            {/* Readiness Dimensions */}
            <div className="space-y-4">
              {[
                { label: 'Structural Completeness', data: selectedEnv.structuralCompleteness },
                { label: 'Version Validity', data: selectedEnv.versionValidity },
                { label: 'Snapshot Integrity', data: selectedEnv.snapshotIntegrity },
                { label: 'Topology Health', data: selectedEnv.topologyHealth },
                { label: 'Governance Alignment', data: selectedEnv.governanceAlignment },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`p-4 rounded-lg border ${statusColors[item.data.status]}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {statusIcons[item.data.status]}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className="font-semibold">{item.data.score}%</span>
                  </div>
                  {item.data.message && (
                    <p className="mt-2 text-sm opacity-80">{item.data.message}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Rule Evaluations */}
            {selectedEnv.evaluations && selectedEnv.evaluations.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-slate-900 mb-3">Rule Evaluations</h4>
                <div className="space-y-2">
                  {selectedEnv.evaluations.map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        evaluation.passed ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {evaluation.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">{evaluation.ruleName}</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          evaluation.severity === 'BLOCKER'
                            ? 'bg-red-100 text-red-700'
                            : evaluation.severity === 'ERROR'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {evaluation.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedEnv(null)}
              className="w-full mt-6 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
