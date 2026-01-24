'use client';

// TelEnvIQ - Environment Snapshots Page
// Snapshot timeline for the environment

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  History,
  Loader2,
  Camera,
  GitCompare,
  Download,
  ChevronRight,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface Snapshot {
  id: string;
  snapshotHash: string;
  createdAt: string;
  snapshotData: {
    nodes?: unknown[];
    edges?: unknown[];
    componentInstances?: unknown[];
    connections?: unknown[];
  };
}

export default function EnvironmentSnapshotsPage() {
  const params = useParams();
  const id = params.id as string;
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSnapshots, setSelectedSnapshots] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    fetchSnapshots();
  }, [id]);

  async function fetchSnapshots() {
    try {
      const response = await fetch(`/api/environments/${id}/snapshots`);
      const result = await response.json();
      if (result.success) {
        setSnapshots(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch snapshots:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createSnapshot() {
    try {
      const response = await fetch('/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environmentId: id }),
      });
      const result = await response.json();
      if (result.success) {
        fetchSnapshots();
      }
    } catch (error) {
      console.error('Failed to create snapshot:', error);
    }
  }

  const toggleSnapshotSelection = (snapshotId: string) => {
    setSelectedSnapshots((prev) => {
      if (prev.includes(snapshotId)) {
        return prev.filter((s) => s !== snapshotId);
      }
      if (prev.length >= 2) {
        return [prev[1], snapshotId];
      }
      return [...prev, snapshotId];
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">
          {selectedSnapshots.length === 2 && (
            <span>2 snapshots selected for comparison</span>
          )}
        </div>
        <div className="flex gap-3">
          {selectedSnapshots.length === 2 && (
            <Button variant="outline">
              <GitCompare className="h-4 w-4 mr-2" />
              Compare Selected
            </Button>
          )}
          <Button onClick={createSnapshot}>
            <Camera className="h-4 w-4 mr-2" />
            Create Snapshot
          </Button>
        </div>
      </div>

      {/* Snapshots List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Snapshot Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No snapshots yet
              </h3>
              <p className="text-slate-500 mb-4">
                Create a snapshot to capture the current state
              </p>
              <Button onClick={createSnapshot}>
                <Camera className="h-4 w-4 mr-2" />
                Create First Snapshot
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {snapshots.map((snapshot, index) => {
                const isSelected = selectedSnapshots.includes(snapshot.id);
                const nodeCount = snapshot.snapshotData?.nodes?.length ||
                  snapshot.snapshotData?.componentInstances?.length || 0;
                const edgeCount = snapshot.snapshotData?.edges?.length ||
                  snapshot.snapshotData?.connections?.length || 0;

                return (
                  <div
                    key={snapshot.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => toggleSnapshotSelection(snapshot.id)}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-green-500' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          Snapshot
                        </span>
                        {index === 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Latest
                          </Badge>
                        )}
                        <code className="text-xs text-slate-500 font-mono">
                          {snapshot.snapshotHash.substring(0, 8)}
                        </code>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span>{nodeCount} components</span>
                        <span>{edgeCount} connections</span>
                        <span>{formatRelativeTime(new Date(snapshot.createdAt))}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
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
