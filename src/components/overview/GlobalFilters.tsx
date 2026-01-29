'use client';

// Nexorium Core - Global Filters Component
// Filter controls for overview dashboard

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, X } from 'lucide-react';
import type { OverviewFilters, FilterOption } from '@/types/overview';

interface GlobalFiltersProps {
  filters: OverviewFilters;
  onFiltersChange: (filters: OverviewFilters) => void;
  projectOptions?: FilterOption[];
  environmentOptions?: FilterOption[];
}

// Time window options
const timeWindowOptions: { value: 7 | 30 | 90; label: string }[] = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
];

// Multi-select dropdown component
function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  placeholder,
}: {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const displayText =
    selected.length === 0
      ? placeholder
      : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label || selected[0]
      : `${selected.length} selected`;

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs text-slate-400 mb-1 font-medium">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between gap-2 w-full min-w-[140px]',
          'px-3 py-2 rounded-lg text-sm',
          'bg-white/5 border border-white/10',
          'text-white/90 hover:bg-white/10',
          'transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
          isOpen && 'ring-2 ring-violet-500/50'
        )}
      >
        <span className={cn(selected.length === 0 && 'text-slate-400')}>
          {displayText}
        </span>
        <div className="flex items-center gap-1">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="p-0.5 rounded hover:bg-white/10"
            >
              <X className="h-3 w-3 text-slate-400" />
            </button>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-slate-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full min-w-[200px]',
            'bg-slate-900/95 backdrop-blur-lg',
            'border border-white/10 rounded-lg shadow-xl',
            'max-h-60 overflow-y-auto premium-scrollbar'
          )}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400">
              No options available
            </div>
          ) : (
            options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 text-sm text-left',
                    'hover:bg-white/10 transition-colors',
                    isSelected && 'bg-violet-500/20'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center',
                      isSelected
                        ? 'bg-violet-500 border-violet-500'
                        : 'border-white/20'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className="flex-1 text-white/90">{option.label}</span>
                  {typeof option.count === 'number' && (
                    <span className="text-xs text-slate-400">
                      {option.count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// Time window toggle
function TimeWindowToggle({
  value,
  onChange,
}: {
  value: 7 | 30 | 90;
  onChange: (value: 7 | 30 | 90) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1 font-medium">
        Time Window
      </label>
      <div className="inline-flex rounded-lg bg-white/5 border border-white/10 p-0.5">
        {timeWindowOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              value === option.value
                ? 'bg-violet-500/30 text-violet-300'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Risk threshold slider
function RiskThresholdSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1 font-medium">
        Risk Threshold
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          step={25}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={cn(
            'w-24 h-1.5 rounded-full appearance-none cursor-pointer',
            'bg-white/10',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-3',
            '[&::-webkit-slider-thumb]:h-3',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-violet-500',
            '[&::-webkit-slider-thumb]:border-2',
            '[&::-webkit-slider-thumb]:border-white/20',
            '[&::-webkit-slider-thumb]:shadow-md'
          )}
        />
        <span className="text-xs text-slate-400 w-8">
          {value === 0 ? 'All' : `${value}+`}
        </span>
      </div>
    </div>
  );
}

export function GlobalFilters({
  filters,
  onFiltersChange,
  projectOptions = [],
  environmentOptions = [],
}: GlobalFiltersProps) {
  const handleProjectsChange = (projectIds: string[]) => {
    onFiltersChange({ ...filters, projectIds });
  };

  const handleEnvironmentsChange = (environmentIds: string[]) => {
    onFiltersChange({ ...filters, environmentIds });
  };

  const handleTimeWindowChange = (timeWindowDays: 7 | 30 | 90) => {
    onFiltersChange({ ...filters, timeWindowDays });
  };

  const handleRiskThresholdChange = (riskThreshold: number) => {
    onFiltersChange({ ...filters, riskThreshold });
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <MultiSelectDropdown
        label="Projects"
        options={projectOptions}
        selected={filters.projectIds || []}
        onChange={handleProjectsChange}
        placeholder="All projects"
      />

      <MultiSelectDropdown
        label="Environments"
        options={environmentOptions}
        selected={filters.environmentIds || []}
        onChange={handleEnvironmentsChange}
        placeholder="All environments"
      />

      <TimeWindowToggle
        value={filters.timeWindowDays}
        onChange={handleTimeWindowChange}
      />

      <RiskThresholdSlider
        value={filters.riskThreshold}
        onChange={handleRiskThresholdChange}
      />
    </div>
  );
}
