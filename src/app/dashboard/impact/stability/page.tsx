'use client';

// TelEnvIQ - Stability Page
// Environment stability index and metrics

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarHeader } from '@/components/navigation';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StabilityPage() {
  const { selectedEnvironment } = useEnvironment();

  // Mock stability data
  const stabilityMetrics = [
    { name: 'Change Frequency', value: 'Low', trend: 'stable', score: 85 },
    { name: 'Drift Index', value: '2.3%', trend: 'down', score: 92 },
    { name: 'Deployment Success Rate', value: '98%', trend: 'up', score: 98 },
    { name: 'Incident Count (30d)', value: '3', trend: 'down', score: 88 },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <PillarHeader
        title="Stability Index"
        description="Monitor environment stability and change patterns"
        icon={Activity}
        iconColor="text-green-600"
      />

      {!selectedEnvironment ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Activity className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Select an Environment
            </h3>
            <p className="text-slate-500">
              Use the environment switcher to view stability metrics
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall Stability Score */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-slate-700">
                    Overall Stability Score
                  </h2>
                  <p className="text-sm text-slate-500">
                    {selectedEnvironment.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-green-600">91</p>
                  <p className="text-sm text-slate-500">/ 100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stabilityMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-500 font-normal">
                    {metric.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-900">
                      {metric.value}
                    </span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
