'use client';

// Nexorium Core - Manual Design Context
// State management for Flow Map Manual Design Mode

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type {
  ManualFlowMapNode,
  ManualFlowMapEdge,
  FlowMapMode,
  ManualDesignState,
  HistoryAction,
  CreateManualNodeInput,
  UpdateManualNodeInput,
  CreateManualEdgeInput,
  UpdateManualEdgeInput,
} from '@/types/flow-map-manual';
import { initialManualDesignState } from '@/types/flow-map-manual';

// ============================================
// ACTION TYPES
// ============================================

type ManualDesignAction =
  | { type: 'SET_MODE'; payload: FlowMapMode }
  | { type: 'SET_NODES'; payload: ManualFlowMapNode[] }
  | { type: 'SET_EDGES'; payload: ManualFlowMapEdge[] }
  | { type: 'ADD_NODE'; payload: ManualFlowMapNode }
  | { type: 'UPDATE_NODE'; payload: ManualFlowMapNode }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'ADD_EDGE'; payload: ManualFlowMapEdge }
  | { type: 'UPDATE_EDGE'; payload: ManualFlowMapEdge }
  | { type: 'DELETE_EDGE'; payload: string }
  | { type: 'SELECT_NODE'; payload: string | null }
  | { type: 'SELECT_EDGE'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_SNAP_TO_GRID' }
  | { type: 'SET_GRID_SIZE'; payload: number }
  | { type: 'PUSH_HISTORY'; payload: HistoryAction }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_HISTORY' };

// ============================================
// REDUCER
// ============================================

function manualDesignReducer(
  state: ManualDesignState,
  action: ManualDesignAction
): ManualDesignState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };

    case 'SET_NODES':
      return { ...state, nodes: action.payload };

    case 'SET_EDGES':
      return { ...state, edges: action.payload };

    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.payload] };

    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: state.nodes.map((n) =>
          n.id === action.payload.id ? action.payload : n
        ),
      };

    case 'DELETE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter((n) => n.id !== action.payload),
        edges: state.edges.filter(
          (e) => e.sourceNodeId !== action.payload && e.targetNodeId !== action.payload
        ),
        selectedNodeId: state.selectedNodeId === action.payload ? null : state.selectedNodeId,
      };

    case 'ADD_EDGE':
      return { ...state, edges: [...state.edges, action.payload] };

    case 'UPDATE_EDGE':
      return {
        ...state,
        edges: state.edges.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case 'DELETE_EDGE':
      return {
        ...state,
        edges: state.edges.filter((e) => e.id !== action.payload),
        selectedEdgeId: state.selectedEdgeId === action.payload ? null : state.selectedEdgeId,
      };

    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.payload, selectedEdgeId: null };

    case 'SELECT_EDGE':
      return { ...state, selectedEdgeId: action.payload, selectedNodeId: null };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'TOGGLE_SNAP_TO_GRID':
      return { ...state, snapToGrid: !state.snapToGrid };

    case 'SET_GRID_SIZE':
      return { ...state, gridSize: action.payload };

    case 'PUSH_HISTORY': {
      const maxSize = 50; // MAX_HISTORY_SIZE
      const newUndoStack = [...state.history.undoStack, action.payload].slice(-maxSize);
      return {
        ...state,
        history: {
          undoStack: newUndoStack,
          redoStack: [], // Clear redo stack on new action
        },
      };
    }

    case 'UNDO': {
      if (state.history.undoStack.length === 0) return state;
      const lastAction = state.history.undoStack[state.history.undoStack.length - 1];
      const newUndoStack = state.history.undoStack.slice(0, -1);
      const newRedoStack = [...state.history.redoStack, lastAction];

      // Apply the reverse of the action
      const newState = { ...state };
      switch (lastAction.type) {
        case 'create_node':
          newState.nodes = newState.nodes.filter((n) => n.id !== lastAction.data.id);
          break;
        case 'update_node':
          if (lastAction.previousData) {
            newState.nodes = newState.nodes.map((n) =>
              n.id === lastAction.data.id ? (lastAction.previousData as ManualFlowMapNode) : n
            );
          }
          break;
        case 'delete_node':
          newState.nodes = [...newState.nodes, lastAction.data as ManualFlowMapNode];
          break;
        case 'create_edge':
          newState.edges = newState.edges.filter((e) => e.id !== lastAction.data.id);
          break;
        case 'update_edge':
          if (lastAction.previousData) {
            newState.edges = newState.edges.map((e) =>
              e.id === lastAction.data.id ? (lastAction.previousData as ManualFlowMapEdge) : e
            );
          }
          break;
        case 'delete_edge':
          newState.edges = [...newState.edges, lastAction.data as ManualFlowMapEdge];
          break;
      }

      return {
        ...newState,
        history: { undoStack: newUndoStack, redoStack: newRedoStack },
      };
    }

    case 'REDO': {
      if (state.history.redoStack.length === 0) return state;
      const lastAction = state.history.redoStack[state.history.redoStack.length - 1];
      const newRedoStack = state.history.redoStack.slice(0, -1);
      const newUndoStack = [...state.history.undoStack, lastAction];

      // Re-apply the action
      const newState = { ...state };
      switch (lastAction.type) {
        case 'create_node':
          newState.nodes = [...newState.nodes, lastAction.data as ManualFlowMapNode];
          break;
        case 'update_node':
          newState.nodes = newState.nodes.map((n) =>
            n.id === lastAction.data.id ? (lastAction.data as ManualFlowMapNode) : n
          );
          break;
        case 'delete_node':
          newState.nodes = newState.nodes.filter((n) => n.id !== lastAction.data.id);
          break;
        case 'create_edge':
          newState.edges = [...newState.edges, lastAction.data as ManualFlowMapEdge];
          break;
        case 'update_edge':
          newState.edges = newState.edges.map((e) =>
            e.id === lastAction.data.id ? (lastAction.data as ManualFlowMapEdge) : e
          );
          break;
        case 'delete_edge':
          newState.edges = newState.edges.filter((e) => e.id !== lastAction.data.id);
          break;
      }

      return {
        ...newState,
        history: { undoStack: newUndoStack, redoStack: newRedoStack },
      };
    }

    case 'CLEAR_HISTORY':
      return {
        ...state,
        history: { undoStack: [], redoStack: [] },
      };

    default:
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================

interface ManualDesignContextValue {
  state: ManualDesignState;
  setMode: (mode: FlowMapMode) => void;
  fetchNodes: () => Promise<void>;
  fetchEdges: () => Promise<void>;
  createNode: (input: CreateManualNodeInput) => Promise<ManualFlowMapNode | null>;
  updateNode: (id: string, input: UpdateManualNodeInput) => Promise<ManualFlowMapNode | null>;
  deleteNode: (id: string) => Promise<boolean>;
  createEdge: (input: CreateManualEdgeInput) => Promise<ManualFlowMapEdge | null>;
  updateEdge: (id: string, input: UpdateManualEdgeInput) => Promise<ManualFlowMapEdge | null>;
  deleteEdge: (id: string) => Promise<boolean>;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ManualDesignContext = createContext<ManualDesignContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

interface ManualDesignProviderProps {
  children: ReactNode;
  environmentId?: string; // If provided, scope nodes/edges to this environment
}

export function ManualDesignProvider({ children, environmentId }: ManualDesignProviderProps) {
  const [state, dispatch] = useReducer(manualDesignReducer, initialManualDesignState);

  // Determine API base path based on environment scoping
  const apiBasePath = environmentId
    ? `/api/environments/${environmentId}/map`
    : '/api/flow-map/manual';

  const setMode = useCallback((mode: FlowMapMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const fetchNodes = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${apiBasePath}/nodes`);
      if (!response.ok) throw new Error('Failed to fetch nodes');
      const nodes = await response.json();
      dispatch({ type: 'SET_NODES', payload: nodes });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [apiBasePath]);

  const fetchEdges = useCallback(async () => {
    try {
      const response = await fetch(`${apiBasePath}/edges`);
      if (!response.ok) throw new Error('Failed to fetch edges');
      const edges = await response.json();
      dispatch({ type: 'SET_EDGES', payload: edges });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, [apiBasePath]);

  const createNode = useCallback(async (input: CreateManualNodeInput): Promise<ManualFlowMapNode | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${apiBasePath}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Failed to create node');
      const node = await response.json();
      dispatch({ type: 'ADD_NODE', payload: node });
      dispatch({ type: 'PUSH_HISTORY', payload: { type: 'create_node', data: node } });
      return node;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [apiBasePath]);

  const updateNode = useCallback(async (
    id: string,
    input: UpdateManualNodeInput
  ): Promise<ManualFlowMapNode | null> => {
    const previousNode = state.nodes.find((n) => n.id === id);
    try {
      const response = await fetch(`${apiBasePath}/nodes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Failed to update node');
      const node = await response.json();
      dispatch({ type: 'UPDATE_NODE', payload: node });
      dispatch({
        type: 'PUSH_HISTORY',
        payload: { type: 'update_node', data: node, previousData: previousNode },
      });
      return node;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      return null;
    }
  }, [state.nodes, apiBasePath]);

  const deleteNode = useCallback(async (id: string): Promise<boolean> => {
    const nodeToDelete = state.nodes.find((n) => n.id === id);
    if (!nodeToDelete) return false;

    try {
      const response = await fetch(`${apiBasePath}/nodes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete node');
      dispatch({ type: 'DELETE_NODE', payload: id });
      dispatch({ type: 'PUSH_HISTORY', payload: { type: 'delete_node', data: nodeToDelete } });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      return false;
    }
  }, [state.nodes, apiBasePath]);

  const createEdge = useCallback(async (input: CreateManualEdgeInput): Promise<ManualFlowMapEdge | null> => {
    try {
      const response = await fetch(`${apiBasePath}/edges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Failed to create edge');
      const edge = await response.json();
      dispatch({ type: 'ADD_EDGE', payload: edge });
      dispatch({ type: 'PUSH_HISTORY', payload: { type: 'create_edge', data: edge } });
      return edge;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      return null;
    }
  }, [apiBasePath]);

  const updateEdge = useCallback(async (
    id: string,
    input: UpdateManualEdgeInput
  ): Promise<ManualFlowMapEdge | null> => {
    const previousEdge = state.edges.find((e) => e.id === id);
    try {
      const response = await fetch(`${apiBasePath}/edges/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Failed to update edge');
      const edge = await response.json();
      dispatch({ type: 'UPDATE_EDGE', payload: edge });
      dispatch({
        type: 'PUSH_HISTORY',
        payload: { type: 'update_edge', data: edge, previousData: previousEdge },
      });
      return edge;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      return null;
    }
  }, [state.edges, apiBasePath]);

  const deleteEdge = useCallback(async (id: string): Promise<boolean> => {
    const edgeToDelete = state.edges.find((e) => e.id === id);
    if (!edgeToDelete) return false;

    try {
      const response = await fetch(`${apiBasePath}/edges/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete edge');
      dispatch({ type: 'DELETE_EDGE', payload: id });
      dispatch({ type: 'PUSH_HISTORY', payload: { type: 'delete_edge', data: edgeToDelete } });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      return false;
    }
  }, [state.edges, apiBasePath]);

  const selectNode = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_NODE', payload: id });
  }, []);

  const selectEdge = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_EDGE', payload: id });
  }, []);

  const toggleSnapToGrid = useCallback(() => {
    dispatch({ type: 'TOGGLE_SNAP_TO_GRID' });
  }, []);

  const setGridSize = useCallback((size: number) => {
    dispatch({ type: 'SET_GRID_SIZE', payload: size });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const value: ManualDesignContextValue = {
    state,
    setMode,
    fetchNodes,
    fetchEdges,
    createNode,
    updateNode,
    deleteNode,
    createEdge,
    updateEdge,
    deleteEdge,
    selectNode,
    selectEdge,
    toggleSnapToGrid,
    setGridSize,
    undo,
    redo,
    canUndo: state.history.undoStack.length > 0,
    canRedo: state.history.redoStack.length > 0,
  };

  return (
    <ManualDesignContext.Provider value={value}>
      {children}
    </ManualDesignContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useManualDesign(): ManualDesignContextValue {
  const context = useContext(ManualDesignContext);
  if (!context) {
    throw new Error('useManualDesign must be used within a ManualDesignProvider');
  }
  return context;
}
