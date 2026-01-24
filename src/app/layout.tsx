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
  title: 'TelEnv IQ - Non-Production Environment Visibility & Governance',
  description:
    'End-to-end visibility and governance for non-production environments. From infrastructure to data, with governance embedded directly into the landscape.',
  keywords: [
    'environment visibility',
    'non-production',
    'governance',
    'test environments',
    'infrastructure',
    'DevOps',
    'platform engineering',
  ],
  authors: [{ name: 'TelEnv IQ' }],
  openGraph: {
    title: 'TelEnv IQ - Non-Production Environment Visibility & Governance',
    description:
      'End-to-end visibility across development, test, and staging systems with governance embedded directly into the environment landscape.',
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
