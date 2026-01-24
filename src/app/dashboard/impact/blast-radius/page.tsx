'use client';

// TelEnvIQ - Blast Radius Page
// Calculate impact scope of component changes

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PillarHeader } from '@/components/navigation';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import {
  Target,
  Loader2,
  Search,
  Server,
} from 'lucide-react';

interface BlastRadiusResult {
  sourceComponent: { id: string; name: string };
  impactedComponents: Array<{
    id: string;
    name: string;
    layer: string;
    distance: number;
    impactLevel: 'direct' | 'indirect';
  }>;
  totalImpacted: number;
  criticalImpacted: number;
}

export default function BlastRadiusPage() {
  const { selectedEnvironment } = useEnvironment();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BlastRadiusResult | null>(null);

  async function _calculateBlastRadius(componentId: string) {
    if (!selectedEnvironment) return;
    setLoading(true);
    try {
      const response = await fetch('/api/impact/blast-radius', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environmentId: selectedEnvironment.id,
          componentId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('Failed to calculate blast radius:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PillarHeader
        title="Blast Radius"
        description="Calculate the impact scope of component changes"
        icon={Target}
        iconColor="text-red-600"
      />

      {!selectedEnvironment ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Target className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Select an Environment
            </h3>
            <p className="text-slate-500">
              Use the environment switcher to analyze blast radius
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search Component */}
          <Card>
            <CardHeader>
              <CardTitle>Select Component</CardTitle>
              <CardDescription>
                Choose a component to analyze its blast radius
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search components..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button disabled={loading || !searchQuery}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Target className="h-4 w-4 mr-2" />
                  )}
                  Calculate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Blast Radius Analysis</CardTitle>
                    <CardDescription>
                      Impact analysis for: {result.sourceComponent.name}
                    </CardDescription>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-slate-900">
                        {result.totalImpacted}
                      </p>
                      <p className="text-xs text-slate-500">Total Impacted</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-red-600">
                        {result.criticalImpacted}
                      </p>
                      <p className="text-xs text-slate-500">Critical</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.impactedComponents.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Server className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="font-medium">{comp.name}</p>
                          <p className="text-sm text-slate-500">{comp.layer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">
                          {comp.distance} hop{comp.distance > 1 ? 's' : ''}
                        </span>
                        <Badge
                          variant="secondary"
                          className={
                            comp.impactLevel === 'direct'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }
                        >
                          {comp.impactLevel}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
