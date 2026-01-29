'use client';

// Nexorium Core - Environment Table View
// Engineer-trust tabular view using TanStack Table

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ExternalLink,
  CircleDot,
} from 'lucide-react';
import type { Graph5LayerNode, Graph5LayerEdge, ArchitectureLayer, CapabilityType } from '@/types';

interface EnvironmentTableViewProps {
  nodes: Graph5LayerNode[];
  edges: Graph5LayerEdge[];
  onNodeClick?: (nodeId: string) => void;
}

// Flattened row type for table
interface ComponentRow {
  id: string;
  displayName: string;
  componentName: string;
  layer: ArchitectureLayer;
  capabilityType: CapabilityType;
  hostname: string | null;
  projectVersion: string | null;
  sourceSystem: string | null;
  isEntry: boolean;
  isExit: boolean;
  incomingCount: number;
  outgoingCount: number;
}

const LAYER_COLORS: Record<ArchitectureLayer, string> = {
  BSS: 'bg-blue-100 text-blue-700 border-blue-200',
  OSS: 'bg-amber-100 text-amber-700 border-amber-200',
  INFRA: 'bg-slate-100 text-slate-700 border-slate-200',
  EXTERNAL: 'bg-green-100 text-green-700 border-green-200',
  UNKNOWN: 'bg-gray-100 text-gray-600 border-gray-200',
};

const CAPABILITY_COLORS: Record<CapabilityType, string> = {
  CPQ: 'bg-indigo-50 text-indigo-700',
  CRM: 'bg-purple-50 text-purple-700',
  BILLING: 'bg-emerald-50 text-emerald-700',
  SOM: 'bg-orange-50 text-orange-700',
  INVENTORY: 'bg-cyan-50 text-cyan-700',
  ORCHESTRATOR: 'bg-rose-50 text-rose-700',
  DB: 'bg-yellow-50 text-yellow-700',
  MQ: 'bg-pink-50 text-pink-700',
  API_GW: 'bg-teal-50 text-teal-700',
  IDENTITY: 'bg-violet-50 text-violet-700',
  ITSM: 'bg-lime-50 text-lime-700',
  OTHER: 'bg-slate-50 text-slate-600',
  UNKNOWN: 'bg-gray-50 text-gray-500',
};

export default function EnvironmentTableView({
  nodes,
  edges,
  onNodeClick,
}: EnvironmentTableViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Transform nodes into flat rows
  const data = useMemo<ComponentRow[]>(() => {
    // Count connections per node
    const incomingCounts = new Map<string, number>();
    const outgoingCounts = new Map<string, number>();

    edges.forEach((edge) => {
      incomingCounts.set(edge.target, (incomingCounts.get(edge.target) || 0) + 1);
      outgoingCounts.set(edge.source, (outgoingCounts.get(edge.source) || 0) + 1);
    });

    return nodes.map((node) => ({
      id: node.id,
      displayName: node.data.label,
      componentName: node.data.componentName,
      layer: node.data.layer,
      capabilityType: node.data.capabilityType,
      hostname: node.data.hostname || null,
      projectVersion: node.data.projectVersion || null,
      sourceSystem: node.data.sourceSystem || null,
      isEntry: node.data.isEntry,
      isExit: node.data.isExit,
      incomingCount: incomingCounts.get(node.id) || 0,
      outgoingCount: outgoingCounts.get(node.id) || 0,
    }));
  }, [nodes, edges]);

  // Column definitions
  const columns = useMemo<ColumnDef<ComponentRow>[]>(
    () => [
      {
        accessorKey: 'displayName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <button
            onClick={() => onNodeClick?.(row.original.id)}
            className="flex items-center gap-2 font-medium text-slate-900 hover:text-indigo-600 transition-colors"
          >
            <span className="truncate max-w-[200px]">{row.original.displayName}</span>
            {row.original.isEntry && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] px-1 py-0">
                ENTRY
              </Badge>
            )}
            {row.original.isExit && (
              <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 text-[10px] px-1 py-0">
                EXIT
              </Badge>
            )}
          </button>
        ),
      },
      {
        accessorKey: 'componentName',
        header: 'Component',
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">{row.original.componentName}</span>
        ),
      },
      {
        accessorKey: 'layer',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Layer
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className={LAYER_COLORS[row.original.layer]}>
            {row.original.layer}
          </Badge>
        ),
        filterFn: 'equals',
      },
      {
        accessorKey: 'capabilityType',
        header: 'Capability',
        cell: ({ row }) => (
          <Badge variant="secondary" className={CAPABILITY_COLORS[row.original.capabilityType]}>
            {row.original.capabilityType}
          </Badge>
        ),
      },
      {
        accessorKey: 'hostname',
        header: 'Host',
        cell: ({ row }) => (
          <span className="text-sm text-slate-500 font-mono">
            {row.original.hostname || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'projectVersion',
        header: 'Version',
        cell: ({ row }) => (
          <span className="text-sm text-slate-600 font-mono">
            {row.original.projectVersion || '-'}
          </span>
        ),
      },
      {
        id: 'connections',
        header: 'Connections',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500" title="Incoming">
              <CircleDot className="inline h-3 w-3 mr-0.5" />
              {row.original.incomingCount}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500" title="Outgoing">
              {row.original.outgoingCount}
              <ExternalLink className="inline h-3 w-3 ml-0.5" />
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'sourceSystem',
        header: 'Source',
        cell: ({ row }) => (
          <span className="text-xs text-slate-400 uppercase">
            {row.original.sourceSystem || 'manual'}
          </span>
        ),
      },
    ],
    [onNodeClick]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search components..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {table.getFilteredRowModel().rows.length} of {data.length} components
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No components found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="border-t bg-slate-50 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
