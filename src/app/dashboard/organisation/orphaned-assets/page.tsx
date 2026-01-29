'use client';

// Nexorium Core - Orphaned Assets Page
// Assets without ownership

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PillarHeader } from '@/components/navigation';
import {
  AlertCircle,
  Loader2,
  UserPlus,
  Server,
  Network,
  Database,
} from 'lucide-react';

interface OrphanedAsset {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  detectedAt: string;
}

const entityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ENVIRONMENT: Network,
  COMPONENT: Server,
  COMPONENT_INSTANCE: Server,
  HOST: Server,
  CONNECTION: Database,
};

export default function OrphanedAssetsPage() {
  const [assets, setAssets] = useState<OrphanedAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrphanedAssets();
  }, []);

  async function fetchOrphanedAssets() {
    try {
      const response = await fetch('/api/organisation/orphans');
      const result = await response.json();
      if (result.success) {
        setAssets(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch orphaned assets:', error);
    } finally {
      setLoading(false);
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
        title="Orphaned Assets"
        description="Assets without assigned ownership"
        icon={AlertCircle}
        iconColor="text-amber-600"
      />

      {assets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-green-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No Orphaned Assets
            </h3>
            <p className="text-slate-500">
              All assets have assigned ownership
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              {assets.length} Orphaned Asset{assets.length > 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assets.map((asset) => {
                const Icon = entityIcons[asset.entityType] || Server;
                return (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 border border-amber-200 bg-amber-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-slate-900">{asset.entityName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{asset.entityType}</Badge>
                          <span className="text-xs text-slate-500">
                            Detected {new Date(asset.detectedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Assign Owner
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
