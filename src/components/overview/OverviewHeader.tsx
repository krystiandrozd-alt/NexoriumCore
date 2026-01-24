'use client';

// TelEnvIQ - Overview Header Component
// Top bar with title, filters, and quick actions

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Camera,
  Download,
  ChevronDown,
  FileImage,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalFilters } from './GlobalFilters';
import type { OverviewFilters, FilterOption } from '@/types/overview';

interface OverviewHeaderProps {
  filters: OverviewFilters;
  onFiltersChange: (filters: OverviewFilters) => void;
  projectOptions?: FilterOption[];
  environmentOptions?: FilterOption[];
  onCreateSnapshot?: () => void;
}

// Export dropdown
function ExportDropdown() {
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

  const handleExport = (format: 'pdf' | 'png') => {
    // Mock implementation - would trigger actual export
    console.log(`Exporting as ${format}...`);
    setIsOpen(false);
    // TODO: Implement actual export functionality
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'bg-white/5 border-white/10 text-white/80',
          'hover:bg-white/10 hover:text-white',
          isOpen && 'ring-2 ring-violet-500/50'
        )}
      >
        <Download className="h-4 w-4 mr-2" />
        Export
        <ChevronDown
          className={cn(
            'h-4 w-4 ml-1 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 z-50 mt-1 w-40',
            'bg-slate-900/95 backdrop-blur-lg',
            'border border-white/10 rounded-lg shadow-xl overflow-hidden'
          )}
        >
          <button
            onClick={() => handleExport('pdf')}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 text-sm text-left',
              'text-white/90 hover:bg-white/10 transition-colors'
            )}
          >
            <FileText className="h-4 w-4 text-slate-400" />
            Export as PDF
          </button>
          <button
            onClick={() => handleExport('png')}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 text-sm text-left',
              'text-white/90 hover:bg-white/10 transition-colors'
            )}
          >
            <FileImage className="h-4 w-4 text-slate-400" />
            Export as PNG
          </button>
        </div>
      )}
    </div>
  );
}

export function OverviewHeader({
  filters,
  onFiltersChange,
  projectOptions,
  environmentOptions,
  onCreateSnapshot,
}: OverviewHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              'bg-gradient-to-br from-violet-500 to-blue-500'
            )}
          >
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Overview</h1>
            <p className="text-sm text-slate-400">
              Environment intelligence at a glance
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={onCreateSnapshot}
            className={cn(
              'bg-gradient-to-r from-violet-500 to-blue-500',
              'hover:from-violet-600 hover:to-blue-600',
              'text-white shadow-lg shadow-violet-500/25'
            )}
          >
            <Camera className="h-4 w-4 mr-2" />
            Create Snapshot
          </Button>
          <ExportDropdown />
        </div>
      </div>

      {/* Filters row */}
      <GlobalFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        projectOptions={projectOptions}
        environmentOptions={environmentOptions}
      />
    </div>
  );
}
