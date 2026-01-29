'use client';

// Nexorium Core - Search Palette (Cmd+K)
// Quick search and navigation for nodes

import { memo, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  X,
  Server,
  Database,
  Globe,
  MessageSquare,
  Scale,
  Cloud,
  HardDrive,
  ExternalLink,
  StickyNote,
  Building2,
  type LucideIcon,
  ArrowRight,
  Focus,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ManualNodeType } from '@/types/flow-map-manual';

// ============================================
// TYPES
// ============================================

export interface SearchableNode {
  id: string;
  name: string;
  type: 'environment' | 'manual';
  nodeType?: ManualNodeType;
  description?: string;
  hostname?: string;
  stage?: string;
  domain?: string;
  lane?: string;
}

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: SearchableNode[];
  onSelect: (nodeId: string) => void;
  onFocus: (nodeId: string) => void;
  onShowConnections: (nodeId: string, hops: 1 | 2) => void;
}

// ============================================
// ICONS
// ============================================

const nodeTypeIcons: Record<ManualNodeType, LucideIcon> = {
  SERVER: Server,
  DATABASE: Database,
  API_SERVICE: Globe,
  QUEUE_EVENT_BUS: MessageSquare,
  LOAD_BALANCER: Scale,
  CLOUD: Cloud,
  STORAGE: HardDrive,
  EXTERNAL_SYSTEM: ExternalLink,
  NOTE: StickyNote,
};

// ============================================
// COMPONENT
// ============================================

function SearchPalette({
  isOpen,
  onClose,
  nodes,
  onSelect,
  onFocus,
  onShowConnections,
}: SearchPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showActions, setShowActions] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter nodes based on query
  const filteredNodes = useMemo(() => {
    if (!query.trim()) return nodes.slice(0, 20);

    const lowerQuery = query.toLowerCase();
    return nodes.filter((node) => {
      return (
        node.name.toLowerCase().includes(lowerQuery) ||
        node.description?.toLowerCase().includes(lowerQuery) ||
        node.hostname?.toLowerCase().includes(lowerQuery) ||
        node.stage?.toLowerCase().includes(lowerQuery) ||
        node.domain?.toLowerCase().includes(lowerQuery)
      );
    }).slice(0, 20);
  }, [nodes, query]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
    setShowActions(null);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredNodes.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredNodes[selectedIndex]) {
            if (showActions) {
              // If actions menu is open, close it
              setShowActions(null);
            } else {
              onFocus(filteredNodes[selectedIndex].id);
              onClose();
            }
          }
          break;
        case 'Tab':
          e.preventDefault();
          if (filteredNodes[selectedIndex]) {
            setShowActions(
              showActions === filteredNodes[selectedIndex].id
                ? null
                : filteredNodes[selectedIndex].id
            );
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (showActions) {
            setShowActions(null);
          } else {
            onClose();
          }
          break;
      }
    },
    [filteredNodes, selectedIndex, showActions, onFocus, onClose]
  );

  // Scroll selected item into view
  useEffect(() => {
    const selectedItem = listRef.current?.children[selectedIndex];
    selectedItem?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  const palette = (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search nodes by name, hostname, or description..."
            className="flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none text-sm"
          />
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-800 rounded border border-white/10">
              ESC
            </kbd>
            <span className="text-[10px] text-slate-500">to close</span>
          </div>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
          {filteredNodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <Search className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No results found</p>
              <p className="text-[11px] mt-1">Try a different search term</p>
            </div>
          ) : (
            filteredNodes.map((node, index) => {
              const Icon = node.type === 'environment'
                ? Building2
                : (node.nodeType ? nodeTypeIcons[node.nodeType] : Server);

              const isSelected = index === selectedIndex;
              const isShowingActions = showActions === node.id;

              return (
                <div key={node.id} className="relative">
                  <button
                    onClick={() => {
                      onFocus(node.id);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                      isSelected
                        ? 'bg-violet-500/20 text-white'
                        : 'text-slate-300 hover:bg-white/5'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0',
                        node.type === 'environment' ? 'bg-violet-500/20' : 'bg-slate-700'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{node.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        {node.stage && (
                          <span className="px-1 py-0.5 rounded bg-slate-800">{node.stage}</span>
                        )}
                        {node.domain && (
                          <span className="px-1 py-0.5 rounded bg-slate-800">{node.domain}</span>
                        )}
                        {node.hostname && (
                          <span className="truncate">{node.hostname}</span>
                        )}
                        {node.description && !node.hostname && (
                          <span className="truncate">{node.description}</span>
                        )}
                      </div>
                    </div>

                    {/* Action hints */}
                    {isSelected && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-white/10">
                            Tab
                          </kbd>
                          more
                        </span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    )}
                  </button>

                  {/* Actions dropdown */}
                  {isShowingActions && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-10 p-1">
                      <button
                        onClick={() => {
                          onSelect(node.id);
                          onClose();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md"
                      >
                        <Focus className="h-4 w-4" />
                        Select Node
                      </button>
                      <button
                        onClick={() => {
                          onFocus(node.id);
                          onClose();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md"
                      >
                        <Focus className="h-4 w-4" />
                        Focus & Center
                      </button>
                      <button
                        onClick={() => {
                          onShowConnections(node.id, 1);
                          onClose();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md"
                      >
                        <Link2 className="h-4 w-4" />
                        Show 1-hop Connections
                      </button>
                      <button
                        onClick={() => {
                          onShowConnections(node.id, 2);
                          onClose();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md"
                      >
                        <Link2 className="h-4 w-4" />
                        Show 2-hop Connections
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-[10px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-white/10">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-white/10">Enter</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-white/10">Tab</kbd>
              actions
            </span>
          </div>
          <div>
            {filteredNodes.length} / {nodes.length} nodes
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(palette, document.body);
}

export default memo(SearchPalette);
