// Nexorium Core - Overview Data Hook
// Custom hook for fetching overview dashboard data

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  OverviewData,
  OverviewFilters,
  OverviewApiResponse,
  ActivityApiResponse,
  ActivityItem,
} from '@/types/overview';

interface UseOverviewDataOptions {
  filters?: Partial<OverviewFilters>;
  refreshInterval?: number; // in milliseconds
}

interface UseOverviewDataReturn {
  data: OverviewData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOverviewData(options: UseOverviewDataOptions = {}): UseOverviewDataReturn {
  const { filters = {}, refreshInterval } = options;

  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (filters.projectIds?.length) {
        params.set('projectIds', filters.projectIds.join(','));
      }
      if (filters.environmentIds?.length) {
        params.set('environmentIds', filters.environmentIds.join(','));
      }
      if (filters.timeWindowDays) {
        params.set('timeWindowDays', filters.timeWindowDays.toString());
      }
      if (typeof filters.riskThreshold === 'number') {
        params.set('riskThreshold', filters.riskThreshold.toString());
      }

      const url = `/api/overview${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const json: OverviewApiResponse = await response.json();

      if (!json.success || !json.data) {
        throw new Error(json.error || 'Failed to fetch overview data');
      }

      setData(json.data);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [filters.projectIds, filters.environmentIds, filters.timeWindowDays, filters.riskThreshold]);

  // Initial fetch and refetch when filters change
  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Set up refresh interval if specified
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// Hook for paginated activity feed
interface UseActivityFeedOptions {
  limit?: number;
  environmentIds?: string[];
}

interface UseActivityFeedReturn {
  activities: ActivityItem[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useActivityFeed(options: UseActivityFeedOptions = {}): UseActivityFeedReturn {
  const { limit = 20, environmentIds } = options;

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchActivities = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;

      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      params.set('offset', currentOffset.toString());
      if (environmentIds?.length) {
        params.set('environmentIds', environmentIds.join(','));
      }

      const response = await fetch(`/api/overview/activity?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const json: ActivityApiResponse = await response.json();

      if (!json.success || !json.data) {
        throw new Error(json.error || 'Failed to fetch activity');
      }

      if (reset) {
        setActivities(json.data.items);
        setOffset(json.data.items.length);
      } else {
        setActivities(prev => [...prev, ...json.data!.items]);
        setOffset(prev => prev + json.data!.items.length);
      }
      setHasMore(json.data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity');
    } finally {
      setIsLoading(false);
    }
  }, [limit, environmentIds, offset]);

  // Initial fetch
  useEffect(() => {
    fetchActivities(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, environmentIds?.join(',')]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchActivities(false);
  }, [hasMore, isLoading, fetchActivities]);

  const refetch = useCallback(async () => {
    setOffset(0);
    await fetchActivities(true);
  }, [fetchActivities]);

  return {
    activities,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
  };
}
