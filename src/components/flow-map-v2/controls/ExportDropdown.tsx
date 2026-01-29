'use client';

// Nexorium Core - Export Dropdown
// Export flow map as PNG, SVG, or JSON

import { memo, useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileJson, FileImage, FileCode2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExportFormat } from '@/lib/flow-map/export-utils';

interface ExportDropdownProps {
  onExport: (format: ExportFormat) => Promise<void>;
  className?: string;
}

const exportOptions: { format: ExportFormat; label: string; description: string; icon: typeof FileJson }[] = [
  { format: 'png', label: 'PNG Image', description: 'Best for sharing', icon: FileImage },
  { format: 'svg', label: 'SVG Vector', description: 'Scalable, editable', icon: FileCode2 },
  { format: 'json', label: 'JSON Data', description: 'Topology model', icon: FileJson },
];

function ExportDropdown({ onExport, className }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    try {
      await onExport(format);
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all',
          isOpen
            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
            : 'text-slate-400 hover:text-white hover:bg-white/10'
        )}
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-52 rounded-lg bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
          <div className="p-1">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Export Format
            </div>
            {exportOptions.map(({ format, label, description, icon: Icon }) => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                disabled={exporting !== null}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors',
                  exporting === format
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'text-slate-300 hover:text-white hover:bg-white/10',
                  exporting !== null && exporting !== format && 'opacity-50 cursor-not-allowed'
                )}
              >
                {exporting === format ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-[10px] text-slate-500">{description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ExportDropdown);
