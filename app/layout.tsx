import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const plex = IBM_Plex_Mono({ subsets: ['latin'], weight: '300' });

export const metadata: Metadata = {
  title: 'Day Trip',
  description: 'QRLG',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${plex.className} h-full`}>{children}</body>
    </html>
  );
}
