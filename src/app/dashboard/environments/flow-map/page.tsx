'use client';

// Nexorium Core - Flow Map Page (yFiles Implementation)
// Pipeline view (L0) with drill-down to Environment detail (L1)
// This is the canonical Flow Map route for Nexorium Core

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled - yFiles must run client-side only
const FlowMapYFilesClient = dynamic(
  () => import('@/app/flow-map-yfiles/FlowMapYFilesClient'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[calc(100vh-8rem)] w-full bg-slate-950 flex items-center justify-center rounded-lg">
        <div className="text-slate-400 flex items-center gap-3">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading Flow Map...</span>
        </div>
      </div>
    ),
  }
);

export default function FlowMapPage() {
  return (
    <div className="-mx-4 lg:-mx-8 -mb-4 lg:-mb-8 h-[calc(100vh-8rem)]">
      <FlowMapYFilesClient />
    </div>
  );
}
