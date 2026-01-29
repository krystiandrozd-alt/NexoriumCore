'use client';

// Nexorium Core - Flow Map V2 Filters
// Simplified filter panel with stage/domain/search only

import { memo, useCallback } from 'react';
import { Search, X, RotateCcw, ChevronLeft, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  FlowMapV2Filters as FilterState,
  FlowMapV2Stage,
  FlowMapStageKey,
  FlowMapDomain,
} from '@/types/flow-map-v2';
import { stageColors, domainColors, defaultFlowMapV2Filters } from '@/types/flow-map-v2';

interface FlowMapV2FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  stages: FlowMapV2Stage[];
  isOpen: boolean;
  onToggle: () => void;
}

const allDomains: FlowMapDomain[] = ['BSS', 'OSS', 'NETWORK', 'EXTERNAL'];

function FlowMapV2Filters({
  filters,
  onFiltersChange,
  stages,
  isOpen,
  onToggle,
}: FlowMapV2FiltersProps) {
  // Toggle stage filter
  const toggleStage = useCallback(
    (stageKey: FlowMapStageKey) => {
      const newStages = filters.stages.includes(stageKey)
        ? filters.stages.filter((s) => s !== stageKey)
        : [...filters.stages, stageKey];
      onFiltersChange({ ...filters, stages: newStages });
    },
    [filters, onFiltersChange]
  );

  // Toggle domain filter
  const toggleDomain = useCallback(
    (domain: FlowMapDomain) => {
      const newDomains = filters.domains.includes(domain)
        ? filters.domains.filter((d) => d !== domain)
        : [...filters.domains, domain];
      onFiltersChange({ ...filters, domains: newDomains });
    },
    [filters, onFiltersChange]
  );

  // Update search query
  const setSearchQuery = useCallback(
    (query: string) => {
      onFiltersChange({ ...filters, searchQuery: query });
    },
    [filters, onFiltersChange]
  );

  // Toggle domain grouping
  const toggleDomainGrouping = useCallback(() => {
    onFiltersChange({ ...filters, showDomainGrouping: !filters.showDomainGrouping });
  }, [filters, onFiltersChange]);

  // Reset to defaults
  const resetFilters = useCallback(() => {
    onFiltersChange(defaultFlowMapV2Filters);
  }, [onFiltersChange]);

  // Check if any filter is active
  const hasActiveFilters =
    filters.stages.length !== defaultFlowMapV2Filters.stages.length ||
    filters.domains.length !== defaultFlowMapV2Filters.domains.length ||
    filters.searchQuery !== '' ||
    filters.showDomainGrouping !== defaultFlowMapV2Filters.showDomainGrouping;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">Filters</h3>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Filter content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter environments..."
              className={cn(
                'w-full pl-9 pr-9 py-2 rounded-lg',
                'bg-white/5 border border-white/10',
                'text-sm text-white placeholder:text-slate-500',
                'focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50',
                'transition-all'
              )}
            />
            {filters.searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stages */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              Stages
            </label>
            <button
              onClick={() => {
                const allStages = stages.map((s) => s.key);
                const allSelected = allStages.every((s) => filters.stages.includes(s));
                onFiltersChange({
                  ...filters,
                  stages: allSelected ? [] : allStages,
                });
              }}
              className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
            >
              {stages.every((s) => filters.stages.includes(s.key)) ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="space-y-1">
            {stages.map((stage) => {
              const isSelected = filters.stages.includes(stage.key);
              const color = stage.color || stageColors[stage.key];

              return (
                <button
                  key={stage.key}
                  onClick={() => toggleStage(stage.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
                    'transition-all duration-150',
                    isSelected
                      ? 'bg-white/10 border border-white/20'
                      : 'bg-white/5 border border-transparent hover:bg-white/10'
                  )}
                >
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full transition-all',
                      isSelected ? 'scale-100' : 'scale-75 opacity-50'
                    )}
                    style={{ backgroundColor: color }}
                  />
                  <span className={cn(
                    'text-sm',
                    isSelected ? 'text-white' : 'text-slate-400'
                  )}>
                    {stage.name}
                  </span>
                  <span className="ml-auto text-[10px] text-slate-500">
                    {stage.environmentCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Domains (optional grouping) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              Domains
            </label>
            <button
              onClick={() => {
                const allSelected = allDomains.every((d) => filters.domains.includes(d));
                onFiltersChange({
                  ...filters,
                  domains: allSelected ? [] : allDomains,
                });
              }}
              className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
            >
              {allDomains.every((d) => filters.domains.includes(d)) ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="space-y-1">
            {allDomains.map((domain) => {
              const isSelected = filters.domains.includes(domain);
              const color = domainColors[domain];

              return (
                <button
                  key={domain}
                  onClick={() => toggleDomain(domain)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
                    'transition-all duration-150',
                    isSelected
                      ? 'bg-white/10 border border-white/20'
                      : 'bg-white/5 border border-transparent hover:bg-white/10'
                  )}
                >
                  <div
                    className={cn(
                      'w-3 h-3 rounded transition-all',
                      isSelected ? 'scale-100' : 'scale-75 opacity-50'
                    )}
                    style={{ backgroundColor: color }}
                  />
                  <span className={cn(
                    'text-sm',
                    isSelected ? 'text-white' : 'text-slate-400'
                  )}>
                    {domain}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Options */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
            View Options
          </label>
          <button
            onClick={toggleDomainGrouping}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
              'transition-all duration-150',
              filters.showDomainGrouping
                ? 'bg-violet-500/20 border border-violet-500/40'
                : 'bg-white/5 border border-transparent hover:bg-white/10'
            )}
          >
            <Grid3X3 className={cn(
              'h-4 w-4',
              filters.showDomainGrouping ? 'text-violet-400' : 'text-slate-400'
            )} />
            <span className={cn(
              'text-sm',
              filters.showDomainGrouping ? 'text-white' : 'text-slate-400'
            )}>
              Group by Domain
            </span>
          </button>
        </div>
      </div>

      {/* Reset button */}
      {hasActiveFilters && (
        <div className="p-4 border-t border-white/5">
          <button
            onClick={resetFilters}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2',
              'rounded-lg text-sm font-medium',
              'bg-white/5 border border-white/10',
              'text-slate-400 hover:text-white hover:bg-white/10',
              'transition-all'
            )}
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(FlowMapV2Filters);
