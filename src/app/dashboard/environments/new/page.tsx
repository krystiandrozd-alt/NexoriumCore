'use client';

// Nexorium Core - New Environment Page
// Create a new environment with stage assignment

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PillarHeader } from '@/components/navigation';
import { Plus, ArrowLeft, Loader2, Network, AlertCircle } from 'lucide-react';

interface Stage {
  id: string;
  key: string;
  name: string;
  color: string | null;
  sortOrder: number;
}

interface Project {
  id: string;
  name: string;
  code: string | null;
  status: string;
}

const environmentTypes = [
  { value: 'DEV', label: 'Development (DEV)' },
  { value: 'SIT', label: 'System Integration Testing (SIT)' },
  { value: 'UAT', label: 'User Acceptance Testing (UAT)' },
  { value: 'NFT', label: 'Non-Functional Testing (NFT)' },
  { value: 'PREPROD', label: 'Pre-Production (PREPROD)' },
  { value: 'PROD_RO', label: 'Production Read-Only (PROD_RO)' },
];

export default function NewEnvironmentPage() {
  const router = useRouter();
  const [stages, setStages] = useState<Stage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStages, setLoadingStages] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('DEV');
  const [description, setDescription] = useState('');
  const [stageId, setStageId] = useState('');
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    fetchStages();
    fetchProjects();
  }, []);

  async function fetchStages() {
    try {
      const response = await fetch('/api/stages');
      const result = await response.json();
      if (result.success) {
        setStages(result.data);
        // Auto-select stage based on type
        const matchingStage = result.data.find((s: Stage) => s.key === type);
        if (matchingStage) {
          setStageId(matchingStage.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch stages:', err);
    } finally {
      setLoadingStages(false);
    }
  }

  async function fetchProjects() {
    try {
      const response = await fetch('/api/projects');
      const result = await response.json();
      if (result.success) {
        // Only show active projects
        setProjects(result.data.filter((p: Project) => p.status === 'ACTIVE'));
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  }

  // Auto-select matching stage when type changes
  useEffect(() => {
    const matchingStage = stages.find((s) => s.key === type);
    if (matchingStage) {
      setStageId(matchingStage.id);
    }
  }, [type, stages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Environment name is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/environments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          description: description.trim() || undefined,
          stageId: stageId || undefined,
          projectId: projectId || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/dashboard/environments/overview');
      } else {
        setError(result.error || 'Failed to create environment');
      }
    } catch (err) {
      console.error('Failed to create environment:', err);
      setError('Failed to create environment. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PillarHeader
        title="Create New Environment"
        description="Add a new test environment to your landscape"
        icon={Plus}
        iconColor="text-indigo-600"
        actions={
          <Link href="/dashboard/environments/overview">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
          </Link>
        }
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Network className="h-5 w-5 text-indigo-600" />
            Environment Details
          </CardTitle>
          <CardDescription>
            Define the basic properties of your new environment. It will appear in both the
            Environment Overview and the Flow Map.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Environment Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., SIT-1, UAT-Core, DEV-Sprint-42"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-slate-500">
                Choose a descriptive name that identifies this environment uniquely.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium text-slate-700">
                Environment Type <span className="text-red-500">*</span>
              </label>
              <Select
                id="type"
                options={environmentTypes}
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-slate-500">
                The type determines the environment&apos;s role in your testing landscape.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="project" className="block text-sm font-medium text-slate-700">
                Project
              </label>
              {loadingProjects ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No projects available.{' '}
                  <Link href="/dashboard/configuration/projects" className="text-indigo-600 hover:underline">
                    Create a project
                  </Link>{' '}
                  first.
                </p>
              ) : (
                <>
                  <Select
                    id="project"
                    options={[
                      { value: '', label: 'No project assigned' },
                      ...projects.map((p) => ({
                        value: p.id,
                        label: p.code ? `${p.name} (${p.code})` : p.name,
                      })),
                    ]}
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-slate-500">
                    Assign this environment to a project for organizational grouping.
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="stage" className="block text-sm font-medium text-slate-700">
                Flow Map Stage
              </label>
              {loadingStages ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading stages...
                </div>
              ) : stages.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No stages configured. The environment will not appear on the Flow Map until a stage is assigned.
                </p>
              ) : (
                <>
                  <Select
                    id="stage"
                    options={[
                      { value: '', label: 'No stage (will not appear on Flow Map)' },
                      ...stages.map((s) => ({ value: s.id, label: s.name })),
                    ]}
                    value={stageId}
                    onChange={(e) => setStageId(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-slate-500">
                    Assigning a stage places this environment on the Flow Map in the corresponding swimlane.
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Optional: Describe the purpose or scope of this environment..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
                className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Link href="/dashboard/environments/overview">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Environment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
