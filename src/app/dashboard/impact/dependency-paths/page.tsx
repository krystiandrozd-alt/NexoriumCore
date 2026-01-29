'use client';

// Nexorium Core - Dependency Paths Page
// Entry/exit detection and dependency analysis

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PillarHeader } from '@/components/navigation';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import {
  GitBranch,
  Loader2,
  ArrowRight,
  LogIn,
  LogOut,
  AlertTriangle,
} from 'lucide-react';

interface DependencyPath {
  from: { id: string; name: string; layer: string };
  to: { id: string; name: string; layer: string };
  hops: number;
  critical: boolean;
}

export default function DependencyPathsPage() {
  const { selectedEnvironment } = useEnvironment();
  const [loading, setLoading] = useState(false);
  const [entryPoints, setEntryPoints] = useState<Array<{ id: string; name: string }>>([]);
  const [exitPoints, setExitPoints] = useState<Array<{ id: string; name: string }>>([]);
  const [paths, setPaths] = useState<DependencyPath[]>([]);

  useEffect(() => {
    if (selectedEnvironment) {
      fetchDependencyData();
    }
  }, [selectedEnvironment]);

  async function fetchDependencyData() {
    if (!selectedEnvironment) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/impact/entry-exit/${selectedEnvironment.id}`);
      const result = await response.json();
      if (result.success) {
        setEntryPoints(result.data.entryPoints || []);
        setExitPoints(result.data.exitPoints || []);
        setPaths(result.data.criticalPaths || []);
      }
    } catch (error) {
      console.error('Failed to fetch dependency data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PillarHeader
        title="Dependency Paths"
        description="Analyze entry points, exit points, and critical dependency paths"
        icon={GitBranch}
        iconColor="text-indigo-600"
      />

      {!selectedEnvironment ? (
        <Card>
          <CardContent className="py-16 text-center">
            <GitBranch className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Select an Environment
            </h3>
            <p className="text-slate-500">
              Use the environment switcher in the sidebar to analyze dependencies
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Entry/Exit Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-5 w-5 text-green-600" />
                  Entry Points
                </CardTitle>
                <CardDescription>
                  Components that receive external traffic
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entryPoints.length === 0 ? (
                  <p className="text-slate-500 text-sm">No entry points detected</p>
                ) : (
                  <div className="space-y-2">
                    {entryPoints.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                      >
                        <LogIn className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-blue-600" />
                  Exit Points
                </CardTitle>
                <CardDescription>
                  Components that send traffic externally
                </CardDescription>
              </CardHeader>
              <CardContent>
                {exitPoints.length === 0 ? (
                  <p className="text-slate-500 text-sm">No exit points detected</p>
                ) : (
                  <div className="space-y-2">
                    {exitPoints.map((exit) => (
                      <div
                        key={exit.id}
                        className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
                      >
                        <LogOut className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">{exit.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Critical Paths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Critical Dependency Paths
              </CardTitle>
              <CardDescription>
                Paths between entry and exit points that require monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paths.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No critical paths identified</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paths.map((path, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        path.critical ? 'border-amber-200 bg-amber-50' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{path.from.name}</span>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{path.to.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">{path.hops} hops</span>
                        {path.critical && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                            Critical
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
