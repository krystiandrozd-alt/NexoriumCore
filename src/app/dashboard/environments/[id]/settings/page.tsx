'use client';

// Nexorium Core - Environment Settings Page
// Configuration settings for the environment

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Settings,
  Loader2,
  Save,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface EnvironmentSettings {
  id: string;
  name: string;
  type: string;
  description?: string;
  stageId?: string;
}

export default function EnvironmentSettingsPage() {
  const params = useParams();
  const id = params.id as string;
  const [settings, setSettings] = useState<EnvironmentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchSettings() {
      try {
        const response = await fetch(`/api/environments/${id}`);
        const result = await response.json();
        if (result.success) {
          setSettings(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [id]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/environments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (result.success) {
        alert('Settings saved successfully');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Configure basic environment properties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Environment Name
            </label>
            <Input
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Environment Type
            </label>
            <Select
              value={settings.type}
              onChange={(e) => setSettings({ ...settings, type: e.target.value })}
              options={[
                { value: 'DEV', label: 'Development' },
                { value: 'SIT', label: 'System Integration Test' },
                { value: 'UAT', label: 'User Acceptance Test' },
                { value: 'NFT', label: 'Non-Functional Test' },
                { value: 'PREPROD', label: 'Pre-Production' },
                { value: 'PROD_RO', label: 'Production (Read-Only)' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <Input
              value={settings.description || ''}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure alerts and notifications for this environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Drift Alerts</p>
              <p className="text-sm text-slate-500">Get notified when environment drifts from baseline</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Stale Data Warnings</p>
              <p className="text-sm text-slate-500">Alert when test data becomes stale</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Governance Violations</p>
              <p className="text-sm text-slate-500">Notify on policy violations</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-red-900">Delete Environment</p>
              <p className="text-sm text-red-700">
                Permanently delete this environment and all its data
              </p>
            </div>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
