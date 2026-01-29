'use client';

// Nexorium Core - Flow Map V2 Sidebar (L0 Pipeline View)
// Project selector with environment list and annotation tools

import { memo, useState } from 'react';
import {
  ChevronLeft,
  FolderKanban,
  Type,
  StickyNote,
  ChevronDown,
  Check,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useSWR from 'swr';

interface FlowMapV2SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onAddAnnotation?: (type: 'title' | 'note') => void;
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  environmentCount: number;
}

interface Environment {
  id: string;
  name: string;
  type: string;
  stageKey?: string;
  stageName?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Annotation shape palette items
const annotationShapes = [
  {
    type: 'title' as const,
    name: 'Title',
    icon: Type,
    description: 'Add a heading label',
  },
  {
    type: 'note' as const,
    name: 'Note',
    icon: StickyNote,
    description: 'Add a sticky note',
  },
];

function FlowMapV2Sidebar({
  isOpen,
  onToggle,
  onAddAnnotation,
  selectedProjectId,
  onProjectChange,
}: FlowMapV2SidebarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch projects (simulated for now - would come from API)
  // In production, this would be: useSWR('/api/projects', fetcher)
  const projects: Project[] = [
    { id: 'all', name: 'All Environments', description: 'View all environments', environmentCount: 0 },
    { id: 'project-a', name: 'Project Alpha', description: 'Core BSS transformation', environmentCount: 5 },
    { id: 'project-b', name: 'Project Beta', description: 'OSS modernization', environmentCount: 3 },
    { id: 'project-c', name: 'Project Gamma', description: 'Network integration', environmentCount: 4 },
  ];

  // Fetch environments for selected project
  const { data: envData } = useSWR<{ success: boolean; data: Environment[] }>(
    '/api/environments',
    fetcher,
    { revalidateOnFocus: false }
  );

  const environments = envData?.data || [];

  // Filter environments by project (simulated - in production would filter by project ID)
  const filteredEnvironments = selectedProjectId === 'all' || !selectedProjectId
    ? environments
    : environments.filter((_, index) => {
        // Simulated filtering based on project
        if (selectedProjectId === 'project-a') return index < 5;
        if (selectedProjectId === 'project-b') return index >= 2 && index < 5;
        if (selectedProjectId === 'project-c') return index >= 1 && index < 5;
        return true;
      });

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  if (!isOpen) {
    return null;
  }

  const handleDragStart = (e: React.DragEvent, type: 'title' | 'note') => {
    e.dataTransfer.setData('application/annotation-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <FolderKanban className="h-4 w-4 text-violet-400" />
          Pipeline View
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Project Selector */}
      <div className="p-4 border-b border-white/5">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Project
        </label>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg',
              'bg-slate-800/80 border border-white/10',
              'text-sm text-white font-medium',
              'hover:bg-slate-800 hover:border-white/20 transition-colors',
              dropdownOpen && 'border-violet-500/50 bg-slate-800'
            )}
          >
            <span className="truncate">{selectedProject?.name || 'Select Project'}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-slate-400 transition-transform',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    onProjectChange(project.id);
                    setDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                    selectedProjectId === project.id
                      ? 'bg-violet-500/20 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{project.name}</div>
                    {project.description && (
                      <div className="text-[10px] text-slate-500 truncate">{project.description}</div>
                    )}
                  </div>
                  {selectedProjectId === project.id && (
                    <Check className="h-4 w-4 text-violet-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Environments List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Environments
          </label>
          <span className="text-[10px] text-slate-500">
            {filteredEnvironments.length} total
          </span>
        </div>

        <div className="space-y-1">
          {filteredEnvironments.length === 0 ? (
            <div className="text-center py-6">
              <Layers className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No environments</p>
            </div>
          ) : (
            filteredEnvironments.map((env) => (
              <div
                key={env.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/5"
              >
                <div
                  className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    env.type === 'DEV' && 'bg-green-500',
                    env.type === 'SIT' && 'bg-blue-500',
                    env.type === 'UAT' && 'bg-purple-500',
                    env.type === 'NFT' && 'bg-orange-500',
                    env.type === 'PREPROD' && 'bg-yellow-500',
                    env.type === 'PROD_RO' && 'bg-red-500',
                    !env.type && 'bg-slate-500'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{env.name}</div>
                  <div className="text-[10px] text-slate-500">{env.stageName || env.type}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Annotation Shapes */}
      <div className="border-t border-white/5 p-4">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Add to Canvas
        </label>
        <div className="grid grid-cols-2 gap-2">
          {annotationShapes.map((shape) => (
            <div
              key={shape.type}
              draggable
              onDragStart={(e) => handleDragStart(e, shape.type)}
              onClick={() => onAddAnnotation?.(shape.type)}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-lg cursor-grab',
                'bg-slate-800/60 border border-white/5',
                'hover:bg-slate-800 hover:border-violet-500/30 transition-all',
                'active:cursor-grabbing'
              )}
            >
              <shape.icon className="h-5 w-5 text-violet-400" />
              <span className="text-xs text-slate-300">{shape.name}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-600 mt-2 text-center">
          Drag to canvas or click to add
        </p>
      </div>
    </div>
  );
}

export default memo(FlowMapV2Sidebar);
