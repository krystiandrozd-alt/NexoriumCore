'use client';

import dynamic from 'next/dynamic';

const YFilesLabClient = dynamic(() => import('./YFilesLabClient'), { ssr: false });

export default function YFilesLabPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <YFilesLabClient />
    </div>
  );
}
