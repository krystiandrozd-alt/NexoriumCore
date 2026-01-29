'use client';

// Nexorium Core - Environment Context
// Global environment state provider for scoped navigation

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Environment {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  stageId?: string | null;
}

interface EnvironmentContextType {
  selectedEnvironment: Environment | null;
  setSelectedEnvironment: (env: Environment | null) => void;
  environments: Environment[];
  isLoading: boolean;
  error: string | null;
  refreshEnvironments: () => Promise<void>;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnvironments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/environments');
      if (!response.ok) {
        throw new Error('Failed to fetch environments');
      }
      const result = await response.json();
      const envData = result.data || [];
      setEnvironments(envData);

      // Restore previously selected environment from localStorage
      const savedEnvId = localStorage.getItem('selectedEnvironmentId');
      if (savedEnvId) {
        const savedEnv = envData.find((e: Environment) => e.id === savedEnvId);
        if (savedEnv) {
          setSelectedEnvironment(savedEnv);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnvironments();
  }, [fetchEnvironments]);

  // Persist selected environment to localStorage
  useEffect(() => {
    if (selectedEnvironment) {
      localStorage.setItem('selectedEnvironmentId', selectedEnvironment.id);
    } else {
      localStorage.removeItem('selectedEnvironmentId');
    }
  }, [selectedEnvironment]);

  const value: EnvironmentContextType = {
    selectedEnvironment,
    setSelectedEnvironment,
    environments,
    isLoading,
    error,
    refreshEnvironments: fetchEnvironments,
  };

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
}
