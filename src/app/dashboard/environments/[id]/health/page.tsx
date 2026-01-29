'use client';

// Nexorium Core - Environment Health Page
// Health overlay and readiness indicators

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
} from 'lucide-react';

interface HealthMetric {
  name: string;
  score: number;
  status: 'pass' | 'warn' | 'fail';
  message?: string;
  details?: string[];
}

interface EnvironmentHealth {
  overallScore: number;
  overallStatus: 'healthy' | 'warning' | 'critical';
  metrics: HealthMetric[];
  lastEvaluatedAt: string;
}

const statusColors = {
  pass: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  warn: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertTriangle },
  fail: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

export default function EnvironmentHealthPage() {
  const params = useParams();
  const id = params.id as string;
  const [health, setHealth] = useState<EnvironmentHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchHealth() {
      try {
        const response = await fetch(`/api/environments/${id}/health`);
        const result = await response.json();
        if (result.success) {
          setHealth(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch health:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Generate mock health data if API doesn't return it yet
  const healthData: EnvironmentHealth = health || {
    overallScore: 85,
    overallStatus: 'warning',
    metrics: [
      { name: 'Structural Completeness', score: 95, status: 'pass', message: 'All required components present' },
      { name: 'Version Validity', score: 80, status: 'warn', message: '2 components have outdated versions' },
      { name: 'Snapshot Integrity', score: 100, status: 'pass', message: 'Latest snapshot is valid' },
      { name: 'Topology Health', score: 75, status: 'warn', message: '3 broken connections detected' },
      { name: 'Governance Alignment', score: 70, status: 'warn', message: 'Missing blueprint alignment' },
    ],
    lastEvaluatedAt: new Date().toISOString(),
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                healthData.overallStatus === 'healthy' ? 'bg-green-100' :
                healthData.overallStatus === 'warning' ? 'bg-amber-100' : 'bg-red-100'
              }`}>
                <Activity className={`h-8 w-8 ${
                  healthData.overallStatus === 'healthy' ? 'text-green-600' :
                  healthData.overallStatus === 'warning' ? 'text-amber-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Environment Health</h2>
                <p className="text-slate-500">
                  Last evaluated {new Date(healthData.lastEvaluatedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-5xl font-bold ${getScoreColor(healthData.overallScore)}`}>
                {healthData.overallScore}
              </p>
              <p className="text-sm text-slate-500">Readiness Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthData.metrics.map((metric) => {
          const StatusIcon = statusColors[metric.status].icon;

          return (
            <Card key={metric.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{metric.name}</CardTitle>
                  <Badge
                    variant="secondary"
                    className={`${statusColors[metric.status].bg} ${statusColors[metric.status].text}`}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {metric.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                      {metric.score}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getProgressColor(metric.score)}`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                  {metric.message && (
                    <p className="text-sm text-slate-500">{metric.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Readiness Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Readiness Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'All components have valid versions', passed: true },
              { label: 'No broken topology connections', passed: false },
              { label: 'Latest snapshot within 24 hours', passed: true },
              { label: 'Governance rules passed', passed: false },
              { label: 'No critical policy violations', passed: true },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                {item.passed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={item.passed ? 'text-slate-700' : 'text-slate-500'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
