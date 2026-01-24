import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'TelEnvIQ - Test Environment Intelligence Platform',
  description:
    'Auto-discover, map, and monitor your test environments and their test data lifecycle. Purpose-built for telco OSS/BSS integration landscapes.',
  keywords: [
    'test environment',
    'telco',
    'OSS/BSS',
    'topology',
    'test data',
    'auto-discovery',
    'integration testing',
  ],
  authors: [{ name: 'TelEnvIQ' }],
  openGraph: {
    title: 'TelEnvIQ - Test Environment Intelligence Platform',
    description:
      'See your telco test environments clearly. Auto-discover, map, and monitor topology and test data lifecycle.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
