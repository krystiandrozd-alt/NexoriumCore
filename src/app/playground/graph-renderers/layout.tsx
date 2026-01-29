/**
 * Graph Renderer Playground Layout
 *
 * Minimal layout without dashboard chrome for focused experimentation.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Graph Renderer Playground | Nexorium Core',
  description: 'Compare graph rendering libraries: Cytoscape.js vs AntV G6',
};

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
