'use client';

// Nexorium Core - Project Environment Context
// Shared data source for projects and environments across Overview and Flow Map

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface EnvironmentData {
  id: string;
  name: string;
  type: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  stageId: string | null;
  projectId: string | null;
  stage: {
    id: string;
    key: string;
    name: string;
    color: string | null;
  } | null;
  _count: {
    nodes: number;
    edges: number;
  };
}

export interface ProjectData {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  status: string;
  ownerTeam: string | null;
  ownerEmail: string | null;
  businessUnit: string | null;
  costCenter: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  environments: EnvironmentData[];
  _count: {
    environments: number;
  };
}

interface ProjectEnvironmentContextType {
  projects: ProjectData[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<ProjectData>;
  createEnvironment: (data: CreateEnvironmentData) => Promise<EnvironmentData>;
  // Computed helpers
  allEnvironments: EnvironmentData[];
  getProjectById: (id: string) => ProjectData | undefined;
  getEnvironmentById: (id: string) => EnvironmentData | undefined;
}

export interface CreateProjectData {
  name: string;
  code?: string;
  description?: string;
  ownerTeam?: string;
  ownerEmail?: string;
  businessUnit?: string;
  costCenter?: string;
}

export interface CreateEnvironmentData {
  name: string;
  type: 'DEV' | 'SIT' | 'UAT' | 'NFT' | 'PREPROD' | 'PROD_RO';
  description?: string;
  projectId: string;
  stageId?: string;
}

const ProjectEnvironmentContext = createContext<ProjectEnvironmentContextType | null>(null);

export function ProjectEnvironmentProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/projects');
      const result = await response.json();

      if (result.success) {
        setProjects(result.data);
      } else {
        setError(result.error || 'Failed to fetch projects');
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createProjectFn = useCallback(async (data: CreateProjectData): Promise<ProjectData> => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create project');
    }

    // Update local state immediately
    setProjects((prev) => [result.data, ...prev]);

    return result.data;
  }, []);

  const createEnvironmentFn = useCallback(async (data: CreateEnvironmentData): Promise<EnvironmentData> => {
    // Find or create stage based on environment type
    let stageId = data.stageId;

    if (!stageId) {
      // Try to find a stage matching the environment type
      try {
        const stagesResponse = await fetch('/api/stages');
        const stagesResult = await stagesResponse.json();
        if (stagesResult.success && stagesResult.data) {
          const matchingStage = stagesResult.data.find(
            (s: { key: string }) => s.key === data.type
          );
          if (matchingStage) {
            stageId = matchingStage.id;
          }
        }
      } catch (e) {
        // Ignore stage lookup errors, environment can be created without stage
        console.warn('Could not look up stage:', e);
      }
    }

    const response = await fetch('/api/environments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        stageId,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create environment');
    }

    // Update local state immediately - add environment to the correct project
    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id === data.projectId) {
          return {
            ...project,
            environments: [...project.environments, result.data],
            _count: {
              ...project._count,
              environments: project._count.environments + 1,
            },
          };
        }
        return project;
      });
    });

    return result.data;
  }, []);

  // Computed: all environments flattened
  const allEnvironments = projects.flatMap((p) => p.environments);

  // Helpers
  const getProjectById = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  );

  const getEnvironmentById = useCallback(
    (id: string) => allEnvironments.find((e) => e.id === id),
    [allEnvironments]
  );

  return (
    <ProjectEnvironmentContext.Provider
      value={{
        projects,
        loading,
        error,
        refreshData: fetchData,
        createProject: createProjectFn,
        createEnvironment: createEnvironmentFn,
        allEnvironments,
        getProjectById,
        getEnvironmentById,
      }}
    >
      {children}
    </ProjectEnvironmentContext.Provider>
  );
}

export function useProjectEnvironment() {
  const context = useContext(ProjectEnvironmentContext);
  if (!context) {
    throw new Error('useProjectEnvironment must be used within ProjectEnvironmentProvider');
  }
  return context;
}
