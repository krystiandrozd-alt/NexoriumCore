'use client';

// TelEnvIQ - Note Node Component for React Flow
// Editable sticky note nodes for diagram annotations

import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NoteNodeData {
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple';
  width?: number;
  height?: number;
}

const colorClasses: Record<NoteNodeData['color'], { bg: string; border: string; shadow: string }> = {
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-300', shadow: 'shadow-yellow-200/50' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-300', shadow: 'shadow-blue-200/50' },
  green: { bg: 'bg-green-100', border: 'border-green-300', shadow: 'shadow-green-200/50' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-300', shadow: 'shadow-pink-200/50' },
  purple: { bg: 'bg-purple-100', border: 'border-purple-300', shadow: 'shadow-purple-200/50' },
};

function NoteNode({ id, data, selected }: NodeProps & { data: NoteNodeData }) {
  const { setNodes, deleteElements } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colors = colorClasses[data.color] || colorClasses.yellow;

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Handle double-click to edit
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Handle blur to save
  const handleBlur = useCallback(() => {
    setIsEditing(false);
    // Update node data with new content
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, content },
          };
        }
        return node;
      })
    );
  }, [id, content, setNodes]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setContent(data.content || ''); // Revert changes
    }
    // Allow Enter for new lines (Shift+Enter or just Enter)
    // Ctrl/Cmd+Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleBlur();
    }
  }, [data.content, handleBlur]);

  // Handle delete
  const handleDelete = useCallback(() => {
    deleteElements({ nodes: [{ id }] });
  }, [id, deleteElements]);

  // Cycle through colors
  const handleColorChange = useCallback(() => {
    const colorOrder: NoteNodeData['color'][] = ['yellow', 'blue', 'green', 'pink', 'purple'];
    const currentIndex = colorOrder.indexOf(data.color);
    const nextColor = colorOrder[(currentIndex + 1) % colorOrder.length];

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, color: nextColor },
          };
        }
        return node;
      })
    );
  }, [id, data.color, setNodes]);

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 shadow-md transition-all cursor-move',
        colors.bg,
        colors.border,
        colors.shadow,
        selected && 'ring-2 ring-indigo-500 ring-offset-2',
        'min-w-[120px] min-h-[80px]'
      )}
      style={{
        width: data.width || 200,
        minHeight: data.height || 100,
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Invisible handles for potential connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !w-full !h-2 !top-0 !transform-none !rounded-none !border-none !bg-transparent"
      />

      {/* Toolbar - visible on hover/select */}
      <div
        className={cn(
          'absolute -top-8 left-0 right-0 flex items-center justify-between px-1 py-0.5',
          'bg-white rounded-md border border-slate-200 shadow-sm',
          'opacity-0 transition-opacity',
          (selected || isEditing) && 'opacity-100'
        )}
      >
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleColorChange}
            className="p-1 rounded hover:bg-slate-100 transition-colors"
            title="Change color"
          >
            <div className={cn('w-3.5 h-3.5 rounded-full border border-slate-300', colors.bg)} />
          </button>
        </div>
        <button
          onClick={handleDelete}
          className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors"
          title="Delete note"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Drag handle indicator */}
      <div className="absolute top-1 left-1 text-slate-400/50">
        <GripVertical className="h-3 w-3" />
      </div>

      {/* Content area */}
      <div className="p-3 pt-4">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full min-h-[60px] resize-none',
              'bg-transparent border-none outline-none',
              'text-sm text-slate-700 placeholder-slate-400',
              'focus:ring-0'
            )}
            placeholder="Add a note..."
            style={{ height: Math.max(60, (data.height || 100) - 40) }}
          />
        ) : (
          <div
            className={cn(
              'text-sm text-slate-700 whitespace-pre-wrap break-words',
              !content && 'text-slate-400 italic'
            )}
            style={{ minHeight: 60 }}
          >
            {content || 'Double-click to edit...'}
          </div>
        )}
      </div>

      {/* Resize hint */}
      <div className="absolute bottom-1 right-1 text-slate-400/30 text-[8px]">
        note
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !w-full !h-2 !bottom-0 !transform-none !rounded-none !border-none !bg-transparent"
      />
    </div>
  );
}

export default memo(NoteNode);
