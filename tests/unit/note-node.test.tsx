// Nexorium Core - NoteNode Component Unit Tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import NoteNode from '@/components/graph/NoteNode';
import type { NoteNodeData } from '@/components/graph/NoteNode';

// Mock React Flow hooks
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    useReactFlow: () => ({
      setNodes: vi.fn(),
      deleteElements: vi.fn(),
    }),
  };
});

// ============================================
// HELPER FUNCTIONS
// ============================================

const defaultData: NoteNodeData = {
  content: 'Test note content',
  color: 'yellow',
  width: 200,
  height: 120,
};

function renderNoteNode(data: Partial<NoteNodeData> = {}, selected = false) {
  const mergedData = { ...defaultData, ...data };
  return render(
    <ReactFlowProvider>
      <NoteNode
        id="test-note-1"
        data={mergedData}
        selected={selected}
        type="note"
        isConnectable={true}
        positionAbsoluteX={0}
        positionAbsoluteY={0}
        zIndex={0}
      />
    </ReactFlowProvider>
  );
}

// ============================================
// RENDERING TESTS
// ============================================

describe('NoteNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render note content', () => {
      renderNoteNode({ content: 'Hello World' });
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should show placeholder when content is empty', () => {
      renderNoteNode({ content: '' });
      expect(screen.getByText('Double-click to edit...')).toBeInTheDocument();
    });

    it('should render with yellow color by default', () => {
      const { container } = renderNoteNode({ color: 'yellow' });
      const node = container.querySelector('.bg-yellow-100');
      expect(node).toBeInTheDocument();
    });

    it('should render with blue color', () => {
      const { container } = renderNoteNode({ color: 'blue' });
      const node = container.querySelector('.bg-blue-100');
      expect(node).toBeInTheDocument();
    });

    it('should render with green color', () => {
      const { container } = renderNoteNode({ color: 'green' });
      const node = container.querySelector('.bg-green-100');
      expect(node).toBeInTheDocument();
    });

    it('should render with pink color', () => {
      const { container } = renderNoteNode({ color: 'pink' });
      const node = container.querySelector('.bg-pink-100');
      expect(node).toBeInTheDocument();
    });

    it('should render with purple color', () => {
      const { container } = renderNoteNode({ color: 'purple' });
      const node = container.querySelector('.bg-purple-100');
      expect(node).toBeInTheDocument();
    });

    it('should apply custom width', () => {
      const { container } = renderNoteNode({ width: 300 });
      const node = container.firstChild as HTMLElement;
      expect(node.style.width).toBe('300px');
    });

    it('should apply custom height', () => {
      const { container } = renderNoteNode({ height: 200 });
      const node = container.firstChild as HTMLElement;
      expect(node.style.minHeight).toBe('200px');
    });

    it('should show selection ring when selected', () => {
      const { container } = renderNoteNode({}, true);
      const node = container.querySelector('.ring-2');
      expect(node).toBeInTheDocument();
    });
  });

  describe('editing', () => {
    it('should enter edit mode on double-click', () => {
      renderNoteNode({ content: 'Original content' });

      const node = screen.getByText('Original content');
      fireEvent.doubleClick(node.closest('div')!);

      // After double-click, a textarea should appear
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue('Original content');
    });

    it('should show textarea with content when editing', () => {
      renderNoteNode({ content: 'Edit me' });

      const node = screen.getByText('Edit me');
      fireEvent.doubleClick(node.closest('div')!);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Edit me');
    });

    it('should show placeholder in textarea when content is empty', () => {
      renderNoteNode({ content: '' });

      const placeholder = screen.getByText('Double-click to edit...');
      fireEvent.doubleClick(placeholder.closest('div')!);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder', 'Add a note...');
    });
  });

  describe('toolbar', () => {
    it('should show toolbar when selected', () => {
      const { container } = renderNoteNode({}, true);

      // Find the toolbar (the one with opacity-100)
      const toolbar = container.querySelector('.opacity-100');
      expect(toolbar).toBeInTheDocument();
    });

    it('should have delete button in toolbar', () => {
      const { container } = renderNoteNode({}, true);

      // Look for trash icon button
      const deleteButton = container.querySelector('[title="Delete note"]');
      expect(deleteButton).toBeInTheDocument();
    });

    it('should have color change button in toolbar', () => {
      const { container } = renderNoteNode({}, true);

      // Look for color change button
      const colorButton = container.querySelector('[title="Change color"]');
      expect(colorButton).toBeInTheDocument();
    });
  });

  describe('content display', () => {
    it('should preserve whitespace in content', () => {
      const { container } = renderNoteNode({ content: 'Line 1\nLine 2' });
      const contentDiv = container.querySelector('.whitespace-pre-wrap');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should break words properly', () => {
      const { container } = renderNoteNode({ content: 'VeryLongWordThatShouldBreak' });
      const contentDiv = container.querySelector('.break-words');
      expect(contentDiv).toBeInTheDocument();
    });
  });
});

// ============================================
// TYPE TESTS
// ============================================

describe('NoteNodeData type', () => {
  it('should accept all valid colors', () => {
    const colors: NoteNodeData['color'][] = ['yellow', 'blue', 'green', 'pink', 'purple'];

    colors.forEach(color => {
      const data: NoteNodeData = {
        content: 'test',
        color,
      };
      expect(data.color).toBe(color);
    });
  });

  it('should have optional width and height', () => {
    const data: NoteNodeData = {
      content: 'test',
      color: 'yellow',
      // width and height are optional
    };
    expect(data.width).toBeUndefined();
    expect(data.height).toBeUndefined();
  });
});
