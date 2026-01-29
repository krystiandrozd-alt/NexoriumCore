// Nexorium Core - Export Utilities
// PNG, SVG, and JSON export for Flow Map

import type { Node, Edge } from '@xyflow/react';

// ============================================
// EXPORT TYPES
// ============================================

export type ExportFormat = 'png' | 'svg' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  backgroundColor?: string;
  padding?: number;
  quality?: number;
  includeMetadata?: boolean;
}

export const defaultExportOptions: ExportOptions = {
  format: 'png',
  backgroundColor: '#0f172a', // slate-900
  padding: 20,
  quality: 1,
  includeMetadata: true,
};

// ============================================
// JSON EXPORT
// ============================================

export interface ExportedTopology {
  version: '1.0';
  exportedAt: string;
  nodes: ExportedNode[];
  edges: ExportedEdge[];
  metadata?: Record<string, unknown>;
}

export interface ExportedNode {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface ExportedEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: Record<string, unknown>;
}

export function exportToJSON(
  nodes: Node[],
  edges: Edge[],
  options: Partial<ExportOptions> = {}
): string {
  const topology: ExportedTopology = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    nodes: nodes.map((node) => ({
      id: node.id,
      name: (node.data as { name?: string })?.name || node.id,
      type: node.type || 'unknown',
      position: node.position,
      data: options.includeMetadata !== false ? (node.data as Record<string, unknown>) : {},
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      data: options.includeMetadata !== false ? (edge.data as Record<string, unknown>) : undefined,
    })),
  };

  return JSON.stringify(topology, null, 2);
}

// ============================================
// SVG EXPORT
// ============================================

export function exportToSVG(
  svgElement: SVGSVGElement | null,
  options: Partial<ExportOptions> = {}
): string | null {
  if (!svgElement) return null;

  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  const opts = { ...defaultExportOptions, ...options };

  // Get bounds
  const bbox = svgElement.getBBox();
  const width = bbox.width + opts.padding! * 2;
  const height = bbox.height + opts.padding! * 2;

  // Set viewBox
  clone.setAttribute('viewBox', `${bbox.x - opts.padding!} ${bbox.y - opts.padding!} ${width} ${height}`);
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  // Add background
  if (opts.backgroundColor) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(bbox.x - opts.padding!));
    rect.setAttribute('y', String(bbox.y - opts.padding!));
    rect.setAttribute('width', String(width));
    rect.setAttribute('height', String(height));
    rect.setAttribute('fill', opts.backgroundColor);
    clone.insertBefore(rect, clone.firstChild);
  }

  // Serialize
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);

  return svgString;
}

// ============================================
// PNG EXPORT
// ============================================

export async function exportToPNG(
  svgElement: SVGSVGElement | null,
  options: Partial<ExportOptions> = {}
): Promise<Blob | null> {
  if (!svgElement) return null;

  const svgString = exportToSVG(svgElement, options);
  if (!svgString) return null;

  const opts = { ...defaultExportOptions, ...options };

  return new Promise((resolve) => {
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      // Set canvas size with quality multiplier
      const scale = opts.quality!;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Draw
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      // Convert to blob
      canvas.toBlob(
        (pngBlob) => {
          URL.revokeObjectURL(url);
          resolve(pngBlob);
        },
        'image/png',
        1
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

// ============================================
// DOWNLOAD HELPERS
// ============================================

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadString(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

export async function exportAndDownload(
  format: ExportFormat,
  nodes: Node[],
  edges: Edge[],
  svgElement: SVGSVGElement | null,
  baseFilename: string = 'flow-map',
  options: Partial<ExportOptions> = {}
): Promise<boolean> {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${baseFilename}-${timestamp}`;

  try {
    switch (format) {
      case 'json': {
        const json = exportToJSON(nodes, edges, options);
        downloadString(json, `${filename}.json`, 'application/json');
        return true;
      }

      case 'svg': {
        const svg = exportToSVG(svgElement, options);
        if (!svg) return false;
        downloadString(svg, `${filename}.svg`, 'image/svg+xml');
        return true;
      }

      case 'png': {
        const png = await exportToPNG(svgElement, options);
        if (!png) return false;
        downloadBlob(png, `${filename}.png`);
        return true;
      }

      default:
        return false;
    }
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
}
