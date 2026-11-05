'use client';

// Nexorium Core - Environments Overview Page
// Projects grouped with their environments, create modals

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ModalSimple as Modal } from '@/components/ui/modal';
import { PillarHeader } from '@/components/navigation';
import {
  useProjectEnvironment,
  type CreateProjectData,
} from '@/contexts/ProjectEnvironmentContext';
import {
  Network,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  List,
  Users,
  Building2,
  ExternalLink,
} from 'lucide-react';

const typeColors: Record<string, string> = {
  DEV: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  SIT: 'bg-blue-100 text-blue-700 border-blue-200',
  UAT: 'bg-violet-100 text-violet-700 border-violet-200',
  NFT: 'bg-amber-100 text-amber-700 border-amber-200',
  PREPROD: 'bg-orange-100 text-orange-700 border-orange-200',
  PROD_RO: 'bg-red-100 text-red-700 border-red-200',
};

const typeLabels: Record<string, string> = {
  DEV: 'Development',
  SIT: 'System Integration Test',
  UAT: 'User Acceptance Test',
  NFT: 'Non-Functional Test',
  PREPROD: 'Pre-Production',
  PROD_RO: 'Production (Read-Only)',
};

export default function EnvironmentsOverviewPage() {
  const {
    projects,
    loading,
    error,
    refreshData,
    createProject,
    createEnvironment,
  } = useProjectEnvironment();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateEnvironmentModal, setShowCreateEnvironmentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Project form state
  const [projectForm, setProjectForm] = useState<CreateProjectData>({
    name: '',
    code: '',
    description: '',
    ownerTeam: '',
    ownerEmail: '',
  });

  // Environment form state
  const [envForm, setEnvForm] = useState<{
    name: string;
    type: 'DEV' | 'SIT' | 'UAT' | 'NFT' | 'PREPROD' | 'PROD_RO';
    description: string;
    projectId: string;
  }>({
    name: '',
    type: 'DEV',
    description: '',
    projectId: '',
  });

  // Filter projects based on search
  const filteredProjects = projects.filter((project) => {
    const matchesName = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEnv = project.environments.some((env) =>
      env.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesName || matchesEnv;
  });

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleCreateProject = async () => {
    if (!projectForm.name.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const newProject = await createProject({
        name: projectForm.name.trim(),
        code: projectForm.code?.trim() || undefined,
        description: projectForm.description?.trim() || undefined,
        ownerTeam: projectForm.ownerTeam?.trim() || undefined,
        ownerEmail: projectForm.ownerEmail?.trim() || undefined,
      });

      // Auto-expand new project
      setExpandedProjects((prev) => new Set([...Array.from(prev), newProject.id]));

      // Reset form and close modal
      setProjectForm({ name: '', code: '', description: '', ownerTeam: '', ownerEmail: '' });
      setShowCreateProjectModal(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEnvironment = async () => {
    if (!envForm.name.trim() || !envForm.projectId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createEnvironment({
        name: envForm.name.trim(),
        type: envForm.type,
        description: envForm.description?.trim() || undefined,
        projectId: envForm.projectId,
      });

      // Auto-expand the project
      setExpandedProjects((prev) => new Set([...Array.from(prev), envForm.projectId]));

      // Reset form and close modal
      setEnvForm({ name: '', type: 'DEV', description: '', projectId: '' });
      setShowCreateEnvironmentModal(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create environment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateEnvironmentForProject = (projectId: string) => {
    setEnvForm((prev) => ({ ...prev, projectId }));
    setShowCreateEnvironmentModal(true);
  };

  // Expand all projects by default on initial load
  if (!loading && projects.length > 0 && expandedProjects.size === 0) {
    setExpandedProjects(new Set(projects.map((p) => p.id)));
  }

  return (
    <div className="space-y-6">
      <PillarHeader
        title="Environments"
        description="Projects and their associated environments"
        icon={List}
        iconColor="text-indigo-600"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCreateProjectModal(true)}>
              <FolderOpen className="h-4 w-4 mr-2" />
              New Project
            </Button>
            <Button onClick={() => setShowCreateEnvironmentModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Environment
            </Button>
          </div>
        }
      />

      {/* Search & Refresh */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search projects or environments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button variant="outline" onClick={refreshData} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProjects.length === 0 && (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchQuery ? 'No matching projects or environments' : 'No projects yet'}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Create your first project to start organizing environments'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCreateProjectModal(true)}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      {!loading && !error && filteredProjects.length > 0 && (
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const isExpanded = expandedProjects.has(project.id);
            const envCount = project.environments.length;

            return (
              <Card key={project.id} className="overflow-hidden">
                {/* Project Header */}
                <CardHeader
                  className="cursor-pointer hover:bg-slate-50/50 transition-colors py-4"
                  onClick={() => toggleProject(project.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      )}
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {project.name}
                          {project.code && (
                            <span className="text-xs font-normal text-slate-400">
                              ({project.code})
                            </span>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Network className="h-3 w-3" />
                            {envCount} environment{envCount !== 1 ? 's' : ''}
                          </span>
                          {project.ownerTeam && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {project.ownerTeam}
                            </span>
                          )}
                          {project.businessUnit && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {project.businessUnit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          project.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : project.status === 'ARCHIVED'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-700'
                        }
                      >
                        {project.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateEnvironmentForProject(project.id);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Env
                      </Button>
                    </div>
                  </div>
                  {project.description && isExpanded && (
                    <p className="text-sm text-slate-500 mt-2 ml-[68px]">
                      {project.description}
                    </p>
                  )}
                </CardHeader>

                {/* Environments List */}
                {isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    {envCount === 0 ? (
                      <div className="ml-[68px] py-4 text-sm text-slate-400 text-center border border-dashed border-slate-200 rounded-lg">
                        No environments yet.{' '}
                        <button
                          className="text-indigo-600 hover:underline"
                          onClick={() => openCreateEnvironmentForProject(project.id)}
                        >
                          Create one
                        </button>
                      </div>
                    ) : (
                      <div className="ml-[68px] space-y-2">
                        {project.environments.map((env) => (
                          <div
                            key={env.id}
                            className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-md bg-white border border-slate-200 flex items-center justify-center">
                                <Network className="h-4 w-4 text-slate-500" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-slate-900">
                                    {env.name}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${typeColors[env.type] || ''}`}
                                  >
                                    {env.type}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                                  <span>
                                    {env._count?.nodes || 0} nodes · {env._count?.edges || 0} edges
                                  </span>
                                  {env.stage && (
                                    <span
                                      className="px-1.5 py-0.5 rounded text-xs"
                                      style={{
                                        backgroundColor: env.stage.color
                                          ? `${env.stage.color}20`
                                          : '#64748b20',
                                        color: env.stage.color || '#64748b',
                                      }}
                                    >
                                      {env.stage.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Link href={`/dashboard/environments/${env.id}/graph`}>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateProjectModal}
        onClose={() => {
          setShowCreateProjectModal(false);
          setSubmitError(null);
          setProjectForm({ name: '', code: '', description: '', ownerTeam: '', ownerEmail: '' });
        }}
        title="Create New Project"
      >
        <div className="space-y-4">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Project Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={projectForm.name}
              onChange={(e) => setProjectForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., BSS Transformation"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Project Code
            </label>
            <Input
              value={projectForm.code}
              onChange={(e) => setProjectForm((prev) => ({ ...prev, code: e.target.value }))}
              placeholder="e.g., BSS-TX"
            />
            <p className="text-xs text-slate-500 mt-1">Short identifier for the project</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Owner Team
            </label>
            <Input
              value={projectForm.ownerTeam}
              onChange={(e) => setProjectForm((prev) => ({ ...prev, ownerTeam: e.target.value }))}
              placeholder="e.g., Platform Engineering"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Owner Email
            </label>
            <Input
              type="email"
              value={projectForm.ownerEmail}
              onChange={(e) => setProjectForm((prev) => ({ ...prev, ownerEmail: e.target.value }))}
              placeholder="e.g., team@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              rows={3}
              value={projectForm.description}
              onChange={(e) =>
                setProjectForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Brief description of the project..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateProjectModal(false);
                setSubmitError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!projectForm.name.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Environment Modal */}
      <Modal
        isOpen={showCreateEnvironmentModal}
        onClose={() => {
          setShowCreateEnvironmentModal(false);
          setSubmitError(null);
          setEnvForm({ name: '', type: 'DEV', description: '', projectId: '' });
        }}
        title="Create New Environment"
      >
        <div className="space-y-4">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Project <span className="text-red-500">*</span>
            </label>
            <Select
              value={envForm.projectId}
              onChange={(e) => setEnvForm((prev) => ({ ...prev, projectId: e.target.value }))}
              options={[
                { value: '', label: 'Select a project...' },
                ...projects.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
            {projects.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No projects available.{' '}
                <button
                  className="text-indigo-600 hover:underline"
                  onClick={() => {
                    setShowCreateEnvironmentModal(false);
                    setShowCreateProjectModal(true);
                  }}
                >
                  Create a project first
                </button>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Environment Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={envForm.name}
              onChange={(e) => setEnvForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., SIT-Alpha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Environment Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={envForm.type}
              onChange={(e) =>
                setEnvForm((prev) => ({
                  ...prev,
                  type: e.target.value as typeof envForm.type,
                }))
              }
              options={[
                { value: 'DEV', label: typeLabels.DEV },
                { value: 'SIT', label: typeLabels.SIT },
                { value: 'UAT', label: typeLabels.UAT },
                { value: 'NFT', label: typeLabels.NFT },
                { value: 'PREPROD', label: typeLabels.PREPROD },
                { value: 'PROD_RO', label: typeLabels.PROD_RO },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              rows={3}
              value={envForm.description}
              onChange={(e) => setEnvForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the environment..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateEnvironmentModal(false);
                setSubmitError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateEnvironment}
              disabled={!envForm.name.trim() || !envForm.projectId || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Environment'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
