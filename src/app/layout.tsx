import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Playfair_Display } from 'next/font/google';
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

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nexorium Core — Architectural Control for Non-Production Environments',
  description:
    'The architectural control layer for non-production environments. Model, govern, and align your test environments with structural precision.',
  keywords: [
    'environment governance',
    'non-production',
    'test environments',
    'architecture',
    'topology',
    'enterprise',
    'platform engineering',
  ],
  authors: [{ name: 'Nexorium Core' }],
  openGraph: {
    title: 'Nexorium Core — Architectural Control for Non-Production Environments',
    description:
      'The architectural control layer for non-production environments. Structural visibility, governance enforcement, and cross-environment awareness.',
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
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
