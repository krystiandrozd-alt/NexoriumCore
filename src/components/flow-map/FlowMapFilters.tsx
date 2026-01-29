'use client';

// Nexorium Core - Flow Map Filter Sidebar
// Collapsible filter panel for portfolio intelligence view

import { memo, useState, useCallback } from 'react';
import {
  ChevronLeft,
  Filter,
  AlertTriangle,
  Layers,
  Server,
  Database,
  Globe,
  Briefcase,
  Calendar,
  Activity,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  FlowMapFilters,
  RiskLevel,
  FlowNodeType,
  FlowEdgeType,
  Project,
} from '@/types/flow-map';

// ============================================
// INTERFACES
// ============================================

interface FlowMapFiltersProps {
  filters: FlowMapFilters;
  onFiltersChange: (filters: FlowMapFilters) => void;
  projects: Project[];
  systemOptions: { id: string; label: string }[];
  environmentOptions: { id: string; label: string }[];
  isOpen: boolean;
  onToggle: () => void;
}

// ============================================
// FILTER SECTIONS
// ============================================

const riskLevelOptions: { value: RiskLevel; label: string; color: string }[] = [
  { value: 'CRITICAL', label: 'Critical', color: 'bg-rose-500' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-amber-500' },
  { value: 'LOW', label: 'Low', color: 'bg-emerald-500' },
  { value: 'NONE', label: 'None', color: 'bg-slate-500' },
];

const nodeTypeOptions: { value: FlowNodeType; label: string; icon: typeof Server }[] = [
  { value: 'PROJECT', label: 'Projects', icon: Briefcase },
  { value: 'ENVIRONMENT', label: 'Environments', icon: Server },
  { value: 'SYSTEM', label: 'Systems', icon: Database },
  { value: 'EXTERNAL', label: 'External', icon: Globe },
];

const edgeTypeOptions: { value: FlowEdgeType; label: string; description: string }[] = [
  { value: 'PROMOTION', label: 'Promotion', description: 'Change deployments' },
  { value: 'INTEGRATION', label: 'Integration', description: 'System connections' },
  { value: 'DEPENDENCY', label: 'Dependency', description: 'Required links' },
  { value: 'SHARED_RESOURCE', label: 'Shared', description: 'Common resources' },
];

// ============================================
// COLLAPSIBLE SECTION
// ============================================

function FilterSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: typeof Filter;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3',
          'text-sm font-medium text-slate-300 hover:text-white',
          'transition-colors'
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-violet-400" />
          <span>{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

// ============================================
// CHECKBOX PILL
// ============================================

function CheckboxPill({
  label,
  checked,
  onChange,
  color,
  icon: Icon,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
  icon?: typeof Server;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
        'border transition-all duration-200',
        checked
          ? 'bg-violet-500/20 border-violet-500/50 text-violet-200'
          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-300'
      )}
    >
      {color && (
        <span className={cn('w-2 h-2 rounded-full', color)} />
      )}
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </button>
  );
}

// ============================================
// MULTI-SELECT DROPDOWN
// ============================================

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  placeholder,
}: {
  label: string;
  options: { id: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const clearAll = () => onChange([]);

  return (
    <div className="relative">
      <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs',
          'bg-white/5 border border-white/10 text-slate-300',
          'hover:bg-white/10 hover:border-white/20',
          'transition-colors'
        )}
      >
        <span className={selected.length === 0 ? 'text-slate-500' : ''}>
          {selected.length === 0
            ? placeholder
            : `${selected.length} selected`}
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 py-1 rounded-lg bg-slate-800/95 border border-white/10 backdrop-blur-xl max-h-48 overflow-y-auto">
          {selected.length > 0 && (
            <button
              onClick={clearAll}
              className="w-full px-3 py-1.5 text-xs text-violet-400 hover:bg-white/10 text-left flex items-center gap-1.5"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => toggleOption(option.id)}
              className={cn(
                'w-full px-3 py-1.5 text-xs text-left flex items-center gap-2',
                'hover:bg-white/10 transition-colors',
                selected.includes(option.id) ? 'text-violet-300' : 'text-slate-300'
              )}
            >
              <div
                className={cn(
                  'w-3 h-3 rounded border transition-colors',
                  selected.includes(option.id)
                    ? 'bg-violet-500 border-violet-500'
                    : 'border-white/20'
                )}
              >
                {selected.includes(option.id) && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12">
                    <path
                      fill="currentColor"
                      d="M9.854 3.146a.5.5 0 010 .708l-4.5 4.5a.5.5 0 01-.708 0l-2-2a.5.5 0 01.708-.708L5 7.293l4.146-4.147a.5.5 0 01.708 0z"
                    />
                  </svg>
                )}
              </div>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

function FlowMapFiltersPanel({
  filters,
  onFiltersChange,
  projects,
  systemOptions,
  environmentOptions,
  isOpen,
  onToggle,
}: FlowMapFiltersProps) {
  const updateFilters = useCallback(
    (updates: Partial<FlowMapFilters>) => {
      onFiltersChange({ ...filters, ...updates });
    },
    [filters, onFiltersChange]
  );

  const toggleRiskLevel = useCallback(
    (level: RiskLevel) => {
      const current = filters.riskLevels;
      const updated = current.includes(level)
        ? current.filter((l) => l !== level)
        : [...current, level];
      updateFilters({ riskLevels: updated });
    },
    [filters.riskLevels, updateFilters]
  );

  const toggleNodeType = useCallback(
    (type: FlowNodeType) => {
      const current = filters.nodeTypes;
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      updateFilters({ nodeTypes: updated });
    },
    [filters.nodeTypes, updateFilters]
  );

  const toggleEdgeType = useCallback(
    (type: FlowEdgeType) => {
      const current = filters.edgeTypes;
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      updateFilters({ edgeTypes: updated });
    },
    [filters.edgeTypes, updateFilters]
  );

  const resetFilters = useCallback(() => {
    onFiltersChange({
      projects: [],
      systems: [],
      environments: [],
      riskLevels: [],
      minRiskScore: 0,
      dateRange: {
        start: new Date(),
        end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      showActiveOnly: false,
      showCollisionsOnly: false,
      showEmergentLinks: false,
      nodeTypes: ['PROJECT', 'ENVIRONMENT', 'SYSTEM', 'EXTERNAL'],
      edgeTypes: ['PROMOTION', 'INTEGRATION', 'DEPENDENCY', 'SHARED_RESOURCE'],
    });
  }, [onFiltersChange]);

  const activeFilterCount =
    filters.projects.length +
    filters.systems.length +
    filters.environments.length +
    (filters.riskLevels.length < 5 ? filters.riskLevels.length : 0) +
    (filters.showActiveOnly ? 1 : 0) +
    (filters.showCollisionsOnly ? 1 : 0) +
    (filters.showEmergentLinks ? 1 : 0);

  // Panel is now controlled by parent - just render content
  if (!isOpen) return null;

  return (
    <div
      className="w-full h-full"
      data-testid="flowmap-filter-panel"
    >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-violet-500/30 text-violet-300">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetFilters}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Reset filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onToggle}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Collapse"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="h-[calc(100%-56px)] overflow-y-auto premium-scrollbar">
          {/* Quick toggles */}
          <div className="px-4 py-3 border-b border-white/5 space-y-2">
            <button
              onClick={() => updateFilters({ showActiveOnly: !filters.showActiveOnly })}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs',
                'border transition-colors',
                filters.showActiveOnly
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              )}
            >
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Active Flows Only</span>
              </div>
              {filters.showActiveOnly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>

            <button
              onClick={() => updateFilters({ showCollisionsOnly: !filters.showCollisionsOnly })}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs',
                'border transition-colors',
                filters.showCollisionsOnly
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              )}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Collisions Only</span>
              </div>
              {filters.showCollisionsOnly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>

            <button
              onClick={() => updateFilters({ showEmergentLinks: !filters.showEmergentLinks })}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs',
                'border transition-colors',
                filters.showEmergentLinks
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              )}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Emergent Links</span>
              </div>
              {filters.showEmergentLinks ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>

          {/* Risk levels */}
          <FilterSection title="Risk Level" icon={AlertTriangle}>
            <div className="flex flex-wrap gap-2">
              {riskLevelOptions.map((option) => (
                <CheckboxPill
                  key={option.value}
                  label={option.label}
                  checked={filters.riskLevels.includes(option.value)}
                  onChange={() => toggleRiskLevel(option.value)}
                  color={option.color}
                />
              ))}
            </div>
          </FilterSection>

          {/* Node types */}
          <FilterSection title="Node Types" icon={Layers}>
            <div className="flex flex-wrap gap-2">
              {nodeTypeOptions.map((option) => (
                <CheckboxPill
                  key={option.value}
                  label={option.label}
                  checked={filters.nodeTypes.includes(option.value)}
                  onChange={() => toggleNodeType(option.value)}
                  icon={option.icon}
                />
              ))}
            </div>
          </FilterSection>

          {/* Edge types */}
          <FilterSection title="Flow Types" icon={Activity} defaultOpen={false}>
            <div className="space-y-2">
              {edgeTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleEdgeType(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs',
                    'border transition-colors',
                    filters.edgeTypes.includes(option.value)
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-200'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  )}
                >
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-[10px] text-slate-500">{option.description}</div>
                  </div>
                  <div
                    className={cn(
                      'w-4 h-4 rounded border transition-colors',
                      filters.edgeTypes.includes(option.value)
                        ? 'bg-violet-500 border-violet-500'
                        : 'border-white/20'
                    )}
                  />
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Entity selectors */}
          <FilterSection title="Entities" icon={Database} defaultOpen={false}>
            <MultiSelectDropdown
              label="Projects"
              options={projects.map((p) => ({ id: p.id, label: p.name }))}
              selected={filters.projects}
              onChange={(selected) => updateFilters({ projects: selected })}
              placeholder="All projects"
            />

            <MultiSelectDropdown
              label="Systems"
              options={systemOptions}
              selected={filters.systems}
              onChange={(selected) => updateFilters({ systems: selected })}
              placeholder="All systems"
            />

            <MultiSelectDropdown
              label="Environments"
              options={environmentOptions}
              selected={filters.environments}
              onChange={(selected) => updateFilters({ environments: selected })}
              placeholder="All environments"
            />
          </FilterSection>

          {/* Date range */}
          <FilterSection title="Time Window" icon={Calendar} defaultOpen={false}>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) =>
                    updateFilters({
                      dateRange: { ...filters.dateRange, start: new Date(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-slate-300 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) =>
                    updateFilters({
                      dateRange: { ...filters.dateRange, end: new Date(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-slate-300 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
          </FilterSection>
        </div>
    </div>
  );
}

export default memo(FlowMapFiltersPanel);
