'use client';

// Nexorium Core - Platform Settings Page
// Global and scoped platform configuration

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { PillarHeader } from '@/components/navigation';
import {
  Settings,
  Loader2,
  Save,
} from 'lucide-react';

interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  valueType: string;
  scope: string;
  description?: string;
}

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch('/api/configuration/settings');
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

  async function saveSettings() {
    setSaving(true);
    try {
      await fetch('/api/configuration/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Group settings by category
  const generalSettings = settings.filter((s) => s.scope === 'GLOBAL');

  return (
    <div className="space-y-6">
      <PillarHeader
        title="Platform Settings"
        description="Configure global platform behavior and defaults"
        icon={Settings}
        iconColor="text-indigo-600"
        actions={
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Global configuration options for the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {generalSettings.length === 0 ? (
            <p className="text-slate-500">No settings configured</p>
          ) : (
            generalSettings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {setting.key.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  {setting.description && (
                    <p className="text-sm text-slate-500">{setting.description}</p>
                  )}
                </div>
                {setting.valueType === 'boolean' ? (
                  <Switch
                    checked={setting.value === 'true'}
                    onCheckedChange={(checked) =>
                      updateSetting(setting.key, String(checked))
                    }
                  />
                ) : (
                  <Input
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    className="w-32"
                    type={setting.valueType === 'number' ? 'number' : 'text'}
                  />
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Default Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Default Values</CardTitle>
          <CardDescription>
            Default settings that can be overridden at lower scopes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="font-medium text-slate-900">Staleness Threshold</p>
              <p className="text-sm text-slate-500">Days before data is considered stale</p>
            </div>
            <Input
              defaultValue="30"
              className="w-20"
              type="number"
            />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="font-medium text-slate-900">Auto-create Snapshots</p>
              <p className="text-sm text-slate-500">Create snapshots after connector runs</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-900">Enforce Governance</p>
              <p className="text-sm text-slate-500">Block promotions that fail governance rules</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
