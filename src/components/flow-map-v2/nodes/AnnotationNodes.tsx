'use client';

// Nexorium Core - Annotation Nodes (Title and Note)
// Simple text-based nodes for canvas annotations

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { Type, StickyNote, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export interface AnnotationData extends Record<string, unknown> {
  type: 'title' | 'note';
  text: string;
  onDelete?: () => void;
  onTextChange?: (text: string) => void;
}

export type AnnotationNode = Node<AnnotationData, 'annotation-title' | 'annotation-note'>;

// ============================================
// TITLE NODE
// ============================================

function TitleNodeComponent({ data, selected }: NodeProps<AnnotationNode>) {
  const annotationData = data as AnnotationData;
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(annotationData.text || 'New Title');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    annotationData.onTextChange?.(text);
  }, [annotationData, text]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      annotationData.onTextChange?.(text);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setText(annotationData.text);
    }
  }, [annotationData, text]);

  return (
    <div
      className={cn(
        'group relative px-4 py-2 rounded-lg cursor-move',
        'bg-slate-800/60 border border-white/10',
        'hover:border-violet-500/30 transition-all',
        selected && 'border-violet-500/50 ring-2 ring-violet-500/20'
      )}
      onDoubleClick={handleDoubleClick}
    >
      {/* Icon */}
      <Type className="absolute -left-1 -top-1 h-3 w-3 text-violet-400 opacity-50" />

      {/* Text or Input */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none text-white text-lg font-semibold w-full min-w-[100px]"
          style={{ fontFamily: 'system-ui, sans-serif' }}
        />
      ) : (
        <span className="text-white text-lg font-semibold whitespace-nowrap">
          {text}
        </span>
      )}

      {/* Delete button */}
      {selected && (
        <button
          onClick={() => annotationData.onDelete?.()}
          className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Drag handles hidden but functional */}
      <Handle type="source" position={Position.Right} className="!opacity-0" />
      <Handle type="target" position={Position.Left} className="!opacity-0" />
    </div>
  );
}

export const TitleNode = memo(TitleNodeComponent);

// ============================================
// NOTE NODE
// ============================================

function NoteNodeComponent({ data, selected }: NodeProps<AnnotationNode>) {
  const annotationData = data as AnnotationData;
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(annotationData.text || 'New Note');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    annotationData.onTextChange?.(text);
  }, [annotationData, text]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setText(annotationData.text);
    }
    // Allow Enter for new lines, Shift+Enter to save
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      annotationData.onTextChange?.(text);
    }
  }, [annotationData, text]);

  return (
    <div
      className={cn(
        'group relative p-3 rounded-lg cursor-move min-w-[150px] max-w-[300px]',
        'bg-amber-500/10 border border-amber-500/30',
        'hover:border-amber-500/50 transition-all',
        selected && 'border-amber-500/60 ring-2 ring-amber-500/20'
      )}
      onDoubleClick={handleDoubleClick}
    >
      {/* Icon */}
      <StickyNote className="absolute -left-1 -top-1 h-3 w-3 text-amber-400 opacity-50" />

      {/* Text or Textarea */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none text-amber-100 text-sm w-full min-h-[60px] resize-none"
          style={{ fontFamily: 'system-ui, sans-serif' }}
          placeholder="Enter note text..."
        />
      ) : (
        <p className="text-amber-100 text-sm whitespace-pre-wrap break-words">
          {text}
        </p>
      )}

      {/* Hint */}
      {isEditing && (
        <p className="text-[10px] text-amber-500/50 mt-2">
          Shift+Enter to save, Esc to cancel
        </p>
      )}

      {/* Delete button */}
      {selected && (
        <button
          onClick={() => annotationData.onDelete?.()}
          className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Drag handles hidden but functional */}
      <Handle type="source" position={Position.Right} className="!opacity-0" />
      <Handle type="target" position={Position.Left} className="!opacity-0" />
    </div>
  );
}

export const NoteNode = memo(NoteNodeComponent);
