// TelEnvIQ - Premium Canvas Unit Tests
// Tests for the Premium Environment Graph Canvas components

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import PremiumNode from '@/components/graph/PremiumNode';
import InspectorPanel from '@/components/graph/InspectorPanel';
import PremiumToolbar from '@/components/graph/PremiumToolbar';
import type { InspectorNodeData, InspectorEdgeData } from '@/components/graph/InspectorPanel';
import type { SaveStatus, OverlayType } from '@/components/graph/PremiumToolbar';
import { GRAPH_NODES, GRAPH_EDGES } from '@tests/fixtures';
import { LARGE_GRAPH_NODES, LARGE_GRAPH_EDGES, LARGE_GRAPH_IDS } from '@tests/fixtures/large-graph-data';

// ============================================
// MOCK SETUP
// ============================================

vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    useReactFlow: () => ({
      setNodes: vi.fn(),
      fitView: vi.fn(),
      setCenter: vi.fn(),
    }),
  };
});

// ============================================
// TEST HELPERS
// ============================================

const createNodeData = (overrides = {}) => ({
  label: 'Test Node',
  displayName: 'Test Node',
  componentName: 'Test Component',
  layer: 'BSS' as const,
  capabilityType: 'CRM' as const,
  hostname: 'test-host.local',
  primaryEndpoint: { port: 8443, scheme: 'HTTPS' },
  projectVersion: '1.0.0',
  isEntry: false,
  isExit: false,
  sourceSystem: 'mock',
  ingestedAt: new Date('2026-01-10T08:00:00.000Z'),
  showVersion: false,
  showOwnership: false,
  isHighlighted: false,
  isSelected: false,
  driftStatus: null as 'added' | 'removed' | 'changed' | null,
  owner: null as string | null,
  ...overrides,
});

function renderPremiumNode(data = {}, selected = false) {
  const nodeData = createNodeData(data);
  return render(
    <ReactFlowProvider>
      <PremiumNode
        id="test-node-1"
        data={nodeData}
        selected={selected}
        type="custom5layer"
        isConnectable={true}
        positionAbsoluteX={0}
        positionAbsoluteY={0}
        zIndex={0}
      />
    </ReactFlowProvider>
  );
}

// ============================================
// PREMIUM NODE TESTS
// ============================================

describe('PremiumNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render node with display name', () => {
      renderPremiumNode({ displayName: 'CRM System' });
      expect(screen.getByText('CRM System')).toBeInTheDocument();
    });

    it('should fallback to componentName when displayName is null', () => {
      renderPremiumNode({ displayName: null, componentName: 'Amdocs CRM' });
      expect(screen.getByText('Amdocs CRM')).toBeInTheDocument();
    });

    it('should render layer badge', () => {
      renderPremiumNode({ layer: 'BSS' });
      expect(screen.getByText('BSS')).toBeInTheDocument();
    });

    it('should render capability type', () => {
      renderPremiumNode({ capabilityType: 'CRM' });
      expect(screen.getByText('CRM')).toBeInTheDocument();
    });

    it('should render hostname', () => {
      renderPremiumNode({ hostname: 'bss-app-01.sit.telco.local' });
      expect(screen.getByText('bss-app-01.sit.telco.local')).toBeInTheDocument();
    });

    it('should render endpoint with port and scheme', () => {
      renderPremiumNode({
        primaryEndpoint: { port: 8443, scheme: 'HTTPS' }
      });
      expect(screen.getByText('HTTPS:8443')).toBeInTheDocument();
    });

    it('should render version when projectVersion exists', () => {
      renderPremiumNode({ projectVersion: '21.3.1' });
      expect(screen.getByText('v21.3.1')).toBeInTheDocument();
    });
  });

  describe('entry/exit badges', () => {
    it('should render ENTRY badge when isEntry is true', () => {
      renderPremiumNode({ isEntry: true });
      expect(screen.getByText('ENTRY')).toBeInTheDocument();
    });

    it('should render EXIT badge when isExit is true', () => {
      renderPremiumNode({ isExit: true });
      expect(screen.getByText('EXIT')).toBeInTheDocument();
    });

    it('should render both badges when node is entry and exit', () => {
      renderPremiumNode({ isEntry: true, isExit: true });
      expect(screen.getByText('ENTRY')).toBeInTheDocument();
      expect(screen.getByText('EXIT')).toBeInTheDocument();
    });

    it('should not render badges when neither entry nor exit', () => {
      renderPremiumNode({ isEntry: false, isExit: false });
      expect(screen.queryByText('ENTRY')).not.toBeInTheDocument();
      expect(screen.queryByText('EXIT')).not.toBeInTheDocument();
    });
  });

  describe('drift status badges', () => {
    it('should render ADDED badge for added drift status', () => {
      renderPremiumNode({ driftStatus: 'added' });
      expect(screen.getByText('ADDED')).toBeInTheDocument();
    });

    it('should render REMOVED badge for removed drift status', () => {
      renderPremiumNode({ driftStatus: 'removed' });
      expect(screen.getByText('REMOVED')).toBeInTheDocument();
    });

    it('should render CHANGED badge for changed drift status', () => {
      renderPremiumNode({ driftStatus: 'changed' });
      expect(screen.getByText('CHANGED')).toBeInTheDocument();
    });

    it('should not render drift badge when driftStatus is null', () => {
      renderPremiumNode({ driftStatus: null });
      expect(screen.queryByText('ADDED')).not.toBeInTheDocument();
      expect(screen.queryByText('REMOVED')).not.toBeInTheDocument();
      expect(screen.queryByText('CHANGED')).not.toBeInTheDocument();
    });
  });

  describe('layer styling', () => {
    it('should apply BSS layer styling', () => {
      const { container } = renderPremiumNode({ layer: 'BSS' });
      expect(container.querySelector('.bg-blue-500\\/10')).toBeInTheDocument();
    });

    it('should apply OSS layer styling', () => {
      const { container } = renderPremiumNode({ layer: 'OSS' });
      expect(container.querySelector('.bg-amber-500\\/10')).toBeInTheDocument();
    });

    it('should apply INFRA layer styling', () => {
      const { container } = renderPremiumNode({ layer: 'INFRA' });
      expect(container.querySelector('.bg-slate-500\\/10')).toBeInTheDocument();
    });

    it('should apply EXTERNAL layer styling', () => {
      const { container } = renderPremiumNode({ layer: 'EXTERNAL' });
      expect(container.querySelector('.bg-emerald-500\\/10')).toBeInTheDocument();
    });
  });

  describe('overlay states', () => {
    it('should highlight version when showVersion is true', () => {
      const { container } = renderPremiumNode({
        projectVersion: '1.0.0',
        showVersion: true
      });
      expect(container.querySelector('.text-violet-300')).toBeInTheDocument();
    });

    it('should show ownership when showOwnership is true and owner exists', () => {
      renderPremiumNode({
        showOwnership: true,
        owner: 'BSS Team'
      });
      expect(screen.getByText('BSS Team')).toBeInTheDocument();
    });

    it('should not show ownership when showOwnership is false', () => {
      renderPremiumNode({
        showOwnership: false,
        owner: 'BSS Team'
      });
      expect(screen.queryByText('BSS Team')).not.toBeInTheDocument();
    });
  });

  describe('selection states', () => {
    it('should apply highlight class when isHighlighted is true', () => {
      const { container } = renderPremiumNode({ isHighlighted: true });
      expect(container.querySelector('.node-highlight-search')).toBeInTheDocument();
    });

    it('should apply selection class when selected prop is true', () => {
      const { container } = renderPremiumNode({}, true);
      expect(container.querySelector('.node-highlight-selected')).toBeInTheDocument();
    });
  });

  describe('data-testid selectors', () => {
    it('should have stable data-testid based on component name', () => {
      const { container } = renderPremiumNode({ componentName: 'Amdocs CRM' });
      expect(container.querySelector('[data-testid="node-amdocs-crm"]')).toBeInTheDocument();
    });

    it('should normalize component name for data-testid', () => {
      const { container } = renderPremiumNode({ componentName: 'Kong API Gateway' });
      expect(container.querySelector('[data-testid="node-kong-api-gateway"]')).toBeInTheDocument();
    });
  });
});

// ============================================
// INSPECTOR PANEL TESTS
// ============================================

describe('InspectorPanel', () => {
  const mockNodeData: InspectorNodeData = {
    id: 'test-node-1',
    label: 'Amdocs CRM (SIT)',
    displayName: 'Amdocs CRM',
    componentName: 'Amdocs CRM',
    layer: 'BSS',
    capabilityType: 'CRM',
    hostname: 'bss-app-01.sit.telco.local',
    primaryEndpoint: { port: 8443, scheme: 'HTTPS' },
    projectVersion: '21.3.1',
    isEntry: true,
    isExit: false,
    sourceSystem: 'mock',
    ingestedAt: new Date('2026-01-10T08:00:00.000Z'),
  };

  const mockEdgeData: InspectorEdgeData = {
    id: 'test-edge-1',
    sourceNodeName: 'Kong API Gateway',
    targetNodeName: 'Amdocs CRM',
    protocolType: 'REST',
    protocolDetail: 'TMF622',
    port: 443,
    confidence: 'HIGH',
    sourceSystem: 'mock',
  };

  const defaultProps = {
    isOpen: true,
    onToggle: vi.fn(),
    onClearSelection: vi.fn(),
    onEditNode: vi.fn(),
    onViewHistory: vi.fn(),
  };

  describe('visibility', () => {
    it('should be visible when isOpen is true', () => {
      render(<InspectorPanel {...defaultProps} isOpen={true} />);
      const panel = screen.getByTestId('inspector-panel');
      expect(panel).toBeInTheDocument();
    });

    it('should be collapsed when isOpen is false', () => {
      render(<InspectorPanel {...defaultProps} isOpen={false} />);
      const panel = screen.getByTestId('inspector-panel');
      // Panel should have collapsed width
      expect(panel.className).toContain('w-0');
    });
  });

  describe('node selection', () => {
    it('should display node details when selectedNode is provided', () => {
      render(<InspectorPanel {...defaultProps} selectedNode={mockNodeData} />);
      // Get all instances of Amdocs CRM (displayName and componentName)
      const matches = screen.getAllByText('Amdocs CRM');
      expect(matches.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('bss-app-01.sit.telco.local')).toBeInTheDocument();
    });

    it('should display version in node details', () => {
      render(<InspectorPanel {...defaultProps} selectedNode={mockNodeData} />);
      expect(screen.getByText('21.3.1')).toBeInTheDocument();
    });

    it('should display layer badge', () => {
      render(<InspectorPanel {...defaultProps} selectedNode={mockNodeData} />);
      expect(screen.getByText('BSS')).toBeInTheDocument();
    });

    it('should display capability type', () => {
      render(<InspectorPanel {...defaultProps} selectedNode={mockNodeData} />);
      expect(screen.getByText('CRM')).toBeInTheDocument();
    });

    it('should show ENTRY badge for entry nodes', () => {
      render(<InspectorPanel {...defaultProps} selectedNode={mockNodeData} />);
      expect(screen.getByText('ENTRY')).toBeInTheDocument();
    });
  });

  describe('edge selection', () => {
    it('should display edge details when selectedEdge is provided', () => {
      render(<InspectorPanel {...defaultProps} selectedEdge={mockEdgeData} />);
      const panel = screen.getByTestId('inspector-panel');
      expect(within(panel).getByText('Kong API Gateway')).toBeInTheDocument();
      expect(within(panel).getByText('Amdocs CRM')).toBeInTheDocument();
    });

    it('should display protocol information', () => {
      render(<InspectorPanel {...defaultProps} selectedEdge={mockEdgeData} />);
      const panel = screen.getByTestId('inspector-panel');
      expect(within(panel).getByText('REST')).toBeInTheDocument();
      expect(within(panel).getByText('TMF622')).toBeInTheDocument();
    });

    it('should display confidence level', () => {
      render(<InspectorPanel {...defaultProps} selectedEdge={mockEdgeData} />);
      const panel = screen.getByTestId('inspector-panel');
      expect(within(panel).getByText('HIGH')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty state message when nothing selected', () => {
      render(<InspectorPanel {...defaultProps} />);
      expect(screen.getByText(/Select a node or edge/i)).toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('should call onClearSelection when close button is clicked', () => {
      const onClearSelection = vi.fn();
      render(
        <InspectorPanel
          {...defaultProps}
          selectedNode={mockNodeData}
          onClearSelection={onClearSelection}
        />
      );

      const closeButton = screen.getByTestId('inspector-close');
      fireEvent.click(closeButton);
      expect(onClearSelection).toHaveBeenCalled();
    });

    it('should call onToggle when toggle button is clicked (when collapsed)', () => {
      const onToggle = vi.fn();
      render(<InspectorPanel {...defaultProps} isOpen={false} onToggle={onToggle} />);

      const toggleButton = screen.getByTestId('inspector-toggle');
      fireEvent.click(toggleButton);
      expect(onToggle).toHaveBeenCalled();
    });
  });
});

// ============================================
// PREMIUM TOOLBAR TESTS
// ============================================

describe('PremiumToolbar', () => {
  const mockSnapshots = [
    { id: 'snap-1', label: 'v1', createdAt: '2026-01-10' },
    { id: 'snap-2', label: 'v2', createdAt: '2026-01-15' },
  ];

  const defaultProps = {
    environmentName: 'SIT Environment',
    environmentType: 'SIT',
    viewMode: 'graph' as const,
    onViewModeChange: vi.fn(),
    snapshots: mockSnapshots,
    currentSnapshotId: 'snap-2',
    compareSnapshotId: null as string | null,
    onSnapshotSelect: vi.fn(),
    onCompareSelect: vi.fn(),
    activeOverlays: new Set<OverlayType>(),
    onOverlayToggle: vi.fn(),
    onSearch: vi.fn(() => []),
    onSearchSelect: vi.fn(),
    saveStatus: 'saved' as SaveStatus,
    autosaveEnabled: true,
    onAutosaveToggle: vi.fn(),
    onManualSave: vi.fn(),
    onFitView: vi.fn(),
    onAutoArrange: vi.fn(),
    nodeCount: 12,
    edgeCount: 15,
  };

  describe('rendering', () => {
    it('should render toolbar with data-testid', () => {
      render(<PremiumToolbar {...defaultProps} />);
      expect(screen.getByTestId('env-toolbar')).toBeInTheDocument();
    });

    it('should display environment name', () => {
      render(<PremiumToolbar {...defaultProps} environmentName="Production" />);
      expect(screen.getByText('Production')).toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('should render search input with data-testid', () => {
      render(<PremiumToolbar {...defaultProps} />);
      expect(screen.getByTestId('node-search')).toBeInTheDocument();
    });

    it('should call onSearch when typing', () => {
      const onSearch = vi.fn(() => []);
      render(<PremiumToolbar {...defaultProps} onSearch={onSearch} />);

      const searchInput = screen.getByTestId('node-search');
      fireEvent.change(searchInput, { target: { value: 'CRM' } });
      // onSearch is called on useEffect when query length >= 2
      expect(onSearch).toHaveBeenCalled();
    });

    it('should show keyboard shortcut placeholder hint', () => {
      render(<PremiumToolbar {...defaultProps} />);
      const searchInput = screen.getByTestId('node-search');
      expect(searchInput.getAttribute('placeholder')).toContain('/');
    });
  });

  describe('snapshot selector', () => {
    it('should render snapshot selector with data-testid', () => {
      render(<PremiumToolbar {...defaultProps} />);
      expect(screen.getByTestId('snapshot-selector')).toBeInTheDocument();
    });

    it('should display current snapshot label', () => {
      render(<PremiumToolbar {...defaultProps} currentSnapshotId="snap-2" />);
      expect(screen.getByText('v2')).toBeInTheDocument();
    });

    it('should display Live when no snapshot selected', () => {
      render(<PremiumToolbar {...defaultProps} currentSnapshotId={null} />);
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  describe('overlays', () => {
    it('should render drift overlay toggle in dropdown', async () => {
      render(<PremiumToolbar {...defaultProps} />);
      // Open the overlay dropdown first
      const overlayButton = screen.getByText('Overlays');
      fireEvent.click(overlayButton);
      expect(screen.getByTestId('overlay-toggle-drift')).toBeInTheDocument();
    });

    it('should render layers overlay toggle in dropdown', async () => {
      render(<PremiumToolbar {...defaultProps} />);
      const overlayButton = screen.getByText('Overlays');
      fireEvent.click(overlayButton);
      expect(screen.getByTestId('overlay-toggle-layers')).toBeInTheDocument();
    });

    it('should render versions overlay toggle in dropdown', async () => {
      render(<PremiumToolbar {...defaultProps} />);
      const overlayButton = screen.getByText('Overlays');
      fireEvent.click(overlayButton);
      expect(screen.getByTestId('overlay-toggle-versions')).toBeInTheDocument();
    });

    it('should call onOverlayToggle when overlay is clicked', async () => {
      const onOverlayToggle = vi.fn();
      render(<PremiumToolbar {...defaultProps} onOverlayToggle={onOverlayToggle} />);

      const overlayButton = screen.getByText('Overlays');
      fireEvent.click(overlayButton);
      const driftToggle = screen.getByTestId('overlay-toggle-drift');
      fireEvent.click(driftToggle);
      expect(onOverlayToggle).toHaveBeenCalledWith('drift');
    });

    it('should show active state for enabled overlays', async () => {
      const activeOverlays = new Set<OverlayType>(['layers']);
      render(<PremiumToolbar {...defaultProps} activeOverlays={activeOverlays} />);

      const overlayButton = screen.getByText('Overlays');
      fireEvent.click(overlayButton);
      const layersToggle = screen.getByTestId('overlay-toggle-layers');
      expect(layersToggle.className).toContain('bg-violet');
    });
  });

  describe('layout controls', () => {
    it('should render autosave toggle with data-testid', () => {
      render(<PremiumToolbar {...defaultProps} />);
      expect(screen.getByTestId('autosave-toggle')).toBeInTheDocument();
    });

    it('should render auto-arrange button with data-testid', () => {
      render(<PremiumToolbar {...defaultProps} />);
      expect(screen.getByTestId('auto-arrange-btn')).toBeInTheDocument();
    });

    it('should render save layout button with data-testid', () => {
      render(<PremiumToolbar {...defaultProps} />);
      expect(screen.getByTestId('save-layout-btn')).toBeInTheDocument();
    });

    it('should call onAutoArrange when button is clicked', () => {
      const onAutoArrange = vi.fn();
      render(<PremiumToolbar {...defaultProps} onAutoArrange={onAutoArrange} />);

      const button = screen.getByTestId('auto-arrange-btn');
      fireEvent.click(button);
      expect(onAutoArrange).toHaveBeenCalled();
    });

    it('should call onManualSave when button is clicked', () => {
      const onManualSave = vi.fn();
      render(<PremiumToolbar {...defaultProps} onManualSave={onManualSave} />);

      const button = screen.getByTestId('save-layout-btn');
      fireEvent.click(button);
      expect(onManualSave).toHaveBeenCalled();
    });

    it('should show correct save status indicator', () => {
      const { rerender } = render(<PremiumToolbar {...defaultProps} saveStatus="saved" />);
      expect(screen.getByTestId('save-status')).toHaveTextContent(/saved/i);

      rerender(<PremiumToolbar {...defaultProps} saveStatus="saving" />);
      expect(screen.getByTestId('save-status')).toHaveTextContent(/saving/i);

      rerender(<PremiumToolbar {...defaultProps} saveStatus="idle" />);
      expect(screen.getByTestId('save-status')).toHaveTextContent(/unsaved/i);
    });
  });
});

// ============================================
// GRAPH DATA DERIVATION TESTS
// ============================================

describe('Graph Data Derivation', () => {
  describe('standard fixture nodes', () => {
    it('should have all required fields on nodes', () => {
      GRAPH_NODES.forEach((node) => {
        expect(node.id).toBeDefined();
        expect(node.type).toBe('custom5layer');
        expect(node.position).toBeDefined();
        expect(node.data.label).toBeDefined();
        expect(node.data.componentName).toBeDefined();
        expect(node.data.layer).toBeDefined();
        expect(node.data.capabilityType).toBeDefined();
      });
    });

    it('should have projectVersion on nodes', () => {
      const nodesWithVersion = GRAPH_NODES.filter((n) => n.data.projectVersion);
      expect(nodesWithVersion.length).toBeGreaterThan(0);

      nodesWithVersion.forEach((node) => {
        expect(typeof node.data.projectVersion).toBe('string');
      });
    });

    it('should have valid layer values', () => {
      const validLayers = ['BSS', 'OSS', 'INFRA', 'EXTERNAL', 'UNKNOWN'];
      GRAPH_NODES.forEach((node) => {
        expect(validLayers).toContain(node.data.layer);
      });
    });
  });

  describe('standard fixture edges', () => {
    it('should have all required fields on edges', () => {
      GRAPH_EDGES.forEach((edge) => {
        expect(edge.id).toBeDefined();
        expect(edge.source).toBeDefined();
        expect(edge.target).toBeDefined();
        expect(edge.type).toBe('custom5layer');
        expect(edge.data?.protocolType).toBeDefined();
        expect(edge.data?.confidence).toBeDefined();
      });
    });

    it('should reference valid node IDs', () => {
      const nodeIds = new Set(GRAPH_NODES.map((n) => n.id));
      GRAPH_EDGES.forEach((edge) => {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      });
    });
  });
});

// ============================================
// LARGE GRAPH (30-NODE) PERFORMANCE TESTS
// ============================================

describe('Large Graph Data (30 nodes)', () => {
  it('should have exactly 30 nodes', () => {
    expect(LARGE_GRAPH_NODES.length).toBe(30);
  });

  it('should have reasonable number of edges (>40)', () => {
    expect(LARGE_GRAPH_EDGES.length).toBeGreaterThan(40);
  });

  it('should have nodes distributed across all layers', () => {
    const layers = new Set(LARGE_GRAPH_NODES.map((n) => n.data.layer));
    expect(layers.has('BSS')).toBe(true);
    expect(layers.has('OSS')).toBe(true);
    expect(layers.has('INFRA')).toBe(true);
    expect(layers.has('EXTERNAL')).toBe(true);
  });

  it('should have BSS layer with most nodes (~10)', () => {
    const bssNodes = LARGE_GRAPH_NODES.filter((n) => n.data.layer === 'BSS');
    expect(bssNodes.length).toBe(10);
  });

  it('should have all nodes with projectVersion', () => {
    LARGE_GRAPH_NODES.forEach((node) => {
      expect(node.data.projectVersion).toBeDefined();
    });
  });

  it('should have all nodes with owner for ownership overlay', () => {
    LARGE_GRAPH_NODES.forEach((node) => {
      expect(node.data.owner).toBeDefined();
    });
  });

  it('should have valid source/target references in edges', () => {
    const nodeIds = new Set(LARGE_GRAPH_NODES.map((n) => n.id));
    LARGE_GRAPH_EDGES.forEach((edge) => {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    });
  });

  it('should have entry and exit candidates', () => {
    const entryNodes = LARGE_GRAPH_NODES.filter((n) => n.data.isEntry);
    const exitNodes = LARGE_GRAPH_NODES.filter((n) => n.data.isExit);

    expect(entryNodes.length).toBeGreaterThan(0);
    expect(exitNodes.length).toBeGreaterThan(0);
  });

  it('should have unique node IDs', () => {
    const ids = LARGE_GRAPH_NODES.map((n) => n.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have unique edge IDs', () => {
    const ids = LARGE_GRAPH_EDGES.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ============================================
// UI SELECTOR STABILITY TESTS
// ============================================

describe('UI Selector Stability', () => {
  const requiredTestIds = [
    'env-toolbar',
    'node-search',
    'snapshot-selector',
    'overlay-toggle-drift',
    'overlay-toggle-layers',
    'overlay-toggle-versions',
    'autosave-toggle',
    'auto-arrange-btn',
    'save-layout-btn',
    'inspector-panel',
    'inspector-toggle',
    'inspector-close',
    'save-status',
  ];

  it('should have all required data-testid selectors documented', () => {
    // This test documents the expected selectors for E2E testing
    requiredTestIds.forEach((id) => {
      expect(id).toMatch(/^[a-z-]+$/);
    });
  });

  it('should use consistent naming convention for data-testid', () => {
    // All testIds should be kebab-case
    requiredTestIds.forEach((id) => {
      expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/);
    });
  });
});

// ============================================
// OVERLAY FUNCTIONALITY TESTS
// ============================================

describe('Overlay Functionality', () => {
  describe('drift overlay', () => {
    it('should show drift badges when driftStatus is set', () => {
      renderPremiumNode({ driftStatus: 'added' });
      expect(screen.getByText('ADDED')).toBeInTheDocument();
    });

    it('should apply visual styling for removed nodes', () => {
      const { container } = renderPremiumNode({ driftStatus: 'removed' });
      expect(container.querySelector('.opacity-50')).toBeInTheDocument();
    });
  });

  describe('versions overlay', () => {
    it('should highlight version when overlay is active', () => {
      const { container } = renderPremiumNode({
        projectVersion: '1.0.0',
        showVersion: true
      });
      expect(container.querySelector('.text-violet-300')).toBeInTheDocument();
    });

    it('should dim version when overlay is inactive', () => {
      const { container } = renderPremiumNode({
        projectVersion: '1.0.0',
        showVersion: false
      });
      expect(container.querySelector('.text-slate-500')).toBeInTheDocument();
    });
  });

  describe('ownership overlay', () => {
    it('should show owner when overlay is active', () => {
      renderPremiumNode({
        showOwnership: true,
        owner: 'Platform Team'
      });
      expect(screen.getByText('Platform Team')).toBeInTheDocument();
    });

    it('should hide owner when overlay is inactive', () => {
      renderPremiumNode({
        showOwnership: false,
        owner: 'Platform Team'
      });
      expect(screen.queryByText('Platform Team')).not.toBeInTheDocument();
    });
  });
});
