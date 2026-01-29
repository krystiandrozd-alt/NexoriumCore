/**
 * Export service for graph visualization
 */

import { toPng, toSvg } from 'html-to-image';

/**
 * Export a DOM element to PNG
 */
export async function exportCanvasToPNG(
  container: HTMLElement,
  options: {
    backgroundColor?: string;
    pixelRatio?: number;
  } = {}
): Promise<Blob> {
  const { backgroundColor = '#ffffff', pixelRatio = 2 } = options;

  const dataUrl = await toPng(container, {
    backgroundColor,
    pixelRatio,
    cacheBust: true,
    skipAutoScale: true,
  });

  // Convert data URL to blob
  const response = await fetch(dataUrl);
  return response.blob();
}

/**
 * Export a DOM element to SVG string
 */
export async function exportToSVG(container: HTMLElement): Promise<string> {
  const dataUrl = await toSvg(container, {
    backgroundColor: '#ffffff',
    cacheBust: true,
  });

  // Decode data URL to get SVG string
  const svgData = decodeURIComponent(dataUrl.split(',')[1] || '');
  return svgData;
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download SVG string as a file
 */
export function downloadSVG(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  downloadBlob(blob, filename);
}

/**
 * Generate a timestamp-based filename
 */
export function generateExportFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Convert base64 data URL to blob
 */
export function dataURLToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Export utilities for playground
 */
export const exportUtils = {
  png: async (container: HTMLElement, filename?: string) => {
    const blob = await exportCanvasToPNG(container);
    const name = filename || generateExportFilename('graph', 'png');
    downloadBlob(blob, name);
  },

  svg: async (container: HTMLElement, filename?: string) => {
    const svgString = await exportToSVG(container);
    const name = filename || generateExportFilename('graph', 'svg');
    downloadSVG(svgString, name);
  },
};
